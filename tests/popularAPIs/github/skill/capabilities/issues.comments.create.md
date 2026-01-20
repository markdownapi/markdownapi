# Capability: Create Issue Comment

~~~meta
id: issues.comments.create
transport: HTTP POST /repos/{owner}/{repo}/issues/{issue_number}/comments
auth: required
idempotent: false
~~~

## Intention

Add a comment to an issue or pull request. Issue numbers and PR numbers share the same namespace, so this works for both.
