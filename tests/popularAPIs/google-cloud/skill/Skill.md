# Google Cloud Billing API

The Google Cloud Billing API allows developers to manage billing accounts and view pricing information for Google Cloud Platform projects programmatically. Use it to list billing accounts, associate projects with billing, and query service pricing.

~~~meta
version: v1
base_url: https://cloudbilling.googleapis.com
auth: oauth2
~~~

## Common Dependencies

| File | Description |
|------|-------------|
| common/auth.md | Authentication setup |

## Capabilities

| ID | Intent Keywords | File | Dependencies |
|----|-----------------|------|--------------|
| billingAccounts.list | billingAccounts, list, all | capabilities/billingAccounts.list.md | auth |
| billingAccounts.get | billingAccounts, get, retrieve, details | capabilities/billingAccounts.get.md | auth |
| billingAccounts.create | billingAccounts, create, billing | capabilities/billingAccounts.create.md | auth |
| billingAccounts.patch | billingAccounts, patch, update, billing | capabilities/billingAccounts.patch.md | auth |
| billingAccounts.projects.list | billingAccounts, projects, list, find, all | capabilities/billingAccounts.projects.list.md | auth |
| projects.getBillingInfo | projects, getBillingInfo, get, enable, the | capabilities/projects.getBillingInfo.md | auth |
| projects.updateBillingInfo | projects, updateBillingInfo, enable, disable | capabilities/projects.updateBillingInfo.md | auth |
| services.list | services, list, query, all | capabilities/services.list.md | auth |
| services.skus.list | services, skus, list, all | capabilities/services.skus.list.md | auth |
| billingAccounts.getIamPolicy | billingAccounts, getIamPolicy, get, the | capabilities/billingAccounts.getIamPolicy.md | auth |
| billingAccounts.setIamPolicy | billingAccounts, setIamPolicy | capabilities/billingAccounts.setIamPolicy.md | auth |
| billingAccounts.testIamPermissions | billingAccounts, testIamPermissions | capabilities/billingAccounts.testIamPermissions.md | auth |
