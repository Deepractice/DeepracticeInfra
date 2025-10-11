/**
 * @nodespec/vitest-cucumber
 *
 * Vitest plugin for running Cucumber feature files
 */

// Export public API
export { Given, When, Then, And, But } from "~/api";
export { Before, After, BeforeAll, AfterAll } from "~/api";
export { vitestCucumber } from "~/api";

// Export public types
export type {
  VitestCucumberPluginOptions,
  StepType,
  StepFunction,
  StepDefinition,
  Step,
  DataTable,
  DocString,
  Scenario,
  Feature,
  StepContext,
} from "~/types";

// Note: core/ is NOT exported - it's internal implementation
