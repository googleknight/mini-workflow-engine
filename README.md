# Mini Workflow Engine

A lightweight, feature-rich workflow automation engine built with Node.js, Express, Next.js, and PostgreSQL. It allows users to define, manage, and execute multi-step workflows triggered via HTTP requests.

## 🚀 Quick Start

The project includes a convenient development script to automate the setup and execution process.

### Prerequisites

- **Node.js**: v18 or later
- **Docker & Docker Compose**: For running the PostgreSQL database

### 1. Initial Setup

To install dependencies and set up environment files, run:

```bash
chmod +x dev.sh
./dev.sh --init
```

This will:

- Create `.env` files from `.env.example` in both `frontend` and `backend` directories.
- Install npm dependencies for both applications.

### 2. Running Local Development

To start the database, run migrations, and launch both frontend and backend servers:

```bash
./dev.sh
```

**Note:** Ensure Docker is running before executing this command. The script will automatically:

- Start the PostgreSQL container via `docker-compose`.
- Generate Prisma client and apply database migrations.
- Start the backend server on [http://localhost:4000](http://localhost:4000).
- Start the frontend server on [http://localhost:3000](http://localhost:3000).

---

## 🛠 Project Structure

- **/backend**: Express.js API with Prisma ORM.
- **/frontend**: Next.js application with React Query and Monaco Editor.
- **/docker-compose.yml**: Defines the PostgreSQL database service.
- **dev.sh**: Main entry point for development tasks.

## 🐳 Docker Configuration

The database is managed via Docker Compose. If you need to manage the database separately:

```bash
# Start only the database
docker-compose up -d

# Stop the database and remove volumes
docker-compose down -v
```

## 📖 API Documentation

Once the backend is running, you can access the Interactive Swagger UI at:
[http://localhost:4000/api-docs](http://localhost:4000/api-docs)

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## Assumptions and Trade-offs

This section documents all assumptions and trade-offs made during the implementation of the workflow engine, based on the provided requirements and subsequent clarifications.

---

### 1. Tenancy and Users

**Assumption**

- The application is implemented as a **single-tenant system**.
- No authentication, authorization, or user ownership model is included.
- All workflows are globally visible and editable.

**Trade-off**

- This simplifies the system and keeps the scope aligned with the assignment.
- Multi-tenancy and access control are intentionally out of scope.

---

### 2. Workflow Execution Semantics

**Assumption**

- Each HTTP `POST` request to a workflow’s trigger URL creates a **new workflow run**.
- No idempotency or deduplication logic is implemented.
- Workflows can be triggered an unlimited number of times while enabled.

**Trade-off**

- Avoids additional complexity around request deduplication and event IDs.
- Aligns with clarified requirement that “exactly-once” processing is no longer required.

---

### 3. HTTP Request Steps

**Assumption**

- HTTP retries are handled **synchronously** within the same workflow run using an **exponential backoff** strategy.
- Chaining or dependency handling between multiple HTTP request steps is not required.
- Only **failed HTTP requests** have their details persisted.

Persisted failure details include:

- HTTP status code
- Response headers
- Response body

**Trade-off**

- Successful HTTP responses are not persisted to reduce storage complexity.
- HTTP response bodies are not merged back into `ctx`.

---

### 4. Context (`ctx`) Behavior

**Assumption**

- `ctx` is initialized using the inbound HTTP request body.
- Missing paths accessed via dot-notation resolve to `null`.
- Only transform steps are allowed to mutate `ctx`.
- Filter steps do not modify `ctx`.

**Trade-off**

- Keeps the execution model predictable and easy to reason about.
- Avoids side effects outside of explicit transform steps.

---

### 5. Validation Rules

**Assumption**

- Workflows with an empty `steps` array are rejected as invalid.
- Unknown step types result in validation errors.
- Unsupported transform operations result in validation errors.

**Trade-off**

- Strict validation provides clearer feedback to users.
- Prevents undefined or partially implemented behavior at runtime.

---

### 6. Frontend Scope

**Assumption**

- Workflow steps are edited as **raw JSON** using a code editor.
- No visual workflow builder or drag-and-drop UI is implemented.
- No UI is provided to manually trigger workflows for testing.

**Trade-off**

- Keeps the frontend minimal and focused on correctness.
- Matches the explicit frontend requirements in the assignment.

---

### 7. Persistence Scope

**Assumption**

- Workflow runs persist:
  - Status (`success`, `skipped`, `failed`)
  - Start and end timestamps
  - Error details (where applicable)

**Trade-off**

- Detailed execution traces and metrics are not persisted.
- Keeps database schema simple and aligned with requirements.

---

### 8. Explicit Non-Goals

The following features are intentionally **not implemented**:

- Authentication and user management
- Role-based access control
- Rate limiting
- Background job queues
- Cron or scheduled triggers
- Webhook signature verification
- Visual workflow designer
- Monitoring or analytics dashboards

These are considered outside the scope of the assignment.

---

### 9. Documentation

All assumptions and trade-offs are explicitly documented here to ensure transparency and alignment with the assignment expectations.
