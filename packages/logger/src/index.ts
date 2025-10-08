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
// Supports both:
// - logger.info(msg) - simple message
// - logger.info(msg, obj) - message + context object (natural order)
// - logger.info(obj, msg) - Pino native order (backward compatible)
export const error = (
  msgOrObj: string | object,
  objOrMsg?: object | string,
) => {
  if (typeof msgOrObj === "string") {
    if (objOrMsg && typeof objOrMsg === "object") {
      logger.error(objOrMsg, msgOrObj);
    } else {
      logger.error(msgOrObj);
    }
  } else {
    logger.error(msgOrObj, (objOrMsg as string) || "");
  }
};

export const warn = (msgOrObj: string | object, objOrMsg?: object | string) => {
  if (typeof msgOrObj === "string") {
    if (objOrMsg && typeof objOrMsg === "object") {
      logger.warn(objOrMsg, msgOrObj);
    } else {
      logger.warn(msgOrObj);
    }
  } else {
    logger.warn(msgOrObj, (objOrMsg as string) || "");
  }
};

export const info = (msgOrObj: string | object, objOrMsg?: object | string) => {
  if (typeof msgOrObj === "string") {
    if (objOrMsg && typeof objOrMsg === "object") {
      logger.info(objOrMsg, msgOrObj);
    } else {
      logger.info(msgOrObj);
    }
  } else {
    logger.info(msgOrObj, (objOrMsg as string) || "");
  }
};

export const debug = (
  msgOrObj: string | object,
  objOrMsg?: object | string,
) => {
  if (typeof msgOrObj === "string") {
    if (objOrMsg && typeof objOrMsg === "object") {
      logger.debug(objOrMsg, msgOrObj);
    } else {
      logger.debug(msgOrObj);
    }
  } else {
    logger.debug(msgOrObj, (objOrMsg as string) || "");
  }
};

export const verbose = (
  msgOrObj: string | object,
  objOrMsg?: object | string,
) => {
  if (typeof msgOrObj === "string") {
    if (objOrMsg && typeof objOrMsg === "object") {
      logger.trace(objOrMsg, msgOrObj);
    } else {
      logger.trace(msgOrObj);
    }
  } else {
    logger.trace(msgOrObj, (objOrMsg as string) || "");
  }
};

export const log = (level: string, msg: string, ...args: any[]) => {
  const method = (logger as any)[level];
  if (typeof method === "function") {
    method(msg, ...args);
  } else {
    logger.info(msg, ...args);
  }
};

// Export default logger
export default logger;

// Re-export pino types
export type Logger = pino.Logger;
export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";
