import type { Feature, Scenario, Step } from "~/types";

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
    lines.push("import { describe, it } from 'vitest';");
    lines.push(
      "import { StepExecutor, ContextManager } from '@deepracticex/vitest-cucumber/runtime';",
    );
    lines.push("");

    // Feature describe block
    lines.push(`describe('${this.escapeString(feature.name)}', () => {`);

    // Generate scenarios
    for (const scenario of feature.scenarios) {
      lines.push(this.generateScenario(scenario, 1));
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
    lines.push(`${ind}  const contextManager = new ContextManager();`);
    lines.push(
      `${ind}  const executor = new StepExecutor(contextManager.getContext());`,
    );
    lines.push("");

    // Generate steps
    for (const step of scenario.steps) {
      lines.push(this.generateStep(step, indent + 1));
    }

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
      lines.push(`${ind}  dataTable: {`);
      lines.push(`${ind}    rows: ${JSON.stringify(step.dataTable.rows)}`);
      lines.push(`${ind}  },`);
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
}
