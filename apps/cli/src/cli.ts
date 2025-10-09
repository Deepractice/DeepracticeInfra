#!/usr/bin/env node

import { Command } from "commander";
import { scaffoldCommand } from "./commands/scaffold/index.js";

const program = new Command();

program
  .name("nodespec")
  .description("NodeSpec - AI-friendly Node.js development ecosystem CLI")
  .version("0.0.1");

// Register commands
program.addCommand(scaffoldCommand);

program.parse();
