# GitHub REST API

The GitHub REST API enables programmatic access to GitHub's platform—repositories, issues, pull requests, actions, webhooks, and more. This spec covers the core capabilities for repository management and collaboration workflows.

~~~meta
version: 2022-11-28
base_url: https://api.github.com
auth: bearer
auth_header: Authorization
required_headers:
  - name: Accept
    value: "application/vnd.github+json"
  - name: X-GitHub-Api-Version
    value: "2022-11-28"
content_type: application/json
errors: standard
~~~

## Global Types

```typescript
interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  url: string;
  html_url: string;
  type: "User" | "Organization" | "Bot";
  site_admin: boolean;
}

interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: User;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: License | null;
  topics: string[];
  visibility: "public" | "private" | "internal";
  default_branch: string;
}

interface License {
  key: string;
  name: string;
  spdx_id: string;
  url: string | null;
}

interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  description: string | null;
  color: string;  // Hex color without #
  default: boolean;
}

interface Milestone {
  id: number;
  node_id: string;
  number: number;
  title: string;
  description: string | null;
  state: "open" | "closed";
  due_on: string | null;
}

interface Issue {
  id: number;
  node_id: string;
  number: number;
  title: string;
  body: string | null;
  user: User;
  labels: Label[];
  state: "open" | "closed";
  state_reason: "completed" | "reopened" | "not_planned" | null;
  locked: boolean;
  assignee: User | null;
  assignees: User[];
  milestone: Milestone | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  url: string;
  pull_request?: {  // Present if issue is a PR
    url: string;
    html_url: string;
    merged_at: string | null;
  };
}

interface IssueComment {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  body: string;
  user: User;
  created_at: string;
  updated_at: string;
}

interface PullRequest {
  id: number;
  node_id: string;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  user: User;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: User | null;
  assignees: User[];
  requested_reviewers: User[];
  labels: Label[];
  milestone: Milestone | null;
  draft: boolean;
  head: GitRef;
  base: GitRef;
  merged: boolean;
  mergeable: boolean | null;
  mergeable_state: string;
  merged_by: User | null;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

interface GitRef {
  label: string;
  ref: string;
  sha: string;
  user: User;
  repo: Repository;
}

interface Review {
  id: number;
  node_id: string;
  user: User;
  body: string | null;
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING";
  html_url: string;
  submitted_at: string;
  commit_id: string;
}

interface ReviewComment {
  id: number;
  node_id: string;
  url: string;
  diff_hunk: string;
  path: string;
  position: number | null;
  original_position: number;
  commit_id: string;
  original_commit_id: string;
  user: User;
  body: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  line: number | null;
  side: "LEFT" | "RIGHT";
  start_line: number | null;
  start_side: "LEFT" | "RIGHT" | null;
  in_reply_to_id?: number;
}

interface Workflow {
  id: number;
  node_id: string;
  name: string;
  path: string;
  state: "active" | "deleted" | "disabled_fork" | "disabled_inactivity" | "disabled_manually";
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  badge_url: string;
}

interface WorkflowRun {
  id: number;
  node_id: string;
  name: string | null;
  head_branch: string | null;
  head_sha: string;
  path: string;
  run_number: number;
  run_attempt: number;
  event: string;
  status: "queued" | "in_progress" | "completed" | "waiting" | "requested" | "pending";
  conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required" | null;
  workflow_id: number;
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  jobs_url: string;
  logs_url: string;
  artifacts_url: string;
  actor: User;
  triggering_actor: User;
  head_commit: Commit | null;
}

interface Job {
  id: number;
  run_id: number;
  node_id: string;
  head_sha: string;
  status: "queued" | "in_progress" | "completed" | "waiting" | "requested" | "pending";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
  name: string;
  steps: Step[];
  started_at: string;
  completed_at: string | null;
  url: string;
  html_url: string;
  run_url: string;
  runner_id: number | null;
  runner_name: string | null;
}

interface Step {
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
  number: number;
  started_at: string | null;
  completed_at: string | null;
}

interface Commit {
  id: string;
  tree_id: string;
  message: string;
  timestamp: string;
  author: { name: string; email: string };
  committer: { name: string; email: string };
}

interface Hook {
  id: number;
  type: "Repository";
  name: "web";
  active: boolean;
  events: string[];
  config: {
    url: string;
    content_type: "json" | "form";
    insecure_ssl: "0" | "1";
    secret?: string;
  };
  updated_at: string;
  created_at: string;
  url: string;
  test_url: string;
  ping_url: string;
  deliveries_url: string;
}

interface HookDelivery {
  id: number;
  guid: string;
  delivered_at: string;
  redelivery: boolean;
  duration: number;
  status: string;
  status_code: number;
  event: string;
  action: string | null;
  installation_id: number | null;
  repository_id: number | null;
}

interface PaginationParams {
  per_page?: number;  // 1-100, default 30
  page?: number;      // 1-indexed, default 1
}
```

