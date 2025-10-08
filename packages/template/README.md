# @deepracticex/template

**Deepractice Package Development Standards Template**

This package serves as the standard template for all Deepractice packages. It demonstrates best practices for package structure, code organization, testing, and configuration.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Standards](#architecture-standards)
- [Directory Structure](#directory-structure)
- [Coding Standards](#coding-standards)
- [Testing Standards](#testing-standards)
- [Configuration Standards](#configuration-standards)
- [Publishing Standards](#publishing-standards)

---

## Quick Start

### Creating a New Package

```bash
# 1. Copy this template
cp -r packages/template packages/your-package

# 2. Update package.json
cd packages/your-package
# Edit: name, description, keywords

# 3. Install dependencies (from monorepo root)
pnpm install

# 4. Start development
pnpm dev

# 5. Run tests
pnpm test
```

---

## Architecture Standards

### Layered Architecture

All packages MUST follow the three-layer architecture:

```
src/
├── api/          # Public API - what users import
├── types/        # Type definitions - exported to users
└── core/         # Internal implementation - NOT exported
```

#### Layer Responsibilities

**`api/` - Public API Layer**

- Contains classes, functions, and utilities users directly call
- Stable interface - changes here affect users
- Example: `Logger`, `createLogger()`, convenience functions

**`types/` - Type Definition Layer**

- All TypeScript interfaces and types users need
- Configuration interfaces
- Public type exports
- Example: `LoggerConfig`, `LogLevel`

**`core/` - Internal Implementation Layer**

- Implementation details completely hidden from users
- Can be freely refactored without breaking changes
- Third-party library adapters
- Internal utilities
- Example: Pino adapter, caller tracking logic

#### Benefits

✅ **Clear API Boundary** - Users only see what they need
✅ **Safe Refactoring** - Change `core/` without breaking users
✅ **Better Testing** - E2E test `api/`, unit test `core/`
✅ **Type Safety** - Types separated from implementation

---

## Directory Structure

```
packages/your-package/
├── src/
│   ├── api/                  # Public API
│   │   ├── *.ts              # Implementation files
│   │   └── index.ts          # Unified exports
│   ├── types/                # Type definitions
│   │   ├── *.ts              # Type files
│   │   └── index.ts          # Unified exports
│   ├── core/                 # Internal implementation
│   │   ├── *.ts              # Internal files
│   │   └── index.ts          # Internal exports
│   └── index.ts              # Package entry point
│
├── features/                 # BDD scenarios (Gherkin)
│   └── *.feature             # Feature files
│
├── tests/
│   ├── e2e/
│   │   ├── steps/            # Cucumber step definitions
│   │   │   └── *.steps.ts
│   │   └── support/          # Test support files
│   │       ├── world.ts      # Shared test context
│   │       └── hooks.ts      # Setup/teardown
│   └── unit/                 # Unit tests (optional)
│
├── dist/                     # Build output (gitignored)
├── tsconfig.json             # TypeScript configuration
├── tsup.config.ts            # Build configuration
├── cucumber.cjs              # Cucumber configuration
├── package.json              # Package manifest
└── README.md                 # Package documentation
```

---

## Coding Standards

### 1. Path Aliases

**Two aliases for different contexts:**

```typescript
// ✅ src/ internal - use ~ alias
// src/api/example.ts
import type { ExampleConfig } from "~/types/config";
import { Processor } from "~/core/processor";

// ✅ tests/ access src/ - use @ alias
// tests/e2e/steps/example.steps.ts
import { createExample } from "@/index";

// tests/unit/core/processor.test.ts
import { Processor } from "@/core/processor";

// ❌ Wrong - relative paths
import { Example } from "../../../src/api/example";
```

**Alias Convention:**

- `~/*` - Internal use within `src/` (~ means "home/internal")
- `@/*` - External access from `tests/` (@ means "external reference")

**Configuration:**

- `tsconfig.json`: `baseUrl: "."` + `paths` for both aliases
- `tsup.config.ts`: `esbuildOptions.alias` for build (only `~` needed)
- `tsx`: Native support for tsconfig paths
- Uses `moduleResolution: "Bundler"` - no `.js` extension needed

### 2. Naming Conventions

**Interface-First Naming** (NOT Hungarian notation):

```typescript
// ✅ Correct - interface gets the clean name
export interface Logger {}
export class DefaultLogger implements Logger {}
export class PinoLogger implements Logger {}

// ❌ Wrong - Hungarian notation
export interface ILogger {}
export class Logger implements ILogger {}
```

**Principles:**

- Interface = simple, clean name (e.g., `Logger`)
- Implementation = descriptive name (e.g., `DefaultLogger`, `PinoLogger`)
- Avoid prefixes like `I`, `T`, `E`

### 3. File Organization

**One file, one type:**

```typescript
// example.ts - one class per file
export class Example {}

// config.ts - related types can group
export interface Config {}
export type ConfigOption = "a" | "b";
```

**Index files for exports:**

```typescript
// api/index.ts - unified public API
export { Example, createExample } from "~/api/example";
export { Helper } from "~/api/helper";

// types/index.ts - unified types
export type { Config } from "~/types/config";
export type { Result } from "~/types/result";
```

### 4. Export Strategy

**Main `src/index.ts`:**

```typescript
// Export public API
export * from "~/api/index";

// Export types separately to avoid duplication
export type { Config, Result } from "~/types/index";

// Default export (optional)
import { createExample } from "~/api/example";
export default createExample();
```

**DO NOT export `core/` from package:**

```typescript
// ✅ Correct - only api and types
export * from "~/api/index";
export type * from "~/types/index";

// ❌ Wrong - exposing internal implementation
export * from "~/core/index"; // NEVER do this
```

---

## Testing Standards

### BDD with Cucumber

**Feature files** (`features/*.feature`):

```gherkin
Feature: Example Functionality
  As a developer
  I want to use the Example API
  So that I can process data

  Rule: Example should process correctly

    Scenario: Process simple input
      Given I have created an Example instance
      When I execute with input "hello"
      Then the result should be "Processed: hello"
```

**Step definitions** (`tests/e2e/steps/*.steps.ts`):

```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { createExample } from "../../../src/index";

Given("I have created an Example instance", function () {
  this.example = createExample();
});

When("I execute with input {string}", async function (input: string) {
  this.result = await this.example.execute(input);
});

Then("the result should be {string}", function (expected: string) {
  expect(this.result).to.equal(expected);
});
```

**Test scripts:**

```json
{
  "scripts": {
    "test": "NODE_OPTIONS='--import tsx' cucumber-js",
    "test:dev": "NODE_OPTIONS='--import tsx' cucumber-js --profile dev",
    "test:ci": "NODE_OPTIONS='--import tsx' cucumber-js --profile ci"
  }
}
```

**Key points:**

- Use `tsx` instead of `ts-node` (native tsconfig paths support)
- Load via `NODE_OPTIONS='--import tsx'`
- BDD describes behavior in business language
- E2E tests verify the public API works

---

## Configuration Standards

### 1. TypeScript Configuration

**`tsconfig.json`:**

```json
{
  "extends": "../typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "types": [],
    "baseUrl": "./src",
    "paths": {
      "~/*": ["./*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Key settings:**

- `moduleResolution: "Bundler"` (from base.json) - no `.js` extension
- `baseUrl` + `paths` for `~` alias
- Strict mode enabled

### 2. Build Configuration

**`tsup.config.ts`:**

```typescript
import { defineConfig } from "tsup";
import path from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"], // Dual format
  dts: true, // Generate .d.ts
  splitting: false,
  sourcemap: true,
  clean: true,
  esbuildOptions(options) {
    options.alias = {
      "~": path.resolve(__dirname, "./src"),
    };
  },
});
```

**Output:**

- `dist/index.js` - ESM
- `dist/index.cjs` - CommonJS
- `dist/index.d.ts` - TypeScript definitions

### 3. Package Configuration

**`package.json` essentials:**

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist", "package.json", "README.md"]
}
```

**Dependency Management:**

- **All tooling dependencies are managed in the root `package.json`**
- Sub-packages do NOT declare devDependencies
- Dependencies are automatically available via pnpm workspace hoisting
- This ensures absolute version consistency across all packages

**Available tools (auto-hoisted from root):**

- TypeScript, tsup, tsx, rimraf
- Cucumber, Vitest, Chai
- Prettier, Lefthook
- All `@deepracticex/*` config packages

**When creating a new package:**

1. Copy the template
2. Update name, description, keywords
3. Run `pnpm install` from root
4. Start coding - all tools are ready!

---

## Publishing Standards

### Before Publishing

1. **Build the package:**

   ```bash
   pnpm build
   ```

2. **Run tests:**

   ```bash
   pnpm test
   ```

3. **Type check:**

   ```bash
   pnpm typecheck
   ```

4. **Verify exports:**
   ```bash
   # Check dist/ contains expected files
   ls -la dist/
   ```

### Version Management

Use Changesets for version management:

```bash
# 1. Create changeset
pnpm changeset

# 2. Version packages (CI will do this)
pnpm changeset version

# 3. Publish (CI will do this)
pnpm changeset publish
```

---

## Best Practices

### DO ✅

- Use layered architecture (api/types/core)
- Use `~` path alias for internal imports
- Use interface-first naming
- Write BDD scenarios before implementation
- Export only public API and types
- Keep core/ completely internal
- Use tsx for testing
- Generate proper TypeScript definitions

### DON'T ❌

- Export from core/ layer
- Use Hungarian notation (ILogger)
- Use relative paths for internal imports
- Skip BDD scenarios
- Include `.js` extensions in imports (with Bundler resolution)
- Use ts-node (use tsx instead)
- Forget to configure path aliases in tsup

---

## Common Tasks

### Add a new public function

1. Implement in `core/` if complex logic
2. Create wrapper in `api/`
3. Export from `api/index.ts`
4. Export from `src/index.ts`
5. Add BDD scenario in `features/`
6. Implement step definition in `tests/e2e/steps/`

### Add a new type

1. Define in `types/*.ts`
2. Export from `types/index.ts`
3. Export from `src/index.ts` as type-only

### Refactor internal code

1. Change anything in `core/` freely
2. Keep `api/` interface stable
3. Run tests to ensure no breakage

---

## Questions?

This template embodies Deepractice package development standards. If you have questions or suggestions for improvements, please discuss with the team.

**Key Principle**: Make it easy to do the right thing.

---

_Last updated: 2025-10-08_
