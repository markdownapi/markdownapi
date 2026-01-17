# Markdown API (MAPI) Specification v0.92

**Draft — January 2026**

*A Human, Machine, and Agent Readable API Description Format*

Synthesized from collaborative design between Claude (Anthropic) and Gemini (Google)

---

## Abstract

Markdown API (MAPI) is an API description format designed for the modern era where APIs must be understood by humans, language models, and traditional tooling alike. MAPI combines the readability of Markdown with the type safety of TypeScript and the semantic clarity of natural language constraints.

Unlike OpenAPI, which optimizes for deterministic code generation, MAPI optimizes for semantic understanding, probabilistic reasoning, and unified transport protocols. The result is API documentation that renders beautifully in any Markdown viewer while remaining fully parseable for code generation, validation, and agent orchestration.

---

## Design Goals

1. **Text-First:** The documentation is the specification. Prose context and intent are as important as schema definitions.
2. **TypeScript-Native:** Data shapes use TypeScript interfaces—the most token-efficient and LLM-familiar schema language.
3. **Unified Transport:** HTTP, WebSockets, SSE, and internal tools coexist in a single format.
4. **Capability-Oriented:** APIs are organized by what they do, not by URL paths.
5. **Agent-Ready:** Optimized for LLM consumption with explicit intent and constraint sections.
6. **Token-Efficient:** Avoid redundant definitions; don't document what LLMs already know.
7. **Progressive Disclosure:** Task-specific reference cards minimize context window usage.

---

## 1. Document Structure

A MAPI document is a valid Markdown file with the extension `.mapi.md`. It consists of three main sections:

| Section | Purpose | Required |
|---------|---------|----------|
| **Metadata** | API-level configuration (version, base URL, auth) | Yes |
| **Global Types** | Shared TypeScript interfaces | No |
| **Capabilities** | Operations, events, and tools | Yes |

### 1.1 File Extension

MAPI files use the `.mapi.md` extension. This allows them to be recognized as both Markdown (for rendering) and as API specifications (for tooling).

```
api.mapi.md              # Single-file API
messages.mapi.md         # Resource-specific file
types/common.mapi.md     # Shared type definitions
```

### 1.2 General Structure

```markdown
# API Title

Brief description of the API and its purpose.

~~~meta
version: 1.0.0
base_url: https://api.example.com/v1
auth: bearer
~~~

## Global Types

```typescript
interface User { ... }
```

## Capability: Create User

~~~meta
id: users.create
transport: HTTP POST /users
~~~

### Intention
...

### Input
```typescript
interface CreateUserRequest { ... }
```
```

---

## 2. Metadata Block

The metadata block appears at the document level and within each capability. It uses the `~~~meta` fenced block syntax for explicit boundaries.

### 2.1 Document-Level Metadata

```yaml
~~~meta
version: 1.0.0
base_url: https://api.example.com/v1
auth: bearer
auth_header: Authorization
content_type: application/json
errors: standard
~~~
```

| Field | Description | Required |
|-------|-------------|----------|
| `version` | API version string (semver recommended) | Yes |
| `base_url` | Base URL for all HTTP operations | Yes |
| `auth` | Authentication type (bearer, api_key, basic, oauth2, none) | Yes |
| `auth_header` | Header name for auth token (default: Authorization) | No |
| `content_type` | Default content type (default: application/json) | No |
| `errors` | Error convention: standard or custom (default: standard) | No |

### 2.2 Capability-Level Metadata

```yaml
~~~meta
id: messages.create
transport: HTTP POST /v1/messages
auth: required
idempotent: false
~~~
```

| Field | Description | Required |
|-------|-------------|----------|
| `id` | Unique operation identifier (namespace.action) | Yes |
| `transport` | Protocol and path (see Appendix B) | Yes |
| `auth` | required, optional, or none | No |
| `idempotent` | Whether repeated calls are safe | No |
| `deprecated` | true if operation is deprecated | No |

---

## 3. Global Types

The Global Types section defines reusable TypeScript interfaces that are referenced throughout the specification. This reduces repetition and establishes a consistent vocabulary.

### 3.1 Syntax

Global types are defined in a typescript fenced code block under the "Global Types" heading:

