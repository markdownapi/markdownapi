# Capability: Query Database

~~~meta
id: databases.query
transport: HTTP POST /v1/databases/{id}/query
auth: required
idempotent: true
~~~

## Intention

Query a database to retrieve pages that match filter criteria. This is the primary way to read structured data from Notion. Returns pages (rows) with their property values.

## Logic Constraints

- `page_size` maximum is 100

## Example

```json
