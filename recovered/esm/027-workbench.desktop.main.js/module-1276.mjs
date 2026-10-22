// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/suggest/browser/simpleCompletionItem.ts
import { FuzzyScore } from "./module-0453.mjs";


// src/vs/workbench/services/suggest/browser/simpleCompletionItem.ts
var SimpleCompletionItem = class {
  constructor(completion) {
    this.completion = completion;
    // sorting, filtering
    this.score = FuzzyScore.Default;
    // validation
    this.isInvalid = false;
    this.textLabel = typeof completion.label === "string" ? completion.label : completion.label?.label;
    this.labelLow = this.textLabel.toLowerCase();
  }
};
export { SimpleCompletionItem };
