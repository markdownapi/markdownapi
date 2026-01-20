/**
 * Evaluator - uses LLM to semantically compare responses
 *
 * IMPORTANT: This evaluator uses semantic comparison, not string matching.
 * - OpenAPI paths like "/v1/messages" and MAPI capabilities like "messages.create"
 *   can both be correct if they refer to the same API functionality.
 * - A fast LLM (Haiku) judges whether the response is semantically correct.
 */

import { TestCase, TestResult, LLMResponse } from './types.js';
import { callClaude } from './llm/anthropic.js';

/**
 * Attempt to extract a capability/endpoint from the LLM's raw output.
 *
 * We try to be flexible in parsing (JSON, plain text, paths, etc.)
 * Returns the extracted value or null if we can't parse it.
 */
function extractCapability(rawOutput: string): { capability: string | null; error: string | null } {
  const trimmed = rawOutput.trim();

  // Try 1: Parse as JSON object with "capability" field
  try {
    // Handle markdown code blocks
    let jsonStr = trimmed;
    const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);
    if (typeof parsed === 'object' && parsed !== null && 'capability' in parsed) {
      const cap = parsed.capability;
      if (typeof cap === 'string' && cap.length > 0) {
        return { capability: cap, error: null };
      }
    }
  } catch {
    // JSON parse failed, continue to other methods
  }

  // Try 2: Look for a capability pattern in the text (e.g., "capability: foo.bar")
  const capMatch = trimmed.match(/capability["\s:]+([a-zA-Z0-9_./\-]+)/i);
  if (capMatch) {
    return { capability: capMatch[1], error: null };
  }

  // Try 3: If the entire response looks like a capability ID or path (single identifier)
  if (/^[a-zA-Z0-9_./\-]+$/.test(trimmed) && trimmed.length < 100) {
    return { capability: trimmed, error: null };
  }

  // Try 4: Extract any path-like string (for OpenAPI responses)
  const pathMatch = trimmed.match(/\/[a-zA-Z0-9_./\-{}]+/);
  if (pathMatch) {
    return { capability: pathMatch[0], error: null };
  }

  // Failed to extract
  return {
    capability: null,
    error: `Could not extract capability from output: ${trimmed.slice(0, 200)}${trimmed.length > 200 ? '...' : ''}`
  };
}

/**
 * Use an LLM to judge if two capability identifiers refer to the same API functionality.
 *
 * This allows fair comparison between different naming conventions:
 * - OpenAPI: "/v1/messages", "POST /messages"
 * - MAPI: "messages.create", "messages.create_stream"
 */
async function judgeWithLLM(
  prose: string,
  expected: string,
  actual: string
): Promise<boolean> {
  const systemPrompt = `You are an API evaluation judge. Your task is to determine if two API capability identifiers refer to the same functionality.

The identifiers may use different naming conventions:
- OpenAPI style: "/v1/messages", "POST /v1/complete", "/messages/{id}"
- MAPI style: "messages.create", "messages.create_stream", "users.get"

Consider them equivalent if they would handle the same user request, even if the names differ.

Respond with ONLY "yes" or "no". No explanation.`;

  const userPrompt = `User request: "${prose}"

Expected capability: ${expected}
Actual response: ${actual}

Do these refer to the same API functionality that would handle this user request?`;

  try {
    const response = await callClaude('haiku', systemPrompt, userPrompt);
    const answer = response.content.trim().toLowerCase();
    return answer === 'yes' || answer.startsWith('yes');
  } catch {
    // If LLM call fails, fall back to string comparison
    return expected.toLowerCase() === actual.toLowerCase();
  }
}

/**
 * Evaluate a single test case against the LLM response using semantic comparison.
 *
 * Returns a TestResult with all details, including failures.
 */
export async function evaluate(
  testCase: TestCase,
  llmResponse: LLMResponse
): Promise<TestResult> {
  const { capability, error } = extractCapability(llmResponse.content);

  let correct = false;

  if (capability !== null && error === null) {
    // First try exact match (case-insensitive)
    const normalizedExpected = testCase.expected_capability.toLowerCase().trim();
    const normalizedSelected = capability.toLowerCase().trim();

    if (normalizedSelected === normalizedExpected) {
      correct = true;
    } else {
      // Use LLM to judge semantic equivalence
      correct = await judgeWithLLM(testCase.prose, testCase.expected_capability, capability);
    }
  }

  return {
    test_id: testCase.id,
    prose: testCase.prose,
    expected_capability: testCase.expected_capability,
    selected_capability: capability,
    correct,
    parse_error: error,
    raw_output: llmResponse.content,
    latency_ms: llmResponse.latency_ms,
    input_tokens: llmResponse.input_tokens,
    output_tokens: llmResponse.output_tokens,
  };
}

/**
 * Generate summary statistics for a test run.
 */
export function summarize(results: TestResult[]) {
  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  const incorrect = results.filter(r => !r.correct && r.parse_error === null).length;
  const parse_errors = results.filter(r => r.parse_error !== null).length;

  const totalLatency = results.reduce((sum, r) => sum + r.latency_ms, 0);
  const totalInputTokens = results.reduce((sum, r) => sum + r.input_tokens, 0);
  const totalOutputTokens = results.reduce((sum, r) => sum + r.output_tokens, 0);

  return {
    total,
    correct,
    incorrect,
    parse_errors,
    accuracy: total > 0 ? correct / total : 0,
    avg_latency_ms: total > 0 ? totalLatency / total : 0,
    total_input_tokens: totalInputTokens,
    total_output_tokens: totalOutputTokens,
  };
}
