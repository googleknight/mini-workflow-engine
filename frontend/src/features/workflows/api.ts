import {
  Workflow,
  WorkflowListItem,
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
} from "./types";
import { API_ROUTES } from "@/lib/constants";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const JSON_HEADERS = { "Content-Type": "application/json" };

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw errorData;
  }
  return res.json();
}

export async function fetchWorkflows(): Promise<WorkflowListItem[]> {
  const res = await fetch(`${API_BASE}${API_ROUTES.WORKFLOWS}`);
  return handleResponse(res);
}

export async function fetchWorkflow(id: string): Promise<Workflow> {
  const res = await fetch(`${API_BASE}${API_ROUTES.WORKFLOWS}/${id}`);
  return handleResponse(res);
}

export async function createWorkflow(
  data: CreateWorkflowDTO,
): Promise<Workflow> {
  const res = await fetch(`${API_BASE}${API_ROUTES.WORKFLOWS}`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateWorkflow(
  id: string,
  data: UpdateWorkflowDTO,
): Promise<Workflow> {
  const res = await fetch(`${API_BASE}${API_ROUTES.WORKFLOWS}/${id}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteWorkflow(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}${API_ROUTES.WORKFLOWS}/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}
