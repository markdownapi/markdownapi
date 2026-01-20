/**
 * OpenAPI Parser
 *
 * Parses OpenAPI 3.x documents into a structured representation.
 */

import YAML from 'yaml';
import {
  ParsedOpenApiDocument,
  ParsedOpenApiOperation,
  OpenApiParameter,
  OpenApiRequestBody,
  OpenApiResponse,
  OpenApiSchema,
} from '../types.js';

interface OpenApiDoc {
  openapi?: string;
  swagger?: string;
  info?: {
    title?: string;
    description?: string;
    version?: string;
  };
  servers?: Array<{ url?: string; description?: string }>;
  paths?: Record<string, Record<string, OpenApiOperationRaw>>;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
    securitySchemes?: Record<string, SecurityScheme>;
  };
  security?: Record<string, string[]>[];
}

interface OpenApiOperationRaw {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, OpenApiResponse>;
  security?: Record<string, string[]>[];
  tags?: string[];
}

interface SecurityScheme {
  type: string;
  scheme?: string;
  bearerFormat?: string;
  name?: string;
  in?: string;
  flows?: Record<string, unknown>;
}

/**
 * Parse an OpenAPI document (YAML or JSON string) into structured data
 */
export function parseOpenApiDocument(content: string): ParsedOpenApiDocument {
  // Parse YAML/JSON
  const doc = parseYamlOrJson(content) as OpenApiDoc;

  // Validate it's an OpenAPI doc
  if (!doc.openapi && !doc.swagger) {
    throw new Error('Not a valid OpenAPI document: missing openapi or swagger field');
  }

  // Extract basic info
  const title = doc.info?.title || 'Untitled API';
  const description = doc.info?.description;
  const version = doc.info?.version || '1.0.0';

  // Extract base URL
  const baseUrl = extractBaseUrl(doc);

  // Extract auth info
  const auth = extractAuth(doc);

  // Extract schemas (for reference resolution)
  const schemas = doc.components?.schemas || {};

  // Extract operations
  const operations = extractOperations(doc, schemas);

  return {
    title,
    description,
    version,
    baseUrl,
    auth,
    operations,
    schemas,
  };
}

/**
 * Parse YAML or JSON content
 */
function parseYamlOrJson(content: string): unknown {
  // Try JSON first (faster)
  try {
    return JSON.parse(content);
  } catch {
    // Fall back to YAML parsing
    return YAML.parse(content);
  }
}

/**
 * Extract base URL from servers
 */
function extractBaseUrl(doc: OpenApiDoc): string {
  if (doc.servers && doc.servers.length > 0) {
    return doc.servers[0].url || 'https://api.example.com';
  }
  return 'https://api.example.com';
}

/**
 * Extract authentication info
 */
function extractAuth(doc: OpenApiDoc): { type: string; flows?: Record<string, unknown> } | undefined {
  const schemes = doc.components?.securitySchemes;
  if (!schemes) return undefined;

  // Find the primary auth scheme
  for (const [, scheme] of Object.entries(schemes)) {
    if (scheme.type === 'http' && scheme.scheme === 'bearer') {
      return { type: 'bearer' };
    }
    if (scheme.type === 'apiKey') {
      return { type: 'api_key' };
    }
    if (scheme.type === 'oauth2') {
      return { type: 'oauth2', flows: scheme.flows };
    }
  }

  return undefined;
}

/**
 * Extract operations from paths
 */
function extractOperations(
  doc: OpenApiDoc,
  schemas: Record<string, OpenApiSchema>
): ParsedOpenApiOperation[] {
  const operations: ParsedOpenApiOperation[] = [];

  if (!doc.paths) return operations;

  const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    for (const method of httpMethods) {
      const operation = pathItem[method] as OpenApiOperationRaw | undefined;
      if (!operation) continue;

      // Generate operationId if not present
      const operationId = operation.operationId || generateOperationId(method, path);

      operations.push({
        operationId,
        method: method.toUpperCase(),
        path,
        summary: operation.summary,
        description: operation.description,
        parameters: resolveParameters(operation.parameters, schemas),
        requestBody: resolveRequestBody(operation.requestBody, schemas),
        responses: operation.responses,
        security: operation.security || doc.security,
        tags: operation.tags,
      });
    }
  }

  return operations;
}

