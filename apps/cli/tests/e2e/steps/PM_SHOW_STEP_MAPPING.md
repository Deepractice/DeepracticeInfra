# PM Feature Show - Step Mapping Reference

Quick reference for mapping feature scenarios to step implementations.

---

## Step Definition Sources

| Step Type           | Source File        | Count  |
| ------------------- | ------------------ | ------ |
| Show-specific steps | `pm-show.steps.ts` | 23     |
| Reused common steps | `common.steps.ts`  | 7      |
| **Total**           |                    | **30** |

---

## Complete Step Mapping

### Background Steps

| Feature Step                                       | Implementation | File                |
| -------------------------------------------------- | -------------- | ------------------- |
| `Given I am in a NodeSpec monorepo root directory` | ✅ Implemented | pm-show.steps.ts:18 |
| `And the following feature is initialized:`        | ✅ Implemented | pm-show.steps.ts:45 |

### Command Execution

| Feature Step                               | Implementation | File               |
| ------------------------------------------ | -------------- | ------------------ |
| `When I run "nodespec pm feature show..."` | ✅ Reused      | common.steps.ts:71 |

### Show by ID (Scenarios 14-29)

| Feature Step                                          | Implementation | File                 |
| ----------------------------------------------------- | -------------- | -------------------- |
| `Then I should see feature details:`                  | ✅ Implemented | pm-show.steps.ts:161 |
| `And I should see section "Rules" with count`         | ✅ Implemented | pm-show.steps.ts:180 |
| `And I should see section "Scenarios" with count`     | ✅ Implemented | pm-show.steps.ts:180 |
| `Then I should see the complete feature file content` | ✅ Implemented | pm-show.steps.ts:192 |

### Show by Path (Scenarios 32-41)

| Feature Step                                                 | Implementation | File                 |
| ------------------------------------------------------------ | -------------- | -------------------- |
| `Given I am in directory "apps/cli/features/infra/monorepo"` | ✅ Implemented | pm-show.steps.ts:132 |
| `Then I should see feature details with ID "..."`            | ✅ Implemented | pm-show.steps.ts:206 |

### Structure Breakdown (Scenarios 45-61)

| Feature Step                                                     | Implementation | File                 |
| ---------------------------------------------------------------- | -------------- | -------------------- |
| `Then I should see "Rules (4):"`                                 | ✅ Implemented | pm-show.steps.ts:214 |
| `And I should see rule titles listed`                            | ✅ Implemented | pm-show.steps.ts:221 |
| `And I should see "Scenarios (11):"`                             | ✅ Implemented | pm-show.steps.ts:214 |
| `And I should see scenario titles grouped by rule`               | ✅ Implemented | pm-show.steps.ts:230 |
| `Given the feature has tags "@spec:id=..." and "@priority:high"` | ✅ Implemented | pm-show.steps.ts:139 |
| `Then I should see section "Tags" containing:`                   | ✅ Implemented | pm-show.steps.ts:239 |

### Output Formats (Scenarios 64-82)

| Feature Step                                  | Implementation | File                 |
| --------------------------------------------- | -------------- | -------------------- |
| `Then the output should be valid JSON`        | ✅ Implemented | pm-show.steps.ts:260 |
| `And the JSON should contain fields:`         | ✅ Implemented | pm-show.steps.ts:274 |
| `Then the output should be valid YAML`        | ✅ Implemented | pm-show.steps.ts:289 |
| `And the YAML should contain feature details` | ✅ Implemented | pm-show.steps.ts:302 |

### Metadata & Statistics (Scenarios 85-102)

| Feature Step                    | Implementation | File                 |
| ------------------------------- | -------------- | -------------------- |
| `Then I should see metadata:`   | ✅ Implemented | pm-show.steps.ts:318 |
| `Then I should see statistics:` | ✅ Implemented | pm-show.steps.ts:333 |

### Navigation & Related (Scenarios 105-116)

| Feature Step                                                             | Implementation | File                 |
| ------------------------------------------------------------------------ | -------------- | -------------------- |
| `Then I should see section "Related Features" containing features from:` | ✅ Implemented | pm-show.steps.ts:348 |
| `Then I should see "Open in editor: ..."`                                | ✅ Implemented | pm-show.steps.ts:214 |

### Error Handling (Scenarios 119-138)

| Feature Step                                                               | Implementation | File                |
| -------------------------------------------------------------------------- | -------------- | ------------------- |
| `Then the command should fail`                                             | ✅ Reused      | common.steps.ts:188 |
| `And I should see error message "Feature not found: ..."`                  | ✅ Reused      | common.steps.ts:196 |
| `And I should see error message "Feature file not found"`                  | ✅ Reused      | common.steps.ts:196 |
| `And I should see error message "Either --id or --path must be provided"`  | ✅ Reused      | common.steps.ts:196 |
| `And I should see error message "Cannot use both --id and --path options"` | ✅ Reused      | common.steps.ts:196 |

