# Capability: Redeliver Webhook

~~~meta
id: repos.hooks.deliveries.redeliver
transport: HTTP POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts
auth: required
idempotent: false
~~~

## Intention

Retry a failed webhook delivery. Use this after fixing the receiving endpoint or network issues.
