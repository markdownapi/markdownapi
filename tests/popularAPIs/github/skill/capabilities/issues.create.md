# Capability: Create Issue

~~~meta
id: issues.create
transport: HTTP POST /repos/{owner}/{repo}/issues
auth: required
idempotent: false
~~~

## Intention

Create a new issue in a repository. Use this for bug reports, feature requests, or task tracking. Can assign users, add labels, and set milestone in a single request.

## Auth Intention

Requires `repo` scope (or `public_repo` for public repos). Fine-grained tokens need "Issues" write access.

## Logic Constraints

- `assignees` limited to 10 users
