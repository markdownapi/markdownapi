# Capability: List Repository Webhooks

~~~meta
id: repos.hooks.list
transport: HTTP GET /repos/{owner}/{repo}/hooks
auth: required
idempotent: true
~~~

## Intention

List webhooks configured on a repository. Use this to audit integrations or verify webhook setup.

## Auth Intention

Requires `admin:repo_hook` scope or admin access to the repository.
