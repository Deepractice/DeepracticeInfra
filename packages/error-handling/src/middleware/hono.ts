/**
 * Hono error handling middleware
 * Automatically handles AppError instances and logs errors
 */

import type { Context, ErrorHandler } from 'hono'
import { AppError } from '../errors/base.js'

/**
 * Error handler options
 */
export interface ErrorHandlerOptions {
  /**
   * Logger function for error logging
   * Should accept (message: string, context?: object) => void
   */
  logger?: (message: string, context?: Record<string, unknown>) => void

  /**
   * Include stack traces in development
   */
  includeStack?: boolean

  /**
   * Custom error formatter
   */
  formatter?: (error: AppError | Error) => Record<string, unknown>
}

/**
 * Create Hono error handler middleware
 * @param options - Error handler options
 */
export function createErrorHandler(options: ErrorHandlerOptions = {}): ErrorHandler {
  const { logger, includeStack = false, formatter } = options

  return (err: Error, c: Context) => {
    // Handle AppError instances
    if (AppError.isAppError(err)) {
      logger?.(err.message, {
        code: err.code,
        statusCode: err.statusCode,
        meta: err.meta,
      })

      const body = formatter ? formatter(err) : err.toJSON()

      return c.json(body, err.statusCode as any)
    }

    // Handle unknown errors
    logger?.(err.message || 'Unknown error occurred', {
      error: err,
      stack: err.stack,
    })

    const statusCode = 500
    const body = {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      ...(includeStack && { stack: err.stack }),
    }

    return c.json(body, statusCode as any)
  }
}
