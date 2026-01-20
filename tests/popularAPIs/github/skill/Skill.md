# GitHub REST API

The GitHub REST API enables programmatic access to GitHub's platform—repositories, issues, pull requests, actions, webhooks, and more. This spec covers the core capabilities for repository management and collaboration workflows.

~~~meta
version: 2022-11-28
base_url: https://api.github.com
auth: bearer
~~~

## Common Dependencies

| File | Description |
|------|-------------|
| common/auth.md | Authentication setup |

## Capabilities

| ID | Intent Keywords | File | Dependencies |
|----|-----------------|------|--------------|
| repos.get | repos, get, retrieve, details | capabilities/repos.get.md | - |
| issues.list | issues, list | capabilities/issues.list.md | - |
| issues.create | issues, create, add, issue | capabilities/issues.create.md | auth |
| issues.update | issues, update, an | capabilities/issues.update.md | auth |
| issues.comments.create | issues, comments, create, add | capabilities/issues.comments.create.md | auth |
| pulls.list | pulls, list, find, pull | capabilities/pulls.list.md | - |
| pulls.create | pulls, create, pull | capabilities/pulls.create.md | auth |
| pulls.get | pulls, get, detailed | capabilities/pulls.get.md | - |
| pulls.update | pulls, update, get, pull | capabilities/pulls.update.md | auth |
| pulls.merge | pulls, merge | capabilities/pulls.merge.md | auth |
| pulls.reviews.create | pulls, reviews, create | capabilities/pulls.reviews.create.md | auth |
| actions.runs.list | actions, runs, list, find, workflow | capabilities/actions.runs.list.md | - |
| actions.runs.get | actions, runs, get, detailed | capabilities/actions.runs.get.md | - |
| actions.runs.rerun | actions, runs, rerun | capabilities/actions.runs.rerun.md | auth |
| actions.jobs.list | actions, jobs, list, all | capabilities/actions.jobs.list.md | - |
| repos.hooks.list | repos, hooks, list, webhooks | capabilities/repos.hooks.list.md | auth |
| repos.hooks.create | repos, hooks, create, webhook | capabilities/repos.hooks.create.md | auth |
| repos.hooks.update | repos, hooks, update, disable, webhook | capabilities/repos.hooks.update.md | auth |
| repos.hooks.delete | repos, hooks, delete, stop, webhook | capabilities/repos.hooks.delete.md | auth |
| repos.hooks.deliveries.list | repos, hooks, deliveries, list, recent | capabilities/repos.hooks.deliveries.list.md | auth |
| repos.hooks.deliveries.redeliver | repos, hooks, deliveries, redeliver | capabilities/repos.hooks.deliveries.redeliver.md | auth |
