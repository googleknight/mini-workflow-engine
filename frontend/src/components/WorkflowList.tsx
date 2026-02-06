"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWorkflows, deleteWorkflow, updateWorkflow } from "@/lib/api";
import { Edit2, Trash2, Power, PowerOff } from "lucide-react";
import styles from "./WorkflowList.module.css";
import { Workflow } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface WorkflowListProps {
  onEdit: (workflow: Workflow) => void;
}

export default function WorkflowList({ onEdit }: WorkflowListProps) {
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
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateWorkflow(id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });

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
                <div className={styles.nameCell}>
                  <div className={styles.workflowName}>{workflow.name}</div>
                  <div className={styles.workflowMeta}>
                    Created{" "}
                    {workflow.createdAt
                      ? formatDistanceToNow(new Date(workflow.createdAt)) +
                        " ago"
                      : "recently"}
                  </div>
                </div>
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
                  >
                    {workflow.enabled ? (
                      <Power size={18} />
                    ) : (
                      <PowerOff size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(workflow)}
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
