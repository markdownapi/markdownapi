# Capability: Update Issue

~~~meta
id: issues.update
transport: HTTP PATCH /repos/{owner}/{repo}/issues/{issue_number}
auth: required
idempotent: true
~~~

## Intention

Update an existing issue's title, body, state, assignees, labels, or milestone. Use this to close issues, update descriptions, or manage issue metadata.

## Logic Constraints

- Set `assignee` to `null` to clear
