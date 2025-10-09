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
    const packages = await utils.getPackages(monorepoRoot);

    if (packages.length === 0) {
      console.log(chalk.gray("No packages found"));
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(packages, null, 2));
      return;
    }

    if (options.verbose) {
      console.log(chalk.blue(`\nPackages (${packages.length}):\n`));
      for (const pkg of packages) {
        console.log(chalk.bold(pkg.name));
        console.log(chalk.gray(`  Version:  ${pkg.version}`));
        console.log(chalk.gray(`  Location: ${pkg.location}`));
        if (pkg.main) {
          console.log(chalk.gray(`  Main:     ${pkg.main}`));
        }
        if (pkg.types) {
          console.log(chalk.gray(`  Types:    ${pkg.types}`));
        }
        console.log();
      }
    } else {
      console.log(chalk.blue(`\nPackages (${packages.length}):\n`));
      const maxNameLength = Math.max(...packages.map((p) => p.name.length));
      const maxVersionLength = Math.max(
        ...packages.map((p) => p.version.length),
      );

      console.log(
        chalk.bold(
          `${"Package".padEnd(maxNameLength)}  ${"Version".padEnd(maxVersionLength)}  Location`,
        ),
      );
      console.log(
        chalk.gray(
          `${"-".repeat(maxNameLength)}  ${"-".repeat(maxVersionLength)}  ${"-".repeat(20)}`,
        ),
      );

      for (const pkg of packages) {
        console.log(
          `${pkg.name.padEnd(maxNameLength)}  ${pkg.version.padEnd(maxVersionLength)}  ${chalk.gray(pkg.location)}`,
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
