// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatModelSelectionDiagnostics.ts
import { SELECTED_MODEL_STORAGE_KEY_PREFIX, getSelectedModelStorageKey } from "./module-2040.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatModelSelectionDiagnostics.ts
var ChatModelSelectionDiagnostics = class {
  constructor(_logService, _storageService, _getContext) {
    this._logService = _logService;
    this._storageService = _storageService;
    this._getContext = _getContext;
  }
  report(event, details, level = "debug") {
    const context2 = this._getContext();
    const fields = {
      surface: context2.surface,
      sessionKey: context2.sessionKey,
      conversationKey: context2.conversationKey,
      modelTarget: context2.modelTarget,
      storageKey: getSelectedModelStorageKey(context2.location, context2.modelTarget),
      ...context2.metadata,
      ...details
    };
    const message = `[ChatModelSelection] event=${event} ${Object.entries(fields).map(([key3, value2]) => `${key3}=${value2 === void 0 ? "undefined" : JSON.stringify(value2)}`).join(" ")}`;
    switch (level) {
      case "debug":
        this._logService.debug(message);
        break;
      case "info":
        this._logService.info(message);
        break;
      case "error":
        this._logService.error(message);
        break;
    }
  }
  logStorageChange(event, currentModel) {
    if (!event.key.startsWith(SELECTED_MODEL_STORAGE_KEY_PREFIX) || event.key.endsWith(".isDefault")) {
      return;
    }
    const context2 = this._getContext();
    const activeStorageKey = getSelectedModelStorageKey(context2.location, context2.modelTarget);
    const storedModel = this._storageService.get(event.key, 0 /* PROFILE */);
    const matchesActiveKey = event.key === activeStorageKey;
    const conflictsWithCurrentModel = matchesActiveKey && !!storedModel && !!currentModel && storedModel !== currentModel;
    this.report("storage-change", {
      changedKey: event.key,
      external: event.external,
      matchesActiveKey,
      conflictsWithCurrentModel,
      storedModel,
      currentModel
    }, event.external || conflictsWithCurrentModel ? "info" : "debug");
  }
};

var NullChatModelSelectionDiagnostics = {
  report: () => {
  }
};
export { ChatModelSelectionDiagnostics, NullChatModelSelectionDiagnostics };
