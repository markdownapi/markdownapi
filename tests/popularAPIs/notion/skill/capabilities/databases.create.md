# Capability: Create Database

~~~meta
id: databases.create
transport: HTTP POST /v1/databases
auth: required
idempotent: false
~~~

## Intention

Create a new database as a child of an existing page. The database will appear as an inline table in the parent page. Define the schema (properties/columns) during creation.

## Logic Constraints

- Parent page must be shared with the integration
