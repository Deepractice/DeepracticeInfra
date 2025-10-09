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
  appName: string,
  options: RemoveOptions,
): Promise<void> {
  const spinner = ora();

  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    const utils = new WorkspaceUtils();

    // Find app directory
    const appDir = await utils.findAppDir(monorepoRoot, appName);
    if (!appDir) {
      console.error(chalk.red(`Error: App ${appName} not found`));
      process.exit(1);
    }

    // Confirm removal unless --force is used
    if (!options.force) {
      const response = await prompts({
        type: "confirm",
        name: "confirm",
        message: `Remove app ${appName}?`,
        initial: false,
      });

      if (!response.confirm) {
        console.log(chalk.gray("Operation cancelled"));
        process.exit(0);
      }
    }

    // Remove app directory
    spinner.start(`Removing app ${appName}`);
    await fs.remove(appDir);
    spinner.succeed(`App ${appName} removed successfully`);

    console.log(chalk.gray("\nNext steps:"));
    console.log(chalk.gray("  pnpm install\n"));
  } catch (error) {
    spinner.fail("Failed to remove app");
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
