/**
 * Cucumber configuration for @deepracticex/error-handling
 */

const baseConfig = require('../../cucumber.base.cjs')

module.exports = {
  default: {
    ...baseConfig,
    // Feature files location
    paths: ['features/**/*.feature'],
    // Step definitions (use import for ES modules)
    import: ['tests/e2e/**/*.steps.ts', 'tests/e2e/support/**/*.ts'],
  },
}
