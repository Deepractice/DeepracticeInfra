/**
 * Cucumber World for error-handling tests
 */

import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import type { AppError } from "../../../src/index.js";

export interface ErrorHandlingWorld extends World {
  // Error context
  error?: AppError;
  errorFactory?: any;
  errorJson?: any;
  validationFields?: Record<string, string>;

  // Result context
  result?: any;
  userInput?: any;

  // Generic context
  context: Record<string, any>;

  // Helper methods
  set(key: string, value: any): void;
  get(key: string): any;
  clear(): void;
}

class CustomWorld extends World implements ErrorHandlingWorld {
  context: Record<string, any>;
  error?: AppError;
  errorFactory?: any;
  errorJson?: any;
  validationFields?: Record<string, string>;
  result?: any;
  userInput?: any;

  constructor(options: IWorldOptions) {
    super(options);
    this.context = {};
  }

  set(key: string, value: any) {
    this.context[key] = value;
  }

  get(key: string) {
    return this.context[key];
  }

  clear() {
    this.context = {};
    this.error = undefined;
    this.errorFactory = undefined;
    this.errorJson = undefined;
    this.validationFields = undefined;
    this.result = undefined;
    this.userInput = undefined;
  }
}

setWorldConstructor(CustomWorld);
