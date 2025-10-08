/**
 * Cucumber hooks for test setup and cleanup
 */
import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import fs from "fs-extra";
import type { ProjectWorld } from "./world";

// Global setup
BeforeAll(async function () {
  // Any global setup needed before all tests
});

// Global teardown
AfterAll(async function () {
  // Any global cleanup needed after all tests
});

// Before each scenario
Before(async function (this: ProjectWorld) {
  // Reset state
  this.stdout = [];
  this.stderr = [];
  this.lastCommand = undefined;
  this.lastResult = undefined;
  this.lastError = undefined;
  this.exitCode = undefined;
});

// After each scenario
After(async function (this: ProjectWorld) {
  // Restore original working directory
  if (this.originalCwd) {
    process.chdir(this.originalCwd);
  }

  // Clean up test directory
  if (this.testDir) {
    try {
      await fs.remove(this.testDir);
    } catch (error) {
      console.error(
        `Failed to clean up test directory: ${this.testDir}`,
        error,
      );
    }
  }

  // Restore any captured console methods
  const restoreConsole = this.get("restoreConsole") as (() => void) | undefined;
  if (restoreConsole) {
    restoreConsole();
  }
});
