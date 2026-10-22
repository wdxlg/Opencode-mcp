// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/keybinding/browser/keyboardLayouts/_.contribution.ts



// src/vs/workbench/services/keybinding/browser/keyboardLayouts/_.contribution.ts
var KeyboardLayoutContribution = class _KeyboardLayoutContribution {
  constructor() {
    this._layoutInfos = [];
  }
  static {
    this.INSTANCE = new _KeyboardLayoutContribution();
  }
  get layoutInfos() {
    return this._layoutInfos;
  }
  registerKeyboardLayout(layout2) {
    this._layoutInfos.push(layout2);
  }
};
export { KeyboardLayoutContribution };
