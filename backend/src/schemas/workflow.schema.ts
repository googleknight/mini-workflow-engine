import { z } from "zod";
import {
  StepType,
  FilterOperator,
  TransformOperator,
  HttpMethod,
  HttpBodyMode,
} from "../types/enums";

export const FilterStepSchema = z.object({
  type: z.literal(StepType.FILTER),
  conditions: z
    .array(
      z.object({
        path: z.string().min(1, { error: "Condition path is required" }),
        op: z.enum(FilterOperator, { error: "Invalid filter operator" }),
        value: z.unknown(),
      }),
    )
    .min(1, { error: "At least one condition is required" }),
});

export const TransformStepSchema = z.object({
  type: z.literal(StepType.TRANSFORM),
  ops: z
    .array(
      z.discriminatedUnion("op", [
        z.object({
          op: z.literal(TransformOperator.DEFAULT),
          path: z.string().min(1, { error: "Target path is required" }),
          value: z.unknown(),
        }),
        z.object({
          op: z.literal(TransformOperator.TEMPLATE),
          to: z.string().min(1, { error: "Target field 'to' is required" }),
          template: z.string().min(1, { error: "Template string is required" }),
        }),
        z.object({
          op: z.literal(TransformOperator.PICK),
          paths: z
            .array(z.string())
            .min(1, { error: "At least one path to pick is required" }),
        }),
      ]),
    )
    .min(1, { error: "At least one transformation operation is required" }),
});

export const HttpRequestStepSchema = z.object({
  type: z.literal(StepType.HTTP_REQUEST),
  method: z.enum(HttpMethod, { error: "Invalid HTTP method" }),
  url: z.url({ error: "Invalid URL format" }),
  headers: z.record(z.string(), z.string()).optional(),
  body: z
    .discriminatedUnion("mode", [
      z.object({ mode: z.literal(HttpBodyMode.CTX) }),
      z.object({
        mode: z.literal(HttpBodyMode.CUSTOM),
        value: z.record(z.string(), z.unknown()),
      }),
    ])
    .optional(),
  timeoutMs: z.number().positive().default(2000),
  retries: z
    .number()
    .min(0, { error: "Retries cannot be negative" })
    .default(3),
});

export const StepSchema = z.discriminatedUnion("type", [
  FilterStepSchema,
  TransformStepSchema,
  HttpRequestStepSchema,
]);

export const CreateWorkflowSchema = z.object({
  name: z.string().min(1, { error: "Workflow name is required" }),
  enabled: z.boolean().default(true),
  steps: z
    .array(StepSchema)
    .min(1, { error: "Workflow must have at least one step" }),
});

export const UpdateWorkflowSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Workflow name cannot be empty" })
    .optional(),
  enabled: z.boolean().optional(),
  steps: z
    .array(StepSchema)
    .min(1, { error: "Workflow must have at least one step" })
    .optional(),
});

export type FilterStep = z.infer<typeof FilterStepSchema>;
export type TransformStep = z.infer<typeof TransformStepSchema>;
export type HttpRequestStep = z.infer<typeof HttpRequestStepSchema>;
export type WorkflowStep = z.infer<typeof StepSchema>;

export type CreateWorkflowDTO = z.infer<typeof CreateWorkflowSchema>;
export type UpdateWorkflowDTO = z.infer<typeof UpdateWorkflowSchema>;
