/**
 * Vitest-Cucumber hooks for error-handling tests
 */

import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
} from "@deepracticex/vitest-cucumber/cucumber";
import { createWorld } from "./world.js";

// Register World factory
setWorldConstructor(createWorld);

BeforeAll(async function () {
  console.log("🥒 Starting error-handling tests");
});

AfterAll(async function () {
  console.log("✅ Error-handling tests completed");
});

Before(async function () {
  // Initialize error factory for all scenarios
  const { errors } = await import("~/index.js");
  this.errorFactory = errors;
});

After(async function () {
  // Cleanup happens automatically through World constructor
});