/**
 * Generate an operationId from method and path
 */
function generateOperationId(method: string, path: string): string {
  // /users/{id}/posts -> users.id.posts
  const pathParts = path
    .split('/')
    .filter(Boolean)
    .map(part => part.replace(/[{}]/g, ''));

  return `${method}_${pathParts.join('_')}`;
}

/**
 * Resolve parameter references
 */
function resolveParameters(
  params: OpenApiParameter[] | undefined,
  schemas: Record<string, OpenApiSchema>
): OpenApiParameter[] | undefined {
  if (!params) return undefined;

  return params.map(param => {
    if ('$ref' in param) {
      // Resolve reference (simplified)
      const refPath = (param as unknown as { $ref: string }).$ref;
      const resolved = resolveRef(refPath, { components: { schemas } });
      return { ...resolved, ...param } as OpenApiParameter;
    }
    return param;
  });
}

/**
 * Resolve request body references
 */
function resolveRequestBody(
  body: OpenApiRequestBody | undefined,
  schemas: Record<string, OpenApiSchema>
): OpenApiRequestBody | undefined {
  if (!body) return undefined;

  // Resolve schema refs in content
  if (body.content) {
    for (const [, mediaType] of Object.entries(body.content)) {
      if (mediaType.schema?.$ref) {
        mediaType.schema = resolveRef(mediaType.schema.$ref, { components: { schemas } });
      }
    }
  }

  return body;
}

/**
 * Resolve a $ref path
 */
function resolveRef(refPath: string, doc: { components?: { schemas?: Record<string, OpenApiSchema> } }): OpenApiSchema {
  // Handle #/components/schemas/Name
  const match = refPath.match(/#\/components\/schemas\/(\w+)/);
  if (match && doc.components?.schemas) {
    return doc.components.schemas[match[1]] || { type: 'object' };
  }
  return { type: 'object' };
}

/**
 * Convert an OpenAPI schema to TypeScript interface string
 */
export function schemaToTypeScript(
  schema: OpenApiSchema,
  name: string,
  schemas: Record<string, OpenApiSchema>,
  indent: string = ''
): string {
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop() || 'Unknown';
    return refName;
  }

  if (schema.type === 'array' && schema.items) {
    const itemType = schemaToTypeScript(schema.items, '', schemas, indent);
    return `${itemType}[]`;
  }

  if (schema.type === 'object' || schema.properties) {
    const props = schema.properties || {};
    const required = new Set(schema.required || []);

    const lines: string[] = [];
    lines.push(`interface ${name} {`);

    for (const [propName, propSchema] of Object.entries(props)) {
      const optional = required.has(propName) ? '' : '?';
      const propType = schemaToTypeScript(propSchema, propName, schemas, indent + '  ');
      const description = propSchema.description ? `  // ${propSchema.description}` : '';
      lines.push(`${indent}  ${propName}${optional}: ${propType};${description}`);
    }

    lines.push(`${indent}}`);
    return lines.join('\n');
  }

  // Primitive types
  switch (schema.type) {
    case 'string':
      if (schema.enum && Array.isArray(schema.enum)) {
        return schema.enum.map(e => `"${e}"`).join(' | ');
      }
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return 'unknown';
  }
}

/**
 * Extract intent keywords from an OpenAPI operation
 */
export function extractOpenApiIntentKeywords(operation: ParsedOpenApiOperation): string[] {
  const keywords: string[] = [];

  // Add operation ID parts
  const idParts = operation.operationId.split(/[_.]/).filter(Boolean);
  keywords.push(...idParts);

  // Add HTTP method
  keywords.push(operation.method.toLowerCase());

  // Extract words from summary
  if (operation.summary) {
    const words = operation.summary.toLowerCase().split(/\s+/);
    const actionWords = words.filter(w =>
      ['get', 'list', 'create', 'update', 'delete', 'add', 'remove', 'fetch', 'retrieve', 'search', 'find'].includes(w)
    );
    keywords.push(...actionWords);
  }

  // Add tags
  if (operation.tags) {
    keywords.push(...operation.tags.map(t => t.toLowerCase()));
  }

  return [...new Set(keywords)];
}
