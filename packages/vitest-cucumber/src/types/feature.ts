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
  dataTable?: DataTable;

  /**
   * Optional doc string attached to step
   */
  docString?: DocString;
}

/**
 * Data table for a step
 */
export interface DataTable {
  /**
   * Rows of the data table
   */
  rows: string[][];
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
   * Scenarios in the feature
   */
  scenarios: Scenario[];

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
