import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

export async function validateAction(
  configName?: string,
  options: { all?: boolean } = {},
): Promise<void> {
  const cwd = process.cwd();
  const results: ValidationResult[] = [];

  const configFiles =
    options.all || !configName
      ? [".eslintrc.json", ".prettierrc.json", "tsconfig.json"]
      : [configName];

  for (const file of configFiles) {
    const result = await validateConfig(path.join(cwd, file));
    results.push(result);
  }

  // Display results
  console.log(chalk.blue("\nValidation Summary:\n"));
  console.log("| Config           | Status |");
  console.log("|------------------|--------|");

  let hasErrors = false;
  for (const result of results) {
    const status = result.valid ? chalk.green("valid") : chalk.red("errors");
    console.log(`| ${result.file.padEnd(16)} | ${status.padEnd(6)} |`);

    if (!result.valid) {
      hasErrors = true;
      console.log(chalk.red(`\nErrors in ${result.file}:`));
      for (const error of result.errors) {
        console.log(chalk.red(`  - ${error}`));
      }
    }
  }

  if (hasErrors) {
    console.log(chalk.yellow("\nRecommended Actions:"));
    console.log("  - Fix syntax errors in config files");
    console.log("  - Run: nodespec scaffold config init --force");
    process.exit(1);
  }
}

async function validateConfig(filePath: string): Promise<ValidationResult> {
  const fileName = path.basename(filePath);
  const result: ValidationResult = {
    file: fileName,
    valid: true,
    errors: [],
  };

  if (!(await fs.pathExists(filePath))) {
    result.valid = false;
    result.errors.push("File does not exist");
    return result;
  }

  try {
    if (fileName.endsWith(".json")) {
      const content = await fs.readJson(filePath);

      // Validate structure
      if (fileName === "tsconfig.json") {
        if (!content.compilerOptions && !content.extends) {
          result.valid = false;
          result.errors.push("Missing compilerOptions or extends field");
        }
      }

      if (fileName === ".eslintrc.json") {
        if (!content.extends && !content.rules) {
          result.valid = false;
          result.errors.push("Missing extends or rules field");
        }
      }
    }
  } catch (error) {
    result.valid = false;
    result.errors.push(
      `Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  return result;
}
