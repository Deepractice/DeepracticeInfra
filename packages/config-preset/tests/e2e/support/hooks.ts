/**
 * Vitest-Cucumber hooks for config-preset tests
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
  console.log("🥒 Starting config-preset tests");
});

Before(async function () {
  // Context is now shared between Background and Scenario (plugin 1.1.0+)
  // No need to initialize here
});

After(async function () {
  // Cleanup happens automatically through World factory
});

AfterAll(async function () {
  console.log("✅ Config-preset tests completed");
});
