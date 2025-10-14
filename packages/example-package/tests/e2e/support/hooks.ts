/**
 * Cucumber hooks - setup and teardown
 */
import { Before, After } from "@deepracticex/vitest-cucumber/cucumber";
import type { ExampleWorld } from "./world";

Before(function (this: ExampleWorld) {
  // Reset test state before each scenario
  this.consoleLogs = [];
  this.result = undefined;
  this.error = undefined;
});

After(function (this: ExampleWorld) {
  // Restore console if modified
  const restoreConsole = this.get("restoreConsole") as (() => void) | undefined;
  if (restoreConsole) {
    restoreConsole();
  }

  // Clean up after each scenario
  if (this.example) {
    this.example.dispose();
  }
  if (this.secondExample) {
    this.secondExample.dispose();
  }
});
