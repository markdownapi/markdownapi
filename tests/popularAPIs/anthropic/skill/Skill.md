# Anthropic Claude API

The Anthropic API provides access to Claude, a family of large language models optimized for helpfulness, harmlessness, and honesty. The Messages API is the primary interface for conversational interactions.

~~~meta
version: 2024-01
base_url: https://api.anthropic.com
auth: api_key
~~~

## Common Dependencies

| File | Description |
|------|-------------|
| common/auth.md | Authentication setup |

## Capabilities

| ID | Intent Keywords | File | Dependencies |
|----|-----------------|------|--------------|
| messages.create | messages, create, send, conversation | capabilities/messages.create.md | auth |
| messages.create_stream | messages, create_stream | capabilities/messages.create_stream.md | auth |
| messages.count_tokens | messages, count_tokens, send | capabilities/messages.count_tokens.md | auth |
