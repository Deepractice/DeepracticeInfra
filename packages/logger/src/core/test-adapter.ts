/**
 * Test adapter - In-memory logger for testing environments
 * Captures all logs in memory for inspection and assertion
 */
import type { LoggerConfig, LogLevel } from "~/types/index.js";

export interface CapturedLog {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
}

/**
 * Global log storage for test environment
 * Shared across all test logger instances in the same process
 */
const capturedLogs: CapturedLog[] = [];

/**
 * Log level priority mapping for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

/**
 * Get current log level priority
 */
function getMinLogLevel(level: LogLevel = "info"): number {
  return LOG_LEVEL_PRIORITY[level];
}

/**
 * Check if a log level should be recorded based on config
 */
function shouldLog(level: LogLevel, minLevel: number): boolean {
  return LOG_LEVEL_PRIORITY[level] >= minLevel;
}

/**
 * Create a log entry and optionally output to console
 */
function createLogEntry(
  level: LogLevel,
  args: any[],
  shouldOutput: boolean,
  minLevel: number,
): void {
  // Check if this level should be logged
  if (!shouldLog(level, minLevel)) {
    return;
  }

  let message: string;
  let context: Record<string, any> | undefined;

  // Parse arguments - support both (message) and (context, message) patterns
  if (args.length === 1) {
    if (typeof args[0] === "string") {
      message = args[0];
    } else {
      context = args[0];
      message = JSON.stringify(args[0]);
    }
  } else if (args.length >= 2) {
    // First arg might be context object
    if (typeof args[0] === "object" && args[0] !== null) {
      context = args[0];
      message = args.slice(1).join(" ");
    } else {
      message = args.join(" ");
    }
  } else {
    message = "";
  }

  // Always capture in memory
  capturedLogs.push({
    level,
    message,
    context,
    timestamp: Date.now(),
  });

  // Optionally output to console
  if (shouldOutput) {
    const consoleMethod = level === "fatal" ? "error" : level;
    const logFn = (console as any)[consoleMethod] || console.log;

    if (context) {
      logFn(`[${level.toUpperCase()}]`, context, message);
    } else {
      logFn(`[${level.toUpperCase()}]`, message);
    }
  }
}

/**
 * Create a test logger instance
 */
export function createTestLogger(config: LoggerConfig = {}): any {
  // Default: silent in tests (console: false), unless explicitly enabled
  const shouldOutput = config.console === true;
  const minLevel = getMinLogLevel(config.level);

  return {
    trace: (...args: any[]) =>
      createLogEntry("trace", args, shouldOutput, minLevel),
    debug: (...args: any[]) =>
      createLogEntry("debug", args, shouldOutput, minLevel),
    info: (...args: any[]) =>
      createLogEntry("info", args, shouldOutput, minLevel),
    warn: (...args: any[]) =>
      createLogEntry("warn", args, shouldOutput, minLevel),
    error: (...args: any[]) =>
      createLogEntry("error", args, shouldOutput, minLevel),
    fatal: (...args: any[]) =>
      createLogEntry("fatal", args, shouldOutput, minLevel),
  };
}

/**
 * Get all captured logs
 */
export function getTestLogs(): CapturedLog[] {
  return [...capturedLogs];
}

/**
 * Get logs filtered by level
 */
export function getTestLogsByLevel(level: LogLevel): CapturedLog[] {
  return capturedLogs.filter((log) => log.level === level);
}

/**
 * Clear all captured logs
 */
export function clearTestLogs(): void {
  capturedLogs.length = 0;
}

/**
 * Get the count of captured logs
 */
export function getTestLogsCount(): number {
  return capturedLogs.length;
}
