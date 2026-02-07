import { WorkflowRepository } from "../repositories/workflow.repository";
import {
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
} from "../schemas/workflow.schema";
import { NotFoundError, BadRequestError } from "../lib/errors";

export class WorkflowService {
  private workflowRepository: WorkflowRepository;

  constructor() {
    this.workflowRepository = new WorkflowRepository();
  }

  async createWorkflow(data: CreateWorkflowDTO) {
    return this.workflowRepository.create(data);
  }

  async getAllWorkflows() {
    return this.workflowRepository.findAll();
  }

  async getWorkflowById(id: string) {
    const numId = Number(id);
    if (isNaN(numId)) throw new BadRequestError("Invalid ID format");

    const workflow = await this.workflowRepository.findById(numId);
    if (!workflow) {
      throw new NotFoundError("Workflow not found");
    }
    return workflow;
  }

  async getWorkflowByTriggerPath(triggerPath: string) {
    const workflow =
      await this.workflowRepository.findByTriggerPath(triggerPath);
    return workflow; // Controller handles null case or throws if needed
  }

  async updateWorkflow(id: string, data: UpdateWorkflowDTO) {
    const numId = Number(id);
    if (isNaN(numId)) throw new BadRequestError("Invalid ID format");

    const exists = await this.workflowRepository.findById(numId);
    if (!exists) {
      throw new NotFoundError("Workflow not found");
    }
    return this.workflowRepository.update(numId, data);
  }

  async deleteWorkflow(id: string) {
    const numId = Number(id);
    if (isNaN(numId)) throw new BadRequestError("Invalid ID format");

    const exists = await this.workflowRepository.findById(numId);
    if (!exists) {
      throw new NotFoundError("Workflow not found");
    }
    return this.workflowRepository.delete(numId);
  }
}
