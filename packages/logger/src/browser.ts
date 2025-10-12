/**
 * Browser platform entry point
 * Directly uses console adapter for client-side logging
 */
import { createConsoleLogger } from "./core/console-adapter.js";
import type { LoggerConfig, Logger } from "./types/index.js";

/**
 * Create logger for browser runtime
 * Always uses console-based logging
 */
export function createLogger(config: LoggerConfig = {}): Logger {
  // Force environment to prevent any detection logic
  return createConsoleLogger({ ...config, environment: "browser" });
}

export type { Logger, LoggerConfig };
