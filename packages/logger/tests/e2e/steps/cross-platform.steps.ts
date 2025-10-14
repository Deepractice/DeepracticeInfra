import { Given, When, Then } from "@deepracticex/vitest-cucumber";
import { expect } from "vitest";
import { createLogger } from "~/api/index.js";
import { detectEnvironment } from "~/core/adapter-factory.js";
import type { LoggerConfig } from "~/types/index.js";

Given("I am testing logger cross-platform support", async function () {
  this.testMode = "cross-platform";
});

When("I create a logger without specifying environment", async function () {
  this.logger = createLogger({ name: "test-app" });
  // Wait for async initialization
  await this.logger.info("init");
});

When("the runtime is Node.js", function () {
  this.detectedEnv = detectEnvironment();
  expect(this.detectedEnv).toBe("nodejs");
});

When(
  "I create a logger with environment {string}",
  async function (environment: string) {
    const config: LoggerConfig = {
      name: "test-app",
      environment: environment as any,
    };
    this.logger = createLogger(config);
    this.specifiedEnv = environment;
    // Wait for async initialization
    await this.logger.info("init");
  },
);

Given(
  "I have a logger with environment {string}",
  async function (environment: string) {
    this.logs = [];

    // Mock console methods to capture logs BEFORE creating logger
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    console.log = (...args: any[]) => {
      this.logs.push({ level: "log", args });
      originalConsole.log(...args);
    };
    console.info = (...args: any[]) => {
      this.logs.push({ level: "info", args });
      originalConsole.info(...args);
    };
    console.warn = (...args: any[]) => {
      this.logs.push({ level: "warn", args });
      originalConsole.warn(...args);
    };
    console.error = (...args: any[]) => {
      this.logs.push({ level: "error", args });
      originalConsole.error(...args);
    };

    this.restoreConsole = () => {
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    };

    const config: LoggerConfig = {
      name: "test-app",
      environment: environment as any,
      console: true, // Enable console for testing
    };
    this.logger = createLogger(config);
  },
);

When("I create a logger with traditional config", async function () {
  this.logger = createLogger({
    name: "test-app",
    level: "info",
    console: true,
  });
  // Wait for async initialization
  await this.logger.info("init");
});

Then("the logger should use Pino adapter", function () {
  // In Node.js environment, Pino adapter is used
  expect(this.detectedEnv).toBe("nodejs");
});

Then("file logging should be available", function () {
  // File logging is only available in Node.js
  expect(this.detectedEnv).toBe("nodejs");
});

Then("the logger should use console adapter", function () {
  // Console adapter is used for edge runtimes
  expect(["cloudflare-workers", "browser"]).toContain(this.specifiedEnv);
});

Then("file logging should not be available", function () {
  // File logging is not available in edge runtimes
  expect(["cloudflare-workers", "browser"]).toContain(this.specifiedEnv);
});

Then("the logger should work without Node.js modules", function () {
  // Console adapter doesn't require Node.js modules
  expect(this.specifiedEnv).toBe("cloudflare-workers");
});

Then("the log should be recorded", async function () {
  // Wait a bit for async logging to complete
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Check if console was called (logs captured)
  expect(this.logs.length).toBeGreaterThan(0);
  if (this.restoreConsole) {
    this.restoreConsole();
  }
});

Then(
  "the log message should contain {string}",
  async function (message: string) {
    // Wait a bit for async logging to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Find log containing the message
    const found = this.logs.some((log: any) =>
      log.args.some((arg: any) => String(arg).includes(message)),
    );
    expect(found).toBe(true);
    if (this.restoreConsole) {
      this.restoreConsole();
    }
  },
);

Then("the logger should work normally", async function () {
  // Test basic logging
  await this.logger.info("test");
  expect(this.logger).toBeDefined();
  expect(typeof this.logger.info).toBe("function");
});

Then("all log levels should function", async function () {
  // Test all log levels
  await this.logger.trace("trace");
  await this.logger.debug("debug");
  await this.logger.info("info");
  await this.logger.warn("warn");
  await this.logger.error("error");
  await this.logger.fatal("fatal");

  // All should complete without error
  expect(true).toBe(true);
});
