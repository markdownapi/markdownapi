# Capability: Search

~~~meta
id: search
transport: HTTP POST /v1/search
auth: required
idempotent: true
~~~

## Intention

Search all pages and databases the integration has access to. Use this as the primary discovery mechanism when you don't know specific page or database IDs. Results include pages and databases whose titles match the query.

## Auth Intention

Requires an internal integration token. The integration must be added to the pages/databases you want to search. Create integrations at notion.com/my-integrations.

## Logic Constraints

- Only returns content the integration has been explicitly shared with

## Example

```json
