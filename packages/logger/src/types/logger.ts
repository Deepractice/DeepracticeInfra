/**
 * Logger interface - all methods accept any arguments for maximum flexibility
 */
export interface Logger {
  /**
   * Log trace level message
   */
  trace: any;

  /**
   * Log debug level message
   */
  debug: any;

  /**
   * Log info level message
   */
  info: any;

  /**
   * Log warning level message
   */
  warn: any;

  /**
   * Log error level message
   */
  error: any;

  /**
   * Log fatal level message
   */
  fatal: any;
}

/**
 * Log level type
 */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
