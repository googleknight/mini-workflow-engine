import { Request, Response } from "express";
import { WorkflowService } from "../services/workflow.service";

// Helper to handle BigInt serialization
const serializeBigInt = (key: string, value: any) => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

// Helper middleware or wrapper could be better, but doing it inline for now or
// using a JSON replacer in res.json is tricky in Express without a custom sender.
// I will just map the result manually for single items or define a transform helper.

const safeJson = (res: Response, data: any, status: number = 200) => {
  res.status(status).send(JSON.stringify(data, serializeBigInt));
};

export class WorkflowController {
  private workflowService: WorkflowService;

  constructor() {
    this.workflowService = new WorkflowService();
  }

  create = async (req: Request, res: Response) => {
    try {
      const workflow = await this.workflowService.createWorkflow(req.body);
      safeJson(res, workflow, 201);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const workflows = await this.workflowService.getAllWorkflows();
      safeJson(res, workflows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getOne = async (req: Request, res: Response) => {
    try {
      const workflow = await this.workflowService.getWorkflowById(
        req.params.id as string,
      );
      safeJson(res, workflow);
    } catch (error: any) {
      if (error.message === "Workflow not found") {
        res.status(404).json({ error: "Workflow not found" });
      } else if (error.message === "Invalid ID format") {
        res.status(400).json({ error: "Invalid ID format" });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const workflow = await this.workflowService.updateWorkflow(
        req.params.id as string,
        req.body,
      );
      safeJson(res, workflow);
    } catch (error: any) {
      if (error.message === "Workflow not found") {
        res.status(404).json({ error: "Workflow not found" });
      } else if (error.message === "Invalid ID format") {
        res.status(400).json({ error: "Invalid ID format" });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.workflowService.deleteWorkflow(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Workflow not found") {
        res.status(404).json({ error: "Workflow not found" });
      } else if (error.message === "Invalid ID format") {
        res.status(400).json({ error: "Invalid ID format" });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };
}
