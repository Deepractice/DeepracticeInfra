import type { StepContext } from "~/types";

/**
 * Manages step context (this binding)
 */
export class ContextManager {
  private context: StepContext;

  constructor() {
    this.context = {};
  }

  /**
   * Get the context object
   */
  public getContext(): StepContext {
    return this.context;
  }

  /**
   * Reset the context
   */
  public reset(): void {
    this.context = {};
  }

  /**
   * Set a value in the context
   */
  public set(key: string, value: any): void {
    this.context[key] = value;
  }

  /**
   * Get a value from the context
   */
  public get(key: string): any {
    return this.context[key];
  }
}
