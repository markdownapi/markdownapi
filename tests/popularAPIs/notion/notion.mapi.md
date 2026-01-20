# Notion API

The Notion API enables you to build integrations that interact with Notion workspaces—creating pages, querying databases, managing content blocks, and searching across the workspace. All content in Notion is represented as pages containing blocks.

~~~meta
version: 2022-06-28
base_url: https://api.notion.com
auth: bearer
auth_header: Authorization
required_headers:
  - name: Notion-Version
    value: "2022-06-28"
content_type: application/json
errors: standard
~~~

## Global Types

```typescript
type UUID = string;  // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

type Color =
  | "default" | "gray" | "brown" | "orange" | "yellow"
  | "green" | "blue" | "purple" | "pink" | "red"
  | "gray_background" | "brown_background" | "orange_background"
  | "yellow_background" | "green_background" | "blue_background"
  | "purple_background" | "pink_background" | "red_background";

interface RichText {
  type: "text" | "mention" | "equation";
  text?: { content: string; link?: { url: string } | null };
  mention?: UserMention | PageMention | DatabaseMention | DateMention;
  equation?: { expression: string };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: Color;
  };
  plain_text: string;
  href: string | null;
}

interface UserMention { type: "user"; user: PartialUser }
interface PageMention { type: "page"; page: { id: UUID } }
interface DatabaseMention { type: "database"; database: { id: UUID } }
interface DateMention { type: "date"; date: DateValue }

interface DateValue {
  start: string;      // ISO 8601 date or datetime
  end?: string | null;
  time_zone?: string | null;  // IANA timezone
}

interface PartialUser {
  object: "user";
  id: UUID;
}

interface User extends PartialUser {
  type: "person" | "bot";
  name: string;
  avatar_url: string | null;
  person?: { email: string };
  bot?: { owner: { type: "workspace" | "user"; workspace?: boolean; user?: PartialUser } };
}

interface Parent {
  type: "database_id" | "page_id" | "workspace" | "block_id";
  database_id?: UUID;
  page_id?: UUID;
  workspace?: boolean;
  block_id?: UUID;
}

interface Icon {
  type: "emoji" | "external" | "file";
  emoji?: string;
  external?: { url: string };
  file?: { url: string; expiry_time: string };
}

interface Cover {
  type: "external" | "file";
  external?: { url: string };
  file?: { url: string; expiry_time: string };
}

interface Page {
  object: "page";
  id: UUID;
  created_time: string;
  last_edited_time: string;
  created_by: PartialUser;
  last_edited_by: PartialUser;
  archived: boolean;
  icon: Icon | null;
  cover: Cover | null;
  parent: Parent;
  url: string;
  properties: Record<string, PropertyValue>;
}

interface Database {
  object: "database";
  id: UUID;
  created_time: string;
  last_edited_time: string;
  created_by: PartialUser;
  last_edited_by: PartialUser;
  title: RichText[];
  description: RichText[];
  icon: Icon | null;
  cover: Cover | null;
  parent: Parent;
  url: string;
  archived: boolean;
  is_inline: boolean;
  properties: Record<string, PropertySchema>;
}

// Property schemas define database columns
interface PropertySchema {
  id: string;
  name: string;
  type: PropertyType;
  // Type-specific configuration follows
}

type PropertyType =
  | "title" | "rich_text" | "number" | "select" | "multi_select"
  | "date" | "people" | "files" | "checkbox" | "url" | "email"
  | "phone_number" | "formula" | "relation" | "rollup"
  | "created_time" | "created_by" | "last_edited_time" | "last_edited_by"
  | "status";

// Property values are the actual data in pages
interface PropertyValue {
  id: string;
  type: PropertyType;
  // Actual value varies by type (title, rich_text, select, etc.)
}

interface SelectOption {
  id: string;
  name: string;
  color: Color;
}

// Block types
type BlockType =
  | "paragraph" | "heading_1" | "heading_2" | "heading_3"
  | "bulleted_list_item" | "numbered_list_item" | "to_do" | "toggle"
  | "quote" | "callout" | "divider" | "table_of_contents"
  | "code" | "image" | "video" | "file" | "pdf" | "bookmark" | "embed"
  | "equation" | "column_list" | "column" | "synced_block"
  | "template" | "link_to_page" | "table" | "table_row"
  | "child_page" | "child_database" | "breadcrumb";

interface Block {
  object: "block";
  id: UUID;
  parent: Parent;
  type: BlockType;
  created_time: string;
  last_edited_time: string;
  created_by: PartialUser;
  last_edited_by: PartialUser;
  archived: boolean;
  has_children: boolean;
  // Type-specific content follows (paragraph, heading_1, etc.)
}

interface Comment {
  object: "comment";
  id: UUID;
  parent: { type: "page_id"; page_id: UUID } | { type: "block_id"; block_id: UUID };
  discussion_id: UUID;
  created_time: string;
  last_edited_time: string;
  created_by: PartialUser;
  rich_text: RichText[];
}

interface PaginatedRequest {
  start_cursor?: string;
  page_size?: number;  // 1-100, default varies by endpoint
}

interface PaginatedResponse<T> {
  object: "list";
  results: T[];
  next_cursor: string | null;
  has_more: boolean;
  type: string;
}
```

