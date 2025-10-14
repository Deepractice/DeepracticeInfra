Feature: List Features with Filtering and Formatting
  As a Product Manager using NodeSpec
  I want to list all features in the monorepo
  So that I can quickly browse and find features by various criteria

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the following features are initialized:
      | id                         | path                                            | title                                    |
      | cli-infra-monorepo-init    | apps/cli/features/infra/monorepo/init.feature  | Initialize Monorepo in Current Directory |
      | cli-infra-monorepo-create  | apps/cli/features/infra/monorepo/create.feature| Create New Monorepo Project              |
      | cli-infra-app-create       | apps/cli/features/infra/app/create.feature     | Create New Application                   |
      | logger-core-logging        | packages/logger/features/core/logging.feature  | Core Logging Functionality               |

  Rule: List all features with default format

    Scenario: List all features in default table format
      When I run "nodespec pm feature list"
      Then the command should succeed
      And I should see a table with columns:
        | column |
        | ID     |
        | Title  |
        | Path   |
      And the output should contain 4 features
      And the output should contain "cli-infra-monorepo-init"

    Scenario: List shows features sorted by ID alphabetically
      When I run "nodespec pm feature list"
      Then the command should succeed
      And features should be listed in alphabetical order by ID

  Rule: Filter features by path pattern

    Scenario: Filter features by directory path
      When I run "nodespec pm feature list --path apps/cli"
      Then the command should succeed
      And the output should contain 3 features
      And the output should contain "cli-infra-monorepo-init"
      And the output should not contain "logger-core-logging"

    Scenario: Filter features by glob pattern
      When I run "nodespec pm feature list --path '*/infra/monorepo/*'"
      Then the command should succeed
      And the output should contain 2 features
      And the output should contain "cli-infra-monorepo-init"
      And the output should contain "cli-infra-monorepo-create"

  Rule: Filter features by ID pattern

    Scenario: Filter features by ID prefix
      When I run "nodespec pm feature list --id cli-infra"
      Then the command should succeed
      And the output should contain 3 features
      And all feature IDs should start with "cli-infra"

    Scenario: Filter features by exact ID
      When I run "nodespec pm feature list --id cli-infra-monorepo-init"
      Then the command should succeed
      And the output should contain 1 feature
      And the output should contain "cli-infra-monorepo-init"

  Rule: Output format options

    Scenario: Output as JSON for programmatic use
      When I run "nodespec pm feature list --format json"
      Then the command should succeed
      And the output should be valid JSON
      And the JSON should contain array with 4 features
      And each feature should have fields:
        | field  |
        | id     |
        | path   |
        | title  |

    Scenario: Output as compact list (IDs only)
      When I run "nodespec pm feature list --format compact"
      Then the command should succeed
      And the output should contain only IDs, one per line
      And the output should contain 4 lines

  Rule: Handle empty or uninitialized state

    Scenario: List when no features are initialized
      Given no features are initialized
      When I run "nodespec pm feature list"
      Then the command should succeed
      And I should see message "No features found. Run 'nodespec pm feature init --all' to initialize."

    Scenario: List when feature index does not exist
      Given no feature index exists
      When I run "nodespec pm feature list"
      Then the command should succeed
      And I should see message "Feature index not found. Run 'nodespec pm feature init --all' to create index."

  Rule: Statistics and summary

    Scenario: Show feature count summary
      When I run "nodespec pm feature list"
      Then the command should succeed
      And I should see summary "Total: 4 features"

    Scenario: Show filtered count summary
      When I run "nodespec pm feature list --path apps/cli"
      Then the command should succeed
      And I should see summary "Total: 3 features (filtered)"

  Rule: Validation and error handling

    Scenario: Warn about stale index entries
      Given the feature index contains an entry for "cli-infra-deleted"
      But the feature file "apps/cli/features/infra/deleted.feature" does not exist
      When I run "nodespec pm feature list"
      Then the command should succeed
      And I should see warning "Found 1 stale entry. Run 'nodespec pm feature init --all' to refresh."

    Scenario: Fail when not in NodeSpec monorepo
      Given I am not in a NodeSpec monorepo directory
      When I run "nodespec pm feature list"
      Then the command should fail
      And I should see error message "Not a NodeSpec monorepo"

# Linked to: Issue #14 (PM Feature Management)
# Business Rule: List provides quick overview of all features in monorepo
# Business Rule: Supports filtering by path and ID for focused browsing
# Business Rule: Multiple output formats for different use cases (human, script)
