# Capability: Get IAM Policy

~~~meta
id: billingAccounts.getIamPolicy
transport: HTTP GET /v1/{resource}:getIamPolicy
auth: required
idempotent: true
~~~

## Intention

Get the IAM access control policy for a billing account. Use this to audit who has access to view or manage billing.

## Auth Intention

Requires `billing.accounts.getIamPolicy` permission, typically granted via Billing Account Viewer role.

## Logic Constraints

- Request version 3 if you need to see conditional bindings
