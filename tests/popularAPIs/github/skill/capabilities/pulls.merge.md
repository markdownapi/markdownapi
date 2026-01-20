# Capability: Merge Pull Request

~~~meta
id: pulls.merge
transport: HTTP PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge
auth: required
idempotent: false
~~~

## Intention

Merge a pull request. Supports merge commit, squash, or rebase strategies. Fails if PR is not mergeable.

## Logic Constraints

- Returns 405 if merge not allowed (branch protection, conflicts)

## Errors

- `405`: Merge blocked by branch protection or conflicts
