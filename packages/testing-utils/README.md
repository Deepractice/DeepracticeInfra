# @deepracticex/testing-utils

Unified testing utilities for Deepractice Node.js projects with BDD support.

> This package wraps `@deepracticex/vitest-cucumber` and `@deepracticex/vitest-cucumber-plugin` to provide a single dependency for users.

## Features

- 🥒 **Cucumber/Gherkin BDD**: Write tests in natural language
- ⚡ **Vitest Integration**: Seamless integration with Vitest
- 📘 **Type-Safe**: Full TypeScript support
- 🎯 **Simple Setup**: Single dependency, unified API

## Installation

```bash
# Single dependency - includes vitest-cucumber runtime and plugin
pnpm add -D @deepracticex/testing-utils
```

## Quick Start

### 1. Configure Vitest

Use the pre-configured vitest config from `@deepracticex/config-preset`:

```typescript
// vitest.config.ts
import path from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import { vitest } from "@deepracticex/config-preset/vitest";

export default mergeConfig(
  vitest.withCucumber({
    steps: "tests/e2e/steps",
    verbose: true,
  }),
  defineConfig({
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
  }),
);
```

### 2. Write Feature Files

Create `.feature` files using Gherkin syntax:

```gherkin
# features/calculator.feature
Feature: Calculator
  Scenario: Add two numbers
    Given I have entered 50 into the calculator
    And I have entered 70 into the calculator
    When I press add
    Then the result should be 120
```

### 3. Define Steps

Create step definitions in `tests/e2e/steps/`:

```typescript
// tests/e2e/steps/calculator.steps.ts
import { Given, When, Then } from "@deepracticex/testing-utils";
import { expect } from "vitest";

Given("I have entered {int} into the calculator", function (num: number) {
  this.numbers = this.numbers || [];
  this.numbers.push(num);
});

When("I press add", function () {
  this.result = this.numbers.reduce((a, b) => a + b, 0);
});

Then("the result should be {int}", function (expected: number) {
  expect(this.result).toBe(expected);
});
```

### 4. Set Up Hooks (Optional)

Create hooks in `tests/e2e/support/hooks.ts`:

```typescript
// tests/e2e/support/hooks.ts
import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
} from "@deepracticex/testing-utils";
import { createWorld } from "./world.js";

// Register World factory
setWorldConstructor(createWorld);

BeforeAll(async function () {
  console.log("🥒 Starting tests");
});

Before(async function () {
  // Fresh context for each scenario
  if (this.clear) {
    this.clear();
  }
});

After(async function () {
  // Cleanup
});

AfterAll(async function () {
  console.log("✅ Tests completed");
});
```

### 5. Define World Context (Optional)

Create custom world context in `tests/e2e/support/world.ts`:

```typescript
// tests/e2e/support/world.ts
export interface MyWorld {
  numbers: number[];
  result: number;
  context: Record<string, any>;
  set(key: string, value: any): void;
  get(key: string): any;
  clear(): void;
}

export function createWorld(): MyWorld {
  const context: Record<string, any> = {};

  return {
    numbers: [],
    result: 0,
    context,
    set(key: string, value: any) {
      this.context[key] = value;
    },
    get(key: string) {
      return this.context[key];
    },
    clear() {
      this.context = {};
      this.numbers = [];
      this.result = 0;
    },
  };
}
```

### 6. Run Tests

```bash
pnpm test
```

## API Reference

### Step Definitions

```typescript
import { Given, When, Then } from "@deepracticex/testing-utils";

// Parameter types: {int}, {float}, {string}, {word}
Given("I have {int} items", function (count: number) {
  this.count = count;
});

When("I add {int} more", function (more: number) {
  this.count += more;
});

Then("I should have {int} items", function (expected: number) {
  expect(this.count).toBe(expected);
});
```

### Hooks

```typescript
import {
  Before,
  After,
  BeforeAll,
  AfterAll,
} from "@deepracticex/testing-utils";

BeforeAll(async function () {
  // Runs once before all scenarios in the feature
});

Before(async function () {
  // Runs before each scenario
});

After(async function () {
  // Runs after each scenario
});

AfterAll(async function () {
  // Runs once after all scenarios in the feature
});
```

### World Context

```typescript
import { setWorldConstructor } from "@deepracticex/testing-utils";

// Define your world interface
interface MyWorld {
  calculator: Calculator;
  result: number;
}

// Create world factory function
function createWorld(): MyWorld {
  return {
    calculator: new Calculator(),
    result: 0,
  };
}

// Register the world factory
setWorldConstructor(createWorld);

// Use in steps with proper typing
Given("...", function (this: MyWorld) {
  this.calculator.add(5);
});
```

