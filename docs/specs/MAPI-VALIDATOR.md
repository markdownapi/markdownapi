# MAPI Validator Reference

**Purpose:** Validate that a MAPI document is well-formed.

## Document-Level Checks

| Check | Requirement |
|-------|-------------|
| File extension | Must be `.mapi.md` |
| Title | Must have `# Title` as first heading |
| Document metadata | Must have `~~~meta` block with `version`, `base_url`, `auth` |
| At least one capability | Must have at least one `## Capability:` section |

## Metadata Block Validation

```markdown
~~~meta
version: 1.0.0          ✓ Required
base_url: https://...   ✓ Required, must be valid URL
auth: bearer            ✓ Required, one of: bearer, api_key, basic, oauth2, none
auth_header: X-Api-Key  ○ Optional
content_type: ...       ○ Optional
error_schema: TypeName  ○ Optional, must reference defined type
~~~
```

## Capability-Level Checks

Each `## Capability: Name` must have:

| Section | Required | Validation |
|---------|----------|------------|
| `~~~meta` block | Yes | Must contain `id` and `transport` |
| `### Intention` | Yes | Must be non-empty prose |
| `### Logic Constraints` | No | If present, should be bullet list |
| `### Input` | Conditional | Required if transport has request body |
| `### Output` or `~~~response` | Yes | At least one response definition |
| `direction` | No | If present, must be `outbound` or `inbound` |

## Transport String Patterns

Valid formats (regex):

```
HTTP (GET|POST|PUT|PATCH|DELETE) /[a-zA-Z0-9/_{}.-]+( \(SSE\))?
WS /[a-zA-Z0-9/_{}.-]+
MSG [a-zA-Z0-9._{}*>-]+( \(reply\))?
SUB [a-zA-Z0-9._{}*>-]+
INTERNAL
```

**Examples:**
- ✓ `HTTP POST /messages`
- ✓ `HTTP GET /users/{id}`
- ✓ `HTTP POST /stream (SSE)`
- ✓ `WS /ws/realtime`
- ✓ `INTERNAL`
- ✓ `MSG mesh.registry.register`
- ✓ `MSG mesh.registry.discover (reply)`
- ✓ `MSG mesh.agent.{agent_id}.inbox`
- ✓ `SUB mesh.event.>`
- ✓ `SUB mesh.event.*`
- ✗ `POST /messages` (missing HTTP)
- ✗ `HTTP POST` (missing path)
- ✗ `http post /messages` (wrong case)
- ✗ `MSG` (missing subject)
- ✗ `SUB` (missing subject)

## TypeScript Block Validation

TypeScript in code blocks should be syntactically valid:

```typescript
// ✓ Valid
interface Request {
  field: string;        // required
  optional?: number;    // range: 0-100
}

// ✗ Invalid - constraint in wrong place
interface Request {
  field: string required;  // Not valid TypeScript
}

// ✗ Invalid - missing semicolons (style, but check)
interface Request {
  field: string
  other: number
}
```

## Constraint Comment Patterns

Valid constraint formats in TypeScript comments:

| Pattern | Example |
|---------|---------|
| `// required` | `name: string; // required` |
| `// range: {min}-{max}` | `age: number; // range: 0-150` |
| `// length: {min}-{max}` | `name: string; // length: 1-100` |
| `// default: {value}` | `role?: string; // default: 'user'` |
| `// format: {type}` | `email: string; // format: email` |
| `// minItems: {n}` | `tags: string[]; // minItems: 1` |
| `// maxItems: {n}` | `tags: string[]; // maxItems: 10` |
| `// unique` | `ids: string[]; // unique` |
| `// pattern: /.../` | `code: string; // pattern: /^[A-Z]+$/` |

Multiple constraints can combine: `// required, range: 1-100, default: 50`

## Response Block Validation

```markdown
~~~response {status_code}
` ` `typescript
interface ResponseType { ... }
` ` `
~~~
```

- Status code must be 3-digit number (200, 201, 400, etc.)
- Must contain valid TypeScript

## Events Block Validation

```markdown
~~~events
{event_name}:
  {description}
  payload: { ... }

{another_event}:
  ...
~~~
```

- Event names should be snake_case or camelCase
- Each event should have `payload:` line
- Payload should be valid TypeScript object type

## Subscription-Level Checks

Each `## Subscription: Name` must have:

| Section | Required | Validation |
|---------|----------|------------|
| `~~~meta` block | Yes | Must contain `id` and `transport` (SUB) |
| `### Intention` | Yes | Must be non-empty prose |
| `### Output` | Yes | Schema for received messages |

## Lifecycle Checks

Each `## Lifecycle: Name` must have:

| Section | Required | Validation |
|---------|----------|------------|
| `~~~states` block | Yes | At least one transition |
| `### Intention` | Yes | Must be non-empty prose |
| `### States` | Yes | Table with State, Terminal, Description columns |

### States Block Validation

Each line in `~~~states` must match: `{state} -> {state}: {description}` or `* -> {state}: {description}`

Optional capability ID in brackets: `{state} -> {state}: {description} [{capability.id}]`

## Envelope Checks

Each `## Envelope: Name` must have:

| Section | Required | Validation |
|---------|----------|------------|
| `~~~meta` block | Yes | Must contain `id` |
| `### Schema` | Yes | TypeScript interface |

## Messaging Metadata Validation

| Field | Valid Values |
|-------|-------------|
| `direction` | `outbound`, `inbound` |
| `delivery` | `at_most_once`, `at_least_once`, `exactly_once` |
| `ordering` | `ordered`, `unordered`, `partition_ordered` |
| `consumer_group` | Any non-empty string |

## Common Errors

| Error | Fix |
|-------|-----|
| Missing `### Intention` | Add prose explaining when/why to use |
| `transport: POST /path` | Add `HTTP` prefix: `HTTP POST /path` |
| `~~~response` without status | Add status: `~~~response 200` |
| TypeScript `field: string required` | Move to comment: `field: string; // required` |
| Documenting 400/401 errors | Use `> Errors: standard (...)` instead |
| Missing `~~~meta` in capability | Add block with `id:` and `transport:` |

## Validation Checklist

```
Document Level:
[ ] Has # Title
[ ] Has document ~~~meta with version, base_url, auth
[ ] Has at least one ## Capability:

Per Capability:
[ ] Has ~~~meta with id and transport
[ ] Transport matches valid pattern
[ ] Has ### Intention (non-empty)
[ ] Has ### Input if method expects body (POST/PUT/PATCH)
[ ] Has ~~~response 200 or ### Output
[ ] TypeScript blocks are syntactically valid
[ ] Constraint comments use correct format
[ ] Standard errors use shorthand, not full blocks

Per Subscription:
[ ] Has ~~~meta with id and transport (SUB)
[ ] Transport matches SUB pattern
[ ] Has ### Intention (non-empty)
[ ] Has ### Output

Per Lifecycle:
[ ] Has ~~~states block with valid transitions
[ ] Has ### Intention (non-empty)
[ ] Has ### States table

Per Envelope:
[ ] Has ~~~meta with id
[ ] Has ### Schema with TypeScript
```

---

**Wrong card?** See [MAPI-DISCLOSURE.md](MAPI-DISCLOSURE.md) to find the right resource.

**Need more detail?** See the full [MAPI Specification](mapi-specification-v0.95.md).
