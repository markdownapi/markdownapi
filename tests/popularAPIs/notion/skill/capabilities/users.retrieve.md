# Capability: Retrieve User

~~~meta
id: users.retrieve
transport: HTTP GET /v1/users/{id}
auth: required
idempotent: true
~~~

## Intention

Retrieve a user by their UUID. Use this when you already have a user ID from a property value or audit log. If you only have an email or name, use `users.list` to find the user's ID first.
