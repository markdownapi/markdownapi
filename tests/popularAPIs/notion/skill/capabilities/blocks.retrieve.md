# Capability: Retrieve Block

~~~meta
id: blocks.retrieve
transport: HTTP GET /v1/blocks/{id}
auth: required
idempotent: true
~~~

## Intention

Retrieve a single block by its ID. Use this when you have a block ID and need its details or to check if it has children. If you need to find a block within a page, use `blocks.children.list` to enumerate blocks first.
