# Capability: Delete Block

~~~meta
id: blocks.delete
transport: HTTP DELETE /v1/blocks/{id}
auth: required
idempotent: true
~~~

## Intention

Delete a block by ID (move to trash). This also deletes all children of the block. For positional deletion (e.g., "delete the last paragraph"), first use `blocks.children.list` to find the target block's ID. Equivalent to setting `archived: true` via update.
