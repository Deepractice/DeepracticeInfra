import path from "node:path";
import { BaseGenerator, type FileMapping } from "./BaseGenerator.js";
import type { ProcessContext } from "./processor/types.js";
import {
  MonorepoPackageJsonProcessor,
  TsConfigProcessor,
  TypeScriptProcessor,
  MarkdownProcessor,
} from "./processor/index.js";

export interface MonorepoOptions {
  name: string;
  skipInstall?: boolean;
  skipGit?: boolean;
}

/**
 * Generator for creating monorepo projects using NodeSpec itself as template
 * Ultimate dogfooding: NodeSpec generates projects that look like NodeSpec
 */
export class MonorepoGenerator extends BaseGenerator {
  constructor() {
    super();
    // Use monorepo-specific processors
    this.processors = [
      new MonorepoPackageJsonProcessor(),
      new TsConfigProcessor(),
      new TypeScriptProcessor(),
      new MarkdownProcessor(),
    ];
  }
  async generate(targetDir: string, options: MonorepoOptions): Promise<void> {
    const context: ProcessContext = {
      packageName: options.name,
      dirName: options.name,
      nodespecRoot: this.getNodeSpecRoot(),
    };

    // Create basic structure
    await this.createDirectories(targetDir);

    // Copy NodeSpec's own configuration files as templates
    const files: FileMapping[] = [
      { source: "package.json", target: "package.json" },
      { source: "tsconfig.json", target: "tsconfig.json" },
      { source: "turbo.json", target: "turbo.json" },
      { source: ".gitignore", target: ".gitignore" },
      { source: "pnpm-workspace.yaml", target: "pnpm-workspace.yaml" },
      { source: "lefthook.yml", target: "lefthook.yml" },
      { source: "commitlint.config.js", target: "commitlint.config.js" },
      { source: "eslint.config.js", target: "eslint.config.js" },
      { source: "prettier.config.js", target: "prettier.config.js" },
      { source: "README.md", target: "README.md" },
    ];

    await this.processFiles(files, targetDir, context);

    // Generate src structure (core and domain packages)
    await this.generateSrcStructure(targetDir, options.name);
  }

  private async createDirectories(targetDir: string): Promise<void> {
    const fs = await import("fs-extra");
    const dirs = ["packages", "apps", "services"];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(targetDir, dir));
      await fs.writeFile(path.join(targetDir, dir, ".gitkeep"), "");
    }
  }

  private async generateSrcStructure(
    targetDir: string,
    projectName: string,
  ): Promise<void> {
    const fs = await import("fs-extra");
    const srcDir = path.join(targetDir, "src");
    await fs.ensureDir(srcDir);

    // Copy src/README.md from NodeSpec
    const nodespecRoot = this.getNodeSpecRoot();
    const srcReadmePath = path.join(nodespecRoot, "src", "README.md");
    if (await fs.pathExists(srcReadmePath)) {
      await fs.copy(srcReadmePath, path.join(srcDir, "README.md"));
    }

    // Generate core and domain packages
    await this.generateCorePackage(srcDir, projectName);
    await this.generateDomainPackage(srcDir, projectName);
  }

  private async generateCorePackage(
    srcDir: string,
    projectName: string,
  ): Promise<void> {
    const fs = await import("fs-extra");
    const coreDir = path.join(srcDir, "core");
    await fs.ensureDir(coreDir);

    const corePackageJson = {
      name: `${projectName}-core`,
      version: "0.0.1",
      description: `${projectName} core - Technical implementations`,
      private: true,
      type: "module",
      main: "./index.ts",
      exports: {
        ".": "./index.ts",
      },
      keywords: [projectName, "core"],
      author: "Deepractice",
      license: "MIT",
    };

    await fs.writeJson(path.join(coreDir, "package.json"), corePackageJson, {
      spaces: 2,
    });

    const coreIndex = `/**
 * ${projectName} Core
 *
 * Technical implementations for ${projectName}.
 * Place your core modules and services here.
 */

export {};
`;

    await fs.writeFile(path.join(coreDir, "index.ts"), coreIndex);
  }

  private async generateDomainPackage(
    srcDir: string,
    projectName: string,
  ): Promise<void> {
    const fs = await import("fs-extra");
    const domainDir = path.join(srcDir, "domain");
    await fs.ensureDir(domainDir);

    const domainPackageJson = {
      name: `${projectName}-domain`,
      version: "0.0.1",
      description: `${projectName} domain - Business logic (reserved for future use)`,
      private: true,
      type: "module",
      main: "./index.ts",
      exports: {
        ".": "./index.ts",
      },
      keywords: [projectName, "domain"],
      author: "Deepractice",
      license: "MIT",
    };

    await fs.writeJson(
      path.join(domainDir, "package.json"),
      domainPackageJson,
      {
        spaces: 2,
      },
    );

    const domainIndex = `/**
 * ${projectName} Domain Layer
 *
 * Reserved for future business logic with DDD patterns.
 */

export {};
`;

    await fs.writeFile(path.join(domainDir, "index.ts"), domainIndex);
  }
}
