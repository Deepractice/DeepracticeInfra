/**
 * Cloudflare Workers platform entry point
 * Directly uses console adapter - no dynamic detection or pino dependencies
 */
import { createConsoleLogger } from "./core/console-adapter.js";
import type { LoggerConfig, Logger } from "./types/index.js";

/**
 * Create logger for Cloudflare Workers runtime
 * Always uses console-based logging
 */
export function createLogger(config: LoggerConfig = {}): Logger {
  // Force environment to prevent any detection logic
  return createConsoleLogger({ ...config, environment: "cloudflare-workers" });
}

export type { Logger, LoggerConfig };
