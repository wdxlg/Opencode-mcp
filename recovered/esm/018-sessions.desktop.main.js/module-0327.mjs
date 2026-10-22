// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/editorTheme.ts



// src/vs/editor/common/editorTheme.ts
var EditorTheme = class {
  get type() {
    return this._theme.type;
  }
  get value() {
    return this._theme;
  }
  constructor(theme) {
    this._theme = theme;
  }
  update(theme) {
    this._theme = theme;
  }
  getColor(color2) {
    return this._theme.getColor(color2);
  }
};
export { EditorTheme };
