# Vitest-Cucumber Plugin Design Document

## Executive Summary

This document outlines the design for converting `@deepracticex/vitest-cucumber` from a test generator library to a native Vite plugin that transforms `.feature` files into executable Vitest tests at load time.

## Research Findings

### Existing Solutions Analysis

#### 1. vitest-cucumber-plugin (samuel-ziegler)

**Approach**: True Vite plugin using `transform` hook

```javascript
export default function vitestCucumberPlugin() {
  return {
    name: "vitest-cucumber-transform",
    configResolved: (resolvedConfig) => {
      // Store config
    },
    transform: async (src, id) => {
      if (featureRegex.test(id)) {
        const code = await compileFeatureToJS(config, src);
        return { code };
      }
    },
  };
}
```

**Key Insights**:

- Uses custom Gherkin parser (Nearley-based)
- Generates complete Vitest test code as string
- Each step becomes a `test()` call
- Uses global step definition registry
- Supports hooks (beforeAll, afterAll, etc.)

**Pros**:

- True plugin, no manual test generation
- Automatic discovery
- Works with Vitest watch mode

**Cons**:

- Complex custom parser
- Generated code is string-based (harder to debug)
- Limited TypeScript support

#### 2. @amiceli/vitest-cucumber

**Approach**: Hybrid - Library API + Optional Plugin

**Library Usage**:

```typescript
const feature = await loadFeature("path.feature");

describeFeature(feature, ({ Scenario, Background }) => {
  Background(({ Given, When }) => {
    Given("step", () => {});
  });

  Scenario("name", ({ Given, When, Then }) => {
    Given("step", () => {});
  });
});
```

**Plugin Usage** (watch mode only):

```typescript
// Plugin watches .feature files and updates .spec.ts
VitestCucumberPlugin({
  featureFilesDir: "features/",
  specFilesDir: "tests/",
});
```

**Key Insights**:

- Uses official `@cucumber/gherkin` parser
- Runtime-based: Feature files parsed at runtime
- Type-safe API with TypeScript
- Plugin only for watch mode file generation
- Rich API: loadFeature, describeFeature, defineSteps

**Pros**:

- Excellent TypeScript support
- Uses official Gherkin parser
- Flexible API
- Better error messages

**Cons**:

- Not a pure plugin (requires manual loadFeature)
- Plugin feature is limited

### Vite/Vitest Plugin System

**Key Hooks**:

1. **`configResolved`**: Access configuration early
2. **`resolveId`**: Custom module resolution
3. **`load`**: Load module content
4. **`transform`**: Transform source code
5. **`configureVitest`** (experimental): Vitest-specific configuration

**Hook Execution Order**:

```
resolveId -> load -> transform
```

**Best Practice**:

- Use `transform` hook for file transformation
- Return `{ code, map }` from transform
- Support source maps for debugging

## Recommended Approach

### Architecture: Hybrid Model (Best of Both Worlds)

**Core Principle**: Provide both plugin-based and API-based usage

```typescript
// Option 1: Plugin-based (automatic)
// vitest.config.ts
import { vitestCucumber } from "@deepracticex/vitest-cucumber/plugin";

export default defineConfig({
  plugins: [vitestCucumber()],
});

// Option 2: API-based (explicit, for our current usage)
// tests/cucumber.test.ts
import { generateCucumberTests } from "@deepracticex/vitest-cucumber";

await generateCucumberTests({
  featureGlob: "features/**/*.feature",
  stepGlob: "tests/steps/**/*.ts",
});
```

### Plugin Architecture (Following Deepractice Standards)

