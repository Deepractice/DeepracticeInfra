import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import { AppGenerator } from "@deepracticex/nodespec-core";

interface AddOptions {}

export async function addAction(
  appName: string,
  options: AddOptions,
): Promise<void> {
  const spinner = ora();

  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    // Validate app name format
    validateAppName(appName);

    // Check if app already exists
    const dirName = extractDirectoryName(appName);
    const targetDir = path.join(monorepoRoot, "apps", dirName);

    if (await fs.pathExists(targetDir)) {
      console.error(chalk.red(`Error: App already exists: ${targetDir}`));
      process.exit(1);
    }

    console.log(chalk.blue(`Adding application: ${appName}`));
    console.log(chalk.gray(`Location: apps/${dirName}\n`));

    // Generate app structure
    spinner.start("Generating application structure");
    const generator = new AppGenerator();
    await generator.generate(monorepoRoot, { name: appName });
    spinner.succeed("Application structure generated");

    console.log(chalk.green(`\n✓ App ${appName} added successfully!\n`));
    console.log(chalk.blue("Next steps:"));
    console.log(chalk.gray("  pnpm install"));
    console.log(chalk.gray(`  pnpm build --filter ${appName}`));
    console.log(chalk.gray(`  pnpm --filter ${appName} start\n`));
  } catch (error) {
    spinner.fail("Failed to add app");
    console.error(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ),
    );
    process.exit(1);
  }
}

/**
 * Validate we are in a monorepo by checking for pnpm-workspace.yaml
 */
async function validateMonorepo(cwd: string): Promise<void> {
  const workspaceFile = path.join(cwd, "pnpm-workspace.yaml");
  if (!(await fs.pathExists(workspaceFile))) {
    throw new Error("Not in a monorepo - pnpm-workspace.yaml not found");
  }
}

/**
 * Validate app name follows npm naming conventions
 * @see https://docs.npmjs.com/cli/v7/configuring-npm/package-json#name
 */
function validateAppName(name: string): void {
  // Basic npm naming rules
  const npmNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

  if (!npmNameRegex.test(name)) {
    throw new Error(
      `Invalid app name: "${name}". App names must be lowercase and can only contain URL-safe characters.`,
    );
  }

  // Additional check: no uppercase letters
  if (name !== name.toLowerCase()) {
    throw new Error(
      `Invalid app name: "${name}". App names must be lowercase.`,
    );
  }
}

/**
 * Extract directory name from app name
 * @param name - App name (may include scope like @org/name)
 * @returns Directory name without scope
 */
function extractDirectoryName(name: string): string {
  if (name.startsWith("@")) {
    const parts = name.split("/");
    return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
  }
  return name;
}
