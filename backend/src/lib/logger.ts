import pino from "pino";

// GCP Severity Levels
const levels = {
  default: "DEFAULT",
  debug: "DEBUG",
  info: "INFO",
  warn: "WARNING",
  error: "ERROR",
  fatal: "CRITICAL",
};

const logger = pino({
  // Dynamic log level: allows changing verbosity without code changes
  level: process.env.LOG_LEVEL || "info",

  // Use 'message' instead of 'msg' for GCP standard
  messageKey: "message",

  formatters: {
    // Flatten the log object (optional, but cleaner)
    level: (label) => {
      return { severity: levels[label as keyof typeof levels] || "INFO" };
    },
  },

  // Use ISO time format for GCP
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
