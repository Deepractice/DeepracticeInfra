import fs from "fs-extra";
import type { FileProcessor, ProcessContext } from "./types.js";
import { DependencyResolver } from "./DependencyResolver.js";

export interface MonorepoProcessContext extends ProcessContext {
  nodespecRoot: string;
}

/**
 * Processor for monorepo root package.json files
 * Handles private monorepo configuration
 */
export class MonorepoPackageJsonProcessor implements FileProcessor {
  canProcess(fileName: string): boolean {
    return fileName.endsWith("package.json");
  }

  async process(
    sourcePath: string,
    targetPath: string,
    context: ProcessContext,
  ): Promise<void> {
    const template = await fs.readJson(sourcePath);
    const monorepoContext = context as MonorepoProcessContext;

    // Resolve workspace dependencies
    const devDependencies =
      await DependencyResolver.resolveWorkspaceDependencies(
        template.devDependencies,
        monorepoContext.nodespecRoot,
      );

    // Merge strategy: preserve template, only override name
    // Keep version, private, and all other fields from template
    const result = {
      ...template,
      name: context.packageName,
      ...(Object.keys(devDependencies).length > 0 && { devDependencies }),
    };

    await fs.writeJson(targetPath, result, { spaces: 2 });
  }
}
