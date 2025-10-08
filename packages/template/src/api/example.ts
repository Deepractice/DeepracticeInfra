/**
 * Main API implementation
 */
import type { Example, ExampleConfig } from "~/types/index";
import { Processor } from "~/core/index";

export class DefaultExample implements Example {
  private processor: Processor;

  constructor(config: ExampleConfig = {}) {
    this.processor = new Processor(config);
  }

  async execute(input: string): Promise<string> {
    return this.processor.process(input);
  }

  status(): string {
    return this.processor.getStatus();
  }

  dispose(): void {
    // Clean up resources if needed
  }
}

/**
 * Factory function to create an Example instance
 */
export function createExample(config: ExampleConfig = {}): Example {
  return new DefaultExample(config);
}
