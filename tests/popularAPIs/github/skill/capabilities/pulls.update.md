# Capability: Update Pull Request

~~~meta
id: pulls.update
transport: HTTP PATCH /repos/{owner}/{repo}/pulls/{pull_number}
auth: required
idempotent: true
~~~

## Intention

Update a pull request's title, body, state, or base branch. Use this to close PRs, update descriptions, or change the target branch.

## Logic Constraints

- Changing `base` rewrites PR history (use carefully)
