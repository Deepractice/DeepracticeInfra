/**
 * Cucumber World - shared context across steps
 */
import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import type { Example } from "@/index";

export interface ExampleWorld extends World {
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

class CustomWorld extends World implements ExampleWorld {
  example?: Example;
  secondExample?: Example;
  result?: string;
  error?: Error;
  consoleLogs: string[] = [];

  private context: Map<string, unknown> = new Map();

  constructor(options: IWorldOptions) {
    super(options);
  }

  set(key: string, value: unknown): void {
    this.context.set(key, value);
  }

  get(key: string): unknown {
    return this.context.get(key);
  }
}

setWorldConstructor(CustomWorld);
