# Capability: Create Pull Request Review

~~~meta
id: pulls.reviews.create
transport: HTTP POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews
auth: required
idempotent: false
~~~

## Intention

Submit a review on a pull request with an overall verdict (approve, request changes, or comment). Can include line-level comments.

## Logic Constraints

- `REQUEST_CHANGES` requires write access to the repo
