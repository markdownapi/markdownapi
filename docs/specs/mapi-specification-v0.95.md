# Markdown API (MAPI) Specification v0.95

**Draft — February 2026**

*A Human, Machine, and Agent Readable API Description Format*

---

## Abstract

Markdown API (MAPI) is an API description format designed for the modern era where APIs must be understood by humans, language models, and traditional tooling alike. MAPI combines the readability of Markdown with the type safety of TypeScript and the semantic clarity of natural language constraints.

Unlike OpenAPI, which optimizes for deterministic code generation, MAPI optimizes for semantic understanding, probabilistic reasoning, and unified transport protocols. The result is API documentation that renders beautifully in any Markdown viewer while remaining fully parseable for code generation, validation, and agent orchestration.

---

## Design Goals

1. **Text-First:** The documentation is the specification. Prose context and intent are as important as schema definitions.
2. **TypeScript-Native:** Data shapes use TypeScript interfaces—the most token-efficient and LLM-familiar schema language.
3. **Unified Transport:** HTTP, WebSockets, SSE, message buses, and internal tools coexist in a single format.
4. **Capability-Oriented:** APIs are organized by what they do, not by URL paths or subject names.
5. **Agent-Ready:** Optimized for LLM consumption with explicit intent and constraint sections.
6. **Token-Efficient:** Avoid redundant definitions; don't document what LLMs already know.
7. **Progressive Disclosure:** Task-specific reference cards minimize context window usage.

### A Note on Authentication

Readers familiar with OpenAPI may notice that MAPI has no dedicated "Security" or "Authentication" section. This is intentional, not an oversight.

In MAPI, authentication is a **cross-cutting concern** woven throughout the specification rather than siloed into a single section:

- **Metadata** declares *what* authentication is required (`auth`, `auth_flow`, `auth_scopes`)
- **Auth Intention** explains *why* and *when*—the prose context LLMs need to reason about auth
- **Logic Constraints** capture *behavioral rules*—token expiry, scope requirements, error responses

This approach reflects MAPI's Text-First philosophy: authentication requirements are best understood in context, not in isolation. An agent reading a capability should immediately understand its auth requirements alongside its purpose, not cross-reference a separate security section.

For detailed guidance on documenting authentication, see the [Auth Reference Card](MAPI-AUTH.md).

---

## 1. Document Structure

A MAPI document is a valid Markdown file with the extension `.mapi.md`. It consists of these sections:

| Section | Purpose | Required |
|---------|---------|----------|
| **Metadata** | API-level configuration (version, base URL, auth) | Yes |
| **Global Types** | Shared TypeScript interfaces | No |
| **Envelope** | Wire format wrapping all messages | No |
| **Lifecycles** | State machines for stateful resources | No |
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
| `base_url` | Base URL for all HTTP operations | Conditional |
| `broker_url` | Message broker connection URL | Conditional |
| `auth` | Authentication type (bearer, api_key, basic, oauth2, none) | Yes |
| `auth_header` | Header name for auth token (default: Authorization) | No |
| `auth_flow` | OAuth2 flow type (authorization_code, client_credentials, implicit, password) | No |
| `auth_scopes` | Default required scopes for OAuth2 | No |
| `auth_docs_url` | URL to authentication documentation or onboarding guide | No |
| `content_type` | Default content type (default: application/json). Use `multipart/form-data` for file uploads or `application/octet-stream` for binary data. | No |
| `errors` | Error convention: standard or custom (default: standard) | No |
| `delivery` | Default delivery guarantee for message bus capabilities: `at_most_once`, `at_least_once`, `exactly_once` (default: at_most_once) | No |

> **Note:** `base_url` is required for HTTP-based APIs. `broker_url` is required for message bus APIs. A document may include both if the API spans both transports.

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
| `auth_flow` | OAuth2 flow override for this capability | No |
| `auth_scopes` | Scopes required for this capability (overrides document-level) | No |
| `idempotent` | Whether repeated calls are safe | No |
| `deprecated` | true if operation is deprecated | No |
| `direction` | `outbound` (default) or `inbound` — see Section 8.2 | No |
| `delivery` | Delivery guarantee override: `at_most_once`, `at_least_once`, `exactly_once` | No |
| `ordering` | Message ordering: `ordered`, `unordered`, `partition_ordered` (default: unordered) | No |
| `consumer_group` | Queue group name for load-balanced delivery | No |

