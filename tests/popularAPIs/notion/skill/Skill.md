# Notion API

The Notion API enables you to build integrations that interact with Notion workspaces—creating pages, querying databases, managing content blocks, and searching across the workspace. All content in Notion is represented as pages containing blocks.

~~~meta
version: 2022-06-28
base_url: https://api.notion.com
auth: bearer
~~~

## Common Dependencies

| File | Description |
|------|-------------|
| common/auth.md | Authentication setup |

## Capabilities

| ID | Intent Keywords | File | Dependencies |
|----|-----------------|------|--------------|
| search | search, query | capabilities/search.md | auth |
| databases.retrieve | databases, retrieve, query, database | capabilities/databases.retrieve.md | auth |
| databases.query | databases, query, retrieve, pages | capabilities/databases.query.md | auth |
| databases.create | databases, create, database | capabilities/databases.create.md | auth |
| databases.update | databases, update, add, database | capabilities/databases.update.md | auth |
| pages.create | pages, create, page | capabilities/pages.create.md | auth |
| pages.retrieve | pages, retrieve, page | capabilities/pages.retrieve.md | auth |
| pages.update | pages, update, page | capabilities/pages.update.md | auth |
| blocks.children.list | blocks, children, list, search, find | capabilities/blocks.children.list.md | auth |
| blocks.children.append | blocks, children, append, add | capabilities/blocks.children.append.md | auth |
| blocks.retrieve | blocks, retrieve, list, find, single | capabilities/blocks.retrieve.md | auth |
| blocks.update | blocks, update, block | capabilities/blocks.update.md | auth |
| blocks.delete | blocks, delete, get, list, update | capabilities/blocks.delete.md | auth |
| users.list | users, list, all | capabilities/users.list.md | auth |
| users.retrieve | users, retrieve, list, find, user | capabilities/users.retrieve.md | auth |
| users.me | users, me, get, retrieve, the | capabilities/users.me.md | auth |
| comments.create | comments, create, add, start | capabilities/comments.create.md | auth |
| comments.list | comments, list, retrieve | capabilities/comments.list.md | auth |
