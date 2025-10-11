# Feature Specification for NodeSpec Project

This document defines the structure and conventions for writing Cucumber feature files in the NodeSpec project.

## File Organization

### Directory Structure

```
<package>/
├── features/              # Cucumber feature files
│   ├── *.feature         # Feature files organized by capability
│   └── subdirs/          # Optional subdirectories for complex features
└── tests/
    └── e2e/
        └── steps/        # Step definitions
            └── *.steps.ts
```

### Naming Conventions

- **Feature files**: Use kebab-case with descriptive names
  - ✅ `basic-logging.feature`
  - ✅ `typescript-config.feature`
  - ✅ `monorepo/create.feature`
  - ❌ `test.feature` (too generic)
  - ❌ `BasicLogging.feature` (wrong case)

- **Step definition files**: Match feature domains with `.steps.ts` suffix
  - ✅ `logging.steps.ts`
  - ✅ `config.steps.ts`
  - ✅ `common.steps.ts`

## Feature File Structure

### Required Elements

Every feature file MUST contain:

1. **Feature declaration**: One-line description
2. **User story**: As/I want/So that format
3. **At least one Scenario**: Concrete test case

### Recommended Elements

- **Background**: Common setup steps for all scenarios
- **Rule**: Group related scenarios under business rules
- **Scenario Outline**: For parameterized testing
- **Examples**: Data tables for Scenario Outline
- **Comments**: Link to issues, business rules, or documentation

### Template

```gherkin
Feature: [Capability Name]
  As a [role]
  I want to [action]
  So that I can [benefit]

  Background:
    Given [common precondition]
    And [another precondition]

  Rule: [Business rule description]

    Scenario: [Concrete scenario name]
      Given [initial context]
      When [action performed]
      Then [expected outcome]
      And [additional verification]

    Scenario Outline: [Parameterized scenario name]
      Given [context with <parameter>]
      When [action with <parameter>]
      Then [outcome with <parameter>]

      Examples:
        | parameter | expected |
        | value1    | result1  |
        | value2    | result2  |

# Comments at end:
# Linked to: Issue #123
# Business Rule: Detailed explanation
# Technical Note: Implementation details
```

## Writing Guidelines

### 1. User Story Format

Always start with clear user story:

```gherkin
Feature: [Feature Name]
  As a [specific role]
  I want to [concrete action]
  So that I can [measurable benefit]
```

**Examples:**

- ✅ "As a developer, I want to use pre-configured TypeScript settings, So that I can maintain consistent compilation across projects"
- ❌ "As a user, I want to use TypeScript" (too vague)

### 2. Background Usage

Use Background for:

- ✅ Common setup needed by ALL scenarios
- ✅ Creating consistent test context
- ✅ Installing dependencies or initializing state

Avoid Background for:

- ❌ Scenario-specific setup
- ❌ Actions that only some scenarios need

**Example:**

```gherkin
Background:
  Given I have installed "@deepracticex/configurer"
  And I am in a temporary test directory
```

### 3. Rule Organization

Use Rules to:

- ✅ Group scenarios by business rule
- ✅ Document constraints and invariants
- ✅ Organize complex features

**Example:**

```gherkin
Rule: Log levels should work correctly

  Scenario: Log info message
    ...

  Scenario: Log error message
    ...

Rule: Logger should accept context object

  Scenario: Log with context data
    ...
```

### 4. Scenario Naming

Scenarios should:

- ✅ Use concrete, specific names
- ✅ Describe the behavior being tested
- ✅ Be readable as documentation

**Examples:**

- ✅ "Create new project in subdirectory"
- ✅ "Prevent creating project in existing directory"
- ✅ "Log message with context data"
- ❌ "Test case 1" (not descriptive)
- ❌ "It works" (too vague)

### 5. Scenario Outline and Examples

Use Scenario Outline for:

- ✅ Testing same behavior with different data
- ✅ Reducing duplication
- ✅ Documenting valid input ranges

**Example:**

