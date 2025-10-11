# @deepracticex/testing-utils

Testing utility functions for Deepractice Node.js projects.

## Features

- **Cucumber/Gherkin BDD**: Step definitions and hooks for Vitest
- **Type-Safe**: Full TypeScript support
- **Simple API**: Clean re-exports from vitest-cucumber

## Installation

```bash
pnpm add -D @deepracticex/testing-utils
```

### Peer Dependencies

```bash
pnpm add -D vitest @deepracticex/vitest-cucumber
```

## Usage

### BDD Testing with Cucumber

```typescript
import {
  Given,
  When,
  Then,
  Before,
  After,
} from "@deepracticex/testing-utils/cucumber";
import { expect } from "vitest";

Before(async function () {
  // Setup before each scenario
  this.count = 0;
});

Given("I have {int} cucumbers", async function (count: number) {
  this.count = count;
});

When("I eat {int} cucumbers", async function (count: number) {
  this.count -= count;
});

Then("I should have {int} cucumbers", async function (expected: number) {
  expect(this.count).toBe(expected);
});

After(async function () {
  // Cleanup after each scenario
});
```

### Available Functions

**Step Definitions:**

- `Given(pattern, implementation)` - Define preconditions
- `When(pattern, implementation)` - Define actions
- `Then(pattern, implementation)` - Define assertions

**Hooks:**

- `Before(hook)` - Run before each scenario
- `After(hook)` - Run after each scenario
- `BeforeAll(hook)` - Run before all scenarios
- `AfterAll(hook)` - Run after all scenarios

**Configuration:**

- `setWorldConstructor(class)` - Set custom world/context object

### Custom World Constructor

```typescript
import { setWorldConstructor } from "@deepracticex/testing-utils/cucumber";

class CustomWorld {
  public count = 0;
  public name = "";
}

setWorldConstructor(CustomWorld);
```

## Best Practices

### Organize Steps by Domain

```
tests/e2e/steps/
├── auth.steps.ts      # Authentication steps
├── user.steps.ts      # User management steps
└── common.steps.ts    # Common/shared steps
```

### Use TypeScript for Type Safety

```typescript
Given("a user with email {string}", async function (email: string) {
  // TypeScript ensures type safety
  this.email = email;
});
```

### Keep Steps Reusable

Write steps that can be used across multiple scenarios:

```typescript
// Good: Reusable
Given("I am logged in as {string}", async function (role: string) {
  await this.login(role);
});

// Less ideal: Too specific
Given(
  "I am logged in as an admin user with full permissions",
  async function () {
    await this.login("admin");
  },
);
```

## License

MIT © Deepractice
