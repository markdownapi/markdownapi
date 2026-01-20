/**
 * MAPI Converter Library
 *
 * Converts API specifications to MAPI Skill format.
 *
 * Usage:
 *   import { convertMapiToSkill, convertOpenApiToSkill } from 'mapi-converter';
 *
 *   // Convert single-file MAPI to Skill format
 *   const skillOutput = await convertMapiToSkill(mapiContent);
 *
 *   // Convert OpenAPI to Skill format
 *   const skillOutput = await convertOpenApiToSkill(openapiContent);
 */

export * from './types.js';

import { parseMapiDocument } from './parsers/mapi.js';
import { parseOpenApiDocument } from './parsers/openapi.js';
import { generateSkillFromMapi, generateSkillFromOpenApi } from './generators/skill.js';
import { SkillOutput, ConvertOptions } from './types.js';

/**
 * Convert a single-file MAPI document to Skill format.
 *
 * @param content - The MAPI document content (string)
 * @param options - Optional conversion settings
 * @returns SkillOutput with skillMd, common files, and capability files
 */
export async function convertMapiToSkill(
  content: string,
  options: ConvertOptions = {}
): Promise<SkillOutput> {
  const parsed = parseMapiDocument(content);
  return generateSkillFromMapi(parsed, options);
}

/**
 * Convert an OpenAPI document to Skill format.
 *
 * @param content - The OpenAPI document content (YAML or JSON string)
 * @param options - Optional conversion settings
 * @returns SkillOutput with skillMd, common files, and capability files
 */
export async function convertOpenApiToSkill(
  content: string,
  options: ConvertOptions = {}
): Promise<SkillOutput> {
  const parsed = parseOpenApiDocument(content);
  return generateSkillFromOpenApi(parsed, options);
}

/**
 * Detect the format of an API specification.
 *
 * @param content - The specification content
 * @returns 'mapi' | 'openapi' | 'unknown'
 */
export function detectFormat(content: string): 'mapi' | 'openapi' | 'unknown' {
  // Check for MAPI markers
  if (content.includes('~~~meta') || content.includes('.mapi.md')) {
    return 'mapi';
  }

  // Check for OpenAPI markers
  if (content.includes('openapi:') || content.includes('"openapi"') ||
      content.includes('swagger:') || content.includes('"swagger"')) {
    return 'openapi';
  }

  return 'unknown';
}

/**
 * Convert any supported API specification to Skill format.
 * Auto-detects the input format.
 *
 * @param content - The specification content
 * @param options - Optional conversion settings
 * @returns SkillOutput
 * @throws Error if format cannot be detected
 */
export async function convertToSkill(
  content: string,
  options: ConvertOptions = {}
): Promise<SkillOutput> {
  const format = detectFormat(content);

  switch (format) {
    case 'mapi':
      return convertMapiToSkill(content, options);
    case 'openapi':
      return convertOpenApiToSkill(content, options);
    default:
      throw new Error('Unable to detect specification format. Expected MAPI or OpenAPI.');
  }
}

// Re-export parsers for advanced usage
export { parseMapiDocument } from './parsers/mapi.js';
export { parseOpenApiDocument } from './parsers/openapi.js';
