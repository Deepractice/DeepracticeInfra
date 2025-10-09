import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";

export async function listAction(): Promise<void> {
  const cwd = process.cwd();

  // Define expected config files with their tools
  const configFiles = [
    { file: ".eslintrc.json", tool: "ESLint" },
    { file: ".prettierrc.json", tool: "Prettier" },
    { file: "tsconfig.json", tool: "TypeScript" },
    { file: ".editorconfig", tool: "EditorConfig" },
    { file: ".gitignore", tool: "Git" },
  ];

  console.log(chalk.blue("Configuration Files:\n"));

  for (const config of configFiles) {
    const filePath = path.join(cwd, config.file);
    const exists = await fs.pathExists(filePath);

    if (exists) {
      // Check if standard or customized
      let status = "Unknown";
      if (config.file.endsWith(".json")) {
        try {
          const content = await fs.readJson(filePath);
          if (content.extends && content.extends.includes("@deepracticex")) {
            status = "Standard";
          } else {
            status = "Customized";
          }
        } catch {
          status = "Invalid";
        }
      } else {
        status = "Present";
      }

      console.log(
        `${chalk.green("✓")} ${config.file} - ${config.tool} (${status})`,
      );
    } else {
      console.log(
        `${chalk.red("✗")} ${config.file} - ${config.tool} (Missing)`,
      );
    }
  }
}
