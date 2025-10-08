# @deepracticex/tsup-config

Shared tsup build configuration for Deepractice projects.

## Installation

```bash
pnpm add -D @deepracticex/tsup-config tsup
```

## Usage

### Basic Usage

```typescript
// tsup.config.ts
import { createConfig } from "@deepracticex/tsup-config";

export default createConfig({
  entry: ["src/index.ts"],
});
```

### Custom Configuration

```typescript
// tsup.config.ts
import { createConfig } from "@deepracticex/tsup-config";

export default createConfig({
  entry: ["src/index.ts"],
  // Override or add options
  format: ["esm"], // Only ESM
  minify: true,
});
```

### Direct Import (No Customization)

```typescript
// tsup.config.ts
import config from "@deepracticex/tsup-config";

export default config;
```

## Features

- ✅ Dual format output (CJS + ESM)
- ✅ TypeScript declarations (.d.ts)
- ✅ Source maps enabled
- ✅ Clean build directory
- ✅ Path alias support (~/_ → ./src/_)
- ✅ esbuild powered

## Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

## Default Configuration

```typescript
{
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  esbuildOptions: {
    alias: {
      "~": "./src"
    }
  }
}
```
