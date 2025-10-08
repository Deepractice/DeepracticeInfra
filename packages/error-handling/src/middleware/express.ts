/**
 * Express error handling middleware
 * Automatically handles AppError instances and logs errors
 */

import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { AppError } from "../errors/base.js";

/**
 * Error handler options
 */
export interface ErrorHandlerOptions {
  /**
   * Logger function for error logging
   * Should accept (message: string, context?: object) => void
   */
  logger?: (message: string, context?: Record<string, unknown>) => void;

  /**
   * Include stack traces in development
   */
  includeStack?: boolean;

  /**
   * Custom error formatter
   */
  formatter?: (error: AppError | Error) => Record<string, unknown>;
}

/**
 * Create Express error handler middleware
 * @param options - Error handler options
 */
export function createErrorHandler(
  options: ErrorHandlerOptions = {},
): ErrorRequestHandler {
  const { logger, includeStack = false, formatter } = options;

  return (err: Error, req: Request, res: Response, _next: NextFunction) => {
    // Handle AppError instances
    if (AppError.isAppError(err)) {
      logger?.(err.message, {
        code: err.code,
        statusCode: err.statusCode,
        meta: err.meta,
        path: req.path,
        method: req.method,
      });

      const body = formatter ? formatter(err) : err.toJSON();

      return res.status(err.statusCode).json(body);
    }

    // Handle unknown errors
    logger?.(err.message || "Unknown error occurred", {
      error: err,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    const statusCode = 500;
    const body = {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      ...(includeStack && { stack: err.stack }),
    };

    return res.status(statusCode).json(body);
  };
}
