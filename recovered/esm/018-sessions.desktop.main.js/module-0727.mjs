// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViewInterface.ts
import { StandardMouseEvent } from "./module-0024.mjs";
import { getWindow } from "./module-0075.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViewInterface.ts
var InlineEditClickEvent = class _InlineEditClickEvent {
  constructor(event, alternativeAction = false) {
    this.event = event;
    this.alternativeAction = alternativeAction;
  }
  static create(event, alternativeAction = false) {
    return new _InlineEditClickEvent(new StandardMouseEvent(getWindow(event), event), alternativeAction);
  }
};

var InlineCompletionViewData = class {
  constructor(cursorColumnDistance, cursorLineDistance, lineCountOriginal, lineCountModified, characterCountOriginal, characterCountModified, disjointReplacements, sameShapeReplacements) {
    this.cursorColumnDistance = cursorColumnDistance;
    this.cursorLineDistance = cursorLineDistance;
    this.lineCountOriginal = lineCountOriginal;
    this.lineCountModified = lineCountModified;
    this.characterCountOriginal = characterCountOriginal;
    this.characterCountModified = characterCountModified;
    this.disjointReplacements = disjointReplacements;
    this.sameShapeReplacements = sameShapeReplacements;
    this.longDistanceHintVisible = void 0;
    this.longDistanceHintDistance = void 0;
    /**
     * Whether the suggestion targets a different text model (URI) than the active editor's,
     * i.e. a cross-document Next Edit Suggestion. `undefined` for inline completions / ghost text.
     */
    this.isForAnotherDocument = void 0;
  }
  setLongDistanceViewData(lineNumber, inlineEditLineNumber) {
    this.longDistanceHintVisible = true;
    this.longDistanceHintDistance = Math.abs(inlineEditLineNumber - lineNumber);
  }
  getData() {
    return {
      cursorColumnDistance: this.cursorColumnDistance,
      cursorLineDistance: this.cursorLineDistance,
      lineCountOriginal: this.lineCountOriginal,
      lineCountModified: this.lineCountModified,
      characterCountOriginal: this.characterCountOriginal,
      characterCountModified: this.characterCountModified,
      disjointReplacements: this.disjointReplacements,
      sameShapeReplacements: this.sameShapeReplacements,
      longDistanceHintVisible: this.longDistanceHintVisible,
      longDistanceHintDistance: this.longDistanceHintDistance,
      isForAnotherDocument: this.isForAnotherDocument
    };
  }
};
export { InlineEditClickEvent, InlineCompletionViewData };
