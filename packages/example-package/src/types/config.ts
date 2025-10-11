/**
 * Configuration types
 * Define configuration interfaces that users need to provide
 */
export interface ExampleConfig {
  /**
   * Enable feature
   * @default true
   */
  enabled?: boolean;

  /**
   * Timeout in milliseconds
   * @default 5000
   */
  timeout?: number;

  /**
   * Debug mode
   * @default false
   */
  debug?: boolean;
}
