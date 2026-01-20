# Capability: Create Message

~~~meta
id: messages.create
transport: HTTP POST /v1/messages
auth: required
idempotent: false
~~~

## Intention

Send a conversation to Claude and receive a response. This is the primary endpoint for all Claude interactions. The model processes the full conversation history provided in the messages array, so include all relevant context.

## Auth Intention

Requires an API key passed in the `x-api-key` header. Obtain keys from the Anthropic Console at console.anthropic.com. Keys are scoped to a workspace and subject to rate limits based on your usage tier.

## Logic Constraints

- Messages must alternate between `user` and `assistant` roles

## Errors

- `overloaded` (529): API is temporarily overloaded. Retry with exponential backoff.

## Example

```json