---

## Capability: Search

~~~meta
id: search
transport: HTTP POST /v1/search
auth: required
idempotent: true
~~~

### Intention

Search all pages and databases the integration has access to. Use this as the primary discovery mechanism when you don't know specific page or database IDs. Results include pages and databases whose titles match the query.

### Auth Intention

Requires an internal integration token. The integration must be added to the pages/databases you want to search. Create integrations at notion.com/my-integrations.

### Input

```typescript
interface SearchRequest extends PaginatedRequest {
  query?: string;              // Text to search for in titles
  filter?: {
    property: "object";
    value: "page" | "database";  // Limit to pages or databases
  };
  sort?: {
    direction: "ascending" | "descending";
    timestamp: "last_edited_time";
  };
}
```

### Output

```typescript
type SearchResponse = PaginatedResponse<Page | Database>;
```

### Logic Constraints

- Only returns content the integration has been explicitly shared with
- Empty `query` returns all accessible content
- `page_size` defaults to 100, maximum is 100
- Results sorted by relevance unless `sort` specified
- Full-text search is not supported—only titles are searched

### Example

```json
// Request
{
  "query": "Meeting Notes",
  "filter": { "property": "object", "value": "page" },
  "sort": { "direction": "descending", "timestamp": "last_edited_time" }
}
```

---

## Capability: Retrieve Database

~~~meta
id: databases.retrieve
transport: HTTP GET /v1/databases/{id}
auth: required
idempotent: true
~~~

### Intention

Retrieve a database's schema and metadata. Use this to understand a database's structure before querying it or creating pages in it. Returns the database properties (columns) and their configurations.

### Input

```typescript
interface RetrieveDatabaseRequest {
  id: UUID;  // Database ID (path parameter)
}
```

### Output

```typescript
type RetrieveDatabaseResponse = Database;
```

### Logic Constraints

- Integration must have access to the database
- Returns 404 if database doesn't exist or isn't shared with integration

---

## Capability: Query Database

~~~meta
id: databases.query
transport: HTTP POST /v1/databases/{id}/query
auth: required
idempotent: true
~~~

### Intention

Query a database to retrieve pages that match filter criteria. This is the primary way to read structured data from Notion. Returns pages (rows) with their property values.

### Input

