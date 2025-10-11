# NodeSpec Packages

**Modern Node.js development infrastructure for Deepractice projects**

This directory contains a collection of standardized, production-ready packages that provide unified solutions for common Node.js development needs.

## Overview

NodeSpec packages follow a consistent architecture and development methodology:

- **Layered Architecture**: API/Types/Core separation for clean boundaries
- **Type Safety**: Full TypeScript support with strict typing
- **BDD Testing**: Behavior-driven development with Cucumber/Gherkin
- **Unified Standards**: Consistent coding conventions across all packages
- **Framework Agnostic**: Work with Express, Hono, or any Node.js framework

## Available Packages

### Core Infrastructure

#### [@deepracticex/error-handling](./error-handling)

Unified error handling system with type-safe error classes and framework integrations.

**Key Features:**

- Type-safe HTTP and business error classes
- Express and Hono middleware
- Result type for functional error handling
- JSON serialization for APIs

**Quick Example:**

```typescript
import { errors } from "@deepracticex/error-handling";

if (!user) {
  throw errors.notFound("User", userId);
}
```

#### [@deepracticex/logger](./logger)

Production-ready logging system built on Pino.

**Key Features:**

- Console output with pretty print
- Automatic file rotation
- Caller location tracking
- MCP and Electron compatible

**Quick Example:**

```typescript
import { info, error } from "@deepracticex/logger";

info("Server started");
error("Connection failed", { host, port });
```

### Development Tools

#### [@deepracticex/config-preset](./config-preset)

Zero-config presets for all your development tools.

**Key Features:**

- ESLint, Prettier, TypeScript configurations
- Vitest testing setup
- tsup build configuration
- Commitlint conventions

**Quick Example:**

```typescript
// eslint.config.js
import { eslint } from "@deepracticex/config-preset/eslint";
export default eslint.base;
```

#### [@deepracticex/testing-utils](./testing-utils)

BDD testing utilities with Cucumber/Gherkin support.

**Key Features:**

- Write tests in natural language
- Seamless Vitest integration
- Type-safe step definitions
- World context management

**Quick Example:**

```typescript
import { Given, When, Then } from "@deepracticex/testing-utils";

Given("I have {int} items", function (count: number) {
  this.count = count;
});
```

### Standards & Examples

#### [@deepracticex/example-package](./example-package)

Reference implementation demonstrating all NodeSpec standards and best practices.

**Use this as a template when creating new packages.**

## Quick Start

### Installation

```bash
# Install individual packages as needed
pnpm add @deepracticex/error-handling
pnpm add @deepracticex/logger

# Development tools
pnpm add -D @deepracticex/config-preset
pnpm add -D @deepracticex/testing-utils
```

### Creating a New Package

```bash
# 1. Copy the example
cp -r packages/example-package packages/your-package

# 2. Update package.json (name, description)
cd packages/your-package

# 3. Install dependencies from monorepo root
cd ../..
pnpm install

# 4. Start development
cd packages/your-package
pnpm dev
```

## Architecture Standards

All NodeSpec packages follow a three-layer architecture:

```
src/
├── api/          # Public API - what users import
│   ├── *.ts
│   └── index.ts
├── types/        # Type definitions - exported to users
│   ├── *.ts
│   └── index.ts
└── core/         # Internal implementation - NOT exported
    ├── *.ts
    └── index.ts
```

### Layer Responsibilities

**`api/`** - Public API Layer

- User-facing classes and functions
- Stable interface requiring careful versioning
- Example: `Logger`, `createLogger()`, factory functions

**`types/`** - Type Definition Layer

- TypeScript interfaces and types for users
- Configuration interfaces
- Public type exports

**`core/`** - Internal Implementation Layer

- Hidden from users, freely refactorable
- Third-party library adapters
- Internal utilities and logic

### Benefits

✅ Clear API boundaries
✅ Safe refactoring of internals
✅ Better testability
✅ Type safety

## Development Standards

### Path Aliases

```typescript
// Internal imports within src/ - use ~ alias
import { Processor } from "~/core/processor";
import type { Config } from "~/types/config";

// Test imports from tests/ - use @ alias
import { createExample } from "@/index";
```

