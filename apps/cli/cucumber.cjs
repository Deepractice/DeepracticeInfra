/**
 * Cucumber configuration for @deepracticex/nodespec-cli
 */

const { createConfig } = require("@deepracticex/cucumber-config");

const config = createConfig({
  paths: ["features/**/*.feature"],
  import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
  timeout: 60000, // 60 seconds for steps that run pnpm install
});

// Add tag expression to skip @skip scenarios
config.default.tags = "not @skip";
if (config.dev) config.dev.tags = "not @skip";
if (config.ci) config.ci.tags = "not @skip";

module.exports = config;
