# Capability: Get Pull Request

~~~meta
id: pulls.get
transport: HTTP GET /repos/{owner}/{repo}/pulls/{pull_number}
auth: optional
idempotent: true
~~~

## Intention

Get detailed information about a specific pull request, including merge status, review state, and diff statistics.

## Logic Constraints

- `mergeable` may be `null` while GitHub computes it (retry after a moment)
