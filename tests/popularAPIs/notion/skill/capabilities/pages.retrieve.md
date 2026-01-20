# Capability: Retrieve Page

~~~meta
id: pages.retrieve
transport: HTTP GET /v1/pages/{id}
auth: required
idempotent: true
~~~

## Intention

Retrieve a page's properties and metadata. Use this to read page data. For page content (blocks), use the retrieve block children endpoint separately.

## Logic Constraints

- Returns 404 if page doesn't exist or isn't shared
