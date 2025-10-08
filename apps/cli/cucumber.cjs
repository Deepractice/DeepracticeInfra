/**
 * Cucumber configuration for @deepracticex/nodespec-cli
 */

const { createConfig } = require("@deepracticex/cucumber-config");

module.exports = createConfig({
  paths: ["features/**/*.feature"],
  import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
});
