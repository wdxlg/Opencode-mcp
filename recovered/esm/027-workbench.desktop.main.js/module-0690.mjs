// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/format/browser/formatActions.ts
import { DisposableStore } from "./module-0012.mjs";
import { CharacterSet } from "./module-0121.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { formatDocumentRangesWithSelectedProvider, formatDocumentWithSelectedProvider, getOnTypeFormattingEdits } from "./module-0689.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { FormattingEdit } from "./module-0686.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { IEditorProgressService, Progress } from "./module-0446.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { KeyChord } from "./module-0019.mjs";
import { Range2 } from "./module-0106.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { ICodeEditorService } from "./module-0078.mjs";


// src/vs/editor/contrib/format/browser/formatActions.ts
var FormatOnType = class {
  constructor(_editor, _languageFeaturesService, _workerService, _accessibilitySignalService) {
    this._editor = _editor;
    this._languageFeaturesService = _languageFeaturesService;
    this._workerService = _workerService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._disposables = new DisposableStore();
    this._sessionDisposables = new DisposableStore();
    this._disposables.add(_languageFeaturesService.onTypeFormattingEditProvider.onDidChange(this._update, this));
    this._disposables.add(_editor.onDidChangeModel(() => this._update()));
    this._disposables.add(_editor.onDidChangeModelLanguage(() => this._update()));
    this._disposables.add(_editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(65 /* formatOnType */)) {
        this._update();
      }
    }));
    this._update();
  }
  static {
    this.ID = "editor.contrib.autoFormat";
  }
  dispose() {
    this._disposables.dispose();
    this._sessionDisposables.dispose();
  }
  _update() {
    this._sessionDisposables.clear();
    if (!this._editor.getOption(65 /* formatOnType */)) {
      return;
    }
    if (!this._editor.hasModel()) {
      return;
    }
    const model = this._editor.getModel();
    const [support] = this._languageFeaturesService.onTypeFormattingEditProvider.ordered(model);
    if (!support || !support.autoFormatTriggerCharacters) {
      return;
    }
    const triggerChars = new CharacterSet();
    for (const ch of support.autoFormatTriggerCharacters) {
      triggerChars.add(ch.charCodeAt(0));
    }
    this._sessionDisposables.add(this._editor.onDidType((text2) => {
      const lastCharCode = text2.charCodeAt(text2.length - 1);
      if (triggerChars.has(lastCharCode)) {
        this._trigger(String.fromCharCode(lastCharCode));
      }
    }));
  }
  _trigger(ch) {
    if (!this._editor.hasModel()) {
      return;
    }
    if (this._editor.getSelections().length > 1 || !this._editor.getSelection().isEmpty()) {
      return;
    }
    const model = this._editor.getModel();
    const position2 = this._editor.getPosition();
    const cts = new CancellationTokenSource();
    const unbind = this._editor.onDidChangeModelContent((e) => {
      if (e.isFlush) {
        cts.cancel();
        unbind.dispose();
        return;
      }
      for (let i2 = 0, len = e.changes.length; i2 < len; i2++) {
        const change = e.changes[i2];
        if (change.range.endLineNumber <= position2.lineNumber) {
          cts.cancel();
          unbind.dispose();
          return;
        }
      }
    });
    getOnTypeFormattingEdits(
      this._workerService,
      this._languageFeaturesService,
      model,
      position2,
      ch,
      model.getFormattingOptions(),
      cts.token
    ).then((edits) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      if (isNonEmptyArray(edits)) {
        this._accessibilitySignalService.playSignal(AccessibilitySignal.format, { userGesture: false });
        FormattingEdit.execute(this._editor, edits, true);
      }
    }).finally(() => {
      unbind.dispose();
    });
  }
};

FormatOnType = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, IEditorWorkerService),
  __decorateParam(3, IAccessibilitySignalService)
], FormatOnType);

