# DeepracticeInfra

Deepractice Infrastructure - Shared configurations, tools, and packages for all Deepractice projects.

## 📦 Packages

### Core Packages

- **[@deepracticex/error-handling](./packages/error-handling)** - Type-safe error handling system
  - HTTP and business error classes
  - Error factory API
  - Express/Hono middleware
  - Result/Either pattern

- **[@deepracticex/logger](./packages/logger)** - Unified logging with Pino
  - Caller location tracking
  - Daily log rotation
  - MCP stdio and Electron compatibility

### Configuration Packages

- **[@deepracticex/eslint-config](./packages/eslint-config)** - ESLint 9 flat config
- **[@deepracticex/prettier-config](./packages/prettier-config)** - Prettier configuration
- **[@deepracticex/typescript-config](./packages/typescript-config)** - TypeScript strict config

## 🚀 Usage

```bash
# Install a package in your project
pnpm add @deepracticex/error-handling
pnpm add @deepracticex/logger
pnpm add -D @deepracticex/eslint-config
```

## 🛠️ Development

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck
```

### Testing with Cucumber BDD

```bash
# Run all tests
pnpm test

# Development mode
pnpm test:dev

# CI mode
pnpm test:ci
```

**Feature files** serve as living documentation - see `packages/*/features/`

## 📝 Publishing

We use [Changesets](https://github.com/changesets/changesets) for version management:

```bash
# Create a changeset
pnpm changeset

# Version packages
pnpm version

# Build and publish
pnpm release
```

## 📜 License

MIT
