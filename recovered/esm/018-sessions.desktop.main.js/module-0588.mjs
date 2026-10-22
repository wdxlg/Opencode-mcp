// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/contentHoverComputer.ts
import { AsyncIterableProducer } from "./module-0036.mjs";
import { coalesce } from "./module-0007.mjs";


// src/vs/editor/contrib/hover/browser/contentHoverComputer.ts
var ContentHoverComputer = class _ContentHoverComputer {
  constructor(_editor, _participants) {
    this._editor = _editor;
    this._participants = _participants;
  }
  static _getLineDecorations(editor, anchor) {
    if (anchor.type !== 1 /* Range */ && !anchor.supportsMarkerHover) {
      return [];
    }
    const model = editor.getModel();
    const lineNumber = anchor.range.startLineNumber;
    if (lineNumber > model.getLineCount()) {
      return [];
    }
    const maxColumn = model.getLineMaxColumn(lineNumber);
    return editor.getLineDecorations(lineNumber).filter((d) => {
      if (d.options.isWholeLine) {
        return true;
      }
      const startColumn = d.range.startLineNumber === lineNumber ? d.range.startColumn : 1;
      const endColumn = d.range.endLineNumber === lineNumber ? d.range.endColumn : maxColumn;
      if (d.options.showIfCollapsed) {
        if (startColumn > anchor.range.startColumn + 1 || anchor.range.endColumn - 1 > endColumn) {
          return false;
        }
      } else {
        if (startColumn > anchor.range.startColumn || anchor.range.endColumn > endColumn) {
          return false;
        }
      }
      return true;
    });
  }
  computeAsync(options3, token) {
    const anchor = options3.anchor;
    if (!this._editor.hasModel() || !anchor) {
      return AsyncIterableProducer.EMPTY;
    }
    const lineDecorations = _ContentHoverComputer._getLineDecorations(this._editor, anchor);
    return AsyncIterableProducer.merge(
      this._participants.map((participant) => {
        if (!participant.computeAsync) {
          return AsyncIterableProducer.EMPTY;
        }
        return participant.computeAsync(anchor, lineDecorations, options3.source, token);
      })
    );
  }
  computeSync(options3) {
    if (!this._editor.hasModel()) {
      return [];
    }
    const anchor = options3.anchor;
    const lineDecorations = _ContentHoverComputer._getLineDecorations(this._editor, anchor);
    let result = [];
    for (const participant of this._participants) {
      result = result.concat(participant.computeSync(anchor, lineDecorations, options3.source));
    }
    return coalesce(result);
  }
};
export { ContentHoverComputer };
