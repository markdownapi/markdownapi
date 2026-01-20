# Capability: List Repository Issues

~~~meta
id: issues.list
transport: HTTP GET /repos/{owner}/{repo}/issues
auth: optional
idempotent: true
~~~

## Intention

List issues in a repository, with filtering and sorting options. Note: GitHub's API returns pull requests in issue listings (they share a number space). Filter by `pull_request` field presence if needed.

## Auth Intention

Public repos: no auth. Private repos: requires `repo` scope.

## Logic Constraints

- Maximum 100 issues per page
