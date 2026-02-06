import { Workflow } from "@prisma/client";
import { WorkflowRunRepository } from "../repositories/workflow-run.repository";
import {
  WorkflowStep,
  FilterStep,
  LogStep,
  TransformStep,
  HttpRequestStep,
} from "../schemas/workflow.schema";
import _ from "lodash";
import axios, { AxiosRequestConfig } from "axios";

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
      status: "success", // optimistic default, will update if fails/skips
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
            status: "skipped",
            endTime: new Date(),
          });
          return { runId: run.id.toString(), status: "skipped" };
        }
      }

      // 4. Success
      await this.runRepository.update(run.id, {
        status: "success",
        endTime: new Date(),
      });
      return { runId: run.id.toString(), status: "success" };
    } catch (error: any) {
      // 5. Failure
      console.error(`Workflow execution failed for run ${run.id}:`, error);

      const failureMeta = error.response
        ? {
            status: error.response.status,
            headers: error.response.headers,
            data: error.response.data,
          }
        : undefined;

      await this.runRepository.update(run.id, {
        status: "failed",
        endTime: new Date(),
        errorMessage: error.message,
        failureMeta,
      });

      return { runId: run.id.toString(), status: "failed" };
    }
  }

  private async executeStep(step: WorkflowStep, ctx: any): Promise<boolean> {
    switch (step.type) {
      case "filter":
        return this.executeFilterStep(step, ctx);
      case "log":
        this.executeLogStep(step, ctx);
        return true;
      case "transform":
        this.executeTransformStep(step, ctx);
        return true;
      case "http_request":
        await this.executeHttpStep(step, ctx);
        return true;
      default:
        throw new Error(`Unknown step type: ${(step as any).type}`);
    }
  }

  private executeFilterStep(step: FilterStep, ctx: any): boolean {
    for (const condition of step.conditions) {
      const value = _.get(ctx, condition.path);
      const target = condition.value;

      if (condition.op === "eq" && value !== target) return false;
      if (condition.op === "neq" && value === target) return false;
    }
    return true;
  }

  private executeLogStep(step: LogStep, ctx: any): void {
    const message = this.applyTemplate(step.message, ctx);
    console.log(`[Workflow Log] ${message}`);
  }

  private executeTransformStep(step: TransformStep, ctx: any): void {
    for (const op of step.ops) {
      switch (op.op) {
        case "default": {
          const current = _.get(ctx, op.path);
          if (current === undefined || current === null || current === "") {
            _.set(ctx, op.path, op.value);
          }
          break;
        }
        case "template": {
          // generic template replacement {{var}}
          const processed = this.applyTemplate(op.template, ctx);
          _.set(ctx, op.to, processed);
          break;
        }
        case "pick": {
          // pick creates a NEW object with only selected paths
          // Since we need to modify ctx in place (or replace it),
          // and ctx is passed by reference, we can't just reassign `ctx`.
          // However, the requirements say "Modify ctx".
          // Ideally we should replace the keys of ctx.
          const newCtx = {};
          for (const path of op.paths) {
            const val = _.get(ctx, path);
            if (val !== undefined) {
              _.set(newCtx, path, val);
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
    let url = step.url;
    let headers = step.headers || {};
    let body = {};

    // Template URL & Headers (optional but good practice)
    // Requirements only mention body templates, but usually URL/headers need it too.
    // I'll support basic templating in URL/Header values if needed,
    // but strict requirements only mention data transformation via Transform step before.
    // "Transform step: ... template: create a string ... to: title".
    // "HTTP request step ... body: ... value: { 'text': '{{title}}' }"

    // So templating happens in:
    // 1. Transform step (saving to ctx)
    // 2. HTTP Body (if mode=custom)
    // 3. HTTP Header (X-Workflow-Id: {{workflow_id}})

    // Resolve Headers
    const resolvedHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      resolvedHeaders[k] = this.applyTemplate(v, ctx);
    }

    // Resolve Body
    if (step.body?.mode === "ctx") {
      body = ctx;
    } else if (step.body?.mode === "custom") {
      body = this.resolveObjectTemplates(step.body.value, ctx);
    }

    const config: AxiosRequestConfig = {
      method: step.method,
      url: step.url, // Assuming URL doesn't need templating for now based on samples
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
      const val = _.get(ctx, path.trim());
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
