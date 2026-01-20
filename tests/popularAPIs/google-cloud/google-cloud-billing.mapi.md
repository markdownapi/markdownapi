# Google Cloud Billing API

The Google Cloud Billing API allows developers to manage billing accounts and view pricing information for Google Cloud Platform projects programmatically. Use it to list billing accounts, associate projects with billing, and query service pricing.

~~~meta
version: v1
base_url: https://cloudbilling.googleapis.com
auth: oauth2
auth_scopes:
  - https://www.googleapis.com/auth/cloud-billing
  - https://www.googleapis.com/auth/cloud-billing.readonly
  - https://www.googleapis.com/auth/cloud-platform
content_type: application/json
errors: standard
~~~

## Global Types

```typescript
interface BillingAccount {
  name: string;              // Output only. Format: billingAccounts/{billing_account_id}
  displayName: string;       // Human-readable name shown in Console
  open: boolean;             // Output only. True if account accepts charges
  masterBillingAccount?: string;  // Parent account if this is a subaccount
}

interface ProjectBillingInfo {
  name: string;              // Format: projects/{project_id}/billingInfo
  projectId: string;         // The project ID (e.g., "tokyo-rain-123")
  billingAccountName: string;  // Associated billing account resource name
  billingEnabled: boolean;   // True if project can use paid services
}

interface Service {
  name: string;              // Format: services/{service_id}
  serviceId: string;         // ID like "DA34-426B-A397"
  displayName: string;       // Human-readable service name
  businessEntityName: string;  // e.g., "businessEntities/GCP"
}

interface Sku {
  name: string;              // Format: services/{service_id}/skus/{sku_id}
  skuId: string;             // ID like "AA95-CD31-42FE"
  description: string;       // Human-readable description (max 256 chars)
  category: Category;
  serviceRegions: string[];  // Regions where SKU is offered
  pricingInfo: PricingInfo[];
  serviceProviderName: string;  // "Google" for first-party services
  geoTaxonomy: GeoTaxonomy;
}

interface Category {
  serviceDisplayName: string;  // Display name of parent service
  resourceFamily: string;      // "Compute", "Storage", "Network", etc.
  resourceGroup: string;       // "RAM", "GPU", "Prediction", etc.
  usageType: string;           // "OnDemand", "Preemptible", "Commit1Mo", etc.
}

interface PricingInfo {
  effectiveTime: string;       // ISO 8601 timestamp
  summary?: string;            // Human-readable summary (max 256 chars)
  pricingExpression: PricingExpression;
  aggregationInfo?: AggregationInfo;
  currencyConversionRate: number;  // USD to requested currency
}

interface PricingExpression {
  usageUnit: string;           // Short form: "GiBy", "h", etc.
  usageUnitDescription: string;  // Human form: "gibi byte", "hour"
  baseUnit: string;            // Unit used in exports: "By", "s"
  baseUnitDescription: string;
  baseUnitConversionFactor: number;
  displayQuantity: number;     // Recommended display multiplier
  tieredRates: TierRate[];
}

interface TierRate {
  startUsageAmount: number;    // Rate applies after this amount
  unitPrice: Money;
}

interface Money {
  currencyCode: string;        // ISO 4217 code (e.g., "USD")
  units: string;               // Whole units (as string for precision)
  nanos: number;               // Fractional units (10^-9)
}

interface AggregationInfo {
  aggregationLevel: "AGGREGATION_LEVEL_UNSPECIFIED" | "ACCOUNT" | "PROJECT";
  aggregationInterval: "AGGREGATION_INTERVAL_UNSPECIFIED" | "DAILY" | "MONTHLY";
  aggregationCount: number;
}

interface GeoTaxonomy {
  type: "TYPE_UNSPECIFIED" | "GLOBAL" | "REGIONAL" | "MULTI_REGIONAL";
  regions: string[];           // Empty for GLOBAL SKUs
}

interface Policy {
  version: number;             // 0, 1, or 3 (use 3 for conditions)
  bindings: Binding[];
  auditConfigs?: AuditConfig[];
  etag: string;                // Base64-encoded, for optimistic concurrency
}

interface Binding {
  role: string;                // e.g., "roles/billing.viewer"
  members: string[];           // user:, serviceAccount:, group:, domain:
  condition?: Expr;
}

interface Expr {
  expression: string;          // CEL expression
  title?: string;
  description?: string;
  location?: string;
}

interface AuditConfig {
  service: string;             // Service name or "allServices"
  auditLogConfigs: AuditLogConfig[];
}

interface AuditLogConfig {
  logType: "LOG_TYPE_UNSPECIFIED" | "ADMIN_READ" | "DATA_WRITE" | "DATA_READ";
  exemptedMembers?: string[];
}

interface PaginatedRequest {
  pageSize?: number;           // Max items per page
  pageToken?: string;          // Token from previous response
}

interface PaginatedResponse<T> {
  items: T[];
  nextPageToken?: string;      // Present if more results exist
}
```

