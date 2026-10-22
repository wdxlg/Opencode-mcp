// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/bulkEdit/browser/bulkTextEdits.ts
import { Range2 } from "./module-0106.mjs";
import { EditOperation } from "./module-0162.mjs";
import { SnippetParser } from "./module-0544.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { ResourceTextEdit } from "./module-0537.mjs";
import { MultiModelEditStackElement, SingleModelEditStackElement } from "./module-0393.mjs";
import { dispose } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IUndoRedoService } from "./module-0374.mjs";


// src/vs/workbench/contrib/bulkEdit/browser/bulkTextEdits.ts
var ModelEditTask = class {
  constructor(_modelReference) {
    this._modelReference = _modelReference;
    this.model = this._modelReference.object.textEditorModel;
    this._edits = [];
  }
  dispose() {
    this._modelReference.dispose();
  }
  isNoOp() {
    if (this._edits.length > 0) {
      return false;
    }
    if (this._newEol !== void 0 && this._newEol !== this.model.getEndOfLineSequence()) {
      return false;
    }
    return true;
  }
  addEdit(resourceEdit) {
    this._expectedModelVersionId = resourceEdit.versionId;
    const { textEdit } = resourceEdit;
    if (typeof textEdit.eol === "number") {
      this._newEol = textEdit.eol;
    }
    if (!textEdit.range && !textEdit.text) {
      return;
    }
    if (Range2.isEmpty(textEdit.range) && !textEdit.text) {
      return;
    }
    let range2;
    if (!textEdit.range) {
      range2 = this.model.getFullModelRange();
    } else {
      range2 = Range2.lift(textEdit.range);
    }
    this._edits.push({ ...EditOperation.replaceMove(range2, textEdit.text), insertAsSnippet: textEdit.insertAsSnippet, keepWhitespace: textEdit.keepWhitespace });
  }
  validate() {
    if (typeof this._expectedModelVersionId === "undefined" || this.model.getVersionId() === this._expectedModelVersionId) {
      return { canApply: true };
    }
    return { canApply: false, reason: this.model.uri };
  }
  getBeforeCursorState() {
    return null;
  }
  apply(reason) {
    if (this._edits.length > 0) {
      this._edits = this._edits.map(this._transformSnippetStringToInsertText, this).sort((a, b) => Range2.compareRangesUsingStarts(a.range, b.range));
      this.model.pushEditOperations(null, this._edits, () => null, void 0, reason);
    }
    if (this._newEol !== void 0) {
      this.model.pushEOL(this._newEol);
    }
  }
  _transformSnippetStringToInsertText(edit3) {
    if (!edit3.insertAsSnippet) {
      return edit3;
    }
    if (!edit3.text) {
      return edit3;
    }
    const text2 = SnippetParser.asInsertText(edit3.text);
    return { ...edit3, insertAsSnippet: false, text: text2 };
  }
};

var EditorEditTask = class extends ModelEditTask {
  constructor(modelReference, editor) {
    super(modelReference);
    this._editor = editor;
  }
  getBeforeCursorState() {
    return this._canUseEditor() ? this._editor.getSelections() : null;
  }
  apply(reason) {
    if (!this._canUseEditor()) {
      super.apply();
      return;
    }
    if (this._edits.length > 0) {
      const snippetCtrl = SnippetController2.get(this._editor);
      if (snippetCtrl && this._edits.some((edit3) => edit3.insertAsSnippet)) {
        const snippetEdits = [];
        for (const edit3 of this._edits) {
          if (edit3.range && edit3.text !== null) {
            snippetEdits.push({
              range: Range2.lift(edit3.range),
              template: edit3.insertAsSnippet ? edit3.text : SnippetParser.escape(edit3.text),
              keepWhitespace: edit3.keepWhitespace
            });
          }
        }
        snippetCtrl.apply(snippetEdits, { undoStopBefore: false, undoStopAfter: false });
      } else {
        this._edits = this._edits.map(this._transformSnippetStringToInsertText, this).sort((a, b) => Range2.compareRangesUsingStarts(a.range, b.range));
        this._editor.executeEdits(reason, this._edits);
      }
    }
    if (this._newEol !== void 0) {
      if (this._editor.hasModel()) {
        this._editor.getModel().pushEOL(this._newEol);
      }
    }
  }
  _canUseEditor() {
    return this._editor?.getModel()?.uri.toString() === this.model.uri.toString();
  }
};

