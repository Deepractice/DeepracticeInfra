/**
 * Cucumber configuration for @deepracticex/logger
 */

const baseConfig = require("../../cucumber.base.cjs");

module.exports = {
  default: {
    ...baseConfig,
    paths: ["features/**/*.feature"],
    import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
  },
};
