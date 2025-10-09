import { Command } from "commander";
import { initAction } from "./init.js";
import { createAction } from "./create.js";
import { validateAction } from "./validate.js";

export const monorepoCommand = new Command("monorepo").description(
  "Manage NodeSpec monorepo projects",
);

monorepoCommand
  .command("init")
  .description("Initialize a new NodeSpec monorepo in the current directory")
  .option("--name <name>", "Project name (defaults to directory name)")
  .option("--skip-install", "Skip dependency installation")
  .option("--skip-git", "Skip git initialization")
  .action(initAction);

monorepoCommand
  .command("create <name>")
  .description("Create a new NodeSpec monorepo in a new directory")
  .option("--skip-install", "Skip dependency installation")
  .option("--skip-git", "Skip git initialization")
  .action(createAction);

monorepoCommand
  .command("validate")
  .description("Validate monorepo structure and configuration")
  .action(validateAction);
