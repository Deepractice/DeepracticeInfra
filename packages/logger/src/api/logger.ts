/**
 * Default logger implementation
 */
import type { Logger, LoggerConfig } from "~/types/index.js";
import { createPinoLogger } from "~/core/index.js";

export class DefaultLogger implements Logger {
  private pinoLogger: any;

  constructor(config: LoggerConfig = {}) {
    this.pinoLogger = createPinoLogger(config);
  }

  // All methods are typed as `any` for maximum flexibility
  trace: any = (...args: any[]) => {
    (this.pinoLogger.trace as any)(...args);
  };

  debug: any = (...args: any[]) => {
    (this.pinoLogger.debug as any)(...args);
  };

  info: any = (...args: any[]) => {
    (this.pinoLogger.info as any)(...args);
  };

  warn: any = (...args: any[]) => {
    (this.pinoLogger.warn as any)(...args);
  };

  error: any = (...args: any[]) => {
    (this.pinoLogger.error as any)(...args);
  };

  fatal: any = (...args: any[]) => {
    (this.pinoLogger.fatal as any)(...args);
  };
}

/**
 * Factory function to create a logger instance
 */
export function createLogger(config: LoggerConfig = {}): Logger {
  return new DefaultLogger(config);
}
