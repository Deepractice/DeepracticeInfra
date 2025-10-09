import path from "node:path";
import fs from "fs-extra";
import { VERSIONS } from "./versions.js";

export interface PackageOptions {
  name: string;
  location?: string;
}

export class PackageGenerator {
  async generate(monorepoRoot: string, options: PackageOptions): Promise<void> {
    const location = options.location || "packages";
    const dirName = this.extractDirectoryName(options.name);
    const targetDir = path.join(monorepoRoot, location, dirName);

    await this.createPackageStructure(targetDir);
    await this.generatePackageJson(targetDir, options.name);
    await this.generateTsConfig(targetDir);
    await this.generateTsupConfig(targetDir);
    await this.generateSourceFiles(targetDir);
  }

  private async createPackageStructure(targetDir: string): Promise<void> {
    await fs.ensureDir(path.join(targetDir, "src"));
  }

  private async generatePackageJson(
    targetDir: string,
    packageName: string,
  ): Promise<void> {
    const packageJson = {
      name: packageName,
      version: "0.0.1",
      description: `${packageName} package`,
      type: "module",
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
        typecheck: "tsc --noEmit",
        clean: "rimraf dist",
      },
      keywords: [packageName],
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
  entry: ["src/index.ts"],
});
`;

    await fs.writeFile(path.join(targetDir, "tsup.config.ts"), tsupConfig);
  }

  private async generateSourceFiles(targetDir: string): Promise<void> {
    const indexTs = `/**
 * Main package entry point
 */

export {};
`;

    await fs.writeFile(path.join(targetDir, "src", "index.ts"), indexTs);
  }

  /**
   * Extract directory name from package name
   * @param name - Package name (may include scope like @org/name)
   * @returns Directory name without scope
   * @example
   * extractDirectoryName('@myorg/utils') // 'utils'
   * extractDirectoryName('my-lib') // 'my-lib'
   */
  private extractDirectoryName(name: string): string {
    if (name.startsWith("@")) {
      const parts = name.split("/");
      return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
    }
    return name;
  }
}
