import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import { PackageGenerator } from "@deepracticex/nodespec-core";

interface AddOptions {
  location?: string;
}

export async function addAction(
  packageName: string,
  options: AddOptions,
): Promise<void> {
  const spinner = ora();

  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    // Validate package name format
    validatePackageName(packageName);

    // Check if package already exists
    const location = options.location || "packages";
    const dirName = extractDirectoryName(packageName);
    const targetDir = path.join(monorepoRoot, location, dirName);

    if (await fs.pathExists(targetDir)) {
      console.error(chalk.red(`Error: Package already exists: ${targetDir}`));
      process.exit(1);
    }

    console.log(chalk.blue(`Adding package: ${packageName}`));
    console.log(chalk.gray(`Location: ${location}/${dirName}\n`));

    // Generate package structure
    spinner.start("Generating package structure");
    const generator = new PackageGenerator();
    await generator.generate(monorepoRoot, {
      name: packageName,
      location: options.location,
    });
    spinner.succeed("Package structure generated");

    console.log(
      chalk.green(`\n✓ Package ${packageName} added successfully!\n`),
    );
    console.log(chalk.blue("Next steps:"));
    console.log(chalk.gray("  pnpm install"));
    console.log(chalk.gray(`  pnpm build --filter ${packageName}\n`));
  } catch (error) {
    spinner.fail("Failed to add package");
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
 * Validate package name follows npm naming conventions
 * @see https://docs.npmjs.com/cli/v7/configuring-npm/package-json#name
 */
function validatePackageName(name: string): void {
  // Basic npm naming rules
  const npmNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

  if (!npmNameRegex.test(name)) {
    throw new Error(
      `Invalid package name: "${name}". Package names must be lowercase and can only contain URL-safe characters.`,
    );
  }

  // Additional check: no uppercase letters
  if (name !== name.toLowerCase()) {
    throw new Error(
      `Invalid package name: "${name}". Package names must be lowercase.`,
    );
  }
}

/**
 * Extract directory name from package name
 * @param name - Package name (may include scope like @org/name)
 * @returns Directory name without scope
 */
function extractDirectoryName(name: string): string {
  if (name.startsWith("@")) {
    const parts = name.split("/");
    return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
  }
  return name;
}
