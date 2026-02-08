export const QUERY_KEYS = {
  WORKFLOWS: ["workflows"],
} as const;

export const MESSAGES = {
  WORKFLOW_CREATED: "Workflow created successfully",
  WORKFLOW_UPDATED: "Workflow updated successfully",
  WORKFLOW_DELETED: "Workflow deleted successfully",
  WORKFLOW_ENABLED: "Workflow enabled successfully",
  WORKFLOW_DISABLED: "Workflow disabled successfully",
  COPY_SUCCESS: "Trigger URL copied to clipboard",
  SAVE_ERROR: "Error saving workflow",
  DELETE_ERROR: "Failed to delete workflow",
  UPDATE_ERROR: "Failed to update workflow",
  LOAD_ERROR: "Error loading workflows. Is the backend running?",
  LOAD_FOR_EDIT_ERROR: "Failed to load workflow for editing",
  JSON_INVALID: "Invalid JSON in steps",
  STEPS_MUST_BE_ARRAY:
    "Steps must be a JSON array of objects [ { ... }, { ... } ]",
  CONFIRM_DELETE: "Are you sure you want to delete this workflow?",
  LOADING_WORKFLOWS: "Loading workflows...",
  NO_WORKFLOWS: "No workflows found. Create one to get started.",
  SAVING: "Saving...",
} as const;

export const LABELS = {
  APP_NAME: "WorkFlowEngine",
  WORKFLOWS: "Workflows",
  MANAGE_TASKS: "Manage your automation tasks.",
  CREATE_WORKFLOW: "Create Workflow",
  EDIT_WORKFLOW: "Edit Workflow",
  NAME: "Name",
  STATUS: "Status",
  TRIGGER_URL: "Trigger URL",
  ACTIONS: "Actions",
  ENABLED: "Enabled",
  DISABLED: "Disabled",
  ENABLE_THIS_WORKFLOW: "Enable this workflow",
  STEPS_JSON: "Steps (JSON)",
  CANCEL: "Cancel",
  SAVE_WORKFLOW: "Save Workflow",
  EDIT: "Edit",
  DELETE: "Delete",
  ENABLE: "Enable",
  DISABLE: "Disable",
  COPY_TRIGGER_URL: "Copy Trigger URL",
  CLOSE_MODAL: "Close modal",
  TOGGLE_THEME: "Toggle theme",
} as const;

export const PLACEHOLDERS = {
  WORKFLOW_NAME: "e.g., Lead Notification Sync",
  STEPS_JSON: "[]",
} as const;

export const APP_CONFIG = {
  COPY_TIMEOUT: 2000,
  EDITOR_HEIGHT: "400px",
  API_T_PATH: "/t/",
} as const;

export const API_ROUTES = {
  WORKFLOWS: "/workflows",
} as const;

export const DEFAULT_WORKFLOW_STEPS = [
  {
    type: "TRANSFORM",
    ops: [
      {
        op: "DEFAULT",
        path: "severity",
        value: "info",
      },
      {
        op: "TEMPLATE",
        to: "msg",
        template: "Log: {{message}} ({{severity}})",
      },
    ],
  },
  {
    type: "HTTP_REQUEST",
    method: "POST",
    url: "https://webhook.site/REPLACE_WITH_YOUR_UUID",
    body: {
      mode: "CUSTOM",
      value: { text: "{{msg}}" },
    },
  },
];
