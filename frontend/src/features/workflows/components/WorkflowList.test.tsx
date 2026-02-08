import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import WorkflowList from "./WorkflowList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as api from "../api";
import { MESSAGES } from "@/lib/constants";

jest.mock("../api");
const mockedApi = api as jest.Mocked<typeof api>;

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockConfirm = jest.fn();
global.confirm = mockConfirm;

describe("WorkflowList", () => {
  const mockOnEdit = jest.fn();
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
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

  it("renders a list and handles actions", async () => {
    const mockWorkflows = [
      {
        id: "1",
        name: "Workflow 1",
        enabled: true,
        triggerPath: "p1",
        steps: [],
      },
    ];
    mockedApi.fetchWorkflows.mockResolvedValue(mockWorkflows as any);
    mockedApi.updateWorkflow.mockResolvedValue({
      ...mockWorkflows[0],
      enabled: false,
    } as any);
    mockedApi.deleteWorkflow.mockResolvedValue(undefined as any);

    renderWithClient(<WorkflowList onEdit={mockOnEdit} />);

    // 1. Check rendering
    await waitFor(() => screen.getByText("Workflow 1"));

    // 2. Check toggle (Accessibility: aria-label)
    const toggleBtn = screen.getByLabelText("Disable Workflow 1");
    await act(async () => {
      fireEvent.click(toggleBtn);
    });
    await waitFor(() => {
      expect(mockedApi.updateWorkflow).toHaveBeenCalled();
    });

    // 3. Check delete (Accessibility: aria-label, Use constant for confirm)
    const deleteBtn = screen.getByLabelText("Delete Workflow 1");
    await act(async () => {
      fireEvent.click(deleteBtn);
    });
    expect(mockConfirm).toHaveBeenCalledWith(MESSAGES.CONFIRM_DELETE);
    await waitFor(() => {
      expect(mockedApi.deleteWorkflow).toHaveBeenCalled();
    });

    // 4. Check edit (Accessibility: aria-label)
    const editBtn = screen.getByLabelText("Edit Workflow 1");
    fireEvent.click(editBtn);
    expect(mockOnEdit).toHaveBeenCalledWith("1");

    // 5. Check copy (Accessibility: aria-label)
    const copyBtn = screen.getByLabelText("Copy trigger URL for Workflow 1");
    expect(copyBtn).toBeInTheDocument();
  });

  it("renders loading and error states", async () => {
    mockedApi.fetchWorkflows.mockRejectedValue(new Error("Fail"));
    renderWithClient(<WorkflowList onEdit={mockOnEdit} />);

    // Check loading state accessibility
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Check error state accessibility and message constant
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(MESSAGES.LOAD_ERROR);
    });
  });
});
