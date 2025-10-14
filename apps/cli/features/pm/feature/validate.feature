Feature: Validate Feature Tags and Index Integrity
  As a Product Manager using NodeSpec
  I want to validate @spec tags and index consistency
  So that I can ensure feature management system integrity

  Background:
    Given I am in a NodeSpec monorepo root directory

  Rule: Validate single feature file

    Scenario: Validate feature with correct @spec:id tag
      Given a feature file exists at "apps/cli/features/infra/monorepo/init.feature"
      And the feature has tag "@spec:id=cli-infra-monorepo-init"
      And the feature is in the index
      When I run "nodespec pm feature validate apps/cli/features/infra/monorepo/init.feature"
      Then the command should succeed
      And I should see message "✓ Feature valid: cli-infra-monorepo-init"

    Scenario: Detect feature missing @spec:id tag
      Given a feature file exists at "apps/cli/features/infra/app/create.feature"
      And the feature has no @spec:id tag
      When I run "nodespec pm feature validate apps/cli/features/infra/app/create.feature"
      Then the command should fail
      And I should see error "Missing @spec:id tag"
      And I should see suggestion "Run 'nodespec pm feature init apps/cli/features/infra/app/create.feature'"

  Rule: Validate all features in monorepo

    Scenario: Validate all features successfully
      Given all feature files have valid @spec:id tags
      And all features are in the index
      When I run "nodespec pm feature validate --all"
      Then the command should succeed
      And I should see summary "All 4 features are valid"

    Scenario: Detect multiple validation issues
      Given the following feature validation states:
        | path                                              | has_spec_id | in_index | file_exists |
        | apps/cli/features/infra/monorepo/init.feature    | yes         | yes      | yes         |
        | apps/cli/features/infra/monorepo/create.feature  | no          | no       | yes         |
        | apps/cli/features/infra/app/create.feature       | yes         | yes      | no          |
      When I run "nodespec pm feature validate --all"
      Then the command should fail
      And I should see validation report:
        | issue_type            | count |
        | Missing @spec:id      | 1     |
        | Stale index entry     | 1     |
        | Valid features        | 1     |

  Rule: Validate @spec:id format and uniqueness

    Scenario: Detect malformed @spec:id tag
      Given a feature has tag "@spec:id=Invalid ID With Spaces"
      When I run "nodespec pm feature validate apps/cli/features/test.feature"
      Then the command should fail
      And I should see error "Invalid @spec:id format. Must be kebab-case."

    Scenario: Detect duplicate @spec:id across features
      Given two features have the same "@spec:id=cli-infra-duplicate"
      When I run "nodespec pm feature validate --all"
      Then the command should fail
      And I should see error "Duplicate @spec:id found: cli-infra-duplicate"
      And I should see the paths of both features

  Rule: Validate index consistency

    Scenario: Detect feature in index but file missing
      Given the index contains entry "cli-infra-deleted"
      But the feature file does not exist
      When I run "nodespec pm feature validate --all"
      Then the command should fail
      And I should see warning "Stale index entry: cli-infra-deleted (file not found)"
      And I should see suggestion "Run 'nodespec pm feature init --all' to rebuild index"

    Scenario: Detect feature file exists but not in index
      Given a feature file exists with @spec:id "cli-infra-orphan"
      But the feature is not in the index
      When I run "nodespec pm feature validate --all"
      Then the command should fail
      And I should see warning "Feature not in index: cli-infra-orphan"
      And I should see suggestion "Run 'nodespec pm feature init --all' to update index"

    Scenario: Detect index path mismatch
      Given the index shows feature "cli-infra-monorepo-init" at path "apps/cli/features/old/path.feature"
      But the feature file is actually at "apps/cli/features/infra/monorepo/init.feature"
      When I run "nodespec pm feature validate --all"
      Then the command should fail
      And I should see error "Path mismatch for cli-infra-monorepo-init"
      And I should see "Expected: apps/cli/features/old/path.feature"
      And I should see "Found: apps/cli/features/infra/monorepo/init.feature"

  Rule: Validation output formats

    Scenario: Show validation report in table format
      When I run "nodespec pm feature validate --all"
      Then the command should succeed
      And I should see a table with validation results

    Scenario: Output validation report as JSON
      When I run "nodespec pm feature validate --all --format json"
      Then the command should succeed
      And the output should be valid JSON
      And the JSON should contain validation results with fields:
        | field           |
        | valid           |
        | invalid         |
        | errors          |
        | warnings        |

  Rule: Auto-fix suggestions

    Scenario: Suggest fix for missing tags
      Given 2 features are missing @spec:id tags
      When I run "nodespec pm feature validate --all"
      Then the command should fail
      And I should see suggestion "Run 'nodespec pm feature init --all' to add missing tags"

    Scenario: Suggest fix for index issues
      Given the index has 1 stale entry
      When I run "nodespec pm feature validate --all"
      Then the command should fail
      And I should see suggestion "Run 'nodespec pm feature init --all' to rebuild index"

    Scenario: Validate with auto-fix flag
      Given 2 features are missing @spec:id tags
      When I run "nodespec pm feature validate --all --fix"
      Then the command should succeed
      And missing tags should be automatically added
      And I should see message "Fixed 2 issues automatically"

  Rule: CI/CD integration support

    Scenario: Exit with error code on validation failure
      Given validation finds 1 error
      When I run "nodespec pm feature validate --all"
      Then the command should exit with code 1

    Scenario: Exit with success code when all valid
      Given all features are valid
      When I run "nodespec pm feature validate --all"
      Then the command should exit with code 0

    Scenario: Strict mode fails on warnings
      Given validation finds 1 warning but no errors
      When I run "nodespec pm feature validate --all --strict"
      Then the command should exit with code 1
      And I should see message "Strict mode: treating warnings as errors"

  Rule: Performance optimization

    Scenario: Fast validation using index cache
      Given the feature index is up to date
      When I run "nodespec pm feature validate --all --fast"
      Then the command should succeed
      And validation should use index without reading all files
      And I should see message "Fast mode: validated using index cache"

    Scenario: Force full validation
      When I run "nodespec pm feature validate --all --no-cache"
      Then the command should succeed
      And all feature files should be read and validated
      And I should see message "Full validation: read 4 feature files"

# Linked to: Issue #14 (PM Feature Management)
# Business Rule: Validate ensures @spec:id tag presence and correctness
# Business Rule: Validate checks index consistency with actual feature files
# Business Rule: Validation can auto-fix common issues with --fix flag
# Business Rule: Supports CI/CD integration with exit codes and strict mode
