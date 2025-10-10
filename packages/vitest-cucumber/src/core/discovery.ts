import { glob } from "glob";
import type { CucumberRunnerOptions, FeatureTestResult } from "~/types";
import { runCucumberFeature } from "./runner";

/**
 * Discover all feature files matching the glob pattern
 */
export async function discoverFeatures(featureGlob: string): Promise<string[]> {
  return await glob(featureGlob, {
    cwd: process.cwd(),
  });
}

/**
 * Run all discovered features
 */
export async function runAllFeatures(
  options: CucumberRunnerOptions,
): Promise<FeatureTestResult[]> {
  const featureFiles = await discoverFeatures(options.featureGlob);

  return featureFiles.map((featureFile) =>
    runCucumberFeature(featureFile, options.stepGlob, options.formatOptions),
  );
}
