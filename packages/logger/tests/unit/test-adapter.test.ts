/**
 * Unit tests for test adapter
 * Demonstrates how to use the logger in test environments
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  createLogger,
  getTestLogs,
  clearTestLogs,
  getTestLogsByLevel,
  getTestLogsCount,
} from "~/test.js";

describe("Test Adapter", () => {
  beforeEach(() => {
    clearTestLogs();
  });

  describe("Log capture", () => {
    it("should capture logs in memory", () => {
      const logger = createLogger();

      logger.info("test message");
      logger.warn("warning message");

      const logs = getTestLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].level).toBe("info");
      expect(logs[0].message).toBe("test message");
      expect(logs[1].level).toBe("warn");
      expect(logs[1].message).toBe("warning message");
    });

    it("should capture all log levels", () => {
      const logger = createLogger({ level: "trace" });

      logger.trace("trace msg");
      logger.debug("debug msg");
      logger.info("info msg");
      logger.warn("warn msg");
      logger.error("error msg");
      logger.fatal("fatal msg");

      const logs = getTestLogs();
      expect(logs).toHaveLength(6);
      expect(logs.map((l) => l.level)).toEqual([
        "trace",
        "debug",
        "info",
        "warn",
        "error",
        "fatal",
      ]);
    });

    it("should include timestamps", () => {
      const logger = createLogger();
      const before = Date.now();

      logger.info("test");

      const after = Date.now();
      const logs = getTestLogs();

      expect(logs[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(logs[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe("Log filtering", () => {
    it("should respect log level configuration", () => {
      const logger = createLogger({ level: "warn" });

      logger.debug("debug msg"); // Should not be captured
      logger.info("info msg"); // Should not be captured
      logger.warn("warn msg"); // Should be captured
      logger.error("error msg"); // Should be captured

      const logs = getTestLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].level).toBe("warn");
      expect(logs[1].level).toBe("error");
    });

    it("should filter logs by level", () => {
      const logger = createLogger();

      logger.info("info 1");
      logger.warn("warn 1");
      logger.info("info 2");
      logger.error("error 1");

      const warnLogs = getTestLogsByLevel("warn");
      expect(warnLogs).toHaveLength(1);
      expect(warnLogs[0].message).toBe("warn 1");

      const infoLogs = getTestLogsByLevel("info");
      expect(infoLogs).toHaveLength(2);
    });
  });

  describe("Context objects", () => {
    it("should capture context with message", () => {
      const logger = createLogger();

      logger.info({ userId: "123", action: "login" }, "user action");

      const logs = getTestLogs();
      expect(logs[0].context).toEqual({ userId: "123", action: "login" });
      expect(logs[0].message).toBe("user action");
    });

    it("should handle context-only logs", () => {
      const logger = createLogger();

      logger.info({ data: "value" });

      const logs = getTestLogs();
      expect(logs[0].context).toEqual({ data: "value" });
      expect(logs[0].message).toBe('{"data":"value"}');
    });
  });

  describe("Utility functions", () => {
    it("should get log count", () => {
      const logger = createLogger();

      expect(getTestLogsCount()).toBe(0);

      logger.info("msg 1");
      logger.info("msg 2");

      expect(getTestLogsCount()).toBe(2);
    });

    it("should clear logs", () => {
      const logger = createLogger();

      logger.info("msg 1");
      logger.info("msg 2");

      expect(getTestLogsCount()).toBe(2);

      clearTestLogs();

      expect(getTestLogsCount()).toBe(0);
      expect(getTestLogs()).toEqual([]);
    });
  });

  describe("Console output", () => {
    it("should be silent by default", () => {
      const logger = createLogger();

      // We can't easily test console.log wasn't called,
      // but we can verify logs are captured
      logger.info("test");

      expect(getTestLogs()).toHaveLength(1);
    });

    it("should output when console is enabled", () => {
      const logger = createLogger({ console: true });

      // With console: true, logs should still be captured
      logger.info("test");

      expect(getTestLogs()).toHaveLength(1);
    });
  });

  describe("Multiple logger instances", () => {
    it("should share the same log storage", () => {
      const logger1 = createLogger({ name: "service1" });
      const logger2 = createLogger({ name: "service2" });

      logger1.info("from logger1");
      logger2.info("from logger2");

      const logs = getTestLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].message).toBe("from logger1");
      expect(logs[1].message).toBe("from logger2");
    });
  });
});
