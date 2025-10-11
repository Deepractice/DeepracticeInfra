/**
 * Core business logic - not exported
 * This is internal implementation that can be freely refactored
 */
import type { ExampleConfig } from "~/types/config";

export class Processor {
  private config: Required<ExampleConfig>;

  constructor(config: ExampleConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      timeout: config.timeout ?? 5000,
      debug: config.debug ?? false,
    };
  }

  async process(input: string): Promise<string> {
    if (!this.config.enabled) {
      throw new Error("Processor is disabled");
    }

    if (this.config.debug) {
      console.log(`Processing: ${input}`);
    }

    // Simulate async processing
    await this.delay(100);

    return `Processed: ${input}`;
  }

  getStatus(): string {
    return this.config.enabled ? "active" : "inactive";
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
