import { Request, Response } from "express";
import { WorkflowService } from "../services/workflow.service";
import { ExecutionService } from "../services/execution.service";
import { NotFoundError, ForbiddenError } from "../lib/errors";

const workflowService = new WorkflowService();
const executionService = new ExecutionService();

export const triggerWorkflow = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { triggerPath } = req.params;
  const initialPayload = req.body;

  const workflow = await workflowService.getWorkflowByTriggerPath(
    triggerPath as string,
  );

  if (!workflow) {
    throw new NotFoundError("Workflow not found");
  }

  if (!workflow.enabled) {
    throw new ForbiddenError("Workflow is disabled");
  }

  // Execute synchronously
  const RESULT = await executionService.executeWorkflow(
    workflow,
    initialPayload,
  );

  res.status(200).json(RESULT);
};
