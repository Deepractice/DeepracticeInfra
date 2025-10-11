/**
 * World context for CLI E2E tests
 */
import type { Result } from "execa";

export interface InfraWorld {
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

  // Context storage
  context: Map<string, unknown>;

  // Helper methods
  set(key: string, value: unknown): void;
  get(key: string): unknown;
  clear(): void;
}

export function createWorld(): InfraWorld {
  const context = new Map<string, unknown>();

  return {
    stdout: [],
    stderr: [],
    context,

    set(key: string, value: unknown) {
      this.context.set(key, value);
    },

    get(key: string) {
      return this.context.get(key);
    },

    clear() {
      this.context.clear();
      this.testDir = undefined;
      this.originalCwd = undefined;
      this.lastCommand = undefined;
      this.lastResult = undefined;
      this.lastError = undefined;
      this.exitCode = undefined;
      this.stdout = [];
      this.stderr = [];
      this.expectedMissingPackages = undefined;
    },
  };
}
