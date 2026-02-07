import { Request, Response } from "express";
import { WorkflowService } from "../services/workflow.service";

export class WorkflowController {
  private workflowService: WorkflowService;

  constructor() {
    this.workflowService = new WorkflowService();
  }

  create = async (req: Request, res: Response) => {
    const workflow = await this.workflowService.createWorkflow(req.body);
    res.status(201).json(workflow);
  };

  getAll = async (req: Request, res: Response) => {
    const workflows = await this.workflowService.getAllWorkflows();
    res.status(200).json(workflows);
  };

  getOne = async (req: Request, res: Response) => {
    const workflow = await this.workflowService.getWorkflowById(
      req.params.id as string,
    );
    res.status(200).json(workflow);
  };

  update = async (req: Request, res: Response) => {
    const workflow = await this.workflowService.updateWorkflow(
      req.params.id as string,
      req.body,
    );
    res.status(200).json(workflow);
  };

  delete = async (req: Request, res: Response) => {
    await this.workflowService.deleteWorkflow(req.params.id as string);
    res.status(204).send();
  };
}
