import type * as Messages from "@cucumber/messages";
import type {
  Feature,
  Scenario,
  Step,
  DataTable,
  DocString,
  Background,
  Examples,
  Rule,
} from "~/types";
import { GherkinParser } from "./GherkinParser";

/**
 * Parse feature files into our Feature type
 */
export class FeatureParser {
  private gherkinParser: GherkinParser;

  constructor() {
    this.gherkinParser = new GherkinParser();
  }

  /**
   * Parse a feature file content
   */
  public parse(content: string): Feature {
    const doc = this.gherkinParser.parse(content);

    if (!doc.feature) {
      throw new Error("No feature found in document");
    }

    return this.convertFeature(doc.feature);
  }

  /**
   * Convert Gherkin feature to our Feature type
   */
  private convertFeature(feature: Messages.Feature): Feature {
    const scenarios: Scenario[] = [];
    const rules: Rule[] = [];
    let background: Background | undefined;

    for (const child of feature.children || []) {
      if (child.background) {
        background = this.convertBackground(child.background);
      } else if (child.scenario) {
        scenarios.push(this.convertScenario(child.scenario));
      } else if (child.rule) {
        rules.push(this.convertRule(child.rule));
      }
    }

    return {
      name: feature.name || "Unnamed Feature",
      description: feature.description,
      background,
      scenarios,
      rules: rules.length > 0 ? rules : undefined,
      tags: feature.tags?.map((t) => t.name),
    };
  }

  /**
   * Convert Gherkin scenario to our Scenario type
   */
  private convertScenario(scenario: Messages.Scenario): Scenario {
    const steps = scenario.steps.map((s) => this.convertStep(s));
    const examples = scenario.examples?.map((e) => this.convertExamples(e));
    const isOutline = examples && examples.length > 0;

    return {
      name: scenario.name || "Unnamed Scenario",
      steps,
      tags: scenario.tags?.map((t) => t.name),
      isOutline: isOutline || undefined,
      examples: isOutline ? examples : undefined,
    };
  }

  /**
   * Convert Gherkin step to our Step type
   */
  private convertStep(step: Messages.Step): Step {
    const result: Step = {
      keyword: step.keyword.trim(),
      text: step.text,
    };

    if (step.dataTable) {
      result.dataTable = this.convertDataTable(step.dataTable);
    }

    if (step.docString) {
      result.docString = this.convertDocString(step.docString);
    }

    return result;
  }

  /**
   * Convert Gherkin data table
   */
  private convertDataTable(dataTable: Messages.DataTable): DataTable {
    return {
      rows: dataTable.rows.map((row) => row.cells.map((cell) => cell.value)),
    };
  }

  /**
   * Convert Gherkin doc string
   */
  private convertDocString(docString: Messages.DocString): DocString {
    return {
      contentType: docString.mediaType,
      content: docString.content,
    };
  }

  /**
   * Convert Gherkin background to our Background type
   */
  private convertBackground(background: Messages.Background): Background {
    return {
      steps: background.steps.map((s) => this.convertStep(s)),
    };
  }

  /**
   * Convert Gherkin rule to our Rule type
   */
  private convertRule(rule: Messages.Rule): Rule {
    const scenarios: Scenario[] = [];
    let background: Background | undefined;

    for (const child of rule.children || []) {
      if (child.background) {
        background = this.convertBackground(child.background);
      } else if (child.scenario) {
        scenarios.push(this.convertScenario(child.scenario));
      }
    }

    return {
      name: rule.name || "Unnamed Rule",
      scenarios,
      background,
      tags: rule.tags?.map((t) => t.name),
    };
  }

  /**
   * Convert Gherkin examples to our Examples type
   */
  private convertExamples(examples: Messages.Examples): Examples {
    const headers = examples.tableHeader?.cells.map((cell) => cell.value) || [];
    const rows =
      examples.tableBody?.map((row) => row.cells.map((cell) => cell.value)) ||
      [];

    return {
      headers,
      rows,
    };
  }
}
