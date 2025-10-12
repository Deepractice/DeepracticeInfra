/**
 * Node.js platform entry point (default)
 * Directly uses Pino adapter for production-grade logging
 */
import { createPinoLogger } from "./core/pino-adapter.js";
import type { LoggerConfig, Logger } from "./types/index.js";

/**
 * Create logger for Node.js runtime
 * Always uses Pino for structured logging with file support
 */
export function createLogger(config: LoggerConfig = {}): Logger {
  // Force environment to prevent any detection logic
  return createPinoLogger({ ...config, environment: "nodejs" });
}

export type { Logger, LoggerConfig };
