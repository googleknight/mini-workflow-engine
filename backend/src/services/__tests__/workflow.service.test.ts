import { WorkflowService } from "../workflow.service";
import { WorkflowRepository } from "../../repositories/workflow.repository";
import { NotFoundError, BadRequestError } from "../../lib/errors";
import { v4 as uuidv4 } from "uuid";

jest.mock("../../repositories/workflow.repository");

// Mock uuid as requested by the user
jest.mock("uuid", () => ({
  v4: jest.fn(),
  validate: jest.fn(),
}));

describe("WorkflowService", () => {
  let workflowService: WorkflowService;
  let mockRepository: jest.Mocked<WorkflowRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    workflowService = new WorkflowService();
    // Access the private repository instance for mocking
    mockRepository = (workflowService as any).workflowRepository;
  });

  describe("createWorkflow", () => {
    it("should create a workflow", async () => {
      const mockUuid = "00000000-0000-0000-0000-000000000000";
      (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

      const createData = {
        name: "New Workflow",
        enabled: true,
        steps: [],
      };

      const expectedWorkflow = {
        id: 1,
        ...createData,
        triggerPath: mockUuid,
      };

      mockRepository.create.mockResolvedValue(expectedWorkflow as any);

      const result = await workflowService.createWorkflow(createData);

      expect(result).toEqual(expectedWorkflow);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe("getWorkflowById", () => {
    it("should return a workflow if it exists", async () => {
      const mockWorkflow = {
        id: 1,
        name: "Test Workflow",
        enabled: true,
        triggerPath: "path",
      };
      mockRepository.findById.mockResolvedValue(mockWorkflow as any);

      const result = await workflowService.getWorkflowById("1");

      expect(result).toEqual(mockWorkflow);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should throw BadRequestError for invalid ID format", async () => {
      await expect(workflowService.getWorkflowById("invalid")).rejects.toThrow(
        BadRequestError,
      );
    });

    it("should throw NotFoundError if workflow does not exist", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(workflowService.getWorkflowById("1")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("updateWorkflow", () => {
    it("should update and return the workflow", async () => {
      const mockWorkflow = { id: 1, name: "Old" };
      const updateData = { name: "New" };
      mockRepository.findById.mockResolvedValue(mockWorkflow as any);
      mockRepository.update.mockResolvedValue({
        ...mockWorkflow,
        ...updateData,
      } as any);

      const result = await workflowService.updateWorkflow("1", updateData);

      expect(result.name).toBe("New");
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it("should throw NotFoundError if workflow to update does not exist", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        workflowService.updateWorkflow("1", { name: "New" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteWorkflow", () => {
    it("should delete the workflow if it exists", async () => {
      mockRepository.findById.mockResolvedValue({ id: 1 } as any);
      mockRepository.delete.mockResolvedValue({ id: 1 } as any);

      await workflowService.deleteWorkflow("1");

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundError if workflow to delete does not exist", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(workflowService.deleteWorkflow("1")).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
