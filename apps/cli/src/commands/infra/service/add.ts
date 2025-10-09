import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import { ServiceGenerator } from "@deepracticex/nodespec-core";

interface AddOptions {
  location?: string;
}

export async function addAction(
  serviceName: string,
  options: AddOptions,
): Promise<void> {
  const spinner = ora();

  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    // Validate service name format
    validateServiceName(serviceName);

    // Check if service already exists
    const location = options.location || "services";
    const dirName = extractDirectoryName(serviceName);
    const targetDir = path.join(monorepoRoot, location, dirName);

    if (await fs.pathExists(targetDir)) {
      console.error(chalk.red(`Error: Service already exists: ${targetDir}`));
      process.exit(1);
    }

    console.log(chalk.blue(`Adding service: ${serviceName}`));
    console.log(chalk.gray(`Location: ${location}/${dirName}\n`));

    // Generate service structure
    spinner.start("Generating service structure");
    const generator = new ServiceGenerator();
    await generator.generate(monorepoRoot, {
      name: serviceName,
      location: options.location,
    });
    spinner.succeed("Service structure generated");

    console.log(
      chalk.green(`\n✓ Service ${serviceName} added successfully!\n`),
    );
    console.log(chalk.blue("Next steps:"));
    console.log(chalk.gray("  pnpm install"));
    console.log(chalk.gray(`  pnpm build --filter ${serviceName}`));
    console.log(chalk.gray(`  pnpm --filter ${serviceName} dev\n`));
  } catch (error) {
    spinner.fail("Failed to add service");
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
 * Validate service name follows npm naming conventions
 * @see https://docs.npmjs.com/cli/v7/configuring-npm/package-json#name
 */
function validateServiceName(name: string): void {
  // Basic npm naming rules
  const npmNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

  if (!npmNameRegex.test(name)) {
    throw new Error(
      `Invalid service name: "${name}". Service names must be lowercase and can only contain URL-safe characters.`,
    );
  }

  // Additional check: no uppercase letters
  if (name !== name.toLowerCase()) {
    throw new Error(
      `Invalid service name: "${name}". Service names must be lowercase.`,
    );
  }
}

/**
 * Extract directory name from service name
 * @param name - Service name (may include scope like @org/name)
 * @returns Directory name without scope
 */
function extractDirectoryName(name: string): string {
  if (name.startsWith("@")) {
    const parts = name.split("/");
    return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
  }
  return name;
}
