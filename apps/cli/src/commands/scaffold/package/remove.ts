import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import { WorkspaceUtils } from "@deepracticex/nodespec-core";

interface RemoveOptions {
  force?: boolean;
}

export async function removeAction(
  packageName: string,
  options: RemoveOptions,
): Promise<void> {
  const spinner = ora();

  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    const utils = new WorkspaceUtils();

    // Find package directory
    const packageDir = await utils.findPackageDir(monorepoRoot, packageName);
    if (!packageDir) {
      console.error(chalk.red(`Error: Package ${packageName} not found`));
      process.exit(1);
    }

    // Check dependencies
    const depInfo = await utils.checkDependencies(monorepoRoot, packageName);
    if (depInfo.dependents.length > 0) {
      console.error(
        chalk.red(
          `Error: Cannot remove package: ${depInfo.dependents.length} package${depInfo.dependents.length > 1 ? "s" : ""} depend${depInfo.dependents.length === 1 ? "s" : ""} on it`,
        ),
      );
      console.error(chalk.gray("\nDependents:"));
      for (const dependent of depInfo.dependents) {
        console.error(chalk.gray(`  - ${dependent}`));
      }
      process.exit(1);
    }

    // Confirm removal unless --force is used
    if (!options.force) {
      const response = await prompts({
        type: "confirm",
        name: "confirm",
        message: `Remove package ${packageName}?`,
        initial: false,
      });

      if (!response.confirm) {
        console.log(chalk.gray("Operation cancelled"));
        process.exit(0);
      }
    }

    // Remove package directory
    spinner.start(`Removing package ${packageName}`);
    await fs.remove(packageDir);
    spinner.succeed(`Package ${packageName} removed successfully`);

    console.log(chalk.gray("\nNext steps:"));
    console.log(chalk.gray("  pnpm install\n"));
  } catch (error) {
    spinner.fail("Failed to remove package");
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
