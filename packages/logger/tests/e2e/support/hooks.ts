/**
 * Cucumber hooks for logger tests
 */

import { Before, After, BeforeAll, AfterAll, Status } from "@cucumber/cucumber";
import type { LoggerWorld } from "./world.js";

BeforeAll(async function () {
  console.log("🥒 Starting logger tests");
});

AfterAll(async function () {
  console.log("✅ Logger tests completed");
});

Before(async function (this: LoggerWorld) {
  this.clear();
});

After(async function (this: LoggerWorld, { result, pickle }) {
  if (result?.status === Status.FAILED) {
    console.error(`❌ Scenario failed: ${pickle.name}`);
    if (result.message) {
      console.error(result.message);
    }
  }
  this.clear();
});
