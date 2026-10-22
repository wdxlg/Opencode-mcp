// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/tokenization/browser/tokenization.ts
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { localize2 } from "./module-0001.mjs";
import { StopWatch } from "./module-0016.mjs";


// src/vs/editor/contrib/tokenization/browser/tokenization.ts
var ForceRetokenizeAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.forceRetokenize",
      label: localize2(1718, "Developer: Force Retokenize"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    model.tokenization.resetTokenization();
    const sw = new StopWatch();
    model.tokenization.forceTokenization(model.getLineCount());
    sw.stop();
    console.log(`tokenization took ${sw.elapsed()}`);
  }
};

registerEditorAction(ForceRetokenizeAction);
export { ForceRetokenizeAction };
