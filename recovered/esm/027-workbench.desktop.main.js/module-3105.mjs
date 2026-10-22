// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview.ts
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceFileEdit, ResourceTextEdit } from "./module-0537.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ConflictDetector } from "./module-3104.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { extUri } from "./module-0034.mjs";
import { coalesceInPlace } from "./module-0007.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Range2 } from "./module-0106.mjs";
import { SnippetParser } from "./module-0544.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { generateUuid } from "./module-0190.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { MicrotaskDelay } from "./module-0035.mjs";
import { createTextBufferFactoryFromSnapshot } from "./module-0423.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextModelService } from "./module-0081.mjs";


// src/vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview.ts
var CheckedStates = class {
  constructor() {
    this._states = /* @__PURE__ */ new WeakMap();
    this._checkedCount = 0;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  dispose() {
    this._onDidChange.dispose();
  }
  get checkedCount() {
    return this._checkedCount;
  }
  isChecked(obj) {
    return this._states.get(obj) ?? false;
  }
  updateChecked(obj, value2) {
    const valueNow = this._states.get(obj);
    if (valueNow === value2) {
      return;
    }
    if (valueNow === void 0) {
      if (value2) {
        this._checkedCount += 1;
      }
    } else {
      if (value2) {
        this._checkedCount += 1;
      } else {
        this._checkedCount -= 1;
      }
    }
    this._states.set(obj, value2);
    this._onDidChange.fire(obj);
  }
};

var BulkTextEdit = class {
  constructor(parent, textEdit) {
    this.parent = parent;
    this.textEdit = textEdit;
  }
};

var BulkFileOperation = class {
  constructor(uri5, parent) {
    this.uri = uri5;
    this.parent = parent;
    this.type = 0;
    this.textEdits = [];
    this.originalEdits = /* @__PURE__ */ new Map();
  }
  addEdit(index2, type, edit3) {
    this.type |= type;
    this.originalEdits.set(index2, edit3);
    if (edit3 instanceof ResourceTextEdit) {
      this.textEdits.push(new BulkTextEdit(this, edit3));
    } else if (type === 8 /* Rename */) {
      this.newUri = edit3.newResource;
    }
  }
  needsConfirmation() {
    for (const [, edit3] of this.originalEdits) {
      if (!this.parent.checked.isChecked(edit3)) {
        return true;
      }
    }
    return false;
  }
};

var BulkCategory = class _BulkCategory {
  constructor(metadata = _BulkCategory._defaultMetadata) {
    this.metadata = metadata;
    this.operationByResource = /* @__PURE__ */ new Map();
  }
  static {
    this._defaultMetadata = Object.freeze({
      label: localize(8347, null),
      icon: Codicon.symbolFile,
      needsConfirmation: false
    });
  }
  static keyOf(metadata) {
    return metadata?.label || "<default>";
  }
  get fileOperations() {
    return this.operationByResource.values();
  }
};

var BulkFileOperations = class {
  constructor(_bulkEdit, _fileService, instaService) {
    this._bulkEdit = _bulkEdit;
    this._fileService = _fileService;
    this.checked = new CheckedStates();
    this.fileOperations = [];
    this.categories = [];
    this.conflicts = instaService.createInstance(ConflictDetector, _bulkEdit);
  }
  static async create(accessor, bulkEdit) {
    const result = accessor.get(IInstantiationService).createInstance(BulkFileOperations, bulkEdit);
    return await result._init();
  }
  dispose() {
    this.checked.dispose();
    this.conflicts.dispose();
  }
  async _init() {
    const operationByResource = /* @__PURE__ */ new Map();
    const operationByCategory = /* @__PURE__ */ new Map();
    const newToOldUri = new ResourceMap();
    for (let idx = 0; idx < this._bulkEdit.length; idx++) {
      const edit3 = this._bulkEdit[idx];
      let uri5;
      let type;
      this.checked.updateChecked(edit3, !edit3.metadata?.needsConfirmation);
      if (edit3 instanceof ResourceTextEdit) {
        type = 1 /* TextEdit */;
        uri5 = edit3.resource;
      } else if (edit3 instanceof ResourceFileEdit) {
        if (edit3.newResource && edit3.oldResource) {
          type = 8 /* Rename */;
          uri5 = edit3.oldResource;
          if (edit3.options?.overwrite === void 0 && edit3.options?.ignoreIfExists && await this._fileService.exists(uri5)) {
            continue;
          }
          newToOldUri.set(edit3.newResource, uri5);
        } else if (edit3.oldResource) {
          type = 4 /* Delete */;
          uri5 = edit3.oldResource;
          if (edit3.options?.ignoreIfNotExists && !await this._fileService.exists(uri5)) {
            continue;
          }
        } else if (edit3.newResource) {
          type = 2 /* Create */;
          uri5 = edit3.newResource;
          if (edit3.options?.overwrite === void 0 && edit3.options?.ignoreIfExists && await this._fileService.exists(uri5)) {
            continue;
          }
        } else {
          continue;
        }
      } else {
        continue;
      }
      const insert2 = (uri6, map) => {
        let key4 = extUri.getComparisonKey(uri6, true);
        let operation = map.get(key4);
        if (!operation && newToOldUri.has(uri6)) {
          uri6 = newToOldUri.get(uri6);
          key4 = extUri.getComparisonKey(uri6, true);
          operation = map.get(key4);
        }
        if (!operation) {
          operation = new BulkFileOperation(uri6, this);
          map.set(key4, operation);
        }
        operation.addEdit(idx, type, edit3);
      };
      insert2(uri5, operationByResource);
      const key3 = BulkCategory.keyOf(edit3.metadata);
      let category11 = operationByCategory.get(key3);
      if (!category11) {
        category11 = new BulkCategory(edit3.metadata);
        operationByCategory.set(key3, category11);
      }
      insert2(uri5, category11.operationByResource);
    }
    operationByResource.forEach((value2) => this.fileOperations.push(value2));
    operationByCategory.forEach((value2) => this.categories.push(value2));
    for (const file of this.fileOperations) {
      if (file.type !== 1 /* TextEdit */) {
        let checked = true;
        for (const edit3 of file.originalEdits.values()) {
          if (edit3 instanceof ResourceFileEdit) {
            checked = checked && this.checked.isChecked(edit3);
          }
        }
        if (!checked) {
          for (const edit3 of file.originalEdits.values()) {
            this.checked.updateChecked(edit3, checked);
          }
        }
      }
    }
    this.categories.sort((a, b) => {
      if (a.metadata.needsConfirmation === b.metadata.needsConfirmation) {
        return a.metadata.label.localeCompare(b.metadata.label);
      } else if (a.metadata.needsConfirmation) {
        return -1;
      } else {
        return 1;
      }
    });
    return this;
  }
  getWorkspaceEdit() {
    const result = [];
    let allAccepted = true;
    for (let i2 = 0; i2 < this._bulkEdit.length; i2++) {
      const edit3 = this._bulkEdit[i2];
      if (this.checked.isChecked(edit3)) {
        result[i2] = edit3;
        continue;
      }
      allAccepted = false;
    }
    if (allAccepted) {
      return this._bulkEdit;
    }
    coalesceInPlace(result);
    return result;
  }
  async getFileEditOperation(edit3) {
    const content2 = await edit3.options.contents;
    if (!content2) {
      return void 0;
    }
    return EditOperation.replaceMove(Range2.lift({ startLineNumber: 0, startColumn: 0, endLineNumber: Number.MAX_VALUE, endColumn: 0 }), content2.toString());
  }
  async getFileEdits(uri5) {
    for (const file of this.fileOperations) {
      if (file.uri.toString() === uri5.toString()) {
        const result = [];
        let ignoreAll = false;
        for (const edit3 of file.originalEdits.values()) {
          if (edit3 instanceof ResourceFileEdit) {
            result.push(this.getFileEditOperation(edit3));
          } else if (edit3 instanceof ResourceTextEdit) {
            if (this.checked.isChecked(edit3)) {
              result.push(Promise.resolve(EditOperation.replaceMove(Range2.lift(edit3.textEdit.range), !edit3.textEdit.insertAsSnippet ? edit3.textEdit.text : SnippetParser.asInsertText(edit3.textEdit.text))));
            }
          } else if (!this.checked.isChecked(edit3)) {
            ignoreAll = true;
          }
        }
        if (ignoreAll) {
          return [];
        }
        return (await Promise.all(result)).filter((r2) => r2 !== void 0).sort((a, b) => Range2.compareRangesUsingStarts(a.range, b.range));
      }
    }
    return [];
  }
  getUriOfEdit(edit3) {
    for (const file of this.fileOperations) {
      for (const value2 of file.originalEdits.values()) {
        if (value2 === edit3) {
          return file.uri;
        }
      }
    }
    throw new Error("invalid edit");
  }
};

BulkFileOperations = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IInstantiationService)
], BulkFileOperations);

