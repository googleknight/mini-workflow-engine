import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

import logger from "../lib/logger";

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Log the error for internal tracking (could use a proper logger here)
  if (statusCode === 500) {
    logger.error(
      { err, req: { method: req.method, url: req.url, body: req.body } },
      `[Admin API Error]: ${message}`,
    );
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
