Feature: Test Environment Support
  As a developer writing tests
  I want the logger to work seamlessly in test environments
  So that I can write reliable tests without polluting test output

  Background:
    Given I am running in a test environment

  Rule: Test environment should be auto-detected

    Scenario: Auto-detect vitest environment
      Given VITEST environment variable is "true"
      When I create a logger without specifying environment
      Then the logger should use test adapter
      And logs should be captured in memory

    Scenario: Explicitly specify test environment
      When I create a logger with environment "test"
      Then the logger should use test adapter
      And logs should be captured in memory

  Rule: Logs should be captured in memory by default

    Scenario: Log messages are captured silently
      Given I have a test logger
      When I log "test message" at level "info"
      And I log "warning message" at level "warn"
      And I log "error message" at level "error"
      Then captured logs should contain 3 entries
      And captured log at index 0 should have level "info"
      And captured log at index 0 should have message "test message"
      And captured log at index 1 should have level "warn"
      And captured log at index 2 should have level "error"

    Scenario: Logs can be cleared between tests
      Given I have a test logger
      When I log "first message" at level "info"
      And I clear captured logs
      And I log "second message" at level "info"
      Then captured logs should contain 1 entries
      And captured log at index 0 should have message "second message"

  Rule: Console output should be controllable

    Scenario: Default silent mode in tests
      Given I have a test logger with default config
      When I log "test message" at level "info"
      Then the message should not be output to console
      And the message should be captured in memory

    Scenario: Enable console output with config
      Given I have a test logger with console enabled
      When I log "test message" at level "info"
      Then the message should be output to console
      And the message should be captured in memory

  Rule: Log inspection utilities should be available

    Scenario: Get captured logs
      Given I have a test logger
      When I log "message 1" at level "info"
      And I log "message 2" at level "warn"
      And I get captured logs
      Then the result should be an array of 2 log entries
      And each entry should have level, message, and timestamp

    Scenario: Filter logs by level
      Given I have a test logger
      When I log "info message" at level "info"
      And I log "warn message" at level "warn"
      And I log "error message" at level "error"
      And I get captured logs filtered by level "warn"
      Then the result should contain 1 entry
      And the entry should have message "warn message"

  Rule: Test logger should support same API as production

    Scenario: All log levels work in test environment
      Given I have a test logger
      When I call logger method "trace" with "trace msg"
      And I call logger method "debug" with "debug msg"
      And I call logger method "info" with "info msg"
      And I call logger method "warn" with "warn msg"
      And I call logger method "error" with "error msg"
      And I call logger method "fatal" with "fatal msg"
      Then captured logs should contain 6 entries
      And all standard log levels should be present

    Scenario: Log with context objects
      Given I have a test logger
      When I log "user action" at level "info" with context:
        | key    | value  |
        | userId | 123    |
        | action | login  |
      Then captured logs should contain the context data
      And the context should have "userId" equal to "123"
      And the context should have "action" equal to "login"

  Rule: Integration with vitest reporter

    Scenario: Verbose mode shows logs
      Given I have a test logger with console enabled
      And vitest is running with verbose reporter
      When I log "debug message" at level "debug"
      Then the message should be visible in test output

    Scenario: Default mode hides logs
      Given I have a test logger with default config
      And vitest is running with default reporter
      When I log "debug message" at level "debug"
      Then the message should not be visible in test output
      And the message should still be captured in memory
