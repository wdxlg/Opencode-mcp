// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostDocuments.ts
import { DisposableStore } from "./module-0011.mjs";
import { Emitter } from "./module-0017.mjs";
import { MainContext } from "./module-0054.mjs";
import { URI } from "./module-0025.mjs";
import { assertReturnsDefined } from "./module-0009.mjs";
import { deepFreeze } from "./module-0042.mjs";
import { Range3 } from "./module-0245.mjs";
import { setWordDefinitionFor } from "./module-0298.mjs";


// src/vs/workbench/api/common/extHostDocuments.ts
var ExtHostDocuments = class {
  constructor(mainContext, documentsAndEditors) {
    this._toDispose = new DisposableStore();
    this._onDidAddDocument = this._toDispose.add(new Emitter());
    this._onDidRemoveDocument = this._toDispose.add(new Emitter());
    this._onDidChangeDocument = this._toDispose.add(new Emitter());
    this._onDidChangeDocumentWithReason = this._toDispose.add(new Emitter());
    this._onDidSaveDocument = this._toDispose.add(new Emitter());
    this.onDidAddDocument = this._onDidAddDocument.event;
    this.onDidRemoveDocument = this._onDidRemoveDocument.event;
    this.onDidChangeDocument = this._onDidChangeDocument.event;
    this.onDidChangeDocumentWithReason = this._onDidChangeDocumentWithReason.event;
    this.onDidSaveDocument = this._onDidSaveDocument.event;
    this._documentLoader = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadDocuments);
    this._documentsAndEditors = documentsAndEditors;
    this._documentsAndEditors.onDidRemoveDocuments((documents) => {
      for (const data of documents) {
        this._onDidRemoveDocument.fire(data.document);
      }
    }, void 0, this._toDispose);
    this._documentsAndEditors.onDidAddDocuments((documents) => {
      for (const data of documents) {
        this._onDidAddDocument.fire(data.document);
      }
    }, void 0, this._toDispose);
  }
  dispose() {
    this._toDispose.dispose();
  }
  getAllDocumentData() {
    return [...this._documentsAndEditors.allDocuments()];
  }
  getDocumentData(resource) {
    if (!resource) {
      return void 0;
    }
    const data = this._documentsAndEditors.getDocument(resource);
    if (data) {
      return data;
    }
    return void 0;
  }
  getDocument(resource) {
    const data = this.getDocumentData(resource);
    if (!data?.document) {
      throw new Error(`Unable to retrieve document from URI '${resource}'`);
    }
    return data.document;
  }
  ensureDocumentData(uri2, options2) {
    const cached = this._documentsAndEditors.getDocument(uri2);
    if (cached && (!options2?.encoding || cached.document.encoding === options2.encoding)) {
      return Promise.resolve(cached);
    }
    let promise = this._documentLoader.get(uri2.toString());
    if (!promise) {
      promise = this._proxy.$tryOpenDocument(uri2, options2).then((uriData) => {
        this._documentLoader.delete(uri2.toString());
        const canonicalUri = URI.revive(uriData);
        return assertReturnsDefined(this._documentsAndEditors.getDocument(canonicalUri));
      }, (err) => {
        this._documentLoader.delete(uri2.toString());
        return Promise.reject(err);
      });
      this._documentLoader.set(uri2.toString(), promise);
    } else {
      if (options2?.encoding) {
        promise = promise.then((data) => {
          if (data.document.encoding !== options2.encoding) {
            return this.ensureDocumentData(uri2, options2);
          }
          return data;
        });
      }
    }
    return promise;
  }
  createDocumentData(options2) {
    return this._proxy.$tryCreateDocument(options2).then((data) => URI.revive(data));
  }
  $acceptModelLanguageChanged(uriComponents, newLanguageId) {
    const uri2 = URI.revive(uriComponents);
    const data = this._documentsAndEditors.getDocument(uri2);
    if (!data) {
      throw new Error("unknown document");
    }
    this._onDidRemoveDocument.fire(data.document);
    data._acceptLanguageId(newLanguageId);
    this._onDidAddDocument.fire(data.document);
  }
  $acceptModelSaved(uriComponents) {
    const uri2 = URI.revive(uriComponents);
    const data = this._documentsAndEditors.getDocument(uri2);
    if (!data) {
      throw new Error("unknown document");
    }
    this.$acceptDirtyStateChanged(uriComponents, false);
    this._onDidSaveDocument.fire(data.document);
  }
  $acceptDirtyStateChanged(uriComponents, isDirty) {
    const uri2 = URI.revive(uriComponents);
    const data = this._documentsAndEditors.getDocument(uri2);
    if (!data) {
      throw new Error("unknown document");
    }
    data._acceptIsDirty(isDirty);
    this._onDidChangeDocument.fire({
      document: data.document,
      contentChanges: [],
      reason: void 0
    });
    this._onDidChangeDocumentWithReason.fire({
      document: data.document,
      contentChanges: [],
      reason: void 0,
      detailedReason: void 0
    });
  }
  $acceptEncodingChanged(uriComponents, encoding) {
    const uri2 = URI.revive(uriComponents);
    const data = this._documentsAndEditors.getDocument(uri2);
    if (!data) {
      throw new Error("unknown document");
    }
    data._acceptEncoding(encoding);
    this._onDidChangeDocument.fire({
      document: data.document,
      contentChanges: [],
      reason: void 0
    });
    this._onDidChangeDocumentWithReason.fire({
      document: data.document,
      contentChanges: [],
      reason: void 0,
      detailedReason: void 0
    });
  }
  $acceptModelChanged(uriComponents, events, isDirty) {
    const uri2 = URI.revive(uriComponents);
    const data = this._documentsAndEditors.getDocument(uri2);
    if (!data) {
      throw new Error("unknown document");
    }
    data._acceptIsDirty(isDirty);
    data.onEvents(events);
    let reason = void 0;
    if (events.isUndoing) {
      reason = 1 /* Undo */;
    } else if (events.isRedoing) {
      reason = 2 /* Redo */;
    }
    this._onDidChangeDocument.fire(deepFreeze({
      document: data.document,
      contentChanges: events.changes.map((change) => {
        return {
          range: Range3.to(change.range),
          rangeOffset: change.rangeOffset,
          rangeLength: change.rangeLength,
          text: change.text
        };
      }),
      reason
    }));
    this._onDidChangeDocumentWithReason.fire(deepFreeze({
      document: data.document,
      contentChanges: events.changes.map((change) => {
        return {
          range: Range3.to(change.range),
          rangeOffset: change.rangeOffset,
          rangeLength: change.rangeLength,
          text: change.text
        };
      }),
      reason,
      detailedReason: events.detailedReason ? {
        source: events.detailedReason.source,
        metadata: events.detailedReason
      } : void 0
    }));
  }
  setWordDefinitionFor(languageId, wordDefinition) {
    setWordDefinitionFor(languageId, wordDefinition);
  }
};
export { ExtHostDocuments };