```typescript
interface QueryDatabaseRequest extends PaginatedRequest {
  id: UUID;  // Database ID (path parameter)
  filter?: FilterCondition;
  sorts?: SortCriteria[];
}

type FilterCondition =
  | PropertyFilter
  | { or: FilterCondition[] }
  | { and: FilterCondition[] };

interface PropertyFilter {
  property: string;  // Property name or ID
  // One of these based on property type:
  title?: TextFilter;
  rich_text?: TextFilter;
  number?: NumberFilter;
  checkbox?: { equals: boolean } | { does_not_equal: boolean };
  select?: { equals: string } | { does_not_equal: string } | { is_empty: true } | { is_not_empty: true };
  multi_select?: { contains: string } | { does_not_contain: string } | { is_empty: true } | { is_not_empty: true };
  date?: DateFilter;
  people?: { contains: UUID } | { does_not_contain: UUID } | { is_empty: true } | { is_not_empty: true };
  files?: { is_empty: true } | { is_not_empty: true };
  relation?: { contains: UUID } | { does_not_contain: UUID } | { is_empty: true } | { is_not_empty: true };
  status?: { equals: string } | { does_not_equal: string } | { is_empty: true } | { is_not_empty: true };
}

interface TextFilter {
  equals?: string;
  does_not_equal?: string;
  contains?: string;
  does_not_contain?: string;
  starts_with?: string;
  ends_with?: string;
  is_empty?: true;
  is_not_empty?: true;
}

interface NumberFilter {
  equals?: number;
  does_not_equal?: number;
  greater_than?: number;
  less_than?: number;
  greater_than_or_equal_to?: number;
  less_than_or_equal_to?: number;
  is_empty?: true;
  is_not_empty?: true;
}

interface DateFilter {
  equals?: string;
  before?: string;
  after?: string;
  on_or_before?: string;
  on_or_after?: string;
  past_week?: object;
  past_month?: object;
  past_year?: object;
  next_week?: object;
  next_month?: object;
  next_year?: object;
  is_empty?: true;
  is_not_empty?: true;
}

interface SortCriteria {
  property?: string;
  timestamp?: "created_time" | "last_edited_time";
  direction: "ascending" | "descending";
}
```

### Output

```typescript
type QueryDatabaseResponse = PaginatedResponse<Page>;
```

### Logic Constraints

- `page_size` maximum is 100
- Compound filters support up to 2 levels of nesting
- Property filters reference properties by name or ID
- Date filters accept ISO 8601 strings
- Sorts are applied in order provided

### Example

```json
// Request - Find tasks with "High" priority modified this week
{
  "filter": {
    "and": [
      { "property": "Priority", "select": { "equals": "High" } },
      { "property": "Last Edited", "date": { "past_week": {} } }
    ]
  },
  "sorts": [{ "property": "Due Date", "direction": "ascending" }]
}
```

---

## Capability: Create Database

~~~meta
id: databases.create
transport: HTTP POST /v1/databases
auth: required
idempotent: false
~~~

### Intention

Create a new database as a child of an existing page. The database will appear as an inline table in the parent page. Define the schema (properties/columns) during creation.

### Input

```typescript
interface CreateDatabaseRequest {
  parent: { type: "page_id"; page_id: UUID };
  title: RichText[];
  properties: Record<string, PropertySchemaInput>;
  icon?: Icon;
  cover?: { type: "external"; external: { url: string } };
  is_inline?: boolean;  // Default true
}

interface PropertySchemaInput {
  // The key becomes the property name
  type: PropertyType;
  // Type-specific configuration:
  number?: { format: "number" | "number_with_commas" | "percent" | "dollar" | "euro" | "yen" | "won" | "yuan" | "real" | "lira" | "rupee" | "pound" | "shekel" | "franc" | "krona" | "peso" | "rand" };
  select?: { options: { name: string; color?: Color }[] };
  multi_select?: { options: { name: string; color?: Color }[] };
  relation?: { database_id: UUID; single_property?: object };
  rollup?: { relation_property_name: string; rollup_property_name: string; function: string };
  formula?: { expression: string };
  status?: { options: { name: string; color?: Color }[]; groups: { name: string; option_ids: string[] }[] };
}
```

