import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import WorkflowList from "../WorkflowList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as api from "@/lib/api";

jest.mock("@/lib/api");
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

    // 2. Check toggle
    const toggleBtn = screen.getByTitle("Disable");
    await act(async () => {
      fireEvent.click(toggleBtn);
    });
    await waitFor(() => {
      expect(mockedApi.updateWorkflow).toHaveBeenCalled();
    });

    // 3. Check delete
    const deleteBtn = screen.getByTitle("Delete");
    await act(async () => {
      fireEvent.click(deleteBtn);
    });
    expect(mockConfirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockedApi.deleteWorkflow).toHaveBeenCalled();
    });

    // 4. Check edit
    const editBtn = screen.getByTitle("Edit");
    fireEvent.click(editBtn);
    expect(mockOnEdit).toHaveBeenCalledWith("1");
  });

  it("renders loading and error states", async () => {
    mockedApi.fetchWorkflows.mockRejectedValue(new Error("Fail"));
    renderWithClient(<WorkflowList onEdit={mockOnEdit} />);
    await waitFor(() => screen.getByText(/error loading/i));
  });
});
