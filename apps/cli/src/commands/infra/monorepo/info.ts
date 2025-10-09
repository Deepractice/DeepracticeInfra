import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { WorkspaceUtils } from "@deepracticex/nodespec-core";

export async function infoAction(options: {
  verbose?: boolean;
}): Promise<void> {
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
    console.log(chalk.white(`Total packages: ${packages.length}`));
    console.log(chalk.white(`Packages:       ${purePackages.length}`));
    console.log(chalk.white(`Apps:           ${apps.length}`));
    console.log(chalk.white(`Services:       ${services.length}`));
    console.log(chalk.white(`packages:       ${purePackages.length}`));
    console.log();

    console.log(chalk.blue("Workspace Configuration:\n"));
    console.log(chalk.white("Patterns:"));
    for (const pattern of workspacePatterns) {
      console.log(chalk.gray(`  - ${pattern}`));
    }
    console.log();

    // Configuration tools summary
    console.log(chalk.blue("Configuration Tools:\n"));
    const configTools = await detectConfigTools(monorepoRoot);
    for (const tool of configTools) {
      console.log(chalk.white(`${tool.name}: ${tool.version || "detected"}`));
    }
    console.log();

    // Verbose output: show detailed configuration
    if (options.verbose) {
      console.log(chalk.blue("Detailed Configuration:\n"));

      // Show configuration details table
      console.log(chalk.white("Configuration Details:"));
      console.log(chalk.gray("| Tool       | Version | Config File       |"));
      console.log(chalk.gray("|------------|---------|-------------------|"));
      for (const tool of configTools) {
        const configFile = tool.configFile || "N/A";
        const version = tool.version || "N/A";
        console.log(
          chalk.gray(
            `| ${tool.name.padEnd(10)} | ${version.padEnd(7)} | ${configFile.padEnd(17)} |`,
          ),
        );
      }
      console.log();

      // Show all packages with their locations
      if (purePackages.length > 0) {
        console.log(chalk.white("Packages:"));
        for (const pkg of purePackages) {
          console.log(chalk.gray(`  - ${pkg.name} (${pkg.location})`));
        }
        console.log();
      }

      // Show all apps with their locations
      if (apps.length > 0) {
        console.log(chalk.white("Apps:"));
        for (const app of apps) {
          console.log(chalk.gray(`  - ${app.name} (${app.location})`));
        }
        console.log();
      }

      // Show all services with their locations
      if (services.length > 0) {
        console.log(chalk.white("Services:"));
        for (const service of services) {
          console.log(chalk.gray(`  - ${service.name} (${service.location})`));
        }
        console.log();
      }

      // Show package.json scripts if available
      if (packageJson.scripts && Object.keys(packageJson.scripts).length > 0) {
        console.log(chalk.white("Available Scripts:"));
        for (const [name, command] of Object.entries(packageJson.scripts)) {
          console.log(chalk.gray(`  - ${name}: ${command}`));
        }
        console.log();
      }

      // Show workspace dependencies if available
      if (
        packageJson.dependencies &&
        Object.keys(packageJson.dependencies).length > 0
      ) {
        console.log(chalk.white("Dependencies:"));
        for (const [name, version] of Object.entries(
          packageJson.dependencies,
        )) {
          console.log(chalk.gray(`  - ${name}: ${version}`));
        }
        console.log();
      }

      // Show workspace devDependencies if available
      if (
        packageJson.devDependencies &&
        Object.keys(packageJson.devDependencies).length > 0
      ) {
        console.log(chalk.white("Dev Dependencies:"));
        for (const [name, version] of Object.entries(
          packageJson.devDependencies,
        )) {
          console.log(chalk.gray(`  - ${name}: ${version}`));
        }
        console.log();
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
    if (packagesMatch && packagesMatch[1]) {
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

/**
 * Detect configuration tools in the monorepo
 */
async function detectConfigTools(
  monorepoRoot: string,
): Promise<Array<{ name: string; version?: string; configFile?: string }>> {
  const tools: Array<{ name: string; version?: string; configFile?: string }> =
    [];

  // Check for TypeScript
  const tsConfigPath = path.join(monorepoRoot, "tsconfig.json");
  if (await fs.pathExists(tsConfigPath)) {
    let tsVersion = "N/A";
    try {
      const packageJsonPath = path.join(monorepoRoot, "package.json");
      const packageJson = await fs.readJson(packageJsonPath);
      tsVersion =
        packageJson.devDependencies?.typescript ||
        packageJson.dependencies?.typescript ||
        "N/A";
    } catch {
      // Ignore version detection error
    }
    tools.push({
      name: "TypeScript",
      version: tsVersion,
      configFile: "tsconfig.json",
    });
  }

  // Check for package manager (pnpm)
  const pnpmWorkspacePath = path.join(monorepoRoot, "pnpm-workspace.yaml");
  if (await fs.pathExists(pnpmWorkspacePath)) {
    tools.push({
      name: "pnpm",
      version: undefined,
      configFile: "pnpm-workspace.yaml",
    });
  }

  // Check for tsup
  const tsupConfigPath = path.join(monorepoRoot, "tsup.config.ts");
  if (await fs.pathExists(tsupConfigPath)) {
    let tsupVersion = "N/A";
    try {
      const packageJsonPath = path.join(monorepoRoot, "package.json");
      const packageJson = await fs.readJson(packageJsonPath);
      tsupVersion =
        packageJson.devDependencies?.tsup ||
        packageJson.dependencies?.tsup ||
        "N/A";
    } catch {
      // Ignore version detection error
    }
    tools.push({
      name: "tsup",
      version: tsupVersion,
      configFile: "tsup.config.ts",
    });
  }

  // Check for ESLint
  const eslintConfigPath = path.join(monorepoRoot, ".eslintrc.json");
  if (await fs.pathExists(eslintConfigPath)) {
    let eslintVersion = "N/A";
    try {
      const packageJsonPath = path.join(monorepoRoot, "package.json");
      const packageJson = await fs.readJson(packageJsonPath);
      eslintVersion =
        packageJson.devDependencies?.eslint ||
        packageJson.dependencies?.eslint ||
        "N/A";
    } catch {
      // Ignore version detection error
    }
    tools.push({
      name: "ESLint",
      version: eslintVersion,
      configFile: ".eslintrc.json",
    });
  }

  // Check for Prettier
  const prettierConfigPath = path.join(monorepoRoot, ".prettierrc.json");
  if (await fs.pathExists(prettierConfigPath)) {
    let prettierVersion = "N/A";
    try {
      const packageJsonPath = path.join(monorepoRoot, "package.json");
      const packageJson = await fs.readJson(packageJsonPath);
      prettierVersion =
        packageJson.devDependencies?.prettier ||
        packageJson.dependencies?.prettier ||
        "N/A";
    } catch {
      // Ignore version detection error
    }
    tools.push({
      name: "Prettier",
      version: prettierVersion,
      configFile: ".prettierrc.json",
    });
  }

  return tools;
}
