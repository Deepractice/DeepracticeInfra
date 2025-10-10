# @deepracticex/vitest-cucumber

Integration layer to run Cucumber features as Vitest tests.

## Features

- Run Cucumber features within Vitest test runner
- Full Gherkin 6 syntax support (via native CucumberJS)
- TypeScript support with tsx runtime
- Automatic feature discovery
- Detailed error reporting

## Installation

```bash
pnpm add -D @deepracticex/vitest-cucumber @cucumber/cucumber vitest
```

## Usage

### Basic Setup

Create a test file that generates Vitest tests from your Cucumber features:

```typescript
// tests/e2e/cucumber.test.ts
import { generateCucumberTests } from "@deepracticex/vitest-cucumber";

await generateCucumberTests({
  featureGlob: "features/**/*.feature",
  stepGlob: "tests/e2e/steps/**/*.ts",
});
```

### Configuration Options

```typescript
interface CucumberRunnerOptions {
  featureGlob: string; // Glob pattern for feature files
  stepGlob: string; // Glob pattern for step definitions
  formatOptions?: string[]; // Optional Cucumber format options
}
```

### Example with Custom Formatting

```typescript
await generateCucumberTests({
  featureGlob: "features/**/*.feature",
  stepGlob: "tests/e2e/steps/**/*.ts",
  formatOptions: [
    "json:reports/cucumber-report.json",
    "html:reports/cucumber-report.html",
  ],
});
```

## How It Works

1. **Discovery**: Scans for feature files using the provided glob pattern
2. **Generation**: Creates a Vitest `describe` block for each feature
3. **Execution**: Runs Cucumber for each feature as a child process
4. **Reporting**: Reports success/failure through Vitest's test runner

## Architecture

```
src/
├── api/          # Public API (generateCucumberTests)
├── core/         # Internal implementation
│   ├── runner.ts    # Cucumber execution logic
│   └── discovery.ts # Feature file discovery
└── types/        # TypeScript type definitions
```

## Best Practices

### Avoid Special Character Issues

When step text contains special regex characters (like `/`, `.`, `*`, etc.), use parameterized steps instead of literal strings:

❌ **Avoid:**

```gherkin
Given I have installed @deepracticex/configurer
```

```typescript
Given("I have installed @deepracticex/configurer", function () {
  // This will fail! '/' needs escaping in regex
});
```

✅ **Better:**

```gherkin
Given I have installed "@deepracticex/configurer"
```

```typescript
Given("I have installed {string}", function (packageName: string) {
  expect(packageName).to.equal("@deepracticex/configurer");
});
```

The runner will detect this common mistake and provide helpful warnings.

## Requirements

- Node.js >= 18
- Vitest >= 2.0
- @cucumber/cucumber >= 11.0
- tsx (for TypeScript step definitions)

## License

MIT
