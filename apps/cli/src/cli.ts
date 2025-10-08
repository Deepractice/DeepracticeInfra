#!/usr/bin/env node

import { Command } from "commander";
import { projectCommand } from "./commands/project/index.js";

const program = new Command();

program
  .name("nodespec")
  .description("NodeSpec - AI-friendly Node.js development ecosystem CLI")
  .version("0.0.1");

// Register commands
program.addCommand(projectCommand);

program.parse();
