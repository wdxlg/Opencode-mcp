// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/controller/inlineCompletionContextKeys.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/controller/inlineCompletionContextKeys.ts
var InlineCompletionContextKeys = class {
  static {
    this.inlineSuggestionVisible = new RawContextKey("inlineSuggestionVisible", false, localize(1378, null));
  }
  static {
    this.inlineSuggestionAlternativeActionVisible = new RawContextKey("inlineSuggestionAlternativeActionVisible", false, localize(1375, null));
  }
  static {
    this.inlineSuggestionHasIndentation = new RawContextKey("inlineSuggestionHasIndentation", false, localize(1376, null));
  }
  static {
    this.inlineSuggestionHasIndentationLessThanTabSize = new RawContextKey("inlineSuggestionHasIndentationLessThanTabSize", true, localize(1377, null));
  }
  static {
    this.suppressSuggestions = new RawContextKey("inlineSuggestionSuppressSuggestions", void 0, localize(1379, null));
  }
  static {
    this.cursorBeforeGhostText = new RawContextKey("cursorBeforeGhostText", false, localize(1370, null));
  }
  static {
    this.cursorInIndentation = new RawContextKey("cursorInIndentation", false, localize(1371, null));
  }
  static {
    this.hasSelection = new RawContextKey("editor.hasSelection", false, localize(1372, null));
  }
  static {
    this.cursorAtInlineEdit = new RawContextKey("cursorAtInlineEdit", false, localize(1369, null));
  }
  static {
    this.inlineEditVisible = new RawContextKey("inlineEditIsVisible", false, localize(1374, null));
  }
  static {
    this.tabShouldJumpToInlineEdit = new RawContextKey("tabShouldJumpToInlineEdit", false, localize(1381, null));
  }
  static {
    this.tabShouldAcceptInlineEdit = new RawContextKey("tabShouldAcceptInlineEdit", false, localize(1380, null));
  }
  static {
    this.inInlineEditsPreviewEditor = new RawContextKey("inInlineEditsPreviewEditor", true, localize(1373, null));
  }
};
export { InlineCompletionContextKeys };
