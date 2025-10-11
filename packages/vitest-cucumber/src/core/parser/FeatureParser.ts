import type * as Messages from "@cucumber/messages";
import type { Feature, Scenario, Step, DataTable, DocString } from "~/types";
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

    for (const child of feature.children || []) {
      if (child.scenario) {
        scenarios.push(this.convertScenario(child.scenario));
      }
    }

    return {
      name: feature.name || "Unnamed Feature",
      description: feature.description,
      scenarios,
      tags: feature.tags?.map((t) => t.name),
    };
  }

  /**
   * Convert Gherkin scenario to our Scenario type
   */
  private convertScenario(scenario: Messages.Scenario): Scenario {
    const steps = scenario.steps.map((s) => this.convertStep(s));

    return {
      name: scenario.name || "Unnamed Scenario",
      steps,
      tags: scenario.tags?.map((t) => t.name),
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
}
