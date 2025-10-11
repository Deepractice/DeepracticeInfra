import fs from "fs-extra";
import type { FileProcessor, ProcessContext } from "./types.js";
import { DependencyResolver } from "./DependencyResolver.js";

/**
 * Extended context with NodeSpec root
 */
export interface PackageProcessContext extends ProcessContext {
  nodespecRoot: string;
}

/**
 * Processor for package.json files
 * Merges template with context-specific values and resolves workspace dependencies
 */
export class PackageJsonProcessor implements FileProcessor {
  canProcess(fileName: string): boolean {
    return fileName.endsWith("package.json");
  }

  async process(
    sourcePath: string,
    targetPath: string,
    context: ProcessContext,
  ): Promise<void> {
    const template = await fs.readJson(sourcePath);
    const pkgContext = context as PackageProcessContext;

    // Resolve workspace dependencies
    const dependencies = await DependencyResolver.resolveWorkspaceDependencies(
      template.dependencies,
      pkgContext.nodespecRoot,
    );
    const devDependencies =
      await DependencyResolver.resolveWorkspaceDependencies(
        template.devDependencies,
        pkgContext.nodespecRoot,
      );

    // Merge strategy: preserve template, only override necessary fields
    const result = {
      ...template,
      name: context.packageName,
      version: "0.0.1",
      description: `${context.packageName} package`,
      ...(Object.keys(dependencies).length > 0 && { dependencies }),
      ...(Object.keys(devDependencies).length > 0 && { devDependencies }),
    };

    await fs.writeJson(targetPath, result, { spaces: 2 });
  }
}
