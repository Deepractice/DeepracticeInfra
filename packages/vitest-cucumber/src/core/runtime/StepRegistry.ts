import type { StepDefinition, StepType } from "~/types";
import {
  ParameterTypeConverter,
  type ParameterInfo,
} from "./ParameterTypeConverter";

/**
 * Extended step definition with parameter type information
 */
export interface ExtendedStepDefinition extends StepDefinition {
  parameterTypes: ParameterInfo[];
  regex: RegExp;
}

/**
 * Global registry for step definitions
 */
export class StepRegistry {
  private static instance: StepRegistry;
  private steps: ExtendedStepDefinition[] = [];

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
    // Extract parameter types and convert to regex if needed
    const parameterTypes = ParameterTypeConverter.extractParameterTypes(
      step.pattern,
    );

    const regex =
      typeof step.pattern === "string"
        ? ParameterTypeConverter.cucumberExpressionToRegex(step.pattern)
        : step.pattern;

    const extendedStep: ExtendedStepDefinition = {
      ...step,
      parameterTypes,
      regex,
    };

    this.steps.push(extendedStep);
  }

  /**
   * Find a step definition that matches the given text
   */
  public findMatch(
    type: StepType,
    text: string,
  ): { step: ExtendedStepDefinition; matches: RegExpMatchArray | null } | null {
    for (const step of this.steps) {
      // Skip if type doesn't match (except for And/But which inherit from previous)
      if (type !== "And" && type !== "But" && step.type !== type) {
        continue;
      }

      // Use the compiled regex for matching
      const matches = text.match(step.regex);
      if (matches) {
        return { step, matches };
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
  public getAll(): ExtendedStepDefinition[] {
    return [...this.steps];
  }
}
