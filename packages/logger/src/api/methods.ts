/**
 * Convenience logging methods - simple functional API
 */
import { createLogger } from "~/api/logger.js";

// Default logger instance for convenience methods
const defaultLogger = createLogger();

/**
 * Log trace level message
 */
export const trace: any = (...args: any[]) => {
  defaultLogger.trace(...args);
};

/**
 * Log debug level message
 */
export const debug: any = (...args: any[]) => {
  defaultLogger.debug(...args);
};

/**
 * Log info level message
 */
export const info: any = (...args: any[]) => {
  defaultLogger.info(...args);
};

/**
 * Log warning level message
 */
export const warn: any = (...args: any[]) => {
  defaultLogger.warn(...args);
};

/**
 * Log error level message
 */
export const error: any = (...args: any[]) => {
  defaultLogger.error(...args);
};

/**
 * Log fatal level message
 */
export const fatal: any = (...args: any[]) => {
  defaultLogger.fatal(...args);
};

/**
 * Alias for trace (verbose logging)
 */
export const verbose: any = trace;

/**
 * Generic log method with level
 */
export const log: any = (level: string, ...args: any[]) => {
  const method = (defaultLogger as any)[level];
  if (typeof method === "function") {
    method(...args);
  } else {
    defaultLogger.info(...args);
  }
};
