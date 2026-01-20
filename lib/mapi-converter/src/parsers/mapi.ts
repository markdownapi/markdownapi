/**
 * MAPI Parser
 *
 * Parses a .mapi.md file into a structured representation.
 */

import {
  ParsedMapiDocument,
  ParsedCapability,
  MapiDocumentMeta,
  MapiCapabilityMeta,
} from '../types.js';

/**
 * Parse a MAPI document string into structured data
 */
export function parseMapiDocument(content: string): ParsedMapiDocument {
  const lines = content.split('\n');

  // Extract title (first H1)
  const title = extractTitle(lines);

  // Extract description (text after title, before first meta block or section)
  const description = extractDescription(content);

  // Extract document-level metadata
  const meta = extractDocumentMeta(content);

  // Extract global types
  const globalTypes = extractGlobalTypes(content);

  // Extract capabilities
  const capabilities = extractCapabilities(content);

  return {
    title,
    description,
    meta,
    globalTypes,
    capabilities,
  };
}

/**
 * Extract the document title (first H1 heading)
 */
function extractTitle(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)$/);
    if (match) {
      return match[1].trim();
    }
  }
  return 'Untitled API';
}

/**
 * Extract description text after title, before meta block
 */
function extractDescription(content: string): string | undefined {
  // Find content between first H1 and first ~~~meta or ## heading
  const match = content.match(/^#\s+.+\n\n([\s\S]*?)(?=\n~~~meta|\n##\s)/m);
  if (match && match[1].trim()) {
    return match[1].trim();
  }
  return undefined;
}

/**
 * Extract document-level metadata (first ~~~meta block not inside a capability)
 */
function extractDocumentMeta(content: string): MapiDocumentMeta {
  // Find the first ~~~meta block that appears before any ## Capability:
  const capabilityStart = content.search(/^##\s+(Capability|Channel|Webhook|Tool):/m);
  const searchContent = capabilityStart > -1 ? content.slice(0, capabilityStart) : content;

  const metaMatch = searchContent.match(/~~~meta\n([\s\S]*?)\n~~~/);
  if (!metaMatch) {
    return {};
  }

  return parseYamlLike(metaMatch[1]);
}

/**
 * Extract global types section
 */
function extractGlobalTypes(content: string): string | undefined {
  // Find ## Global Types section
  const match = content.match(/^##\s+Global Types\s*\n([\s\S]*?)(?=\n##\s|$)/m);
  if (!match) {
    return undefined;
  }

  // Extract typescript code blocks from this section
  const section = match[1];
  const codeBlocks: string[] = [];
  const codeBlockRegex = /```typescript\n([\s\S]*?)```/g;
  let codeMatch;

  while ((codeMatch = codeBlockRegex.exec(section)) !== null) {
    codeBlocks.push(codeMatch[1].trim());
  }

  return codeBlocks.length > 0 ? codeBlocks.join('\n\n') : undefined;
}

/**
 * Extract all capabilities from the document
 */
function extractCapabilities(content: string): ParsedCapability[] {
  const capabilities: ParsedCapability[] = [];

  // Match capability headers: ## Capability: Name, ## Channel: Name, ## Webhook: Name, ## Tool: Name
  const capabilityRegex = /^##\s+(Capability|Channel|Webhook|Tool):\s*(.+)$/gm;
  const matches: { type: string; name: string; index: number }[] = [];

  let match;
  while ((match = capabilityRegex.exec(content)) !== null) {
    matches.push({
      type: match[1],
      name: match[2].trim(),
      index: match.index,
    });
  }

  // Extract content for each capability
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i < matches.length - 1 ? matches[i + 1].index : content.length;
    const capabilityContent = content.slice(start, end);

    const capability = parseCapability(matches[i].name, capabilityContent);
    if (capability) {
      capabilities.push(capability);
    }
  }

  return capabilities;
}

/**
 * Parse a single capability section
 */
function parseCapability(name: string, content: string): ParsedCapability | null {
  // Extract capability-level metadata
  const metaMatch = content.match(/~~~meta\n([\s\S]*?)\n~~~/);
  if (!metaMatch) {
    return null;
  }

  const meta = parseYamlLike(metaMatch[1]) as MapiCapabilityMeta;
  if (!meta.id || !meta.transport) {
    return null;
  }

  return {
    name,
    meta,
    intention: extractSection(content, 'Intention'),
    authIntention: extractSection(content, 'Auth Intention'),
    logicConstraints: extractSection(content, 'Logic Constraints'),
    input: extractCodeSection(content, 'Input'),
    output: extractCodeSection(content, 'Output'),
    errors: extractSection(content, 'Errors'),
    example: extractSection(content, 'Example'),
    rawContent: content,
  };
}

/**
 * Extract a text section (### Heading followed by content)
 */
function extractSection(content: string, heading: string): string | undefined {
  const regex = new RegExp(`^###\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n###\\s|\\n##\\s|$)`, 'm');
  const match = content.match(regex);
  if (!match) {
    return undefined;
  }

  // Remove code blocks for plain text sections
  let text = match[1].trim();

  // For sections like Errors that might have bullet points, keep as-is
  return text || undefined;
}

/**
 * Extract a code section (### Heading followed by typescript code block)
 */
function extractCodeSection(content: string, heading: string): string | undefined {
  const regex = new RegExp(`^###\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n###\\s|\\n##\\s|$)`, 'm');
  const match = content.match(regex);
  if (!match) {
    return undefined;
  }

  // Extract typescript code block
  const codeMatch = match[1].match(/```typescript\n([\s\S]*?)```/);
  if (codeMatch) {
    return codeMatch[1].trim();
  }

  return undefined;
}

/**
 * Parse YAML-like content from meta blocks
 * (Simple parser - handles key: value pairs)
 */
function parseYamlLike(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value: unknown = trimmed.slice(colonIndex + 1).trim();

    // Handle boolean
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    // Handle arrays (simple inline format)
    else if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    }
    // Handle numbers
    else if (typeof value === 'string' && /^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }

    result[key] = value;
  }

  return result;
}

/**
 * Extract intent keywords from an Intention section.
 * Simple extraction - pulls key verbs and nouns.
 */
export function extractIntentKeywords(intention: string, capabilityId: string): string[] {
  const keywords: string[] = [];

  // Add the capability ID parts as keywords
  const idParts = capabilityId.split('.');
  keywords.push(...idParts);

  // Extract action verbs from first sentence
  const firstSentence = intention.split(/[.!?]/)[0] || '';

  // Common API action verbs to look for
  const actionVerbs = [
    'create', 'get', 'list', 'update', 'delete', 'remove', 'add', 'fetch',
    'retrieve', 'search', 'find', 'send', 'post', 'upload', 'download',
    'subscribe', 'unsubscribe', 'connect', 'disconnect', 'start', 'stop',
    'enable', 'disable', 'register', 'unregister', 'query', 'execute'
  ];

  const lowerIntention = intention.toLowerCase();
  for (const verb of actionVerbs) {
    if (lowerIntention.includes(verb)) {
      keywords.push(verb);
    }
  }

  // Extract the primary noun (usually after the first verb)
  const nounMatch = firstSentence.match(/(?:creates?|gets?|lists?|updates?|deletes?|retrieves?|sends?|fetches?)\s+(?:a\s+)?(?:new\s+)?(\w+)/i);
  if (nounMatch) {
    keywords.push(nounMatch[1].toLowerCase());
  }

  // Deduplicate
  return [...new Set(keywords)];
}
