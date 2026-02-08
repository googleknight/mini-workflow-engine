import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WorkflowEditor from "./WorkflowEditor";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as api from "../api";
import { PLACEHOLDERS, DEFAULT_WORKFLOW_STEPS } from "@/lib/constants";

// Mock the API calls
jest.mock("../api");
const mockedApi = api as jest.Mocked<typeof api>;

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Monaco Editor because it doesn't render well in JSDOM
jest.mock("@monaco-editor/react", () => {
  return function MockEditor({
    value,
    onChange,
  }: {
    value: string;
    onChange: (val: string) => void;
  }) {
    return (
      <textarea
        data-testid="monaco-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

describe("WorkflowEditor", () => {
  let queryClient: QueryClient;
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithClient = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );
  };

  it("renders create mode correctly with accessibility attributes", () => {
    renderWithClient(<WorkflowEditor onClose={mockOnClose} />);

    // Dialog accessibility
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");

    expect(screen.getByText("Create Workflow")).toBeInTheDocument();

    // Form fields accessibility
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveAttribute(
      "placeholder",
      PLACEHOLDERS.WORKFLOW_NAME,
    );
    expect(screen.getByLabelText(/enable/i)).toBeChecked();

    // Default steps
    expect(screen.getByTestId("monaco-editor")).toHaveValue(
      JSON.stringify(DEFAULT_WORKFLOW_STEPS, null, 2),
    );

    // Close button accessibility
    expect(screen.getByLabelText(/close modal/i)).toBeInTheDocument();
  });

  it("renders edit mode correctly", () => {
    const workflow = {
      id: "1",
      name: "Existing Workflow",
      enabled: false,
      triggerPath: "path",
      steps: [{ type: "log", message: "test" }],
    };

    renderWithClient(
      <WorkflowEditor onClose={mockOnClose} workflow={workflow as any} />,
    );

    expect(screen.getByText("Edit Workflow")).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue("Existing Workflow");
    expect(screen.getByLabelText(/enable/i)).not.toBeChecked();
    expect(screen.getByTestId("monaco-editor")).toHaveValue(
      JSON.stringify(workflow.steps, null, 2),
    );
  });

  it("creates a new workflow successfully", async () => {
    mockedApi.createWorkflow.mockResolvedValue({ id: "1" } as any);

    renderWithClient(<WorkflowEditor onClose={mockOnClose} />);

    // Fill name using label
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "New Flow" },
    });

    // Save
    fireEvent.click(screen.getByText("Save Workflow"));

    await waitFor(() => {
      expect(mockedApi.createWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Flow",
          enabled: true,
          steps: expect.any(Array),
        }),
      );
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("updates an existing workflow successfully", async () => {
    const workflow = {
      id: "1",
      name: "Old Name",
      enabled: true,
      triggerPath: "path",
      steps: [],
    };

    mockedApi.updateWorkflow.mockResolvedValue({
      ...workflow,
      name: "Updated Name",
    } as any);

    renderWithClient(
      <WorkflowEditor onClose={mockOnClose} workflow={workflow as any} />,
    );

    // Change name using label
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Updated Name" },
    });

    // Save
    fireEvent.click(screen.getByText("Save Workflow"));

    await waitFor(() => {
      expect(mockedApi.updateWorkflow).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          name: "Updated Name",
          enabled: true,
          steps: [],
        }),
      );
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("validates JSON steps", async () => {
    renderWithClient(<WorkflowEditor onClose={mockOnClose} />);

    const editor = screen.getByTestId("monaco-editor");

    // Invalid JSON
    fireEvent.change(editor, { target: { value: "{ invalid " } });

    // Mock console.error to suppress the expected error log from error-handler
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    fireEvent.click(screen.getByText("Save Workflow"));

    // Should not call API
    await waitFor(() => {
      expect(mockedApi.createWorkflow).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
