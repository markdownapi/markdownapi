# Capability: Rerun Workflow

~~~meta
id: actions.runs.rerun
transport: HTTP POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun
auth: required
idempotent: false
~~~

## Intention

Re-run all jobs in a workflow run. Use this to retry failed CI runs without pushing new commits.

## Logic Constraints

- Run must be completed to rerun
