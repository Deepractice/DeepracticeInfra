# @deepracticex/nodespec-mirror

**NodeSpec Project Mirror**

This package contains a complete snapshot of the NodeSpec project structure, used as the single source of truth for all template generation.

## Purpose

The mirror provides:

- Complete NodeSpec project structure
- All example packages (packages/example)
- All example apps (apps/app-example)
- All example services (services/service-example)
- Root configuration files

## Usage

This package is used internally by `@deepracticex/nodespec-core` generators to create new projects, packages, apps, and services.

### In Development

When running from source, generators can use the NodeSpec repo directly.

### In Production

When published, the mirror directory is bundled with packages that need templates.

## Building

The mirror is automatically synchronized from the NodeSpec project:

```bash
pnpm build
```

This runs `sync-mirror.ts` which:

1. Scans the NodeSpec project root
2. Respects `.gitignore` rules
3. Copies all source files to `mirror/`
4. Excludes `node_modules`, `dist`, `.turbo`, etc.

## Structure

```
src/mirror/
├── dist/
│   └── mirror/          # Complete NodeSpec snapshot (build output)
│       ├── package.json
│       ├── packages/
│       │   └── example/
│       ├── apps/
│       │   └── app-example/
│       ├── services/
│       │   └── service-example/
│       └── ... (all other files)
├── scripts/
│   └── sync-mirror.ts   # Build script
└── package.json
```

## Key Features

- **Single Source of Truth**: One mirror serves all generators
- **Automatic Sync**: Build script keeps mirror up-to-date
- **Gitignore Aware**: Only copies committed files
- **Size Optimized**: Excludes build artifacts and dependencies

## Integration

Generators use the mirror through `BaseGenerator.getNodeSpecRoot()`:

```typescript
// Development: Uses NodeSpec repo directly
// Production: Uses mirror directory
const templateRoot = this.getNodeSpecRoot();
```

---

_Last updated: 2025-10-10_
