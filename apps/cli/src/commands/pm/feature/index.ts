import { Command } from "commander";
import { initAction } from "./init.js";
import { validateCommand } from "./validate.js";
import { listAction } from "./list.js";
import { showAction } from "./show.js";

export const featureCommand = new Command("feature").description(
  "Feature management commands",
);

featureCommand
  .command("init [path]")
  .description("Initialize feature with @spec:id tag")
  .option("--all", "Initialize all features in monorepo")
  .action(initAction);

featureCommand
  .command("list")
  .description("List all features in the monorepo")
  .option("--path <pattern>", "Filter features by path pattern")
  .option("--id <pattern>", "Filter features by ID pattern")
  .option("--format <format>", "Output format (table, json, compact)", "table")
  .action(listAction);

featureCommand
  .command("show")
  .description("Show detailed information about a specific feature")
  .option("--id <id>", "Feature ID to show")
  .option("--path <path>", "Feature path to show")
  .option("--full", "Show complete feature file content")
  .option("--format <format>", "Output format (table, json, yaml)", "table")
  .option("--metadata", "Show file metadata")
  .option("--stats", "Show feature complexity metrics")
  .option("--related", "Show related features")
  .action(showAction);

featureCommand.addCommand(validateCommand);
