/**
 * Default logger implementation
 */
import type { Logger, LoggerConfig } from "~/types/index.js";
import { createLoggerAdapter } from "~/core/adapter-factory.js";

export class DefaultLogger implements Logger {
  private adapter: any;
  private initPromise: Promise<void>;

  constructor(config: LoggerConfig = {}) {
    // Initialize adapter asynchronously
    this.initPromise = createLoggerAdapter(config).then((adapter) => {
      this.adapter = adapter;
    });
  }

  // All methods are typed as `any` for maximum flexibility
  trace: any = async (...args: any[]) => {
    await this.initPromise;
    (this.adapter.trace as any)(...args);
  };

  debug: any = async (...args: any[]) => {
    await this.initPromise;
    (this.adapter.debug as any)(...args);
  };

  info: any = async (...args: any[]) => {
    await this.initPromise;
    (this.adapter.info as any)(...args);
  };

  warn: any = async (...args: any[]) => {
    await this.initPromise;
    (this.adapter.warn as any)(...args);
  };

  error: any = async (...args: any[]) => {
    await this.initPromise;
    (this.adapter.error as any)(...args);
  };

  fatal: any = async (...args: any[]) => {
    await this.initPromise;
    (this.adapter.fatal as any)(...args);
  };
}

/**
 * Factory function to create a logger instance
 */
export function createLogger(config: LoggerConfig = {}): Logger {
  return new DefaultLogger(config);
}
