# @deepracticex/vitest-config

Shared Vitest configuration for Deepractice projects.

## Installation

```bash
pnpm add -D @deepracticex/vitest-config vitest
```

## Usage

### Basic Usage

```typescript
// vitest.config.ts
import { baseConfig } from "@deepracticex/vitest-config";

export default baseConfig;
```

### Custom Configuration

```typescript
// vitest.config.ts
import { defineConfig, mergeConfig } from "vitest/config";
import { baseConfig } from "@deepracticex/vitest-config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      // Your custom settings
      timeout: 10000,
    },
  }),
);
```

## Features

- ✅ Global test utilities enabled
- ✅ Node environment
- ✅ V8 coverage provider
- ✅ Standard test file patterns
- ✅ Common exclusions configured
