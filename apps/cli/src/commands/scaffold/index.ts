import { Command } from "commander";
import { monorepoCommand } from "./monorepo/index.js";
import { packageCommand } from "./package/index.js";
import { appCommand } from "./app/index.js";
import { configCommand } from "./config/index.js";

export const scaffoldCommand = new Command("scaffold").description(
  "Scaffold NodeSpec monorepo projects and components",
);

// Register domain commands (three-layer structure: scaffold [domain] [action])
scaffoldCommand.addCommand(monorepoCommand);
scaffoldCommand.addCommand(packageCommand);
scaffoldCommand.addCommand(appCommand);
scaffoldCommand.addCommand(configCommand);
