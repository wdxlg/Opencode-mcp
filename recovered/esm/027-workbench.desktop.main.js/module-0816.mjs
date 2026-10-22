// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.ts
import { ModelDecorationOptions } from "./module-0423.mjs";
import { EditorState } from "./module-0539.mjs";
import { createCancelablePromise, timeout } from "./module-0036.mjs";
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";
import { InPlaceReplaceCommand } from "./module-0815.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";


// src/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.ts
var InPlaceReplaceController = class {
  static {
    this.ID = "editor.contrib.inPlaceReplaceController";
  }
  static get(editor) {
    return editor.getContribution(InPlaceReplaceController.ID);
  }
  static {
    this.DECORATION = ModelDecorationOptions.register({
      description: "in-place-replace",
      className: "valueSetReplacement"
    });
  }
  constructor(editor, editorWorkerService) {
    this.editor = editor;
    this.editorWorkerService = editorWorkerService;
    this.decorations = this.editor.createDecorationsCollection();
  }
  dispose() {
  }
  run(source, up) {
    this.currentRequest?.cancel();
    const editorSelection = this.editor.getSelection();
    const model = this.editor.getModel();
    if (!model || !editorSelection) {
      return void 0;
    }
    let selection = editorSelection;
    if (selection.startLineNumber !== selection.endLineNumber) {
      return void 0;
    }
    const state = new EditorState(this.editor, 1 /* Value */ | 4 /* Position */);
    const modelURI = model.uri;
    if (!this.editorWorkerService.canNavigateValueSet(modelURI)) {
      return Promise.resolve(void 0);
    }
    this.currentRequest = createCancelablePromise((token) => this.editorWorkerService.navigateValueSet(modelURI, selection, up));
    return this.currentRequest.then((result) => {
      if (!result || !result.range || !result.value) {
        return;
      }
      if (!state.validate(this.editor)) {
        return;
      }
      const editRange = Range2.lift(result.range);
      let highlightRange2 = result.range;
      const diff4 = result.value.length - (selection.endColumn - selection.startColumn);
      highlightRange2 = {
        startLineNumber: highlightRange2.startLineNumber,
        startColumn: highlightRange2.startColumn,
        endLineNumber: highlightRange2.endLineNumber,
        endColumn: highlightRange2.startColumn + result.value.length
      };
      if (diff4 > 1) {
        selection = new Selection(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn + diff4 - 1);
      }
      const command4 = new InPlaceReplaceCommand(editRange, selection, result.value);
      this.editor.pushUndoStop();
      this.editor.executeCommand(source, command4);
      this.editor.pushUndoStop();
      this.decorations.set([{
        range: highlightRange2,
        options: InPlaceReplaceController.DECORATION
      }]);
      this.decorationRemover?.cancel();
      this.decorationRemover = timeout(350);
      this.decorationRemover.then(() => this.decorations.clear()).catch(onUnexpectedError);
    }).catch(onUnexpectedError);
  }
};

InPlaceReplaceController = __decorateClass([
  __decorateParam(1, IEditorWorkerService)
], InPlaceReplaceController);

var InPlaceReplaceUp = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.inPlaceReplace.up",
      label: localize2(1426, "Replace with Previous Value"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 87 /* Comma */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, editor) {
    const controller = InPlaceReplaceController.get(editor);
    if (!controller) {
      return Promise.resolve(void 0);
    }
    return controller.run(this.id, false);
  }
};

var InPlaceReplaceDown = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.inPlaceReplace.down",
      label: localize2(1425, "Replace with Next Value"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 89 /* Period */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, editor) {
    const controller = InPlaceReplaceController.get(editor);
    if (!controller) {
      return Promise.resolve(void 0);
    }
    return controller.run(this.id, true);
  }
};

registerEditorContribution(InPlaceReplaceController.ID, InPlaceReplaceController, 4 /* Lazy */);

registerEditorAction(InPlaceReplaceUp);

registerEditorAction(InPlaceReplaceDown);
export { InPlaceReplaceController, InPlaceReplaceUp, InPlaceReplaceDown };
