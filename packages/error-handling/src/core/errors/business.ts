/**
 * Business logic error classes
 * Domain-specific errors for business rule violations
 */

import { AppError } from "~/core/errors/base";

/**
 * Database operation error
 */
export class DatabaseError extends AppError {
  constructor(message: string, operation?: string, originalError?: unknown) {
    const meta: Record<string, unknown> = {};
    if (operation) meta.operation = operation;
    if (originalError) {
      meta.originalError =
        originalError instanceof Error
          ? originalError.message
          : String(originalError);
    }
    super(
      "DATABASE_ERROR",
      message,
      500,
      Object.keys(meta).length > 0 ? meta : undefined,
    );
  }
}

/**
 * External service/API error
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, originalError?: unknown) {
    const meta: Record<string, unknown> = { service };
    if (originalError) {
      meta.originalError =
        originalError instanceof Error
          ? originalError.message
          : String(originalError);
    }
    super("EXTERNAL_SERVICE_ERROR", message, 502, meta);
  }
}

/**
 * Configuration error - missing or invalid configuration
 */
export class ConfigurationError extends AppError {
  constructor(message: string, configKey?: string) {
    super(
      "CONFIGURATION_ERROR",
      message,
      500,
      configKey ? { configKey } : undefined,
    );
  }
}

/**
 * Business rule violation
 */
export class BusinessRuleError extends AppError {
  constructor(message: string, rule?: string, meta?: Record<string, unknown>) {
    super("BUSINESS_RULE_VIOLATION", message, 422, {
      ...(rule && { rule }),
      ...meta,
    });
  }
}