### Naming Conventions

**Interface-first naming** (NOT Hungarian notation):

```typescript
// ✅ Correct
export interface Logger {}
export class PinoLogger implements Logger {}

// ❌ Wrong
export interface ILogger {}
export class Logger implements ILogger {}
```

### Testing Approach

BDD with Cucumber/Gherkin for all packages:

1. Write feature files in `features/`
2. Define steps in `tests/e2e/steps/`
3. Run with Vitest

```gherkin
Feature: Error Handling

  Scenario: Create not found error
    Given I have the error factory
    When I create a not found error for "User" with id "123"
    Then the error status code should be 404
```

## Common Tasks

### Add a New Public Function

1. Implement in `core/` (if complex logic needed)
2. Create wrapper in `api/`
3. Export from `api/index.ts`
4. Export from `src/index.ts`
5. Write BDD scenario
6. Implement step definition

### Add a New Type

1. Define in `types/*.ts`
2. Export from `types/index.ts`
3. Export as type-only from `src/index.ts`

### Refactor Internal Code

1. Change anything in `core/` freely
2. Keep `api/` interface stable
3. Run tests to verify

## Best Practices

### DO ✅

- Follow layered architecture (api/types/core)
- Use `~` alias for internal imports
- Use interface-first naming
- Write BDD scenarios before implementation
- Export only API and types (not core)
- Generate proper TypeScript definitions

### DON'T ❌

- Export from `core/` layer
- Use Hungarian notation (ILogger, TConfig)
- Use relative paths for internal imports
- Skip BDD test scenarios
- Include `.js` extensions (with Bundler resolution)

## Package Scripts

Standard scripts available in all packages:

```json
{
  "build": "tsup",
  "dev": "tsup --watch",
  "test": "vitest run",
  "test:dev": "vitest",
  "typecheck": "tsc --noEmit",
  "clean": "rimraf dist"
}
```

## Dependency Management

All tooling dependencies are managed in the root `package.json`. Sub-packages only declare runtime dependencies. This ensures:

- Absolute version consistency
- Simplified maintenance
- Faster installs via hoisting

Available tools (auto-hoisted):

- TypeScript, tsup, tsx, rimraf
- Cucumber, Vitest, Chai
- Prettier, Lefthook
- All `@deepracticex/*` config packages

## Integration Examples

### Complete Error Handling + Logging

```typescript
import {
  createExpressErrorHandler,
  errors,
} from "@deepracticex/error-handling";
import { error as logError } from "@deepracticex/logger";

app.get("/users/:id", async (req, res) => {
  const user = await findUser(req.params.id);
  if (!user) {
    throw errors.notFound("User", req.params.id);
  }
  res.json(user);
});

app.use(
  createExpressErrorHandler({
    logger: logError,
    includeStack: process.env.NODE_ENV === "development",
  }),
);
```

### Standard Development Setup

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

// eslint.config.js
import { eslint } from "@deepracticex/config-preset/eslint";
export default eslint.base;

// prettier.config.js
import { prettier } from "@deepracticex/config-preset/prettier";
export default prettier.base;

// tsup.config.ts
import { tsup } from "@deepracticex/config-preset/tsup";
export default tsup.base;
```

## Documentation

Each package has its own detailed README:

- [Error Handling Documentation](./error-handling/README.md)
- [Logger Documentation](./logger/README.md)
- [Config Preset Documentation](./config-preset/README.md)
- [Testing Utils Documentation](./testing-utils/README.md)
- [Example Package - Standards Reference](./example-package/README.md)

## Philosophy

NodeSpec packages embody the principle: **Make it easy to do the right thing.**

- Zero-config defaults that just work
- Consistent patterns across all packages
- Clear upgrade paths and migration guides
- Production-ready out of the box

## Contributing

See the [Example Package](./example-package) for complete development standards and guidelines.

## License

MIT © Deepractice

---

**Questions or Suggestions?**

This is a living standard. If you have ideas for improvements, discuss with the team.
