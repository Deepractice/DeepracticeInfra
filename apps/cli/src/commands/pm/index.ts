import { Command } from "commander";
import { featureCommand } from "./feature/index.js";

export const pmCommand = new Command("pm")
  .description("Product Management (PM) commands for feature lifecycle")
  .addCommand(featureCommand);