```gherkin
Scenario Outline: Log messages at different levels
  When I log "<message>" at level "<level>"
  Then the log should be recorded at level "<level>"
  And the log message should be "<message>"

  Examples:
    | level | message                |
    | info  | Server started         |
    | warn  | Low memory warning     |
    | error | Connection failed      |
    | debug | Debug information      |
```

### 6. Data Tables

Use data tables for:

- ✅ Complex structured input
- ✅ List of expected values
- ✅ Configuration data

**Example:**

```gherkin
When I log "User login" at level "info" with context:
  | key    | value      |
  | userId | 123        |
  | ip     | 127.0.0.1  |
```

### 7. Multi-line Strings

Use triple quotes for:

- ✅ File content
- ✅ JSON/YAML payloads
- ✅ Long text blocks

**Example:**

```gherkin
When I create "package.json" with:
  """
  {
    "name": "my-package",
    "version": "1.0.0"
  }
  """
```

### 8. Step Parameterization

Always parameterize dynamic values:

**✅ Correct:**

```gherkin
Given I have installed "{string}"
When I log {string} at level {string}
Then the config should target {string}
```

**❌ Avoid:**

```gherkin
Given I have installed @deepracticex/configurer
# Problem: Special chars in regex, hard to reuse
```

### 9. End-to-End Testing

For complex features, include end-to-end scenarios:

```gherkin
Rule: Created monorepo is fully functional end-to-end

  Scenario: Initialize project and verify it works end-to-end
    Given I am in an empty directory
    When I run "nodespec infra monorepo init --skip-git"
    Then the command should succeed

    # Verify dependencies can be installed
    When I run "pnpm install"
    Then the command should succeed
    And "node_modules" directory should exist

    # Verify TypeScript configuration is valid
    When I run "pnpm typecheck"
    Then the command should succeed

    # Verify formatting works
    When I run "pnpm format"
    Then the command should succeed
```

### 10. Comments and Metadata

Add comments at the end for:

- ✅ Issue references
- ✅ Business rule documentation
- ✅ Technical notes

**Example:**

```gherkin
# Linked to: Issue #13 (CLI restructure)
# Business Rule: Create command generates project in new directory based on project name
# Business Rule: Scoped packages use unscoped name for directory (e.g., @org/pkg -> pkg/)
# Technical Note: Uses pnpm workspaces for monorepo management
```

## Step Definition Guidelines

### 1. File Organization

Organize steps by domain:

```typescript
// common.steps.ts - Shared steps across features
// config.steps.ts - Configuration-related steps
// cli.steps.ts - CLI command steps
// validation.steps.ts - Assertion steps
```

### 2. Context Sharing

Use Vitest's context object or World pattern:

```typescript
interface TestContext {
  logger?: Logger;
  logOutput?: LogEntry[];
  lastResult?: ExecResult;
}

Given("I have a logger instance", function (this: TestContext) {
  this.logger = createLogger();
});
```

### 3. Parameter Types

Use Cucumber expressions for type safety:

```typescript
// String parameters
Given("I have installed {string}", function (packageName: string) {
  // packageName is typed as string
});

// Number parameters
Given("I set timeout to {int} seconds", function (timeout: number) {
  // timeout is typed as number
});

// Custom parameters
defineParameterType({
  name: "loglevel",
  regexp: /info|warn|error|debug/,
  transformer: (s) => s as LogLevel,
});

When("I log at {loglevel}", function (level: LogLevel) {
  // level is typed as LogLevel
});
```

### 4. Async Operations

Always use async/await for I/O:

```typescript
When("I run {string}", async function (command: string) {
  this.lastResult = await exec(command);
});
```

### 5. Error Handling

Gracefully handle errors:

```typescript
Then("the command should fail", function () {
  expect(this.lastResult?.exitCode).not.toBe(0);
});

Then("I should see error message {string}", function (message: string) {
  expect(this.lastResult?.stderr).toContain(message);
});
```

## Common Patterns

### CLI Testing

```gherkin
Scenario: Run CLI command
  Given I am in a test directory
  When I run "nodespec infra monorepo create my-project"
  Then the command should succeed
  And I should see output "Created project"
  And directory "my-project" should exist
```

### Configuration Testing

