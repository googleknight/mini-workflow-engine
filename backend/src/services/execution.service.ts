import { Workflow, RunStatus } from "@prisma/client";
import { WorkflowRunRepository } from "../repositories/workflow-run.repository";
import {
  WorkflowStep,
  FilterStep,
  TransformStep,
  HttpRequestStep,
} from "../schemas/workflow.schema";
import axios, { AxiosRequestConfig } from "axios";
import get from "lodash/get";
import set from "lodash/set";
import logger from "../lib/logger";
import {
  StepType,
  FilterOperator,
  TransformOperator,
  HttpBodyMode,
} from "../types/enums";

export class ExecutionService {
  private runRepository: WorkflowRunRepository;

  constructor() {
    this.runRepository = new WorkflowRunRepository();
  }

  async executeWorkflow(workflow: Workflow, initialPayload: any) {
    // 1. Initialize Context
    let ctx = initialPayload;

    // 2. Create Workflow Run
    const run = await this.runRepository.create({
      workflowId: workflow.id,
      status: RunStatus.SUCCESS, // optimistic default, will update if fails/skips
      startTime: new Date(),
    });

    try {
      const steps = workflow.steps as unknown as WorkflowStep[];

      // 3. Execute Steps
      for (const step of steps) {
        const shouldContinue = await this.executeStep(step, ctx);

        if (!shouldContinue) {
          // Filter step returned false -> SKIPPED
          await this.runRepository.update(run.id, {
            status: RunStatus.SKIPPED,
            endTime: new Date(),
          });
          return { runId: run.id.toString(), status: RunStatus.SKIPPED };
        }
      }

      // 4. Success
      await this.runRepository.update(run.id, {
        status: RunStatus.SUCCESS,
        endTime: new Date(),
      });
      return { runId: run.id.toString(), status: RunStatus.SUCCESS };
    } catch (error: any) {
      // 5. Failure
      logger.error(
        { err: error, workflowId: workflow.id },
        `Workflow execution failed: ${error.message}`,
      );

      const failureMeta = error.response
        ? {
            status: error.response.status,
            headers: error.response.headers,
            data: error.response.data,
          }
        : {
            code: error.code,
            message: error.message,
          };

      await this.runRepository.update(run.id, {
        status: RunStatus.FAILED,
        endTime: new Date(),
        errorMessage: error.message,
        failureMeta,
      });

      return {
        runId: run.id.toString(),
        status: RunStatus.FAILED,
        error: error.message,
      };
    }
  }

  private async executeStep(step: WorkflowStep, ctx: any): Promise<boolean> {
    switch (step.type) {
      case StepType.FILTER:
        return this.executeFilterStep(step, ctx);
      case StepType.TRANSFORM:
        this.executeTransformStep(step, ctx);
        return true;
      case StepType.HTTP_REQUEST:
        await this.executeHttpStep(step, ctx);
        return true;
      default:
        throw new Error(`Unknown step type: ${(step as any).type}`);
    }
  }

  private executeFilterStep(step: FilterStep, ctx: any): boolean {
    for (const condition of step.conditions) {
      const value = get(ctx, condition.path);
      const target = condition.value;

      if (condition.op === FilterOperator.EQ && value !== target) return false;
      if (condition.op === FilterOperator.NEQ && value === target) return false;
    }
    return true;
  }

  private executeTransformStep(step: TransformStep, ctx: any): void {
    for (const op of step.ops) {
      switch (op.op) {
        case TransformOperator.DEFAULT: {
          const current = get(ctx, op.path);
          if (current === undefined || current === null || current === "") {
            set(ctx, op.path, op.value);
          }
          break;
        }
        case TransformOperator.TEMPLATE: {
          // generic template replacement {{var}}
          const processed = this.applyTemplate(op.template, ctx);
          set(ctx, op.to, processed);
          break;
        }
        case TransformOperator.PICK: {
          // pick creates a NEW object with only selected paths
          const newCtx = {};
          for (const path of op.paths) {
            const val = get(ctx, path);
            if (val !== undefined) {
              set(newCtx, path, val);
            }
          }

          // clear and copy back
          for (const key in ctx) delete ctx[key];
          Object.assign(ctx, newCtx);
          break;
        }
      }
    }
  }

  private async executeHttpStep(
    step: HttpRequestStep,
    ctx: any,
  ): Promise<void> {
    const url = this.applyTemplate(step.url, ctx);
    const headers = step.headers || {};
    let body = {};

    // Resolve Headers
    const resolvedHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      resolvedHeaders[k] = this.applyTemplate(v, ctx);
    }

    // Resolve Body
    if (step.body?.mode === HttpBodyMode.CTX) {
      body = ctx;
    } else if (step.body?.mode === HttpBodyMode.CUSTOM) {
      body = this.resolveObjectTemplates(step.body.value, ctx);
    }

    const config: AxiosRequestConfig = {
      method: step.method,
      url,
      headers: resolvedHeaders,
      data: body,
      timeout: step.timeoutMs,
    };

    const retries = step.retries || 0;

    await this.retryHttp(config, retries);
  }

  private async retryHttp(
    config: AxiosRequestConfig,
    retries: number,
  ): Promise<void> {
    let attempted = 0;
    while (attempted <= retries) {
      try {
        await axios(config);
        return; // Success
      } catch (error: any) {
        attempted++;

        const isNetworkError = !error.response;
        const is5xx = error.response && error.response.status >= 500;

        if ((isNetworkError || is5xx) && attempted <= retries) {
          // Wait before retry? Requirements don't mandate backoff but it's "a plus".
          // I'll add a small delay (e.g., 100ms * 2^attempt)
          await new Promise((r) => setTimeout(r, 100 * Math.pow(2, attempted)));
          continue;
        }

        // If neither or out of retries, throw
        throw error;
      }
    }
  }

  private applyTemplate(template: string, ctx: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const val = get(ctx, path.trim());
      return val === undefined || val === null ? "" : String(val);
    });
  }

  private resolveObjectTemplates(obj: any, ctx: any): any {
    if (typeof obj === "string") {
      return this.applyTemplate(obj, ctx);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.resolveObjectTemplates(item, ctx));
    }
    if (typeof obj === "object" && obj !== null) {
      const res: any = {};
      for (const key in obj) {
        res[key] = this.resolveObjectTemplates(obj[key], ctx);
      }
      return res;
    }
    return obj;
  }
}
