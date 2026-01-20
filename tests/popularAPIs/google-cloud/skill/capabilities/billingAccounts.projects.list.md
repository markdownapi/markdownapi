# Capability: List Projects for Billing Account

~~~meta
id: billingAccounts.projects.list
transport: HTTP GET /v1/{name}/projects
auth: required
idempotent: true
~~~

## Intention

List all projects associated with a billing account. Use this to audit which projects are billing to a specific account, or to find orphaned projects.

## Auth Intention

Requires `billing.resourceAssociations.list` permission, typically granted via Billing Account Viewer role.

## Logic Constraints

- Maximum `pageSize` is 100 (also the default)
