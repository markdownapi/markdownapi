# Capability: Create Billing Subaccount

~~~meta
id: billingAccounts.create
transport: HTTP POST /v1/billingAccounts
auth: required
idempotent: false
~~~

## Intention

Create a billing subaccount under a reseller parent account. This is for Google Cloud resellers only—most users should create billing accounts through the Cloud Console instead.

## Auth Intention

Requires `billing.accounts.update` permission on the parent account (the master billing account). The parent account must be provisioned as a reseller account.

## Logic Constraints

- Fails if parent account is not a reseller account

## Errors

- `FAILED_PRECONDITION`: Parent account not provisioned as reseller
