import { toast } from "sonner";

export function handleError(
  error: unknown,
  fallbackMessage: string = "An error occurred",
) {
  console.error("[Frontend Error]:", error);

  let message = fallbackMessage;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  toast.error(message);
}
