# Capability: Test IAM Permissions

~~~meta
id: billingAccounts.testIamPermissions
transport: HTTP POST /v1/{resource}:testIamPermissions
auth: required
idempotent: true
~~~

## Intention

Check which permissions the caller has on a billing account. Use this to determine what operations a user can perform before attempting them.

## Auth Intention

Requires any valid billing scope. Returns only permissions the caller actually has.

## Logic Constraints

- Wildcards (like `billing.*`) are not allowed in permission names
