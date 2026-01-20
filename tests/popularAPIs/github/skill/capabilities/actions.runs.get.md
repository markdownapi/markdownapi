# Capability: Get Workflow Run

~~~meta
id: actions.runs.get
transport: HTTP GET /repos/{owner}/{repo}/actions/runs/{run_id}
auth: optional
idempotent: true
~~~

## Intention

Get detailed information about a specific workflow run, including its status, conclusion, and links to jobs and artifacts.
