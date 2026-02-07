import {
  Workflow,
  WorkflowListItem,
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
} from "./types";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    // Backend returns { message: "..." } in our new error handler
    // Older or other parts might return { error: "..." }
    const msg =
      errorData.message || errorData.error || "An unexpected error occurred";
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchWorkflows(): Promise<WorkflowListItem[]> {
  const res = await fetch(`${API_BASE}/workflows`);
  return handleResponse(res);
}

export async function fetchWorkflow(id: string): Promise<Workflow> {
  const res = await fetch(`${API_BASE}/workflows/${id}`);
  return handleResponse(res);
}

export async function createWorkflow(
  data: CreateWorkflowDTO,
): Promise<Workflow> {
  const res = await fetch(`${API_BASE}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateWorkflow(
  id: string,
  data: UpdateWorkflowDTO,
): Promise<Workflow> {
  const res = await fetch(`${API_BASE}/workflows/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteWorkflow(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/workflows/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const msg =
      errorData.message || errorData.error || "Failed to delete workflow";
    throw new Error(msg);
  }
}
