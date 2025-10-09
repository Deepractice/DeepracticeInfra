import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import { execa } from "execa";
import { ProjectGenerator } from "@deepracticex/nodespec-core";

interface InitOptions {
  name?: string;
  skipInstall?: boolean;
  skipGit?: boolean;
}

export async function initAction(options: InitOptions): Promise<void> {
  const spinner = ora();

  try {
    const targetDir = process.cwd();
    const projectName = options.name || path.basename(targetDir);

    // Check if project already exists
    const packageJsonPath = path.join(targetDir, "package.json");
    if (await fs.pathExists(packageJsonPath)) {
      console.error(
        chalk.red("Error: Project already exists in this directory"),
      );
      process.exit(1);
    }

    console.log(chalk.blue(`Initializing NodeSpec scaffold: ${projectName}`));
    console.log(chalk.gray(`Target directory: ${targetDir}\n`));

    // Generate project structure using ProjectGenerator
    spinner.start("Generating project structure");
    const generator = new ProjectGenerator();
    await generator.generate(targetDir, { name: projectName });
    spinner.succeed("Project structure generated");

    // Git initialization
    if (!options.skipGit) {
      spinner.start("Initializing git repository");
      await initGit(targetDir);
      spinner.succeed("Git repository initialized");
    }

    // Install dependencies
    if (!options.skipInstall) {
      spinner.start("Installing dependencies");
      await installDependencies(targetDir);
      spinner.succeed("Dependencies installed");
    }

    console.log(chalk.green("\n✓ Scaffold initialized successfully!\n"));
    console.log(chalk.blue("Next steps:"));
    if (options.skipInstall) {
      console.log(chalk.gray("  pnpm install"));
    }
    console.log(chalk.gray("  pnpm build"));
    console.log(chalk.gray("  pnpm test\n"));
  } catch (error) {
    spinner.fail("Initialization failed");
    console.error(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ),
    );
    process.exit(1);
  }
}

async function initGit(targetDir: string): Promise<void> {
  await execa("git", ["init"], { cwd: targetDir });
  await execa("git", ["add", "."], { cwd: targetDir });
  await execa(
    "git",
    ["commit", "-m", "Initial commit from NodeSpec", "--no-verify"],
    { cwd: targetDir },
  );
}

async function installDependencies(targetDir: string): Promise<void> {
  await execa("pnpm", ["install"], { cwd: targetDir });
}
