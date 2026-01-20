# Capability: Set IAM Policy

~~~meta
id: billingAccounts.setIamPolicy
transport: HTTP POST /v1/{resource}:setIamPolicy
auth: required
idempotent: false
~~~

## Intention

Set the IAM access control policy for a billing account, replacing any existing policy. Use this to grant or revoke access to billing management.

## Auth Intention

Requires `billing.accounts.setIamPolicy` permission, typically granted via Billing Account Administrator role.

## Logic Constraints

- This is a replace operation, not a patch—include all desired bindings
