import { Command } from "commander";
import {
  FeatureValidator,
  type ValidateOptions,
  type FeatureValidationResult,
} from "@deepracticex/nodespec-core";

export const validateCommand = new Command("validate")
  .description("Validate @spec:id tags and index consistency")
  .argument("[path]", "Feature file path to validate")
  .option("--all", "Validate all features in workspace")
  .option("--format <type>", "Output format (table|json)", "table")
  .option("--fix", "Auto-fix issues when possible")
  .option("--strict", "Treat warnings as errors")
  .option("--fast", "Fast validation using index cache")
  .option("--no-cache", "Force full validation without cache")
  .action(async (featurePath: string | undefined, options: ValidateOptions) => {
    const rootDir = process.cwd();
    const validator = new FeatureValidator(rootDir);

    try {
      let result: FeatureValidationResult;

      if (options.all || !featurePath) {
        result = await validator.validateAll(options);
      } else {
        result = await validator.validateFile(featurePath, options);
      }

      // Output based on format
      if (options.format === "json") {
        console.log(JSON.stringify(result, null, 2));
      } else {
        displayTableFormat(result, options);
      }

      // Exit with appropriate code
      const exitCode = result.valid ? 0 : 1;
      if (options.strict && result.warnings.length > 0) {
        console.log("\nStrict mode: treating warnings as errors");
        process.exit(1);
      }
      process.exit(exitCode);
    } catch (error) {
      console.error(`Validation failed: ${error}`);
      process.exit(1);
    }
  });

function displayTableFormat(
  result: FeatureValidationResult,
  options: ValidateOptions,
): void {
  console.log("\n=== Feature Validation Report ===\n");

  // Summary
  console.log(`Valid features: ${result.validCount}`);
  console.log(`Invalid features: ${result.invalidCount}`);
  console.log(`Total errors: ${result.errors.length}`);
  console.log(`Total warnings: ${result.warnings.length}`);

  // Performance info
  if (options.fast) {
    console.log("\nFast mode: validated using index cache");
  } else if (options.noCache) {
    const totalFeatures = result.validCount + result.invalidCount;
    console.log(`\nFull validation: read ${totalFeatures} feature files`);
  }

  // Errors
  if (result.errors.length > 0) {
    console.log("\n--- Errors ---");
    for (const error of result.errors) {
      console.log(`\n[${error.category}]`);
      console.log(`  ${error.message}`);
      if (error.featurePath) {
        console.log(`  File: ${error.featurePath}`);
      }
      if (error.specId) {
        console.log(`  Spec ID: ${error.specId}`);
      }
      if (error.details) {
        if (error.details.expected) {
          console.log(`  Expected: ${error.details.expected}`);
        }
        if (error.details.found) {
          console.log(`  Found: ${error.details.found}`);
        }
        if (error.details.duplicatePaths) {
          console.log(`  Duplicate in files:`);
          for (const dupPath of error.details.duplicatePaths) {
            console.log(`    - ${dupPath}`);
          }
        }
      }
    }
  }

  // Warnings
  if (result.warnings.length > 0) {
    console.log("\n--- Warnings ---");
    for (const warning of result.warnings) {
      console.log(`\n[${warning.category}]`);
      console.log(`  ${warning.message}`);
      if (warning.featurePath) {
        console.log(`  File: ${warning.featurePath}`);
      }
      if (warning.specId) {
        console.log(`  Spec ID: ${warning.specId}`);
      }
    }
  }

  // Suggestions
  if (result.suggestions.length > 0) {
    console.log("\n--- Suggestions ---");
    for (const suggestion of result.suggestions) {
      console.log(`  💡 ${suggestion}`);
    }
  }

  // Summary message
  if (result.valid) {
    const totalFeatures = result.validCount + result.invalidCount;
    if (totalFeatures === 1) {
      console.log(
        `\n✓ Feature valid: ${result.validCount > 0 ? "passed" : "checked"}`,
      );
    } else {
      console.log(`\n✓ All ${result.validCount} features are valid`);
    }
  } else {
    console.log("\n✗ Validation failed");
  }
}
