/**
 * @deepracticex/logger - Unified logging system for Deepractice projects using Pino
 * Features:
 * - Console with pretty print and caller location
 * - File logging with daily rotation
 * - Configurable log levels
 * - Color support for console output
 * - MCP stdio mode support (no ANSI colors)
 * - Electron compatibility (sync mode to avoid worker threads)
 */

import pino from "pino";
import path from "path";
import os from "os";
import fs from "fs";

// Logger configuration interface
export interface LoggerConfig {
  level?: string;
  console?: boolean;
  file?:
    | boolean
    | {
        dirname?: string;
      };
  colors?: boolean;
  name?: string; // Package/service name for identification
}

// Default configuration
const defaultConfig: LoggerConfig = {
  level: process.env.LOG_LEVEL || "info",
  console: true,
  file: {
    dirname: path.join(os.homedir(), ".deepractice", "logs"),
  },
  colors: true,
  name: "app",
};

// Get caller information from stack
function getCallerInfo(packageName: string) {
  const stack = new Error().stack || "";
  const stackLines = stack.split("\n");

  // Find first non-logger stack frame
  for (let i = 2; i < stackLines.length; i++) {
    const line = stackLines[i];
    if (
      line &&
      !line.includes("node_modules/pino") &&
      !line.includes("packages/logger") &&
      !line.includes("@deepracticex/logger")
    ) {
      const match = line.match(/at\s+(?:.*?\s+)?\(?(.*?):(\d+):(\d+)\)?/);
      if (match && match[1] && match[2]) {
        const fullPath = match[1];
        const lineNum = parseInt(match[2], 10);

        // Get filename only
        const filename = path.basename(fullPath);

        return {
          package: packageName,
          file: filename,
          line: lineNum,
        };
      }
    }
  }

  return { package: packageName, file: "unknown", line: 0 };
}

// Create logger instance
export function createLogger(config: LoggerConfig = {}): pino.Logger {
  const finalConfig = { ...defaultConfig, ...config };

  // Ensure log directory exists
  if (finalConfig.file) {
    const fileConfig =
      typeof finalConfig.file === "object" ? finalConfig.file : {};
    const logDir =
      fileConfig.dirname || path.join(os.homedir(), ".deepractice", "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // For Electron desktop app, avoid worker thread issues
  const isElectron = process.versions && "electron" in process.versions;

  if (isElectron || process.env.DEEPRACTICE_NO_WORKERS === "true") {
    // For Electron: use sync mode to avoid worker thread issues
    if (finalConfig.file) {
      const fileConfig =
        typeof finalConfig.file === "object" ? finalConfig.file : {};
      const logDir =
        fileConfig.dirname || path.join(os.homedir(), ".deepractice", "logs");
      const today = new Date().toISOString().split("T")[0];
      const logPath = path.join(logDir, `deepractice-${today}.log`);

      const dest = pino.destination({
        dest: logPath,
        sync: true,
      });

      return pino(
        {
          level: finalConfig.level || "info",
          base: { pid: process.pid },
          mixin: () => getCallerInfo(finalConfig.name || "app"),
          formatters: {
            level: (label) => {
              return { level: label };
            },
            log: (obj) => {
              const { package: pkg, file, line, ...rest } = obj;
              return {
                ...rest,
                location: pkg && file ? `${pkg} [${file}:${line}]` : undefined,
              };
            },
          },
        },
        dest,
      );
    } else {
      return pino({
        level: finalConfig.level || "info",
        base: { pid: process.pid },
        mixin: () => getCallerInfo(finalConfig.name || "app"),
        formatters: {
          level: (label) => {
            return { level: label };
          },
          log: (obj) => {
            const { package: pkg, file, line, ...rest } = obj;
            return {
              ...rest,
              location: pkg && file ? `${pkg} [${file}:${line}]` : undefined,
            };
          },
        },
      });
    }
  } else {
    // Use transports for non-Electron environments (better for servers)
    const targets: any[] = [];

    // Console transport
    if (finalConfig.console) {
      targets.push({
        target: "pino-pretty",
        level: finalConfig.level,
        options: {
          // MCP stdio mode disables colors to avoid ANSI escape codes
          colorize:
            process.env.MCP_TRANSPORT === "stdio" ? false : finalConfig.colors,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
          ignore: "hostname,pid,package,file,line",
          destination: 2, // stderr (fd 2) - MCP best practice
          messageFormat: "{package} [{file}:{line}] {msg}",
        },
      });
    }

    // File transport
    if (finalConfig.file) {
      const fileConfig =
        typeof finalConfig.file === "object" ? finalConfig.file : {};
      const logDir =
        fileConfig.dirname || path.join(os.homedir(), ".deepractice", "logs");
      const today = new Date().toISOString().split("T")[0];

      targets.push({
        target: "pino/file",
        level: finalConfig.level,
        options: {
          destination: path.join(logDir, `deepractice-${today}.log`),
        },
      });

      // Separate error log
      targets.push({
        target: "pino/file",
        level: "error",
        options: {
          destination: path.join(logDir, `deepractice-error-${today}.log`),
        },
      });
    }

    // Create logger with transports
    if (targets.length > 0) {
      return pino({
        level: finalConfig.level || "info",
        base: { pid: process.pid },
        mixin: () => getCallerInfo(finalConfig.name || "app"),
        transport: {
          targets,
        },
      });
    }
  }

  // Fallback to basic logger
  return pino({
    level: finalConfig.level || "info",
    base: { pid: process.pid },
    mixin: () => getCallerInfo(finalConfig.name || "app"),
  });
}

// Default logger instance
const logger = createLogger();

// Export convenience methods with flexible API
// Supports multiple call patterns for maximum flexibility:
// - logger.info(msg)
// - logger.info(msg, context)
// - logger.info(msg, arg1, arg2, ...)
// - logger.info(context, msg) - Pino native order
export const error = (...args: any[]) => {
  (logger.error as any)(...args);
};

export const warn = (...args: any[]) => {
  (logger.warn as any)(...args);
};

export const info = (...args: any[]) => {
  (logger.info as any)(...args);
};

export const debug = (...args: any[]) => {
  (logger.debug as any)(...args);
};

export const verbose = (...args: any[]) => {
  (logger.trace as any)(...args);
};

export const log = (level: string, ...args: any[]) => {
  const method = (logger as any)[level];
  if (typeof method === "function") {
    method(...args);
  } else {
    (logger.info as any)(...args);
  }
};

// Export default logger
export default logger;

// Re-export pino types
export type Logger = pino.Logger;
export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";
