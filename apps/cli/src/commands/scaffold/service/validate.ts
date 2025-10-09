import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";

interface ValidateOptions {
  all?: boolean;
}

interface ValidationResult {
  serviceName: string;
  valid: boolean;
  errors: string[];
}

export async function validateAction(
  serviceName?: string,
  options?: ValidateOptions,
): Promise<void> {
  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    if (options?.all) {
      await validateAllServices(monorepoRoot);
    } else if (serviceName) {
      await validateSingleService(monorepoRoot, serviceName);
    } else {
      console.error(
        chalk.red("Error: Please specify a service name or use --all flag"),
      );
      process.exit(1);
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
 * Validate a single service
 */
async function validateSingleService(
  monorepoRoot: string,
  serviceName: string,
): Promise<void> {
  const serviceDir = await findServiceDir(monorepoRoot, serviceName);

  if (!serviceDir) {
    console.error(chalk.red(`Error: Service ${serviceName} not found`));
    process.exit(1);
  }

  const result = await validateService(serviceDir, serviceName);

  if (result.valid) {
    console.log(chalk.green(`✓ Service ${serviceName} is valid`));
  } else {
    console.error(chalk.red(`✗ Service ${serviceName} is invalid\n`));
    console.error(chalk.red("Errors:"));
    for (const error of result.errors) {
      console.error(chalk.red(`  - ${error}`));
    }
    process.exit(1);
  }
}

/**
 * Validate all services in workspace
 */
async function validateAllServices(monorepoRoot: string): Promise<void> {
  const services = await getAllServices(monorepoRoot);

  if (services.length === 0) {
    console.log(chalk.gray("No services found"));
    return;
  }

  const results: ValidationResult[] = [];

  for (const { name, dir } of services) {
    const result = await validateService(dir, name);
    results.push(result);
  }

  const validCount = results.filter((r) => r.valid).length;
  const errorCount = results.length - validCount;

  console.log(chalk.blue(`\nValidation Summary:`));
  console.log(chalk.blue(`| Status | Count |`));
  console.log(chalk.blue(`|--------|-------|`));
  console.log(chalk.green(`| valid  | ${validCount}     |`));
  console.log(chalk.red(`| errors | ${errorCount}     |`));

  if (errorCount > 0) {
    console.log(chalk.red("\nServices with errors:\n"));
    for (const result of results.filter((r) => !r.valid)) {
      console.log(chalk.red(`✗ ${result.serviceName}`));
      for (const error of result.errors) {
        console.log(chalk.red(`    - ${error}`));
      }
      console.log();
    }
    process.exit(1);
  } else {
    console.log(
      chalk.green(
        `\n✓ All services are valid (${validCount} service${validCount !== 1 ? "s" : ""} checked)`,
      ),
    );
  }
}

/**
 * Validate service structure and configuration
 */
async function validateService(
  serviceDir: string,
  serviceName: string,
): Promise<ValidationResult> {
  const errors: string[] = [];

  // Check required files
  const requiredFiles = [
    "package.json",
    "tsconfig.json",
    "src/index.ts",
    "src/server.ts",
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(serviceDir, file);
    if (!(await fs.pathExists(filePath))) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  // Validate package.json
  const packageJsonPath = path.join(serviceDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);

    // Check required scripts
    if (!packageJson.scripts?.start) {
      errors.push("Missing required script in package.json: start");
    }
    if (!packageJson.scripts?.dev) {
      errors.push("Missing required script in package.json: dev");
    }
  }

  // Validate server.ts exports
  const serverFilePath = path.join(serviceDir, "src", "server.ts");
  if (await fs.pathExists(serverFilePath)) {
    const serverContent = await fs.readFile(serverFilePath, "utf-8");
    if (
      !serverContent.includes("export") ||
      !serverContent.includes("server")
    ) {
      errors.push("Invalid server configuration: must export server instance");
    }
  }

  return {
    serviceName,
    valid: errors.length === 0,
    errors,
  };
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
 * Get all services in workspace
 */
async function getAllServices(
  monorepoRoot: string,
): Promise<Array<{ name: string; dir: string }>> {
  const servicesDir = path.join(monorepoRoot, "services");
  if (!(await fs.pathExists(servicesDir))) {
    return [];
  }

  const services: Array<{ name: string; dir: string }> = [];
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
          dir: serviceDir,
        });
      }
    }
  }

  return services;
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
