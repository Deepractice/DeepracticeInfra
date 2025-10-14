import chalk from "chalk";
import ora from "ora";
import { FeatureManager } from "@deepracticex/nodespec-core";

interface InitOptions {
  all?: boolean;
}

export async function initAction(
  featurePath: string | undefined,
  options: InitOptions,
): Promise<void> {
  const spinner = ora();

  try {
    const monorepoRoot = process.cwd();
    const manager = new FeatureManager(monorepoRoot);

    // Validate monorepo
    spinner.start("Validating NodeSpec monorepo");
    const isValid = await manager.validateMonorepo();
    if (!isValid) {
      spinner.fail("Not a NodeSpec monorepo");
      console.error(
        chalk.red(
          "Error: Current directory is not a NodeSpec monorepo. Run this command from the monorepo root.",
        ),
      );
      process.exit(1);
    }
    spinner.succeed("NodeSpec monorepo validated");

    if (options.all) {
      // Initialize all features
      spinner.start("Finding features");
      const result = await manager.initAllFeatures();
      spinner.stop();

      if (result.initialized === 0 && result.alreadyInitialized === 0) {
        console.log(chalk.yellow("No features found in monorepo"));
        return;
      }

      console.log(
        chalk.green(
          `\n✓ Initialized ${result.initialized} features${result.alreadyInitialized > 0 ? `, ${result.alreadyInitialized} already initialized` : ""}`,
        ),
      );

      if (result.initialized > 0) {
        console.log(
          chalk.gray("\nFeature index updated at .nodespec/pm/index.json"),
        );
      }
    } else {
      // Initialize single feature
      if (!featurePath) {
        console.error(
          chalk.red(
            "Error: Feature path is required. Use --all to initialize all features.",
          ),
        );
        process.exit(1);
      }

      spinner.start(`Initializing feature: ${featurePath}`);
      const result = await manager.initFeature(featurePath);
      spinner.stop();

      if (result.initialized) {
        console.log(chalk.green(`\n✓ ${result.message}`));
        console.log(chalk.gray(`   @spec:id=${result.specId}`));
        console.log(
          chalk.gray("   Feature index updated at .nodespec/pm/index.json"),
        );
      } else {
        console.log(chalk.yellow(`\n⚠ ${result.message}`));
        console.log(chalk.gray(`   @spec:id=${result.specId}`));
      }
    }
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
