/**
 * Logger configuration interface
 */
export interface LoggerConfig {
  /**
   * Log level threshold
   * @default "info"
   */
  level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";

  /**
   * Enable console output
   * @default true
   */
  console?: boolean;

  /**
   * File logging configuration
   * @default { dirname: "~/.deepractice/logs" }
   */
  file?:
    | boolean
    | {
        dirname?: string;
      };

  /**
   * Enable colored output
   * @default true
   */
  colors?: boolean;

  /**
   * Package/service name for identification
   * @default "app"
   */
  name?: string;
}
