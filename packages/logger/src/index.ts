/**
 * @deepracticex/logger
 *
 * Unified logging solution with Pino
 * - Simple and flexible API
 * - Automatic caller location tracking
 * - Daily log rotation
 * - MCP stdio mode support (no ANSI colors)
 * - Electron compatibility (sync mode to avoid worker threads)
 */

// Export public API
export {
  DefaultLogger,
  createLogger,
  trace,
  debug,
  info,
  warn,
  error,
  fatal,
  verbose,
  log,
} from "~/api/index.js";

// Export types
export type { Logger, LoggerConfig, LogLevel } from "~/types/index.js";

// Default export - ready-to-use logger instance
import { createLogger } from "~/api/logger.js";
export default createLogger();
