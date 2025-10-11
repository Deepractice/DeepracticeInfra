/**
 * Service-specific step definitions for backend service management
 */
import { Given, Then } from "@deepracticex/testing-utils";
import { expect } from "chai";
import fs from "fs-extra";
import path from "node:path";
import type { InfraWorld } from "../support/world.js";

// Given steps for service creation and setup

Given(
  "service {string} already exists in {string}",
  async function (this: InfraWorld, serviceName: string, location: string) {
    // Handle both formats:
    // - "service 'test-api' exists in 'services/'" - location is parent dir
    // - "service '@myorg/auth-api' exists in 'services/auth-api'" - location is full path
    const serviceDir = location.endsWith("/")
      ? path.join(this.testDir!, location, extractDirName(serviceName))
      : path.join(this.testDir!, location);
    await fs.ensureDir(path.join(serviceDir, "src"));
    await fs.ensureDir(path.join(serviceDir, "src/routes"));
    await fs.ensureDir(path.join(serviceDir, "src/middleware"));
    await fs.ensureDir(path.join(serviceDir, "src/controllers"));

    await fs.writeJson(path.join(serviceDir, "package.json"), {
      name: serviceName,
      version: "0.0.1",
      type: "module",
      scripts: {
        start: "node dist/index.js",
        dev: "tsx watch src/index.ts",
        build: "tsup",
      },
    });

    await fs.writeFile(
      path.join(serviceDir, "src/index.ts"),
      `import { server } from './server';

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,
    );

    await fs.writeFile(
      path.join(serviceDir, "src/server.ts"),
      `import express from 'express';

export const server = express();

server.use(express.json());

server.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
`,
    );
  },
);

Given(
  "service {string} exists in {string}",
  async function (this: InfraWorld, serviceName: string, location: string) {
    // Handle both formats:
    // - "service 'test-api' exists in 'services/'" - location is parent dir
    // - "service '@myorg/auth-api' exists in 'services/auth-api'" - location is full path
    const serviceDir = location.endsWith("/")
      ? path.join(this.testDir!, location, extractDirName(serviceName))
      : path.join(this.testDir!, location);
    await fs.ensureDir(path.join(serviceDir, "src"));

    await fs.writeJson(path.join(serviceDir, "package.json"), {
      name: serviceName,
      version: "0.0.1",
      type: "module",
      scripts: {
        start: "node dist/index.js",
        dev: "tsx watch src/index.ts",
      },
    });

    await fs.writeFile(
      path.join(serviceDir, "src/index.ts"),
      `export const existing = true;`,
    );
  },
);

Given(
  "service {string} exists in {string} with valid structure",
  async function (this: InfraWorld, serviceName: string, location: string) {
    // Handle both formats:
    // - "service 'test-api' exists in 'services/'" - location is parent dir
    // - "service '@myorg/auth-api' exists in 'services/auth-api'" - location is full path
    const serviceDir = location.endsWith("/")
      ? path.join(this.testDir!, location, extractDirName(serviceName))
      : path.join(this.testDir!, location);
    await fs.ensureDir(path.join(serviceDir, "src"));
    await fs.ensureDir(path.join(serviceDir, "src/routes"));
    await fs.ensureDir(path.join(serviceDir, "src/middleware"));
    await fs.ensureDir(path.join(serviceDir, "src/controllers"));

    // Create valid package.json with all required fields
    await fs.writeJson(path.join(serviceDir, "package.json"), {
      name: serviceName,
      version: "1.0.0",
      type: "module",
      scripts: {
        start: "node dist/index.js",
        dev: "tsx watch src/index.ts",
        build: "tsup",
      },
      main: "./dist/index.js",
    });

    // Create valid tsconfig.json
    await fs.writeJson(path.join(serviceDir, "tsconfig.json"), {
      extends: "@deepracticex/typescript-config/base.json",
      compilerOptions: {
        outDir: "./dist",
        rootDir: "./src",
      },
      include: ["src/**/*"],
    });

    // Create valid server setup
    await fs.writeFile(
      path.join(serviceDir, "src/server.ts"),
      `import express from 'express';

export const server = express();

server.use(express.json());

server.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
`,
    );

    // Create valid index.ts that starts the server
    await fs.writeFile(
      path.join(serviceDir, "src/index.ts"),
      `import { server } from './server';

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,
    );

    // Create routes index
    await fs.writeFile(
      path.join(serviceDir, "src/routes/index.ts"),
      `import { Router } from 'express';

export const routes = Router();

routes.get('/', (req, res) => {
  res.json({ message: 'API routes' });
});
`,
    );
  },
);

