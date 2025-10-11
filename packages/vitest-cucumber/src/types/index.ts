/**
 * Type definitions for vitest-cucumber
 */
export type { VitestCucumberPluginOptions } from "./plugin-options";
export type { StepType, StepFunction, StepDefinition } from "./step-definition";
export type {
  Step,
  DataTable,
  DocString,
  Background,
  Examples,
  Scenario,
  Rule,
  Feature,
  StepContext,
} from "./feature";

/**
 * Legacy types for integration testing (backward compatibility)
 */
export interface CucumberRunnerOptions {
  featureGlob: string;
  stepGlob: string;
  formatOptions?: string[];
}

export interface FeatureTestResult {
  featurePath: string;
  featureName: string;
  success: boolean;
  output?: string;
  error?: string;
}
