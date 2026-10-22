// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostQuickDiff.ts
import { Emitter } from "./module-0019.mjs";
import { URI } from "./module-0023.mjs";
import { MainContext } from "./module-0025.mjs";
import { asPromise } from "./module-0034.mjs";
import { ExtensionIdentifier } from "./module-0040.mjs";
import { DocumentSelector } from "./module-0239.mjs";


// src/vs/workbench/api/common/extHostQuickDiff.ts
var ExtHostSourceControlDiffInformation = class {
  constructor(handle, proxy, documents, onDispose) {
    this.handle = handle;
    this.proxy = proxy;
    this.documents = documents;
    this.onDispose = onDispose;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  get diffInformation() {
    return this._diffInformation;
  }
  $acceptDiffInformation(diffInformation) {
    if (!diffInformation) {
      this._diffInformation = void 0;
      this._onDidChange.fire();
      return;
    }
    const documents = this.documents;
    const original = URI.revive(diffInformation.original);
    const modified = URI.revive(diffInformation.modified);
    const changes = diffInformation.changes.map((change) => {
      const [originalStartLineNumber, originalEndLineNumberExclusive, modifiedStartLineNumber, modifiedEndLineNumberExclusive] = change;
      let kind;
      if (originalStartLineNumber === originalEndLineNumberExclusive) {
        kind = 1 /* Addition */;
      } else if (modifiedStartLineNumber === modifiedEndLineNumberExclusive) {
        kind = 2 /* Deletion */;
      } else {
        kind = 3 /* Modification */;
      }
      return {
        original: { startLineNumber: originalStartLineNumber, endLineNumberExclusive: originalEndLineNumberExclusive },
        modified: { startLineNumber: modifiedStartLineNumber, endLineNumberExclusive: modifiedEndLineNumberExclusive },
        kind
      };
    });
    this._diffInformation = Object.freeze({
      documentVersion: diffInformation.documentVersion,
      original,
      modified,
      changes,
      get isStale() {
        const document2 = documents.getDocumentData(modified);
        return document2?.document.version !== diffInformation.documentVersion;
      }
    });
    this._onDidChange.fire();
  }
  dispose() {
    this.proxy.$disposeSourceControlDiffInformation(this.handle);
    this._onDidChange.dispose();
    this.onDispose(this.handle);
  }
};

var ExtHostQuickDiff = class _ExtHostQuickDiff {
  constructor(mainContext, documents, uriTransformer) {
    this.documents = documents;
    this.uriTransformer = uriTransformer;
    this.providers = /* @__PURE__ */ new Map();
    this.informations = /* @__PURE__ */ new Map();
    this.proxy = mainContext.getProxy(MainContext.MainThreadQuickDiff);
  }
  static {
    this.handlePool = 0;
  }
  $provideOriginalResource(handle, uriComponents, token) {
    const uri2 = URI.revive(uriComponents);
    const provider = this.providers.get(handle);
    if (!provider) {
      return Promise.resolve(null);
    }
    return asPromise(() => provider.provideOriginalResource(uri2, token)).then((r2) => r2 || null);
  }
  $acceptSourceControlDiffInformation(handle, diffInformation) {
    this.informations.get(handle)?.$acceptDiffInformation(diffInformation);
  }
  registerQuickDiffProvider(extension, selector, quickDiffProvider, id2, label, rootUri) {
    const handle = _ExtHostQuickDiff.handlePool++;
    this.providers.set(handle, quickDiffProvider);
    const extensionId = ExtensionIdentifier.toKey(extension.identifier);
    this.proxy.$registerQuickDiffProvider(handle, DocumentSelector.from(selector, this.uriTransformer), `${extensionId}.${id2}`, label, rootUri);
    return {
      dispose: () => {
        this.proxy.$unregisterQuickDiffProvider(handle);
        this.providers.delete(handle);
      }
    };
  }
  createSourceControlDiffInformation(uri2) {
    const handle = _ExtHostQuickDiff.handlePool++;
    const information = new ExtHostSourceControlDiffInformation(handle, this.proxy, this.documents, (h) => this.informations.delete(h));
    this.informations.set(handle, information);
    this.proxy.$createSourceControlDiffInformation(handle, uri2);
    return information;
  }
};
export { ExtHostSourceControlDiffInformation, ExtHostQuickDiff };