---

## Capability: List Billing Accounts

~~~meta
id: billingAccounts.list
transport: HTTP GET /v1/billingAccounts
auth: required
idempotent: true
~~~

### Intention

List all billing accounts the authenticated user has permission to view. Use this to discover available billing accounts before associating them with projects, or to audit which accounts exist in your organization.

### Auth Intention

Requires OAuth 2.0 with one of: `cloud-billing`, `cloud-billing.readonly`, or `cloud-platform` scope. The user must have the `billing.accounts.list` IAM permission, typically granted via the Billing Account Viewer or Administrator role.

### Input

```typescript
interface ListBillingAccountsRequest extends PaginatedRequest {
  filter?: string;  // Filter for subaccounts: "master_billing_account=billingAccounts/012345-678901-ABCDEF"
}
```

### Output

```typescript
interface ListBillingAccountsResponse {
  billingAccounts: BillingAccount[];
  nextPageToken?: string;
}
```

### Logic Constraints

- Maximum `pageSize` is 100 (also the default)
- `filter` currently only supports filtering by `master_billing_account`
- Only returns accounts the caller has permission to view
- Closed accounts are included in results (check `open` field)

---

## Capability: Get Billing Account

~~~meta
id: billingAccounts.get
transport: HTTP GET /v1/{name}
auth: required
idempotent: true
~~~

### Intention

Retrieve details about a specific billing account. Use this to check if an account is open, get its display name, or verify it exists before associating it with a project.

### Auth Intention

Requires the `billing.accounts.get` permission on the specific billing account. Typically granted via Billing Account Viewer role.

### Input

```typescript
interface GetBillingAccountRequest {
  name: string;  // Required. Format: billingAccounts/012345-567890-ABCDEF
}
```

### Output

```typescript
type GetBillingAccountResponse = BillingAccount;
```

### Logic Constraints

- Returns 404 if account doesn't exist or caller lacks permission
- The `name` path parameter must include the `billingAccounts/` prefix

---

## Capability: Create Billing Subaccount

~~~meta
id: billingAccounts.create
transport: HTTP POST /v1/billingAccounts
auth: required
idempotent: false
~~~

### Intention

Create a billing subaccount under a reseller parent account. This is for Google Cloud resellers only—most users should create billing accounts through the Cloud Console instead.

### Auth Intention

Requires `billing.accounts.update` permission on the parent account (the master billing account). The parent account must be provisioned as a reseller account.

### Input

```typescript
interface CreateBillingAccountRequest {
  displayName: string;         // Required. Human-readable name
  masterBillingAccount: string;  // Required. Parent reseller account
}
```

### Output

```typescript
type CreateBillingAccountResponse = BillingAccount;
```

### Logic Constraints

- Fails if parent account is not a reseller account
- `displayName` is the only configurable field
- The returned account will have `open: true`

### Errors

- `FAILED_PRECONDITION`: Parent account not provisioned as reseller

---

## Capability: Update Billing Account

~~~meta
id: billingAccounts.patch
transport: HTTP PATCH /v1/{name}
auth: required
idempotent: true
~~~

### Intention

Update a billing account's display name. Currently this is the only field that can be modified via the API.

### Auth Intention

Requires `billing.accounts.update` permission, typically granted via Billing Account Administrator role.

