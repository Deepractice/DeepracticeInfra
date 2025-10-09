import { Command } from "commander";
import { initAction } from "./init.js";

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
