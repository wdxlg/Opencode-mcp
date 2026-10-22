// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/glyphHoverComputer.ts
import { isEmptyMarkdownString } from "./module-0462.mjs";
import { asArray } from "./module-0007.mjs";


// src/vs/editor/contrib/hover/browser/glyphHoverComputer.ts
var GlyphHoverComputer = class {
  constructor(_editor) {
    this._editor = _editor;
  }
  computeSync(opts) {
    const toHoverMessage = (contents) => {
      return {
        value: contents
      };
    };
    const lineDecorations = this._editor.getLineDecorations(opts.lineNumber);
    const result = [];
    const isLineHover = opts.laneOrLine === "lineNo";
    if (!lineDecorations) {
      return result;
    }
    for (const d of lineDecorations) {
      const lane = d.options.glyphMargin?.position ?? 2 /* Center */;
      if (!isLineHover && lane !== opts.laneOrLine) {
        continue;
      }
      const hoverMessage = isLineHover ? d.options.lineNumberHoverMessage : d.options.glyphMarginHoverMessage;
      if (!hoverMessage || isEmptyMarkdownString(hoverMessage)) {
        continue;
      }
      result.push(...asArray(hoverMessage).map(toHoverMessage));
    }
    return result;
  }
};
export { GlyphHoverComputer };
