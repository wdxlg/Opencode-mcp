// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostDocumentSaveParticipant.ts
import { LinkedList } from "./module-0014.mjs";
import { URI } from "./module-0023.mjs";
import { EndOfLine2, Range3, TextDocumentSaveReason2 } from "./module-0239.mjs";
import { illegalState } from "./module-0002.mjs";
import { TextEdit } from "./module-0236.mjs";
import { SerializableObjectWithBuffers } from "./module-0024.mjs";


// src/vs/workbench/api/common/extHostDocumentSaveParticipant.ts
var ExtHostDocumentSaveParticipant = class {
  constructor(_logService, _documents, _mainThreadBulkEdits, _thresholds = { timeout: 1500, errors: 3 }) {
    this._logService = _logService;
    this._documents = _documents;
    this._mainThreadBulkEdits = _mainThreadBulkEdits;
    this._thresholds = _thresholds;
    this._callbacks = new LinkedList();
    this._badListeners = /* @__PURE__ */ new WeakMap();
  }
  dispose() {
    this._callbacks.clear();
  }
  getOnWillSaveTextDocumentEvent(extension) {
    return (listener, thisArg, disposables) => {
      const remove = this._callbacks.push([listener, thisArg, extension]);
      const result = { dispose: remove };
      if (Array.isArray(disposables)) {
        disposables.push(result);
      }
      return result;
    };
  }
  async $participateInSave(data2, reason) {
    const resource = URI.revive(data2);
    let didTimeout = false;
    const didTimeoutHandle = setTimeout(() => didTimeout = true, this._thresholds.timeout);
    const results = [];
    try {
      for (const listener of [...this._callbacks]) {
        if (didTimeout) {
          break;
        }
        const document2 = this._documents.getDocument(resource);
        const success = await this._deliverEventAsyncAndBlameBadListeners(listener, { document: document2, reason: TextDocumentSaveReason2.to(reason) });
        results.push(success);
      }
    } finally {
      clearTimeout(didTimeoutHandle);
    }
    return results;
  }
  _deliverEventAsyncAndBlameBadListeners([listener, thisArg, extension], stubEvent) {
    const errors = this._badListeners.get(listener);
    if (typeof errors === "number" && errors > this._thresholds.errors) {
      return Promise.resolve(false);
    }
    return this._deliverEventAsync(extension, listener, thisArg, stubEvent).then(() => {
      return true;
    }, (err) => {
      this._logService.error(`onWillSaveTextDocument-listener from extension '${extension.identifier.value}' threw ERROR`);
      this._logService.error(err);
      if (!(err instanceof Error) || err.message !== "concurrent_edits") {
        const errors2 = this._badListeners.get(listener);
        this._badListeners.set(listener, !errors2 ? 1 : errors2 + 1);
        if (typeof errors2 === "number" && errors2 > this._thresholds.errors) {
          this._logService.info(`onWillSaveTextDocument-listener from extension '${extension.identifier.value}' will now be IGNORED because of timeouts and/or errors`);
        }
      }
      return false;
    });
  }
  _deliverEventAsync(extension, listener, thisArg, stubEvent) {
    const promises = [];
    const t1 = Date.now();
    const { document: document2, reason } = stubEvent;
    const { version } = document2;
    const event = Object.freeze({
      document: document2,
      reason,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      waitUntil(p) {
        if (Object.isFrozen(promises)) {
          throw illegalState("waitUntil can not be called async");
        }
        promises.push(Promise.resolve(p));
      }
    });
    try {
      listener.apply(thisArg, [event]);
    } catch (err) {
      return Promise.reject(err);
    }
    Object.freeze(promises);
    return new Promise((resolve2, reject) => {
      const handle = setTimeout(() => reject(new Error("timeout")), this._thresholds.timeout);
      return Promise.all(promises).then((edits) => {
        this._logService.debug(`onWillSaveTextDocument-listener from extension '${extension.identifier.value}' finished after ${Date.now() - t1}ms`);
        clearTimeout(handle);
        resolve2(edits);
      }).catch((err) => {
        clearTimeout(handle);
        reject(err);
      });
    }).then((values) => {
      const dto = { edits: [] };
      for (const value of values) {
        if (Array.isArray(value) && value.every((e) => e instanceof TextEdit)) {
          for (const { newText, newEol, range } of value) {
            dto.edits.push({
              resource: document2.uri,
              versionId: void 0,
              textEdit: {
                range: range && Range3.from(range),
                text: newText,
                eol: newEol && EndOfLine2.from(newEol)
              }
            });
          }
        }
      }
      if (dto.edits.length === 0) {
        return void 0;
      }
      if (version === document2.version) {
        return this._mainThreadBulkEdits.$tryApplyWorkspaceEdit(new SerializableObjectWithBuffers(dto));
      }
      return Promise.reject(new Error("concurrent_edits"));
    });
  }
};
export { ExtHostDocumentSaveParticipant };