---

## Capability: Get Repository

~~~meta
id: repos.get
transport: HTTP GET /repos/{owner}/{repo}
auth: optional
idempotent: true
~~~

### Intention

Retrieve details about a repository including its settings, statistics, and metadata. Use this to get repository information before performing operations on it.

### Auth Intention

Public repos: no auth required. Private repos: requires `repo` scope. Fine-grained tokens need "Contents" read access.

### Input

```typescript
interface GetRepositoryRequest {
  owner: string;  // Path param - username or org name
  repo: string;   // Path param - repository name
}
```

### Output

```typescript
type GetRepositoryResponse = Repository;
```

### Logic Constraints

- Returns 404 for private repos if unauthenticated or lacking access
- `visibility` field requires authenticated request

---

## Capability: List Repository Issues

~~~meta
id: issues.list
transport: HTTP GET /repos/{owner}/{repo}/issues
auth: optional
idempotent: true
~~~

### Intention

List issues in a repository, with filtering and sorting options. Note: GitHub's API returns pull requests in issue listings (they share a number space). Filter by `pull_request` field presence if needed.

### Auth Intention

Public repos: no auth. Private repos: requires `repo` scope.

### Input

```typescript
interface ListIssuesRequest extends PaginationParams {
  owner: string;
  repo: string;
  milestone?: string | number;  // Number, "*" for any, "none" for no milestone
  state?: "open" | "closed" | "all";  // Default: "open"
  assignee?: string;            // Username, "*" for any, "none" for unassigned
  creator?: string;             // Filter by issue creator
  mentioned?: string;           // User mentioned in issue
  labels?: string;              // Comma-separated label names
  sort?: "created" | "updated" | "comments";  // Default: "created"
  direction?: "asc" | "desc";   // Default: "desc"
  since?: string;               // ISO 8601 timestamp
}
```

### Output

```typescript
type ListIssuesResponse = Issue[];
```

### Logic Constraints

- Maximum 100 issues per page
- Results include pull requests (check `pull_request` field)
- `labels` filter requires ALL specified labels to match

---

## Capability: Create Issue

~~~meta
id: issues.create
transport: HTTP POST /repos/{owner}/{repo}/issues
auth: required
idempotent: false
~~~

### Intention

Create a new issue in a repository. Use this for bug reports, feature requests, or task tracking. Can assign users, add labels, and set milestone in a single request.

### Auth Intention

Requires `repo` scope (or `public_repo` for public repos). Fine-grained tokens need "Issues" write access.

### Input

```typescript
interface CreateIssueRequest {
  owner: string;
  repo: string;
  title: string;             // Required
  body?: string;             // Markdown supported
  assignee?: string;         // Single assignee (deprecated, use assignees)
  assignees?: string[];      // Up to 10 assignees
  milestone?: number;        // Milestone ID
  labels?: (string | { name: string })[];  // Label names or objects
}
```

### Output

```typescript
type CreateIssueResponse = Issue;
```

### Logic Constraints

- `assignees` limited to 10 users
- User must have push access to assign others
- Labels are created if they don't exist (requires push access)
- Returns 410 if issues are disabled on repository

---

## Capability: Update Issue

~~~meta
id: issues.update
transport: HTTP PATCH /repos/{owner}/{repo}/issues/{issue_number}
auth: required
idempotent: true
~~~

### Intention

Update an existing issue's title, body, state, assignees, labels, or milestone. Use this to close issues, update descriptions, or manage issue metadata.

### Input

```typescript
interface UpdateIssueRequest {
  owner: string;
  repo: string;
  issue_number: number;
  title?: string;
  body?: string;
  state?: "open" | "closed";
  state_reason?: "completed" | "not_planned" | "reopened" | null;
  assignee?: string | null;
  assignees?: string[];
  milestone?: number | null;
  labels?: (string | { name: string })[];
}
```

### Output

```typescript
type UpdateIssueResponse = Issue;
```

### Logic Constraints

- Set `assignee` to `null` to clear
- Set `milestone` to `null` to remove milestone
- `labels` replaces all labels (not additive)
- `state_reason` only valid when `state` is "closed"

---

## Capability: Create Issue Comment