### 2.3 Multipart Uploads and Binary Content

For file uploads, set `content_type` to `multipart/form-data` and describe file fields in Logic Constraints:

```markdown
## Capability: Upload Document

~~~meta
id: documents.upload
transport: HTTP POST /documents
content_type: multipart/form-data
~~~

### Input
```typescript
interface UploadDocumentRequest {
  file: File;           // The document file
  title: string;
  tags?: string[];
}
```

### Logic Constraints
- `file` must be PDF, DOCX, or TXT format
- Maximum file size: 10MB
- `file` field name in multipart body: "document"
```

For binary downloads, specify `application/octet-stream` in the Output section:

```markdown
## Capability: Download File

~~~meta
id: files.download
transport: HTTP GET /files/{file_id}/content
~~~

### Output
Returns the raw file bytes with appropriate `Content-Type` header.
Response content type: `application/octet-stream` (or original file MIME type)

### Logic Constraints
- `Content-Disposition` header contains the original filename
- Large files may use chunked transfer encoding
```

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
| `### Auth Intention` | Authentication context for agents | When auth ≠ none |
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

**Authentication-related constraints** also belong here when they affect runtime behavior:

```markdown
### Logic Constraints

- Requests without valid Bearer token return 401 Unauthorized
- Expired tokens return 401 with `error: token_expired` in response body
- Insufficient scopes return 403 with `required_scopes` array in response
- Rate limits vary by token tier: 100/min (standard), 1000/min (premium)
- Service account tokens cannot access user-specific resources
```

> **Tip:** Logic Constraints are for rules that affect runtime behavior. TypeScript handles structural validation; Logic Constraints handle semantic validation.

### 4.4 The Auth Intention Section

When a capability requires authentication, the Auth Intention section provides the prose context that agents need to understand *how* to authenticate—not just *that* they must authenticate.

The Auth Intention section explains:

- How to obtain credentials (the onboarding path)
- Which scopes or permissions are required
- Any capability-specific auth considerations
- Alternatives for different integration patterns (user vs. machine-to-machine)

```markdown
### Auth Intention

Requires OAuth2 with `payments:write` scope. Users obtain tokens through
the standard authorization code flow at `/oauth/authorize`.

For server-to-server integrations, use client_credentials flow instead—
register a service account in the Dashboard under Settings > API Access.

Tokens expire after 1 hour. For long-running processes, implement token
refresh or request offline_access scope for refresh tokens.
```

Unlike metadata fields which are machine-parseable, Auth Intention provides the contextual understanding an LLM needs to guide users through authentication or to reason about whether cached credentials are still valid.

> **When to include:** Add Auth Intention whenever `auth: required` and the authentication has nuance beyond "include a Bearer token." Skip it for simple API key authentication where no explanation is needed.

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

For message bus capabilities (MSG/SUB transports), standard errors use structured error objects in the envelope or reply message rather than HTTP status codes. The error semantics remain the same—the categories (bad request, unauthorized, not found, etc.) apply regardless of transport.

### 6.2 Custom Errors

Document only errors with specific semantics:

```markdown
### Errors

- `overloaded` (529): API is temporarily overloaded. Retry with exponential backoff.
- `context_length_exceeded` (400): Combined input exceeds model's context window.
```

For message bus capabilities, use numeric error codes in structured error objects:

```markdown
### Errors

- `SKILL_NOT_FOUND` (3001): The requested skill is not available on this agent.
- `OVERLOADED` (4001): Agent is too busy to accept new work.
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

## 8. Message Bus Capabilities

MAPI supports message-oriented APIs built on brokers like NATS, MQTT, AMQP, Kafka, and Redis Streams. These APIs use named subjects (topics) instead of URL paths, and publish/reply patterns instead of HTTP request/response.

### 8.1 MSG Transport

The `MSG` transport type describes capabilities addressed by subject name rather than URL path:

```yaml
~~~meta
id: mesh.register
transport: MSG mesh.registry.register (reply)
auth: required
~~~
```

The subject is a dot-delimited string (e.g., `mesh.registry.register`). Unlike HTTP paths, there is no method verb—the subject name itself identifies the operation.

**Parameterized subjects** use the same `{param}` syntax as HTTP path parameters:

```
MSG mesh.agent.{agent_id}.inbox
```

**The `(reply)` modifier** indicates the message expects a reply on an ephemeral inbox—analogous to HTTP request/response, but over a message bus. Without `(reply)`, the message is fire-and-forget (publish only).

#### Example: Register Agent

```markdown
## Capability: Register Agent

