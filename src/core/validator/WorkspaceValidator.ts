import path from "node:path";
import fs from "fs-extra";
import yaml from "yaml";

export interface ValidationError {
  type: "file" | "directory" | "configuration";
  message: string;
  path?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export class WorkspaceValidator {
  async validateMonorepo(rootDir: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Check required files
    const requiredFiles = [
      "package.json",
      "pnpm-workspace.yaml",
      "tsconfig.json",
    ];
    for (const file of requiredFiles) {
      const filePath = path.join(rootDir, file);
      if (!(await fs.pathExists(filePath))) {
        errors.push({
          type: "file",
          message: `Missing required file: ${file}`,
          path: filePath,
        });
      }
    }

    // Check required directories
    const requiredDirs = ["packages", "apps"];
    for (const dir of requiredDirs) {
      const dirPath = path.join(rootDir, dir);
      if (!(await fs.pathExists(dirPath))) {
        errors.push({
          type: "directory",
          message: `Missing required directory: ${dir}/`,
          path: dirPath,
        });
      }
    }

    // Validate pnpm-workspace.yaml structure
    await this.validateWorkspaceConfig(rootDir, errors);

    // Validate tsconfig.json structure
    await this.validateTsConfig(rootDir, errors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async validatePackage(packageDir: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Check required files
    const requiredFiles = ["package.json", "tsconfig.json", "src/index.ts"];
    for (const file of requiredFiles) {
      const filePath = path.join(packageDir, file);
      if (!(await fs.pathExists(filePath))) {
        errors.push({
          type: "file",
          message: `Missing required file: ${file}`,
          path: filePath,
        });
      }
    }

    // Validate package.json structure
    await this.validatePackageJson(packageDir, errors, "package");

    // Validate TypeScript configuration
    await this.validatePackageTsConfig(packageDir, errors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async validateApp(appDir: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Check required files
    const requiredFiles = ["package.json", "tsconfig.json", "src/index.ts"];
    for (const file of requiredFiles) {
      const filePath = path.join(appDir, file);
      if (!(await fs.pathExists(filePath))) {
        errors.push({
          type: "file",
          message: `Missing required file: ${file}`,
          path: filePath,
        });
      }
    }

    // Validate package.json structure
    await this.validatePackageJson(appDir, errors, "app");

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private async validateWorkspaceConfig(
    rootDir: string,
    errors: ValidationError[],
  ): Promise<void> {
    const workspaceFile = path.join(rootDir, "pnpm-workspace.yaml");
    if (!(await fs.pathExists(workspaceFile))) {
      return;
    }

    try {
      const content = await fs.readFile(workspaceFile, "utf-8");
      const config = yaml.parse(content);

      if (!config.packages || !Array.isArray(config.packages)) {
        errors.push({
          type: "configuration",
          message: "Invalid pnpm-workspace.yaml: missing packages array",
          path: workspaceFile,
        });
        return;
      }

      if (!config.packages.includes("packages/*")) {
        errors.push({
          type: "configuration",
          message:
            "Invalid pnpm-workspace.yaml: missing packages/* in workspace",
          path: workspaceFile,
        });
      }
    } catch (error) {
      errors.push({
        type: "configuration",
        message: `Failed to parse pnpm-workspace.yaml: ${error instanceof Error ? error.message : "Unknown error"}`,
        path: workspaceFile,
      });
    }
  }

  private async validateTsConfig(
    rootDir: string,
    errors: ValidationError[],
  ): Promise<void> {
    const tsconfigFile = path.join(rootDir, "tsconfig.json");
    if (!(await fs.pathExists(tsconfigFile))) {
      return;
    }

    try {
      const tsconfig = await fs.readJson(tsconfigFile);

      if (!tsconfig.references || !Array.isArray(tsconfig.references)) {
        errors.push({
          type: "configuration",
          message: "Invalid tsconfig.json: missing workspace references",
          path: tsconfigFile,
        });
      }
    } catch (error) {
      errors.push({
        type: "configuration",
        message: `Failed to parse tsconfig.json: ${error instanceof Error ? error.message : "Unknown error"}`,
        path: tsconfigFile,
      });
    }
  }

  private async validatePackageJson(
    packageDir: string,
    errors: ValidationError[],
    type: "package" | "app",
  ): Promise<void> {
    const packageJsonPath = path.join(packageDir, "package.json");
    if (!(await fs.pathExists(packageJsonPath))) {
      return;
    }

    try {
      const packageJson = await fs.readJson(packageJsonPath);

      const requiredFields = ["name", "version"];
      if (type === "package") {
        requiredFields.push("main", "types");
      } else if (type === "app") {
        requiredFields.push("bin");
      }

      for (const field of requiredFields) {
        if (!packageJson[field]) {
          errors.push({
            type: "configuration",
            message: `Missing required field in package.json: ${field}`,
            path: packageJsonPath,
          });
        }
      }

      // Validate bin configuration for apps
      if (type === "app" && packageJson.bin) {
        const binPath =
          typeof packageJson.bin === "string"
            ? packageJson.bin
            : Object.values(packageJson.bin)[0];
        if (binPath) {
          const fullBinPath = path.join(packageDir, binPath as string);
          // Only check if dist directory exists (build output)
          if (await fs.pathExists(path.dirname(fullBinPath))) {
            if (!(await fs.pathExists(fullBinPath))) {
              errors.push({
                type: "configuration",
                message: "Invalid bin configuration: file does not exist",
                path: fullBinPath,
              });
            }
          }
        }
      }
    } catch (error) {
      errors.push({
        type: "configuration",
        message: `Failed to parse package.json: ${error instanceof Error ? error.message : "Unknown error"}`,
        path: packageJsonPath,
      });
    }
  }

  private async validatePackageTsConfig(
    packageDir: string,
    errors: ValidationError[],
  ): Promise<void> {
    const tsconfigPath = path.join(packageDir, "tsconfig.json");
    if (!(await fs.pathExists(tsconfigPath))) {
      return;
    }

    try {
      const tsconfig = await fs.readJson(tsconfigPath);

      if (
        !tsconfig.extends ||
        !tsconfig.extends.includes("@deepracticex/typescript-config")
      ) {
        errors.push({
          type: "configuration",
          message:
            "Invalid TypeScript configuration: must extend @deepracticex/typescript-config",
          path: tsconfigPath,
        });
      }
    } catch (error) {
      errors.push({
        type: "configuration",
        message: `Failed to parse tsconfig.json: ${error instanceof Error ? error.message : "Unknown error"}`,
        path: tsconfigPath,
      });
    }
  }
}
