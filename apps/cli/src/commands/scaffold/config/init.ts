import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";

interface InitOptions {
  preset?: string;
  force?: boolean;
  skipEslint?: boolean;
  skipPrettier?: boolean;
  skipEditorconfig?: boolean;
  skipGitignore?: boolean;
}

interface ConfigFile {
  name: string;
  content: string;
  skip?: boolean;
}

export async function initAction(options: InitOptions): Promise<void> {
  const spinner = ora();

  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    // Check if config files exist
    const existingFiles = await checkExistingFiles(monorepoRoot);
    if (existingFiles.length > 0 && !options.force) {
      console.error(
        chalk.red(
          "Error: Configuration files already exist. Use --force to reinitialize",
        ),
      );
      console.error(chalk.gray("\nExisting files:"));
      for (const file of existingFiles) {
        console.error(chalk.gray(`  - ${file}`));
      }
      console.error();
      process.exit(1);
    }

    const preset = options.preset || "default";
    console.log(
      chalk.blue(`Initializing configuration files (preset: ${preset})`),
    );
    console.log();

    // Generate config files
    const configFiles = generateConfigFiles(preset, options);

    spinner.start("Creating configuration files");

    for (const file of configFiles) {
      if (!file.skip) {
        const filePath = path.join(monorepoRoot, file.name);
        await fs.writeFile(filePath, file.content);
      }
    }

    spinner.succeed(
      existingFiles.length > 0
        ? "Configuration files reinitialized"
        : "Configuration files initialized successfully",
    );

    console.log(chalk.gray("\nCreated files:"));
    for (const file of configFiles) {
      if (!file.skip) {
        console.log(chalk.gray(`  ✓ ${file.name}`));
      }
    }
    console.log();
  } catch (error) {
    spinner.fail("Failed to initialize configuration files");
    console.error(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ),
    );
    process.exit(1);
  }
}

/**
 * Validate we are in a monorepo by checking for pnpm-workspace.yaml
 */
async function validateMonorepo(cwd: string): Promise<void> {
  const workspaceFile = path.join(cwd, "pnpm-workspace.yaml");
  if (!(await fs.pathExists(workspaceFile))) {
    throw new Error("Not in a monorepo - pnpm-workspace.yaml not found");
  }
}

/**
 * Check for existing configuration files
 */
async function checkExistingFiles(rootDir: string): Promise<string[]> {
  const configFiles = [
    ".eslintrc.json",
    ".prettierrc.json",
    ".editorconfig",
    ".gitignore",
  ];

  const existing: string[] = [];

  for (const file of configFiles) {
    const filePath = path.join(rootDir, file);
    if (await fs.pathExists(filePath)) {
      existing.push(file);
    }
  }

  return existing;
}

/**
 * Generate configuration files based on preset
 */
function generateConfigFiles(
  preset: string,
  options: InitOptions,
): ConfigFile[] {
  const isStrict = preset === "strict";

  const eslintConfig = {
    extends: "@deepracticex/eslint-config",
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      project: "./tsconfig.json",
    },
    rules: isStrict
      ? {
          "no-console": "error",
          "no-debugger": "error",
          "@typescript-eslint/no-explicit-any": "error",
          "@typescript-eslint/explicit-function-return-type": "error",
        }
      : {},
  };

  const prettierConfig = {
    semi: true,
    singleQuote: true,
    trailingComma: isStrict ? ("all" as const) : ("es5" as const),
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    arrowParens: "always" as const,
  };

  const editorconfig = `root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,ts,json,yml,yaml}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
`;

  const gitignore = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment variables
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
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
.cache/
`;

  return [
    {
      name: ".eslintrc.json",
      content: JSON.stringify(eslintConfig, null, 2) + "\n",
      skip: options.skipEslint,
    },
    {
      name: ".prettierrc.json",
      content: JSON.stringify(prettierConfig, null, 2) + "\n",
      skip: options.skipPrettier,
    },
    {
      name: ".editorconfig",
      content: editorconfig,
      skip: options.skipEditorconfig,
    },
    {
      name: ".gitignore",
      content: gitignore,
      skip: options.skipGitignore,
    },
  ];
}
