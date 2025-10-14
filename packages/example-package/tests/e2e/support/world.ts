/**
 * Cucumber World - shared context across steps
 */
import { setWorldConstructor } from "@deepracticex/vitest-cucumber";
import type { Example } from "@/index";

export interface ExampleWorld {
  // Example instances
  example?: Example;
  secondExample?: Example;

  // Test state
  result?: string;
  error?: Error;
  consoleLogs: string[];

  // Helper methods
  set(key: string, value: unknown): void;
  get(key: string): unknown;
}

function createWorld(): ExampleWorld {
  const context = new Map<string, unknown>();

  return {
    example: undefined,
    secondExample: undefined,
    result: undefined,
    error: undefined,
    consoleLogs: [],

    set(key: string, value: unknown): void {
      context.set(key, value);
    },

    get(key: string): unknown {
      return context.get(key);
    },
  };
}

setWorldConstructor(createWorld);
