// Minimal workflow data for list views
export interface WorkflowListItem {
  id: string;
  name: string;
  enabled: boolean;
  triggerPath: string;
}

// Full workflow data for detail views
export interface Workflow extends WorkflowListItem {
  steps: WorkflowStep[];
  createdAt?: string;
  updatedAt?: string;
}

export type WorkflowStep = Record<string, any>;

export interface CreateWorkflowDTO {
  name: string;
  enabled: boolean;
  steps: WorkflowStep[];
}

export interface UpdateWorkflowDTO {
  name?: string;
  enabled?: boolean;
  steps?: WorkflowStep[];
}
