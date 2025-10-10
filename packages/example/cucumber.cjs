/**
 * Cucumber configuration for @deepracticex/template
 */

const baseConfig = require("@deepracticex/cucumber-config");

module.exports = {
  default: {
    ...baseConfig,
    paths: ["features/**/*.feature"],
    import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
  },
};