var FormatOnPaste = class {
  constructor(editor, _languageFeaturesService, _instantiationService) {
    this.editor = editor;
    this._languageFeaturesService = _languageFeaturesService;
    this._instantiationService = _instantiationService;
    this._callOnDispose = new DisposableStore();
    this._callOnModel = new DisposableStore();
    this._callOnDispose.add(editor.onDidChangeConfiguration(() => this._update()));
    this._callOnDispose.add(editor.onDidChangeModel(() => this._update()));
    this._callOnDispose.add(editor.onDidChangeModelLanguage(() => this._update()));
    this._callOnDispose.add(_languageFeaturesService.documentRangeFormattingEditProvider.onDidChange(this._update, this));
  }
  static {
    this.ID = "editor.contrib.formatOnPaste";
  }
  dispose() {
    this._callOnDispose.dispose();
    this._callOnModel.dispose();
  }
  _update() {
    this._callOnModel.clear();
    if (!this.editor.getOption(64 /* formatOnPaste */)) {
      return;
    }
    if (!this.editor.hasModel()) {
      return;
    }
    if (!this._languageFeaturesService.documentRangeFormattingEditProvider.has(this.editor.getModel())) {
      return;
    }
    this._callOnModel.add(this.editor.onDidPaste(({ range: range2 }) => this._trigger(range2)));
  }
  _trigger(range2) {
    if (!this.editor.hasModel()) {
      return;
    }
    if (this.editor.getSelections().length > 1) {
      return;
    }
    this._instantiationService.invokeFunction(formatDocumentRangesWithSelectedProvider, this.editor, range2, 2 /* Silent */, Progress.None, CancellationToken.None, false).catch(onUnexpectedError);
  }
};

FormatOnPaste = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, IInstantiationService)
], FormatOnPaste);

var FormatDocumentAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.formatDocument",
      label: localize2(1193, "Format Document"),
      precondition: ContextKeyExpr.and(EditorContextKeys.notInCompositeEditor, EditorContextKeys.writable, EditorContextKeys.hasDocumentFormattingProvider),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 1024 /* Shift */ | 512 /* Alt */ | 36 /* KeyF */,
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 39 /* KeyI */ },
        weight: 100 /* EditorContrib */
      },
      contextMenuOpts: {
        group: "1_modification",
        order: 1.3
      }
    });
  }
  async run(accessor, editor) {
    if (editor.hasModel()) {
      const instaService = accessor.get(IInstantiationService);
      const progressService = accessor.get(IEditorProgressService);
      await progressService.showWhile(
        instaService.invokeFunction(formatDocumentWithSelectedProvider, editor, 1 /* Explicit */, Progress.None, CancellationToken.None, true),
        250
      );
    }
  }
};

var FormatSelectionAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.formatSelection",
      label: localize2(1194, "Format Selection"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasDocumentSelectionFormattingProvider),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 36 /* KeyF */),
        weight: 100 /* EditorContrib */
      },
      contextMenuOpts: {
        when: EditorContextKeys.hasNonEmptySelection,
        group: "1_modification",
        order: 1.31
      }
    });
  }
  async run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const instaService = accessor.get(IInstantiationService);
    const model = editor.getModel();
    const ranges = editor.getSelections().map((range2) => {
      return range2.isEmpty() ? new Range2(range2.startLineNumber, 1, range2.startLineNumber, model.getLineMaxColumn(range2.startLineNumber)) : range2;
    });
    const progressService = accessor.get(IEditorProgressService);
    await progressService.showWhile(
      instaService.invokeFunction(formatDocumentRangesWithSelectedProvider, editor, ranges, 1 /* Explicit */, Progress.None, CancellationToken.None, true),
      250
    );
  }
};

registerEditorContribution(FormatOnType.ID, FormatOnType, 2 /* BeforeFirstInteraction */);

registerEditorContribution(FormatOnPaste.ID, FormatOnPaste, 2 /* BeforeFirstInteraction */);

registerEditorAction(FormatDocumentAction);

registerEditorAction(FormatSelectionAction);

CommandsRegistry.registerCommand("editor.action.format", async (accessor) => {
  const editor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
  if (!editor || !editor.hasModel()) {
    return;
  }
  const commandService = accessor.get(ICommandService);
  if (editor.getSelection().isEmpty()) {
    await commandService.executeCommand("editor.action.formatDocument");
  } else {
    await commandService.executeCommand("editor.action.formatSelection");
  }
});
export { FormatOnType, FormatOnPaste, FormatDocumentAction, FormatSelectionAction };
