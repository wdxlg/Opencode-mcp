// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/common/extensionFeatures.ts
import { createDecorator } from "./module-0077.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/workbench/services/extensionManagement/common/extensionFeatures.ts
var Extensions11;

((Extensions21) => {
  Extensions21.ExtensionFeaturesRegistry = "workbench.registry.extensionFeatures";
})(Extensions11 || (Extensions11 = {}));

var IExtensionFeaturesManagementService = createDecorator("IExtensionFeaturesManagementService");

var ExtensionFeaturesRegistry = class {
  constructor() {
    this.extensionFeatures = /* @__PURE__ */ new Map();
  }
  registerExtensionFeature(descriptor) {
    if (this.extensionFeatures.has(descriptor.id)) {
      throw new Error(`Extension feature with id '${descriptor.id}' already exists`);
    }
    this.extensionFeatures.set(descriptor.id, descriptor);
    return {
      dispose: () => this.extensionFeatures.delete(descriptor.id)
    };
  }
  getExtensionFeature(id2) {
    return this.extensionFeatures.get(id2);
  }
  getExtensionFeatures() {
    return Array.from(this.extensionFeatures.values());
  }
};

Registry.add(Extensions11.ExtensionFeaturesRegistry, new ExtensionFeaturesRegistry());
export { Extensions11, IExtensionFeaturesManagementService, ExtensionFeaturesRegistry };
