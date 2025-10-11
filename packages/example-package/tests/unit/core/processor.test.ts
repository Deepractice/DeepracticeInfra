/**
 * Unit tests for Processor (internal implementation)
 * This demonstrates testing core/ internals using @ alias
 */
import { describe, it, expect } from "vitest";
import { Processor } from "@/core/processor";

describe("Processor", () => {
  describe("constructor", () => {
    it("should apply default config", () => {
      const processor = new Processor();
      expect(processor.getStatus()).toBe("active");
    });

    it("should respect provided config", () => {
      const processor = new Processor({ enabled: false });
      expect(processor.getStatus()).toBe("inactive");
    });
  });

  describe("process", () => {
    it("should process input correctly", async () => {
      const processor = new Processor();
      const result = await processor.process("test");
      expect(result).toBe("Processed: test");
    });

    it("should throw when disabled", async () => {
      const processor = new Processor({ enabled: false });
      await expect(processor.process("test")).rejects.toThrow(
        "Processor is disabled",
      );
    });
  });

  describe("getStatus", () => {
    it("should return active when enabled", () => {
      const processor = new Processor({ enabled: true });
      expect(processor.getStatus()).toBe("active");
    });

    it("should return inactive when disabled", () => {
      const processor = new Processor({ enabled: false });
      expect(processor.getStatus()).toBe("inactive");
    });
  });
});
