// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/structuredLogger.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IDataChannelService } from "./module-0708.mjs";
import { observableFromEvent } from "./module-0057.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/structuredLogger.ts
function formatRecordableLogEntry(entry) {
  return entry.sourceId + " @@ " + JSON.stringify({ ...entry, modelUri: entry.modelUri?.toString(), sourceId: void 0 });
}

var StructuredLogger = class extends Disposable {
  constructor(_key, _contextKeyService, _dataChannelService) {
    super();
    this._key = _key;
    this._contextKeyService = _contextKeyService;
    this._dataChannelService = _dataChannelService;
    this._isEnabledContextKeyValue = observableContextKey("structuredLogger.enabled:" + this._key, this._contextKeyService).recomputeInitiallyAndOnChange(this._store);
    this.isEnabled = this._isEnabledContextKeyValue.map((v2) => v2 !== void 0);
  }
  static cast() {
    return this;
  }
  log(data) {
    const enabled = this._isEnabledContextKeyValue.get();
    if (!enabled) {
      return false;
    }
    this._dataChannelService.getDataChannel("structuredLogger:" + this._key).sendData(data);
    return true;
  }
};

StructuredLogger = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IDataChannelService)
], StructuredLogger);

function observableContextKey(key3, contextKeyService) {
  return observableFromEvent(contextKeyService.onDidChangeContext, () => contextKeyService.getContextKeyValue(key3));
}
export { formatRecordableLogEntry, observableContextKey, StructuredLogger };
