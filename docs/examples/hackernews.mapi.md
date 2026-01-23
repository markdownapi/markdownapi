# Hacker News API

Read-only access to Hacker News stories, comments, and users. No authentication required.

~~~meta
version: 1.0
base_url: https://hacker-news.firebaseio.com/v0
auth: none
content_type: application/json
~~~

---

## Capability: Get Top Stories

~~~meta
id: topstories
transport: HTTP GET /topstories.json
~~~

### Intention

Get the IDs of the current top 500 stories on Hacker News, ranked by score.

### Output

Array of integer story IDs, ordered by current rank (first = #1 story).

### Example

```json
// Request
GET /topstories.json

// Response
[42424242, 42424100, 42423999, ...]
```

---

## Capability: Get Item

~~~meta
id: item.get
transport: HTTP GET /item/{id}.json
~~~

### Intention

Get details about any item (story, comment, job, poll) by its ID. Use this after getting IDs from topstories, newstories, or other listing endpoints.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | integer | yes | The item's unique ID (path parameter) |

### Output

| Field | Type | Description |
|-------|------|-------------|
| id | integer | The item's unique ID |
| type | string | "story", "comment", "job", "poll", or "pollopt" |
| by | string | Username of the author |
| time | integer | Unix timestamp of creation |
| title | string | Title (stories, jobs, polls only) |
| url | string | URL of the story (if external link) |
| text | string | HTML content (comments, self-posts, jobs) |
| score | integer | Points/upvotes (stories, polls) |
| descendants | integer | Total comment count (stories, polls) |
| kids | array | IDs of child comments, ordered by rank |

### Example

```json
// Request
GET /item/42424242.json

// Response
{
  "id": 42424242,
  "type": "story",
  "by": "dhouston",
  "time": 1737500000,
  "title": "Show HN: My new project",
  "url": "https://example.com/project",
  "score": 142,
  "descendants": 37,
  "kids": [42424300, 42424301, 42424305]
}
```

---

## Capability: Get User

~~~meta
id: user.get
transport: HTTP GET /user/{username}.json
~~~

### Intention

Get a user's public profile by username.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | yes | The user's case-sensitive username (path parameter) |

### Output

| Field | Type | Description |
|-------|------|-------------|
| id | string | The username |
| created | integer | Unix timestamp of account creation |
| karma | integer | The user's karma score |
| about | string | HTML bio/description (if set) |
| submitted | array | IDs of the user's submissions and comments |

### Example

```json
// Request
GET /user/pg.json

// Response
{
  "id": "pg",
  "created": 1160418092,
  "karma": 156236,
  "about": "Bug fixer.",
  "submitted": [42400000, 42399999, ...]
}
```

---

## Capability: Get New Stories

~~~meta
id: newstories
transport: HTTP GET /newstories.json
~~~

### Intention

Get the IDs of the newest 500 stories, ordered by submission time (newest first).

### Output

Array of integer story IDs, ordered by recency.

---

## Capability: Get Best Stories

~~~meta
id: beststories
transport: HTTP GET /beststories.json
~~~

### Intention

Get the IDs of the top 500 best stories based on a combination of score and longevity.

### Output

Array of integer story IDs.

---

*— End of Specification —*
