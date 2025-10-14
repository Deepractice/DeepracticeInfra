Feature: Show Feature Details
  As a Product Manager using NodeSpec
  I want to view detailed information about a specific feature
  So that I can understand its content, rules, and scenarios without opening the file

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the following feature is initialized:
      | id                         | path                                            |
      | cli-infra-monorepo-init    | apps/cli/features/infra/monorepo/init.feature  |

  Rule: Show feature by ID

    Scenario: Show feature details using ID
      When I run "nodespec pm feature show --id cli-infra-monorepo-init"
      Then the command should succeed
      And I should see feature details:
        | field  | value                                           |
        | ID     | cli-infra-monorepo-init                         |
        | Title  | Initialize Monorepo in Current Directory        |
        | Path   | apps/cli/features/infra/monorepo/init.feature  |
      And I should see section "Rules" with count
      And I should see section "Scenarios" with count

    Scenario: Show feature with full content
      When I run "nodespec pm feature show --id cli-infra-monorepo-init --full"
      Then the command should succeed
      And I should see the complete feature file content

  Rule: Show feature by path

    Scenario: Show feature details using relative path
      When I run "nodespec pm feature show --path apps/cli/features/infra/monorepo/init.feature"
      Then the command should succeed
      And I should see feature details with ID "cli-infra-monorepo-init"

    Scenario: Show feature using path from current directory
      Given I am in directory "apps/cli/features/infra/monorepo"
      When I run "nodespec pm feature show --path init.feature"
      Then the command should succeed
      And I should see feature details with ID "cli-infra-monorepo-init"

  Rule: Display feature structure breakdown

    Scenario: Show rules and scenarios breakdown
      When I run "nodespec pm feature show --id cli-infra-monorepo-init"
      Then the command should succeed
      And I should see "Rules (4):"
      And I should see rule titles listed
      And I should see "Scenarios (11):"
      And I should see scenario titles grouped by rule

    Scenario: Show tags associated with feature
      Given the feature has tags "@spec:id=cli-infra-monorepo-init" and "@priority:high"
      When I run "nodespec pm feature show --id cli-infra-monorepo-init"
      Then the command should succeed
      And I should see section "Tags" containing:
        | tag           |
        | @spec:id      |
        | @priority     |

  Rule: Output format options

    Scenario: Output as JSON
      When I run "nodespec pm feature show --id cli-infra-monorepo-init --format json"
      Then the command should succeed
      And the output should be valid JSON
      And the JSON should contain fields:
        | field     |
        | id        |
        | title     |
        | path      |
        | rules     |
        | scenarios |
        | tags      |

    Scenario: Output as YAML
      When I run "nodespec pm feature show --id cli-infra-monorepo-init --format yaml"
      Then the command should succeed
      And the output should be valid YAML
      And the YAML should contain feature details

  Rule: Show metadata and statistics

    Scenario: Show feature file metadata
      When I run "nodespec pm feature show --id cli-infra-monorepo-init --metadata"
      Then the command should succeed
      And I should see metadata:
        | field         | description           |
        | File Size     | in bytes or KB        |
        | Last Modified | timestamp             |
        | Line Count    | total lines in file   |

    Scenario: Show feature complexity metrics
      When I run "nodespec pm feature show --id cli-infra-monorepo-init --stats"
      Then the command should succeed
      And I should see statistics:
        | metric             | description                    |
        | Total Scenarios    | count of all scenarios         |
        | Total Steps        | count of Given/When/Then steps |
        | Scenario Examples  | count of scenario outlines     |

  Rule: Navigation aids

    Scenario: Show related features by path proximity
      When I run "nodespec pm feature show --id cli-infra-monorepo-init --related"
      Then the command should succeed
      And I should see section "Related Features" containing features from:
        | path_pattern                  |
        | apps/cli/features/infra/monorepo/* |

    Scenario: Show file location for quick access
      When I run "nodespec pm feature show --id cli-infra-monorepo-init"
      Then the command should succeed
      And I should see "Open in editor: apps/cli/features/infra/monorepo/init.feature"

  Rule: Error handling

    Scenario: Fail when feature ID not found
      When I run "nodespec pm feature show --id nonexistent-feature"
      Then the command should fail
      And I should see error message "Feature not found: nonexistent-feature"

    Scenario: Fail when feature path not found
      When I run "nodespec pm feature show --path nonexistent/path.feature"
      Then the command should fail
      And I should see error message "Feature file not found"

    Scenario: Fail when neither ID nor path provided
      When I run "nodespec pm feature show"
      Then the command should fail
      And I should see error message "Either --id or --path must be provided"

    Scenario: Fail when both ID and path provided
      When I run "nodespec pm feature show --id cli-infra-monorepo-init --path apps/cli/features/infra/monorepo/init.feature"
      Then the command should fail
      And I should see error message "Cannot use both --id and --path options"

  Rule: Sync check between index and file

    Scenario: Warn when feature file changed but index stale
      Given the feature file was modified after last index update
      When I run "nodespec pm feature show --id cli-infra-monorepo-init"
      Then the command should succeed
      And I should see warning "Feature file modified since last index update. Run 'nodespec pm feature init --all' to refresh."

    Scenario: Warn when feature moved
      Given the feature index shows path "apps/cli/features/infra/monorepo/init.feature"
      But the actual file is at "apps/cli/features/infra/monorepo/initialize.feature"
      When I run "nodespec pm feature show --id cli-infra-monorepo-init"
      Then the command should fail
      And I should see error message "Feature file not found at indexed path"
      And I should see suggestion "Run 'nodespec pm feature init --all' to rebuild index"

# Linked to: Issue #14 (PM Feature Management)
# Business Rule: Show provides detailed view of single feature for PM inspection
# Business Rule: Supports both ID and path lookup for flexibility
# Business Rule: Displays feature structure breakdown for quick understanding
# Business Rule: Detects index staleness and guides user to refresh