~~~meta
id: issues.comments.create
transport: HTTP POST /repos/{owner}/{repo}/issues/{issue_number}/comments
auth: required
idempotent: false
~~~

### Intention

Add a comment to an issue or pull request. Issue numbers and PR numbers share the same namespace, so this works for both.

### Input

```typescript
interface CreateIssueCommentRequest {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;  // Required, markdown supported
}
```

### Output

```typescript
type CreateIssueCommentResponse = IssueComment;
```

---

## Capability: List Pull Requests

~~~meta
id: pulls.list
transport: HTTP GET /repos/{owner}/{repo}/pulls
auth: optional
idempotent: true
~~~

### Intention

List pull requests in a repository with filtering options. Use this to find PRs for review, check PR status, or audit open work.

### Input

```typescript
interface ListPullRequestsRequest extends PaginationParams {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";  // Default: "open"
  head?: string;           // Filter by head user:ref-name or ref-name
  base?: string;           // Filter by base branch name
  sort?: "created" | "updated" | "popularity" | "long-running";
  direction?: "asc" | "desc";  // Default: "desc"
}
```

### Output

```typescript
type ListPullRequestsResponse = PullRequest[];
```

### Logic Constraints

- Maximum 100 PRs per page
- `head` format: "user:branch" for cross-repo, "branch" for same repo
- "popularity" sorts by comment count
- "long-running" sorts by age, filtering out recently updated

---

## Capability: Create Pull Request

~~~meta
id: pulls.create
transport: HTTP POST /repos/{owner}/{repo}/pulls
auth: required
idempotent: false
~~~

### Intention

Create a new pull request to merge changes from one branch to another. The head branch must contain commits not in the base branch.

### Input

```typescript
interface CreatePullRequestRequest {
  owner: string;
  repo: string;
  title: string;            // Required
  body?: string;            // PR description, markdown supported
  head: string;             // Required - branch with changes (user:branch for forks)
  head_repo?: string;       // For cross-repo PRs
  base: string;             // Required - branch to merge into
  draft?: boolean;          // Create as draft PR
  maintainer_can_modify?: boolean;  // Allow maintainer edits
  issue?: number;           // Convert existing issue to PR
}
```

### Output

```typescript
type CreatePullRequestResponse = PullRequest;
```

### Logic Constraints

- `head` and `base` must be different branches
- `head` format for forks: "username:branch"
- Either `title` or `issue` required, not both
- Returns 422 if no commits between head and base

---

## Capability: Get Pull Request

~~~meta
id: pulls.get
transport: HTTP GET /repos/{owner}/{repo}/pulls/{pull_number}
auth: optional
idempotent: true
~~~

### Intention

Get detailed information about a specific pull request, including merge status, review state, and diff statistics.

### Input

```typescript
interface GetPullRequestRequest {
  owner: string;
  repo: string;
  pull_number: number;
}
```

### Output

```typescript
type GetPullRequestResponse = PullRequest;
```

### Logic Constraints

- `mergeable` may be `null` while GitHub computes it (retry after a moment)
- `mergeable_state` values: "clean", "dirty", "unstable", "blocked", "behind", "unknown"

---

## Capability: Update Pull Request

~~~meta
id: pulls.update
transport: HTTP PATCH /repos/{owner}/{repo}/pulls/{pull_number}
auth: required
idempotent: true
~~~

### Intention

Update a pull request's title, body, state, or base branch. Use this to close PRs, update descriptions, or change the target branch.

### Input

```typescript
interface UpdatePullRequestRequest {
  owner: string;
  repo: string;
  pull_number: number;
  title?: string;
  body?: string;
  state?: "open" | "closed";
  base?: string;            // Change target branch
  maintainer_can_modify?: boolean;
}
```

### Output

```typescript
type UpdatePullRequestResponse = PullRequest;
```

### Logic Constraints

- Changing `base` rewrites PR history (use carefully)
- Cannot reopen a merged PR

---

## Capability: Merge Pull Request

~~~meta
id: pulls.merge
transport: HTTP PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge
auth: required
idempotent: false
~~~

### Intention

Merge a pull request. Supports merge commit, squash, or rebase strategies. Fails if PR is not mergeable.

### Input

```typescript
interface MergePullRequestRequest {
  owner: string;
  repo: string;
  pull_number: number;
  commit_title?: string;        // Title for merge commit
  commit_message?: string;      // Extra detail for merge commit
  sha?: string;                 // Expected head SHA (prevents race conditions)
  merge_method?: "merge" | "squash" | "rebase";  // Default: "merge"
}
```

### Output