### Data Tables

Handle tabular data in your steps:

```gherkin
Scenario: Multiple users
  Given the following users:
    | name  | email          | role  |
    | Alice | alice@test.com | admin |
    | Bob   | bob@test.com   | user  |
```

```typescript
import { Given, DataTable } from "@deepracticex/testing-utils";

Given("the following users:", function (table: DataTable) {
  // Get as array of objects (recommended)
  const users = table.hashes();
  // users = [
  //   { name: "Alice", email: "alice@test.com", role: "admin" },
  //   { name: "Bob", email: "bob@test.com", role: "user" }
  // ]

  users.forEach((user) => {
    console.log(user.name, user.email, user.role);
  });

  // Or get as raw 2D array
  const rows = table.raw();
  // rows = [
  //   ["name", "email", "role"],
  //   ["Alice", "alice@test.com", "admin"],
  //   ["Bob", "bob@test.com", "user"]
  // ]
});
```

### Doc Strings

Handle multi-line text data:

```gherkin
Scenario: Process JSON
  Given I have the following JSON:
    """json
    {
      "name": "Test",
      "value": 42
    }
    """
```

```typescript
Given("I have the following JSON:", function (docString: string) {
  this.data = JSON.parse(docString);
});
```

### Exported APIs

**Step Definition Functions:**

- `Given(pattern, implementation)` - Define preconditions
- `When(pattern, implementation)` - Define actions
- `Then(pattern, implementation)` - Define assertions

**Lifecycle Hooks:**

- `BeforeAll(hook)` - Run once before all scenarios
- `Before(hook)` - Run before each scenario
- `After(hook)` - Run after each scenario
- `AfterAll(hook)` - Run once after all scenarios

**Configuration:**

- `setWorldConstructor(factory)` - Register world factory function

**Data Structures:**

- `DataTable` - Handle table data with `.hashes()` and `.raw()` methods

**Runtime APIs (for advanced usage):**

- `StepExecutor` - Internal step execution engine
- `ContextManager` - Manage test context
- `HookRegistry` - Hook registration and execution

## Architecture

This package serves as a **wrapper** that combines:

- **`@deepracticex/vitest-cucumber`** - Runtime API (Given/When/Then, hooks, DataTable)
- **`@deepracticex/vitest-cucumber-plugin`** - Vitest plugin for transforming `.feature` files

Users only need to install `@deepracticex/testing-utils` as a single dependency. The vitest-cucumber plugin is configured via `@deepracticex/config-preset/vitest` to use this package as the runtime module, ensuring all imports resolve correctly.

## Best Practices

### 1. Organize Files by Domain

```
tests/
├── e2e/
│   ├── steps/
│   │   ├── auth.steps.ts       # Authentication steps
│   │   ├── user.steps.ts       # User management steps
│   │   └── common.steps.ts     # Common/shared steps
│   └── support/
│       ├── world.ts            # World interface and factory
│       └── hooks.ts            # Global hooks
└── features/
    ├── auth.feature
    └── user.feature
```

### 2. Use TypeScript for Type Safety

Always type your world context:

```typescript
interface MyWorld {
  user?: User;
  token?: string;
}

Given("a user with email {string}", function (this: MyWorld, email: string) {
  // TypeScript provides autocomplete and type checking
  this.user = { email };
});
```

### 3. Keep Steps Reusable

Write generic steps that can be used across multiple scenarios:

```typescript
// ✅ Good: Reusable and flexible
Given("I am logged in as {string}", function (role: string) {
  this.token = loginAs(role);
});

// ❌ Avoid: Too specific
Given("I am logged in as an admin user with full permissions", function () {
  this.token = loginAs("admin");
});
```

### 4. Use Background for Common Setup

```gherkin
Feature: User Management

  Background:
    Given I have the error factory imported

  Scenario: Create user
    When I create a user
    Then the user should be created
```

### 5. Leverage Data Tables

For multiple similar test cases, use Scenario Outlines with Examples:

```gherkin
Scenario Outline: Validate HTTP errors
  When I create a "<errorType>" error
  Then the error status code should be <statusCode>

  Examples:
    | errorType    | statusCode |
    | notFound     | 404        |
    | unauthorized | 401        |
    | forbidden    | 403        |
```

### 6. World Factory Pattern

Always use a factory function, not a class:

```typescript
// ✅ Correct
export function createWorld(): MyWorld {
  return {
    count: 0,
    items: [],
  };
}

// ❌ Wrong - don't use classes
class MyWorld {
  count = 0;
  items = [];
}
```

## License

MIT © Deepractice
