import { z } from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

import {
  CreateWorkflowSchema,
  UpdateWorkflowSchema,
  StepSchema,
  FilterStepSchema,
  TransformStepSchema,
  HttpRequestStepSchema,
} from "../schemas/workflow.schema";

const registry = new OpenAPIRegistry();

// Register Components
registry.register("FilterStep", FilterStepSchema);
registry.register("TransformStep", TransformStepSchema);
registry.register("HttpRequestStep", HttpRequestStepSchema);
registry.register("WorkflowStep", StepSchema);

const WorkflowResponseSchema = z.object({
  id: z.number(), // Normal Int
  name: z.string(),
  enabled: z.boolean(),
  triggerPath: z.string(),
  steps: z.array(StepSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

registry.register("Workflow", WorkflowResponseSchema);

// Define Paths
registry.registerPath({
  method: "post",
  path: "/workflows",
  summary: "Create a new workflow",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateWorkflowSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Workflow created successfully",
      content: {
        "application/json": {
          schema: WorkflowResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/workflows",
  summary: "List all workflows",
  responses: {
    200: {
      description: "List of workflows",
      content: {
        "application/json": {
          schema: z.array(WorkflowResponseSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/workflows/{id}",
  summary: "Get a workflow by ID",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "Workflow details",
      content: {
        "application/json": {
          schema: WorkflowResponseSchema,
        },
      },
    },
    404: {
      description: "Workflow not found",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/workflows/{id}",
  summary: "Update a workflow",
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: UpdateWorkflowSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Workflow updated successfully",
      content: {
        "application/json": {
          schema: WorkflowResponseSchema,
        },
      },
    },
    404: {
      description: "Workflow not found",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/workflows/{id}",
  summary: "Delete a workflow",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: {
      description: "Workflow deleted successfully",
    },
    404: {
      description: "Workflow not found",
    },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Mini Workflow Engine API",
    description: "API for managing and triggering workflows",
  },
  servers: [{ url: "/api" }], // Adjust if serving globally or under /api
});
