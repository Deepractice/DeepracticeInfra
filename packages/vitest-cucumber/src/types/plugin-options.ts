/**
 * Configuration options for the Vitest Cucumber plugin
 */
export interface VitestCucumberPluginOptions {
  /**
   * Glob patterns to match feature files
   * @default ['**\/*.feature']
   */
  features?: string[];

  /**
   * Directory containing step definitions
   * @default 'tests/steps'
   */
  steps?: string;

  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean;
}
