/**
 * Cucumber hooks for error-handling tests
 */

import { Before, After, BeforeAll, AfterAll, Status } from "@cucumber/cucumber";
import type { ErrorHandlingWorld } from "./world.js";

BeforeAll(async function () {
  console.log("🥒 Starting error-handling tests");
});

AfterAll(async function () {
  console.log("✅ Error-handling tests completed");
});

Before(async function (this: ErrorHandlingWorld) {
  this.clear();
});

After(async function (this: ErrorHandlingWorld, { result, pickle }) {
  if (result?.status === Status.FAILED) {
    console.error(`❌ Scenario failed: ${pickle.name}`);
    if (result.message) {
      console.error(result.message);
    }
  }
  this.clear();
});