~~~meta
id: mesh.register
transport: MSG mesh.registry.register (reply)
auth: required
~~~

### Intention

Introduces your agent to the mesh. Call this once after connecting to
announce who you are and what you can do. The registry stores your manifest
and makes it discoverable by other agents. You must register before other
agents can find or communicate with you.

If you've already registered, calling register again updates your manifest
(e.g., to change availability or add skills).

### Logic Constraints

- The `id` field in the manifest must match the agent's authenticated identity
- Re-registration with the same ID replaces the existing manifest
- After registration, send heartbeats every 30 seconds to remain online

### Input

```typescript
interface RegisterRequest {
  manifest: Manifest;
}
```

### Output

```typescript
interface RegisterResponse {
  status: "ok";
  agent_id: string;
}
```
```

### 8.2 Inbound vs Outbound

MAPI capabilities default to **outbound**—the reader calls them. But in peer-to-peer protocols, agents both send and receive. The `direction` metadata field distinguishes:

| Value | Meaning | Code generation |
|-------|---------|-----------------|
| `outbound` | You call this (default) | Generates function calls |
| `inbound` | You implement a handler for this | Generates event handlers |

This distinction is critical for LLMs generating code: outbound capabilities become API calls, inbound capabilities become message handlers.

#### Example: Agent Inbox (Inbound)

```markdown
## Capability: Handle Request

~~~meta
id: mesh.agent.inbox
transport: MSG mesh.agent.{agent_id}.inbox
direction: inbound
~~~

### Intention

This is your agent's inbox — the subject where other agents send you work.
When another agent discovers you and wants to use one of your skills, their
request arrives here. You must implement a handler that:

1. Reads the requested skill from the payload
2. Routes to the appropriate skill handler
3. Returns a response with the result (or an error)

If you don't handle inbox messages, other agents can discover you but
can't interact with you.

### Input

```typescript
interface IncomingRequest {
  skill: string;        // which skill the caller wants
  input: unknown;       // skill-specific input data
  config?: {
    timeout_ms?: number;
    stream?: boolean;
    accepted_output?: string[];
  };
}
```

### Output

```typescript
interface OutgoingResponse {
  status: TaskState;
  message?: string;
  output?: unknown;
}
```

### Errors

- `SKILL_NOT_FOUND` (3001): You don't have the requested skill
- `OVERLOADED` (4001): You're too busy to accept work right now
```

### 8.3 Messaging Metadata

Message bus capabilities support additional metadata fields for delivery semantics:

```yaml
~~~meta
id: mesh.task.update
transport: MSG mesh.task.{task_id}.update
delivery: at_least_once
ordering: ordered
consumer_group: task-processors
~~~
```

| Field | Values | Default | Description |
|-------|--------|---------|-------------|
| `delivery` | `at_most_once`, `at_least_once`, `exactly_once` | `at_most_once` | Delivery guarantee |
| `ordering` | `ordered`, `unordered`, `partition_ordered` | `unordered` | Message ordering guarantee |
| `consumer_group` | string | *(none)* | Queue group for load-balanced delivery |

**Delivery guarantees:**
- `at_most_once` — Fire-and-forget. Message may be lost but is never duplicated.
- `at_least_once` — Message will be delivered but may be duplicated. Handlers should be idempotent.
- `exactly_once` — Message delivered exactly once. Requires broker support (e.g., NATS JetStream, Kafka transactions).

**Ordering guarantees:**
- `unordered` — No ordering guarantee across messages.
- `ordered` — Messages arrive in publish order within the subject.
- `partition_ordered` — Ordered within a partition key, unordered across partitions.

**Consumer groups:**
When `consumer_group` is set, only one member of the group receives each message (load balancing). Without it, all subscribers receive every message (fan-out).

---

## 9. Subscriptions

Subscriptions describe a pub/sub pattern where an agent declares interest in a topic pattern and receives messages matching that pattern over time. This is distinct from WebSocket channels (connection-scoped bidirectional streams) and Webhooks (outbound HTTP callbacks).

### 9.1 SUB Transport

Use the `## Subscription:` heading with a `SUB` transport:

