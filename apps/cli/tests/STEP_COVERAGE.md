# Step Definition Coverage Analysis

## Phase 1 Features Step Coverage

### Monorepo Init Feature (`monorepo/init.feature`)

#### Background Steps

- ✅ `Given I am in a temporary test directory` - **common.steps.ts**

#### Scenario Steps

- ✅ `Given I am in an empty directory` - **common.steps.ts**
- ✅ `When I run {string}` - **common.steps.ts** (supports new command structure)
- ✅ `Then the command should succeed` - **common.steps.ts**
- ✅ `Then the following files should exist:` - **scaffold.steps.ts**
- ✅ `And {string} should contain {string}` - **scaffold.steps.ts**
- ✅ `And the following directories should exist:` - **scaffold.steps.ts**
- ✅ `Given I am in a directory with an existing {string}` - **common.steps.ts**
- ✅ `Then the command should fail` - **common.steps.ts**
- ✅ `And I should see error message {string}` - **common.steps.ts**
- ✅ `And {string} directory should exist` - **scaffold.steps.ts**
- ✅ `And {string} should exist` - **scaffold.steps.ts**
- ✅ `And {string} directory should not exist` - **scaffold.steps.ts**
- ✅ `And {string} should not exist` - **scaffold.steps.ts**
- ✅ `And git repository should have initial commit` - **scaffold.steps.ts**
- ✅ `And git commit message should contain {string}` - **scaffold.steps.ts**
- ✅ `And git repository should not be initialized` - **scaffold.steps.ts**

### Monorepo Create Feature (`monorepo/create.feature`)

#### Scenario Steps

- ✅ `Given I am in a test directory` - **common.steps.ts**
- ✅ `When I run {string}` - **common.steps.ts**
- ✅ `Then the command should succeed` - **common.steps.ts**
- ✅ `And directory {string} should exist` - **scaffold.steps.ts**
- ✅ `And the following files should exist in {string}:` - **scaffold.steps.ts**
- ✅ `And {string}/{string} should contain {string}` - **scaffold.steps.ts**
- ✅ `Given directory {string} exists` - **common.steps.ts**
- ✅ `Then the command should fail` - **common.steps.ts**
- ✅ `And I should see error message {string}` - **common.steps.ts**
- ✅ `When I navigate to {string}` - **common.steps.ts**
- ✅ `When I create a test package in {string}` - **scaffold.steps.ts**
- ✅ `When I run {string} in {string}` - **common.steps.ts**
- ✅ `When I create directory {string}` - **scaffold.steps.ts**
- ✅ `When I create {string} with:` - **scaffold.steps.ts**
- ✅ `Then file {string} should exist` - **scaffold.steps.ts**

### Package Add Feature (`package/add.feature`)

#### Background Steps

- ✅ `Given I am in a NodeSpec monorepo root directory` - **workspace.steps.ts**
- ✅ `And the monorepo has been initialized` - **workspace.steps.ts**

#### Scenario Steps

- ✅ `Given I am in the monorepo root` - **workspace.steps.ts**
- ✅ `When I run {string}` - **common.steps.ts**
- ✅ `Then the command should succeed` - **common.steps.ts**
- ✅ `And the following files should exist:` - **scaffold.steps.ts**
- ✅ `And {string} should contain {string}` - **scaffold.steps.ts**
- ✅ `And directory {string} should exist` - **scaffold.steps.ts**
- ✅ `And I run {string}` - **common.steps.ts** (alias for When I run)
- ✅ `And file {string} should exist` - **scaffold.steps.ts**
- ✅ `Given package {string} already exists in {string}` - **workspace.steps.ts**
- ✅ `Then the command should fail` - **common.steps.ts**
- ✅ `And I should see error message {string}` - **common.steps.ts**
- ✅ `Given I am in a non-monorepo directory` - **workspace.steps.ts**

### App Add Feature (`app/add.feature`)

#### Background Steps

- ✅ `Given I am in a NodeSpec monorepo root directory` - **workspace.steps.ts**
- ✅ `And the monorepo has been initialized` - **workspace.steps.ts**

#### Scenario Steps

- ✅ `Given I am in the monorepo root` - **workspace.steps.ts**
- ✅ `When I run {string}` - **common.steps.ts**
- ✅ `Then the command should succeed` - **common.steps.ts**
- ✅ `And the following files should exist:` - **scaffold.steps.ts**
- ✅ `And {string} should contain {string}` - **scaffold.steps.ts**
- ✅ `And directory {string} should exist` - **scaffold.steps.ts**
- ✅ `And I run {string}` - **common.steps.ts**
- ✅ `And file {string} should exist` - **scaffold.steps.ts**
- ✅ `And file {string} should be executable` - **workspace.steps.ts**
- ✅ `Given app {string} already exists in {string}` - **workspace.steps.ts**
- ✅ `Then the command should fail` - **common.steps.ts**
- ✅ `And I should see error message {string}` - **common.steps.ts**
- ✅ `Given I am in a non-monorepo directory` - **workspace.steps.ts**

## Summary

### Total Coverage: 100%

All step definitions required for Phase 1 features are implemented and ready to use.

### Step Definition Files

1. **common.steps.ts** (73 lines)
   - Background/setup steps
   - Command execution
   - Basic assertions
   - Directory navigation

2. **scaffold.steps.ts** (269 lines)
   - File existence checks
   - Directory existence checks
   - Content validation
   - Git repository validation
   - File creation helpers

3. **workspace.steps.ts** (221 lines) - **NEW**
   - Monorepo context setup
   - Package/app existence preconditions
   - Non-monorepo context
   - Executable file validation

### Key Features

1. **New Command Structure Support**
   - The existing `When I run {string}` step supports the new command structure
   - Commands like `nodespec scaffold monorepo init` work without modification
   - Commands like `nodespec scaffold package add my-lib` work without modification

2. **Reusable Steps**
   - All steps are parameterized for maximum reusability
   - Generic steps work across all domains (monorepo, package, app)
   - Common patterns extracted to common.steps.ts

3. **Comprehensive Validation**
   - File existence and content checks
   - Directory structure validation
   - Git repository state checks
   - Executable file validation
   - Error message validation

4. **Test Context Management**
   - ScaffoldWorld provides shared context
   - Test directory isolation
   - Command execution state tracking
   - Output capture for debugging

## Next Steps

1. **Run Tests**: Execute the test suite to verify all steps work correctly

   ```bash
   cd /Users/sean/Deepractice/projects/NodeSpec/apps/cli
   pnpm test:e2e
   ```

2. **Implementation Order**:
   - First implement `nodespec scaffold monorepo init`
   - Then implement `nodespec scaffold monorepo create`
   - Then implement `nodespec scaffold package add`
   - Finally implement `nodespec scaffold app add`

3. **Test Each Feature Incrementally**:
   - Run tests after implementing each command
   - Fix any failing scenarios
   - Iterate until all scenarios pass

## Notes

- All TypeScript type errors have been fixed (ProjectWorld → ScaffoldWorld)
- The workspace.steps.ts file handles monorepo-specific context
- Executable file validation checks both shebang and permissions (Unix)
- All steps follow the existing patterns in common.steps.ts and scaffold.steps.ts
