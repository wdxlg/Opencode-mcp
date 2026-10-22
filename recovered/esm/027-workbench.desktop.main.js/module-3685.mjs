// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/helpers/annotatedDocuments.ts
import { Disposable } from "./module-0012.mjs";
import { derivedObservableWithCache, mapObservableArrayCached } from "./module-0059.mjs";
import { derived } from "./module-0054.mjs";
import { isDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { CombineStreamedChanges, DocumentWithSourceAnnotatedEdits, MinimizeEditsProcessor } from "./module-3684.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/helpers/annotatedDocuments.ts
var AnnotatedDocuments = class extends Disposable {
  constructor(_workspace, _instantiationService) {
    super();
    this._workspace = _workspace;
    this._instantiationService = _instantiationService;
    const uriVisibilityProvider = this._instantiationService.createInstance(UriVisibilityProvider);
    this._states = mapObservableArrayCached(this, this._workspace.documents, (doc, store) => {
      const docIsVisible = derived((reader) => uriVisibilityProvider.isVisible(doc.uri, reader));
      const wasEverVisible = derivedObservableWithCache(this, (reader, lastVal) => lastVal || docIsVisible.read(reader));
      return wasEverVisible.map((v2) => v2 ? store.add(this._instantiationService.createInstance(AnnotatedDocument, doc, docIsVisible)) : void 0);
    });
    this.documents = this._states.map((vals, reader) => vals.map((v2) => v2.read(reader)).filter(isDefined));
    this.documents.recomputeInitiallyAndOnChange(this._store);
  }
};

AnnotatedDocuments = __decorateClass([
  __decorateParam(1, IInstantiationService)
], AnnotatedDocuments);

var UriVisibilityProvider = class {
  constructor(_editorGroupsService) {
    this._editorGroupsService = _editorGroupsService;
    const onDidAddGroupSignal = observableSignalFromEvent(this, this._editorGroupsService.onDidAddGroup);
    const onDidRemoveGroupSignal = observableSignalFromEvent(this, this._editorGroupsService.onDidRemoveGroup);
    const groups = derived(this, (reader) => {
      onDidAddGroupSignal.read(reader);
      onDidRemoveGroupSignal.read(reader);
      return this._editorGroupsService.groups;
    });
    this.visibleUris = mapObservableArrayCached(this, groups, (g) => {
      const editors = observableFromEvent(this, g.onDidModelChange, () => g.editors);
      return editors.map((e) => e.map((editor) => EditorResourceAccessor.getCanonicalUri(editor)));
    }).map((editors, reader) => {
      const map = /* @__PURE__ */ new Map();
      for (const urisObs of editors) {
        for (const uri5 of urisObs.read(reader)) {
          if (isDefined(uri5)) {
            map.set(uri5.toString(), uri5);
          }
        }
      }
      return map;
    });
  }
  isVisible(uri5, reader) {
    return this.visibleUris.read(reader).has(uri5.toString());
  }
};

UriVisibilityProvider = __decorateClass([
  __decorateParam(0, IEditorGroupsService)
], UriVisibilityProvider);

var AnnotatedDocument = class extends Disposable {
  constructor(document2, isVisible, _instantiationService) {
    super();
    this.document = document2;
    this.isVisible = isVisible;
    this._instantiationService = _instantiationService;
    let processedDoc = this._store.add(new DocumentWithSourceAnnotatedEdits(document2));
    processedDoc = this._store.add(this._instantiationService.createInstance(CombineStreamedChanges, processedDoc));
    processedDoc = this._store.add(new MinimizeEditsProcessor(processedDoc));
    this.documentWithAnnotations = processedDoc;
  }
};

AnnotatedDocument = __decorateClass([
  __decorateParam(2, IInstantiationService)
], AnnotatedDocument);
export { AnnotatedDocuments, UriVisibilityProvider, AnnotatedDocument };
