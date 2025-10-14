Feature: Initialize Feature with @spec:id Tag
  As a Product Manager using NodeSpec
  I want to initialize features with unique @spec:id tags
  So that I can identify and manage features independently of file paths

  Background:
    Given I am in a NodeSpec monorepo root directory

  Rule: Initialize single feature with auto-generated ID

    Scenario: Initialize feature with auto-generated ID based on path
      Given a feature file exists at "apps/cli/features/infra/monorepo/init.feature"
      And the feature has no @spec:id tag
      When I run "nodespec pm feature init apps/cli/features/infra/monorepo/init.feature"
      Then the command should succeed
      And the feature should have tag "@spec:id=cli-infra-monorepo-init"
      And the feature index should contain entry:
        | id                         | path                                            |
        | cli-infra-monorepo-init    | apps/cli/features/infra/monorepo/init.feature  |

    Scenario: Initialize feature that already has @spec:id (idempotent)
      Given a feature file exists at "apps/cli/features/infra/monorepo/init.feature"
      And the feature has tag "@spec:id=cli-infra-monorepo-init"
      When I run "nodespec pm feature init apps/cli/features/infra/monorepo/init.feature"
      Then the command should succeed
      And the feature should still have tag "@spec:id=cli-infra-monorepo-init"
      And I should see message "Feature already initialized"

  Rule: Initialize all features in monorepo

    Scenario: Initialize all features without @spec:id
      Given the following feature files exist without @spec:id:
        | path                                              |
        | apps/cli/features/infra/monorepo/init.feature    |
        | apps/cli/features/infra/monorepo/create.feature  |
        | apps/cli/features/infra/app/create.feature       |
      When I run "nodespec pm feature init --all"
      Then the command should succeed
      And all features should have @spec:id tags
      And the feature index should contain 3 entries
      And I should see message "Initialized 3 features"

    Scenario: Initialize all features with some already initialized
      Given the following feature files exist:
        | path                                              | has_spec_id |
        | apps/cli/features/infra/monorepo/init.feature    | yes         |
        | apps/cli/features/infra/monorepo/create.feature  | no          |
        | apps/cli/features/infra/app/create.feature       | no          |
      When I run "nodespec pm feature init --all"
      Then the command should succeed
      And all features should have @spec:id tags
      And the feature index should contain 3 entries
      And I should see message "Initialized 2 features, 1 already initialized"

  Rule: ID generation follows path-to-kebab-case convention

    Scenario Outline: Generate ID from various paths
      Given a feature file exists at "<path>"
      When I run "nodespec pm feature init <path>"
      Then the feature should have tag "@spec:id=<expected_id>"

      Examples:
        | path                                              | expected_id                    |
        | apps/cli/features/infra/monorepo/init.feature    | cli-infra-monorepo-init        |
        | apps/cli/features/infra/app/create.feature       | cli-infra-app-create           |
        | packages/logger/features/core/logging.feature    | logger-core-logging            |
        | services/api/features/user/auth.feature          | api-user-auth                  |

  Rule: Feature index is maintained in .nodespec/pm/index.json

    Scenario: Create feature index on first init
      Given no feature index exists
      When I run "nodespec pm feature init apps/cli/features/infra/monorepo/init.feature"
      Then the command should succeed
      And ".nodespec/pm/index.json" should exist
      And the index should have version "1.0.0"

    Scenario: Update existing feature index
      Given a feature index exists with 2 entries
      When I run "nodespec pm feature init apps/cli/features/infra/app/create.feature"
      Then the command should succeed
      And the feature index should contain 3 entries

  Rule: Validation prevents invalid operations

    Scenario: Fail when feature file does not exist
      Given no feature file exists at "apps/cli/features/nonexistent.feature"
      When I run "nodespec pm feature init apps/cli/features/nonexistent.feature"
      Then the command should fail
      And I should see error message "Feature file not found"

    Scenario: Fail when not in NodeSpec monorepo
      Given I am not in a NodeSpec monorepo directory
      When I run "nodespec pm feature init --all"
      Then the command should fail
      And I should see error message "Not a NodeSpec monorepo"

# Linked to: Issue #14 (PM Feature Management)
# Business Rule: Each feature must have unique @spec:id for PM tracking
# Business Rule: ID is auto-generated from path and immutable after creation
# Business Rule: Init command is idempotent and safe to run multiple times
