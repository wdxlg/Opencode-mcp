// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/longLinesHelper/browser/longLinesHelper.ts
import { Disposable } from "./module-0012.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/editor/contrib/longLinesHelper/browser/longLinesHelper.ts
var LongLinesHelper = class _LongLinesHelper extends Disposable {
  constructor(_editor) {
    super();
    this._editor = _editor;
    this._register(this._editor.onMouseDown((e) => {
      const stopRenderingLineAfter = this._editor.getOption(133 /* stopRenderingLineAfter */);
      if (stopRenderingLineAfter >= 0 && e.target.type === 6 /* CONTENT_TEXT */ && e.target.position.column >= stopRenderingLineAfter) {
        this._editor.updateOptions({
          stopRenderingLineAfter: -1
        });
      }
    }));
  }
  static {
    this.ID = "editor.contrib.longLinesHelper";
  }
  static get(editor) {
    return editor.getContribution(_LongLinesHelper.ID);
  }
};

registerEditorContribution(LongLinesHelper.ID, LongLinesHelper, 2 /* BeforeFirstInteraction */);
export { LongLinesHelper };
