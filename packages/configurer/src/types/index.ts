/**
 * Type definitions for @deepracticex/configurer
 */

export type EslintPreset = "default" | "strict";
export type PrettierPreset = "default";
export type TypeScriptPreset = "base" | "node" | "strict";
export type CommitlintPreset = "default";
export type VitestPreset = "base" | "coverage";
export type TsupPreset = "base";
export type CucumberPreset = "base";

/**
 * Configuration preset type
 */
export interface ConfigPresets {
  eslint: EslintPreset;
  prettier: PrettierPreset;
  typescript: TypeScriptPreset;
  commitlint: CommitlintPreset;
  vitest: VitestPreset;
  tsup: TsupPreset;
  cucumber: CucumberPreset;
}
