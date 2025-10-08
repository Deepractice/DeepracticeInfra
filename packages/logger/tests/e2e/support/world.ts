/**
 * Cucumber World for logger tests
 */

import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import type { Logger } from "../../../src/index.js";

export interface LoggerWorld extends World {
  // Logger context
  logger?: Logger;
  logRecords: any[];
  lastLog?: any;

  // Generic context
  context: Record<string, any>;

  // Context methods
  set(key: string, value: any): void;
  get(key: string): any;
  clear(): void;
}

class CustomWorld extends World implements LoggerWorld {
  context: Record<string, any>;
  logRecords: any[];

  constructor(options: IWorldOptions) {
    super(options);
    this.context = {};
    this.logRecords = [];
  }

  set(key: string, value: any) {
    this.context[key] = value;
  }

  get(key: string) {
    return this.context[key];
  }

  clear() {
    this.context = {};
    this.logger = undefined;
    this.logRecords = [];
    this.lastLog = undefined;
  }
}

setWorldConstructor(CustomWorld);