```
@deepracticex/vitest-cucumber/
├── src/
│   ├── api/                  # Public API - User-facing interfaces
│   │   ├── generate-tests.ts     # generateCucumberTests (current)
│   │   ├── plugin.ts             # NEW: vitestCucumber plugin
│   │   ├── step-definitions.ts   # NEW: Given/When/Then exports
│   │   ├── hooks.ts              # NEW: Before/After exports
│   │   └── index.ts              # Unified export
│   │
│   ├── types/               # Public types - User-facing types
│   │   ├── plugin-options.ts     # Plugin configuration types
│   │   ├── step-definition.ts    # Step function types
│   │   ├── cucumber-config.ts    # Test generation config types
│   │   └── index.ts              # Type exports
│   │
│   ├── core/                # Internal implementation - Not exported
│   │   ├── parser/               # Gherkin parsing
│   │   │   ├── GherkinParser.ts
│   │   │   ├── FeatureParser.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── transformer/          # Feature -> JS transformation
│   │   │   ├── FeatureTransformer.ts
│   │   │   ├── ScenarioTransformer.ts
│   │   │   ├── CodeGenerator.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── runtime/              # Runtime execution engine
│   │   │   ├── StepRegistry.ts
│   │   │   ├── StepExecutor.ts
│   │   │   ├── ContextManager.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── discovery/            # File discovery
│   │   │   ├── FeatureDiscovery.ts
│   │   │   ├── StepDiscovery.ts
│   │   │   └── index.ts
│   │   │
│   │   └── runner/               # Test execution (current)
│   │       ├── CucumberRunner.ts
│   │       └── index.ts
│   │
│   └── index.ts             # Package entry (exports api/ and types/)
│
├── dist/                    # Build output
│   ├── api/
│   ├── types/
│   ├── core/                    # Built but not exported
│   └── index.js
│
└── package.json
```

**Directory Responsibilities**:

- **`api/`**: User-facing API layer
  - `generate-tests.ts`: Current test generation API
  - `plugin.ts`: New Vite plugin export
  - `step-definitions.ts`: Given/When/Then/And/But
  - `hooks.ts`: Before/After/BeforeAll/AfterAll

- **`types/`**: Public TypeScript types
  - Plugin configuration interfaces
  - Step definition function signatures
  - Context and World types
  - Export types for user code

- **`core/`**: Internal implementation (never exported)
  - `parser/`: Gherkin parsing logic
  - `transformer/`: Feature to JS code transformation
  - `runtime/`: Step execution engine
  - `discovery/`: File discovery utilities
  - `runner/`: Current test runner (may be deprecated)

**Key Principles**:

1. Users only import from `api/` and `types/`
2. `core/` can be refactored freely without breaking changes
3. Clear separation of concerns
4. Easier to test each layer independently

### Implementation Design

#### Phase 1: Plugin Core (Transform Hook)

```typescript
// src/api/plugin.ts - Public API
import type { Plugin } from "vite";
import type { VitestCucumberPluginOptions } from "~/types";
import { FeatureTransformer } from "~/core/transformer";
import { StepDiscovery } from "~/core/discovery";

export function vitestCucumber(
  options: VitestCucumberPluginOptions = {},
): Plugin {
  const featureRegex = /\.feature$/;
  let config: VitestCucumberPluginOptions;

  return {
    name: "vitest-cucumber",

    // Store configuration
    configResolved(resolvedConfig) {
      config = {
        include: ["**/*.feature"],
        stepDefinitions: "**/*.steps.{ts,js}",
        requireStepDefinitions: false,
        failOnUndefinedSteps: true,
        ...options,
        ...resolvedConfig.test?.cucumber,
      };
    },

    // Transform .feature files
    async transform(src, id) {
      if (!featureRegex.test(id)) {
        return null;
      }

      try {
        const code = await transformFeatureToTest(src, id, config);
        return {
          code,
          map: null, // TODO: Add source map support
        };
      } catch (error) {
        this.error(`Failed to transform ${id}: ${error.message}`);
      }
    },
  };
}
```

#### Phase 2: Feature Transformation

```typescript
// src/core/transformer/FeatureTransformer.ts
import { GherkinParser } from "~/core/parser";
import { CodeGenerator } from "~/core/transformer";
import type { VitestCucumberPluginOptions } from "~/types";

export class FeatureTransformer {
  private parser: GherkinParser;
  private generator: CodeGenerator;

  constructor(private options: VitestCucumberPluginOptions) {
    this.parser = new GherkinParser();
    this.generator = new CodeGenerator(options);
  }

  async transform(src: string, featureFilePath: string): Promise<string> {
    // Parse Gherkin
    const feature = this.parser.parse(src);

    // Generate Vitest test code
    const code = this.generator.generate(feature, {
      featureFilePath,
      stepDefinitions: this.options.stepDefinitions,
      runtimeModule: "@deepracticex/vitest-cucumber/runtime",
    });

    return code;
  }
}
```

#### Phase 3: Generated Test Structure

