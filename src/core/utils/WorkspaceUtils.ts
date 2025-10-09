import path from "node:path";
import fs from "fs-extra";
import yaml from "yaml";

export interface PackageInfo {
  name: string;
  version: string;
  location: string;
  main?: string;
  types?: string;
  bin?: string | Record<string, string>;
}

export interface DependencyInfo {
  packageName: string;
  dependents: string[];
}

export class WorkspaceUtils {
  /**
   * Get all packages in workspace
   */
  async getPackages(monorepoRoot: string): Promise<PackageInfo[]> {
    const packages: PackageInfo[] = [];
    const workspacePatterns = await this.getWorkspacePatterns(monorepoRoot);

    for (const pattern of workspacePatterns) {
      const pkgs = await this.findPackagesInPattern(monorepoRoot, pattern);
      packages.push(...pkgs);
    }

    return packages;
  }

  /**
   * Get all apps in workspace
   */
  async getApps(monorepoRoot: string): Promise<PackageInfo[]> {
    const appsDir = path.join(monorepoRoot, "apps");
    if (!(await fs.pathExists(appsDir))) {
      return [];
    }

    const apps: PackageInfo[] = [];
    const entries = await fs.readdir(appsDir);

    for (const entry of entries) {
      const appDir = path.join(appsDir, entry);
      const stat = await fs.stat(appDir);

      if (stat.isDirectory()) {
        const packageJsonPath = path.join(appDir, "package.json");
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          apps.push({
            name: packageJson.name,
            version: packageJson.version,
            location: path.relative(monorepoRoot, appDir),
            bin: packageJson.bin,
          });
        }
      }
    }

    return apps;
  }

  /**
   * Find package directory by name
   */
  async findPackageDir(
    monorepoRoot: string,
    packageName: string,
  ): Promise<string | null> {
    const packages = await this.getPackages(monorepoRoot);
    const pkg = packages.find((p) => p.name === packageName);
    return pkg ? path.join(monorepoRoot, pkg.location) : null;
  }

  /**
   * Find app directory by name
   */
  async findAppDir(
    monorepoRoot: string,
    appName: string,
  ): Promise<string | null> {
    const apps = await this.getApps(monorepoRoot);
    const app = apps.find((a) => a.name === appName);
    return app ? path.join(monorepoRoot, app.location) : null;
  }

  /**
   * Check if package has dependents
   */
  async checkDependencies(
    monorepoRoot: string,
    packageName: string,
  ): Promise<DependencyInfo> {
    const packages = await this.getPackages(monorepoRoot);
    const apps = await this.getApps(monorepoRoot);
    const allPackages = [...packages, ...apps];

    const dependents: string[] = [];

    for (const pkg of allPackages) {
      const pkgDir = path.join(monorepoRoot, pkg.location);
      const packageJsonPath = path.join(pkgDir, "package.json");

      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.peerDependencies,
        };

        if (deps[packageName]) {
          dependents.push(pkg.name);
        }
      }
    }

    return {
      packageName,
      dependents,
    };
  }

  /**
   * Extract directory name from package name
   */
  extractDirectoryName(name: string): string {
    if (name.startsWith("@")) {
      const parts = name.split("/");
      return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
    }
    return name;
  }

  private async getWorkspacePatterns(monorepoRoot: string): Promise<string[]> {
    const workspaceFile = path.join(monorepoRoot, "pnpm-workspace.yaml");
    if (!(await fs.pathExists(workspaceFile))) {
      return ["packages/*"];
    }

    try {
      const content = await fs.readFile(workspaceFile, "utf-8");
      const config = yaml.parse(content);
      return config.packages || ["packages/*"];
    } catch {
      return ["packages/*"];
    }
  }

  private async findPackagesInPattern(
    monorepoRoot: string,
    pattern: string,
  ): Promise<PackageInfo[]> {
    const packages: PackageInfo[] = [];

    // Handle glob patterns like "packages/*"
    if (pattern.includes("*")) {
      const baseDir = pattern.split("*")[0]!.replace(/\/$/, "");
      const fullBaseDir = path.join(monorepoRoot, baseDir);

      if (!(await fs.pathExists(fullBaseDir))) {
        return [];
      }

      const entries = await fs.readdir(fullBaseDir);

      for (const entry of entries) {
        const entryDir = path.join(fullBaseDir, entry);
        const stat = await fs.stat(entryDir);

        if (stat.isDirectory()) {
          const packageJsonPath = path.join(entryDir, "package.json");
          if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            packages.push({
              name: packageJson.name,
              version: packageJson.version,
              location: path.relative(monorepoRoot, entryDir),
              main: packageJson.main,
              types: packageJson.types,
            });
          }
        }
      }
    }

    return packages;
  }
}
