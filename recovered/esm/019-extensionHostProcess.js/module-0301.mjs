// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostDocumentsAndEditors.ts
import { ResourceMap } from "./module-0007.mjs";
import { Emitter } from "./module-0017.mjs";
import { URI } from "./module-0025.mjs";
import { Schemas } from "./module-0026.mjs";
import { ExtHostDocumentData } from "./module-0298.mjs";
import { MainContext } from "./module-0054.mjs";
import { ok } from "./module-0008.mjs";
import { ExtHostTextEditor } from "./module-0300.mjs";
import { Lazy } from "./module-0021.mjs";
import { Range3, Selection2, ViewColumn2 } from "./module-0245.mjs";
import { dispose } from "./module-0011.mjs";
import { Iterable } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { ILogService } from "./module-0062.mjs";
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/workbench/api/common/extHostDocumentsAndEditors.ts
var Reference = class {
  constructor(value) {
    this.value = value;
    this._count = 0;
  }
  ref() {
    this._count++;
  }
  unref() {
    return --this._count === 0;
  }
};

var ExtHostDocumentsAndEditors = class {
  constructor(_extHostRpc, _logService) {
    this._extHostRpc = _extHostRpc;
    this._logService = _logService;
    this._activeEditorId = null;
    this._editors = /* @__PURE__ */ new Map();
    this._documents = new ResourceMap();
    this._onDidAddDocuments = new Emitter();
    this._onDidRemoveDocuments = new Emitter();
    this._onDidChangeVisibleTextEditors = new Emitter();
    this._onDidChangeActiveTextEditor = new Emitter();
    this.onDidAddDocuments = this._onDidAddDocuments.event;
    this.onDidRemoveDocuments = this._onDidRemoveDocuments.event;
    this.onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
    this.onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
  }
  $acceptDocumentsAndEditorsDelta(delta3) {
    this.acceptDocumentsAndEditorsDelta(delta3);
  }
  acceptDocumentsAndEditorsDelta(delta3) {
    const removedDocuments = [];
    const addedDocuments = [];
    const removedEditors = [];
    if (delta3.removedDocuments) {
      for (const uriComponent of delta3.removedDocuments) {
        const uri2 = URI.revive(uriComponent);
        const data = this._documents.get(uri2);
        if (data?.unref()) {
          this._documents.delete(uri2);
          removedDocuments.push(data.value);
        }
      }
    }
    if (delta3.addedDocuments) {
      for (const data of delta3.addedDocuments) {
        const resource = URI.revive(data.uri);
        let ref = this._documents.get(resource);
        if (ref) {
          if (resource.scheme !== Schemas.vscodeNotebookCell && resource.scheme !== Schemas.vscodeInteractiveInput) {
            throw new Error(`document '${resource} already exists!'`);
          }
        }
        if (!ref) {
          ref = new Reference(new ExtHostDocumentData(
            this._extHostRpc.getProxy(MainContext.MainThreadDocuments),
            resource,
            data.lines,
            data.EOL,
            data.versionId,
            data.languageId,
            data.isDirty,
            data.encoding
          ));
          this._documents.set(resource, ref);
          addedDocuments.push(ref.value);
        }
        ref.ref();
      }
    }
    if (delta3.removedEditors) {
      for (const id2 of delta3.removedEditors) {
        const editor = this._editors.get(id2);
        this._editors.delete(id2);
        if (editor) {
          removedEditors.push(editor);
        }
      }
    }
    if (delta3.addedEditors) {
      for (const data of delta3.addedEditors) {
        const resource = URI.revive(data.documentUri);
        ok(this._documents.has(resource), `document '${resource}' does not exist`);
        ok(!this._editors.has(data.id), `editor '${data.id}' already exists!`);
        const documentData = this._documents.get(resource).value;
        const editor = new ExtHostTextEditor(
          data.id,
          this._extHostRpc.getProxy(MainContext.MainThreadTextEditors),
          this._logService,
          new Lazy(() => documentData.document),
          data.selections.map(Selection2.to),
          data.options,
          data.visibleRanges.map((range) => Range3.to(range)),
          typeof data.editorPosition === "number" ? ViewColumn2.to(data.editorPosition) : void 0
        );
        this._editors.set(data.id, editor);
      }
    }
    if (delta3.newActiveEditor !== void 0) {
      ok(delta3.newActiveEditor === null || this._editors.has(delta3.newActiveEditor), `active editor '${delta3.newActiveEditor}' does not exist`);
      this._activeEditorId = delta3.newActiveEditor;
    }
    dispose(removedDocuments);
    dispose(removedEditors);
    if (delta3.removedDocuments) {
      this._onDidRemoveDocuments.fire(removedDocuments);
    }
    if (delta3.addedDocuments) {
      this._onDidAddDocuments.fire(addedDocuments);
    }
    if (delta3.removedEditors || delta3.addedEditors) {
      this._onDidChangeVisibleTextEditors.fire(this.allEditors().map((editor) => editor.value));
    }
    if (delta3.newActiveEditor !== void 0) {
      this._onDidChangeActiveTextEditor.fire(this.activeEditor());
    }
  }
  getDocument(uri2) {
    return this._documents.get(uri2)?.value;
  }
  allDocuments() {
    return Iterable.map(this._documents.values(), (ref) => ref.value);
  }
  getEditor(id2) {
    return this._editors.get(id2);
  }
  activeEditor(internal) {
    if (!this._activeEditorId) {
      return void 0;
    }
    const editor = this._editors.get(this._activeEditorId);
    if (internal) {
      return editor;
    } else {
      return editor?.value;
    }
  }
  allEditors() {
    return [...this._editors.values()];
  }
};

ExtHostDocumentsAndEditors = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, ILogService)
], ExtHostDocumentsAndEditors);

var IExtHostDocumentsAndEditors = createDecorator2("IExtHostDocumentsAndEditors");
export { Reference, ExtHostDocumentsAndEditors, IExtHostDocumentsAndEditors };
