# Capability: Create Repository Webhook

~~~meta
id: repos.hooks.create
transport: HTTP POST /repos/{owner}/{repo}/hooks
auth: required
idempotent: false
~~~

## Intention

Create a new webhook to receive HTTP callbacks when events occur in the repository. Configure which events trigger the webhook and the delivery URL.

## Logic Constraints

- Common events: "push", "pull_request", "issues", "create", "delete", "release"

## Example

```json
