import { describe, it, expect } from "vitest";
import { discoverFeatures, runCucumberFeature } from "~/core";
import type { CucumberRunnerOptions } from "~/types";

/**
 * Generate Vitest tests for Cucumber features
 *
 * This function discovers all feature files and creates a Vitest test
 * for each feature file, running it with Cucumber.
 *
 * @example
 * ```typescript
 * // tests/e2e/cucumber.test.ts
 * import { generateCucumberTests } from '@deepracticex/vitest-cucumber';
 *
 * await generateCucumberTests({
 *   featureGlob: 'features/**\/*.feature',
 *   stepGlob: 'tests/e2e/steps/**\/*.ts',
 * });
 * ```
 */
export async function generateCucumberTests(
  options: CucumberRunnerOptions,
): Promise<void> {
  const featureFiles = await discoverFeatures(options.featureGlob);

  featureFiles.forEach((featureFile) => {
    const featureName = featureFile
      .replace("features/", "")
      .replace(".feature", "");

    describe(featureName, () => {
      it("should pass all scenarios", () => {
        const result = runCucumberFeature(
          featureFile,
          options.stepGlob,
          options.formatOptions,
        );

        if (!result.success) {
          const errorMessage = [
            `Cucumber feature failed: ${featureName}`,
            "",
            "Output:",
            result.output || "",
            "",
            "Error:",
            result.error || "",
          ].join("\n");

          throw new Error(errorMessage);
        }

        expect(result.success).toBe(true);
      });
    });
  });
}
