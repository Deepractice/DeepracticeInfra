/**
 * Public interface that users interact with
 * This is the main contract of your package
 */
export interface Example {
  /**
   * Execute the main functionality
   */
  execute: (input: string) => Promise<string>;

  /**
   * Get current status
   */
  status: () => string;

  /**
   * Clean up resources
   */
  dispose: () => void;
}

/**
 * Result type for operations
 */
export type ExampleResult = {
  success: boolean;
  data?: string;
  error?: string;
};