```typescript
## Global Types

// Primitive type aliases
type UUID = string;      // format: uuid-v4
type ISO8601 = string;   // format: ISO 8601 datetime

// Shared interfaces
interface User {
  id: UUID;
  email: string;
  name: string;
  created_at: ISO8601;
}
```

### 3.2 Referencing Global Types

Once defined, global types can be referenced by name in any capability:

```typescript
### Output

interface GetUserResponse {
  user: User;  // References global User type
}
```

---

## 4. Capabilities

The Capability is the core unit of MAPI. A capability represents something the API can do—not an HTTP endpoint, but a logical action with clear intent and constraints.

### 4.1 Structure

Each capability has the following structure:

| Section | Purpose | Required |
|---------|---------|----------|
| `## Capability: Name` | Human-readable capability name | Yes |
| `~~~meta` block | Machine-readable metadata | Yes |
| `### Intention` | Why and when to use this capability | Yes |
| `### Logic Constraints` | Business rules in natural language | No |
| `### Input` | Request schema (TypeScript) | Depends |
| `### Output` | Success response schema | Yes |
| `### Errors` | Non-standard errors only | No |
| `### Example` | Request/response examples | No |

### 4.2 The Intention Section

The Intention section is critical for agent comprehension. It explains:

- What the capability does (in plain language)
- When an agent should choose this capability
- What prerequisites or context are needed

```markdown
### Intention

Creates a new message in a conversation with Claude. Use this capability
when you need to send user input and receive an AI response. The model
processes the full conversation history, so include all relevant context
in the messages array.

This is the primary endpoint for all Claude interactions.
```

### 4.3 Logic Constraints Section

Business rules that cannot be expressed in TypeScript belong here. Use this for behavioral rules, cross-field dependencies, and conditional logic:

```markdown
### Logic Constraints

- `max_tokens` must not exceed the model's context window
- If `stream: true`, response arrives as Server-Sent Events
- When `tool_choice` is specified, `tools` array must not be empty
- The total token count of `messages` + `max_tokens` must fit within model limits
```

> **Tip:** Logic Constraints are for rules that affect runtime behavior. TypeScript handles structural validation; Logic Constraints handle semantic validation.

---

## 5. Schemas and Constraints

MAPI uses TypeScript interfaces for schema definitions. TypeScript was chosen for its familiarity to developers and LLMs, its expressiveness, and its token efficiency compared to JSON Schema.

### 5.1 TypeScript Conventions

Use standard TypeScript syntax with these conventions:

```typescript
interface CreateMessageRequest {
  model: "claude-sonnet-4-20250514" | "claude-opus-4-20250514";
  messages: Message[];
  max_tokens: number;        // 1-200000
  temperature?: number;      // 0.0-1.0, default 1.0
  stream?: boolean;          // default false
  metadata?: Record<string, string>;
}
```

### 5.2 Comment-Based Constraints

Use inline comments for constraints that affect a single field:

| Constraint | Applies To | Comment Syntax |
|------------|------------|----------------|
| Range | number | `// 1-100` |
| Min/Max length | string | `// 1-1000 chars` |
| Pattern | string | `// format: email` |
| Default | any | `// default: value` |
| Array bounds | array | `// 1-10 items` |
| Unique | array | `// unique` |

---

## 6. Error Handling

MAPI assumes standard HTTP error semantics by default. Only document errors that have capability-specific meaning.

### 6.1 Standard Errors Convention

When `errors: standard` is specified in metadata, standard HTTP status codes (400, 401, 403, 404, 409, 422, 429, 500, 503) are understood without explicit documentation.

### 6.2 Custom Errors

Document only errors with specific semantics:

```markdown
### Errors

- `overloaded` (529): API is temporarily overloaded. Retry with exponential backoff.
- `context_length_exceeded` (400): Combined input exceeds model's context window.
```

---

## 7. Streaming and Events

MAPI has first-class support for Server-Sent Events (SSE) streaming responses.

### 7.1 SSE Transport

Indicate streaming with the `(SSE)` transport modifier:

```yaml
~~~meta
id: messages.create_stream
transport: HTTP POST /v1/messages (SSE)
~~~
```

### 7.2 Event Types

Define SSE event types using a discriminated union:

```typescript
type StreamEvent =
  | { type: "message_start"; message: Message }
  | { type: "content_block_delta"; delta: TextDelta }
  | { type: "message_stop" };
```

---

## 8. WebSocket Channels

