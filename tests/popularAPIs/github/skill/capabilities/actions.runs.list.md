# Capability: List Workflow Runs

~~~meta
id: actions.runs.list
transport: HTTP GET /repos/{owner}/{repo}/actions/runs
auth: optional
idempotent: true
~~~

## Intention

List workflow runs for a repository. Use this to monitor CI/CD status, find failed runs, or audit workflow history.

## Logic Constraints

- Returns up to 1000 runs (across all pages)
