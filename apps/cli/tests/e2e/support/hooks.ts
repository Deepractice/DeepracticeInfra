/**
 * Vitest-Cucumber hooks for test setup and cleanup
 */
import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
} from "@deepracticex/testing-utils";
import { createWorld } from "./world.js";

// Register World factory
setWorldConstructor(createWorld);

// Global setup
BeforeAll(async function () {
  // Any global setup needed before all tests
});

// Global teardown
AfterAll(async function () {
  // Any global cleanup needed after all tests
});

// Before each scenario
Before(async function () {
  // Context is now shared between Background and Scenario (plugin 1.1.0+)
  // No need to initialize here
});

// After each scenario
After(async function () {
  // Cleanup happens automatically through World factory
  // Additional cleanup if needed can be added here
});
