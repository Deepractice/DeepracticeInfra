/**
 * Test environment entry point
 * Provides in-memory logger for testing with inspection utilities
 */
import { createLogger } from "~/api/logger.js";
import type { LoggerConfig } from "~/types/index.js";

// Export test utilities
export {
  getTestLogs,
  getTestLogsByLevel,
  clearTestLogs,
  getTestLogsCount,
  type CapturedLog,
} from "~/core/test-adapter.js";

/**
 * Create a test logger instance
 * Automatically uses test adapter with in-memory capture
 */
export function createTestLogger(config: LoggerConfig = {}): any {
  return createLogger({
    ...config,
    environment: "test",
  });
}

// Re-export the standard createLogger for convenience
export { createLogger };

// Re-export types
export type { LoggerConfig, Logger, LogLevel } from "~/types/index.js";
