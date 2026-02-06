import { Workflow, CreateWorkflowDTO, UpdateWorkflowDTO } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function fetchWorkflows(): Promise<Workflow[]> {
  const res = await fetch(`${API_BASE}/workflows`);
  if (!res.ok) throw new Error("Failed to fetch workflows");
  return res.json();
}

export async function fetchWorkflow(id: string): Promise<Workflow> {
  const res = await fetch(`${API_BASE}/workflows/${id}`);
  if (!res.ok) throw new Error("Failed to fetch workflow");
  return res.json();
}

export async function createWorkflow(
  data: CreateWorkflowDTO,
): Promise<Workflow> {
  const res = await fetch(`${API_BASE}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    let msg = errorData.error || "Failed to create workflow";
    if (errorData.details) {
      msg = errorData.details.map((d: any) => d.message).join("\n");
    }
    throw new Error(msg);
  }
  return res.json();
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
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    let msg = errorData.error || "Failed to update workflow";
    if (errorData.details) {
      msg = errorData.details.map((d: any) => d.message).join("\n");
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteWorkflow(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/workflows/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    // Delete might not return JSON, attempt to read anyway
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete workflow");
  }
}
