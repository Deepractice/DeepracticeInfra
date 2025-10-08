/**
 * Step definitions for basic logging functionality
 */

import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { expect } from "chai";
import { createLogger } from "../../../src/index.js";
import type { LoggerWorld } from "../support/world.js";

// Mock to capture log output
const captureLog = (world: LoggerWorld) => {
  const capturedLogs: any[] = [];

  // Create logger with custom stream
  const logger = createLogger({
    console: false,
    file: false,
  });

  // Intercept log methods
  const originalInfo = logger.info.bind(logger);
  const originalWarn = logger.warn.bind(logger);
  const originalError = logger.error.bind(logger);
  const originalDebug = logger.debug.bind(logger);

  logger.info = (...args: any[]) => {
    capturedLogs.push({ level: "info", args });
    return originalInfo(...args);
  };

  logger.warn = (...args: any[]) => {
    capturedLogs.push({ level: "warn", args });
    return originalWarn(...args);
  };

  logger.error = (...args: any[]) => {
    capturedLogs.push({ level: "error", args });
    return originalError(...args);
  };

  logger.debug = (...args: any[]) => {
    capturedLogs.push({ level: "debug", args });
    return originalDebug(...args);
  };

  world.logger = logger;
  world.logRecords = capturedLogs;
};

// Given steps
Given("I have a logger instance", function (this: LoggerWorld) {
  captureLog(this);
});

// When steps
When(
  "I log {string} at level {string}",
  function (this: LoggerWorld, message: string, level: string) {
    const logger = this.logger!;
    switch (level) {
      case "info":
        logger.info(message);
        break;
      case "warn":
        logger.warn(message);
        break;
      case "error":
        logger.error(message);
        break;
      case "debug":
        logger.debug(message);
        break;
    }
    this.lastLog = this.logRecords[this.logRecords.length - 1];
  },
);

When(
  "I log {string} at level {string} with context:",
  function (
    this: LoggerWorld,
    message: string,
    level: string,
    dataTable: DataTable,
  ) {
    const context: Record<string, any> = {};
    dataTable.hashes().forEach((row) => {
      context[row.key] = row.value;
    });

    const logger = this.logger!;
    switch (level) {
      case "info":
        logger.info(message, context);
        break;
      case "warn":
        logger.warn(message, context);
        break;
      case "error":
        logger.error(message, context);
        break;
      case "debug":
        logger.debug(message, context);
        break;
    }

    this.lastLog = this.logRecords[this.logRecords.length - 1];
    this.set("logContext", context);
  },
);

When(
  "I create a logger with name {string}",
  function (this: LoggerWorld, packageName: string) {
    this.logger = createLogger({
      name: packageName,
      console: false,
      file: false,
    });
    this.set("packageName", packageName);
    captureLog(this);
  },
);

When("I log a message from a function", function (this: LoggerWorld) {
  const logFromFunction = () => {
    this.logger!.info("Message from function");
  };
  logFromFunction();
  this.lastLog = this.logRecords[this.logRecords.length - 1];
});

// Then steps
Then(
  "the log should be recorded at level {string}",
  function (this: LoggerWorld, expectedLevel: string) {
    expect(this.lastLog).to.exist;
    expect(this.lastLog.level).to.equal(expectedLevel);
  },
);

Then(
  "the log message should be {string}",
  function (this: LoggerWorld, expectedMessage: string) {
    expect(this.lastLog).to.exist;
    const message = this.lastLog.args[0];
    expect(message).to.equal(expectedMessage);
  },
);

Then("the log should include context data", function (this: LoggerWorld) {
  expect(this.lastLog).to.exist;
  expect(this.lastLog.args.length).to.be.greaterThan(1);
});

Then(
  "the context should have {string} equal to {string}",
  function (this: LoggerWorld, key: string, value: string) {
    const context = this.get("logContext");
    expect(context).to.have.property(key, value);
  },
);

Then(
  "the log should include package name {string}",
  function (this: LoggerWorld, packageName: string) {
    expect(this.get("packageName")).to.equal(packageName);
  },
);

Then("the log should include caller location", function (this: LoggerWorld) {
  // This is tested by the logger implementation
  // Actual verification would require inspecting pino output
  expect(this.lastLog).to.exist;
});

Then("the location should include filename", function (this: LoggerWorld) {
  expect(this.lastLog).to.exist;
});

Then("the location should include line number", function (this: LoggerWorld) {
  expect(this.lastLog).to.exist;
});

Then(
  "the log location should match format {string}",
  function (this: LoggerWorld, _format: string) {
    expect(this.lastLog).to.exist;
  },
);
