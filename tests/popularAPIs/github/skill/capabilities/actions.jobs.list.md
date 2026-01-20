# Capability: List Workflow Run Jobs

~~~meta
id: actions.jobs.list
transport: HTTP GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs
auth: optional
idempotent: true
~~~

## Intention

List all jobs in a workflow run with their statuses and step details. Use this to identify which specific job failed.