### Output

```typescript
type CreateDatabaseResponse = Database;
```

### Logic Constraints

- Parent page must be shared with the integration
- Must include at least one `title` type property
- Property names must be unique within the database
- Select/multi-select options can define colors or use defaults

---

## Capability: Update Database

~~~meta
id: databases.update
transport: HTTP PATCH /v1/databases/{id}
auth: required
idempotent: true
~~~

### Intention

Update a database's title, description, or properties. Use this to add new columns, rename existing ones, or modify property configurations. Cannot change a property's type.

### Input

```typescript
interface UpdateDatabaseRequest {
  id: UUID;  // Path parameter
  title?: RichText[];
  description?: RichText[];
  properties?: Record<string, PropertySchemaInput | null>;  // null removes property
  icon?: Icon | null;
  cover?: { type: "external"; external: { url: string } } | null;
  archived?: boolean;
  is_inline?: boolean;
}
```

### Output

```typescript
type UpdateDatabaseResponse = Database;
```

### Logic Constraints

- Cannot change a property's type (must delete and recreate)
- Set property value to `null` to delete the column
- Renaming: include property with new name in the schema object
- Deleting a property removes data from all pages in the database

---

## Capability: Create Page

~~~meta
id: pages.create
transport: HTTP POST /v1/pages
auth: required
idempotent: false
~~~

### Intention

Create a new page in a database or as a child of another page. When creating in a database, properties must match the database schema. Optionally include initial content as blocks.

### Input

```typescript
interface CreatePageRequest {
  parent: Parent;
  properties: Record<string, PropertyValueInput>;
  children?: BlockInput[];  // Initial page content
  icon?: Icon;
  cover?: { type: "external"; external: { url: string } };
}

// Property value formats vary by type
interface PropertyValueInput {
  title?: RichText[];
  rich_text?: RichText[];
  number?: number;
  select?: { name: string } | { id: string };
  multi_select?: ({ name: string } | { id: string })[];
  date?: DateValue;
  checkbox?: boolean;
  url?: string;
  email?: string;
  phone_number?: string;
  people?: { id: UUID }[];
  relation?: { id: UUID }[];
  files?: { name: string; external: { url: string } }[];
  status?: { name: string } | { id: string };
}

interface BlockInput {
  type: BlockType;
  // Type-specific content, e.g.:
  paragraph?: { rich_text: RichText[]; color?: Color };
  heading_1?: { rich_text: RichText[]; color?: Color };
  bulleted_list_item?: { rich_text: RichText[]; color?: Color; children?: BlockInput[] };
  to_do?: { rich_text: RichText[]; checked?: boolean; color?: Color };
  code?: { rich_text: RichText[]; language: string };
  // ... other block types
}
```

### Output

```typescript
type CreatePageResponse = Page;
```

### Logic Constraints

- Database pages must include all required properties
- Properties must match the parent database's schema types
- `children` can nest up to 2 levels deep in a single request
- For deeper nesting, use append block children after creation
- Maximum 100 blocks in initial `children` array

### Example

```json
// Request - Create a task in a database
{
  "parent": { "type": "database_id", "database_id": "8e2c2b76-..." },
  "properties": {
    "Name": { "title": [{ "text": { "content": "Review PR #123" } }] },
    "Status": { "select": { "name": "In Progress" } },
    "Due Date": { "date": { "start": "2024-01-15" } }
  }
}
```

---

## Capability: Retrieve Page

~~~meta
id: pages.retrieve
transport: HTTP GET /v1/pages/{id}
auth: required
idempotent: true
~~~

### Intention

Retrieve a page's properties and metadata. Use this to read page data. For page content (blocks), use the retrieve block children endpoint separately.

### Input

```typescript
interface RetrievePageRequest {
  id: UUID;  // Path parameter
  filter_properties?: string[];  // Property IDs to include (query param)
}
```

### Output

```typescript
type RetrievePageResponse = Page;
```

