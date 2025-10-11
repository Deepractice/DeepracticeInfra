/**
 * Vitest-Cucumber hooks for error-handling tests
 */

import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
} from "@deepracticex/configurer/cucumber";
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
  // Context is automatically provided by Cucumber
  // World constructor will create fresh context for each scenario
});

After(async function () {
  // Cleanup happens automatically through World constructor
});
