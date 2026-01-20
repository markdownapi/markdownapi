# Capability: List Services

~~~meta
id: services.list
transport: HTTP GET /v1/services
auth: required
idempotent: true
~~~

## Intention

List all publicly available Google Cloud services. Use this to discover service IDs before querying their SKUs for pricing information.

## Auth Intention

Requires OAuth 2.0 with billing scope. Any authenticated user can list services.

## Logic Constraints

- Default `pageSize` is 5000
