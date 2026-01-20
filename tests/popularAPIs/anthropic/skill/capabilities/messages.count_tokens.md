# Capability: Count Tokens

~~~meta
id: messages.count_tokens
transport: HTTP POST /v1/messages/count_tokens
auth: required
idempotent: true
~~~

## Intention

Count the number of tokens in a message payload without actually running the model. Use this to check if your request fits within context limits before sending, or for cost estimation.

## Logic Constraints

- Does not consume rate limit quota (separate from message creation)
