import { PrismaClient } from "@prisma/client";
import {
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
} from "../schemas/workflow.schema";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/prisma";

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
      select: {
        id: true,
        name: true,
        enabled: true,
        triggerPath: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.workflow.findUnique({
      where: { id },
    });
  }

  async findByTriggerPath(triggerPath: string) {
    return this.prisma.workflow.findUnique({
      where: { triggerPath },
    });
  }

  async update(id: number, data: UpdateWorkflowDTO) {
    return this.prisma.workflow.update({
      where: { id },
      data: {
        ...data,
        steps: data.steps ? (data.steps as any) : undefined,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.workflow.delete({
      where: { id },
    });
  }
}
