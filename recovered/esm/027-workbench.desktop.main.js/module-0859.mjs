// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/wordHighlighter/browser/textualHighlightProvider.ts
import { USUAL_WORD_SEPARATORS } from "./module-0103.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";


// src/vs/editor/contrib/wordHighlighter/browser/textualHighlightProvider.ts
var TextualDocumentHighlightProvider = class {
  constructor() {
    this.selector = { language: "*" };
  }
  provideDocumentHighlights(model, position2, token) {
    if (model.isDisposed()) {
      return;
    }
    const result = [];
    const word = model.getWordAtPosition({
      lineNumber: position2.lineNumber,
      column: position2.column
    });
    if (!word) {
      return Promise.resolve(result);
    }
    const matches2 = model.findMatches(word.word, true, false, true, USUAL_WORD_SEPARATORS, false);
    return matches2.map((m) => ({
      range: m.range,
      kind: 0 /* Text */
    }));
  }
  provideMultiDocumentHighlights(primaryModel, position2, otherModels, token) {
    if (primaryModel.isDisposed()) {
      return;
    }
    const result = new ResourceMap();
    const word = primaryModel.getWordAtPosition({
      lineNumber: position2.lineNumber,
      column: position2.column
    });
    if (!word) {
      return Promise.resolve(result);
    }
    for (const model of [primaryModel, ...otherModels]) {
      if (model.isDisposed()) {
        continue;
      }
      const matches2 = model.findMatches(word.word, true, false, true, USUAL_WORD_SEPARATORS, false);
      const highlights = matches2.map((m) => ({
        range: m.range,
        kind: 0 /* Text */
      }));
      if (highlights) {
        result.set(model.uri, highlights);
      }
    }
    return result;
  }
};

var TextualMultiDocumentHighlightFeature = class extends Disposable {
  constructor(languageFeaturesService) {
    super();
    this._register(languageFeaturesService.documentHighlightProvider.register("*", new TextualDocumentHighlightProvider()));
    this._register(languageFeaturesService.multiDocumentHighlightProvider.register("*", new TextualDocumentHighlightProvider()));
  }
};

TextualMultiDocumentHighlightFeature = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService)
], TextualMultiDocumentHighlightFeature);
export { TextualDocumentHighlightProvider, TextualMultiDocumentHighlightFeature };
