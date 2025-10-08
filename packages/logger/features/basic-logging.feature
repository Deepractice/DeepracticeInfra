Feature: Basic Logging
  As a developer
  I want to log messages at different levels
  So that I can track application behavior and debug issues

  Background:
    Given I have a logger instance

  Rule: Log levels should work correctly

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

  Rule: Logger should accept message with context object

    Scenario: Log message with context data
      When I log "User login" at level "info" with context:
        | key    | value      |
        | userId | 123        |
        | ip     | 127.0.0.1  |
      Then the log should include context data
      And the context should have "userId" equal to "123"
      And the context should have "ip" equal to "127.0.0.1"

  Rule: Custom logger instance should use package name

    Scenario: Create custom logger with package name
      When I create a logger with name "@deepracticex/account-service"
      And I log "Service started" at level "info"
      Then the log should include package name "@deepracticex/account-service"
