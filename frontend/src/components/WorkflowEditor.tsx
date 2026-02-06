"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Workflow, CreateWorkflowDTO, UpdateWorkflowDTO } from "@/lib/types";
import { createWorkflow, updateWorkflow } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./WorkflowEditor.module.css";
import { X, Save } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

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
  const [jsonSteps, setJsonSteps] = useState("[]");
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setEnabled(workflow.enabled);
      setJsonSteps(JSON.stringify(workflow.steps, null, 2));
    } else {
      setName("");
      setEnabled(true);
      setJsonSteps(
        JSON.stringify(
          [
            {
              type: "transform",
              ops: [
                { op: "default", path: "severity", value: "info" },
                {
                  op: "template",
                  to: "msg",
                  template: "Log: {{message}} ({{severity}})",
                },
              ],
            },
            {
              type: "http_request",
              method: "POST",
              url: "https://webhook.site/REPLACE_WITH_YOUR_UUID",
              body: {
                mode: "custom",
                value: { text: "{{msg}}" },
              },
            },
          ],
          null,
          2,
        ),
      );
    }
  }, [workflow]);

  const mutation = useMutation({
    mutationFn: async () => {
      let parsedSteps;
      try {
        parsedSteps = JSON.parse(jsonSteps);
      } catch (e: any) {
        throw new Error("Invalid JSON in steps: " + e.message);
      }

      if (
        !Array.isArray(parsedSteps) ||
        !parsedSteps.every((s) => typeof s === "object" && s !== null)
      ) {
        throw new Error(
          "Steps must be a JSON array of objects [ { ... }, { ... } ]",
        );
      }

      const dto: CreateWorkflowDTO = { name, enabled, steps: parsedSteps };
      if (workflow) {
        return updateWorkflow(workflow.id, {
          name,
          enabled,
          steps: parsedSteps,
        });
      } else {
        return createWorkflow(dto);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      onClose();
    },
    onError: (e: any) => {
      // If the error message is "Validation failed", there might be details.
      // But query mutation error 'e' is just the Error object we threw in api.ts.
      // We could pass more info through api.ts if we wanted.
      alert("Error saving workflow: " + e.message);
    },
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{workflow ? "Edit Workflow" : "Create Workflow"}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="My Workflow"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              Enable this workflow
            </label>
          </div>

          <div className={styles.editorGroup}>
            <label>Steps (JSON)</label>
            <div className={styles.editorContainer}>
              <Editor
                height="400px"
                defaultLanguage="json"
                value={jsonSteps}
                theme={theme === "dark" ? "vs-dark" : "light"}
                onChange={(value) => setJsonSteps(value || "[]")}
                options={{ minimap: { enabled: false }, formatOnPaste: true }}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.btnSecondary}>
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            className={styles.btnPrimary}
            disabled={mutation.isPending}
          >
            <Save size={16} />
            {mutation.isPending ? "Saving..." : "Save Workflow"}
          </button>
        </div>
      </div>
    </div>
  );
}
