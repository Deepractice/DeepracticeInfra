Feature: Commitlint Configuration
  As a developer
  I want to use pre-configured Commitlint settings
  So that I can maintain consistent commit message format across projects

  Background:
    Given I have installed "@deepracticex/configurer"
    Scenario: Use default Commitlint config
      When I import commitlint.base from the package
      Then the config should extend "@commitlint/config-conventional"
      And the config should support commit types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
      And the config should allow flexible subject case
      And the config should limit subject to 100 characters
    Scenario Outline: Validate commit message format
      When I commit with message "<message>"
      Then the validation should "<result>"

      Examples:
        | message                           | result |
        | feat: add new feature             | pass   |
        | fix: resolve bug                  | pass   |
        | docs: update README               | pass   |
        | invalid commit message            | fail   |
        | feat: this is a very long subject line that exceeds the maximum allowed length of 100 characters and should fail | fail   |
