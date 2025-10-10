/**
 * Prettier configuration presets for Deepractice projects
 */
export const prettier = {
  /**
   * Base configuration: Basic formatting rules
   */
  base: {
    // Basic formatting
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    useTabs: false,
    trailingComma: "es5" as const,

    // Line length
    printWidth: 80,

    // Spacing
    bracketSpacing: true,
    arrowParens: "always" as const,

    // End of line
    endOfLine: "lf" as const,

    // Prose wrapping
    proseWrap: "preserve" as const,

    // Quotes
    quoteProps: "as-needed" as const,
  },
};
