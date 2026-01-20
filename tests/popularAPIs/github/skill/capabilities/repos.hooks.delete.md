# Capability: Delete Repository Webhook

~~~meta
id: repos.hooks.delete
transport: HTTP DELETE /repos/{owner}/{repo}/hooks/{hook_id}
auth: required
idempotent: true
~~~

## Intention

Permanently delete a webhook. This stops all deliveries and cannot be undone.
