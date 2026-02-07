import { toast } from "sonner";

export function handleError(
  error: unknown,
  fallbackMessage: string = "An error occurred",
) {
  console.error("[Frontend Error]:", error);

  let message = fallbackMessage;

  // 1. Handle our custom API error response with details
  if (error && typeof error === "object") {
    const errObj = error as any;

    // Check for Zod validation details
    if (Array.isArray(errObj.details) && errObj.details.length > 0) {
      message = errObj.details
        .map((d: any) => (d.path ? `[${d.path}]: ${d.message}` : d.message))
        .join(". ");
    }
    // Check for generic error messages from backend
    else if (errObj.message) {
      message = errObj.message;
    } else if (errObj.error) {
      message = errObj.error;
    }
    // Handle standard Error objects
    else if (error instanceof Error) {
      message = error.message;
    }
  }
  // 2. Handle simple string errors
  else if (typeof error === "string") {
    message = error;
  }

  toast.error(message);
}
