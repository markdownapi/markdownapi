# Anthropic Claude API

The Anthropic API provides access to Claude, a family of large language models optimized for helpfulness, harmlessness, and honesty. The Messages API is the primary interface for conversational interactions.

~~~meta
version: 2024-01
base_url: https://api.anthropic.com
auth: api_key
auth_header: x-api-key
content_type: application/json
errors: standard
~~~

## Global Types

```typescript
type Model =
  | "claude-sonnet-4-20250514"
  | "claude-opus-4-20250514"
  | "claude-3-5-sonnet-20241022"
  | "claude-3-5-haiku-20241022"
  | "claude-3-opus-20240229"
  | "claude-3-haiku-20240307";

type Role = "user" | "assistant";

type StopReason = "end_turn" | "max_tokens" | "stop_sequence" | "tool_use";

interface TextBlock {
  type: "text";
  text: string;
}

interface ImageSource {
  type: "base64";
  media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  data: string;  // base64-encoded image data
}

interface ImageBlock {
  type: "image";
  source: ImageSource;
}

interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface ToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string | ContentBlock[];
  is_error?: boolean;
}

type ContentBlock = TextBlock | ImageBlock | ToolUseBlock | ToolResultBlock;

interface Message {
  role: Role;
  content: string | ContentBlock[];
}

interface Tool {
  name: string;           // 1-64 chars, matches ^[a-zA-Z0-9_-]+$
  description: string;    // What the tool does, when to use it
  input_schema: object;   // JSON Schema for tool parameters
}

interface Usage {
  input_tokens: number;
  output_tokens: number;
}
```

---

## Capability: Create Message

~~~meta
id: messages.create
transport: HTTP POST /v1/messages
auth: required
idempotent: false
~~~

### Intention

Send a conversation to Claude and receive a response. This is the primary endpoint for all Claude interactions. The model processes the full conversation history provided in the messages array, so include all relevant context.

Use this for single-turn questions, multi-turn conversations, tool use, and vision tasks (by including images in message content).

### Auth Intention

Requires an API key passed in the `x-api-key` header. Obtain keys from the Anthropic Console at console.anthropic.com. Keys are scoped to a workspace and subject to rate limits based on your usage tier.

### Input

```typescript
interface CreateMessageRequest {
  model: Model;
  messages: Message[];           // 1+ messages, alternating user/assistant
  max_tokens: number;            // 1-200000, required
  system?: string;               // System prompt for context/personality
  temperature?: number;          // 0.0-1.0, default 1.0
  top_p?: number;                // 0.0-1.0, nucleus sampling
  top_k?: number;                // 1+, top-k sampling
  stop_sequences?: string[];     // up to 8191 items
  stream?: boolean;              // default false
  tools?: Tool[];                // available tools for the model
  tool_choice?: { type: "auto" } | { type: "any" } | { type: "tool"; name: string };
  metadata?: {
    user_id?: string;            // end-user ID for abuse detection
  };
}
```

### Output

```typescript
interface CreateMessageResponse {
  id: string;                    // format: msg_*
  type: "message";
  role: "assistant";
  content: ContentBlock[];       // response content blocks
  model: Model;
  stop_reason: StopReason;
  stop_sequence?: string;        // if stopped by stop_sequence
  usage: Usage;
}
```

### Logic Constraints

- Messages must alternate between `user` and `assistant` roles
- First message must have `role: "user"`
- `max_tokens` must not exceed the model's output limit
- Total tokens (input + max_tokens) must fit within model context window
- When `tools` is provided, model may respond with `tool_use` content blocks
- If model returns `tool_use`, next message should include `tool_result`
- Images only supported in `user` messages, not `assistant`
- `top_p` and `top_k` should not both be set; use one or the other

### Errors

- `overloaded` (529): API is temporarily overloaded. Retry with exponential backoff.
- `invalid_request_error` (400): Malformed request or constraint violation.
- `rate_limit_error` (429): Too many requests. Check `retry-after` header.

### Example

```json
// Request
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "messages": [
    {"role": "user", "content": "What is the capital of France?"}
  ]
}

// Response
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [{"type": "text", "text": "The capital of France is Paris."}],
  "model": "claude-sonnet-4-20250514",
  "stop_reason": "end_turn",
  "usage": {"input_tokens": 14, "output_tokens": 10}
}
```

---

## Capability: Create Message (Streaming)

~~~meta
id: messages.create_stream
transport: HTTP POST /v1/messages (SSE)
auth: required
idempotent: false
~~~

### Intention

Stream a response from Claude in real-time using Server-Sent Events. Use this when you want to display partial responses as they're generated, improving perceived latency for long responses.

Set `stream: true` in the request body. The connection stays open and emits events as the response is generated.

### Auth Intention

Same as messages.create—requires `x-api-key` header with valid API key.

### Input

Same as `messages.create` with `stream: true` required.

### Output

```typescript
type StreamEvent =
  | { type: "message_start"; message: CreateMessageResponse }
  | { type: "content_block_start"; index: number; content_block: ContentBlock }
  | { type: "content_block_delta"; index: number; delta: TextDelta | InputJsonDelta }
  | { type: "content_block_stop"; index: number }
  | { type: "message_delta"; delta: { stop_reason: StopReason }; usage: { output_tokens: number } }
  | { type: "message_stop" }
  | { type: "ping" }
  | { type: "error"; error: { type: string; message: string } };

interface TextDelta {
  type: "text_delta";
  text: string;
}

interface InputJsonDelta {
  type: "input_json_delta";
  partial_json: string;
}
```

### Logic Constraints

- Events arrive in order: `message_start` → content blocks → `message_stop`
- Concatenate all `text_delta` events to reconstruct full response
- `ping` events sent periodically to keep connection alive
- On `error` event, connection closes; implement reconnection logic
- Client should handle connection drops gracefully

---

## Capability: Count Tokens

~~~meta
id: messages.count_tokens
transport: HTTP POST /v1/messages/count_tokens
auth: required
idempotent: true
~~~

### Intention

Count the number of tokens in a message payload without actually running the model. Use this to check if your request fits within context limits before sending, or for cost estimation.

### Input

```typescript
interface CountTokensRequest {
  model: Model;
  messages: Message[];
  system?: string;
  tools?: Tool[];
}
```

### Output

```typescript
interface CountTokensResponse {
  input_tokens: number;
}
```

### Logic Constraints

- Does not consume rate limit quota (separate from message creation)
- Token count may vary slightly from actual usage due to special tokens

---

*— End of Specification —*
