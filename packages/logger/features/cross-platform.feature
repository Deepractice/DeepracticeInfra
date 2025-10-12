Feature: Cross-Platform Support
  As a developer
  I want the logger to work in different JavaScript runtimes
  So that I can use it in Node.js, Cloudflare Workers, and browsers

  Background:
    Given I am testing logger cross-platform support

  Scenario: Auto-detect Node.js environment
    When I create a logger without specifying environment
    And the runtime is Node.js
    Then the logger should use Pino adapter
    And file logging should be available

  Scenario: Explicitly specify Cloudflare Workers environment
    When I create a logger with environment "cloudflare-workers"
    Then the logger should use console adapter
    And file logging should not be available
    And the logger should work without Node.js modules

  Scenario: Explicitly specify browser environment
    When I create a logger with environment "browser"
    Then the logger should use console adapter
    And file logging should not be available

  Scenario: Console adapter should log correctly
    Given I have a logger with environment "cloudflare-workers"
    When I log "Test message" at level "info"
    Then the log should be recorded
    And the log message should contain "Test message"

  Scenario: Environment parameter backward compatibility
    When I create a logger with traditional config
    Then the logger should work normally
    And all log levels should function
