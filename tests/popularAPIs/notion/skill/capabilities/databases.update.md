# Capability: Update Database

~~~meta
id: databases.update
transport: HTTP PATCH /v1/databases/{id}
auth: required
idempotent: true
~~~

## Intention

Update a database's title, description, or properties. Use this to add new columns, rename existing ones, or modify property configurations. Cannot change a property's type.

## Logic Constraints

- Cannot change a property's type (must delete and recreate)
