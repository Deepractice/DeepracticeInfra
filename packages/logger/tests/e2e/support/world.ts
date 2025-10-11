/**
 * World context for logger tests
 */

import type { Logger } from "~/index.js";

export interface LoggerWorld {
  // Logger context
  logger?: Logger;
  logRecords: any[];
  lastLog?: any;

  // Generic context
  context: Record<string, any>;

  // Helper methods
  set(key: string, value: any): void;
  get(key: string): any;
  clear(): void;
}

// World factory - creates fresh context for each scenario
export function createWorld(): LoggerWorld {
  const context: Record<string, any> = {};

  return {
    context,
    logRecords: [],
    set(key: string, value: any) {
      this.context[key] = value;
    },
    get(key: string) {
      return this.context[key];
    },
    clear() {
      this.context = {};
      this.logger = undefined;
      this.logRecords = [];
      this.lastLog = undefined;
    },
  };
}
