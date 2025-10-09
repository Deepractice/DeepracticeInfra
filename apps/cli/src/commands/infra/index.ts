import { Command } from "commander";
import { monorepoCommand } from "./monorepo/index.js";
import { packageCommand } from "./package/index.js";
import { appCommand } from "./app/index.js";
import { configCommand } from "./config/index.js";
import { serviceCommand } from "./service/index.js";

export const infraCommand = new Command("infra").description(
  "Infrastructure Engineer: Manage monorepo structure and workspaces",
);

// Register domain commands (three-layer structure: infra [domain] [action])
infraCommand.addCommand(monorepoCommand);
infraCommand.addCommand(packageCommand);
infraCommand.addCommand(appCommand);
infraCommand.addCommand(configCommand);
infraCommand.addCommand(serviceCommand);
