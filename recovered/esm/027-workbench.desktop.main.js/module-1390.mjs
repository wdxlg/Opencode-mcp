// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadNotebookDocuments.ts
import { DisposableStore, dispose } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { ExtHostContext } from "./module-0921.mjs";
import { BoundModelReferenceCollection } from "./module-1076.mjs";
import { NotebookDto } from "./module-0994.mjs";
import { SerializableObjectWithBuffers } from "./module-0920.mjs";
import { Event2 } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookEditorModelResolverService } from "./module-0927.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/api/browser/mainThreadNotebookDocuments.ts
var MainThreadNotebookDocuments = class {
  constructor(extHostContext, _notebookEditorModelResolverService, _uriIdentityService) {
    this._notebookEditorModelResolverService = _notebookEditorModelResolverService;
    this._uriIdentityService = _uriIdentityService;
    this._disposables = new DisposableStore();
    this._documentEventListenersMapping = new ResourceMap();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebookDocuments);
    this._modelReferenceCollection = new BoundModelReferenceCollection(this._uriIdentityService.extUri);
    this._disposables.add(this._notebookEditorModelResolverService.onDidChangeDirty((model) => this._proxy.$acceptDirtyStateChanged(model.resource, model.isDirty())));
    this._disposables.add(this._notebookEditorModelResolverService.onDidSaveNotebook((e) => this._proxy.$acceptModelSaved(e)));
    this._disposables.add(_notebookEditorModelResolverService.onWillFailWithConflict((e) => {
      this._modelReferenceCollection.remove(e.resource);
    }));
  }
  dispose() {
    this._disposables.dispose();
    this._modelReferenceCollection.dispose();
    dispose(this._documentEventListenersMapping.values());
  }
  handleNotebooksAdded(notebooks) {
    for (const textModel of notebooks) {
      const disposableStore = new DisposableStore();
      disposableStore.add(textModel.onDidChangeContent((event) => {
        const eventDto = {
          versionId: event.versionId,
          rawEvents: []
        };
        for (const e of event.rawEvents) {
          switch (e.kind) {
            case 1 /* ModelChange */:
              eventDto.rawEvents.push({
                kind: e.kind,
                changes: e.changes.map((diff4) => [diff4[0], diff4[1], diff4[2].map((cell) => NotebookDto.toNotebookCellDto(cell))])
              });
              break;
            case 2 /* Move */:
              eventDto.rawEvents.push({
                kind: e.kind,
                index: e.index,
                length: e.length,
                newIdx: e.newIdx
              });
              break;
            case 8 /* Output */:
              eventDto.rawEvents.push({
                kind: e.kind,
                index: e.index,
                outputs: e.outputs.map(NotebookDto.toNotebookOutputDto)
              });
              break;
            case 9 /* OutputItem */:
              eventDto.rawEvents.push({
                kind: e.kind,
                index: e.index,
                outputId: e.outputId,
                outputItems: e.outputItems.map(NotebookDto.toNotebookOutputItemDto),
                append: e.append
              });
              break;
            case 5 /* ChangeCellLanguage */:
            case 10 /* ChangeCellContent */:
            case 7 /* ChangeCellMetadata */:
            case 12 /* ChangeCellInternalMetadata */:
              eventDto.rawEvents.push(e);
              break;
          }
        }
        const hasDocumentMetadataChangeEvent = event.rawEvents.find((e) => e.kind === 11 /* ChangeDocumentMetadata */);
        this._proxy.$acceptModelChanged(
          textModel.uri,
          new SerializableObjectWithBuffers(eventDto),
          this._notebookEditorModelResolverService.isDirty(textModel.uri),
          hasDocumentMetadataChangeEvent ? textModel.metadata : void 0
        );
      }));
      this._documentEventListenersMapping.set(textModel.uri, disposableStore);
    }
  }
  handleNotebooksRemoved(uris) {
    for (const uri5 of uris) {
      this._documentEventListenersMapping.get(uri5)?.dispose();
      this._documentEventListenersMapping.delete(uri5);
    }
  }
  async $tryCreateNotebook(options3) {
    if (options3.content) {
      const ref = await this._notebookEditorModelResolverService.resolve({ untitledResource: void 0 }, options3.viewType);
      Event2.once(ref.object.notebook.onWillDispose)(() => {
        ref.dispose();
      });
      this._proxy.$acceptDirtyStateChanged(ref.object.resource, true);
      if (options3.content) {
        const data = NotebookDto.fromNotebookDataDto(options3.content);
        ref.object.notebook.reset(data.cells, data.metadata, ref.object.notebook.transientOptions);
      }
      return ref.object.notebook.uri;
    } else {
      const notebook = await this._notebookEditorModelResolverService.createUntitledNotebookTextModel(options3.viewType);
      return notebook.uri;
    }
  }
  async $tryOpenNotebook(uriComponents) {
    const uri5 = URI.revive(uriComponents);
    const ref = await this._notebookEditorModelResolverService.resolve(uri5, void 0);
    if (uriComponents.scheme === "untitled") {
      ref.object.notebook.onWillDispose(() => {
        ref.dispose();
      });
    }
    this._modelReferenceCollection.add(uri5, ref);
    return uri5;
  }
  async $trySaveNotebook(uriComponents) {
    const uri5 = URI.revive(uriComponents);
    const ref = await this._notebookEditorModelResolverService.resolve(uri5);
    const saveResult = await ref.object.save();
    ref.dispose();
    return saveResult;
  }
};

MainThreadNotebookDocuments = __decorateClass([
  __decorateParam(1, INotebookEditorModelResolverService),
  __decorateParam(2, IUriIdentityService)
], MainThreadNotebookDocuments);
export { MainThreadNotebookDocuments };
