Feature: Hook execution order

  Scenario: Verify hook order
    Then hooks should execute in order: BeforeAll, Before, After, AfterAll
