// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/fontZoom/browser/fontZoom.ts
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorZoom } from "./module-0100.mjs";


// src/vs/editor/contrib/fontZoom/browser/fontZoom.ts
var EditorFontZoomIn = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.fontZoomIn",
      label: localize2(1190, "Increase Editor Font Size"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    EditorZoom.setZoomLevel(EditorZoom.getZoomLevel() + 1);
  }
};

var EditorFontZoomOut = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.fontZoomOut",
      label: localize2(1191, "Decrease Editor Font Size"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    EditorZoom.setZoomLevel(EditorZoom.getZoomLevel() - 1);
  }
};

var EditorFontZoomReset = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.fontZoomReset",
      label: localize2(1192, "Reset Editor Font Size"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    EditorZoom.setZoomLevel(0);
  }
};

registerEditorAction(EditorFontZoomIn);

registerEditorAction(EditorFontZoomOut);

registerEditorAction(EditorFontZoomReset);
export { EditorFontZoomIn, EditorFontZoomOut, EditorFontZoomReset };
