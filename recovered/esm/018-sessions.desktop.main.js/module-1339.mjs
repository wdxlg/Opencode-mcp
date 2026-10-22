// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/menuPreventer.ts
import { Disposable } from "./module-0012.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/workbench/contrib/codeEditor/browser/menuPreventer.ts
var MenuPreventer = class extends Disposable {
  static {
    this.ID = "editor.contrib.menuPreventer";
  }
  constructor(editor) {
    super();
    this._editor = editor;
    this._altListeningMouse = false;
    this._altMouseTriggered = false;
    this._register(this._editor.onMouseDown((e4) => {
      if (this._altListeningMouse) {
        this._altMouseTriggered = true;
      }
    }));
    this._register(this._editor.onKeyDown((e4) => {
      if (e4.equals(512 /* Alt */)) {
        if (!this._altListeningMouse) {
          this._altMouseTriggered = false;
        }
        this._altListeningMouse = true;
      }
    }));
    this._register(this._editor.onKeyUp((e4) => {
      if (e4.equals(512 /* Alt */)) {
        if (this._altMouseTriggered) {
          e4.preventDefault();
        }
        this._altListeningMouse = false;
        this._altMouseTriggered = false;
      }
    }));
  }
};

registerEditorContribution(MenuPreventer.ID, MenuPreventer, 2 /* BeforeFirstInteraction */);
export { MenuPreventer };
