# Capability: Retrieve Block Children

~~~meta
id: blocks.children.list
transport: HTTP GET /v1/blocks/{id}/children
auth: required
idempotent: true
~~~

## Intention

List all child blocks of a page or block to read its content. Use this when you have a page ID and want to see what's inside. Use `search` only to *find* a page by name; use this to *read* a page's content. For nested content (blocks with `has_children: true`), call this recursively.

## Logic Constraints

- `page_size` maximum is 100
