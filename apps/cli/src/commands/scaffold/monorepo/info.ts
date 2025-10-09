import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { WorkspaceUtils } from "@deepracticex/nodespec-core";

export async function infoAction(): Promise<void> {
  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    const utils = new WorkspaceUtils();

    // Read package.json for monorepo info
    const packageJsonPath = path.join(monorepoRoot, "package.json");
    const packageJson = await fs.readJson(packageJsonPath);

    // Get workspace patterns
    const workspacePatterns = await getWorkspacePatterns(monorepoRoot);

    // Get packages, apps, and services counts
    const packages = await utils.getPackages(monorepoRoot);
    const apps = await utils.getApps(monorepoRoot);
    const services = await getServices(monorepoRoot);

    // Filter out apps and services from packages to get pure packages count
    const appsNames = new Set(apps.map((a) => a.name));
    const servicesNames = new Set(services.map((s) => s.name));
    const purePackages = packages.filter(
      (p) => !appsNames.has(p.name) && !servicesNames.has(p.name),
    );

    // Display information
    console.log(chalk.blue("\nMonorepo Information:\n"));
    console.log(chalk.white(`Name:     ${packageJson.name}`));
    console.log(chalk.white(`Version:  ${packageJson.version}`));
    console.log();

    console.log(chalk.blue("Workspace Statistics:\n"));
    console.log(chalk.white(`Packages: ${purePackages.length}`));
    console.log(chalk.white(`Apps:     ${apps.length}`));
    console.log(chalk.white(`Services: ${services.length}`));
    console.log();

    console.log(chalk.blue("Workspace Configuration:\n"));
    console.log(chalk.white("Patterns:"));
    for (const pattern of workspacePatterns) {
      console.log(chalk.gray(`  - ${pattern}`));
    }
    console.log();
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

/**
 * Get workspace patterns from pnpm-workspace.yaml
 */
async function getWorkspacePatterns(monorepoRoot: string): Promise<string[]> {
  const workspaceFile = path.join(monorepoRoot, "pnpm-workspace.yaml");
  if (!(await fs.pathExists(workspaceFile))) {
    return ["packages/*"];
  }

  try {
    const content = await fs.readFile(workspaceFile, "utf-8");
    // Simple YAML parsing for packages array
    const packagesMatch = content.match(
      /packages:\s*\n((?:\s*-\s*"[^"]+"\s*\n)+)/,
    );
    if (packagesMatch) {
      const patterns = packagesMatch[1]
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.trim().replace(/^-\s*"([^"]+)"/, "$1"));
      return patterns;
    }
    return ["packages/*"];
  } catch {
    return ["packages/*"];
  }
}

/**
 * Get all services in workspace
 */
async function getServices(
  monorepoRoot: string,
): Promise<Array<{ name: string; location: string }>> {
  const servicesDir = path.join(monorepoRoot, "services");
  if (!(await fs.pathExists(servicesDir))) {
    return [];
  }

  const services: Array<{ name: string; location: string }> = [];
  const entries = await fs.readdir(servicesDir);

  for (const entry of entries) {
    const serviceDir = path.join(servicesDir, entry);
    const stat = await fs.stat(serviceDir);

    if (stat.isDirectory()) {
      const packageJsonPath = path.join(serviceDir, "package.json");
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        services.push({
          name: packageJson.name,
          location: path.relative(monorepoRoot, serviceDir),
        });
      }
    }
  }

  return services;
}
