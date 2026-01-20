# Capability: Convert from OpenAPI

~~~meta
id: convert.from-openapi
transport: INTERNAL
~~~

## Intention

Convert an OpenAPI 3.x specification to MAPI Skill format. Use this when you have an OpenAPI YAML or JSON document and want to create a modular Skill structure for efficient agent consumption.

The conversion:
- Extracts API metadata (title, version, base URL, auth)
- Converts each operation to a MAPI capability file
- Generates shared schema files from components
- Creates a Skill.md index with intent keywords

## Input

```typescript
interface ConvertFromOpenApiRequest {
  /** The OpenAPI specification content (YAML or JSON string) */
  content: string;

  /** Optional API name override */
  apiName?: string;

  /** Optional: Generate enhanced intent keywords using LLM */
  generateIntents?: boolean;
}
```

## Output

```typescript
interface SkillOutput {
  /** Content of the Skill.md index file */
  skillMd: string;

  /** Common files: path → content */
  common: Record<string, string>;

  /** Capability files: path → content */
  capabilities: Record<string, string>;
}
```

## Logic Constraints

- Input must be valid OpenAPI 3.x or Swagger 2.x format
- YAML and JSON formats are both supported
- Operations without operationId will have IDs generated from method + path
- Schema $ref references are resolved and inlined
- Intent keywords are extracted from operationId, summary, and tags

## Example

**Input:**
```yaml
openapi: 3.0.0
info:
  title: Users API
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
paths:
  /users:
    post:
      operationId: createUser
      summary: Create a new user
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                name:
                  type: string
```

**Output structure:**
```
Skill.md
common/
  auth.md
  schemas/types.md
capabilities/
  create.user.md
```