### Input

```typescript
interface UpdateBillingAccountRequest {
  name: string;           // Required. Format: billingAccounts/012345-567890-ABCDEF
  displayName: string;    // The new display name
  updateMask?: string;    // Field mask; only "display_name" supported
}
```

### Output

```typescript
type UpdateBillingAccountResponse = BillingAccount;
```

### Logic Constraints

- Only `displayName` can be updated
- `updateMask` should be "display_name" if specified
- Cannot reopen a closed billing account via API

---

## Capability: List Projects for Billing Account

~~~meta
id: billingAccounts.projects.list
transport: HTTP GET /v1/{name}/projects
auth: required
idempotent: true
~~~

### Intention

List all projects associated with a billing account. Use this to audit which projects are billing to a specific account, or to find orphaned projects.

### Auth Intention

Requires `billing.resourceAssociations.list` permission, typically granted via Billing Account Viewer role.

### Input

```typescript
interface ListProjectsRequest extends PaginatedRequest {
  name: string;  // Required. Format: billingAccounts/012345-567890-ABCDEF
}
```

### Output

```typescript
interface ListProjectBillingInfoResponse {
  projectBillingInfo: ProjectBillingInfo[];
  nextPageToken?: string;
}
```

### Logic Constraints

- Maximum `pageSize` is 100 (also the default)
- Only lists projects where billing is enabled for this account

---

## Capability: Get Project Billing Info

~~~meta
id: projects.getBillingInfo
transport: HTTP GET /v1/{name}/billingInfo
auth: required
idempotent: true
~~~

### Intention

Get the billing information for a specific project. Use this to check which billing account a project uses, or whether billing is enabled.

### Auth Intention

Requires permission to view the project (via `resourcemanager.projects.get` or similar). Does not require billing-specific permissions.

### Input

```typescript
interface GetProjectBillingInfoRequest {
  name: string;  // Required. Format: projects/tokyo-rain-123
}
```

### Output

```typescript
type GetProjectBillingInfoResponse = ProjectBillingInfo;
```

### Logic Constraints

- The `name` must use the `projects/` prefix
- Returns `billingEnabled: false` if no billing account is associated

---

## Capability: Update Project Billing Info

~~~meta
id: projects.updateBillingInfo
transport: HTTP PUT /v1/{name}/billingInfo
auth: required
idempotent: true
~~~

### Intention

Associate a project with a billing account, change the billing account, or disable billing. To enable billing, set `billingAccountName` to a valid account. To disable billing, set it to empty string.

**Warning:** Disabling billing stops all paid services immediately. Unbilled charges go to the previous account.

### Auth Intention

Requires ownership of both the project and the billing account. Specifically needs `resourcemanager.projects.updateBillingInfo` on the project and `billing.resourceAssociations.create` on the billing account.

### Input

```typescript
interface UpdateProjectBillingInfoRequest {
  name: string;              // Required. Format: projects/tokyo-rain-123
  billingAccountName: string;  // Billing account to associate, or "" to disable
}
```

### Output

```typescript
type UpdateProjectBillingInfoResponse = ProjectBillingInfo;
```

### Logic Constraints

- Setting `billingAccountName` to empty disables billing
- Cannot associate with a closed billing account (services will stop)
- Pending charges may bill to new account even for past usage
- Requires ownership permissions on both project and billing account

### Errors

- `PERMISSION_DENIED`: Lacks required permissions on project or billing account
- `FAILED_PRECONDITION`: Billing account is closed

---

## Capability: List Services

~~~meta
id: services.list
transport: HTTP GET /v1/services
auth: required
idempotent: true
~~~

### Intention

List all publicly available Google Cloud services. Use this to discover service IDs before querying their SKUs for pricing information.

### Auth Intention

Requires OAuth 2.0 with billing scope. Any authenticated user can list services.

### Input

```typescript
interface ListServicesRequest extends PaginatedRequest {
  // pageSize defaults to 5000
}
```

### Output

```typescript
interface ListServicesResponse {
  services: Service[];
  nextPageToken?: string;
}
```

### Logic Constraints

