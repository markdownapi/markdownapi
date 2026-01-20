# Capability: List SKUs

~~~meta
id: services.skus.list
transport: HTTP GET /v1/{parent}/skus
auth: required
idempotent: true
~~~

## Intention

List all publicly available SKUs for a service, including pricing information. Use this for cost estimation, building pricing calculators, or monitoring price changes.

## Auth Intention

Requires OAuth 2.0 with billing scope. Any authenticated user can list SKUs.

## Logic Constraints

- Default `pageSize` is 5000