### Sync Check & Warnings (Scenarios 141-154)

| Feature Step                                                                          | Implementation | File                 |
| ------------------------------------------------------------------------------------- | -------------- | -------------------- |
| `Given the feature file was modified after last index update`                         | ✅ Implemented | pm-show.steps.ts:146 |
| `Then I should see warning "Feature file modified since last index update..."`        | ✅ Implemented | pm-show.steps.ts:254 |
| `Given the feature index shows path "..."`                                            | ✅ Implemented | pm-show.steps.ts:162 |
| `But the actual file is at "..."`                                                     | ✅ Implemented | pm-show.steps.ts:169 |
| `And I should see error message "Feature file not found at indexed path"`             | ✅ Reused      | common.steps.ts:196  |
| `And I should see suggestion "Run 'nodespec pm feature init --all' to rebuild index"` | ✅ Reused      | common.steps.ts:212  |

---

## Step Parameters Reference

### String Parameters

```typescript
{
  string;
} // Matches: "any text in quotes"
```

Used in:

- Command execution: `When I run {string}`
- File paths: `I am in directory {string}`
- Feature IDs: `feature details with ID {string}`
- Error messages: `I should see error message {string}`

### DataTable Parameters

```gherkin
Then step with table:
  | column1 | column2 |
  | value1  | value2  |
```

Used in:

- Feature initialization: `the following feature is initialized:`
- Feature details: `I should see feature details:`
- JSON fields: `the JSON should contain fields:`
- Metadata: `I should see metadata:`
- Statistics: `I should see statistics:`
- Tags: `I should see section "Tags" containing:`

---

## Example Usage Patterns

### Basic Show Command

```gherkin
Given I am in a NodeSpec monorepo root directory
And the following feature is initialized:
  | id                      | path                              |
  | cli-infra-monorepo-init | apps/cli/features/infra/init.feature |
When I run "nodespec pm feature show --id cli-infra-monorepo-init"
Then the command should succeed
And I should see feature details with ID "cli-infra-monorepo-init"
```

### JSON Output Format

```gherkin
When I run "nodespec pm feature show --id cli-infra-monorepo-init --format json"
Then the command should succeed
And the output should be valid JSON
And the JSON should contain fields:
  | field     |
  | id        |
  | title     |
  | path      |
```

### Error Handling

```gherkin
When I run "nodespec pm feature show --id nonexistent"
Then the command should fail
And I should see error message "Feature not found: nonexistent"
```

### Stale Index Detection

```gherkin
Given the feature file was modified after last index update
When I run "nodespec pm feature show --id cli-infra-monorepo-init"
Then the command should succeed
And I should see warning "Feature file modified since last index update..."
```

---

## Implementation Notes

### Context Storage

The `InfraWorld` interface provides context storage:

```typescript
this.set("key", value); // Store value
this.get("key"); // Retrieve value
```

Used for:

- Expected tags: `this.set('expectedTags', [tag1, tag2])`
- Stale warnings: `this.set('expectStaleWarning', true)`
- File movements: `this.set('featureMovedTo', path)`

### File Operations

All file operations use absolute paths:

```typescript
const fullPath = path.join(this.testDir!, relativePath);
await fs.writeFile(fullPath, content);
```

### Output Capture

All command output is captured:

```typescript
const allOutput = [...this.stdout, ...this.stderr].join("\n");
expect(allOutput).to.include(expectedText);
```

---

## Testing Tips

### Run Specific Scenario

```bash
# By line number
pnpm test -- features/pm/feature/show.feature:14

# By scenario name
pnpm test -- --grep "Show feature details using ID"
```

### Debug Output

Enable debug mode to see command output:

```bash
DEBUG=1 pnpm test -- features/pm/feature/show.feature
```

### Check Step Coverage

```bash
# Find undefined steps
pnpm test -- --dry-run features/pm/feature/show.feature
```

---

## Related Files

- **Feature Spec**: `apps/cli/features/pm/feature/show.feature`
- **Step Definitions**: `apps/cli/tests/e2e/steps/pm-show.steps.ts`
- **Common Steps**: `apps/cli/tests/e2e/steps/common.steps.ts`
- **World Context**: `apps/cli/tests/e2e/support/world.ts`
- **Implementation Report**: `apps/cli/tests/e2e/steps/PM_SHOW_IMPLEMENTATION_REPORT.md`

---

**Last Updated**: 2025-10-13
