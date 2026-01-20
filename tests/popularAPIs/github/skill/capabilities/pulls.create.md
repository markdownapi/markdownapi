# Capability: Create Pull Request

~~~meta
id: pulls.create
transport: HTTP POST /repos/{owner}/{repo}/pulls
auth: required
idempotent: false
~~~

## Intention

Create a new pull request to merge changes from one branch to another. The head branch must contain commits not in the base branch.

## Logic Constraints

- `head` and `base` must be different branches
