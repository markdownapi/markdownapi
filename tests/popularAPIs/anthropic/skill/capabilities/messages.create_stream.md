# Capability: Create Message (Streaming)

~~~meta
id: messages.create_stream
transport: HTTP POST /v1/messages (SSE)
auth: required
idempotent: false
~~~

## Intention

Stream a response from Claude in real-time using Server-Sent Events. Use this when you want to display partial responses as they're generated, improving perceived latency for long responses.

## Auth Intention

Same as messages.create—requires `x-api-key` header with valid API key.

## Logic Constraints

- Events arrive in order: `message_start` → content blocks → `message_stop`
