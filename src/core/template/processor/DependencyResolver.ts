import fs from "fs-extra";
import path from "node:path";

/**
 * Resolves workspace:* dependencies to actual version numbers
 * by reading from the workspace package's package.json
 *
 * Only replaces workspace:* references, keeps all other versions as-is (dogfooding)
 */
export class DependencyResolver {
  /**
   * Resolve workspace:* dependencies to actual versions
   * @param dependencies - Dependencies object that may contain workspace:* references
   * @param nodespecRoot - Root directory of NodeSpec project
   * @returns Dependencies with workspace:* resolved to actual versions
   */
  static async resolveWorkspaceDependencies(
    dependencies: Record<string, string> | undefined,
    nodespecRoot: string,
  ): Promise<Record<string, string>> {
    if (!dependencies) {
      return {};
    }

    const resolved: Record<string, string> = {};

    for (const [pkg, version] of Object.entries(dependencies)) {
      if (version === "workspace:*") {
        // Resolve workspace:* from actual package.json
        const resolvedVersion = await this.resolveWorkspacePackage(
          pkg,
          nodespecRoot,
        );
        resolved[pkg] = resolvedVersion;
      } else {
        // Keep original version (dogfooding - use NodeSpec's actual versions)
        resolved[pkg] = version;
      }
    }

    return resolved;
  }

  /**
   * Resolve a single workspace package version by reading its package.json
   */
  private static async resolveWorkspacePackage(
    packageName: string,
    nodespecRoot: string,
  ): Promise<string> {
    const dirName = this.extractPackageName(packageName);

    // Try common workspace locations
    const possiblePaths = [
      path.join(nodespecRoot, "configs", dirName, "package.json"),
      path.join(nodespecRoot, "packages", dirName, "package.json"),
      path.join(nodespecRoot, "apps", dirName, "package.json"),
      path.join(nodespecRoot, "src/domain", "package.json"),
      path.join(nodespecRoot, "src/core", "package.json"),
    ];

    for (const pkgPath of possiblePaths) {
      if (await fs.pathExists(pkgPath)) {
        try {
          const pkg = await fs.readJson(pkgPath);
          if (pkg.version) {
            return `^${pkg.version}`;
          }
        } catch {
          // Continue to next path
        }
      }
    }

    // Fallback to latest if not found
    return "latest";
  }

  /**
   * Extract directory name from scoped package name
   * @example '@deepracticex/tsup-config' -> 'tsup-config'
   */
  private static extractPackageName(packageName: string): string {
    if (packageName.startsWith("@")) {
      const parts = packageName.split("/");
      return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
    }
    return packageName;
  }
}
