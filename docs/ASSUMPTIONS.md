# Assumptions and Trade-offs

This section documents all assumptions and trade-offs made during the implementation of the workflow engine, based on the provided requirements and subsequent clarifications.

---

### 1. Tenancy and Users

**Assumption**

- The application is implemented as a **single-tenant system**.
- No authentication, authorization, or user ownership model is included.
- All workflows are globally visible and editable.

**Trade-off**

- This simplifies the system and keeps the scope aligned with the project.
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
- Matches the explicit frontend requirements.

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

These are considered outside the scope of the project.

---

### 9. Documentation

All assumptions and trade-offs are explicitly documented here to ensure transparency and alignment with the expectations.
