import { Command } from "commander";
import { initAction } from "./init.js";
import { createAction } from "./create.js";

export const projectCommand = new Command("project").description(
  "Manage NodeSpec monorepo projects",
);

projectCommand
  .command("init")
  .description("Initialize a new NodeSpec project in the current directory")
  .option("--name <name>", "Project name (defaults to directory name)")
  .option("--skip-install", "Skip dependency installation")
  .option("--skip-git", "Skip git initialization")
  .action(initAction);

projectCommand
  .command("create <name>")
  .description("Create a new NodeSpec project in a new directory")
  .option("--skip-install", "Skip dependency installation")
  .option("--skip-git", "Skip git initialization")
  .action(createAction);
