// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/services/notebookCellStatusBarServiceImpl.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";


// src/vs/workbench/contrib/notebook/browser/services/notebookCellStatusBarServiceImpl.ts
var NotebookCellStatusBarService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChangeProviders = this._register(new Emitter());
    this.onDidChangeProviders = this._onDidChangeProviders.event;
    this._onDidChangeItems = this._register(new Emitter());
    this.onDidChangeItems = this._onDidChangeItems.event;
    this._providers = [];
  }
  registerCellStatusBarItemProvider(provider) {
    this._providers.push(provider);
    let changeListener;
    if (provider.onDidChangeStatusBarItems) {
      changeListener = provider.onDidChangeStatusBarItems(() => this._onDidChangeItems.fire());
    }
    this._onDidChangeProviders.fire();
    return toDisposable(() => {
      changeListener?.dispose();
      const idx = this._providers.findIndex((p) => p === provider);
      this._providers.splice(idx, 1);
    });
  }
  async getStatusBarItemsForCell(docUri, cellIndex, viewType, token) {
    const providers2 = this._providers.filter((p) => p.viewType === viewType || p.viewType === "*");
    return await Promise.all(providers2.map(async (p) => {
      try {
        return await p.provideCellStatusBarItems(docUri, cellIndex, token) ?? { items: [] };
      } catch (e4) {
        onUnexpectedExternalError(e4);
        return { items: [] };
      }
    }));
  }
};
export { NotebookCellStatusBarService };
