import { PrismaClient, Workflow } from "@prisma/client";
import {
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
} from "../schemas/workflow.schema";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/prisma"; // Assuming a shared prisma instance

// Fallback if shared instance isn't available yet, but better to create it.
// I will create src/lib/prisma.ts in a bit if it doesn't exist.

export class WorkflowRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: CreateWorkflowDTO) {
    const triggerPath = uuidv4().replace(/-/g, ""); // Simple random path
    return this.prisma.workflow.create({
      data: {
        name: data.name,
        enabled: data.enabled,
        steps: data.steps as any, // Cast to any because Prisma Json is generic
        triggerPath: triggerPath,
      },
    });
  }

  async findAll() {
    return this.prisma.workflow.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: bigint) {
    return this.prisma.workflow.findUnique({
      where: { id },
    });
  }

  async findByTriggerPath(triggerPath: string) {
    return this.prisma.workflow.findUnique({
      where: { triggerPath },
    });
  }

  async update(id: bigint, data: UpdateWorkflowDTO) {
    return this.prisma.workflow.update({
      where: { id },
      data: {
        ...data,
        steps: data.steps ? (data.steps as any) : undefined,
      },
    });
  }

  async delete(id: bigint) {
    return this.prisma.workflow.delete({
      where: { id },
    });
  }
}
