/**
 * Commitlint configuration presets for Deepractice projects
 */
export const commitlint = {
  /**
   * Base configuration: Conventional commits with Deepractice rules
   */
  base: {
    extends: ["@commitlint/config-conventional"],
    rules: {
      // Type enum
      "type-enum": [
        2,
        "always",
        [
          "feat", // New feature
          "fix", // Bug fix
          "docs", // Documentation changes
          "style", // Code style changes (formatting, etc)
          "refactor", // Code refactoring
          "perf", // Performance improvements
          "test", // Adding or updating tests
          "build", // Build system or external dependencies
          "ci", // CI/CD changes
          "chore", // Other changes that don't modify src or test files
          "revert", // Revert a previous commit
        ],
      ],
      // Subject case (allow sentence-case, start-case, pascal-case, upper-case, lower-case)
      "subject-case": [0],
      // Header max length (entire commit message first line)
      "header-max-length": [2, "always", 100],
      // Body max line length
      "body-max-line-length": [2, "always", 200],
      // Footer max line length
      "footer-max-line-length": [2, "always", 200],
      // Require body for certain types
      "body-min-length": [0],
    },
  },
};
