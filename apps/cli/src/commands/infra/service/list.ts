import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";

interface ListOptions {
  verbose?: boolean;
  json?: boolean;
}

interface ServiceInfo {
  name: string;
  version: string;
  location: string;
  scripts?: {
    start?: string;
    dev?: string;
    build?: string;
  };
}

export async function listAction(options: ListOptions): Promise<void> {
  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    const services = await getServices(monorepoRoot);

    if (services.length === 0) {
      console.log(chalk.gray("No services found"));
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(services, null, 2));
      return;
    }

    if (options.verbose) {
      console.log(chalk.blue(`\nServices (${services.length}):\n`));
      for (const service of services) {
        console.log(chalk.bold(service.name));
        console.log(chalk.gray(`  Version:  ${service.version}`));
        console.log(chalk.gray(`  Location: ${service.location}`));
        if (service.scripts?.start) {
          console.log(chalk.gray(`  Start:    ${service.scripts.start}`));
        }
        if (service.scripts?.dev) {
          console.log(chalk.gray(`  Dev:      ${service.scripts.dev}`));
        }
        if (service.scripts?.build) {
          console.log(chalk.gray(`  Build:    ${service.scripts.build}`));
        }
        console.log();
      }
    } else {
      console.log(chalk.blue(`\nServices (${services.length}):\n`));
      const maxNameLength = Math.max(...services.map((s) => s.name.length));
      const maxVersionLength = Math.max(
        ...services.map((s) => s.version.length),
      );

      console.log(
        chalk.bold(
          `${"Service".padEnd(maxNameLength)}  ${"Version".padEnd(maxVersionLength)}  Location`,
        ),
      );
      console.log(
        chalk.gray(
          `${"-".repeat(maxNameLength)}  ${"-".repeat(maxVersionLength)}  ${"-".repeat(20)}`,
        ),
      );

      for (const service of services) {
        console.log(
          `${service.name.padEnd(maxNameLength)}  ${service.version.padEnd(maxVersionLength)}  ${chalk.gray(service.location)}`,
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
 * Get all services from the services directory
 */
async function getServices(monorepoRoot: string): Promise<ServiceInfo[]> {
  const servicesDir = path.join(monorepoRoot, "services");
  if (!(await fs.pathExists(servicesDir))) {
    return [];
  }

  const services: ServiceInfo[] = [];
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
          version: packageJson.version,
          location: path.relative(monorepoRoot, serviceDir),
          scripts: {
            start: packageJson.scripts?.start,
            dev: packageJson.scripts?.dev,
            build: packageJson.scripts?.build,
          },
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
