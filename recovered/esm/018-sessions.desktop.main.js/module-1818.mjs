// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/preferencesEditorRegistry.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/workbench/contrib/preferences/browser/preferencesEditorRegistry.ts
var Extensions19;

((Extensions21) => {
  Extensions21.PreferencesEditorPane = "workbench.registry.preferences.editorPanes";
})(Extensions19 || (Extensions19 = {}));

var PreferencesEditorPaneRegistryImpl = class extends Disposable {
  constructor() {
    super();
    this.descriptors = /* @__PURE__ */ new Map();
    this._onDidRegisterPreferencesEditorPanes = this._register(new Emitter());
    this.onDidRegisterPreferencesEditorPanes = this._onDidRegisterPreferencesEditorPanes.event;
    this._onDidDeregisterPreferencesEditorPanes = this._register(new Emitter());
    this.onDidDeregisterPreferencesEditorPanes = this._onDidDeregisterPreferencesEditorPanes.event;
  }
  registerPreferencesEditorPane(descriptor) {
    if (this.descriptors.has(descriptor.id)) {
      throw new Error(`PreferencesEditorPane with id ${descriptor.id} already registered`);
    }
    this.descriptors.set(descriptor.id, descriptor);
    this._onDidRegisterPreferencesEditorPanes.fire([descriptor]);
    return {
      dispose: () => {
        if (this.descriptors.delete(descriptor.id)) {
          this._onDidDeregisterPreferencesEditorPanes.fire([descriptor]);
        }
      }
    };
  }
  getPreferencesEditorPanes() {
    return [...this.descriptors.values()].sort((a, b) => a.order - b.order);
  }
};

Registry.add(Extensions19.PreferencesEditorPane, new PreferencesEditorPaneRegistryImpl());
export { Extensions19, PreferencesEditorPaneRegistryImpl };