```typescript
// Example generated code for a .feature file:
import { describe, test, beforeAll, afterAll } from "vitest";
import {
  executeStep,
  executeBackground,
} from "@deepracticex/vitest-cucumber/runtime";

// Auto-import step definitions
import "../steps/math.steps";

describe("Feature: Calculator", () => {
  describe("Scenario: Add two numbers", () => {
    const steps = [
      { type: "Given", text: "I have numbers 2 and 3" },
      { type: "When", text: "I add them together" },
      { type: "Then", text: "the result should be 5" },
    ];

    test("Given I have numbers 2 and 3", async () => {
      await executeStep(steps[0]);
    });

    test("When I add them together", async () => {
      await executeStep(steps[1]);
    });

    test("Then the result should be 5", async () => {
      await executeStep(steps[2]);
    });
  });
});
```

**Alternative Structure (Sequential Steps)**:

```typescript
describe("Scenario: Add two numbers", () => {
  test("complete scenario", async () => {
    const context = {};

    await executeStep(
      { type: "Given", text: "I have numbers 2 and 3" },
      context,
    );
    await executeStep({ type: "When", text: "I add them together" }, context);
    await executeStep(
      { type: "Then", text: "the result should be 5" },
      context,
    );
  });
});
```

#### Phase 4: Runtime Execution

```typescript
// src/core/runtime/StepRegistry.ts
import type { StepDefinition } from "~/types";

export class StepRegistry {
  private static steps: Map<string, StepDefinition> = new Map();

  static register(definition: StepDefinition): void {
    const key = `${definition.type}:${definition.expression}`;
    this.steps.set(key, definition);
  }

  static findMatch(type: string, text: string): StepDefinition | null {
    for (const [, def] of this.steps) {
      if (
        this.isTypeMatch(def.type, type) &&
        this.isTextMatch(def.expression, text)
      ) {
        return def;
      }
    }
    return null;
  }

  private static isTypeMatch(defType: string, stepType: string): boolean {
    return defType === stepType || defType === "And" || defType === "But";
  }

  private static isTextMatch(
    expression: string | RegExp,
    text: string,
  ): boolean {
    if (typeof expression === "string") {
      const cucumberExpr = new CucumberExpression(expression, {});
      return cucumberExpr.match(text) !== null;
    }
    return expression.test(text);
  }

  static clear(): void {
    this.steps.clear();
  }
}

// src/core/runtime/StepExecutor.ts
import { CucumberExpression } from "@cucumber/cucumber-expressions";
import { StepRegistry } from "./StepRegistry";
import type { Step, StepContext } from "~/types";

export class StepExecutor {
  async execute(step: Step, context: StepContext = {}): Promise<void> {
    const definition = StepRegistry.findMatch(step.type, step.text);

    if (!definition) {
      throw new Error(`Undefined step: ${step.type} ${step.text}`);
    }

    const params = this.extractParameters(step.text, definition.expression);

    await definition.fn(context, ...params, step.dataTable, step.docString);
  }

  private extractParameters(text: string, expression: string | RegExp): any[] {
    if (typeof expression === "string") {
      const cucumberExpr = new CucumberExpression(expression, {});
      const match = cucumberExpr.match(text);
      return match ? match.map((arg) => arg.getValue()) : [];
    }

    const match = text.match(expression);
    return match ? match.slice(1) : [];
  }
}

// src/core/runtime/index.ts - Internal exports
export { StepRegistry } from "./StepRegistry";
export { StepExecutor } from "./StepExecutor";
export { ContextManager } from "./ContextManager";
```

#### Phase 5: Step Definition API

```typescript
// src/api/step-definitions.ts - Public API
import { StepRegistry } from "~/core/runtime";
import type { StepFunction } from "~/types";

export function Given(expression: string | RegExp, fn: StepFunction): void {
  StepRegistry.register({ type: "Given", expression, fn });
}

export function When(expression: string | RegExp, fn: StepFunction): void {
  StepRegistry.register({ type: "When", expression, fn });
}

export function Then(expression: string | RegExp, fn: StepFunction): void {
  StepRegistry.register({ type: "Then", expression, fn });
}

export function And(expression: string | RegExp, fn: StepFunction): void {
  StepRegistry.register({ type: "And", expression, fn });
}

export function But(expression: string | RegExp, fn: StepFunction): void {
  StepRegistry.register({ type: "But", expression, fn });
}

// src/api/index.ts - Main export
export { Given, When, Then, And, But } from "./step-definitions";
export { Before, After, BeforeAll, AfterAll } from "./hooks";
export { vitestCucumber } from "./plugin";
export { generateCucumberTests } from "./generate-tests";

// Usage in step definitions:
// tests/steps/math.steps.ts
import { Given, When, Then } from "@deepracticex/vitest-cucumber";
import { expect } from "vitest";

Given("I have numbers {int} and {int}", function (a: number, b: number) {
  this.a = a;
  this.b = b;
});

When("I add them together", function () {
  this.result = this.a + this.b;
});

Then("the result should be {int}", function (expected: number) {
  expect(this.result).toBe(expected);
});
```

