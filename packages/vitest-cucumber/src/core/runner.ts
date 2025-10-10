import { execSync } from "child_process";
import path from "path";
import type { FeatureTestResult } from "~/types";

/**
 * Core runner that executes Cucumber for a single feature file
 */
export function runCucumberFeature(
  featurePath: string,
  stepGlob: string,
  formatOptions: string[] = [],
): FeatureTestResult {
  const featureName = featurePath
    .replace("features/", "")
    .replace(".feature", "");

  try {
    const formatArgs =
      formatOptions.length > 0
        ? formatOptions.map((f) => `--format ${f}`).join(" ")
        : "";

    // Find cucumber-js binary
    const cucumberBin = path.resolve(
      process.cwd(),
      "node_modules/.bin/cucumber-js",
    );

    const command =
      `"${cucumberBin}" "${featurePath}" --import "${stepGlob}" ${formatArgs}`.trim();

    const output = execSync(command, {
      encoding: "utf-8",
      stdio: "pipe",
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_OPTIONS: "--import tsx",
      },
    });

    return {
      featurePath,
      featureName,
      success: true,
      output,
    };
  } catch (error: any) {
    const errorOutput = error.stderr || error.message || "";
    const stdout = error.stdout || "";

    // Check if there are undefined steps with special characters that need escaping
    const hasEscapingIssue =
      stdout.includes("Undefined") && /\\\//.test(stdout);

    let enhancedError = errorOutput;
    if (hasEscapingIssue) {
      enhancedError = `${errorOutput}\n\n⚠️  Warning: Detected undefined steps with special characters (like /).
In Cucumber step definitions, special regex characters must be escaped (e.g., \\/) or use parameterized steps.

Better approach: Use {string} parameter in both feature file and step definition:
  Feature: Given I have installed {string}
  Step: Given('I have installed {string}', function(packageName: string) { ... })

Or escape special characters:
  Given('I have installed @deepracticex\\/configurer', function() { ... })
`;
    }

    return {
      featurePath,
      featureName,
      success: false,
      output: stdout,
      error: enhancedError,
    };
  }
}
