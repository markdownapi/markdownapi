# Capability: Get Repository

~~~meta
id: repos.get
transport: HTTP GET /repos/{owner}/{repo}
auth: optional
idempotent: true
~~~

## Intention

Retrieve details about a repository including its settings, statistics, and metadata. Use this to get repository information before performing operations on it.

## Auth Intention

Public repos: no auth required. Private repos: requires `repo` scope. Fine-grained tokens need "Contents" read access.

## Logic Constraints

- Returns 404 for private repos if unauthenticated or lacking access
