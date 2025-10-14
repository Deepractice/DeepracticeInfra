/**
 * Vitest-Cucumber hooks for logger tests
 */

import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
} from "@deepracticex/vitest-cucumber";
import { createWorld } from "./world.js";

// Register World factory
setWorldConstructor(createWorld);

BeforeAll(async function () {
  console.log("🥒 Starting logger tests");
});

AfterAll(async function () {
  console.log("✅ Logger tests completed");
});

Before(async function () {
  // Context is now shared between Background and Scenario (plugin 1.1.0+)
  // No need to initialize here
});

After(async function () {
  // Cleanup happens automatically through World factory
});