WebSocket APIs use the `WS` transport and define bidirectional message types.

```markdown
## Channel: Realtime Updates

~~~meta
id: realtime.connect
transport: WS /ws/realtime
~~~

### Intention
Establishes a persistent connection for real-time updates.

### Client Messages
```typescript
type ClientMessage =
  | { type: "subscribe"; channel: string }
  | { type: "unsubscribe"; channel: string };
```

### Server Messages
```typescript
type ServerMessage =
  | { type: "update"; data: any }
  | { type: "error"; message: string };
```
```

---

## 9. Internal Tools

MAPI can describe client-side or internal operations using the `INTERNAL` transport:

```markdown
## Tool: Calculate

~~~meta
id: tools.calculate
transport: INTERNAL
~~~

### Intention
Performs mathematical calculations. Use for any arithmetic the agent cannot reliably perform mentally.
```

---

## 10. Collections and File Organization

Large APIs can be split across multiple files using a collection manifest.

### 10.1 Collection Manifest

```yaml
~~~collection
name: Anthropic API
version: 2024-01
files:
  - messages.mapi.md
  - models.mapi.md
  - admin/users.mapi.md
shared_types: types/common.mapi.md
~~~
```

---

## 11. Conversion from OpenAPI/AsyncAPI

MAPI documents can be generated from existing OpenAPI or AsyncAPI specifications.

### 11.1 OpenAPI Mapping

| OpenAPI | MAPI |
|---------|------|
| Operation (path + method) | Capability |
| operationId | Capability id |
| summary + description | Intention |
| requestBody schema | Input interface |
| response schema | Output interface |
| components/schemas | Global Types |

---

## 12. Progressive Disclosure

MAPI supports "reference cards"—focused, task-specific subsets of the full specification designed to minimize token usage when working with LLMs.

### 12.1 Reference Card Types

- **Author Card:** For LLMs writing MAPI specs
- **Consumer Card:** For LLMs calling APIs
- **Conversion Card:** For converting between formats
- **Validation Card:** For validating MAPI documents

### 12.2 Disclosure Document

A disclosure document helps agents determine which reference card to load:

```yaml
~~~disclosure
cards:
  author:
    description: Write a new MAPI specification
    file: MAPI-AUTHOR.md
  consumer:
    description: Call an API described in MAPI format
    file: MAPI-CONSUMER.md
~~~
```

---

## 13. Complete Examples

See the `/examples` directory for complete MAPI specifications including:

- Simple REST API (task management)
- Streaming API (chat completion)
- WebSocket API (real-time collaboration)
- Mixed transport API (HTTP + WebSocket)

---

## Appendix A: Constraint Reference

| Constraint | Applies To | Syntax |
|------------|------------|--------|
| Range | number | `// 1-100` |
| Min only | number | `// min: 0` |
| Max only | number | `// max: 1000` |
| String length | string | `// 1-1000 chars` |
| Format | string | `// format: email` |
| Pattern | string | `// pattern: ^[a-z]+$` |
| Default | any | `// default: value` |
| Array bounds | array | `// 1-10 items` |
| Unique items | array | `// unique` |

---

## Appendix B: Transport Strings

| Transport | Format | Example |
|-----------|--------|---------|
| HTTP (standard) | `HTTP METHOD /path` | `HTTP POST /users` |
| HTTP with path params | `HTTP METHOD /path/{param}` | `HTTP GET /users/{id}` |
| HTTP with SSE | `HTTP METHOD /path (SSE)` | `HTTP POST /messages (SSE)` |
| WebSocket | `WS /path` | `WS /ws/realtime` |
| Internal/Client-side | `INTERNAL` | `INTERNAL` |

---

## Appendix C: Standard Errors

When `errors: standard` is specified, these HTTP status codes follow conventional semantics:

| Status | Type | When |
|--------|------|------|
| `400` | Bad Request | Malformed JSON, invalid field values |
| `401` | Unauthorized | Missing or invalid credentials |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Resource state conflict |
| `422` | Unprocessable | Semantically invalid |
| `429` | Rate Limited | Too many requests |
| `500` | Server Error | Unexpected internal error |
| `503` | Unavailable | Service temporarily unavailable |

LLMs and developers understand these without explicit documentation. Only document errors with capability-specific semantics.

---

*— End of Specification —*
