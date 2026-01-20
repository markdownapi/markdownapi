# MAPI Convert

Convert API specifications to MAPI Skill format for efficient agent consumption.

~~~meta
version: 0.1.0
type: converter
handler: handler.ts
~~~

## Overview

This skill converts API specifications from OpenAPI or single-file MAPI format into the modular MAPI Skill format. The Skill format enables agents to load only the capabilities they need, reducing token usage for large APIs.

## Capabilities

| ID | Intent Keywords | File | Dependencies |
|----|-----------------|------|--------------|
| convert.from-openapi | convert openapi, openapi to mapi, transform openapi, openapi to skill | capabilities/from-openapi.md | - |
| convert.from-mapi | split mapi, mapi to skill, convert mapi, modularize mapi | capabilities/from-mapi.md | - |

## Invocation

### As an Executable Skill

The handler accepts JSON input via stdin and outputs JSON to stdout:

```bash
echo '{"content": "<openapi-yaml>", "generateIntents": true}' | \
  npx ts-node handler.ts convert.from-openapi
```

**Input schema:**
```typescript
interface HandlerInput {
  content: string;        // The API specification content
  apiName?: string;       // Optional API name override
  generateIntents?: boolean;  // Use LLM to generate intent keywords
}
```

**Output schema:**
```typescript
interface HandlerOutput {
  success: boolean;
  result?: SkillOutput;   // Present on success
  error?: string;         // Present on failure
}
```

### As a Library

```typescript
import { convertOpenApiToSkill, convertMapiToSkill } from 'mapi-converter';

const result = await convertOpenApiToSkill(openapiContent, {
  apiName: 'My API',
  intentGenerator: myLLMGenerator,  // Optional
});
```

### As a CLI

```bash
mapi convert openapi.yaml -o ./my-skill/
mapi split api.mapi.md -o ./my-skill/
```

## Response Format

The skill returns a structured response:

```typescript
interface SkillOutput {
  skillMd: string;                        // Content of Skill.md
  common: Record<string, string>;         // path → content
  capabilities: Record<string, string>;   // path → content
}
```

## Environment Variables

- `ANTHROPIC_API_KEY` - Required for LLM-based intent generation
