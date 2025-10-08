/**
 * @deepracticex/error-handling
 * Unified error handling system for Deepractice projects
 *
 * Features:
 * - Type-safe error classes
 * - HTTP and business error types
 * - Error factory for convenient creation
 * - Framework middleware (Express, Hono)
 * - Optional Result type for functional error handling
 */

// Core error classes
export { AppError } from "./errors/base.js";
export {
  // HTTP errors
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalError,
  ServiceUnavailableError,
  // Business errors
  DatabaseError,
  ExternalServiceError,
  ConfigurationError,
  BusinessRuleError,
} from "./errors/index.js";

// Error factory
export { errors } from "./factories/index.js";

// Middleware
export {
  createHonoErrorHandler,
  createExpressErrorHandler,
  type ErrorHandlerOptions,
} from "./middleware/index.js";

// Result type (optional functional approach)
export {
  ok,
  err,
  isOk,
  isErr,
  unwrap,
  unwrapOr,
  map,
  flatMap,
  type Result,
  type Ok,
  type Err,
} from "./types.js";