Given(
  "service {string} exists in {string} with missing server setup",
  async function (this: InfraWorld, serviceName: string, location: string) {
    const serviceDir = path.join(this.testDir!, location, serviceName);
    await fs.ensureDir(path.join(serviceDir, "src"));

    // Create package.json without start script
    await fs.writeJson(path.join(serviceDir, "package.json"), {
      name: serviceName,
      version: "1.0.0",
      type: "module",
      scripts: {
        build: "tsup",
      },
    });

    await fs.writeJson(path.join(serviceDir, "tsconfig.json"), {
      extends: "@deepracticex/typescript-config/base.json",
      compilerOptions: {
        outDir: "./dist",
        rootDir: "./src",
      },
      include: ["src/**/*"],
    });

    // Create index.ts without server
    await fs.writeFile(
      path.join(serviceDir, "src/index.ts"),
      `export const service = true;`,
    );

    // Create invalid or missing server.ts
    await fs.writeFile(
      path.join(serviceDir, "src/server.ts"),
      `// Missing server export
export const config = {};
`,
    );
  },
);

// Given steps for service validation scenarios

Given(
  "{string} is missing {string} script",
  async function (
    this: InfraWorld,
    packageJsonPath: string,
    scriptName: string,
  ) {
    const fullPath = path.join(this.testDir!, packageJsonPath);
    const packageJson = await fs.readJson(fullPath);

    if (packageJson.scripts && packageJson.scripts[scriptName]) {
      delete packageJson.scripts[scriptName];
    }

    await fs.writeJson(fullPath, packageJson, { spaces: 2 });
  },
);

Given(
  "{string} does not export server",
  async function (this: InfraWorld, serverFilePath: string) {
    const fullPath = path.join(this.testDir!, serverFilePath);

    // Create or overwrite server.ts without exporting server
    await fs.writeFile(
      fullPath,
      `import express from 'express';

const app = express();

// Server instance not exported
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
`,
    );
  },
);

// Then steps for service validation

Then(
  "{string} should contain server setup",
  async function (this: InfraWorld, filePath: string) {
    const fullPath = path.join(this.testDir!, filePath);
    const exists = await fs.pathExists(fullPath);
    expect(exists, `File ${filePath} should exist`).to.be.true;

    const content = await fs.readFile(fullPath, "utf-8");

    // Check for server initialization patterns
    const hasServerSetup =
      content.includes("express()") ||
      content.includes("createServer") ||
      content.includes("new Server") ||
      content.includes("fastify()") ||
      content.includes("new Hono");

    expect(
      hasServerSetup,
      `File ${filePath} should contain server setup (express, fastify, etc.)`,
    ).to.be.true;

    // Check for server export
    const hasServerExport =
      content.includes("export const server") ||
      content.includes("export { server }") ||
      content.includes("export default server") ||
      content.includes("export const app") ||
      content.includes("export { app }");

    expect(hasServerExport, `File ${filePath} should export server instance`).to
      .be.true;
  },
);

/**
 * Extract directory name from service name
 * For scoped services like @myorg/auth-api, returns auth-api
 */
function extractDirName(name: string): string {
  if (name.startsWith("@")) {
    const parts = name.split("/");
    return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
  }
  return name;
}
