# @deepracticex/cucumber-config

Shared Cucumber/BDD configuration for Deepractice projects.

## Installation

```bash
pnpm add -D @deepracticex/cucumber-config @cucumber/cucumber @cucumber/pretty-formatter
```

## Usage

### Simple Usage (Recommended)

Use the `createConfig` helper function for easy setup:

```javascript
// cucumber.cjs
const { createConfig } = require("@deepracticex/cucumber-config");

module.exports = createConfig({
  paths: ["features/**/*.feature"],
  import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
});
```

This automatically creates `default`, `dev`, and `ci` profiles with proper structure.

### With Custom Overrides

```javascript
// cucumber.cjs
const { createConfig } = require("@deepracticex/cucumber-config");

module.exports = createConfig({
  paths: ["features/**/*.feature"],
  import: ["tests/e2e/**/*.ts"],
  overrides: {
    parallel: 4, // Override parallel workers
    retry: 2, // Override retry count
  },
});
```

### Advanced Usage (Manual Profile Setup)

For custom configuration, you can manually structure profiles:

```javascript
// cucumber.cjs
const baseConfig = require("@deepracticex/cucumber-config");

module.exports = {
  default: {
    ...baseConfig,
    paths: ["features/**/*.feature"],
    import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
  },
  dev: {
    ...baseConfig.profiles.dev,
    paths: ["features/**/*.feature"],
    import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
  },
  ci: {
    ...baseConfig.profiles.ci,
    paths: ["features/**/*.feature"],
    import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
  },
};
```

### Test Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "test": "NODE_OPTIONS='--import tsx' cucumber-js",
    "test:dev": "NODE_OPTIONS='--import tsx' cucumber-js --profile dev",
    "test:ci": "NODE_OPTIONS='--import tsx' cucumber-js --profile ci"
  }
}
```

## Features

- ✅ TypeScript support via tsx
- ✅ Async/await step definitions
- ✅ Multiple format reporters
- ✅ Parallel execution
- ✅ Dev and CI profiles
- ✅ HTML and JSON reports
- ✅ **Helper function to avoid profile configuration pitfalls**

## Profiles

### Default Profile

- Uses all formatters (progress-bar, HTML, JSON, pretty)
- Parallel execution (2 workers)
- No retry

### Dev Profile

- Pretty formatter only
- Single worker
- Fail fast mode

### CI Profile

- Progress and JSON formatters
- 4 parallel workers
- 1 retry for flaky tests

## Running Tests

```bash
# Use default profile
pnpm test

# Use dev profile
pnpm test:dev

# Use ci profile
pnpm test:ci
```

## API

### `createConfig(options)`

Helper function to create cucumber configuration with proper profile structure.

**Parameters:**

- `options.paths` (string[]): Feature file paths (e.g., `["features/**/*.feature"]`)
- `options.import` (string[]): Step definition and support file paths (e.g., `["tests/e2e/**/*.ts"]`)
- `options.overrides` (Object, optional): Additional config to override base settings

**Returns:** Complete cucumber configuration with `default`, `dev`, and `ci` profiles.

**Example:**

```javascript
const { createConfig } = require("@deepracticex/cucumber-config");

module.exports = createConfig({
  paths: ["features/**/*.feature"],
  import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
});
```

## Peer Dependencies

- `@cucumber/cucumber`: ^11.0.0
- `@cucumber/pretty-formatter`: ^1.0.0
- `chai`: ^5.0.0
- `@types/chai`: ^5.0.0
- `tsx`: ^4.0.0