### Logic Constraints

- Returns 404 if page doesn't exist or isn't shared
- `filter_properties` limits which properties are returned (useful for large schemas)
- Does not return page content—use block children endpoint

---

## Capability: Update Page

~~~meta
id: pages.update
transport: HTTP PATCH /v1/pages/{id}
auth: required
idempotent: true
~~~

### Intention

Update a page's properties, icon, cover, or archived status. Use this to modify page data. To update page content (blocks), use the block update/append endpoints.

### Input

```typescript
interface UpdatePageRequest {
  id: UUID;  // Path parameter
  properties?: Record<string, PropertyValueInput>;
  icon?: Icon | null;
  cover?: { type: "external"; external: { url: string } } | null;
  archived?: boolean;  // true to archive/delete
}
```

### Output

```typescript
type UpdatePageResponse = Page;
```

### Logic Constraints

- Only include properties you want to change
- Set `archived: true` to soft-delete (move to trash)
- Cannot change page's parent (move between databases)

---

## Capability: Retrieve Block Children

~~~meta
id: blocks.children.list
transport: HTTP GET /v1/blocks/{id}/children
auth: required
idempotent: true
~~~

### Intention

List all child blocks of a page or block. This is how you read page content. For nested content (blocks with `has_children: true`), call this recursively.

### Input

```typescript
interface ListBlockChildrenRequest extends PaginatedRequest {
  id: UUID;  // Block or page ID (path parameter)
}
```

### Output

```typescript
type ListBlockChildrenResponse = PaginatedResponse<Block>;
```

### Logic Constraints

- `page_size` maximum is 100
- For pages, returns top-level blocks
- Check `has_children` to know if a block has nested content
- Synced blocks return reference, not content—retrieve original block

---

## Capability: Append Block Children

~~~meta
id: blocks.children.append
transport: HTTP PATCH /v1/blocks/{id}/children
auth: required
idempotent: false
~~~

### Intention

Add new blocks to a page or as children of an existing block. Use this to add content to pages. Blocks are appended after existing children.

### Input

```typescript
interface AppendBlockChildrenRequest {
  id: UUID;  // Block or page ID (path parameter)
  children: BlockInput[];
  after?: UUID;  // Insert after this block ID instead of at end
}
```

### Output

```typescript
type AppendBlockChildrenResponse = PaginatedResponse<Block>;
```

### Logic Constraints

- Maximum 100 blocks per request
- Can include nested children up to 2 levels deep
- Use `after` to insert at specific position
- Some block types cannot have children (divider, equation, etc.)

---

## Capability: Retrieve Block

~~~meta
id: blocks.retrieve
transport: HTTP GET /v1/blocks/{id}
auth: required
idempotent: true
~~~

### Intention

Retrieve a single block by ID. Use this when you need details about a specific block or to check if it has children before recursing.

### Input

```typescript
interface RetrieveBlockRequest {
  id: UUID;  // Path parameter
}
```

### Output

```typescript
type RetrieveBlockResponse = Block;
```

---

## Capability: Update Block

~~~meta
id: blocks.update
transport: HTTP PATCH /v1/blocks/{id}
auth: required
idempotent: true
~~~

### Intention

Update a block's content or archive it. Use this to modify existing page content. Different block types have different updatable fields.

### Input

```typescript
interface UpdateBlockRequest {
  id: UUID;  // Path parameter
  archived?: boolean;  // true to delete
  // Type-specific updates (include only one):
  paragraph?: { rich_text: RichText[]; color?: Color };
  heading_1?: { rich_text: RichText[]; color?: Color };
  heading_2?: { rich_text: RichText[]; color?: Color };
  heading_3?: { rich_text: RichText[]; color?: Color };
  bulleted_list_item?: { rich_text: RichText[]; color?: Color };
  numbered_list_item?: { rich_text: RichText[]; color?: Color };
  to_do?: { rich_text?: RichText[]; checked?: boolean; color?: Color };
  toggle?: { rich_text: RichText[]; color?: Color };
  quote?: { rich_text: RichText[]; color?: Color };
  callout?: { rich_text?: RichText[]; icon?: Icon; color?: Color };
  code?: { rich_text: RichText[]; language?: string };
  embed?: { url: string };
  bookmark?: { url: string; caption?: RichText[] };
  image?: { external: { url: string } };
  video?: { external: { url: string } };
  file?: { external: { url: string } };
  pdf?: { external: { url: string } };
}
```

