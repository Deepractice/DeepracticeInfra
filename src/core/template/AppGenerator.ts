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
 * Generator for creating apps using NodeSpec's app-example as source
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
      nodespecRoot: this.getNodeSpecRoot(),
    };

    // Define file mappings from app-example to target
    const files: FileMapping[] = [
      {
        source: "apps/app-example/package.json",
        target: "package.json",
      },
      {
        source: "apps/app-example/tsconfig.json",
        target: "tsconfig.json",
      },
      {
        source: "apps/app-example/tsup.config.ts",
        target: "tsup.config.ts",
      },
      {
        source: "apps/app-example/src/index.ts",
        target: "src/index.ts",
      },
      {
        source: "apps/app-example/src/cli.ts",
        target: "src/cli.ts",
      },
    ];

    await this.processFiles(files, targetDir, context);
  }
}
