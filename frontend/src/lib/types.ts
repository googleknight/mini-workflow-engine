export interface Workflow {
  id: string;
  name: string;
  enabled: boolean;
  triggerPath: string;
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
