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
    await this.generateSrcStructure(targetDir, options.name);
  }

  private async createDirectories(targetDir: string): Promise<void> {
    const dirs = ["packages", "apps", "services"];
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
      packageManager: "pnpm@10.15.1",
      scripts: {
        build: "turbo build",
        dev: "turbo dev",
        test: "turbo test",
        "test:ci": "turbo test:ci",
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

    // turbo.json
    const turboConfig = {
      $schema: "https://turbo.build/schema.json",
      tasks: {
        build: {
          dependsOn: ["^build"],
          outputs: ["dist/**"],
        },
        dev: {
          cache: false,
          persistent: true,
        },
        test: {
          dependsOn: ["build"],
        },
        "test:ci": {
          dependsOn: ["build"],
        },
        typecheck: {
          dependsOn: ["^build"],
        },
        lint: {
          dependsOn: ["^build"],
        },
        clean: {
          cache: false,
        },
      },
    };
    await fs.writeJson(path.join(targetDir, "turbo.json"), turboConfig, {
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

  private async generateSrcStructure(
    targetDir: string,
    projectName: string,
  ): Promise<void> {
    const srcDir = path.join(targetDir, "src");
    await fs.ensureDir(srcDir);

    // Generate src/README.md
    await this.generateSrcReadme(srcDir, projectName);

    // Generate src/core/
    await this.generateCorePackage(srcDir, projectName);

    // Generate src/domain/
    await this.generateDomainPackage(srcDir, projectName);
  }

  private async generateSrcReadme(
    srcDir: string,
    projectName: string,
  ): Promise<void> {
    const readme = `# src

**Product Core** - The business logic of ${projectName}.

## What is This?

This directory contains the **core business logic** of ${projectName} - the product-specific code that makes ${projectName} work. This code is:

- **Specialized**: Built specifically for ${projectName}'s needs
- **Not for sharing**: Unlike \`packages/\`, this code is not intended for external use
- **Technical in nature**: Focused on technical implementation rather than business complexity

## Why \`src/\` not \`domains/\`?

${projectName} is a **technical product** (CLI tool, template engine, task orchestrator), not a business-heavy system. We use a **technical layering approach** (\`core/\`) rather than Domain-Driven Design (\`domain/\`).

## Structure

\`\`\`
src/
├── core/         # Technical implementations
└── domain/       # Business logic (reserved for future use)
\`\`\`

Each module focuses on a specific technical capability needed by ${projectName}.

## Relationship with Other Layers

\`\`\`
apps/cli → src/ → packages/
                → configs/
\`\`\`

- **apps/** depend on \`src/\` for business logic
- **src/** depends on \`packages/\` for technical infrastructure
- **packages/** are independently usable (ecosystem layer)

## Design Philosophy

### Core (src/) - Technical Products

- Algorithm-intensive
- Clear technical logic
- Performance-sensitive
- Modules, services, utility functions

\`\`\`typescript
// Core style - technical implementation
class TemplateEngine {
  parse(template: string): AST {}
  compile(ast: AST): Function {}
  render(compiled: Function, data: object): string {}
}
\`\`\`

### vs Domain (alternative) - Business Products

- Business rule-intensive
- Frequent changes
- Entities, aggregates, domain services
- Would be appropriate for systems like e-commerce, CRM

\`\`\`typescript
// Domain style - business concepts
class Order extends AggregateRoot {
  addItem(product: Product) {
    if (this.items.length >= 100) {
      throw new BusinessRuleError("Max 100 items");
    }
  }
}
\`\`\`

## Development Guidelines

1. **Keep it technical**: Focus on "how" rather than "what"
2. **Performance matters**: CLI startup speed is critical
3. **Pure logic**: No UI concerns (that's for \`apps/\`)
4. **Testable**: Write unit tests for all core logic
5. **Independent**: Should work without any specific UI

## Getting Started

Each module will have its own package.json as part of the monorepo workspace:

\`\`\`
src/
└── core/
    ├── src/
    │   └── index.ts
    ├── package.json
    └── README.md
\`\`\`

---

**Remember**: This is the technical heart of ${projectName} - where templates are generated, tasks are executed, and guides are served.
`;

    await fs.writeFile(path.join(srcDir, "README.md"), readme);
  }

  private async generateCorePackage(
    srcDir: string,
    projectName: string,
  ): Promise<void> {
    const coreDir = path.join(srcDir, "core");
    await fs.ensureDir(coreDir);

    // Generate core/package.json
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

    // Generate core/index.ts
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
    const domainDir = path.join(srcDir, "domain");
    await fs.ensureDir(domainDir);

    // Generate domain/package.json
    const domainPackageJson = {
      name: `${projectName}-domain`,
      version: "0.0.1",
      description: `${projectName} domain - Business logic with DDD patterns (reserved for future use)`,
      private: true,
      type: "module",
      main: "./index.ts",
      exports: {
        ".": "./index.ts",
      },
      keywords: [projectName, "domain", "ddd"],
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

    // Generate domain/index.ts
    const domainIndex = `/**
 * ${projectName} Domain Layer
 *
 * Reserved for future business logic with DDD patterns.
 * Currently empty as ${projectName} is primarily a technical product.
 *
 * Use this layer when:
 * - Business rules become complex
 * - Need entities, value objects, aggregates
 * - Domain concepts require rich behavior
 */

export {};
`;

    await fs.writeFile(path.join(domainDir, "index.ts"), domainIndex);
  }
}
