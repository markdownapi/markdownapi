# Capability: Update Page

~~~meta
id: pages.update
transport: HTTP PATCH /v1/pages/{id}
auth: required
idempotent: true
~~~

## Intention

Update a page's properties, icon, cover, or archived status. Use this to modify page data. To update page content (blocks), use the block update/append endpoints.

## Logic Constraints

- Only include properties you want to change
