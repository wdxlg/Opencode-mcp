// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostDocumentContentProviders.ts
import { MainContext } from "./module-0025.mjs";
import { Schemas } from "./module-0031.mjs";
import { splitLines } from "./module-0029.mjs";
import { onUnexpectedError } from "./module-0002.mjs";
import { Disposable2 } from "./module-0238.mjs";
import { URI } from "./module-0023.mjs";
import { CancellationToken } from "./module-0026.mjs";


// src/vs/workbench/api/common/extHostDocumentContentProviders.ts
var ExtHostDocumentContentProvider = class _ExtHostDocumentContentProvider {
  constructor(mainContext, _documentsAndEditors, _logService) {
    this._documentsAndEditors = _documentsAndEditors;
    this._logService = _logService;
    this._documentContentProviders = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadDocumentContentProviders);
  }
  static {
    this._handlePool = 0;
  }
  registerTextDocumentContentProvider(scheme, provider) {
    if (Object.keys(Schemas).indexOf(scheme) >= 0) {
      throw new Error(`scheme '${scheme}' already registered`);
    }
    const handle = _ExtHostDocumentContentProvider._handlePool++;
    this._documentContentProviders.set(handle, provider);
    this._proxy.$registerTextContentProvider(handle, scheme);
    let subscription;
    if (typeof provider.onDidChange === "function") {
      let lastEvent;
      subscription = provider.onDidChange(async (uri2) => {
        if (uri2.scheme !== scheme) {
          this._logService.warn(`Provider for scheme '${scheme}' is firing event for schema '${uri2.scheme}' which will be IGNORED`);
          return;
        }
        if (!this._documentsAndEditors.getDocument(uri2)) {
          return;
        }
        if (lastEvent) {
          await lastEvent;
        }
        const thisEvent = this.$provideTextDocumentContent(handle, uri2).then(async (value) => {
          if (!value && typeof value !== "string") {
            return;
          }
          const document2 = this._documentsAndEditors.getDocument(uri2);
          if (!document2) {
            return;
          }
          const lines = splitLines(value);
          if (!document2.equalLines(lines)) {
            return this._proxy.$onVirtualDocumentChange(uri2, value);
          }
        }).catch(onUnexpectedError).finally(() => {
          if (lastEvent === thisEvent) {
            lastEvent = void 0;
          }
        });
        lastEvent = thisEvent;
      });
    }
    return new Disposable2(() => {
      if (this._documentContentProviders.delete(handle)) {
        this._proxy.$unregisterTextContentProvider(handle);
      }
      if (subscription) {
        subscription.dispose();
        subscription = void 0;
      }
    });
  }
  $provideTextDocumentContent(handle, uri2) {
    const provider = this._documentContentProviders.get(handle);
    if (!provider) {
      return Promise.reject(new Error(`unsupported uri-scheme: ${uri2.scheme}`));
    }
    return Promise.resolve(provider.provideTextDocumentContent(URI.revive(uri2), CancellationToken.None));
  }
};
export { ExtHostDocumentContentProvider };
