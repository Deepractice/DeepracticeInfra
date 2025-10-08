/**
 * Shared Cucumber base configuration for all packages
 * Each package extends this with package-specific settings
 */

const baseConfig = {
  // Common format options
  formatOptions: {
    snippetInterface: "async-await",
  },

  // TypeScript support - tsx is loaded via NODE_OPTIONS='--import tsx' in package.json scripts

  // Common format reporters
  format: [
    "progress-bar",
    "html:tests/reports/cucumber-report.html",
    "json:tests/reports/cucumber-report.json",
    "@cucumber/pretty-formatter",
  ],

  // Parallel execution (can be overridden per package)
  parallel: 2,

  // Publish results
  publish: false,

  // Retry failed scenarios
  retry: 0,

  // Profiles
  profiles: {
    // Development profile
    dev: {
      format: ["@cucumber/pretty-formatter"],
      parallel: 1,
      failFast: true,
    },

    // CI profile
    ci: {
      format: ["progress", "json:tests/reports/cucumber-report.json"],
      parallel: 4,
      retry: 1,
    },
  },
};

/**
 * Helper function to create cucumber configuration with proper profile structure
 * @param {Object} options - Configuration options
 * @param {string[]} options.paths - Feature file paths (e.g., ["features/**\/*.feature"])
 * @param {string[]} options.import - Step definition and support file paths (e.g., ["tests/e2e/**\/*.ts"])
 * @param {Object} options.overrides - Additional config to override base settings
 * @returns {Object} Complete cucumber configuration with profiles
 *
 * @example
 * const { createConfig } = require("@deepracticex/cucumber-config");
 *
 * module.exports = createConfig({
 *   paths: ["features/**\/*.feature"],
 *   import: ["tests/e2e/**\/*.steps.ts", "tests/e2e/support/**\/*.ts"],
 * });
 */
function createConfig(options = {}) {
  const { paths = [], import: importPaths = [], overrides = {} } = options;

  // Create default profile
  const defaultProfile = {
    ...baseConfig,
    ...overrides,
    paths,
    import: importPaths,
  };

  // Create dev profile
  const devProfile = {
    ...baseConfig.profiles.dev,
    ...overrides,
    paths,
    import: importPaths,
  };

  // Create ci profile
  const ciProfile = {
    ...baseConfig.profiles.ci,
    ...overrides,
    paths,
    import: importPaths,
  };

  return {
    default: defaultProfile,
    dev: devProfile,
    ci: ciProfile,
  };
}

module.exports = baseConfig;
module.exports.createConfig = createConfig;
