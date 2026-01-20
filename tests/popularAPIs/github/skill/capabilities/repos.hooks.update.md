# Capability: Update Repository Webhook

~~~meta
id: repos.hooks.update
transport: HTTP PATCH /repos/{owner}/{repo}/hooks/{hook_id}
auth: required
idempotent: true
~~~

## Intention

Update webhook configuration including URL, events, and active status. Use this to change delivery settings or temporarily disable a webhook.

## Logic Constraints

- `events` replaces all events; use `add_events`/`remove_events` for incremental changes
