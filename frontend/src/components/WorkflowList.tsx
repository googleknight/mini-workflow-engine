"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWorkflows, deleteWorkflow, updateWorkflow } from "@/lib/api";
import { Edit2, Trash2, Power, PowerOff, Copy, Check } from "lucide-react";
import styles from "./WorkflowList.module.css";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";

interface WorkflowListProps {
  onEdit: (workflowId: string) => void;
}

export default function WorkflowList({ onEdit }: WorkflowListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    data: workflows,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workflows"],
    queryFn: fetchWorkflows,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow deleted");
    },
    onError: (e) => handleError(e, "Failed to delete workflow"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateWorkflow(id, { enabled }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success(`Workflow ${variables.enabled ? "enabled" : "disabled"}`);
    },
    onError: (e) => handleError(e, "Failed to update workflow"),
  });

  const copyToClipboard = (path: string, id: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const fullUrl = `${baseUrl}/t/${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success("Trigger URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading)
    return <div className={styles.loading}>Loading workflows...</div>;
  if (error)
    return (
      <div className={styles.error}>
        Error loading workflows. Is the backend running?
      </div>
    );

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Trigger URL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workflows?.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                No workflows found. Create one to get started.
              </td>
            </tr>
          )}
          {workflows?.map((workflow) => (
            <tr key={workflow.id}>
              <td>
                <div className={styles.workflowName}>{workflow.name}</div>
              </td>
              <td>
                <div className={styles.statusCell}>
                  <span
                    className={`${styles.statusDot} ${workflow.enabled ? styles.enabled : styles.disabled}`}
                  ></span>
                  {workflow.enabled ? "Enabled" : "Disabled"}
                </div>
              </td>
              <td>
                <div className={styles.triggerCell}>
                  <code>/t/{workflow.triggerPath}</code>
                  <button
                    onClick={() =>
                      copyToClipboard(workflow.triggerPath, workflow.id)
                    }
                    className={styles.iconBtn}
                    title="Copy Trigger URL"
                  >
                    {copiedId === workflow.id ? (
                      <Check size={14} className={styles.copySuccess} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    onClick={() =>
                      toggleMutation.mutate({
                        id: workflow.id,
                        enabled: !workflow.enabled,
                      })
                    }
                    title={workflow.enabled ? "Disable" : "Enable"}
                    className={styles.iconBtn}
                    disabled={toggleMutation.isPending}
                  >
                    {workflow.enabled ? (
                      <Power size={18} />
                    ) : (
                      <PowerOff size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(workflow.id)}
                    title="Edit"
                    className={styles.iconBtn}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to delete this workflow?",
                        )
                      ) {
                        deleteMutation.mutate(workflow.id);
                      }
                    }}
                    title="Delete"
                    className={`${styles.iconBtn} ${styles.danger}`}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
