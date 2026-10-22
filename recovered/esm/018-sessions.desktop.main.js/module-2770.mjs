// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/hasByokModelsContribution.ts
import { Disposable } from "./module-0012.mjs";
import { ChatEntitlementContextKeys } from "./module-0954.mjs";
import { Event2 } from "./module-0017.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { COPILOT_VENDOR_ID } from "./module-0968.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageModelsConfigurationService } from "./module-0967.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0889.mjs";


// src/vs/workbench/contrib/chat/browser/hasByokModelsContribution.ts
var HasByokModelsContribution = class extends Disposable {
  constructor(_languageModelsConfigurationService, _contextKeyService, _configurationService, _storageService, extensionService) {
    super();
    this._languageModelsConfigurationService = _languageModelsConfigurationService;
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._storageService = _storageService;
    this._extensionsRegistered = false;
    this._configurationLoaded = false;
    this._hasByokModels = ChatEntitlementContextKeys.hasByokModels.bindTo(this._contextKeyService);
    this._restore();
    this._update();
    extensionService.whenInstalledExtensionsRegistered().then(() => {
      if (!this._store.isDisposed) {
        this._extensionsRegistered = true;
        this._update();
      }
    });
    this._languageModelsConfigurationService.whenReady.then(() => {
      if (!this._store.isDisposed) {
        this._configurationLoaded = true;
        this._update();
      }
    });
    this._register(Event2.any(
      Event2.filter(this._configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration(ChatAIDisabledSettingId)),
      Event2.filter(this._contextKeyService.onDidChangeContext, (e4) => e4.affectsSome(HasByokModelsContribution.TRACKED_KEYS)),
      this._languageModelsConfigurationService.onDidChangeLanguageModelGroups
    )(() => this._update()));
  }
  static {
    this.ID = "workbench.contrib.hasByokModels";
  }
  static {
    this.STORAGE_KEY_LAST_KNOWN = "chat.hasByokModels.lastKnown";
  }
  static {
    this.TRACKED_KEYS = /* @__PURE__ */ new Set([
      ChatEntitlementContextKeys.clientByokEnabled.key,
      ChatContextKeys.nonCopilotLanguageModelsAreUserSelectable.key
    ]);
  }
  _isFeatureEnabled() {
    return !this._configurationService.getValue(ChatAIDisabledSettingId) && !!this._contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.clientByokEnabled.key);
  }
  _restore() {
    if (!this._isFeatureEnabled()) {
      this._hasByokModels.set(false);
      return;
    }
    this._hasByokModels.set(this._storageService.getBoolean(HasByokModelsContribution.STORAGE_KEY_LAST_KNOWN, -1 /* APPLICATION */, false));
  }
  _setResult(value2) {
    this._hasByokModels.set(value2);
    this._storageService.store(HasByokModelsContribution.STORAGE_KEY_LAST_KNOWN, value2, -1 /* APPLICATION */, 1 /* MACHINE */);
  }
  _update() {
    if (!this._isFeatureEnabled()) {
      this._setResult(false);
      return;
    }
    const hasByokVendor = this._languageModelsConfigurationService.getLanguageModelsProviderGroups().some((g) => g.vendor !== COPILOT_VENDOR_ID);
    if (hasByokVendor) {
      this._setResult(true);
      return;
    }
    if (!this._extensionsRegistered && this._contextKeyService.getContextKeyValue(ChatContextKeys.nonCopilotLanguageModelsAreUserSelectable.key)) {
      this._setResult(true);
      return;
    }
    if (this._extensionsRegistered && this._configurationLoaded) {
      this._setResult(false);
    }
  }
};

HasByokModelsContribution = __decorateClass([
  __decorateParam(0, ILanguageModelsConfigurationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IExtensionService)
], HasByokModelsContribution);
export { HasByokModelsContribution };
