# Capability: List Comments

~~~meta
id: comments.list
transport: HTTP GET /v1/comments
auth: required
idempotent: true
~~~

## Intention

Retrieve comments from a page or block. Use this to read feedback, review existing discussions, or sync comments to external systems.

## Logic Constraints

- `block_id` can be a page ID or block ID
