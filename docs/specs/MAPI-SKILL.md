# MAPI Skill Authoring Guide

**Draft — January 2026**

*Modular MAPI for Agent-Friendly Progressive Loading*

---

## Overview

The MAPI Skill format is a modular authoring structure that enables agents to load API capabilities selectively, avoiding the token overhead of loading an entire specification. This is particularly valuable for large APIs (100+ capabilities) where full-spec loading would consume significant context window space.

**Two distribution formats, one source:**

| Format | Use Case | Consumer |
|--------|----------|----------|
| **Bundled** (single `.mapi.md` file) | Full API visibility | Postman, API gateways, documentation tools, SDK generators |
| **Skill** (modular folder structure) | Selective capability loading | LLM agents, agentic harnesses (Goose, Letta, Claude, etc.) |

The Skill format is the recommended **authoring format**. A bundled single-file MAPI can be generated from it for tools that require the complete specification.

---

## Folder Structure

```
api-name/
├── Skill.md                 # Index: capability inventory + intent matching
├── common/
│   ├── auth.md              # Authentication patterns
│   ├── pagination.md        # Pagination conventions (if applicable)
│   └── schemas/
│       ├── user.md          # Shared User type
│       └── error.md         # Standard error shapes
└── capabilities/
    ├── users.create.md      # One file per capability
    ├── users.get.md
    ├── users.list.md
    └── ...
```

---

## Skill.md (Index File)

The `Skill.md` file serves as the entry point. It contains:

1. API-level metadata (base URL, auth type)
2. Capability index with intent keywords
3. Pointers to capability files and their dependencies

### Structure

```markdown
# {API Name}

{Brief description of what this API does.}

~~~meta
version: 1.0.0
base_url: https://api.example.com/v1
auth: bearer
~~~

## Common Dependencies

| File | Description |
|------|-------------|
| common/auth.md | Authentication setup and token handling |
| common/schemas/user.md | User object definition |
| common/schemas/error.md | Standard error response |

## Capabilities

| ID | Intent Keywords | File | Dependencies |
|----|-----------------|------|--------------|
| users.create | create user, add user, register user, new account | capabilities/users.create.md | auth, schemas/user |
| users.get | get user, fetch user, user details, user by id | capabilities/users.get.md | auth, schemas/user |
| users.list | list users, all users, search users | capabilities/users.list.md | auth, schemas/user, pagination |
| users.delete | delete user, remove user | capabilities/users.delete.md | auth |
```

### Intent Keywords

Intent keywords help agents match natural language requests to capabilities. Guidelines:

- Include common synonyms ("create", "add", "new")
- Include task descriptions ("register user", "new account")
- Include negative hints in the capability file's Intention section when disambiguation is needed

---

## Capability Files

Each capability file contains a single MAPI capability definition using standard MAPI syntax.

### Example: `capabilities/users.create.md`

```markdown
# Capability: Create User

~~~meta
id: users.create
transport: HTTP POST /users
auth: required
~~~

## Intention

Create a new user account. Use this when registering a new user in the system.
Requires a unique email address. If you need to update an existing user, use
`users.update` instead.

## Input

```typescript
interface CreateUserRequest {
  email: string;         // format: email
  name: string;          // 1-100 chars
  password: string;      // min: 8 chars
  role?: "admin" | "member";  // default: "member"
}
```

## Output

```typescript
interface CreateUserResponse {
  user: User;
  token: string;         // Initial auth token
}
```

## Errors

- `email_taken` (409): Email address already registered
```

---

## Common Files

The `common/` folder contains shared definitions referenced by multiple capabilities.

### common/auth.md

```markdown
# Authentication

This API uses Bearer token authentication.

## Obtaining a Token

1. Register an application in the Developer Dashboard
2. Use client credentials flow or authorization code flow
3. Include token in `Authorization: Bearer {token}` header

## Token Lifetime

- Access tokens expire after 1 hour
- Use refresh tokens for long-running processes

## Scopes

| Scope | Description |
|-------|-------------|
| users:read | Read user information |
| users:write | Create and modify users |
| admin | Full administrative access |
```

### common/schemas/user.md

```markdown
# User Schema

```typescript
interface User {
  id: string;            // UUID
  email: string;
  name: string;
  role: "admin" | "member";
  created_at: string;    // ISO 8601
  updated_at: string;    // ISO 8601
}
```
```

---

## Agent Loading Flow

When an agent receives a request like "create a new user named Alice":

1. **Load Skill.md** — Agent reads the index (~2-5KB)
2. **Match intent** — "create user" matches `users.create`
3. **Load capability + dependencies** — Agent fetches:
   - `capabilities/users.create.md`
   - `common/auth.md`
   - `common/schemas/user.md`
4. **Construct request** — Agent has everything needed to build the API call

**Total context loaded:** ~3-5KB (vs. potentially 50KB+ for full API spec)

---

## Skill Response Format

When an agent invokes a skill capability, the skill returns a structured response enabling the harness to execute the API call:

```markdown
## Request

```json
{
  "method": "POST",
  "url": "https://api.example.com/v1/users",
  "headers": {
    "Authorization": "Bearer ${API_TOKEN}",
    "Content-Type": "application/json"
  },
  "body": {
    "email": "alice@example.com",
    "name": "Alice",
    "password": "securepass123"
  }
}
```

## Debug (curl)

```bash
curl -X POST "https://api.example.com/v1/users" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","name":"Alice","password":"securepass123"}'
```
```

The structured request object allows programmatic execution. The curl command enables debugging and manual testing.

---

## Bundling

To generate a single-file MAPI specification from a Skill structure:

```bash
mapi bundle ./api-name -o api-name.mapi.md
```

The bundler:

1. Reads `Skill.md` for metadata and capability order
2. Inlines all common definitions into Global Types
3. Appends each capability file
4. Outputs a valid single-file MAPI specification

---

## When to Use Skill Format

| API Size | Recommendation |
|----------|----------------|
| Small (< 20 capabilities) | Single-file MAPI is sufficient |
| Medium (20-100 capabilities) | Skill format recommended |
| Large (100+ capabilities) | Skill format strongly recommended |

The threshold depends on context window constraints. As a rule of thumb: if your bundled MAPI exceeds 30KB, the Skill format will significantly improve agent efficiency.

---

## Relationship to MAPI Spec

The Skill format uses standard MAPI syntax for all capability and schema definitions. It adds:

- A folder structure convention
- The `Skill.md` index file format
- Intent keywords for capability matching
- A defined agent loading flow

The core MAPI specification (v0.95) remains the authoritative reference for capability syntax, metadata fields, and schema conventions.

---

*— End of Guide —*
