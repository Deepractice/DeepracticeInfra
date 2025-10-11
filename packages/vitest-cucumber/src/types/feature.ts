/**
 * A single step in a scenario
 */
export interface Step {
  /**
   * Step keyword (Given/When/Then/And/But)
   */
  keyword: string;

  /**
   * Step text without keyword
   */
  text: string;

  /**
   * Optional data table attached to step
   */
  dataTable?: import("../core/runtime/DataTable").DataTable;

  /**
   * Optional doc string attached to step
   */
  docString?: DocString;
}

/**
 * Doc string for a step
 */
export interface DocString {
  /**
   * Content type (optional)
   */
  contentType?: string;

  /**
   * Content of the doc string
   */
  content: string;
}

/**
 * Background steps that run before each scenario
 */
export interface Background {
  /**
   * Steps to execute before each scenario
   */
  steps: Step[];
}

/**
 * Examples table for Scenario Outline
 */
export interface Examples {
  /**
   * Table headers (parameter names)
   */
  headers: string[];

  /**
   * Data rows (each row is a test case)
   */
  rows: string[][];
}

/**
 * A scenario within a feature
 */
export interface Scenario {
  /**
   * Scenario name
   */
  name: string;

  /**
   * Steps in the scenario
   */
  steps: Step[];

  /**
   * Optional tags
   */
  tags?: string[];

  /**
   * Indicates if this is a Scenario Outline
   */
  isOutline?: boolean;

  /**
   * Examples for Scenario Outline
   */
  examples?: Examples[];
}

/**
 * Rule groups related scenarios
 */
export interface Rule {
  /**
   * Rule name
   */
  name: string;

  /**
   * Scenarios within the rule
   */
  scenarios: Scenario[];

  /**
   * Optional background for the rule
   */
  background?: Background;

  /**
   * Optional tags
   */
  tags?: string[];
}

/**
 * A feature file representation
 */
export interface Feature {
  /**
   * Feature name
   */
  name: string;

  /**
   * Feature description
   */
  description?: string;

  /**
   * Background steps that run before each scenario
   */
  background?: Background;

  /**
   * Scenarios in the feature
   */
  scenarios: Scenario[];

  /**
   * Rules in the feature
   */
  rules?: Rule[];

  /**
   * Optional tags
   */
  tags?: string[];
}

/**
 * Context object passed to step functions
 */
export interface StepContext {
  /**
   * Store arbitrary data between steps
   */
  [key: string]: any;
}
