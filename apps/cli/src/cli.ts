#!/usr/bin/env node

import { Command } from "commander";
import { infraCommand } from "./commands/infra/index.js";
import { pmCommand } from "./commands/pm/index.js";

const program = new Command();

program
  .name("nodespec")
  .description("NodeSpec - AI-friendly Node.js development ecosystem CLI")
  .version("0.0.1");

// Register commands
program.addCommand(infraCommand);
program.addCommand(pmCommand);

program.parse();
