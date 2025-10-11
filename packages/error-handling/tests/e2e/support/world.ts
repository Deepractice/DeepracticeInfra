/**
 * World context for error-handling tests
 */

import type { AppError } from "~/index.js";

export interface ErrorHandlingWorld {
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

// World factory - creates fresh context for each scenario
export function createWorld(): ErrorHandlingWorld {
  const context: Record<string, any> = {};

  return {
    context,
    set(key: string, value: any) {
      this.context[key] = value;
    },
    get(key: string) {
      return this.context[key];
    },
    clear() {
      this.context = {};
      this.error = undefined;
      this.errorFactory = undefined;
      this.errorJson = undefined;
      this.validationFields = undefined;
      this.result = undefined;
      this.userInput = undefined;
    },
  };
}
