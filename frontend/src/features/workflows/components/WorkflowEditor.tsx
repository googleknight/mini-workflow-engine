"use client";

import { useState, useEffect, useId } from "react";
import Editor from "@monaco-editor/react";
import { Workflow } from "../types";
import styles from "./WorkflowEditor.module.css";
import { X, Save } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import {
  MESSAGES,
  PLACEHOLDERS,
  APP_CONFIG,
  DEFAULT_WORKFLOW_STEPS,
  LABELS,
} from "@/lib/constants";
import { useWorkflowMutation } from "../hooks/useWorkflows";

interface WorkflowEditorProps {
  workflow?: Workflow | null;
  onClose: () => void;
}

export default function WorkflowEditor({
  workflow,
  onClose,
}: WorkflowEditorProps) {
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [jsonSteps, setJsonSteps] = useState<string>(PLACEHOLDERS.STEPS_JSON);
  const { theme } = useTheme();

  const nameInputId = useId();
  const enabledInputId = useId();
  const editorLabelId = useId();
  const modalLabelId = useId();

  const { mutate, isPending } = useWorkflowMutation(onClose);

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setEnabled(workflow.enabled);
      setJsonSteps(JSON.stringify(workflow.steps, null, 2));
    } else {
      setName("");
      setEnabled(true);
      setJsonSteps(JSON.stringify(DEFAULT_WORKFLOW_STEPS, null, 2));
    }
  }, [workflow]);

  const handleSave = () => {
    let parsedSteps;
    try {
      parsedSteps = JSON.parse(jsonSteps);
    } catch (e: any) {
      alert(`${MESSAGES.JSON_INVALID}: ${e.message}`);
      return;
    }

    if (
      !Array.isArray(parsedSteps) ||
      !parsedSteps.every((s) => typeof s === "object" && s !== null)
    ) {
      alert(MESSAGES.STEPS_MUST_BE_ARRAY);
      return;
    }

    mutate({
      id: workflow?.id,
      data: {
        name,
        enabled,
        steps: parsedSteps,
      },
    });
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalLabelId}
      >
        <div className={styles.header}>
          <h2 id={modalLabelId}>
            {workflow ? LABELS.EDIT_WORKFLOW : LABELS.CREATE_WORKFLOW}
          </h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label={LABELS.CLOSE_MODAL}
          >
            <X />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label htmlFor={nameInputId}>{LABELS.NAME}</label>
            <input
              id={nameInputId}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder={PLACEHOLDERS.WORKFLOW_NAME}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel} htmlFor={enabledInputId}>
              <input
                id={enabledInputId}
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              {LABELS.ENABLE_THIS_WORKFLOW}
            </label>
          </div>

          <div className={styles.editorGroup}>
            <label id={editorLabelId}>{LABELS.STEPS_JSON}</label>
            <div
              className={styles.editorContainer}
              aria-labelledby={editorLabelId}
            >
              <Editor
                height={APP_CONFIG.EDITOR_HEIGHT}
                defaultLanguage="json"
                value={jsonSteps}
                theme={theme === "dark" ? "vs-dark" : "light"}
                onChange={(value) =>
                  setJsonSteps(value || PLACEHOLDERS.STEPS_JSON)
                }
                options={{ minimap: { enabled: false }, formatOnPaste: true }}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.btnSecondary}>
            {LABELS.CANCEL}
          </button>
          <button
            onClick={handleSave}
            className={styles.btnPrimary}
            disabled={isPending}
          >
            <Save size={16} />
            {isPending ? MESSAGES.SAVING : LABELS.SAVE_WORKFLOW}
          </button>
        </div>
      </div>
    </div>
  );
}
