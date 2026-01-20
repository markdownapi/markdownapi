# Capability: Convert from MAPI

~~~meta
id: convert.from-mapi
transport: INTERNAL
~~~

## Intention

Split a single-file MAPI document into modular Skill format. Use this when you have a monolithic .mapi.md file and want to create a modular Skill structure for efficient agent consumption.

This is sometimes called "splitting" because it takes one file and splits it into many.

The conversion:
- Extracts document metadata to Skill.md header
- Moves Global Types to common/schemas/
- Extracts each capability to its own file
- Generates intent keywords from Intention sections
- Tracks dependencies between capabilities and shared types

## Input

```typescript
interface ConvertFromMapiRequest {
  /** The MAPI document content (.mapi.md file content) */
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

- Input must be valid MAPI format (contains ~~~meta blocks)
- Capabilities are identified by `## Capability:`, `## Channel:`, `## Webhook:`, or `## Tool:` headings
- Global Types section is extracted to common/schemas/types.md
- Auth settings from document metadata generate common/auth.md
- Intent keywords are extracted from capability Intention sections
- Dependencies are inferred from type references in capability code blocks

## Example

**Input:**
```markdown
# Users API

~~~meta
version: 1.0.0
base_url: https://api.example.com/v1
auth: bearer
~~~

## Global Types

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}
```

## Capability: Create User

~~~meta
id: users.create
transport: HTTP POST /users
~~~

### Intention

Create a new user account.

### Input

```typescript
interface CreateUserRequest {
  email: string;
  name: string;
}
```

### Output

```typescript
interface CreateUserResponse {
  user: User;
}
```
```

**Output structure:**
```
Skill.md
common/
  auth.md
  schemas/types.md
capabilities/
  users.create.md
```
