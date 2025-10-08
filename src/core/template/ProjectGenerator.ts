import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { VERSIONS } from "./versions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ProjectOptions {
  name: string;
  skipInstall?: boolean;
  skipGit?: boolean;
}

export class ProjectGenerator {
  private templateDir: string;

  constructor() {
    this.templateDir = path.join(__dirname, "templates/project");
  }

  async generate(targetDir: string, options: ProjectOptions): Promise<void> {
    await this.createDirectories(targetDir);
    await this.generatePackageJson(targetDir, options.name);
    await this.copyStaticTemplates(targetDir);
    await this.generateConfigFiles(targetDir, options.name);
  }

  private async createDirectories(targetDir: string): Promise<void> {
    const dirs = ["packages", "src", "apps", "services"];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(targetDir, dir));
      await fs.writeFile(path.join(targetDir, dir, ".gitkeep"), "");
    }
  }

  private async generatePackageJson(
    targetDir: string,
    projectName: string,
  ): Promise<void> {
    const packageJson = {
      name: projectName,
      version: "0.0.1",
      private: true,
      type: "module",
      scripts: {
        build: "turbo build",
        dev: "turbo dev",
        test: "turbo test",
        typecheck: "turbo typecheck",
        clean: "turbo clean",
        format: "prettier --write .",
        lint: "turbo lint",
      },
      devDependencies: {
        "@deepracticex/eslint-config": VERSIONS.eslintConfig,
        "@deepracticex/prettier-config": VERSIONS.prettierConfig,
        "@deepracticex/typescript-config": VERSIONS.typescriptConfig,
        "@deepracticex/tsup-config": VERSIONS.tsupConfig,
        "@deepracticex/vitest-config": VERSIONS.vitestConfig,
        "@deepracticex/cucumber-config": VERSIONS.cucumberConfig,
        "@deepracticex/commitlint-config": VERSIONS.commitlintConfig,
        turbo: VERSIONS.turbo,
        typescript: VERSIONS.typescript,
        prettier: VERSIONS.prettier,
        eslint: VERSIONS.eslint,
        tsup: VERSIONS.tsup,
        vitest: VERSIONS.vitest,
        "@cucumber/cucumber": VERSIONS.cucumber,
        tsx: VERSIONS.tsx,
        rimraf: VERSIONS.rimraf,
        lefthook: VERSIONS.lefthook,
        "@commitlint/cli": VERSIONS.commitlint.cli,
        "@commitlint/config-conventional": VERSIONS.commitlint.config,
      },
    };

    await fs.writeJson(path.join(targetDir, "package.json"), packageJson, {
      spaces: 2,
    });
  }

  private async copyStaticTemplates(targetDir: string): Promise<void> {
    // Copy .gitignore
    const gitignoreSrc = path.join(this.templateDir, "_gitignore");
    const gitignoreDest = path.join(targetDir, ".gitignore");
    if (await fs.pathExists(gitignoreSrc)) {
      await fs.copy(gitignoreSrc, gitignoreDest);
    }

    // Copy pnpm-workspace.yaml
    const workspaceSrc = path.join(this.templateDir, "pnpm-workspace.yaml");
    const workspaceDest = path.join(targetDir, "pnpm-workspace.yaml");
    if (await fs.pathExists(workspaceSrc)) {
      await fs.copy(workspaceSrc, workspaceDest);
    }
  }

  private async generateConfigFiles(
    targetDir: string,
    projectName: string,
  ): Promise<void> {
    // tsconfig.json
    const tsconfig = {
      extends: "@deepracticex/typescript-config/base.json",
      compilerOptions: {
        baseUrl: ".",
        paths: {},
      },
    };
    await fs.writeJson(path.join(targetDir, "tsconfig.json"), tsconfig, {
      spaces: 2,
    });

    // lefthook.yml
    const lefthook = `pre-commit:
  parallel: true
  commands:
    format:
      glob: "*.{js,ts,json,md,yml,yaml}"
      run: prettier --write {staged_files}
      stage_fixed: true
    typecheck:
      run: pnpm typecheck

commit-msg:
  commands:
    commitlint:
      run: npx commitlint --edit {1}

pre-push:
  parallel: true
  commands:
    test:
      run: pnpm test:ci
    build:
      run: pnpm build
`;
    await fs.writeFile(path.join(targetDir, "lefthook.yml"), lefthook);

    // commitlint.config.js
    const commitlintConfig = `export default {
  extends: ['@deepracticex/commitlint-config'],
};
`;
    await fs.writeFile(
      path.join(targetDir, "commitlint.config.js"),
      commitlintConfig,
    );

    // eslint.config.js
    const eslintConfig = `import { deepracticeConfig } from '@deepracticex/eslint-config';

export default deepracticeConfig;
`;
    await fs.writeFile(path.join(targetDir, "eslint.config.js"), eslintConfig);

    // prettier.config.js
    const prettierConfig = `export { default } from '@deepracticex/prettier-config';
`;
    await fs.writeFile(
      path.join(targetDir, "prettier.config.js"),
      prettierConfig,
    );

    // README.md
    const readme = `# ${projectName}

A NodeSpec project following Deepractice standards for AI-native Node.js development.

## Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── src/          # Product core - Business logic
├── packages/     # Infrastructure - Technical capabilities
├── apps/         # Presentation - User interfaces
└── services/     # Services - Microservices
\`\`\`

## Development

This project uses:
- **pnpm** for package management
- **Turbo** for monorepo task orchestration
- **TypeScript** for type safety
- **Cucumber** for BDD testing
- **Lefthook** for git hooks

---

Built with [NodeSpec](https://github.com/Deepractice/DeepracticeNodeSpec) - Deepractice's Node.js development standard
`;
    await fs.writeFile(path.join(targetDir, "README.md"), readme);
  }
}
