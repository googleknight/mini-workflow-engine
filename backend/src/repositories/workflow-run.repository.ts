import { PrismaClient } from "@prisma/client";
import prisma from "../lib/prisma";

export interface CreateRunDTO {
  workflowId: number;
  status: "success" | "skipped" | "failed";
  startTime: Date;
  endTime?: Date;
  errorMessage?: string;
  failureMeta?: any;
}

export interface UpdateRunDTO {
  status?: "success" | "skipped" | "failed";
  endTime?: Date;
  errorMessage?: string;
  failureMeta?: any;
}

export class WorkflowRunRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: CreateRunDTO) {
    return this.prisma.workflowRun.create({
      data: {
        workflowId: data.workflowId,
        status: data.status,
        startTime: data.startTime,
        endTime: data.endTime,
        errorMessage: data.errorMessage,
        failureMeta: data.failureMeta,
      },
    });
  }

  async update(id: number, data: UpdateRunDTO) {
    return this.prisma.workflowRun.update({
      where: { id },
      data,
    });
  }
}