var BulkEditPreviewProvider = class {
  constructor(_operations, _languageService, _modelService, _textModelResolverService) {
    this._operations = _operations;
    this._languageService = _languageService;
    this._modelService = _modelService;
    this._textModelResolverService = _textModelResolverService;
    this._disposables = new DisposableStore();
    this._modelPreviewEdits = /* @__PURE__ */ new Map();
    this._instanceId = generateUuid();
    this._disposables.add(this._textModelResolverService.registerTextModelContentProvider(BulkEditPreviewProvider.Schema, this));
    this._ready = this._init();
  }
  static {
    this.Schema = "vscode-bulkeditpreview-editor";
  }
  static {
    this.emptyPreview = URI.from({ scheme: this.Schema, fragment: "empty" });
  }
  static fromPreviewUri(uri5) {
    return URI.parse(uri5.query);
  }
  dispose() {
    this._disposables.dispose();
  }
  asPreviewUri(uri5) {
    const path = uri5.scheme === Schemas.untitled ? `/${uri5.path}` : uri5.path;
    return URI.from({ scheme: BulkEditPreviewProvider.Schema, authority: this._instanceId, path, query: uri5.toString() });
  }
  async _init() {
    for (const operation of this._operations.fileOperations) {
      await this._applyTextEditsToPreviewModel(operation.uri);
    }
    this._disposables.add(Event2.debounce(this._operations.checked.onDidChange, (_last, e) => e, MicrotaskDelay)((e) => {
      const uri5 = this._operations.getUriOfEdit(e);
      this._applyTextEditsToPreviewModel(uri5);
    }));
  }
  async _applyTextEditsToPreviewModel(uri5) {
    const model = await this._getOrCreatePreviewModel(uri5);
    const undoEdits = this._modelPreviewEdits.get(model.id);
    if (undoEdits) {
      model.applyEdits(undoEdits);
    }
    const newEdits = await this._operations.getFileEdits(uri5);
    const newUndoEdits = model.applyEdits(newEdits, true);
    this._modelPreviewEdits.set(model.id, newUndoEdits);
  }
  async _getOrCreatePreviewModel(uri5) {
    const previewUri = this.asPreviewUri(uri5);
    let model = this._modelService.getModel(previewUri);
    if (!model) {
      try {
        const ref = await this._textModelResolverService.createModelReference(uri5);
        const sourceModel = ref.object.textEditorModel;
        model = this._modelService.createModel(
          createTextBufferFactoryFromSnapshot(sourceModel.createSnapshot()),
          this._languageService.createById(sourceModel.getLanguageId()),
          previewUri
        );
        ref.dispose();
      } catch {
        model = this._modelService.createModel(
          "",
          this._languageService.createByFilepathOrFirstLine(previewUri),
          previewUri
        );
      }
      queueMicrotask(async () => {
        this._disposables.add(await this._textModelResolverService.createModelReference(model.uri));
      });
    }
    return model;
  }
  async provideTextContent(previewUri) {
    if (previewUri.toString() === BulkEditPreviewProvider.emptyPreview.toString()) {
      return this._modelService.createModel("", null, previewUri);
    }
    await this._ready;
    return this._modelService.getModel(previewUri);
  }
};

BulkEditPreviewProvider = __decorateClass([
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ITextModelService)
], BulkEditPreviewProvider);
export { CheckedStates, BulkTextEdit, BulkFileOperation, BulkCategory, BulkFileOperations, BulkEditPreviewProvider };
