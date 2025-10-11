/**
 * Type of Gherkin step
 */
export type StepType = "Given" | "When" | "Then" | "And" | "But";

/**
 * Function that implements a step
 */
export type StepFunction = (this: any, ...args: any[]) => void | Promise<void>;

/**
 * A registered step definition
 */
export interface StepDefinition {
  /**
   * Type of step (Given/When/Then/And/But)
   */
  type: StepType;

  /**
   * Pattern to match step text (string or regex)
   */
  pattern: string | RegExp;

  /**
   * Implementation function
   */
  fn: StepFunction;
}