```typescript
interface MergePullRequestResponse {
  sha: string;
  merged: boolean;
  message: string;
}
```

### Logic Constraints

- Returns 405 if merge not allowed (branch protection, conflicts)
- Returns 409 if `sha` doesn't match current head
- `merge_method` availability depends on repo settings

### Errors

- `405`: Merge blocked by branch protection or conflicts
- `409`: SHA mismatch (PR was updated)

---

## Capability: Create Pull Request Review

~~~meta
id: pulls.reviews.create
transport: HTTP POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews
auth: required
idempotent: false
~~~

### Intention

Submit a review on a pull request with an overall verdict (approve, request changes, or comment). Can include line-level comments.

### Input

```typescript
interface CreateReviewRequest {
  owner: string;
  repo: string;
  pull_number: number;
  commit_id?: string;          // SHA to review (defaults to latest)
  body?: string;               // Review summary
  event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
  comments?: ReviewCommentInput[];
}

interface ReviewCommentInput {
  path: string;                // File path
  body: string;                // Comment text
  position?: number;           // Line position in diff (deprecated)
  line?: number;               // Line number in file
  side?: "LEFT" | "RIGHT";     // Which side of diff
  start_line?: number;         // For multi-line comments
  start_side?: "LEFT" | "RIGHT";
}
```

### Output

```typescript
type CreateReviewResponse = Review;
```

### Logic Constraints

- `REQUEST_CHANGES` requires write access to the repo
- `comments` attach to specific lines in the diff
- Use `line` (not `position`) for new code

---

## Capability: List Workflow Runs

~~~meta
id: actions.runs.list
transport: HTTP GET /repos/{owner}/{repo}/actions/runs
auth: optional
idempotent: true
~~~

### Intention

List workflow runs for a repository. Use this to monitor CI/CD status, find failed runs, or audit workflow history.

### Input

```typescript
interface ListWorkflowRunsRequest extends PaginationParams {
  owner: string;
  repo: string;
  actor?: string;           // Filter by user who triggered
  branch?: string;          // Filter by branch
  event?: string;           // Filter by event type (push, pull_request, etc.)
  status?: "queued" | "in_progress" | "completed" | "waiting" | "requested" | "pending";
  created?: string;         // Date range: ">=2024-01-01", "2024-01-01..2024-02-01"
  exclude_pull_requests?: boolean;
  check_suite_id?: number;
  head_sha?: string;        // Filter by commit SHA
}
```

### Output

```typescript
interface ListWorkflowRunsResponse {
  total_count: number;
  workflow_runs: WorkflowRun[];
}
```

### Logic Constraints

- Returns up to 1000 runs (across all pages)
- `created` supports operators: `>`, `>=`, `<`, `<=`, `..` (range)

---

## Capability: Get Workflow Run

~~~meta
id: actions.runs.get
transport: HTTP GET /repos/{owner}/{repo}/actions/runs/{run_id}
auth: optional
idempotent: true
~~~

### Intention

Get detailed information about a specific workflow run, including its status, conclusion, and links to jobs and artifacts.

### Input

```typescript
interface GetWorkflowRunRequest {
  owner: string;
  repo: string;
  run_id: number;
}
```

### Output

```typescript
type GetWorkflowRunResponse = WorkflowRun;
```

---

## Capability: Rerun Workflow

~~~meta
id: actions.runs.rerun
transport: HTTP POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun
auth: required
idempotent: false
~~~

### Intention

Re-run all jobs in a workflow run. Use this to retry failed CI runs without pushing new commits.

### Input

```typescript
interface RerunWorkflowRequest {
  owner: string;
  repo: string;
  run_id: number;
  enable_debug_logging?: boolean;  // Enable debug logs for rerun
}
```

### Output

```typescript
interface RerunWorkflowResponse {
  // Empty object on success
}
```

### Logic Constraints

- Run must be completed to rerun
- Reruns use the same workflow file version as original
- Returns 403 if workflow is disabled

---

## Capability: List Workflow Run Jobs

~~~meta
id: actions.jobs.list
transport: HTTP GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs
auth: optional
idempotent: true
~~~

### Intention

List all jobs in a workflow run with their statuses and step details. Use this to identify which specific job failed.

### Input

```typescript
interface ListJobsRequest extends PaginationParams {
  owner: string;
  repo: string;
  run_id: number;
  filter?: "latest" | "all";  // Default: "latest" (most recent attempt)
}
```

### Output

```typescript
interface ListJobsResponse {
  total_count: number;
  jobs: Job[];
}
```

---

## Capability: List Repository Webhooks

