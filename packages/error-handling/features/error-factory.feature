Feature: Error Factory
  As a developer
  I want to create errors easily using the error factory
  So that I can handle errors consistently across the application

  Background:
    Given I have the error factory imported

  Rule: HTTP Errors should have correct status codes and error codes

    Scenario Outline: Create common HTTP errors
      When I create a "<errorType>" error
      Then the error should be an instance of AppError
      And the error status code should be <statusCode>
      And the error code should be "<errorCode>"

      Examples:
        | errorType     | statusCode | errorCode              |
        | notFound      | 404        | NOT_FOUND              |
        | unauthorized  | 401        | UNAUTHORIZED           |
        | forbidden     | 403        | FORBIDDEN              |
        | validation    | 400        | VALIDATION_ERROR       |
        | conflict      | 409        | CONFLICT               |
        | unprocessable | 422        | UNPROCESSABLE_ENTITY   |
        | rateLimit     | 429        | RATE_LIMIT_EXCEEDED    |
        | internal      | 500        | INTERNAL_ERROR         |
        | unavailable   | 503        | SERVICE_UNAVAILABLE    |

  Rule: Not found errors should include resource information

    Scenario: Create not found error with resource and identifier
      When I create a not found error with:
        | resource   | User |
        | identifier | 123  |
      Then the error message should be "User with identifier '123' not found"
      And the error meta should contain:
        | key        | value |
        | resource   | User  |
        | identifier | 123   |

    Scenario: Create not found error without identifier
      When I create a not found error with:
        | resource | Post |
      Then the error message should be "Post not found"

  Rule: Validation errors should include field-specific messages

    Scenario: Create validation error with field errors
      Given I have validation errors:
        | field | message              |
        | email | must be valid email  |
        | age   | must be at least 18  |
      When I create a validation error with message "Invalid user data"
      Then the error should have status code 400
      And the error meta should contain field errors
      And the field "email" error should be "must be valid email"
      And the field "age" error should be "must be at least 18"

  Rule: Business errors should preserve context

    Scenario: Create database error with operation context
      When I create a database error with:
        | message   | Failed to insert user |
        | operation | INSERT                |
      Then the error should have status code 500
      And the error code should be "DATABASE_ERROR"
      And the error meta should contain:
        | key       | value                 |
        | operation | INSERT                |

    Scenario: Create external service error
      When I create an external service error with:
        | service | PaymentAPI           |
        | message | Payment processing failed |
      Then the error should have status code 502
      And the error code should be "EXTERNAL_SERVICE_ERROR"
      And the error meta should contain:
        | key     | value      |
        | service | PaymentAPI |

  Rule: Errors should be JSON serializable

    Scenario: Serialize error to JSON
      When I create a not found error with:
        | resource   | User |
        | identifier | 123  |
      And I serialize the error to JSON
      Then the JSON should have property "name" with value "NotFoundError"
      And the JSON should have property "code" with value "NOT_FOUND"
      And the JSON should have property "statusCode" with value "404"
      And the JSON should have property "message"
      And the JSON should have property "meta"
