// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionEnablementContext.ts
import { Disposable } from "./module-0012.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IExtensionService } from "./module-0887.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionEnablementContext.ts
var EXTENSION_ENABLED_CONTEXT_KEY_PREFIX = "extensionEnabled:";

var ExtensionEnablementContextKeysContribution = class extends Disposable {
  constructor(contextKeyService, extensionService) {
    super();
    this.contextKeyService = contextKeyService;
    this.extensionService = extensionService;
    this._contextKeys = /* @__PURE__ */ new Map();
    this._reconcile();
    this._register(this.extensionService.onDidRegisterExtensions(() => this._reconcile()));
    this._register(this.extensionService.onDidChangeExtensions(() => this._reconcile()));
  }
  _reconcile() {
    const enabledKeys = /* @__PURE__ */ new Set();
    for (const extension of this.extensionService.extensions) {
      enabledKeys.add(EXTENSION_ENABLED_CONTEXT_KEY_PREFIX + ExtensionIdentifier.toKey(extension.identifier));
    }
    for (const [key3, contextKey] of this._contextKeys) {
      contextKey.set(enabledKeys.has(key3));
    }
    for (const key3 of enabledKeys) {
      if (!this._contextKeys.has(key3)) {
        this._contextKeys.set(key3, this.contextKeyService.createKey(key3, true));
      }
    }
  }
};

ExtensionEnablementContextKeysContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IExtensionService)
], ExtensionEnablementContextKeysContribution);
export { EXTENSION_ENABLED_CONTEXT_KEY_PREFIX, ExtensionEnablementContextKeysContribution };
