// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewModel/viewContext.ts
import { EditorTheme } from "./module-0327.mjs";


// src/vs/editor/common/viewModel/viewContext.ts
var ViewContext = class {
  constructor(configuration2, theme, model) {
    this.configuration = configuration2;
    this.theme = new EditorTheme(theme);
    this.viewModel = model;
    this.viewLayout = model.viewLayout;
  }
  addEventHandler(eventHandler) {
    this.viewModel.addViewEventHandler(eventHandler);
  }
  removeEventHandler(eventHandler) {
    this.viewModel.removeViewEventHandler(eventHandler);
  }
};
export { ViewContext };
