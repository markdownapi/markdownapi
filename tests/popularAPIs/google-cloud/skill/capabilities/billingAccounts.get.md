# Capability: Get Billing Account

~~~meta
id: billingAccounts.get
transport: HTTP GET /v1/{name}
auth: required
idempotent: true
~~~

## Intention

Retrieve details about a specific billing account. Use this to check if an account is open, get its display name, or verify it exists before associating it with a project.

## Auth Intention

Requires the `billing.accounts.get` permission on the specific billing account. Typically granted via Billing Account Viewer role.

## Logic Constraints

- Returns 404 if account doesn't exist or caller lacks permission
