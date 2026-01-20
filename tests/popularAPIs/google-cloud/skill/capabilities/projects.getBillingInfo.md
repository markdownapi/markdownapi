# Capability: Get Project Billing Info

~~~meta
id: projects.getBillingInfo
transport: HTTP GET /v1/{name}/billingInfo
auth: required
idempotent: true
~~~

## Intention

Get the billing information for a specific project. Use this to check which billing account a project uses, or whether billing is enabled.

## Auth Intention

Requires permission to view the project (via `resourcemanager.projects.get` or similar). Does not require billing-specific permissions.

## Logic Constraints

- The `name` must use the `projects/` prefix
