// V8 stack trace API (Node.js specific)
interface NodeError {
  captureStackTrace(targetObject: object, constructorOpt?: Function): void;
}

const ErrorWithStack = Error as unknown as NodeError & ErrorConstructor;

/**
 * Base error class for all application errors
 * Provides structured error handling with type safety and serialization
 */
export class AppError extends Error {
  /**
   * Create a new application error
   * @param code - Error code for identification (e.g., 'VALIDATION_ERROR')
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (default: 500)
   * @param meta - Additional context data
   */
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace for where error was thrown
    if (typeof ErrorWithStack.captureStackTrace === "function") {
      ErrorWithStack.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON-serializable object
   * Useful for API responses and logging
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.meta && { meta: this.meta }),
    };
  }

  /**
   * Check if an error is an AppError instance
   */
  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}
