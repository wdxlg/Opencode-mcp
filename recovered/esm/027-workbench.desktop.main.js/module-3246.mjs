// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/customEditor/common/customEditorModelManager.ts
import { createSingleCallFunction } from "./module-0005.mjs";


// src/vs/workbench/contrib/customEditor/common/customEditorModelManager.ts
var CustomEditorModelManager = class {
  constructor() {
    this._references = /* @__PURE__ */ new Map();
  }
  async getAllModels(resource) {
    const keyStart = `${resource.toString()}@@@`;
    const models = [];
    for (const [key3, entry] of this._references) {
      if (key3.startsWith(keyStart) && entry.model) {
        models.push(await entry.model);
      }
    }
    return models;
  }
  async get(resource, viewType) {
    const key3 = this.key(resource, viewType);
    const entry = this._references.get(key3);
    return entry?.model;
  }
  tryRetain(resource, viewType) {
    const key3 = this.key(resource, viewType);
    const entry = this._references.get(key3);
    if (!entry) {
      return void 0;
    }
    entry.counter++;
    return entry.model.then((model) => {
      return {
        object: model,
        dispose: createSingleCallFunction(() => {
          if (--entry.counter <= 0) {
            entry.model.then((x) => x.dispose());
            this._references.delete(key3);
          }
        })
      };
    });
  }
  add(resource, viewType, model) {
    const key3 = this.key(resource, viewType);
    const existing = this._references.get(key3);
    if (existing) {
      throw new Error("Model already exists");
    }
    this._references.set(key3, { viewType, model, counter: 0 });
    return this.tryRetain(resource, viewType);
  }
  disposeAllModelsForView(viewType) {
    for (const [key3, value2] of this._references) {
      if (value2.viewType === viewType) {
        value2.model.then((x) => x.dispose());
        this._references.delete(key3);
      }
    }
  }
  disposeAllModelsForResource(resource) {
    const keyStart = `${resource.toString()}@@@`;
    for (const [key3, value2] of this._references) {
      if (key3.startsWith(keyStart)) {
        value2.model.then((x) => x.dispose());
        this._references.delete(key3);
      }
    }
  }
  key(resource, viewType) {
    return `${resource.toString()}@@@${viewType}`;
  }
};
export { CustomEditorModelManager };
