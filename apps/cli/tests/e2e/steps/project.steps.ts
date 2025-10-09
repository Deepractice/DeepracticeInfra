/**
 * Project-specific step definitions for init and create scenarios
 */
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import type { ProjectWorld } from "../support/world";

// File existence assertions
Then(
  "the following files should exist:",
  async function (this: ProjectWorld, dataTable: { rawTable: string[][] }) {
    const files = dataTable.rawTable.slice(1).map((row) => row[0]!);

    for (const file of files) {
      const filePath = path.join(this.testDir!, file);
      const exists = await fs.pathExists(filePath);
      expect(exists, `File ${file} should exist`).to.be.true;
    }
  },
);

Then(
  "the following files should exist in {string}:",
  async function (
    this: ProjectWorld,
    directory: string,
    dataTable: { rawTable: string[][] },
  ) {
    const files = dataTable.rawTable.slice(1).map((row) => row[0]!);

    for (const file of files) {
      const filePath = path.join(this.testDir!, directory, file);
      const exists = await fs.pathExists(filePath);
      expect(exists, `File ${file} should exist in ${directory}`).to.be.true;
    }
  },
);

Then(
  "the following directories should exist:",
  async function (this: ProjectWorld, dataTable: { rawTable: string[][] }) {
    const directories = dataTable.rawTable.slice(1).map((row) => row[0]!);

    for (const dir of directories) {
      const dirPath = path.join(this.testDir!, dir);
      const exists = await fs.pathExists(dirPath);
      expect(exists, `Directory ${dir} should exist`).to.be.true;
    }
  },
);

Then(
  "directory {string} should exist",
  async function (this: ProjectWorld, dirName: string) {
    const dirPath = path.join(this.testDir!, dirName);
    const exists = await fs.pathExists(dirPath);
    expect(exists, `Directory ${dirName} should exist`).to.be.true;
  },
);

Then(
  "{string} directory should exist",
  async function (this: ProjectWorld, dirName: string) {
    const dirPath = path.join(this.testDir!, dirName);
    const exists = await fs.pathExists(dirPath);
    expect(exists, `Directory ${dirName} should exist`).to.be.true;
  },
);

Then(
  "{string} directory should not exist",
  async function (this: ProjectWorld, dirName: string) {
    const dirPath = path.join(this.testDir!, dirName);
    const exists = await fs.pathExists(dirPath);
    expect(exists, `Directory ${dirName} should not exist`).to.be.false;
  },
);

Then(
  "{string} should exist",
  async function (this: ProjectWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    const exists = await fs.pathExists(filePath);
    expect(exists, `File ${fileName} should exist`).to.be.true;
  },
);

Then(
  "{string} should not exist",
  async function (this: ProjectWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    const exists = await fs.pathExists(filePath);
    expect(exists, `File ${fileName} should not exist`).to.be.false;
  },
);

// File content assertions
Then(
  "{string} should contain {string}",
  async function (
    this: ProjectWorld,
    fileName: string,
    expectedContent: string,
  ) {
    const filePath = path.join(this.testDir!, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    expect(content).to.include(
      expectedContent,
      `File ${fileName} should contain "${expectedContent}"`,
    );
  },
);

Then(
  "{string}\\/{string} should contain {string}",
  async function (
    this: ProjectWorld,
    directory: string,
    fileName: string,
    expectedContent: string,
  ) {
    const filePath = path.join(this.testDir!, directory, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    expect(content).to.include(
      expectedContent,
      `File ${directory}/${fileName} should contain "${expectedContent}"`,
    );
  },
);

Then(
  "file {string} should exist",
  async function (this: ProjectWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    const exists = await fs.pathExists(filePath);
    expect(exists, `File ${fileName} should exist`).to.be.true;
  },
);

// Git-related assertions
Then(
  "git repository should be initialized",
  async function (this: ProjectWorld) {
    const gitDir = path.join(this.testDir!, ".git");
    const exists = await fs.pathExists(gitDir);
    expect(exists, "Git repository should be initialized").to.be.true;
  },
);

Then(
  "git repository should be initialized in {string}",
  async function (this: ProjectWorld, directory: string) {
    const gitDir = path.join(this.testDir!, directory, ".git");
    const exists = await fs.pathExists(gitDir);
    expect(exists, `Git repository should be initialized in ${directory}`).to.be
      .true;
  },
);

Then(
  "git repository should not be initialized",
  async function (this: ProjectWorld) {
    const gitDir = path.join(this.testDir!, ".git");
    const exists = await fs.pathExists(gitDir);
    expect(exists, "Git repository should not be initialized").to.be.false;
  },
);

Then(
  "git repository should have initial commit",
  async function (this: ProjectWorld) {
    const result = await execa("git", ["log", "--oneline"], {
      cwd: this.testDir!,
      reject: false,
    });

    expect(result.exitCode).to.equal(0);
    expect(result.stdout).to.have.length.greaterThan(0);
  },
);

Then(
  "git commit message should contain {string}",
  async function (this: ProjectWorld, expectedMessage: string) {
    const result = await execa("git", ["log", "-1", "--pretty=%B"], {
      cwd: this.testDir!,
      reject: false,
    });

    expect(result.exitCode).to.equal(0);
    expect(result.stdout).to.include(expectedMessage);
  },
);

// File creation helpers
When(
  "I create a test package in {string}",
  async function (this: ProjectWorld, packagePath: string) {
    const pkgDir = path.join(this.testDir!, packagePath);
    await fs.ensureDir(path.join(pkgDir, "src"));

    await fs.writeJson(path.join(pkgDir, "package.json"), {
      name: "@test/lib",
      version: "0.0.1",
      type: "module",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
      scripts: {
        build: "tsup",
        typecheck: "tsc --noEmit",
      },
      devDependencies: {
        "@deepracticex/tsup-config": "latest",
        "@deepracticex/typescript-config": "latest",
        tsup: "^8.0.0",
        typescript: "^5.0.0",
        vitest: "^2.0.0",
      },
    });

    await fs.writeFile(
      path.join(pkgDir, "tsconfig.json"),
      JSON.stringify(
        {
          extends: "@deepracticex/typescript-config/base.json",
          compilerOptions: {
            outDir: "./dist",
            rootDir: "./src",
          },
          include: ["src/**/*"],
        },
        null,
        2,
      ),
    );

    await fs.writeFile(
      path.join(pkgDir, "tsup.config.ts"),
      `import { createConfig } from '@deepracticex/tsup-config';
export default createConfig({ entry: ['src/index.ts'] });`,
    );

    await fs.writeFile(
      path.join(pkgDir, "src/index.ts"),
      `export function test(): string { return 'test'; }`,
    );
  },
);

When(
  "I create directory {string}",
  async function (this: ProjectWorld, directory: string) {
    const dirPath = path.join(this.testDir!, directory);
    await fs.ensureDir(dirPath);
  },
);

When(
  "I create {string} with:",
  async function (this: ProjectWorld, filePath: string, content: string) {
    const fullPath = path.join(this.testDir!, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
  },
);
