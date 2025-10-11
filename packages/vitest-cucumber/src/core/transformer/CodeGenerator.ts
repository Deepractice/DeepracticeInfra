import type { Feature, Scenario, Step, Background, Rule } from "~/types";

/**
 * Generate Vitest test code from Feature
 */
export class CodeGenerator {
  /**
   * Generate test code for a feature
   */
  public generate(feature: Feature): string {
    const lines: string[] = [];

    // Import statements
    lines.push(
      "import { describe, it, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';",
    );
    lines.push(
      "import { StepExecutor, ContextManager, DataTable, HookRegistry } from '@deepracticex/vitest-cucumber/runtime';",
    );
    lines.push("");

    // Feature describe block
    lines.push(`describe('${this.escapeString(feature.name)}', () => {`);

    // Generate BeforeAll/AfterAll hooks
    lines.push("");
    lines.push("  beforeAll(async () => {");
    lines.push("    const hookRegistry = HookRegistry.getInstance();");
    lines.push("    const contextManager = new ContextManager();");
    lines.push(
      "    await hookRegistry.executeHooks('BeforeAll', contextManager.getContext());",
    );
    lines.push("  });");
    lines.push("");
    lines.push("  afterAll(async () => {");
    lines.push("    const hookRegistry = HookRegistry.getInstance();");
    lines.push("    const contextManager = new ContextManager();");
    lines.push(
      "    await hookRegistry.executeHooks('AfterAll', contextManager.getContext());",
    );
    lines.push("  });");

    // Generate feature-level background
    if (feature.background) {
      lines.push(this.generateBackground(feature.background, 1));
    }

    // Generate scenarios
    for (const scenario of feature.scenarios) {
      if (scenario.isOutline && scenario.examples) {
        lines.push(this.generateScenarioOutline(scenario, 1));
      } else {
        lines.push(this.generateScenario(scenario, 1));
      }
    }

    // Generate rules
    if (feature.rules) {
      for (const rule of feature.rules) {
        lines.push(this.generateRule(rule, 1));
      }
    }

    lines.push("});");

    return lines.join("\n");
  }

  /**
   * Generate code for a scenario
   */
  private generateScenario(scenario: Scenario, indent: number): string {
    const lines: string[] = [];
    const ind = "  ".repeat(indent);

    lines.push("");
    lines.push(`${ind}it('${this.escapeString(scenario.name)}', async () => {`);
    lines.push(`${ind}  const hookRegistry = HookRegistry.getInstance();`);
    lines.push(`${ind}  const contextManager = new ContextManager();`);
    lines.push(`${ind}  const context = contextManager.getContext();`);
    lines.push(`${ind}  const executor = new StepExecutor(context);`);
    lines.push("");

    // Execute Before hooks
    lines.push(`${ind}  // Execute Before hooks`);
    lines.push(`${ind}  await hookRegistry.executeHooks('Before', context);`);
    lines.push("");

    // Generate steps
    lines.push(`${ind}  // Execute steps`);
    for (const step of scenario.steps) {
      lines.push(this.generateStep(step, indent + 1));
    }

    // Execute After hooks
    lines.push(`${ind}  // Execute After hooks`);
    lines.push(`${ind}  await hookRegistry.executeHooks('After', context);`);

    lines.push(`${ind}});`);

    return lines.join("\n");
  }

  /**
   * Generate code for a step
   */
  private generateStep(step: Step, indent: number): string {
    const lines: string[] = [];
    const ind = "  ".repeat(indent);

    // Create step object
    lines.push(`${ind}await executor.execute({`);
    lines.push(`${ind}  keyword: '${step.keyword}',`);
    lines.push(`${ind}  text: '${this.escapeString(step.text)}',`);

    if (step.dataTable) {
      lines.push(
        `${ind}  dataTable: new DataTable(${JSON.stringify(step.dataTable.raw())}),`,
      );
    }

    if (step.docString) {
      lines.push(`${ind}  docString: {`);
      if (step.docString.contentType) {
        lines.push(
          `${ind}    contentType: '${this.escapeString(step.docString.contentType)}',`,
        );
      }
      lines.push(
        `${ind}    content: ${JSON.stringify(step.docString.content)}`,
      );
      lines.push(`${ind}  },`);
    }

    lines.push(`${ind}});`);
    lines.push("");

    return lines.join("\n");
  }

