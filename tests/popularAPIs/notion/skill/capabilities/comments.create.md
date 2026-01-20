# Capability: Create Comment

~~~meta
id: comments.create
transport: HTTP POST /v1/comments
auth: required
idempotent: false
~~~

## Intention

Add a comment to a page or start a discussion thread on a block. Use this for automated feedback, review comments, or audit trails.

## Logic Constraints

- `page_id` creates a new discussion thread on the page
