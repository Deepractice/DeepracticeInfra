import path from "node:path";
import { BaseGenerator, type FileMapping } from "./BaseGenerator.js";
import type { ProcessContext } from "./processor/types.js";

export interface PackageOptions {
  name: string;
  location?: string;
}

/**
 * Generator for creating packages using NodeSpec's template package as source
 */
export class PackageGenerator extends BaseGenerator {
  async generate(monorepoRoot: string, options: PackageOptions): Promise<void> {
    const location = options.location || "packages";
    const dirName = this.extractDirectoryName(options.name);
    const targetDir = path.join(monorepoRoot, location, dirName);

    const context: ProcessContext = {
      packageName: options.name,
      dirName,
    };

    // Define file mappings from template to target
    const files: FileMapping[] = [
      {
        source: "packages/template/package.json",
        target: "package.json",
      },
      {
        source: "packages/template/tsconfig.json",
        target: "tsconfig.json",
      },
      {
        source: "packages/template/tsup.config.ts",
        target: "tsup.config.ts",
      },
      {
        source: "packages/template/src/index.ts",
        target: "src/index.ts",
      },
    ];

    await this.processFiles(files, targetDir, context);
  }
}
