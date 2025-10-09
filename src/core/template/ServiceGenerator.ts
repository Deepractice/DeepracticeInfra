import path from "node:path";
import fs from "fs-extra";
import { VERSIONS } from "./versions.js";

export interface ServiceOptions {
  name: string;
  location?: string;
}

export class ServiceGenerator {
  async generate(monorepoRoot: string, options: ServiceOptions): Promise<void> {
    const location = options.location || "services";
    const dirName = this.extractDirectoryName(options.name);
    const targetDir = path.join(monorepoRoot, location, dirName);

    await this.createServiceStructure(targetDir);
    await this.generatePackageJson(targetDir, options.name);
    await this.generateTsConfig(targetDir);
    await this.generateTsupConfig(targetDir);
    await this.generateSourceFiles(targetDir, dirName);
    await this.generateEnvExample(targetDir);
  }

  private async createServiceStructure(targetDir: string): Promise<void> {
    await fs.ensureDir(path.join(targetDir, "src"));
    await fs.ensureDir(path.join(targetDir, "src", "routes"));
    await fs.ensureDir(path.join(targetDir, "src", "middleware"));
    await fs.ensureDir(path.join(targetDir, "src", "controllers"));
  }

  private async generatePackageJson(
    targetDir: string,
    serviceName: string,
  ): Promise<void> {
    const packageJson = {
      name: serviceName,
      version: "0.0.1",
      description: `${serviceName} service`,
      type: "module",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          default: "./dist/index.js",
        },
      },
      scripts: {
        build: "tsup",
        dev: "tsx watch src/index.ts",
        start: "node dist/index.js",
        typecheck: "tsc --noEmit",
        clean: "rimraf dist",
      },
      keywords: [serviceName],
      author: "Deepractice",
      license: "MIT",
      dependencies: {
        express: "^4.18.2",
        dotenv: "^16.3.1",
      },
      devDependencies: {
        "@deepracticex/tsup-config": VERSIONS.tsupConfig,
        "@deepracticex/typescript-config": VERSIONS.typescriptConfig,
        "@types/express": "^4.17.21",
        "@types/node": "^20.10.0",
        tsup: VERSIONS.tsup,
        typescript: VERSIONS.typescript,
        tsx: VERSIONS.tsx,
        rimraf: VERSIONS.rimraf,
      },
    };

    await fs.writeJson(path.join(targetDir, "package.json"), packageJson, {
      spaces: 2,
    });
  }

  private async generateTsConfig(targetDir: string): Promise<void> {
    const tsconfig = {
      extends: "@deepracticex/typescript-config/base.json",
      compilerOptions: {
        outDir: "./dist",
        rootDir: "./src",
      },
      include: ["src/**/*"],
    };

    await fs.writeJson(path.join(targetDir, "tsconfig.json"), tsconfig, {
      spaces: 2,
    });
  }

  private async generateTsupConfig(targetDir: string): Promise<void> {
    const tsupConfig = `import { createConfig } from "@deepracticex/tsup-config";

export default createConfig({
  entry: ["src/index.ts", "src/server.ts"],
});
`;

    await fs.writeFile(path.join(targetDir, "tsup.config.ts"), tsupConfig);
  }

  private async generateSourceFiles(
    targetDir: string,
    serviceName: string,
  ): Promise<void> {
    // Generate index.ts (entry point that starts server)
    const indexTs = `/**
 * ${serviceName} - Service entry point
 */

import dotenv from "dotenv";
import { server } from "./server.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
`;

    await fs.writeFile(path.join(targetDir, "src", "index.ts"), indexTs);

    // Generate server.ts (Express server setup)
    const serverTs = `/**
 * Express server setup
 */

import express from "express";
import { router } from "./routes/index.js";

export const server = express();

// Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Routes
server.use("/api", router);

// Health check endpoint
server.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
`;

    await fs.writeFile(path.join(targetDir, "src", "server.ts"), serverTs);

    // Generate routes/index.ts
    const routesIndexTs = `/**
 * API routes
 */

import express from "express";

export const router = express.Router();

// Example route
router.get("/", (req, res) => {
  res.json({ message: "API is working" });
});
`;

    await fs.writeFile(
      path.join(targetDir, "src", "routes", "index.ts"),
      routesIndexTs,
    );
  }

  private async generateEnvExample(targetDir: string): Promise<void> {
    const envExample = `# Server configuration
PORT=3000

# Environment
NODE_ENV=development
`;

    await fs.writeFile(path.join(targetDir, ".env.example"), envExample);
  }

  /**
   * Extract directory name from service name
   * @param name - Service name (may include scope like @org/name)
   * @returns Directory name without scope
   * @example
   * extractDirectoryName('@myorg/api-gateway') // 'api-gateway'
   * extractDirectoryName('auth-service') // 'auth-service'
   */
  private extractDirectoryName(name: string): string {
    if (name.startsWith("@")) {
      const parts = name.split("/");
      return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
    }
    return name;
  }
}