```yaml
~~~meta
id: mesh.subscribe
transport: SUB mesh.event.{topic}
~~~
```

### 9.2 Wildcard Syntax

Subscription subjects support wildcards for pattern matching:

| Wildcard | Matches | Example |
|----------|---------|---------|
| `*` | Exactly one token | `mesh.event.*` matches `mesh.event.login` but not `mesh.event.user.login` |
| `>` | One or more tokens (must be at end) | `mesh.event.>` matches `mesh.event.login` and `mesh.event.user.login` |

> **Broker equivalents:** MQTT uses `+` (single level) and `#` (multi level) for the same semantics. Document broker-specific syntax in Logic Constraints if it differs from MAPI's canonical wildcards.

### 9.3 Example: Mesh Events

```markdown
## Subscription: Mesh Events

~~~meta
id: mesh.subscribe
transport: SUB mesh.event.{topic}
delivery: at_most_once
~~~

### Intention

Listens for events published by other agents on the mesh. Subscribe to a
specific topic like `mesh.event.scraping.profile_found`, or use wildcards
to catch broader patterns:

- `mesh.event.user.*` — matches one level (e.g., `user.login`, `user.logout`)
- `mesh.event.user.>` — matches one or more levels (e.g., `user.login`, `user.profile.updated`)

Events are fire-and-forget from the publisher's perspective. You will only
receive events for topics you've subscribed to.

### Logic Constraints

- Subscriptions are active for the duration of the agent's connection
- Wildcard `*` matches exactly one token; `>` matches one or more and must be at the end
- An agent can hold multiple concurrent subscriptions
- Events are delivered at-most-once unless backed by a persistent stream

### Output

```typescript
interface MeshEvent {
  domain: string;       // e.g., "scraping", "user", "system"
  event_type: string;   // e.g., "profile_found", "login"
  data: unknown;        // event-specific payload
}
```

### Example

Subscribing to `mesh.event.scraping.>` would deliver:

```json
{
  "domain": "scraping",
  "event_type": "profile_found",
  "data": {
    "url": "https://example.com/profile/jane",
    "name": "Jane Doe",
    "found_by": "agent-abc123"
  }
}
```
```

---

## 10. WebSocket Channels

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

## 11. Webhooks

Webhooks describe outbound HTTP calls that the API makes to client-provided URLs when events occur. Use the `WEBHOOK` transport to document these callback patterns.

### 11.1 Webhook Structure

Webhooks use a similar structure to capabilities but describe what the API sends rather than what it receives:

```markdown
## Webhook: Payment Completed

~~~meta
id: webhooks.payment_completed
transport: WEBHOOK POST {callback_url}
~~~

### Intention
Sent to your registered endpoint when a payment succeeds. Register webhook
URLs through the Dashboard or the webhooks.register capability.

### Output
```typescript
interface PaymentWebhookPayload {
  event: "payment.completed";
  payload: {
    payment_id: string;
    amount: number;
    currency: string;
    customer_id: string;
  };
  timestamp: ISO8601;
  signature: string;  // HMAC-SHA256 for verification
}
```

### Logic Constraints
- Webhook requests include `X-Signature` header for payload verification
- Signature is HMAC-SHA256 of the raw request body using your webhook secret
- Requests timeout after 30 seconds; implement async processing for long tasks
- Failed deliveries retry with exponential backoff (1min, 5min, 30min, 2hr)
```

### 11.2 Webhook Registration

Document the capability for registering webhook endpoints:

```markdown
## Capability: Register Webhook

~~~meta
id: webhooks.register
transport: HTTP POST /webhooks
~~~

### Input
```typescript
interface RegisterWebhookRequest {
  url: string;         // HTTPS endpoint to receive events
  events: string[];     // Event types to subscribe to
  secret?: string;      // Optional; generated if not provided
}
```
```

---

## 12. Envelopes

Message-oriented protocols typically wrap all messages in a standardized envelope that carries metadata, identity, tracing, and the payload. In HTTP APIs, this metadata lives in headers and status codes. In message protocols, it's part of the message body itself.

### 12.1 Envelope Structure

Use the `## Envelope:` heading to define the wire format. Place it before capabilities, after Global Types:

