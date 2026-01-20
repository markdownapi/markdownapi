/**
 * MAPI Convert Skill Handler
 *
 * Executable handler for the mapi-convert skill.
 * Called by skill runners/agents to perform conversions.
 *
 * Usage:
 *   npx ts-node handler.ts <capability> [options]
 *
 * Capabilities:
 *   convert.from-openapi  - Convert OpenAPI to Skill format
 *   convert.from-mapi     - Convert MAPI to Skill format
 *
 * Input is read from stdin as JSON:
 *   { "content": "...", "apiName": "optional", "generateIntents": false }
 *
 * Output is written to stdout as JSON:
 *   { "skillMd": "...", "common": {...}, "capabilities": {...} }
 */

import {
  convertMapiToSkill,
  convertOpenApiToSkill,
  SkillOutput,
  IntentGenerator,
} from '../../lib/mapi-converter/dist/index.js';

interface HandlerInput {
  content: string;
  apiName?: string;
  generateIntents?: boolean;
}

interface HandlerOutput {
  success: boolean;
  result?: SkillOutput;
  error?: string;
}

/**
 * Read all stdin as a string
 */
async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * Create an intent generator that uses Claude API
 */
function createLLMIntentGenerator(): IntentGenerator {
  return {
    async generate(capabilityId: string, description: string): Promise<string[]> {
      // Check for API key
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        // Fall back to simple extraction if no API key
        console.error('Warning: ANTHROPIC_API_KEY not set, using simple intent extraction');
        return extractSimpleIntents(capabilityId, description);
      }

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 200,
            messages: [
              {
                role: 'user',
                content: `Given this API capability:
- ID: ${capabilityId}
- Description: ${description}

Generate 5-8 intent keywords or short phrases a user might say when they want to use this capability. Include synonyms and task descriptions. Focus on action words and common variations.

Output ONLY a comma-separated list, nothing else. Example format:
create user, add user, register account, new user, sign up`,
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json() as { content: Array<{ text: string }> };
        const text = data.content[0]?.text || '';
        return text.split(',').map((s: string) => s.trim()).filter(Boolean);
      } catch (error) {
        console.error('Warning: LLM intent generation failed, using simple extraction');
        return extractSimpleIntents(capabilityId, description);
      }
    },
  };
}

/**
 * Simple intent extraction fallback
 */
function extractSimpleIntents(capabilityId: string, description: string): string[] {
  const keywords: string[] = [];
  const idParts = capabilityId.split('.');
  keywords.push(...idParts);

  const actionVerbs = [
    'create', 'get', 'list', 'update', 'delete', 'remove', 'add', 'fetch',
    'retrieve', 'search', 'find', 'send', 'post', 'upload', 'download',
  ];

  const lower = description.toLowerCase();
  for (const verb of actionVerbs) {
    if (lower.includes(verb)) {
      keywords.push(verb);
    }
  }

  return [...new Set(keywords)];
}

/**
 * Main handler
 */
async function main(): Promise<void> {
  const capability = process.argv[2];

  if (!capability) {
    const output: HandlerOutput = {
      success: false,
      error: 'Usage: handler.ts <capability>\nCapabilities: convert.from-openapi, convert.from-mapi',
    };
    console.log(JSON.stringify(output));
    process.exit(1);
  }

  try {
    // Read input from stdin
    const inputJson = await readStdin();
    const input: HandlerInput = JSON.parse(inputJson);

    if (!input.content) {
      throw new Error('Missing required field: content');
    }

    // Set up options
    const options = {
      apiName: input.apiName,
      intentGenerator: input.generateIntents ? createLLMIntentGenerator() : undefined,
    };

    // Execute the appropriate conversion
    let result: SkillOutput;

    switch (capability) {
      case 'convert.from-openapi':
        result = await convertOpenApiToSkill(input.content, options);
        break;

      case 'convert.from-mapi':
        result = await convertMapiToSkill(input.content, options);
        break;

      default:
        throw new Error(`Unknown capability: ${capability}`);
    }

    const output: HandlerOutput = {
      success: true,
      result,
    };

    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    const output: HandlerOutput = {
      success: false,
      error: (error as Error).message,
    };
    console.log(JSON.stringify(output));
    process.exit(1);
  }
}

main();
