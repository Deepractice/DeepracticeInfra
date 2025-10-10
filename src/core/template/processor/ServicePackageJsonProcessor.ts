import fs from "fs-extra";
import type { FileProcessor, ProcessContext } from "./types.js";
import { DependencyResolver } from "./DependencyResolver.js";

/**
 * Processor for service package.json files
 * Handles service-specific configuration and dependency resolution
 */
export class ServicePackageJsonProcessor implements FileProcessor {
  canProcess(fileName: string): boolean {
    return fileName === "package.json";
  }

  async process(
    sourcePath: string,
    targetPath: string,
    context: ProcessContext,
  ): Promise<void> {
    const template = await fs.readJson(sourcePath);

    // Resolve workspace dependencies
    const dependencies = await DependencyResolver.resolveWorkspaceDependencies(
      template.dependencies || {},
      context.nodespecRoot as string,
    );

    // Build result with service-specific settings
    const result = {
      ...template,
      name: context.packageName,
      version: "0.0.1",
      description: `${context.packageName} service`,
      keywords: [context.dirName, "service"],
      // Keep dependencies if they exist
      ...(Object.keys(dependencies).length > 0 && { dependencies }),
      // Keep devDependencies from template (for services, we might need @types/express etc)
      ...(template.devDependencies && {
        devDependencies: template.devDependencies,
      }),
    };

    await fs.ensureDir(targetPath.substring(0, targetPath.lastIndexOf("/")));
    await fs.writeJson(targetPath, result, { spaces: 2 });
  }
}
