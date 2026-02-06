"use client";

import { useState } from "react";
import WorkflowList from "@/components/WorkflowList";
import WorkflowEditor from "@/components/WorkflowEditor";
import ThemeToggle from "@/components/ThemeToggle";
import { Plus, CircuitBoard } from "lucide-react";
import styles from "./page.module.css";
import { Workflow } from "@/lib/types";

export default function Home() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  const handleCreate = () => {
    setEditingWorkflow(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setIsEditorOpen(true);
  };

  const handleClose = () => {
    setIsEditorOpen(false);
    setEditingWorkflow(null);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <CircuitBoard size={24} color="var(--primary)" />
          <h1>KisiEngine</h1>
        </div>
        <div className={styles.headerActions}>
          <ThemeToggle />
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>Workflows</h2>
            <p className={styles.pageSubtitle}>Manage your automation tasks.</p>
          </div>
          <button onClick={handleCreate} className={styles.createBtn}>
            <Plus size={18} />
            Create Workflow
          </button>
        </div>

        <WorkflowList onEdit={handleEdit} />
      </div>

      {isEditorOpen && (
        <WorkflowEditor workflow={editingWorkflow} onClose={handleClose} />
      )}
    </main>
  );
}