- Default `pageSize` is 5000
- Returns all public services regardless of whether you use them

---

## Capability: List SKUs

~~~meta
id: services.skus.list
transport: HTTP GET /v1/{parent}/skus
auth: required
idempotent: true
~~~

### Intention

List all publicly available SKUs for a service, including pricing information. Use this for cost estimation, building pricing calculators, or monitoring price changes.

### Auth Intention

Requires OAuth 2.0 with billing scope. Any authenticated user can list SKUs.

### Input

```typescript
interface ListSkusRequest extends PaginatedRequest {
  parent: string;         // Required. Format: services/DA34-426B-A397
  currencyCode?: string;  // ISO 4217 code (default: USD)
  startTime?: string;     // ISO 8601, for historical pricing
  endTime?: string;       // ISO 8601, for historical pricing
}
```

### Output

```typescript
interface ListSkusResponse {
  skus: Sku[];
  nextPageToken?: string;
}
```

### Logic Constraints

- Default `pageSize` is 5000
- `currencyCode` affects price conversion but not availability
- Time range must be within a single calendar month (America/Los_Angeles timezone)
- Without time range, returns latest pricing (up to 12 hours old)
- Prices are list prices; actual charges may differ based on contracts

---

## Capability: Get IAM Policy

~~~meta
id: billingAccounts.getIamPolicy
transport: HTTP GET /v1/{resource}:getIamPolicy
auth: required
idempotent: true
~~~

### Intention

Get the IAM access control policy for a billing account. Use this to audit who has access to view or manage billing.

### Auth Intention

Requires `billing.accounts.getIamPolicy` permission, typically granted via Billing Account Viewer role.

### Input

```typescript
interface GetIamPolicyRequest {
  resource: string;                    // Required. Format: billingAccounts/012345-567890-ABCDEF
  "options.requestedPolicyVersion"?: number;  // 0, 1, or 3 (use 3 for conditions)
}
```

### Output

```typescript
type GetIamPolicyResponse = Policy;
```

### Logic Constraints

- Request version 3 if you need to see conditional bindings
- Lower versions omit conditions, potentially hiding access grants

---

## Capability: Set IAM Policy

~~~meta
id: billingAccounts.setIamPolicy
transport: HTTP POST /v1/{resource}:setIamPolicy
auth: required
idempotent: false
~~~

### Intention

Set the IAM access control policy for a billing account, replacing any existing policy. Use this to grant or revoke access to billing management.

### Auth Intention

Requires `billing.accounts.setIamPolicy` permission, typically granted via Billing Account Administrator role.

### Input

```typescript
interface SetIamPolicyRequest {
  resource: string;       // Required. Format: billingAccounts/012345-567890-ABCDEF
  policy: Policy;         // The complete policy to apply
  updateMask?: string;    // Field mask; defaults to "bindings, etag"
}
```

### Output

```typescript
type SetIamPolicyResponse = Policy;
```

### Logic Constraints

- This is a replace operation, not a patch—include all desired bindings
- Always include `etag` from a recent `getIamPolicy` to prevent race conditions
- If using conditions, set `policy.version` to 3
- Omitting `etag` when conditions exist can corrupt the policy

---

## Capability: Test IAM Permissions

~~~meta
id: billingAccounts.testIamPermissions
transport: HTTP POST /v1/{resource}:testIamPermissions
auth: required
idempotent: true
~~~

### Intention

Check which permissions the caller has on a billing account. Use this to determine what operations a user can perform before attempting them.

### Auth Intention

Requires any valid billing scope. Returns only permissions the caller actually has.

### Input

```typescript
interface TestIamPermissionsRequest {
  resource: string;       // Required. Format: billingAccounts/012345-567890-ABCDEF
  permissions: string[];  // Permissions to check (e.g., "billing.accounts.get")
}
```

### Output

```typescript
interface TestIamPermissionsResponse {
  permissions: string[];  // Subset of requested permissions that caller has
}
```

### Logic Constraints

- Wildcards (like `billing.*`) are not allowed in permission names
- Returns empty array if caller has none of the requested permissions
- Does not reveal what permissions exist, only what caller has

---

*— End of Specification —*
