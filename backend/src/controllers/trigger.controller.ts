import { Request, Response } from "express";
import { WorkflowService } from "../services/workflow.service";
import { ExecutionService } from "../services/execution.service";

const workflowService = new WorkflowService();
const executionService = new ExecutionService();

export const triggerWorkflow = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { triggerPath } = req.params;
  const initialPayload = req.body;

  try {
    const workflow = await workflowService.getWorkflowByTriggerPath(
      triggerPath as string,
    );

    if (!workflow) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    if (!workflow.enabled) {
      res.status(403).json({ error: "Workflow is disabled" });
      return;
    }

    // Execute synchronously
    const RESULT = await executionService.executeWorkflow(
      workflow,
      initialPayload,
    );

    res.status(200).json(RESULT);
  } catch (error) {
    console.error("Trigger error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
