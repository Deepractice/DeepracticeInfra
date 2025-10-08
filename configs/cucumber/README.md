# @deepracticex/cucumber-config

Shared Cucumber/BDD configuration for Deepractice projects.

## Installation

```bash
pnpm add -D @deepracticex/cucumber-config @cucumber/cucumber @cucumber/pretty-formatter
```

## Usage

### Basic Usage

```javascript
// cucumber.cjs
const baseConfig = require("@deepracticex/cucumber-config");

module.exports = {
  default: {
    ...baseConfig,
    paths: ["features/**/*.feature"],
    import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
  },
};
```

### Custom Configuration

```javascript
// cucumber.cjs
const baseConfig = require("@deepracticex/cucumber-config");

module.exports = {
  default: {
    ...baseConfig,
    paths: ["features/**/*.feature"],
    import: ["tests/e2e/**/*.steps.ts", "tests/e2e/support/**/*.ts"],
    parallel: 4, // Override parallel workers
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
