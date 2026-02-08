"use client";

import { useState } from "react";
import { Edit2, Trash2, Power, PowerOff, Copy, Check } from "lucide-react";
import styles from "./WorkflowList.module.css";
import { toast } from "sonner";
import { MESSAGES, APP_CONFIG, LABELS } from "@/lib/constants";
import { useWorkflows } from "../hooks/useWorkflows";

interface WorkflowListProps {
  onEdit: (workflowId: string) => void;
}

export default function WorkflowList({ onEdit }: WorkflowListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const {
    workflows,
    isLoading,
    error,
    deleteWorkflow,
    toggleWorkflow,
    isToggling,
    isDeleting,
  } = useWorkflows();

  const copyToClipboard = (path: string, id: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const fullUrl = new URL(
      `${APP_CONFIG.API_T_PATH}${path}`,
      baseUrl,
    ).toString();
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success(MESSAGES.COPY_SUCCESS);
    setTimeout(() => setCopiedId(null), APP_CONFIG.COPY_TIMEOUT);
  };

  if (isLoading)
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        {MESSAGES.LOADING_WORKFLOWS}
      </div>
    );

  if (error)
    return (
      <div className={styles.error} role="alert">
        {MESSAGES.LOAD_ERROR}
      </div>
    );

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">{LABELS.NAME}</th>
            <th scope="col">{LABELS.STATUS}</th>
            <th scope="col">{LABELS.TRIGGER_URL}</th>
            <th scope="col">{LABELS.ACTIONS}</th>
          </tr>
        </thead>
        <tbody>
          {workflows?.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                {MESSAGES.NO_WORKFLOWS}
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
                    aria-hidden="true"
                  ></span>
                  <span>
                    {workflow.enabled ? LABELS.ENABLED : LABELS.DISABLED}
                  </span>
                </div>
              </td>
              <td>
                <div className={styles.triggerCell}>
                  <code>
                    {APP_CONFIG.API_T_PATH}
                    {workflow.triggerPath}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(workflow.triggerPath, workflow.id)
                    }
                    className={styles.iconBtn}
                    title={LABELS.COPY_TRIGGER_URL}
                    aria-label={`Copy trigger URL for ${workflow.name}`}
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
                      toggleWorkflow({
                        id: workflow.id,
                        enabled: !workflow.enabled,
                      })
                    }
                    title={workflow.enabled ? LABELS.DISABLE : LABELS.ENABLE}
                    aria-label={
                      workflow.enabled
                        ? `Disable ${workflow.name}`
                        : `Enable ${workflow.name}`
                    }
                    className={styles.iconBtn}
                    disabled={isToggling}
                  >
                    {workflow.enabled ? (
                      <Power size={18} />
                    ) : (
                      <PowerOff size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(workflow.id)}
                    title={LABELS.EDIT}
                    aria-label={`Edit ${workflow.name}`}
                    className={styles.iconBtn}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(MESSAGES.CONFIRM_DELETE)) {
                        deleteWorkflow(workflow.id);
                      }
                    }}
                    title={LABELS.DELETE}
                    aria-label={`Delete ${workflow.name}`}
                    className={`${styles.iconBtn} ${styles.danger}`}
                    disabled={isDeleting}
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
