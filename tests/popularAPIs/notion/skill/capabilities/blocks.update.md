# Capability: Update Block

~~~meta
id: blocks.update
transport: HTTP PATCH /v1/blocks/{id}
auth: required
idempotent: true
~~~

## Intention

Update a block's content or archive it. Use this to modify existing page content. Different block types have different updatable fields.

## Logic Constraints

- Cannot change a block's type