~~~meta
id: repos.hooks.list
transport: HTTP GET /repos/{owner}/{repo}/hooks
auth: required
idempotent: true
~~~

### Intention

List webhooks configured on a repository. Use this to audit integrations or verify webhook setup.

### Auth Intention

Requires `admin:repo_hook` scope or admin access to the repository.

### Input

```typescript
interface ListHooksRequest extends PaginationParams {
  owner: string;
  repo: string;
}
```

### Output

```typescript
type ListHooksResponse = Hook[];
```

---

## Capability: Create Repository Webhook

~~~meta
id: repos.hooks.create
transport: HTTP POST /repos/{owner}/{repo}/hooks
auth: required
idempotent: false
~~~

### Intention

Create a new webhook to receive HTTP callbacks when events occur in the repository. Configure which events trigger the webhook and the delivery URL.

### Input

```typescript
interface CreateHookRequest {
  owner: string;
  repo: string;
  name?: "web";            // Only "web" is supported
  config: {
    url: string;           // Required - payload delivery URL
    content_type?: "json" | "form";  // Default: "form"
    secret?: string;       // For webhook signature verification
    insecure_ssl?: "0" | "1";  // "1" to disable SSL verification
  };
  events?: string[];       // Default: ["push"]
  active?: boolean;        // Default: true
}
```

### Output

```typescript
type CreateHookResponse = Hook;
```

### Logic Constraints

- Common events: "push", "pull_request", "issues", "create", "delete", "release"
- Use "*" for all events (wildcard)
- `secret` should be a random string for HMAC signature verification
- Maximum 20 webhooks per repository

### Example

```json
// Request
{
  "config": {
    "url": "https://example.com/webhook",
    "content_type": "json",
    "secret": "your-webhook-secret"
  },
  "events": ["push", "pull_request"],
  "active": true
}
```

---

## Capability: Update Repository Webhook

~~~meta
id: repos.hooks.update
transport: HTTP PATCH /repos/{owner}/{repo}/hooks/{hook_id}
auth: required
idempotent: true
~~~

### Intention

Update webhook configuration including URL, events, and active status. Use this to change delivery settings or temporarily disable a webhook.

### Input

```typescript
interface UpdateHookRequest {
  owner: string;
  repo: string;
  hook_id: number;
  config?: {
    url: string;
    content_type?: "json" | "form";
    secret?: string;
    insecure_ssl?: "0" | "1";
  };
  events?: string[];
  add_events?: string[];    // Add to existing events
  remove_events?: string[]; // Remove from existing events
  active?: boolean;
}
```

### Output

```typescript
type UpdateHookResponse = Hook;
```

### Logic Constraints

- `events` replaces all events; use `add_events`/`remove_events` for incremental changes
- Cannot use `events` with `add_events` or `remove_events`

---

## Capability: Delete Repository Webhook

~~~meta
id: repos.hooks.delete
transport: HTTP DELETE /repos/{owner}/{repo}/hooks/{hook_id}
auth: required
idempotent: true
~~~

### Intention

Permanently delete a webhook. This stops all deliveries and cannot be undone.

### Input

```typescript
interface DeleteHookRequest {
  owner: string;
  repo: string;
  hook_id: number;
}
```

### Output

```typescript
// 204 No Content on success
```

---

## Capability: List Webhook Deliveries

~~~meta
id: repos.hooks.deliveries.list
transport: HTTP GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries
auth: required
idempotent: true
~~~

### Intention

List recent webhook delivery attempts. Use this to debug failed deliveries or verify webhooks are working.

### Input

```typescript
interface ListDeliveriesRequest extends PaginationParams {
  owner: string;
  repo: string;
  hook_id: number;
  cursor?: string;  // Pagination cursor (alternative to page)
  redelivery?: boolean;  // Filter to only redeliveries
}
```

### Output

```typescript
type ListDeliveriesResponse = HookDelivery[];
```

### Logic Constraints

- Deliveries retained for 30 days
- Maximum 100 per page

---

## Capability: Redeliver Webhook

~~~meta
id: repos.hooks.deliveries.redeliver
transport: HTTP POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts
auth: required
idempotent: false
~~~

### Intention

Retry a failed webhook delivery. Use this after fixing the receiving endpoint or network issues.

### Input

```typescript
interface RedeliverWebhookRequest {
  owner: string;
  repo: string;
  hook_id: number;
  delivery_id: number;
}
```

### Output

```typescript
interface RedeliverWebhookResponse {
  // Empty on success (202 Accepted)
}
```

---

*— End of Specification —*