  /**
   * Escape string for JavaScript code
   */
  private escapeString(str: string): string {
    return str
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }

  /**
   * Generate code for a background block
   */
  private generateBackground(background: Background, indent: number): string {
    const lines: string[] = [];
    const ind = "  ".repeat(indent);

    lines.push("");
    lines.push(`${ind}beforeEach(async () => {`);
    lines.push(`${ind}  const contextManager = new ContextManager();`);
    lines.push(
      `${ind}  const executor = new StepExecutor(contextManager.getContext());`,
    );
    lines.push("");

    // Generate background steps
    for (const step of background.steps) {
      lines.push(this.generateStep(step, indent + 1));
    }

    lines.push(`${ind}});`);

    return lines.join("\n");
  }

  /**
   * Generate code for a rule block
   */
  private generateRule(rule: Rule, indent: number): string {
    const lines: string[] = [];
    const ind = "  ".repeat(indent);

    lines.push("");
    lines.push(`${ind}describe('${this.escapeString(rule.name)}', () => {`);

    // Generate rule-level background
    if (rule.background) {
      lines.push(this.generateBackground(rule.background, indent + 1));
    }

    // Generate scenarios in the rule
    for (const scenario of rule.scenarios) {
      if (scenario.isOutline && scenario.examples) {
        lines.push(this.generateScenarioOutline(scenario, indent + 1));
      } else {
        lines.push(this.generateScenario(scenario, indent + 1));
      }
    }

    lines.push(`${ind}});`);

    return lines.join("\n");
  }

  /**
   * Generate code for a scenario outline with examples
   */
  private generateScenarioOutline(scenario: Scenario, indent: number): string {
    const lines: string[] = [];
    const ind = "  ".repeat(indent);

    if (!scenario.examples || scenario.examples.length === 0) {
      return this.generateScenario(scenario, indent);
    }

    lines.push("");
    lines.push(`${ind}describe('${this.escapeString(scenario.name)}', () => {`);

    // Generate a test for each example row
    for (const exampleSet of scenario.examples) {
      const headers = exampleSet.headers;

      for (const row of exampleSet.rows) {
        // Create example map
        const exampleMap: Record<string, string> = {};
        headers.forEach((header, i) => {
          exampleMap[header] = row[i] || "";
        });

        // Create test name from example values
        const exampleDesc = headers
          .map((h) => `${h}=${exampleMap[h]}`)
          .join(", ");

        lines.push("");
        lines.push(
          `${ind}  it('Example: ${this.escapeString(exampleDesc)}', async () => {`,
        );
        lines.push(
          `${ind}    const hookRegistry = HookRegistry.getInstance();`,
        );
        lines.push(`${ind}    const contextManager = new ContextManager();`);
        lines.push(`${ind}    const context = contextManager.getContext();`);
        lines.push(`${ind}    const executor = new StepExecutor(context);`);
        lines.push("");

        // Execute Before hooks
        lines.push(`${ind}    // Execute Before hooks`);
        lines.push(
          `${ind}    await hookRegistry.executeHooks('Before', context);`,
        );
        lines.push("");

        // Generate steps with replaced placeholders
        lines.push(`${ind}    // Execute steps`);
        for (const step of scenario.steps) {
          const replacedStep = {
            ...step,
            text: this.replacePlaceholders(step.text, exampleMap),
          };
          lines.push(this.generateStep(replacedStep, indent + 2));
        }

        // Execute After hooks
        lines.push(`${ind}    // Execute After hooks`);
        lines.push(
          `${ind}    await hookRegistry.executeHooks('After', context);`,
        );

        lines.push(`${ind}  });`);
      }
    }

    lines.push(`${ind}});`);

    return lines.join("\n");
  }

  /**
   * Replace placeholders in text with example values
   */
  private replacePlaceholders(
    text: string,
    example: Record<string, string>,
  ): string {
    let result = text;

    for (const [key, value] of Object.entries(example)) {
      const placeholder = `<${key}>`;
      result = result.replace(new RegExp(placeholder, "g"), value);
    }

    return result;
  }
}
