// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/component.ts
import { Themable } from "./module-0287.mjs";
import { Memento } from "./module-1041.mjs";


// src/vs/workbench/common/component.ts
var Component = class extends Themable {
  constructor(id2, themeService, storageService) {
    super(themeService);
    this.id = id2;
    this.memento = new Memento(this.id, storageService);
    this._register(storageService.onWillSaveState(() => {
      this.saveState();
      this.memento.saveMemento();
    }));
  }
  getId() {
    return this.id;
  }
  getMemento(scope, target) {
    return this.memento.getMemento(scope, target);
  }
  reloadMemento(scope) {
    this.memento.reloadMemento(scope);
  }
  onDidChangeMementoValue(scope, disposables) {
    return this.memento.onDidChangeValue(scope, disposables);
  }
  saveState() {
  }
};
export { Component };
