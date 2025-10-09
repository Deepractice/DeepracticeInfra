/**
 * Cucumber World - shared context for infra E2E tests
 */
import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import type { Result } from "execa";

export interface InfraWorld extends World {
  // Working directory context
  testDir?: string;
  originalCwd?: string;

  // Command execution state
  lastCommand?: string;
  lastResult?: Result;
  lastError?: Error;
  exitCode?: number;

  // Output capture
  stdout: string[];
  stderr: string[];

  // Test state
  expectedMissingPackages?: string[];

  // Helper methods
  set(key: string, value: unknown): void;
  get(key: string): unknown;
}

class CustomWorld extends World implements InfraWorld {
  testDir?: string;
  originalCwd?: string;
  lastCommand?: string;
  lastResult?: Result;
  lastError?: Error;
  exitCode?: number;
  stdout: string[] = [];
  stderr: string[] = [];

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
