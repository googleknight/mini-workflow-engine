"use client";

import { useState } from "react";
import WorkflowList from "@/features/workflows/components/WorkflowList";
import WorkflowEditor from "@/features/workflows/components/WorkflowEditor";
import ThemeToggle from "@/components/ThemeToggle";
import { Plus, CircuitBoard } from "lucide-react";
import styles from "./page.module.css";
import { Workflow } from "@/features/workflows/types";
import { fetchWorkflow } from "@/features/workflows/api";
import { handleError } from "@/lib/error-handler";
import { MESSAGES, LABELS } from "@/lib/constants";

export default function Home() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  const handleCreate = () => {
    setEditingWorkflow(null);
    setIsEditorOpen(true);
  };

  const handleEdit = async (workflowId: string) => {
    try {
      const workflow = await fetchWorkflow(workflowId);
      setEditingWorkflow(workflow);
      setIsEditorOpen(true);
    } catch (error) {
      handleError(error, MESSAGES.LOAD_FOR_EDIT_ERROR);
    }
  };

  const handleClose = () => {
    setIsEditorOpen(false);
    setEditingWorkflow(null);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <CircuitBoard size={24} color="var(--primary)" aria-hidden="true" />
          <h1>{LABELS.APP_NAME}</h1>
        </div>
        <div className={styles.headerActions}>
          <ThemeToggle />
        </div>
      </header>

      <div className={styles.content}>
        <section
          className={styles.pageHeader}
          aria-labelledby="workflows-title"
        >
          <div>
            <h2 id="workflows-title" className={styles.pageTitle}>
              {LABELS.WORKFLOWS}
            </h2>
            <p className={styles.pageSubtitle}>{LABELS.MANAGE_TASKS}</p>
          </div>
          <button
            onClick={handleCreate}
            className={styles.createBtn}
            aria-label={LABELS.CREATE_WORKFLOW}
          >
            <Plus size={18} aria-hidden="true" />
            {LABELS.CREATE_WORKFLOW}
          </button>
        </section>

        <WorkflowList onEdit={handleEdit} />
      </div>

      {isEditorOpen && (
        <WorkflowEditor workflow={editingWorkflow} onClose={handleClose} />
      )}
    </main>
  );
}