```gherkin
Scenario: Use configuration preset
  Given I have installed "@deepracticex/configurer"
  When I extend typescript.base in my tsconfig.json
  Then the config should target "ES2022"
  And the config should enable strict mode
```

### API Testing

```gherkin
Scenario: Call API method
  Given I have a logger instance
  When I log "Test message" at level "info"
  Then the log should be recorded at level "info"
  And the log message should be "Test message"
```

### File System Testing

```gherkin
Scenario: Create file with content
  Given I am in an empty directory
  When I create "package.json" with:
    """
    {"name": "test"}
    """
  Then file "package.json" should exist
  And "package.json" should contain "test"
```

## Anti-Patterns

### ❌ Avoid

1. **Implementation details in scenarios**

   ```gherkin
   # Bad - too technical
   When I call logger.info() with "message"

   # Good - behavior focused
   When I log "message" at level "info"
   ```

2. **Hard-coded values without parameters**

   ```gherkin
   # Bad - not reusable
   Given I have installed @deepracticex/logger

   # Good - parameterized
   Given I have installed "{string}"
   ```

3. **Overly complex scenarios**

   ```gherkin
   # Bad - doing too much
   Scenario: Test everything
     When I do step 1
     And I do step 2
     And I do step 3
     And I do step 4
     And I do step 5
     # ... 20 more steps

   # Good - focused scenarios
   Scenario: Test one thing
     When I do the main action
     Then I get the expected result
   ```

4. **Testing through UI when API would work**

   ```gherkin
   # Bad - unnecessary complexity
   When I run "nodespec infra package add my-package"

   # Good - if testing the API directly
   When I call addPackage("my-package")
   ```

5. **Missing Background for common setup**

   ```gherkin
   # Bad - repeated in every scenario
   Scenario: Test A
     Given I have installed the package
     And I am in a test directory
     When I do A

   Scenario: Test B
     Given I have installed the package
     And I am in a test directory
     When I do B

   # Good - use Background
   Background:
     Given I have installed the package
     And I am in a test directory

   Scenario: Test A
     When I do A

   Scenario: Test B
     When I do B
   ```

## Testing Strategy

### Unit-level Features

Focus on single capability:

- Small, focused feature files
- Direct API testing
- Fast execution

**Example:** `packages/logger/features/basic-logging.feature`

### Integration Features

Test multiple components together:

- Medium-sized feature files
- Test component interactions
- Moderate execution time

**Example:** `packages/configurer/features/typescript-config.feature`

### E2E Features

Test complete user workflows:

- Comprehensive feature files
- Real environment testing
- Slower execution acceptable

**Example:** `apps/cli/features/infra/monorepo/create.feature`

## Best Practices Summary

1. ✅ Write features from user perspective
2. ✅ Use Background for common setup
3. ✅ Organize scenarios with Rules
4. ✅ Parameterize all dynamic values
5. ✅ Use Scenario Outline for data-driven tests
6. ✅ Include end-to-end scenarios for critical paths
7. ✅ Add comments for issue links and business rules
8. ✅ Keep scenarios focused and independent
9. ✅ Use meaningful names for scenarios
10. ✅ Test behavior, not implementation

## Maintenance

### When to Update Features

- ✅ When requirements change
- ✅ When new functionality is added
- ✅ When bugs are fixed (add regression test)
- ✅ When refactoring (keep features stable, update steps)

### When to Delete Features

- ✅ When functionality is removed
- ✅ When scenarios become obsolete
- ✅ When duplicating other scenarios

### Feature Review Checklist

- [ ] Feature has clear user story
- [ ] Scenarios are independent
- [ ] Steps are parameterized
- [ ] Background is used appropriately
- [ ] Rules organize scenarios logically
- [ ] End-to-end scenarios exist for critical paths
- [ ] Comments document business rules and issues
- [ ] Step definitions exist and pass
- [ ] Feature file follows naming conventions
- [ ] Examples cover edge cases

## References

- [Cucumber Best Practices](https://cucumber.io/docs/bdd/better-gherkin/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [BDD Introduction](https://cucumber.io/docs/bdd/)
