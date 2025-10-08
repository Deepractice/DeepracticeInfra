import path from "node:path";
import fs from "fs-extra";
import { VERSIONS } from "./versions.js";

export interface ProjectOptions {
  name: string;
  skipInstall?: boolean;
  skipGit?: boolean;
}

export class ProjectGenerator {
  constructor() {
    // Templates are now inlined in generateConfigFiles and copyStaticTemplates
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
        "@deepracticex/cucumber-config": VERSIONS.cucumberConfig,
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
    // Generate .gitignore
    const gitignore = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Misc
.turbo/
.cache/
`;
    await fs.writeFile(path.join(targetDir, ".gitignore"), gitignore);

    // Generate pnpm-workspace.yaml
    const workspace = `packages:
  # Product core - Project business logic
  - "src/*"
  # Infrastructure layer - Technical capabilities
  - "packages/*"
  # Presentation layer - User interfaces
  - "apps/*"
  # Services layer - Microservices
  - "services/*"
  # Development tools
  - "tools/*"
  # Exclusions
  - "!**/test/**"
  - "!**/tests/**"
  - "!**/dist/**"
  - "!**/node_modules/**"
`;
    await fs.writeFile(path.join(targetDir, "pnpm-workspace.yaml"), workspace);
  }

  private async generateConfigFiles(
    targetDir: string,
    projectName: string,
  ): Promise<void> {
    // tsconfig.json (basic config without deepractice package)
    const tsconfig = {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "bundler",
        lib: ["ES2022"],
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        resolveJsonModule: true,
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
  extends: ['@commitlint/config-conventional'],
};
`;
    await fs.writeFile(
      path.join(targetDir, "commitlint.config.js"),
      commitlintConfig,
    );

    // eslint.config.js (basic config without deepractice package)
    const eslintConfig = `export default [];
`;
    await fs.writeFile(path.join(targetDir, "eslint.config.js"), eslintConfig);

    // prettier.config.js (basic config without deepractice package)
    const prettierConfig = `export default {};
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
- **Cucumber** for BDD testing (use \`cucumber-tsx\` for TypeScript support)
- **Lefthook** for git hooks

### Testing with Cucumber

This project includes \`@deepracticex/cucumber-config\` which provides the \`cucumber-tsx\` command.
This wrapper automatically handles TypeScript support and prevents NODE_OPTIONS inheritance issues.

In your package.json:
\`\`\`json
{
  "scripts": {
    "test": "cucumber-tsx",
    "test:dev": "cucumber-tsx --profile dev",
    "test:ci": "cucumber-tsx --profile ci"
  }
}
\`\`\`

Create \`cucumber.cjs\` in your package:
\`\`\`javascript
const { createConfig } = require("@deepracticex/cucumber-config");

module.exports = createConfig({
  paths: ["features/**/*.feature"],
  import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
});
\`\`\`

---

Built with [NodeSpec](https://github.com/Deepractice/DeepracticeNodeSpec) - Deepractice's Node.js development standard
`;
    await fs.writeFile(path.join(targetDir, "README.md"), readme);
  }
}
