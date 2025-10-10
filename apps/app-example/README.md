# @deepracticex/app-example

**Deepractice App Development Standards Example**

This application serves as the standard example for all Deepractice CLI applications. It demonstrates best practices for CLI app development with TypeScript.

## Features

- Commander.js for CLI command parsing
- Chalk for colorful terminal output
- TypeScript for type safety
- Shared tsup build configuration
- Shared TypeScript configuration

## Quick Start

### Installation

```bash
# Install dependencies (from monorepo root)
pnpm install

# Build the app
pnpm build
```

### Usage

```bash
# Run the CLI
node dist/cli.js

# Or via npm link (for development)
pnpm link --global
app-example greet "Alice"
app-example hello
```

### Development

```bash
# Watch mode with hot reload
pnpm dev

# Type checking
pnpm typecheck

# Clean build artifacts
pnpm clean
```

## Directory Structure

```
apps/app-example/
├── src/
│   ├── index.ts              # Main entry point
│   └── cli.ts                # CLI entry point
├── dist/                     # Build output
├── tsconfig.json             # TypeScript config
├── tsup.config.ts            # Build config
└── package.json              # Package manifest
```

## Commands

### greet

Greet someone by name.

```bash
app-example greet [name]
```

### hello

Display a hello message.

```bash
app-example hello
```

## Development Guidelines

### Adding Commands

1. Define command in `src/cli.ts` using Commander.js
2. Implement logic in `src/index.ts` or separate modules
3. Build and test

### Using Shared Configurations

This app uses shared configurations from the monorepo:

- **TypeScript**: `@deepracticex/typescript-config`
- **Tsup**: `@deepracticex/tsup-config`

These are managed as workspace dependencies and provide consistent build settings across all apps.

## Best Practices

- Use Commander.js for command-line parsing
- Use Chalk for colorful output
- Separate CLI logic from business logic
- Export reusable functions from index.ts
- Use TypeScript for type safety
- Follow semantic versioning

---

_Last updated: 2025-10-10_
