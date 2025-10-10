import path from "node:path";
import { BaseGenerator, type FileMapping } from "./BaseGenerator.js";
import {
  AppPackageJsonProcessor,
  type AppProcessContext,
} from "./processor/AppPackageJsonProcessor.js";
import { TsConfigProcessor, TypeScriptProcessor } from "./processor/index.js";

export interface AppOptions {
  name: string;
}

/**
 * Generator for creating apps using NodeSpec's CLI app as source
 */
export class AppGenerator extends BaseGenerator {
  constructor() {
    super();
    // Override processors for app-specific handling
    this.processors = [
      new AppPackageJsonProcessor(), // Use app-specific package.json processor
      new TsConfigProcessor(),
      new TypeScriptProcessor(),
    ];
  }

  async generate(monorepoRoot: string, options: AppOptions): Promise<void> {
    const dirName = this.extractDirectoryName(options.name);
    const targetDir = path.join(monorepoRoot, "apps", dirName);

    const context: AppProcessContext = {
      packageName: options.name,
      dirName,
      binName: dirName, // Use dirName as binary name
    };

    // Define file mappings from CLI template to target
    const files: FileMapping[] = [
      {
        source: "apps/cli/package.json",
        target: "package.json",
      },
      {
        source: "apps/cli/tsconfig.json",
        target: "tsconfig.json",
      },
      {
        source: "apps/cli/tsup.config.ts",
        target: "tsup.config.ts",
      },
      {
        source: "apps/cli/src/index.ts",
        target: "src/index.ts",
      },
      {
        source: "apps/cli/src/cli.ts",
        target: "src/cli.ts",
      },
    ];

    await this.processFiles(files, targetDir, context);
  }
}
