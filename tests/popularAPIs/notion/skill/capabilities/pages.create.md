# Capability: Create Page

~~~meta
id: pages.create
transport: HTTP POST /v1/pages
auth: required
idempotent: false
~~~

## Intention

Create a new page in a database or as a child of another page. When creating in a database, properties must match the database schema. Optionally include initial content as blocks.

## Logic Constraints

- Database pages must include all required properties

## Example

```json
