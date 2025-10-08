# @deepracticex/monorepo-config

Shared monorepo tooling configuration for Deepractice projects.

## Installation

```bash
pnpm add -D @deepracticex/monorepo-config @changesets/cli turbo lefthook rimraf
```

## Usage

### Turbo Configuration

```javascript
// turbo.json (root)
import config from "@deepracticex/monorepo-config/turbo.json";

export default config;
```

Or extend it:

```json
{
  "extends": ["@deepracticex/monorepo-config/turbo.json"],
  "tasks": {
    "dev": {
      "cache": false
    }
  }
}
```

## Included Tools

This config declares peer dependencies for:

- **turbo** - Build system for monorepos
- **@changesets/cli** - Version management and changelog generation
- **lefthook** - Git hooks manager
- **rimraf** - Cross-platform rm -rf

## Scripts

Add to your root `package.json`:

```json
{
  "scripts": {
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

## Turbo Tasks

Configured tasks:

- `build` - Build packages (depends on dependencies' build)
- `test` - Run tests (depends on build)
- `lint` - Lint code
- `typecheck` - Type checking
- `format` - Format code
- `clean` - Clean build artifacts

## Features

- ✅ Optimized task dependency graph
- ✅ Caching configuration
- ✅ Output definitions
- ✅ Standard monorepo workflows
