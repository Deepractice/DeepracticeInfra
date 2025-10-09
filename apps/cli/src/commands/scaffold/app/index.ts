import { Command } from "commander";
import { addAction } from "./add.js";
import { removeAction } from "./remove.js";
import { listAction } from "./list.js";
import { validateAction } from "./validate.js";

export const appCommand = new Command("app").description(
  "Manage applications in NodeSpec monorepo",
);

appCommand
  .command("add <name>")
  .description("Add a new application to the monorepo")
  .action(addAction);

appCommand
  .command("remove <name>")
  .description("Remove an application from the monorepo")
  .option("--force", "Skip confirmation prompt")
  .action(removeAction);

appCommand
  .command("list")
  .description("List all applications in the monorepo")
  .option("--verbose", "Show detailed application information")
  .option("--json", "Output as JSON")
  .action(listAction);

appCommand
  .command("validate [name]")
  .description("Validate application structure and configuration")
  .option("--all", "Validate all applications in workspace")
  .action(validateAction);
