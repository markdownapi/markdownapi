# Capability: List Webhook Deliveries

~~~meta
id: repos.hooks.deliveries.list
transport: HTTP GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries
auth: required
idempotent: true
~~~

## Intention

List recent webhook delivery attempts. Use this to debug failed deliveries or verify webhooks are working.

## Logic Constraints

- Deliveries retained for 30 days
