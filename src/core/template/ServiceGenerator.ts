import path from "node:path";
import { BaseGenerator, type FileMapping } from "./BaseGenerator.js";
import type { ProcessContext } from "./processor/types.js";
import {
  ServicePackageJsonProcessor,
  TsConfigProcessor,
  TypeScriptProcessor,
} from "./processor/index.js";

export interface ServiceOptions {
  name: string;
  location?: string;
}

/**
 * Generator for creating services using NodeSpec's service-example as source
 */
export class ServiceGenerator extends BaseGenerator {
  constructor() {
    super();
    // Use service-specific processors
    this.processors = [
      new ServicePackageJsonProcessor(),
      new TsConfigProcessor(),
      new TypeScriptProcessor(),
    ];
  }

  async generate(monorepoRoot: string, options: ServiceOptions): Promise<void> {
    const location = options.location || "services";
    const dirName = this.extractDirectoryName(options.name);
    const targetDir = path.join(monorepoRoot, location, dirName);

    const context: ProcessContext = {
      packageName: options.name,
      dirName,
      nodespecRoot: this.getNodeSpecRoot(),
    };

    // Define file mappings from service-example to target
    const files: FileMapping[] = [
      {
        source: "services/service-example/package.json",
        target: "package.json",
      },
      {
        source: "services/service-example/tsconfig.json",
        target: "tsconfig.json",
      },
      {
        source: "services/service-example/tsup.config.ts",
        target: "tsup.config.ts",
      },
      {
        source: "services/service-example/.env.example",
        target: ".env.example",
      },
      {
        source: "services/service-example/src/index.ts",
        target: "src/index.ts",
      },
      {
        source: "services/service-example/src/server.ts",
        target: "src/server.ts",
      },
      {
        source: "services/service-example/src/routes/index.ts",
        target: "src/routes/index.ts",
      },
    ];

    await this.processFiles(files, targetDir, context);
  }

  /**
   * Extract directory name from service name
   * @param name - Service name (may include scope like @org/name)
   * @returns Directory name without scope
   * @example
   * extractDirectoryName('@myorg/api-gateway') // 'api-gateway'
   * extractDirectoryName('auth-service') // 'auth-service'
   */
  protected override extractDirectoryName(name: string): string {
    if (name.startsWith("@")) {
      const parts = name.split("/");
      return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
    }
    return name;
  }
}
