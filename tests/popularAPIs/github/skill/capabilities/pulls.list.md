# Capability: List Pull Requests

~~~meta
id: pulls.list
transport: HTTP GET /repos/{owner}/{repo}/pulls
auth: optional
idempotent: true
~~~

## Intention

List pull requests in a repository with filtering options. Use this to find PRs for review, check PR status, or audit open work.

## Logic Constraints

- Maximum 100 PRs per page