### Output

```typescript
type UpdateBlockResponse = Block;
```

### Logic Constraints

- Cannot change a block's type
- Some blocks are read-only (child_page, child_database, synced references)
- Set `archived: true` to delete the block

---

## Capability: Delete Block

~~~meta
id: blocks.delete
transport: HTTP DELETE /v1/blocks/{id}
auth: required
idempotent: true
~~~

### Intention

Delete a block (move to trash). This also deletes all children of the block. Equivalent to setting `archived: true` via update.

### Input

```typescript
interface DeleteBlockRequest {
  id: UUID;  // Path parameter
}
```

### Output

```typescript
type DeleteBlockResponse = Block;  // Returns the archived block
```

---

## Capability: List Users

~~~meta
id: users.list
transport: HTTP GET /v1/users
auth: required
idempotent: true
~~~

### Intention

List all users in the workspace. Use this to discover user IDs for people properties or to audit workspace membership.

### Input

```typescript
interface ListUsersRequest extends PaginatedRequest {}
```

### Output

```typescript
type ListUsersResponse = PaginatedResponse<User>;
```

### Logic Constraints

- Requires workspace-level integration (not page-level)
- Returns both people and bot users
- `page_size` maximum is 100

---

## Capability: Retrieve User

~~~meta
id: users.retrieve
transport: HTTP GET /v1/users/{id}
auth: required
idempotent: true
~~~

### Intention

Retrieve details about a specific user by ID. Use this when you have a user ID from a property value or audit log and need their name/email.

### Input

```typescript
interface RetrieveUserRequest {
  id: UUID;  // Path parameter
}
```

### Output

```typescript
type RetrieveUserResponse = User;
```

---

## Capability: Retrieve Bot User

~~~meta
id: users.me
transport: HTTP GET /v1/users/me
auth: required
idempotent: true
~~~

### Intention

Retrieve the bot user associated with the current integration token. Use this to verify the integration is working and to get the bot's user ID.

### Output

```typescript
type RetrieveBotUserResponse = User;  // type will be "bot"
```

---

## Capability: Create Comment

~~~meta
id: comments.create
transport: HTTP POST /v1/comments
auth: required
idempotent: false
~~~

### Intention

Add a comment to a page or start a discussion thread on a block. Use this for automated feedback, review comments, or audit trails.

### Input

```typescript
interface CreateCommentRequest {
  parent: { page_id: UUID } | { discussion_id: UUID };
  rich_text: RichText[];
}
```

### Output

```typescript
type CreateCommentResponse = Comment;
```

### Logic Constraints

- `page_id` creates a new discussion thread on the page
- `discussion_id` replies to an existing thread
- Integration must have comment capability enabled

---

## Capability: List Comments

~~~meta
id: comments.list
transport: HTTP GET /v1/comments
auth: required
idempotent: true
~~~

### Intention

Retrieve comments from a page or block. Use this to read feedback, review existing discussions, or sync comments to external systems.

### Input

```typescript
interface ListCommentsRequest extends PaginatedRequest {
  block_id: UUID;  // Query parameter - page or block ID
}
```

### Output

```typescript
type ListCommentsResponse = PaginatedResponse<Comment>;
```

### Logic Constraints

- `block_id` can be a page ID or block ID
- Returns all comments in all discussion threads
- Integration must have read comment capability

---

*— End of Specification —*
