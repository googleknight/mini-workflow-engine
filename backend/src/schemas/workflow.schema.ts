import { z } from "zod";

export const FilterStepSchema = z.object({
  type: z.literal("filter"),
  conditions: z.array(
    z.object({
      path: z.string(),
      op: z.enum(["eq", "neq"]),
      value: z.any(),
    }),
  ),
});

export const LogStepSchema = z.object({
  type: z.literal("log"),
  message: z.string(),
});

export const TransformStepSchema = z.object({
  type: z.literal("transform"),
  ops: z.array(
    z.union([
      z.object({
        op: z.literal("default"),
        path: z.string(),
        value: z.any(),
      }),
      z.object({
        op: z.literal("template"),
        to: z.string(),
        template: z.string(),
      }),
      z.object({
        op: z.literal("pick"),
        paths: z.array(z.string()),
      }),
    ]),
  ),
});

export const HttpRequestStepSchema = z.object({
  type: z.literal("http_request"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z
    .union([
      z.object({ mode: z.literal("ctx") }),
      z.object({
        mode: z.literal("custom"),
        value: z.record(z.string(), z.any()),
      }),
    ])
    .optional(),
  timeoutMs: z.number().positive().default(2000),
  retries: z.number().min(0).default(3),
});

export const StepSchema = z.union([
  FilterStepSchema,
  LogStepSchema,
  TransformStepSchema,
  HttpRequestStepSchema,
]);

export const CreateWorkflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
  enabled: z.boolean().default(true),
  steps: z.array(StepSchema).min(1, "Workflow must have at least one step"),
});

export const UpdateWorkflowSchema = z.object({
  name: z.string().min(1, "Workflow name cannot be empty").optional(),
  enabled: z.boolean().optional(),
  steps: z
    .array(StepSchema)
    .min(1, "Workflow must have at least one step")
    .optional(),
});

export type FilterStep = z.infer<typeof FilterStepSchema>;
export type LogStep = z.infer<typeof LogStepSchema>;
export type TransformStep = z.infer<typeof TransformStepSchema>;
export type HttpRequestStep = z.infer<typeof HttpRequestStepSchema>;
export type WorkflowStep = z.infer<typeof StepSchema>;

export type CreateWorkflowDTO = z.infer<typeof CreateWorkflowSchema>;
export type UpdateWorkflowDTO = z.infer<typeof UpdateWorkflowSchema>;
