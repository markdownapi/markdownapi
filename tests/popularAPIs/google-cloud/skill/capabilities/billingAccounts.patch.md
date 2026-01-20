# Capability: Update Billing Account

~~~meta
id: billingAccounts.patch
transport: HTTP PATCH /v1/{name}
auth: required
idempotent: true
~~~

## Intention

Update a billing account's display name. Currently this is the only field that can be modified via the API.

## Auth Intention

Requires `billing.accounts.update` permission, typically granted via Billing Account Administrator role.

## Logic Constraints

- Only `displayName` can be updated
