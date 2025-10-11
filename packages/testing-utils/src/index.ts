/**
 * @deepracticex/testing-utils
 *
 * Testing utility functions for Deepractice projects.
 * Provides BDD testing tools and helpers.
 *
 * @example
 * ```typescript
 * import { Given, When, Then } from "@deepracticex/testing-utils/cucumber";
 *
 * Given("I have {int} cucumbers", async function (count: number) {
 *   this.count = count;
 * });
 *
 * When("I eat {int} cucumbers", async function (count: number) {
 *   this.count -= count;
 * });
 *
 * Then("I should have {int} cucumbers", async function (expected: number) {
 *   expect(this.count).toBe(expected);
 * });
 * ```
 */

export * from "./api";
export * from "./types";

/**
 * Re-export runtime APIs for vitest-cucumber plugin
 * This allows the plugin to generate code that imports from @deepracticex/testing-utils
 * instead of directly from @deepracticex/vitest-cucumber/runtime
 */
export {
  StepExecutor,
  ContextManager,
  DataTable,
  HookRegistry,
} from "@deepracticex/vitest-cucumber/runtime";
