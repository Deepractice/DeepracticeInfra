/**
 * Error factory functions for convenient error creation
 * Provides a fluent API for creating common errors
 */

import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalError,
  ServiceUnavailableError,
  DatabaseError,
  ExternalServiceError,
  ConfigurationError,
  BusinessRuleError,
} from "../errors/index.js";

/**
 * Factory functions for creating errors
 * Usage: throw errors.notFound('User', userId)
 */
export const errors = {
  /**
   * Create a validation error (400)
   * @param message - Error message
   * @param fields - Optional field-specific validation errors
   */
  validation: (message: string, fields?: Record<string, string>) => {
    return new ValidationError(message, fields);
  },

  /**
   * Create an unauthorized error (401)
   * @param message - Optional custom message
   */
  unauthorized: (message?: string) => {
    return new UnauthorizedError(message);
  },

  /**
   * Create a forbidden error (403)
   * @param message - Optional custom message
   */
  forbidden: (message?: string) => {
    return new ForbiddenError(message);
  },

  /**
   * Create a not found error (404)
   * @param resource - Resource type (e.g., 'User', 'Post')
   * @param identifier - Optional resource identifier
   */
  notFound: (resource: string, identifier?: string) => {
    return new NotFoundError(resource, identifier);
  },

  /**
   * Create a conflict error (409)
   * @param message - Error message
   * @param meta - Optional additional context
   */
  conflict: (message: string, meta?: Record<string, unknown>) => {
    return new ConflictError(message, meta);
  },

  /**
   * Create an unprocessable entity error (422)
   * @param message - Error message
   * @param meta - Optional additional context
   */
  unprocessable: (message: string, meta?: Record<string, unknown>) => {
    return new UnprocessableEntityError(message, meta);
  },

  /**
   * Create a rate limit error (429)
   * @param message - Optional custom message
   * @param retryAfter - Optional retry after seconds
   */
  rateLimit: (message?: string, retryAfter?: number) => {
    return new RateLimitError(message, retryAfter);
  },

  /**
   * Create an internal server error (500)
   * @param message - Error message
   * @param originalError - Optional original error that caused this
   */
  internal: (message: string, originalError?: unknown) => {
    return new InternalError(message, originalError);
  },

  /**
   * Create a service unavailable error (503)
   * @param message - Optional custom message
   * @param retryAfter - Optional retry after seconds
   */
  unavailable: (message?: string, retryAfter?: number) => {
    return new ServiceUnavailableError(message, retryAfter);
  },

  /**
   * Create a database error (500)
   * @param message - Error message
   * @param operation - Optional database operation
   * @param originalError - Optional original error
   */
  database: (message: string, operation?: string, originalError?: unknown) => {
    return new DatabaseError(message, operation, originalError);
  },

  /**
   * Create an external service error (502)
   * @param service - Service name
   * @param message - Error message
   * @param originalError - Optional original error
   */
  externalService: (
    service: string,
    message: string,
    originalError?: unknown,
  ) => {
    return new ExternalServiceError(service, message, originalError);
  },

  /**
   * Create a configuration error (500)
   * @param message - Error message
   * @param configKey - Optional configuration key
   */
  configuration: (message: string, configKey?: string) => {
    return new ConfigurationError(message, configKey);
  },

  /**
   * Create a business rule violation error (422)
   * @param message - Error message
   * @param rule - Optional rule identifier
   * @param meta - Optional additional context
   */
  businessRule: (
    message: string,
    rule?: string,
    meta?: Record<string, unknown>,
  ) => {
    return new BusinessRuleError(message, rule, meta);
  },
} as const;
