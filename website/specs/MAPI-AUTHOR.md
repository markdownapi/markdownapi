# MAPI Author Reference

**Purpose:** Write a MAPI specification from scratch.

## Document Skeleton

```markdown
# API Name

Brief description of the API.

~~~meta
version: 1.0.0
base_url: https://api.example.com/v1
auth: bearer
~~~

## Global Types

` ` `typescript
interface SharedType { ... }
` ` `

---

## Capability: Do Something

~~~meta
id: namespace.action
transport: HTTP POST /path
~~~

### Intention

Why and when to use this capability.

### Logic Constraints

- Business rules that aren't expressible in TypeScript
- Cross-field dependencies
- Conditional behaviors

### Input

` ` `typescript
interface DoSomethingRequest {
  field: string;  // required
}
` ` `

### Output

~~~response 200
` ` `typescript
interface DoSomethingResponse { ... }
` ` `
~~~

> Errors: standard (400, 401, 429)
```

## Writing Good Intentions

The Intention section is critical for LLM routing. A well-written intention helps agents choose the correct capability on the first try.

**Do:**
- Explain what the capability accomplishes
- State when an agent should choose this over alternatives
- Mention prerequisites or context needed
- Reference related capabilities by ID when disambiguation is needed
- Specify what identifier types are accepted (UUID, email, name, etc.)

**Don't:**
- Repeat the schema
- Just say "creates a resource"
- Leave it generic
- Assume the reader knows which capability to use first

### Differentiating Similar Capabilities

When capabilities could be confused, explicitly contrast them:

> **Good:** "List all child blocks of a page to read its content. Use this when you have a page ID and want to see what's inside. Use `search` only to *find* a page by name; use this to *read* a page's content."

> **Bad:** "List all child blocks of a page or block."

### Multi-Step Workflows

When a task typically requires multiple capabilities, mention the workflow:

> **Good:** "Delete a block by ID. For positional deletion (e.g., 'delete the last paragraph'), first use `blocks.children.list` to find the target block's ID."

> **Bad:** "Delete a block."

### Identifier Requirements

Be explicit about what identifiers the capability accepts:

> **Good:** "Retrieve a user by their UUID. If you only have an email or name, use `users.list` to find the user's ID first."

> **Bad:** "Retrieve details about a specific user."

### Example

> Send a conversation to Claude and receive a response. Use this when you want the complete response at once. For real-time streaming, use `messages.create_stream` instead. For counting tokens before sending, use `messages.count_tokens`.

## Schema Constraints vs Logic Constraints

**In TypeScript comments** (schema-level):
- `// required` — field must be present
- `// range: 1-100` — numeric bounds
- `// length: 1-256` — string length
- `// default: value` — default if omitted
- `// format: email` — format hint

**In Logic Constraints section** (behavioral):
- "If `stream: true`, response is SSE"
- "Messages must alternate user/assistant"
- "System prompt is processed before messages"
- "Requires prior authentication via OAuth flow"

**Rule of thumb:** If it's about one field's value, use a comment. If it's about relationships or behavior, use Logic Constraints.

## Error Handling

**Standard errors** — don't document, just reference:
```markdown
> Errors: standard (400, 401, 429, 500)
```

**Custom errors** — document only if non-standard:
```markdown
~~~response 409
` ` `typescript
interface ConflictError {
  type: 'conflict';
  existing_id: string;
}
` ` `
~~~
```

## Transport Strings

| Pattern | Meaning |
|---------|---------|
| `HTTP GET /path` | GET request |
| `HTTP POST /path` | POST request |
| `HTTP GET /path/{id}` | Path parameter |
| `HTTP POST /path (SSE)` | Server-Sent Events |
| `WS /path` | WebSocket |
| `WEBHOOK POST {callback_url}` | Outbound webhook to client URL |
| `INTERNAL` | Client-side, no network |

## Webhooks

For outbound API callbacks, use the `WEBHOOK` transport:

```markdown
## Webhook: Event Name

~~~meta
id: webhooks.event_name
transport: WEBHOOK POST {callback_url}
~~~

### Intention
Describe when the API sends this webhook.

### Output
` ` `typescript
interface WebhookPayload {
  event: "event.name";
  payload: { ... };
  signature: string;  // HMAC-SHA256 verification
}
` ` `

### Logic Constraints
- Include signature verification details
- Document retry behavior
```

## File Uploads & Binary Downloads

For **multipart uploads**, set `content_type: multipart/form-data`:

```markdown
~~~meta
id: files.upload
transport: HTTP POST /upload
content_type: multipart/form-data
~~~
```

Document file constraints in Logic Constraints (max size, allowed formats, field names).

For **binary downloads**, describe the response content type in Output:

```markdown
### Output
Returns raw file bytes.
Content-Type: `application/octet-stream` or original MIME type.
```

## Common Mistakes

1. **Over-documenting errors** — 400/401/500 don't need schemas
2. **Weak intentions** — "Creates a user" is useless; explain *when* and *why*
3. **Logic in schema comments** — "Must be provided if X" belongs in Logic Constraints
4. **Missing `// required`** — TypeScript `?` means optional; non-`?` fields need `// required`

---

**Wrong card?** See [MAPI-DISCLOSURE.md](MAPI-DISCLOSURE.md) to find the right resource.

**Need more detail?** See the full [MAPI Specification](mapi-specification-v0.94.md).
