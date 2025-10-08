# DeepracticeNodeSpec

**AI-friendly Node.js development ecosystem** - Standardized configurations, tools, and packages designed for seamless AI-assisted development.

## Why NodeSpec?

When AI helps you build Node.js projects, it needs clear standards and reliable patterns. DeepracticeNodeSpec provides:

- **Consistent tooling**: Pre-configured ESLint, TypeScript, Prettier, and more
- **Type-safe foundations**: Error handling, logging, and common utilities
- **AI-optimized structure**: Clear conventions that AI can understand and follow
- **Production-ready quality**: BDD testing, git hooks, and automated releases

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

All configs follow strict, opinionated standards optimized for AI collaboration:

- **[@deepracticex/eslint-config](./configs/eslint)** - ESLint 9 flat config
- **[@deepracticex/prettier-config](./configs/prettier)** - Prettier configuration
- **[@deepracticex/typescript-config](./configs/typescript)** - TypeScript strict config
- **[@deepracticex/tsup-config](./configs/tsup)** - Build configuration
- **[@deepracticex/vitest-config](./configs/vitest)** - Test configuration
- **[@deepracticex/cucumber-config](./configs/cucumber)** - BDD test configuration

## 🚀 Quick Start

```bash
# Install packages
pnpm add @deepracticex/error-handling
pnpm add @deepracticex/logger
pnpm add -D @deepracticex/eslint-config
pnpm add -D @deepracticex/typescript-config
```

### Example: TypeScript Config

```json
{
  "extends": "@deepracticex/typescript-config/base.json"
}
```

### Example: Error Handling

```typescript
import { createError, ErrorCode } from "@deepracticex/error-handling";

const error = createError(ErrorCode.NOT_FOUND, "User not found");
```

## 🎯 Design Principles

1. **Convention over Configuration**: Sensible defaults that work out of the box
2. **Type Safety First**: Strict TypeScript throughout
3. **AI-Readable**: Clear patterns and documentation
4. **Production Ready**: Battle-tested in real projects
5. **Monorepo Friendly**: Designed for turborepo/pnpm workspaces

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

## 🤝 Contributing

DeepracticeNodeSpec is designed to evolve with AI development patterns. Contributions welcome!

## 📜 License

MIT

---

Built by [Deepractice](https://deepractice.ai) - Making AI development accessible and reliable.
