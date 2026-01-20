# Capability: List Users

~~~meta
id: users.list
transport: HTTP GET /v1/users
auth: required
idempotent: true
~~~

## Intention

List all users in the workspace. Use this to discover user IDs for people properties or to audit workspace membership.

## Logic Constraints

- Requires workspace-level integration (not page-level)
