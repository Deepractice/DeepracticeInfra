/**
 * Pino logger adapter - internal implementation
 */
import pino from "pino";
import path from "path";
import os from "os";
import fs from "fs";
import type { LoggerConfig } from "~/types/config.js";
import { getCallerInfo } from "~/core/caller-tracker.js";

const defaultConfig: LoggerConfig = {
  level: (process.env.LOG_LEVEL as any) || "info",
  console: true,
  file: {
    dirname: path.join(os.homedir(), ".deepractice", "logs"),
  },
  colors: true,
  name: "app",
};

/**
 * Create a Pino logger instance
 */
export function createPinoLogger(config: LoggerConfig = {}): pino.Logger {
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
  const isTest =
    process.env.NODE_ENV === "test" || process.env.VITEST === "true";

  if (isElectron || isTest || process.env.DEEPRACTICE_NO_WORKERS === "true") {
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
