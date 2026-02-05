# Technical Specifications - Mini Workflow Engine

## 1. Technology Stack & Justification

| Technology          | Recommendation | Justification                                                                                                                                           |
| :------------------ | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Node.js/Express** | Backend        | Industry standard for building lightweight, scalable APIs. Its non-blocking I/O is ideal for handling webhooks and sequential execution steps.          |
| **TypeScript**      | Language       | Essential for complex logic like the Workflow Execution Engine. Strong typing prevents runtime errors in context manipulation and step transformations. |
| **PostgreSQL**      | Database       | Robust relational integrity and performance. JSONB support allows for flexible querying of workflow steps and execution context.                        |
| **Prisma**          | ORM            | Provides a type-safe database client and automated migration workflows, accelerating development while maintaining safety.                              |
| **Next.js**         | Frontend       | Modern React framework with built-in routing and performance optimizations.                                                                             |
| **Vanilla CSS**     | Styling        | Chosen to demonstrate design fundamentals, utilizing CSS Variables for dark/light mode and precise control over components without utility-class bloat. |
| **Monaco Editor**   | Code Editor    | Provides a superior developer experience for editing JSON workflows with syntax highlighting and validation.                                            |

---

## 2. Detailed Database Design (PostgreSQL)

Internal entities use sequential IDs for performance and storage efficiency. Public trigger URLs use random, non-guessable identifiers to ensure security.

### 2.1 Table: `workflows`

| Column         | Data Type      | Constraints                 | Description                                                              |
| :------------- | :------------- | :-------------------------- | :----------------------------------------------------------------------- |
| `id`           | `BIGINT`       | `PRIMARY KEY`, `SERIAL`     | Internal sequential ID for efficient indexing and joins.                 |
| `name`         | `VARCHAR(255)` | `NOT NULL`                  | Human-readable name.                                                     |
| `enabled`      | `BOOLEAN`      | `NOT NULL`, `DEFAULT true`  | Master toggle for the trigger.                                           |
| `trigger_path` | `VARCHAR(64)`  | `NOT NULL`, `UNIQUE`        | Unique random identifier (e.g., UUID or Nanoid) for the public endpoint. |
| `steps`        | `JSONB`        | `NOT NULL`                  | Serialized array of workflow steps.                                      |
| `created_at`   | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` |                                                                          |
| `updated_at`   | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` |                                                                          |

### 2.2 Table: `workflow_runs`

| Column          | Data Type     | Constraints                                          | Description                                                         |
| :-------------- | :------------ | :--------------------------------------------------- | :------------------------------------------------------------------ |
| `id`            | `BIGINT`      | `PRIMARY KEY`, `SERIAL`                              |                                                                     |
| `workflow_id`   | `BIGINT`      | `FOREIGN KEY`, `REFERENCES workflows(id)`            | Cascading delete enabled.                                           |
| `status`        | `VARCHAR(20)` | `CHECK (status IN ('success', 'skipped', 'failed'))` | Manual enum constraint for integrity.                               |
| `start_time`    | `TIMESTAMP`   | `NOT NULL`                                           |                                                                     |
| `end_time`      | `TIMESTAMP`   |                                                      |                                                                     |
| `error_message` | `TEXT`        |                                                      | Debug info for failed runs.                                         |
| `failure_meta`  | `JSONB`       |                                                      | HTTP failure details (status, headers, body) for failed HTTP steps. |

---

## 3. Comprehensive API Contracts

### 3.1 Common Error Responses

- **400 Bad Request**: Malformed JSON, syntax errors, or validation failures.
- **404 Not Found**: Resource (Workflow or Trigger Path) does not exist.
- **500 Internal Server Error**: Unexpected server failure.

### 3.2 Workflow Management (Admin)

- `GET /api/workflows`: Returns all workflows (ID, Name, Enabled, Trigger Path).
- `POST /api/workflows`: Create workflow. Returns 201.
- `GET /api/workflows/:id`: Returns full details including `steps`.
- `PATCH /api/workflows/:id`: Update Name, Enabled status, or Steps.
- `DELETE /api/workflows/:id`: Remove workflow.

### 3.3 Trigger API (Public)

#### `POST /t/:trigger_path`

- **Request Body**: JSON payload (seeds `ctx`).
- **Response (200)**: `{ "runId": BIGINT, "status": "success" | "skipped" | "failed" }`
- **Error (403)**: Returned if the workflow is disabled.
- **Error (404)**: Returned if the trigger path is invalid.

---

## 4. Frontend & State Management

### 4.1 State Management & Decomposition

1. **Server State (React Query)**: Handles fetching, caching, and optimistic updates for workflow settings.
2. **Global UI State (Context API)**: Manages Theme preference (Light/Dark).
3. **Local State (useState)**: Manages editor content and ephemeral UI toggles.

### 4.2 Component Decomposition

- `WorkflowList`: Lists `WorkflowCard` components.
- `WorkflowEditor`: Combines a metadata panel and `MonacoEditor` for JSON steps.
- `ThemeToggle`: Global switcher in the header.
- `RunHistory` (**Optional/Stretch**): Minimal read-only view of recent execution statuses.

---

## 6. Security & CORS Strategy

To ensure production-grade isolation, we will implement a tiered CORS (Cross-Origin Resource Sharing) policy.

### 6.1 Admin API Security (`/api/*`)

- **Restriction**: Limited to the official Frontend Origin.
- **Config**: `Access-Control-Allow-Origin: process.env.FRONTEND_URL`.
- **Rationale**: Ensures that workflow definitions and management capabilities are only accessible via our UI, preventing unauthorized third-party scripts from interacting with the admin backend.

### 6.2 Trigger API Security (`/t/*`)

- **Restriction**: Permissive (`*` or specific webhook origins).
- **Config**: `Access-Control-Allow-Origin: *`.
- **Rationale**: Webhooks are often triggered by external systems (Slack, Discord, Custom Scripts) from various origins. Restricting this would break the core functionality of the engine as a public webhook receiver.

---

## 7. Execution Engine Design

### 5.1 Context (`ctx`) Management

- **Initialization**: `ctx` is initialized from the inbound request body.
- **Execution**: Steps process `ctx` sequentially. `Filter` steps can short-circuit, `Transform` steps can mutate, and `HTTP` steps perform side effects.

### 5.2 Retry Policy

HTTP requests are retried **synchronously** on network errors and 5xx responses, respecting the configured retry count. A fixed delay is used between retries to keep the implementation simple and aligned with requirements.