## Design Decisions

### Decision 1: One Test Per Step vs One Test Per Scenario

**Option A: One test() per step** (Recommended for Phase 1)

```typescript
describe("Scenario: X", () => {
  test("Given step", () => {});
  test("When step", () => {});
  test("Then step", () => {});
});
```

**Pros**:

- Each step shows separately in test output
- Easier to identify which step failed
- Better Vitest UI integration

**Cons**:

- Context sharing between steps is complex
- Not true BDD (scenario is atomic)

**Option B: One test() per scenario**

```typescript
describe("Scenario: X", () => {
  test("complete scenario", () => {
    // Execute all steps sequentially
  });
});
```

**Pros**:

- True BDD semantics (scenario is atomic)
- Easy context sharing
- Simpler implementation

**Cons**:

- Harder to identify failing step
- Less granular test output

**Recommendation**: Start with **Option B** (simpler, true BDD semantics), provide **Option A** as configuration option later.

### Decision 2: Step Definition Loading

**Option A: Auto-import in generated code** (Recommended)

```typescript
// Generated code
import "../steps/math.steps";
import "../steps/user.steps";
```

**Pros**:

- Explicit dependencies
- Works with tree-shaking
- Clear what steps are available

**Cons**:

- Need to discover step files
- Generated code is larger

**Option B: Global registration at runtime**

```typescript
// Load all step definitions before tests run
beforeAll(() => {
  await loadStepDefinitions("**/*.steps.ts");
});
```

**Pros**:

- Simpler generated code
- Easier to manage step definitions

**Cons**:

- Implicit dependencies
- Harder to debug

**Recommendation**: **Option A** - More explicit and predictable.

### Decision 3: Gherkin Parser

**Option A: Official @cucumber/gherkin** (Recommended)
**Pros**:

- Official, well-maintained
- Full Gherkin 6 support
- Widely used

**Cons**:

- Larger dependency

**Option B: Custom parser**
**Pros**:

- Lighter weight
- Custom features

**Cons**:

- Maintenance burden
- May miss edge cases

**Recommendation**: **Option A** - Use official parser.

### Decision 4: Migration Strategy

**Phase 1: Add Plugin (Non-breaking)**

- Keep existing `generateCucumberTests` API
- Add new `vitestCucumber()` plugin export
- Both approaches work side-by-side

**Phase 2: Deprecation**

- Mark `generateCucumberTests` as deprecated
- Update documentation to prefer plugin
- Provide migration guide

**Phase 3: Remove (Major version)**

- Remove deprecated API
- Plugin-only approach

## Implementation Plan

### Milestone 1: Plugin Core (1-2 weeks)

- [ ] Implement plugin skeleton
- [ ] Add transform hook
- [ ] Basic feature parsing
- [ ] Generate simple test structure
- [ ] Add plugin tests

### Milestone 2: Step Execution (1-2 weeks)

- [ ] Implement runtime step registry
- [ ] Add step definition API (Given/When/Then)
- [ ] Support Cucumber expressions
- [ ] Add step matching logic
- [ ] Support DataTable and DocString

### Milestone 3: Advanced Features (2-3 weeks)

- [ ] Background support
- [ ] Scenario Outline support
- [ ] Rule support
- [ ] Tag filtering
- [ ] Hooks (Before/After/BeforeAll/AfterAll)
- [ ] Custom parameter types

### Milestone 4: Developer Experience (1-2 weeks)

- [ ] Error messages with line numbers
- [ ] Source map support
- [ ] TypeScript types for context
- [ ] Watch mode optimization
- [ ] Plugin configuration validation