```markdown
## Envelope: AgentMesh Message

~~~meta
id: mesh.envelope
version: 0.1.0
~~~

### Intention

Every message on the mesh—regardless of type—is wrapped in this envelope.
The SDK constructs envelopes automatically, but understanding the structure
is essential for debugging and reading logs.

### Schema

```typescript
interface Envelope {
  v: string;              // protocol version, e.g. "0.1.0"
  id: string;             // unique message ID (UUID v7)
  type: "register" | "discover" | "request" | "respond" | "emit";
  ts: ISO8601;            // when the message was created
  from: string;           // sender's agent ID
  to?: string;            // recipient agent ID (omit for events)
  task_id?: string;       // which task this belongs to
  in_reply_to?: string;   // ID of the message being replied to
  context_id?: string;    // groups related tasks into a session
  trace: {
    trace_id: string;     // distributed trace ID
    span_id: string;      // this operation's span
    parent_span_id?: string;
  };
  payload?: unknown;      // capability-specific content
  artifacts?: Artifact[];  // file attachments or deliverables
  error?: {
    code: number;
    message: string;
    retryable: boolean;
  };
  meta?: Record<string, unknown>;
}
```

### Logic Constraints

- The `from` field is trustworthy—the transport layer verifies sender identity
- The `type` field determines which capability schema applies to `payload`
- The `trace` field must always be present—create new traces for top-level operations
- `artifacts` separates deliverables from conversational messages in `payload`
```

### 12.2 Envelope and Capability Composition

When a document defines an Envelope and capabilities use `MSG` or `SUB` transport, the Capability's **Input** and **Output** schemas describe the contents of the envelope's `payload` field—not the full wire message.

This means an LLM generating code should:
1. Construct the envelope (identity, tracing, type)
2. Place the capability's Input data into the `payload` field
3. Send the complete envelope over the message bus
4. On receipt, extract the `payload` and parse it according to the capability's Output schema

---

## 13. Lifecycles

Many systems have stateful resources whose lifecycle spans multiple interactions. A task is created, moves through states, and eventually completes or fails. MAPI's Lifecycle section makes these state machines explicit and structured, rather than buried in prose.

### 13.1 Lifecycle Structure

Use the `## Lifecycle:` heading with a `~~~states` fenced block:

```markdown
## Lifecycle: Name

~~~states
[state] -> [state]: description
[state] -> [state]: description [optional.capability.id]
~~~
```

The `~~~states` block defines valid transitions. Each line is:
- **Source state** → **Target state**: **Description** and optionally a **capability ID** in brackets that triggers the transition

The `*` wildcard means "from any non-terminal state":

```
* -> canceled: Either party cancels
```

### 13.2 States Table

After the `~~~states` block, include a States table documenting each state:

| State | Terminal | Description |
|-------|----------|-------------|
| `submitted` | no | Task received |
| `completed` | yes | Task finished successfully |

Terminal states cannot transition to any other state.

### 13.3 Example: Task Lifecycle

```markdown
## Lifecycle: Task

~~~states
submitted -> working: Agent begins processing [mesh.task.accept]
working -> completed: Agent finishes successfully [mesh.task.respond]
working -> failed: Agent encounters an error [mesh.task.respond]
working -> input_required: Agent needs more info [mesh.task.respond]
working -> auth_required: Agent needs authorization [mesh.task.respond]
input_required -> working: Requester provides input [mesh.task.input]
auth_required -> working: Requester provides auth [mesh.task.auth]
* -> canceled: Either party cancels the task [mesh.task.cancel]
~~~

### Intention

A Task is created when one agent sends a `request` to another. It tracks
the work from submission through completion (or failure). Tasks are
identified by `task_id` and their current state can be checked at any time.

Use `mesh.task.create` to initiate a task, and subscribe to
`mesh.task.{task_id}.update` to receive state transitions in real time.

### States

| State | Terminal | Description |
|-------|----------|-------------|
| `submitted` | no | Task received, agent hasn't started yet |
| `working` | no | Agent is actively processing |
| `input_required` | no | Agent needs more information from the requester |
| `auth_required` | no | Agent needs permission or credentials to proceed |
| `completed` | yes | Task finished successfully; result in response payload |
| `failed` | yes | Task failed; error details in the error field |
| `canceled` | yes | Task was canceled by either party |

### Logic Constraints

- Terminal states cannot transition to any other state
- `* -> canceled` means cancellation is valid from any non-terminal state
- To retry a failed task, create a new task—link them via `context_id`
- The `task_id` is immutable for the life of the task

### Schema

```typescript
interface Task {
  task_id: string;
  state: "submitted" | "working" | "input_required" | "auth_required"
       | "completed" | "failed" | "canceled";
  created_at: ISO8601;
  updated_at: ISO8601;
  requester_id: string;
  responder_id: string;
  context_id?: string;    // links related tasks
}
```
```

