import path from "node:path";
import { BaseGenerator, type FileMapping } from "./BaseGenerator.js";
import type { ProcessContext } from "./processor/types.js";

export interface PackageOptions {
  name: string;
  location?: string;
}

/**
 * Generator for creating packages using NodeSpec's example package as source
 */
export class PackageGenerator extends BaseGenerator {
  async generate(monorepoRoot: string, options: PackageOptions): Promise<void> {
    const location = options.location || "packages";
    const dirName = this.extractDirectoryName(options.name);
    const targetDir = path.join(monorepoRoot, location, dirName);

    const context: ProcessContext = {
      packageName: options.name,
      dirName,
      nodespecRoot: this.getNodeSpecRoot(),
    };

    // Define file mappings from example to target
    const files: FileMapping[] = [
      {
        source: "packages/example/package.json",
        target: "package.json",
      },
      {
        source: "packages/example/tsconfig.json",
        target: "tsconfig.json",
      },
      {
        source: "packages/example/tsup.config.ts",
        target: "tsup.config.ts",
      },
      {
        source: "packages/example/src/index.ts",
        target: "src/index.ts",
      },
    ];

    await this.processFiles(files, targetDir, context);
  }
}
