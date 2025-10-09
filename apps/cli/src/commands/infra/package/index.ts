import { Command } from "commander";
import { addAction } from "./add.js";
import { removeAction } from "./remove.js";
import { listAction } from "./list.js";
import { validateAction } from "./validate.js";

export const packageCommand = new Command("package").description(
  "Manage packages in NodeSpec monorepo",
);

packageCommand
  .command("add <name>")
  .description("Add a new package to the monorepo")
  .option("--location <location>", "Package location (default: packages)")
  .action(addAction);

packageCommand
  .command("remove <name>")
  .description("Remove a package from the monorepo")
  .option("--force", "Skip confirmation prompt")
  .action(removeAction);

packageCommand
  .command("list")
  .description("List all packages in the monorepo")
  .option("--verbose", "Show detailed package information")
  .option("--json", "Output as JSON")
  .action(listAction);

packageCommand
  .command("validate [name]")
  .description("Validate package structure and configuration")
  .option("--all", "Validate all packages in workspace")
  .action(validateAction);
