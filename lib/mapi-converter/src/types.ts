/**
 * Core types for MAPI converter library
 */

// ============================================================================
// Output Types (what the converter produces)
// ============================================================================

/**
 * The complete output of a conversion to Skill format.
 * This is a pure data structure - no file I/O.
 */
export interface SkillOutput {
  /** Content of the Skill.md index file */
  skillMd: string;

  /** Common files: path → content (e.g., "auth.md" → "# Authentication\n...") */
  common: Record<string, string>;

  /** Capability files: path → content (e.g., "users.create.md" → "# Capability...") */
  capabilities: Record<string, string>;
}

/**
 * A single row in the Skill.md capability index
 */
export interface CapabilityIndexEntry {
  id: string;
  intentKeywords: string[];
  filePath: string;
  dependencies: string[];
}

// ============================================================================
// Parsed MAPI Types (intermediate representation)
// ============================================================================

/**
 * Document-level metadata from a MAPI file
 */
export interface MapiDocumentMeta {
  version?: string;
  base_url?: string;
  auth?: string;
  auth_header?: string;
  auth_flow?: string;
  auth_scopes?: string[];
  content_type?: string;
  errors?: string;
  [key: string]: unknown;
}

/**
 * Capability-level metadata
 */
export interface MapiCapabilityMeta {
  id: string;
  transport: string;
  auth?: string;
  auth_flow?: string;
  auth_scopes?: string[];
  idempotent?: boolean;
  deprecated?: boolean;
  content_type?: string;
  [key: string]: unknown;
}

/**
 * A parsed MAPI capability
 */
export interface ParsedCapability {
  name: string;
  meta: MapiCapabilityMeta;
  intention?: string;
  authIntention?: string;
  logicConstraints?: string;
  input?: string;
  output?: string;
  errors?: string;
  example?: string;
  rawContent: string;
}

/**
 * A fully parsed MAPI document
 */
export interface ParsedMapiDocument {
  title: string;
  description?: string;
  meta: MapiDocumentMeta;
  globalTypes?: string;
  capabilities: ParsedCapability[];
}

// ============================================================================
// Parsed OpenAPI Types (intermediate representation)
// ============================================================================

/**
 * A parsed OpenAPI operation
 */
export interface ParsedOpenApiOperation {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, OpenApiResponse>;
  security?: Record<string, string[]>[];
  tags?: string[];
}

export interface OpenApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: OpenApiSchema;
}

export interface OpenApiRequestBody {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: OpenApiSchema }>;
}

export interface OpenApiResponse {
  description?: string;
  content?: Record<string, { schema?: OpenApiSchema }>;
}

export interface OpenApiSchema {
  type?: string;
  format?: string;
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
  required?: string[];
  enum?: string[];
  $ref?: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * A fully parsed OpenAPI document
 */
export interface ParsedOpenApiDocument {
  title: string;
  description?: string;
  version: string;
  baseUrl: string;
  auth?: {
    type: string;
    flows?: Record<string, unknown>;
  };
  operations: ParsedOpenApiOperation[];
  schemas: Record<string, OpenApiSchema>;
}

// ============================================================================
// Intent Generation
// ============================================================================

/**
 * Interface for intent keyword generation.
 * Can be implemented with LLM calls or simple extraction.
 */
export interface IntentGenerator {
  generate(capabilityId: string, description: string): Promise<string[]>;
}

/**
 * Options for conversion
 */
export interface ConvertOptions {
  /** Optional intent generator for enriching keywords */
  intentGenerator?: IntentGenerator;

  /** API name override (otherwise extracted from source) */
  apiName?: string;
}
