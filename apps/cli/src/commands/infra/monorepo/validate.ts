import chalk from "chalk";
import { WorkspaceValidator } from "@deepracticex/nodespec-core";

export async function validateAction(): Promise<void> {
  try {
    const monorepoRoot = process.cwd();

    const validator = new WorkspaceValidator();
    const result = await validator.validateMonorepo(monorepoRoot);

    if (result.valid) {
      console.log(chalk.green("\n✓ Monorepo structure is valid\n"));
      console.log(chalk.blue("Validation Summary:"));
      console.log(chalk.green("  ✓ Directory structure"));
      console.log(chalk.green("  ✓ Required files"));
      console.log(chalk.green("  ✓ Workspace config"));
      console.log(chalk.green("  ✓ TypeScript config"));
      console.log();
    } else {
      console.log(chalk.red("\n✗ Monorepo validation failed\n"));

      // Group errors by type
      const fileErrors = result.errors.filter((e) => e.type === "file");
      const dirErrors = result.errors.filter((e) => e.type === "directory");
      const configErrors = result.errors.filter(
        (e) => e.type === "configuration",
      );

      if (fileErrors.length > 0) {
        console.log(chalk.red("Missing files:"));
        for (const error of fileErrors) {
          console.log(chalk.gray(`  - ${error.message}`));
        }
        console.log();
      }

      if (dirErrors.length > 0) {
        console.log(chalk.red("Missing directories:"));
        for (const error of dirErrors) {
          console.log(chalk.gray(`  - ${error.message}`));
        }
        console.log();
      }

      if (configErrors.length > 0) {
        console.log(chalk.red("Configuration errors:"));
        for (const error of configErrors) {
          console.log(chalk.gray(`  - ${error.message}`));
        }
        console.log();
      }

      console.log(chalk.blue("Validation Summary:"));
      console.log(
        dirErrors.length === 0
          ? chalk.green("  ✓ Directory structure")
          : chalk.red(`  ✗ Directory structure (${dirErrors.length} errors)`),
      );
      console.log(
        fileErrors.length === 0
          ? chalk.green("  ✓ Required files")
          : chalk.red(`  ✗ Required files (${fileErrors.length} errors)`),
      );
      console.log(
        configErrors.length === 0
          ? chalk.green("  ✓ Configuration")
          : chalk.red(`  ✗ Configuration (${configErrors.length} errors)`),
      );
      console.log();

      process.exit(1);
    }
  } catch (error) {
    console.error(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ),
    );
    process.exit(1);
  }
}
