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
  packageName: string | undefined,
  options: ValidateOptions,
): Promise<void> {
  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    const validator = new WorkspaceValidator();
    const utils = new WorkspaceUtils();

    if (options.all) {
      // Validate all packages
      const packages = await utils.getPackages(monorepoRoot);
      let validCount = 0;
      let errorCount = 0;

      console.log(chalk.blue(`\nValidating ${packages.length} packages...\n`));

      for (const pkg of packages) {
        const packageDir = path.join(monorepoRoot, pkg.location);
        const result = await validator.validatePackage(packageDir);

        if (result.valid) {
          validCount++;
          console.log(chalk.green(`✓ ${pkg.name}`));
        } else {
          errorCount++;
          console.log(chalk.red(`✗ ${pkg.name}`));
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
          chalk.green(
            `\nAll packages are valid (${packages.length} packages checked)`,
          ),
        );
      }
    } else {
      // Validate single package
      if (!packageName) {
        console.error(
          chalk.red("Error: Package name required (or use --all flag)"),
        );
        process.exit(1);
      }

      const packageDir = await utils.findPackageDir(monorepoRoot, packageName);
      if (!packageDir) {
        console.error(chalk.red(`Error: Package ${packageName} not found`));
        process.exit(1);
      }

      const result = await validator.validatePackage(packageDir);

      if (result.valid) {
        console.log(chalk.green(`\n✓ Package ${packageName} is valid\n`));
      } else {
        console.log(
          chalk.red(`\n✗ Package ${packageName} validation failed:\n`),
        );
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
