import fs from "fs-extra";
import type { FileProcessor, ProcessContext } from "./types.js";
import { DependencyResolver } from "./DependencyResolver.js";

/**
 * Extended context for app generation
 */
export interface AppProcessContext extends ProcessContext {
  /**
   * Binary name for CLI command
   */
  binName: string;

  /**
   * NodeSpec root directory for resolving workspace dependencies
   */
  nodespecRoot: string;
}

/**
 * Processor for app package.json files
 * Handles bin field configuration for CLI apps and resolves workspace dependencies
 */
export class AppPackageJsonProcessor implements FileProcessor {
  canProcess(fileName: string): boolean {
    return fileName.endsWith("package.json");
  }

  async process(
    sourcePath: string,
    targetPath: string,
    context: ProcessContext,
  ): Promise<void> {
    const template = await fs.readJson(sourcePath);
    const appContext = context as AppProcessContext;

    // Resolve workspace dependencies
    const dependencies = await DependencyResolver.resolveWorkspaceDependencies(
      template.dependencies,
      appContext.nodespecRoot,
    );
    const devDependencies =
      await DependencyResolver.resolveWorkspaceDependencies(
        template.devDependencies,
        appContext.nodespecRoot,
      );

    // Merge strategy: preserve template, override necessary fields
    const result = {
      ...template,
      name: appContext.packageName,
      version: "0.0.1",
      description: `${appContext.packageName} application`,
      bin: {
        [appContext.binName]: "./dist/cli.js",
      },
      ...(Object.keys(dependencies).length > 0 && { dependencies }),
      ...(Object.keys(devDependencies).length > 0 && { devDependencies }),
    };

    await fs.writeJson(targetPath, result, { spaces: 2 });
  }
}
