# src

**Product Core** - The business logic of NodeSpec.

## What is This?

This directory contains the **core business logic** of NodeSpec - the product-specific code that makes NodeSpec work. This code is:

- **Specialized**: Built specifically for NodeSpec's needs
- **Not for sharing**: Unlike `packages/`, this code is not intended for external use
- **Technical in nature**: Focused on technical implementation rather than business complexity

## Why `src/` not `domains/`?

NodeSpec is a **technical product** (CLI tool, template engine, task orchestrator), not a business-heavy system. We use a **technical layering approach** (`core/`) rather than Domain-Driven Design (`domain/`).

**See [Issue #3](https://github.com/Deepractice/DeepracticeNodeSpec/issues/3)** for the detailed architecture decision.

## Structure

```
src/
├── template/     # Template generation engine
├── guide/        # Documentation and guide lookup
└── executor/     # Task execution and orchestration
```

Each module focuses on a specific technical capability needed by NodeSpec.

## Relationship with Other Layers

```
apps/cli → src/ → packages/
                → configs/
```

- **apps/** depend on `src/` for business logic
- **src/** depends on `packages/` for technical infrastructure
- **packages/** are independently usable (ecosystem layer)

## Design Philosophy

### Core (src/) - Technical Products

- Algorithm-intensive
- Clear technical logic
- Performance-sensitive
- Modules, services, utility functions

```typescript
// Core style - technical implementation
class TemplateEngine {
  parse(template: string): AST {}
  compile(ast: AST): Function {}
  render(compiled: Function, data: object): string {}
}
```

### vs Domain (alternative) - Business Products

- Business rule-intensive
- Frequent changes
- Entities, aggregates, domain services
- Would be appropriate for systems like e-commerce, CRM

```typescript
// Domain style - business concepts
class Order extends AggregateRoot {
  addItem(product: Product) {
    if (this.items.length >= 100) {
      throw new BusinessRuleError("Max 100 items");
    }
  }
}
```

## Development Guidelines

1. **Keep it technical**: Focus on "how" rather than "what"
2. **Performance matters**: CLI startup speed is critical
3. **Pure logic**: No UI concerns (that's for `apps/`)
4. **Testable**: Write unit tests for all core logic
5. **Independent**: Should work without any specific UI

## Getting Started

Each module will have its own package.json as part of the monorepo workspace:

```
src/
└── template/
    ├── src/
    │   ├── engine/
    │   ├── generators/
    │   └── index.ts
    ├── package.json
    └── README.md
```

---

**Remember**: This is the technical heart of NodeSpec - where templates are generated, tasks are executed, and guides are served.
