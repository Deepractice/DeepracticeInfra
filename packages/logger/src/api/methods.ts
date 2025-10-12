/**
 * Convenience logging methods - simple functional API
 */
import { createLogger } from "~/api/logger.js";
import type { Logger } from "~/types/index.js";

// Lazy-initialized default logger to avoid environment detection at module load time
let defaultLogger: Logger | null = null;

/**
 * Get or create the default logger instance
 * This ensures we don't trigger environment detection until first use
 */
function getDefaultLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = createLogger();
  }
  return defaultLogger;
}

/**
 * Log trace level message
 */
export const trace: any = (...args: any[]) => {
  getDefaultLogger().trace(...args);
};

/**
 * Log debug level message
 */
export const debug: any = (...args: any[]) => {
  getDefaultLogger().debug(...args);
};

/**
 * Log info level message
 */
export const info: any = (...args: any[]) => {
  getDefaultLogger().info(...args);
};

/**
 * Log warning level message
 */
export const warn: any = (...args: any[]) => {
  getDefaultLogger().warn(...args);
};

/**
 * Log error level message
 */
export const error: any = (...args: any[]) => {
  getDefaultLogger().error(...args);
};

/**
 * Log fatal level message
 */
export const fatal: any = (...args: any[]) => {
  getDefaultLogger().fatal(...args);
};

/**
 * Alias for trace (verbose logging)
 */
export const verbose: any = trace;

/**
 * Generic log method with level
 */
export const log: any = (level: string, ...args: any[]) => {
  const logger = getDefaultLogger();
  const method = (logger as any)[level];
  if (typeof method === "function") {
    method(...args);
  } else {
    logger.info(...args);
  }
};
