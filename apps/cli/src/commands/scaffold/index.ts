import { Command } from "commander";
import { initAction } from "./init.js";
import { createAction } from "./create.js";

export const scaffoldCommand = new Command("scaffold").description(
  "Scaffold NodeSpec monorepo projects",
);

scaffoldCommand
  .command("init")
  .description("Initialize a new NodeSpec scaffold in the current directory")
  .option("--name <name>", "Project name (defaults to directory name)")
  .option("--skip-install", "Skip dependency installation")
  .option("--skip-git", "Skip git initialization")
  .action(initAction);

scaffoldCommand
  .command("create <name>")
  .description("Create a new NodeSpec scaffold in a new directory")
  .option("--skip-install", "Skip dependency installation")
  .option("--skip-git", "Skip git initialization")
  .action(createAction);
