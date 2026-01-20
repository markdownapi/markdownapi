# Capability: Retrieve Database

~~~meta
id: databases.retrieve
transport: HTTP GET /v1/databases/{id}
auth: required
idempotent: true
~~~

## Intention

Retrieve a database's schema and metadata. Use this to understand a database's structure before querying it or creating pages in it. Returns the database properties (columns) and their configurations.

## Logic Constraints

- Integration must have access to the database
