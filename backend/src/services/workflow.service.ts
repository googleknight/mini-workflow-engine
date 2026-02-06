import { WorkflowRepository } from "../repositories/workflow.repository";
import {
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
} from "../schemas/workflow.schema";

export class WorkflowService {
  private workflowRepository: WorkflowRepository;

  constructor() {
    this.workflowRepository = new WorkflowRepository();
  }

  async createWorkflow(data: CreateWorkflowDTO) {
    return this.workflowRepository.create(data);
  }

  async getAllWorkflows() {
    // We need to convert BigInt to string/number for JSON response in Controller,
    // but the service returns raw data.
    return this.workflowRepository.findAll();
  }

  async getWorkflowById(id: string) {
    try {
      const bigIntId = BigInt(id);
      const workflow = await this.workflowRepository.findById(bigIntId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }
      return workflow;
    } catch (e: any) {
      // Type as any for now to access message
      if (e instanceof SyntaxError) {
        // BigInt parsing error
        throw new Error("Invalid ID format");
      }
      throw e;
    }
  }

  async getWorkflowByTriggerPath(triggerPath: string) {
    const workflow =
      await this.workflowRepository.findByTriggerPath(triggerPath);
    if (!workflow) {
      return null;
    }
    return workflow;
  }

  async updateWorkflow(id: string, data: UpdateWorkflowDTO) {
    try {
      const bigIntId = BigInt(id);
      // Check if exists first
      const exists = await this.workflowRepository.findById(bigIntId);
      if (!exists) {
        throw new Error("Workflow not found");
      }
      return this.workflowRepository.update(bigIntId, data);
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        throw new Error("Invalid ID format");
      }
      throw e;
    }
  }

  async deleteWorkflow(id: string) {
    try {
      const bigIntId = BigInt(id);
      const exists = await this.workflowRepository.findById(bigIntId);
      if (!exists) {
        throw new Error("Workflow not found");
      }
      return this.workflowRepository.delete(bigIntId);
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        throw new Error("Invalid ID format");
      }
      throw e;
    }
  }
}