### Milestone 5: Testing & Documentation (1 week)

- [ ] Write plugin feature tests
- [ ] Update README
- [ ] Migration guide
- [ ] API documentation
- [ ] Example projects

## Package Structure

```json
{
  "name": "@deepracticex/vitest-cucumber",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./plugin": {
      "types": "./dist/api/plugin.d.ts",
      "import": "./dist/api/plugin.js"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/types/index.js"
    }
  },
  "files": ["dist/api", "dist/types", "dist/index.js", "dist/index.d.ts"]
}
```

**Notes**:

- Main entry exports public API from `api/` and types from `types/`
- `./plugin` subpath for plugin-only import
- `./types` subpath for types-only import
- `core/` is built but NOT exposed in exports
- Users cannot import from `core/` directly

## Type Definitions Structure

```typescript
// src/types/plugin-options.ts
export interface VitestCucumberPluginOptions {
  include?: string[];
  exclude?: string[];
  stepDefinitions?: string | string[];
  requireStepDefinitions?: boolean;
  failOnUndefinedSteps?: boolean;
  tags?: string;
}

// src/types/step-definition.ts
export type StepType = "Given" | "When" | "Then" | "And" | "But";

export interface StepDefinition {
  type: StepType;
  expression: string | RegExp;
  fn: StepFunction;
}

export type StepFunction = (
  this: StepContext,
  ...args: any[]
) => void | Promise<void>;

// src/types/cucumber-config.ts
export interface CucumberRunnerOptions {
  featureGlob: string;
  stepGlob: string;
  formatOptions?: string[];
}

// src/types/feature.ts
export interface Feature {
  name: string;
  description?: string;
  scenarios: Scenario[];
  background?: Background;
  rules?: Rule[];
  tags?: string[];
}

export interface Scenario {
  name: string;
  steps: Step[];
  tags?: string[];
}

export interface Step {
  type: StepType;
  text: string;
  dataTable?: DataTable;
  docString?: DocString;
}

export interface StepContext {
  [key: string]: any;
}

export interface DataTable {
  rows: string[][];
}

export interface DocString {
  content: string;
  contentType?: string;
}

// src/types/index.ts
export type { VitestCucumberPluginOptions } from "./plugin-options";
export type { StepType, StepDefinition, StepFunction } from "./step-definition";
export type { CucumberRunnerOptions } from "./cucumber-config";
export type {
  Feature,
  Scenario,
  Step,
  StepContext,
  DataTable,
  DocString,
} from "./feature";
```

## Testing Strategy

### Unit Tests

- Parser tests
- Code generator tests
- Step matching tests
- Expression parsing tests

### Integration Tests

- End-to-end plugin tests
- Feature file transformation tests
- Step execution tests

### E2E Tests

- Real Vitest project with plugin
- All feature examples working
- Watch mode testing

## Backwards Compatibility

**Keep existing API working**:

```typescript
// Still works
await generateCucumberTests({
  featureGlob: "features/**/*.feature",
  stepGlob: "tests/steps/**/*.ts",
});
```

**Add new plugin API**:

```typescript
// New approach
export default defineConfig({
  plugins: [vitestCucumber()],
});
```

## Open Questions

1. **Should scenarios run in parallel or serial?**
   - Recommendation: Serial within feature, parallel across features

2. **How to handle shared context between steps?**
   - Recommendation: Use `this` context like Cucumber.js

3. **Should we support cucumber.js world?**
   - Recommendation: Yes, but simplified version

4. **Source map support?**
   - Recommendation: Phase 2, not critical for MVP

## Success Criteria

- ✅ Can write `.feature` files and they automatically become tests
- ✅ Step definitions work like Cucumber.js
- ✅ Vitest watch mode works
- ✅ Good error messages with line numbers
- ✅ TypeScript support
- ✅ Existing tests still pass
- ✅ Performance is acceptable (<100ms per feature file)

## References

- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
- [Vitest Plugin API](https://vitest.dev/advanced/api/plugin)
- [Cucumber.js](https://github.com/cucumber/cucumber-js)
- [@cucumber/gherkin](https://github.com/cucumber/gherkin)
- [vitest-cucumber-plugin](https://github.com/samuel-ziegler/vitest-cucumber-plugin)
- [@amiceli/vitest-cucumber](https://github.com/amiceli/vitest-cucumber)
