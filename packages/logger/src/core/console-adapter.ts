/**
 * Console logger adapter - for edge runtimes and browsers
 */
import type { LoggerConfig } from "~/types/config.js";
import type { LogLevel } from "~/types/logger.js";

interface ConsoleLoggerInstance {
  trace: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  fatal: (...args: any[]) => void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

const defaultConfig: LoggerConfig = {
  level: "info",
  console: true,
  colors: true,
  name: "app",
};

/**
 * Create a console-based logger instance for edge runtimes
 */
export function createConsoleLogger(
  config: LoggerConfig = {},
): ConsoleLoggerInstance {
  const finalConfig = { ...defaultConfig, ...config };
  const levelThreshold = LOG_LEVELS[finalConfig.level || "info"];
  const name = finalConfig.name || "app";

  const formatMessage = (level: LogLevel, ...args: any[]): string => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${name}]`;
    return `${prefix} ${args.join(" ")}`;
  };

  const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVELS[level] >= levelThreshold;
  };

  const logMethod = (level: LogLevel, consoleMethod: any) => {
    return (...args: any[]) => {
      if (!shouldLog(level)) return;
      if (!finalConfig.console) return;

      const message = formatMessage(level, ...args);
      consoleMethod(message);
    };
  };

  return {
    trace: logMethod("trace", console.log),
    debug: logMethod("debug", console.log),
    info: logMethod("info", console.info),
    warn: logMethod("warn", console.warn),
    error: logMethod("error", console.error),
    fatal: logMethod("fatal", console.error),
  };
}
