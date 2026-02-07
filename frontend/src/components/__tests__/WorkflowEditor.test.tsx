import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import WorkflowEditor from "../WorkflowEditor";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as api from "@/lib/api";

// Mock the API calls
jest.mock("@/lib/api");
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

  it("renders create mode correctly", () => {
    renderWithClient(<WorkflowEditor onClose={mockOnClose} />);

    expect(screen.getByText("Create Workflow")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("My Workflow")).toHaveValue("");
    expect(screen.getByRole("checkbox")).toBeChecked();
    // Default steps should be present
    expect(screen.getByTestId("monaco-editor")).not.toHaveValue("[]");
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
    expect(screen.getByDisplayValue("Existing Workflow")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.getByTestId("monaco-editor")).toHaveValue(
      JSON.stringify(workflow.steps, null, 2),
    );
  });

  it("creates a new workflow successfully", async () => {
    mockedApi.createWorkflow.mockResolvedValue({ id: "1" } as any);

    renderWithClient(<WorkflowEditor onClose={mockOnClose} />);

    // Fill name
    fireEvent.change(screen.getByPlaceholderText("My Workflow"), {
      target: { value: "New Flow" },
    });

    // Save
    fireEvent.click(screen.getByText("Save Workflow"));

    await waitFor(() => {
      expect(mockedApi.createWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Flow",
          enabled: true,
          // We verify steps are passed, exact content check might be verbose due to default steps
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

    // Change name
    fireEvent.change(screen.getByDisplayValue("Old Name"), {
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
