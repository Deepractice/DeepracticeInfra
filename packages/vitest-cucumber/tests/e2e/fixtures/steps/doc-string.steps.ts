import { When, Then } from "@cucumber/cucumber";
import { expect } from "./test-helpers";

interface DocStringContext {
  files?: Record<string, string>;
  note?: string;
}

When(
  "I create file {string} with:",
  function (this: DocStringContext, filename: string, content: string) {
    if (!this.files) {
      this.files = {};
    }
    this.files[filename] = content;
  },
);

When(
  "I create a note with:",
  function (this: DocStringContext, content: string) {
    this.note = content;
  },
);

Then(
  "the file should contain {string}",
  function (this: DocStringContext, text: string) {
    const fileContent = this.files?.["package.json"];
    expect(fileContent).toBeDefined();
    expect(fileContent).toContain(text);
  },
);

Then(
  "the note should have {int} lines",
  function (this: DocStringContext, lineCount: number) {
    const lines = this.note?.split("\n") || [];
    expect(lines.length).toBe(lineCount);
  },
);
