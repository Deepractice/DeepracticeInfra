Feature: DocString basic usage

  Scenario: Create file with DocString content
    When I create file "package.json" with:
      """
      {
        "name": "test-package",
        "version": "1.0.0"
      }
      """
    Then the file should contain "test-package"
