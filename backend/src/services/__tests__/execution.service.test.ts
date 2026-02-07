import { ExecutionService } from "../execution.service";
import { WorkflowRunRepository } from "../../repositories/workflow-run.repository";
import axios from "axios";

jest.mock("../../repositories/workflow-run.repository");
jest.mock("axios");
jest.mock("../../lib/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));
const mockedAxios = axios as jest.MockedFunction<typeof axios>;

describe("ExecutionService", () => {
  let executionService: ExecutionService;
  let mockRunRepository: jest.Mocked<WorkflowRunRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    executionService = new ExecutionService();
    mockRunRepository = (executionService as any).runRepository;

    // Default mock for run creation
    mockRunRepository.create.mockResolvedValue({
      id: 1,
      status: "success",
    } as any);
    mockRunRepository.update.mockResolvedValue({ id: 1 } as any);
  });

  describe("executeWorkflow", () => {
    it("should execute a simple log step and succeed", async () => {
      const workflow = {
        id: 1,
        steps: [{ type: "log", message: "Hello {{name}}" }],
      };
      const payload = { name: "World" };

      const result = await executionService.executeWorkflow(
        workflow as any,
        payload,
      );

      expect(result.status).toBe("success");
      expect(mockRunRepository.create).toHaveBeenCalled();
      expect(mockRunRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: "success" }),
      );
    });

    it("should skip subsequent steps if a filter step returns false", async () => {
      const workflow = {
        id: 1,
        steps: [
          {
            type: "filter",
            conditions: [{ path: "age", op: "eq", value: 25 }],
          },
          { type: "log", message: "This should be skipped" },
        ],
      };
      const payload = { age: 30 };

      const result = await executionService.executeWorkflow(
        workflow as any,
        payload,
      );

      expect(result.status).toBe("skipped");
      expect(mockRunRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: "skipped" }),
      );
    });

    it("should handle transform steps correctly", async () => {
      const workflow = {
        id: 1,
        steps: [
          {
            type: "transform",
            ops: [{ op: "default", path: "city", value: "London" }],
          },
        ],
      };
      const payload = {};

      const result = await executionService.executeWorkflow(
        workflow as any,
        payload,
      );

      expect(result.status).toBe("success");
      // Context is modified in place
      expect(payload).toEqual({ city: "London" });
    });

    it("should handle http_request steps and fail on error after retries", async () => {
      const workflow = {
        id: 1,
        steps: [
          {
            type: "http_request",
            method: "GET",
            url: "http://test.com",
            retries: 1,
          },
        ],
      };

      mockedAxios.mockRejectedValue(new Error("Network Error"));

      const result = await executionService.executeWorkflow(
        workflow as any,
        {},
      );

      expect(result.status).toBe("failed");
      expect(mockedAxios).toHaveBeenCalledTimes(2); // Initial try + 1 retry
      expect(mockRunRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: "failed" }),
      );
    });
  });

  describe("Step Logic", () => {
    it("applyTemplate should replace placeholders", () => {
      const template = "Hello {{user.name}}!";
      const ctx = { user: { name: "Alice" } };
      const result = (executionService as any).applyTemplate(template, ctx);
      expect(result).toBe("Hello Alice!");
    });

    it("executeFilterStep should support eq and neq", () => {
      const step = {
        type: "filter",
        conditions: [
          { path: "a", op: "eq", value: 1 },
          { path: "b", op: "neq", value: 2 },
        ],
      };

      expect(
        (executionService as any).executeFilterStep(step, { a: 1, b: 3 }),
      ).toBe(true);
      expect(
        (executionService as any).executeFilterStep(step, { a: 2, b: 3 }),
      ).toBe(false);
      expect(
        (executionService as any).executeFilterStep(step, { a: 1, b: 2 }),
      ).toBe(false);
    });
  });
});
