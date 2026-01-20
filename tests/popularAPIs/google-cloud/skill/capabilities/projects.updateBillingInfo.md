# Capability: Update Project Billing Info

~~~meta
id: projects.updateBillingInfo
transport: HTTP PUT /v1/{name}/billingInfo
auth: required
idempotent: true
~~~

## Intention

Associate a project with a billing account, change the billing account, or disable billing. To enable billing, set `billingAccountName` to a valid account. To disable billing, set it to empty string.

## Auth Intention

Requires ownership of both the project and the billing account. Specifically needs `resourcemanager.projects.updateBillingInfo` on the project and `billing.resourceAssociations.create` on the billing account.

## Logic Constraints

- Setting `billingAccountName` to empty disables billing

## Errors

- `PERMISSION_DENIED`: Lacks required permissions on project or billing account
