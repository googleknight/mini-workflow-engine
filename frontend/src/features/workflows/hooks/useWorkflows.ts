import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkflows,
  deleteWorkflow,
  updateWorkflow,
  createWorkflow,
} from "../api";
import { QUERY_KEYS, MESSAGES } from "@/lib/constants";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import { CreateWorkflowDTO, UpdateWorkflowDTO } from "../types";

export function useWorkflows() {
  const queryClient = useQueryClient();

  const {
    data: workflows,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.WORKFLOWS,
    queryFn: fetchWorkflows,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOWS });
      toast.success(MESSAGES.WORKFLOW_DELETED);
    },
    onError: (e) => handleError(e, MESSAGES.DELETE_ERROR),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateWorkflow(id, { enabled }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOWS });
      toast.success(
        variables.enabled
          ? MESSAGES.WORKFLOW_ENABLED
          : MESSAGES.WORKFLOW_DISABLED,
      );
    },
    onError: (e) => handleError(e, MESSAGES.UPDATE_ERROR),
  });

  return {
    workflows,
    isLoading,
    error,
    deleteWorkflow: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    toggleWorkflow: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
}

export function useWorkflowMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id?: string;
      data: CreateWorkflowDTO | UpdateWorkflowDTO;
    }) => {
      if (id) {
        return updateWorkflow(id, data as UpdateWorkflowDTO);
      } else {
        return createWorkflow(data as CreateWorkflowDTO);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOWS });
      toast.success(
        variables.id ? MESSAGES.WORKFLOW_UPDATED : MESSAGES.WORKFLOW_CREATED,
      );
      onSuccess?.();
    },
    onError: (e: any) => {
      handleError(e, MESSAGES.SAVE_ERROR);
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
  };
}
