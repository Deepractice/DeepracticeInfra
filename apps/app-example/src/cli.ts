#!/usr/bin/env node

/**
 * app-example CLI
 */

import { Command } from "commander";
import chalk from "chalk";
import { greet } from "./index.js";

const program = new Command();

program
  .name("app-example")
  .description("Example CLI application")
  .version("0.0.1");

program
  .command("greet")
  .description("Greet someone")
  .argument("[name]", "Name to greet", "World")
  .action((name: string) => {
    console.log(chalk.green(greet(name)));
  });

program
  .command("hello")
  .description("Say hello")
  .action(() => {
    console.log(chalk.blue("Hello from app-example!"));
  });

program.parse();
