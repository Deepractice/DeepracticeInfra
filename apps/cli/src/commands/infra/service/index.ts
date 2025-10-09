import { Command } from "commander";
import { addAction } from "./add.js";
import { removeAction } from "./remove.js";
import { listAction } from "./list.js";
import { validateAction } from "./validate.js";

export const serviceCommand = new Command("service").description(
  "Manage services in NodeSpec monorepo",
);

serviceCommand
  .command("add <name>")
  .description("Add a new service to the monorepo")
  .option("--location <location>", "Service location (default: services)")
  .action(addAction);

serviceCommand
  .command("remove <name>")
  .description("Remove a service from the monorepo")
  .option("--force", "Skip confirmation prompt")
  .action(removeAction);

serviceCommand
  .command("list")
  .description("List all services in the monorepo")
  .option("--verbose", "Show detailed service information")
  .option("--json", "Output as JSON")
  .action(listAction);

serviceCommand
  .command("validate [name]")
  .description("Validate service structure and configuration")
  .option("--all", "Validate all services in workspace")
  .action(validateAction);
