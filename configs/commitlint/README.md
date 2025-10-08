# @deepracticex/commitlint-config

Shared commitlint configuration for Deepractice projects following [Conventional Commits](https://www.conventionalcommits.org/).

## Installation

```bash
pnpm add -D @deepracticex/commitlint-config @commitlint/cli
```

## Usage

Create `commitlint.config.js` in your project root:

```javascript
export default {
  extends: ["@deepracticex/commitlint-config"],
};
```

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc)
- `refactor` - Code refactoring (neither fixes a bug nor adds a feature)
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system or external dependencies (webpack, npm, etc)
- `ci` - CI/CD changes (GitHub Actions, etc)
- `chore` - Other changes that don't modify src or test files
- `revert` - Revert a previous commit

### Scope (Optional)

The scope should be the name of the package or area affected:

- `error-handling`
- `logger`
- `eslint-config`
- `typescript-config`
- etc.

### Subject

- Use imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize first letter
- No period (.) at the end
- Max 100 characters

### Body (Optional)

- Use imperative, present tense
- Include motivation for the change and contrast with previous behavior
- Max 200 characters per line

### Footer (Optional)

- Reference issues: `Fixes #123`, `Closes #456`
- Breaking changes: `BREAKING CHANGE: <description>`
- Max 200 characters per line

## Examples

### Simple commit

```
feat: add user authentication
```

### With scope

```
fix(logger): resolve file rotation issue
```

### With body

```
refactor(error-handling): simplify error factory API

Remove redundant error creation methods and consolidate into a single
factory function for better maintainability.
```

### With breaking change

```
feat(eslint-config): upgrade to ESLint 9

BREAKING CHANGE: Requires ESLint 9.0.0 or higher. Update your ESLint
dependency before upgrading this package.
```

### With issue reference

```
fix(logger): prevent memory leak in file transport

Fixes #42
```

## Integration with Lefthook

Add to your `lefthook.yml`:

```yaml
commit-msg:
  commands:
    commitlint:
      run: npx commitlint --edit {1}
```

## Integration with Changesets

Commitlint works seamlessly with changesets. After your commit passes validation, run:

```bash
pnpm changeset
```

## Rules

This config extends `@commitlint/config-conventional` with the following customizations:

- **Subject case**: Flexible (allows any case)
- **Subject max length**: 100 characters
- **Body max line length**: 200 characters
- **Footer max line length**: 200 characters

## License

MIT
