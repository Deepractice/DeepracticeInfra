import { Command } from "commander";
import { initAction } from "./init.js";
import { listAction } from "./list.js";
import { validateAction } from "./validate.js";

export const configCommand = new Command("config").description(
  "Manage configuration files in NodeSpec monorepo",
);

configCommand
  .command("init")
  .description("Initialize standard configuration files")
  .option(
    "--preset <preset>",
    "Configuration preset (default, strict)",
    "default",
  )
  .option("--force", "Overwrite existing configuration files")
  .option("--skip-eslint", "Skip ESLint configuration")
  .option("--skip-prettier", "Skip Prettier configuration")
  .option("--skip-editorconfig", "Skip EditorConfig configuration")
  .option("--skip-gitignore", "Skip .gitignore file")
  .action(initAction);

configCommand
  .command("list")
  .description("List all configuration files")
  .action(listAction);

configCommand
  .command("validate [config]")
  .description("Validate configuration files")
  .option("--all", "Validate all configuration files")
  .action(validateAction);
