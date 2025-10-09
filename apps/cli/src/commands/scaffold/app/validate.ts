import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import {
  WorkspaceValidator,
  WorkspaceUtils,
} from "@deepracticex/nodespec-core";

interface ValidateOptions {
  all?: boolean;
}

export async function validateAction(
  appName: string | undefined,
  options: ValidateOptions,
): Promise<void> {
  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    const validator = new WorkspaceValidator();
    const utils = new WorkspaceUtils();

    if (options.all) {
      // Validate all apps
      const apps = await utils.getApps(monorepoRoot);
      let validCount = 0;
      let errorCount = 0;

      console.log(chalk.blue(`\nValidating ${apps.length} apps...\n`));

      for (const app of apps) {
        const appDir = path.join(monorepoRoot, app.location);
        const result = await validator.validateApp(appDir);

        if (result.valid) {
          validCount++;
          console.log(chalk.green(`✓ ${app.name}`));
        } else {
          errorCount++;
          console.log(chalk.red(`✗ ${app.name}`));
          for (const error of result.errors) {
            console.log(chalk.gray(`  - ${error.message}`));
          }
        }
      }

      console.log(
        chalk.blue(
          `\nValidation complete: ${validCount} valid, ${errorCount} errors`,
        ),
      );

      if (errorCount > 0) {
        process.exit(1);
      } else {
        console.log(
          chalk.green(`\nAll apps are valid (${apps.length} apps checked)`),
        );
      }
    } else {
      // Validate single app
      if (!appName) {
        console.error(
          chalk.red("Error: App name required (or use --all flag)"),
        );
        process.exit(1);
      }

      const appDir = await utils.findAppDir(monorepoRoot, appName);
      if (!appDir) {
        console.error(chalk.red(`Error: App ${appName} not found`));
        process.exit(1);
      }

      const result = await validator.validateApp(appDir);

      if (result.valid) {
        console.log(chalk.green(`\n✓ App ${appName} is valid\n`));
      } else {
        console.log(chalk.red(`\n✗ App ${appName} validation failed:\n`));
        for (const error of result.errors) {
          console.log(chalk.red(`  - ${error.message}`));
        }
        console.log();
        process.exit(1);
      }
    }
  } catch (error) {
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
