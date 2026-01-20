# Capability: Append Block Children

~~~meta
id: blocks.children.append
transport: HTTP PATCH /v1/blocks/{id}/children
auth: required
idempotent: false
~~~

## Intention

Add new blocks to a page or as children of an existing block. Use this to add content to pages. Blocks are appended after existing children.

## Logic Constraints

- Maximum 100 blocks per request