---

## 14. Internal Tools

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

## 15. Collections and File Organization

Large APIs can be split across multiple files using a collection manifest.

### 15.1 Collection Manifest

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

## 16. Conversion from OpenAPI/AsyncAPI

MAPI documents can be generated from existing OpenAPI or AsyncAPI specifications.

### 16.1 OpenAPI Mapping

| OpenAPI | MAPI |
|---------|------|
| Operation (path + method) | Capability |
| operationId | Capability id |
| summary + description | Intention |
| requestBody schema | Input interface |
| response schema | Output interface |
| components/schemas | Global Types |

---

## 17. Progressive Disclosure

MAPI supports "reference cards"—focused, task-specific subsets of the full specification designed to minimize token usage when working with LLMs.

### 17.1 Reference Card Types

- **Author Card:** For LLMs writing MAPI specs
- **Consumer Card:** For LLMs calling APIs
- **Conversion Card:** For converting between formats
- **Validation Card:** For validating MAPI documents

### 17.2 Disclosure Document

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

## 18. Complete Examples

See the `/examples` directory for complete MAPI specifications including:

- Simple REST API (task management)
- Streaming API (chat completion)
- WebSocket API (real-time collaboration)
- Mixed transport API (HTTP + WebSocket)
- Message-oriented API (agent mesh)

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
| Webhook (outbound) | `WEBHOOK METHOD {callback_url}` | `WEBHOOK POST {callback_url}` |
| Message bus | `MSG subject.pattern` | `MSG mesh.registry.register` |
| Message bus (parameterized) | `MSG subject.{param}.pattern` | `MSG mesh.agent.{agent_id}.inbox` |
| Message bus (request/reply) | `MSG subject.pattern (reply)` | `MSG mesh.registry.discover (reply)` |
| Subscribe | `SUB subject.pattern` | `SUB mesh.event.{topic}` |
| Subscribe (wildcard) | `SUB subject.>` | `SUB mesh.event.>` |
| Internal/Client-side | `INTERNAL` | `INTERNAL` |

---

## Appendix C: Standard Errors

When `errors: standard` is specified, these error categories follow conventional semantics:

**HTTP transports** use status codes:

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

**Message bus transports** (MSG/SUB) use structured error objects with numeric codes. The same categories apply—a missing resource is still "not found," invalid input is still "bad request"—but the error is carried in the envelope's `error` field rather than an HTTP status code.

LLMs and developers understand these without explicit documentation. Only document errors with capability-specific semantics.

---

## Appendix D: Messaging Metadata Reference

These metadata fields apply to capabilities using `MSG` or `SUB` transports. They can also be set at the document level as defaults.

### Delivery Guarantees

| Value | Description |
|-------|-------------|
| `at_most_once` | Fire-and-forget. Message may be lost but is never duplicated. Default. |
| `at_least_once` | Message will be delivered but may arrive more than once. Handlers should be idempotent. |
| `exactly_once` | Message delivered exactly once. Requires broker support (e.g., NATS JetStream, Kafka transactions). |

### Ordering Guarantees

| Value | Description |
|-------|-------------|
| `unordered` | No ordering guarantee across messages. Default. |
| `ordered` | Messages arrive in publish order within the subject. |
| `partition_ordered` | Ordered within a partition key, unordered across partitions. |

### Consumer Groups

When `consumer_group` is set to a group name, only one member of the group receives each message (load balancing). Without it, all subscribers receive every message (fan-out).

```yaml
~~~meta
id: tasks.process
transport: SUB mesh.tasks.>
consumer_group: task-workers
delivery: at_least_once
ordering: partition_ordered
~~~
```

In this example, incoming tasks are distributed across all agents in the `task-workers` group, delivered at least once, and ordered within each task's partition.

---

*— End of Specification —*
