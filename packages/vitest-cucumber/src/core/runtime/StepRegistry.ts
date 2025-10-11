import type { StepDefinition, StepType } from "~/types";

/**
 * Global registry for step definitions
 */
export class StepRegistry {
  private static instance: StepRegistry;
  private steps: StepDefinition[] = [];

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): StepRegistry {
    if (!StepRegistry.instance) {
      StepRegistry.instance = new StepRegistry();
    }
    return StepRegistry.instance;
  }

  /**
   * Register a step definition
   */
  public register(step: StepDefinition): void {
    this.steps.push(step);
  }

  /**
   * Find a step definition that matches the given text
   */
  public findMatch(
    type: StepType,
    text: string,
  ): { step: StepDefinition; matches: RegExpMatchArray | null } | null {
    for (const step of this.steps) {
      // Skip if type doesn't match (except for And/But which inherit from previous)
      if (type !== "And" && type !== "But" && step.type !== type) {
        continue;
      }

      if (typeof step.pattern === "string") {
        // Exact string match
        if (step.pattern === text) {
          return { step, matches: null };
        }
      } else {
        // RegExp match
        const matches = text.match(step.pattern);
        if (matches) {
          return { step, matches };
        }
      }
    }

    return null;
  }

  /**
   * Clear all registered steps (useful for testing)
   */
  public clear(): void {
    this.steps = [];
  }

  /**
   * Get all registered steps
   */
  public getAll(): StepDefinition[] {
    return [...this.steps];
  }
}
