import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { WorkspaceUtils } from "@deepracticex/nodespec-core";

interface ListOptions {
  verbose?: boolean;
  json?: boolean;
}

export async function listAction(options: ListOptions): Promise<void> {
  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    const utils = new WorkspaceUtils();
    const apps = await utils.getApps(monorepoRoot);

    if (apps.length === 0) {
      console.log(chalk.gray("No apps found"));
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(apps, null, 2));
      return;
    }

    if (options.verbose) {
      console.log(chalk.blue(`\nApps (${apps.length}):\n`));
      for (const app of apps) {
        console.log(chalk.bold(app.name));
        console.log(chalk.gray(`  Version:  ${app.version}`));
        console.log(chalk.gray(`  Location: ${app.location}`));
        if (app.bin) {
          const binValue =
            typeof app.bin === "string" ? app.bin : Object.values(app.bin)[0];
          console.log(chalk.gray(`  Bin:      ${binValue}`));
        }
        console.log();
      }
    } else {
      console.log(chalk.blue(`\nApps (${apps.length}):\n`));
      const maxNameLength = Math.max(...apps.map((a) => a.name.length));
      const maxVersionLength = Math.max(...apps.map((a) => a.version.length));

      console.log(
        chalk.bold(
          `${"App".padEnd(maxNameLength)}  ${"Version".padEnd(maxVersionLength)}  Location`,
        ),
      );
      console.log(
        chalk.gray(
          `${"-".repeat(maxNameLength)}  ${"-".repeat(maxVersionLength)}  ${"-".repeat(20)}`,
        ),
      );

      for (const app of apps) {
        console.log(
          `${app.name.padEnd(maxNameLength)}  ${app.version.padEnd(maxVersionLength)}  ${chalk.gray(app.location)}`,
        );
      }
      console.log();
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