var BulkTextEdits = class {
  constructor(_label, _code, _editor, _undoRedoGroup, _undoRedoSource, _progress, _token, edits, _editorWorker, _modelService, _textModelResolverService, _undoRedoService) {
    this._label = _label;
    this._code = _code;
    this._editor = _editor;
    this._undoRedoGroup = _undoRedoGroup;
    this._undoRedoSource = _undoRedoSource;
    this._progress = _progress;
    this._token = _token;
    this._editorWorker = _editorWorker;
    this._modelService = _modelService;
    this._textModelResolverService = _textModelResolverService;
    this._undoRedoService = _undoRedoService;
    this._edits = new ResourceMap();
    for (const edit3 of edits) {
      let array3 = this._edits.get(edit3.resource);
      if (!array3) {
        array3 = [];
        this._edits.set(edit3.resource, array3);
      }
      array3.push(edit3);
    }
  }
  _validateBeforePrepare() {
    for (const array3 of this._edits.values()) {
      for (const edit3 of array3) {
        if (typeof edit3.versionId === "number") {
          const model = this._modelService.getModel(edit3.resource);
          if (model && model.getVersionId() !== edit3.versionId) {
            throw new Error(`${model.uri.toString()} has changed in the meantime`);
          }
        }
      }
    }
  }
  async _createEditsTasks() {
    const tasks2 = [];
    const promises = [];
    for (const [key3, edits] of this._edits) {
      const promise = this._textModelResolverService.createModelReference(key3).then(async (ref) => {
        let task;
        let makeMinimal = false;
        if (this._editor?.getModel()?.uri.toString() === ref.object.textEditorModel.uri.toString()) {
          task = new EditorEditTask(ref, this._editor);
          makeMinimal = true;
        } else {
          task = new ModelEditTask(ref);
        }
        tasks2.push(task);
        if (!makeMinimal) {
          edits.forEach(task.addEdit, task);
          return;
        }
        const makeGroupMoreMinimal = async (start2, end) => {
          const oldEdits = edits.slice(start2, end);
          const newEdits = await this._editorWorker.computeMoreMinimalEdits(ref.object.textEditorModel.uri, oldEdits.map((e) => e.textEdit), false);
          if (!newEdits) {
            oldEdits.forEach(task.addEdit, task);
          } else {
            const versionId = oldEdits[0]?.versionId;
            newEdits.forEach((edit3) => task.addEdit(new ResourceTextEdit(ref.object.textEditorModel.uri, edit3, versionId, void 0)));
          }
        };
        let start = 0;
        let i2 = 0;
        for (; i2 < edits.length; i2++) {
          if (edits[i2].textEdit.insertAsSnippet || edits[i2].metadata) {
            await makeGroupMoreMinimal(start, i2);
            task.addEdit(edits[i2]);
            start = i2 + 1;
          }
        }
        await makeGroupMoreMinimal(start, i2);
      });
      promises.push(promise);
    }
    await Promise.all(promises);
    return tasks2;
  }
  _validateTasks(tasks2) {
    for (const task of tasks2) {
      const result = task.validate();
      if (!result.canApply) {
        return result;
      }
    }
    return { canApply: true };
  }
  async apply(reason) {
    this._validateBeforePrepare();
    const tasks2 = await this._createEditsTasks();
    try {
      if (this._token.isCancellationRequested) {
        return [];
      }
      const resources = [];
      const validation = this._validateTasks(tasks2);
      if (!validation.canApply) {
        throw new Error(`${validation.reason.toString()} has changed in the meantime`);
      }
      if (tasks2.length === 1) {
        const task = tasks2[0];
        if (!task.isNoOp()) {
          const singleModelEditStackElement = new SingleModelEditStackElement(this._label, this._code, task.model, task.getBeforeCursorState());
          this._undoRedoService.pushElement(singleModelEditStackElement, this._undoRedoGroup, this._undoRedoSource);
          task.apply(reason);
          singleModelEditStackElement.close();
          resources.push(task.model.uri);
        }
        this._progress.report(void 0);
      } else {
        const multiModelEditStackElement = new MultiModelEditStackElement(
          this._label,
          this._code,
          tasks2.map((t2) => new SingleModelEditStackElement(this._label, this._code, t2.model, t2.getBeforeCursorState()))
        );
        this._undoRedoService.pushElement(multiModelEditStackElement, this._undoRedoGroup, this._undoRedoSource);
        for (const task of tasks2) {
          task.apply();
          this._progress.report(void 0);
          resources.push(task.model.uri);
        }
        multiModelEditStackElement.close();
      }
      return resources;
    } finally {
      dispose(tasks2);
    }
  }
};

BulkTextEdits = __decorateClass([
  __decorateParam(8, IEditorWorkerService),
  __decorateParam(9, IModelService),
  __decorateParam(10, ITextModelService),
  __decorateParam(11, IUndoRedoService)
], BulkTextEdits);
export { ModelEditTask, EditorEditTask, BulkTextEdits };
