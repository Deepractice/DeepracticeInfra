# @deepracticex/config-preset

Unified configuration system for Deepractice Node.js projects. Provides standardized, pre-configured setups for ESLint, Prettier, TypeScript, Commitlint, Vitest, and tsup.

## Features

- **Zero Config**: Works out-of-the-box with sensible defaults
- **Consistent Standards**: Ensures all projects follow the same conventions
- **Type-Safe**: Full TypeScript support with IntelliSense
- **Extensible**: Factory methods for customization when needed
- **Monorepo-Friendly**: Designed for pnpm workspaces

## Installation

```bash
pnpm add -D @deepracticex/config-preset
```

### Peer Dependencies

Install the tools you need:

```bash
# For ESLint
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-prettier

# For Prettier
pnpm add -D prettier

# For TypeScript
pnpm add -D typescript

# For Vitest
pnpm add -D vitest

# For tsup
pnpm add -D tsup
```

## Usage

### ESLint Configuration

Create `eslint.config.js`:

```javascript
import { eslint } from "@deepracticex/config-preset";

export default eslint.base;
```

**What's included:**

- TypeScript support with `@typescript-eslint`
- Prettier integration
- Recommended rules for Node.js projects
- Ignores: `dist/`, `node_modules/`, `coverage/`

### Prettier Configuration

Create `.prettierrc.js`:

```javascript
import { prettier } from "@deepracticex/config-preset";

export default prettier.base;
```

**Formatting rules:**

- 2 spaces indentation
- Double quotes
- Semicolons enabled
- 80 character line width
- ES5 trailing commas
- LF line endings

### TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "extends": "@deepracticex/config-preset/typescript-base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**What's included:**

- Target: ES2022
- Module: ESNext with Bundler resolution
- Strict type checking enabled
- Source maps and declarations
- Vitest globals types

### Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { vitest } from "@deepracticex/config-preset";

export default vitest.base;
```

**What's included:**

- Unit tests: `tests/unit/**/*.test.ts`
- E2E tests: `tests/e2e/**/*.test.ts`
- Coverage reporting with v8
- 30s timeout for E2E tests

#### BDD Testing with Cucumber

For Cucumber/Gherkin BDD testing, install the separate testing utilities package:

```bash
pnpm add -D @deepracticex/testing-utils
```

```typescript
import {
  Given,
  When,
  Then,
  Before,
  After,
} from "@deepracticex/testing-utils/bdd";

Before(async function () {
  // Setup before each scenario
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

See [@deepracticex/testing-utils](../testing-utils/README.md) for complete documentation.

### tsup Configuration

Create `tsup.config.ts`:

```typescript
import { tsup } from "@deepracticex/config-preset";

export default tsup.base;
```

**What's included:**

- Dual format: ESM + CommonJS
- TypeScript declarations
- Source maps
- Path alias: `~` → `./src`
- Clean output before build

#### Custom Build Configuration

```typescript
import { tsup } from "@deepracticex/config-preset";

export default tsup.createConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  external: ["vitest"],
});
```

### Commitlint Configuration

Create `commitlint.config.js`:

```javascript
import { commitlint } from "@deepracticex/config-preset";

export default commitlint.base;
```

**Commit types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or external dependencies
- `ci`: CI/CD changes
- `chore`: Other changes
- `revert`: Revert a previous commit

**Format:**

```
<type>: <subject>

<body>

<footer>
```

## Best Practices

### Project Structure

Follow this standard structure:

```
your-project/
├── features/                    # BDD specifications (Gherkin)
│   └── *.feature
├── src/                        # Source code
│   ├── api/                    # Public API
│   ├── core/                   # Internal implementation
│   ├── types/                  # Type definitions
│   └── index.ts
├── tests/
│   ├── unit/                   # Unit tests
│   │   └── *.test.ts
│   └── e2e/                    # End-to-end tests
│       ├── steps/              # Cucumber step definitions
│       │   └── *.steps.ts
│       └── *.test.ts
├── dist/                       # Build output
├── eslint.config.js
├── .prettierrc.js
├── tsconfig.json
├── vitest.config.ts
├── tsup.config.ts
└── package.json
```

### Package Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:dev": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "clean": "rimraf dist"
  }
}
```

### Writing Feature Files

Use Gherkin syntax for BDD specifications:

```gherkin
Feature: User Authentication

  Scenario: Successful login
    Given a user with email "test@example.com" and password "secret123"
    When the user attempts to login
    Then the login should succeed
    And a session token should be returned

  Scenario: Failed login with wrong password
    Given a user with email "test@example.com" and password "wrong"
    When the user attempts to login
    Then the login should fail
    And an error message should be shown
```

### Writing Step Definitions

Organize steps by domain:

For BDD step definitions, use `@deepracticex/testing-utils`:

```typescript
// tests/e2e/steps/auth.steps.ts
import { Given, When, Then } from "@deepracticex/testing-utils/bdd";
import { expect } from "vitest";

Given(
  "a user with email {string} and password {string}",
  async function (email: string, password: string) {
    this.user = { email, password };
  },
);

When("the user attempts to login", async function () {
  this.result = await login(this.user);
});

Then("the login should succeed", async function () {
  expect(this.result.success).toBe(true);
});
```

See [@deepracticex/testing-utils](../testing-utils/README.md) for complete BDD documentation.

### Path Aliases

Use the `~` alias for internal imports:

```typescript
// Instead of:
import { foo } from "../../core/foo";

// Use:
import { foo } from "~/core/foo";
```

The `~` alias is automatically configured in:

- tsup (build-time)
- TypeScript (type-checking)
- Add to Vitest config if needed

### Layered Architecture

Follow the API/Core separation pattern:

- **`src/api/`**: Public API that users import
- **`src/core/`**: Internal implementation (not exported)
- **`src/types/`**: Public type definitions
- **`src/index.ts`**: Main entry point (exports api + types, not core)

This allows you to refactor internals without breaking user code.

## Package Exports

The package provides multiple entry points:

```typescript
// Main entry - all configurations
import {
  eslint,
  prettier,
  typescript,
  vitest,
  tsup,
  commitlint,
} from "@deepracticex/config-preset";

// Specific tools (subpath imports)
import { vitest } from "@deepracticex/config-preset/vitest";
import { eslint } from "@deepracticex/config-preset/eslint";

// BDD testing utilities (separate package)
// import { Given, When, Then } from "@deepracticex/testing-utils/bdd";
```

## TypeScript Support

All configurations are fully typed:

```typescript
import { vitest, type VitestPreset } from "@deepracticex/config-preset";

const preset: VitestPreset = "base"; // "base" | "coverage"
```

## Migration Guide

### From Custom Configs

Replace your existing config files:

**Before:**

```javascript
// eslint.config.js - 50+ lines of configuration
export default [
  // ... complex setup
];
```

**After:**

```javascript
// eslint.config.js - 3 lines
import { eslint } from "@deepracticex/config-preset";
export default eslint.base;
```

### Adding BDD Testing

For Cucumber/Gherkin BDD testing:

1. Install testing utilities:

```bash
pnpm add -D @deepracticex/testing-utils
```

2. Create feature files in `features/` directory
3. Write step definitions using `@deepracticex/testing-utils/bdd`

See [@deepracticex/testing-utils](../testing-utils/README.md) for detailed setup instructions.

## Troubleshooting

### ESLint Not Finding Config

Make sure you're using the new flat config format (eslint.config.js), not the legacy `.eslintrc`.

### TypeScript Can't Find Types

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

### Path Alias Not Working

For Vitest, add to `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## License

MIT © Deepractice
