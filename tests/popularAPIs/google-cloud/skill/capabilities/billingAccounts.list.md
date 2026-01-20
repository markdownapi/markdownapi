# Capability: List Billing Accounts

~~~meta
id: billingAccounts.list
transport: HTTP GET /v1/billingAccounts
auth: required
idempotent: true
~~~

## Intention

List all billing accounts the authenticated user has permission to view. Use this to discover available billing accounts before associating them with projects, or to audit which accounts exist in your organization.

## Auth Intention

Requires OAuth 2.0 with one of: `cloud-billing`, `cloud-billing.readonly`, or `cloud-platform` scope. The user must have the `billing.accounts.list` IAM permission, typically granted via the Billing Account Viewer or Administrator role.

## Logic Constraints

- Maximum `pageSize` is 100 (also the default)
