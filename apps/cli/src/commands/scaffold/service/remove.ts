import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";

interface RemoveOptions {
  force?: boolean;
}

export async function removeAction(
  serviceName: string,
  options: RemoveOptions,
): Promise<void> {
  const spinner = ora();

  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    // Find service directory
    const serviceDir = await findServiceDir(monorepoRoot, serviceName);
    if (!serviceDir) {
      console.error(chalk.red(`Error: Service ${serviceName} not found`));
      process.exit(1);
    }

    // Confirm removal unless --force is used
    if (!options.force) {
      const response = await prompts({
        type: "confirm",
        name: "confirm",
        message: `Remove service ${serviceName}?`,
        initial: false,
      });

      if (!response.confirm) {
        console.log(chalk.gray("Operation cancelled"));
        process.exit(0);
      }
    }

    // Remove service directory
    spinner.start(`Removing service ${serviceName}`);
    await fs.remove(serviceDir);
    spinner.succeed(`Service ${serviceName} removed successfully`);

    console.log(chalk.gray("\nNext steps:"));
    console.log(chalk.gray("  pnpm install\n"));
  } catch (error) {
    spinner.fail("Failed to remove service");
    console.error(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ),
    );
    process.exit(1);
  }
}

/**
 * Find service directory by name
 */
async function findServiceDir(
  monorepoRoot: string,
  serviceName: string,
): Promise<string | null> {
  const servicesDir = path.join(monorepoRoot, "services");
  if (!(await fs.pathExists(servicesDir))) {
    return null;
  }

  const entries = await fs.readdir(servicesDir);

  for (const entry of entries) {
    const serviceDir = path.join(servicesDir, entry);
    const stat = await fs.stat(serviceDir);

    if (stat.isDirectory()) {
      const packageJsonPath = path.join(serviceDir, "package.json");
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        if (packageJson.name === serviceName) {
          return serviceDir;
        }
      }
    }
  }

  return null;
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
