/**
 * Vitest-Cucumber hooks for error-handling tests
 */

import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
} from "@deepracticex/configurer/vitest";
import { createWorld, type ErrorHandlingWorld } from "./world.js";

// Register World factory
setWorldConstructor(createWorld);

BeforeAll(async function () {
  console.log("🥒 Starting error-handling tests");
});

AfterAll(async function () {
  console.log("✅ Error-handling tests completed");
});

Before(async function (this: ErrorHandlingWorld) {
  this.clear();
});

After(async function (this: ErrorHandlingWorld) {
  this.clear();
});
