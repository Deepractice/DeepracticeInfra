import path from "node:path";
import fs from "fs-extra";
import { VERSIONS } from "./versions.js";

export interface AppOptions {
  name: string;
}

export class AppGenerator {
  async generate(monorepoRoot: string, options: AppOptions): Promise<void> {
    const dirName = this.extractDirectoryName(options.name);
    const targetDir = path.join(monorepoRoot, "apps", dirName);

    await this.createAppStructure(targetDir);
    await this.generatePackageJson(targetDir, options.name, dirName);
    await this.generateTsConfig(targetDir);
    await this.generateTsupConfig(targetDir);
    await this.generateSourceFiles(targetDir, dirName);
  }

  private async createAppStructure(targetDir: string): Promise<void> {
    await fs.ensureDir(path.join(targetDir, "src"));
  }

  private async generatePackageJson(
    targetDir: string,
    appName: string,
    binName: string,
  ): Promise<void> {
    const packageJson = {
      name: appName,
      version: "0.0.1",
      description: `${appName} application`,
      type: "module",
      bin: {
        [binName]: "./dist/cli.js",
      },
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          default: "./dist/index.js",
        },
      },
      scripts: {
        build: "tsup",
        dev: "tsup --watch",
        start: `node ./dist/cli.js`,
        typecheck: "tsc --noEmit",
        clean: "rimraf dist",
      },
      keywords: [appName],
      author: "Deepractice",
      license: "MIT",
      devDependencies: {
        "@deepracticex/tsup-config": VERSIONS.tsupConfig,
        "@deepracticex/typescript-config": VERSIONS.typescriptConfig,
        tsup: VERSIONS.tsup,
        typescript: VERSIONS.typescript,
        rimraf: VERSIONS.rimraf,
      },
    };

    await fs.writeJson(path.join(targetDir, "package.json"), packageJson, {
      spaces: 2,
    });
  }

  private async generateTsConfig(targetDir: string): Promise<void> {
    const tsconfig = {
      extends: "@deepracticex/typescript-config/base.json",
      compilerOptions: {
        outDir: "./dist",
        rootDir: "./src",
      },
      include: ["src/**/*"],
    };

    await fs.writeJson(path.join(targetDir, "tsconfig.json"), tsconfig, {
      spaces: 2,
    });
  }

  private async generateTsupConfig(targetDir: string): Promise<void> {
    const tsupConfig = `import { createConfig } from "@deepracticex/tsup-config";

export default createConfig({
  entry: ["src/index.ts", "src/cli.ts"],
});
`;

    await fs.writeFile(path.join(targetDir, "tsup.config.ts"), tsupConfig);
  }

  private async generateSourceFiles(
    targetDir: string,
    appName: string,
  ): Promise<void> {
    // Generate index.ts
    const indexTs = `/**
 * ${appName} - Main application entry point
 */

export function main() {
  console.log("Hello from ${appName}!");
}
`;

    await fs.writeFile(path.join(targetDir, "src", "index.ts"), indexTs);

    // Generate cli.ts
    const cliTs = `#!/usr/bin/env node

import { main } from "./index.js";

main();
`;

    await fs.writeFile(path.join(targetDir, "src", "cli.ts"), cliTs);
  }

  /**
   * Extract directory name from app name
   * @param name - App name (may include scope like @org/name)
   * @returns Directory name without scope
   * @example
   * extractDirectoryName('@myorg/my-app') // 'my-app'
   * extractDirectoryName('my-cli') // 'my-cli'
   */
  private extractDirectoryName(name: string): string {
    if (name.startsWith("@")) {
      const parts = name.split("/");
      return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
    }
    return name;
  }
}
