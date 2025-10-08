# @deepracticex/prettier-config

Shared Prettier configuration for Deepractice projects.

## Installation

```bash
pnpm add -D @deepracticex/prettier-config prettier
```

## Usage

### Via package.json (Recommended)

```json
{
  "prettier": "@deepracticex/prettier-config"
}
```

### Via prettier.config.js

```javascript
import config from "@deepracticex/prettier-config";

export default config;
```

### Extend and Override

```javascript
import baseConfig from "@deepracticex/prettier-config";

export default {
  ...baseConfig,
  printWidth: 100, // Override
};
```

## Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## Features

- ✅ Semicolons enabled
- ✅ Double quotes
- ✅ 2-space indentation
- ✅ ES5 trailing commas
- ✅ 80 character line width
- ✅ LF line endings
