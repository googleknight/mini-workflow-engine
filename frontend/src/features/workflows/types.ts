import {
  StepType,
  FilterOperator,
  TransformOperator,
  HttpMethod,
  HttpBodyMode,
} from "./enums";

// Minimal workflow data for list views
export interface WorkflowListItem {
  id: string;
  name: string;
  enabled: boolean;
  triggerPath: string;
}

export interface FilterStep {
  type: StepType.FILTER;
  conditions: {
    path: string;
    op: FilterOperator;
    value: any;
  }[];
}

export interface TransformStep {
  type: StepType.TRANSFORM;
  ops: (
    | { op: TransformOperator.DEFAULT; path: string; value: any }
    | { op: TransformOperator.TEMPLATE; to: string; template: string }
    | { op: TransformOperator.PICK; paths: string[] }
  )[];
}

export interface HttpRequestStep {
  type: StepType.HTTP_REQUEST;
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?:
    | { mode: HttpBodyMode.CTX }
    | { mode: HttpBodyMode.CUSTOM; value: Record<string, any> };
  timeoutMs?: number;
  retries?: number;
}

export type WorkflowStep = FilterStep | TransformStep | HttpRequestStep;

// Full workflow data for detail views
export interface Workflow extends WorkflowListItem {
  steps: WorkflowStep[];
  createdAt?: string;
  updatedAt?: string;
}

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
