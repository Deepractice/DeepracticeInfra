/**
 * Shared Cucumber base configuration for all packages
 * Each package extends this with package-specific settings
 */

module.exports = {
  // Common format options
  formatOptions: {
    snippetInterface: 'async-await',
  },

  // TypeScript support for ES modules
  requireModule: ['ts-node/register/transpile-only'],
  loader: ['ts-node/esm'],

  // Common format reporters
  format: [
    'progress-bar',
    'html:tests/reports/cucumber-report.html',
    'json:tests/reports/cucumber-report.json',
    '@cucumber/pretty-formatter',
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
      format: ['@cucumber/pretty-formatter'],
      parallel: 1,
      failFast: true,
    },

    // CI profile
    ci: {
      format: [
        'progress',
        'json:tests/reports/cucumber-report.json',
      ],
      parallel: 4,
      retry: 1,
    },
  },
}
