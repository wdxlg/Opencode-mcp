// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/toggleWordWrap.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorAction, registerDiffEditorContribution, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { findDiffEditorContainingCodeEditor } from "./module-0528.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { Event2 } from "./module-0017.mjs";
import { addDisposableListener, onDidRegisterWindow } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IEditorService } from "./module-0934.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { EditorContextKeys } from "./module-0154.mjs";


// src/vs/workbench/contrib/codeEditor/browser/toggleWordWrap.ts
var transientWordWrapState = "transientWordWrapState";

var isWordWrapMinifiedKey = "isWordWrapMinified";

var isDominatedByLongLinesKey = "isDominatedByLongLines";

var CAN_TOGGLE_WORD_WRAP = new RawContextKey("canToggleWordWrap", false, true);

var EDITOR_WORD_WRAP = new RawContextKey("editorWordWrap", false, localize(13852, null));

function writeTransientState(model, state, codeEditorService) {
  codeEditorService.setTransientModelProperty(model, transientWordWrapState, state);
}

function readTransientState(model, codeEditorService) {
  return codeEditorService.getTransientModelProperty(model, transientWordWrapState);
}

var TOGGLE_WORD_WRAP_ID = "editor.action.toggleWordWrap";

var ToggleWordWrapAction = class extends EditorAction {
  constructor() {
    super({
      id: TOGGLE_WORD_WRAP_ID,
      label: localize2(13854, "View: Toggle Word Wrap"),
      precondition: void 0,
      kbOpts: {
        kbExpr: null,
        primary: 512 /* Alt */ | 56 /* KeyZ */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, editor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const instaService = accessor.get(IInstantiationService);
    if (!canToggleWordWrap(codeEditorService, editor)) {
      return;
    }
    const model = editor.getModel();
    const transientState = readTransientState(model, codeEditorService);
    let newState;
    if (transientState) {
      newState = null;
    } else {
      const actualWrappingInfo = editor.getOption(166 /* wrappingInfo */);
      const wordWrapOverride = actualWrappingInfo.wrappingColumn === -1 ? "on" : "off";
      newState = { wordWrapOverride };
    }
    writeTransientState(model, newState, codeEditorService);
    const diffEditor = instaService.invokeFunction(findDiffEditorContainingCodeEditor, editor);
    if (diffEditor) {
      const originalEditor = diffEditor.getOriginalEditor();
      const modifiedEditor = diffEditor.getModifiedEditor();
      const otherEditor = originalEditor === editor ? modifiedEditor : originalEditor;
      if (canToggleWordWrap(codeEditorService, otherEditor)) {
        writeTransientState(otherEditor.getModel(), newState, codeEditorService);
        diffEditor.updateOptions({});
      }
    }
  }
};

var ToggleWordWrapController = class extends Disposable {
  constructor(_editor, _contextKeyService, _codeEditorService) {
    super();
    this._editor = _editor;
    this._contextKeyService = _contextKeyService;
    this._codeEditorService = _codeEditorService;
    const options3 = this._editor.getOptions();
    const wrappingInfo = options3.get(166 /* wrappingInfo */);
    const isWordWrapMinified = this._contextKeyService.createKey(isWordWrapMinifiedKey, wrappingInfo.isWordWrapMinified);
    const isDominatedByLongLines = this._contextKeyService.createKey(isDominatedByLongLinesKey, wrappingInfo.isDominatedByLongLines);
    let currentlyApplyingEditorConfig = false;
    this._register(_editor.onDidChangeConfiguration((e) => {
      if (!e.hasChanged(166 /* wrappingInfo */)) {
        return;
      }
      const options4 = this._editor.getOptions();
      const wrappingInfo2 = options4.get(166 /* wrappingInfo */);
      isWordWrapMinified.set(wrappingInfo2.isWordWrapMinified);
      isDominatedByLongLines.set(wrappingInfo2.isDominatedByLongLines);
      if (!currentlyApplyingEditorConfig) {
        ensureWordWrapSettings();
      }
    }));
    this._register(_editor.onDidChangeModel((e) => {
      ensureWordWrapSettings();
    }));
    this._register(_codeEditorService.onDidChangeTransientModelProperty(() => {
      ensureWordWrapSettings();
    }));
    const ensureWordWrapSettings = () => {
      if (!canToggleWordWrap(this._codeEditorService, this._editor)) {
        return;
      }
      const transientState = readTransientState(this._editor.getModel(), this._codeEditorService);
      try {
        currentlyApplyingEditorConfig = true;
        this._applyWordWrapState(transientState);
      } finally {
        currentlyApplyingEditorConfig = false;
      }
    };
  }
  static {
    this.ID = "editor.contrib.toggleWordWrapController";
  }
  _applyWordWrapState(state) {
    const wordWrapOverride2 = state ? state.wordWrapOverride : "inherit";
    this._editor.updateOptions({
      wordWrapOverride2
    });
  }
};

ToggleWordWrapController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ICodeEditorService)
], ToggleWordWrapController);

var DiffToggleWordWrapController = class extends Disposable {
  constructor(_diffEditor, _codeEditorService) {
    super();
    this._diffEditor = _diffEditor;
    this._codeEditorService = _codeEditorService;
    this._register(this._diffEditor.onDidChangeModel(() => {
      this._ensureSyncedWordWrapToggle();
    }));
  }
  static {
    this.ID = "diffeditor.contrib.toggleWordWrapController";
  }
  _ensureSyncedWordWrapToggle() {
    const originalEditor = this._diffEditor.getOriginalEditor();
    const modifiedEditor = this._diffEditor.getModifiedEditor();
    if (!originalEditor.hasModel() || !modifiedEditor.hasModel()) {
      return;
    }
    const originalTransientState = readTransientState(originalEditor.getModel(), this._codeEditorService);
    const modifiedTransientState = readTransientState(modifiedEditor.getModel(), this._codeEditorService);
    if (originalTransientState && !modifiedTransientState && canToggleWordWrap(this._codeEditorService, originalEditor)) {
      writeTransientState(modifiedEditor.getModel(), originalTransientState, this._codeEditorService);
      this._diffEditor.updateOptions({});
    }
    if (!originalTransientState && modifiedTransientState && canToggleWordWrap(this._codeEditorService, modifiedEditor)) {
      writeTransientState(originalEditor.getModel(), modifiedTransientState, this._codeEditorService);
      this._diffEditor.updateOptions({});
    }
  }
};

DiffToggleWordWrapController = __decorateClass([
  __decorateParam(1, ICodeEditorService)
], DiffToggleWordWrapController);

function canToggleWordWrap(codeEditorService, editor) {
  if (!editor) {
    return false;
  }
  if (editor.isSimpleWidget) {
    return false;
  }
  const model = editor.getModel();
  if (!model) {
    return false;
  }
  if (editor.getOption(70 /* inDiffEditor */)) {
    for (const diffEditor of codeEditorService.listDiffEditors()) {
      if (diffEditor.getOriginalEditor() === editor && !diffEditor.renderSideBySide) {
        return false;
      }
    }
  }
  return true;
}

var EditorWordWrapContextKeyTracker = class extends Disposable {
  constructor(_editorService, _codeEditorService, _contextService) {
    super();
    this._editorService = _editorService;
    this._codeEditorService = _codeEditorService;
    this._contextService = _contextService;
    this._register(Event2.runAndSubscribe(onDidRegisterWindow, ({ window: window2, disposables }) => {
      disposables.add(addDisposableListener(window2, "focus", () => this._update(), true));
      disposables.add(addDisposableListener(window2, "blur", () => this._update(), true));
    }, { window: mainWindow, disposables: this._store }));
    this._register(this._editorService.onDidActiveEditorChange(() => this._update()));
    this._canToggleWordWrap = CAN_TOGGLE_WORD_WRAP.bindTo(this._contextService);
    this._editorWordWrap = EDITOR_WORD_WRAP.bindTo(this._contextService);
    this._activeEditor = null;
    this._activeEditorListener = this._register(new DisposableStore());
    this._update();
  }
  static {
    this.ID = "workbench.contrib.editorWordWrapContextKeyTracker";
  }
  _update() {
    const activeEditor = this._codeEditorService.getFocusedCodeEditor() || this._codeEditorService.getActiveCodeEditor();
    if (this._activeEditor === activeEditor) {
      return;
    }
    this._activeEditorListener.clear();
    this._activeEditor = activeEditor;
    if (activeEditor) {
      this._activeEditorListener.add(activeEditor.onDidChangeModel(() => this._updateFromCodeEditor()));
      this._activeEditorListener.add(activeEditor.onDidChangeConfiguration((e) => {
        if (e.hasChanged(166 /* wrappingInfo */)) {
          this._updateFromCodeEditor();
        }
      }));
      this._updateFromCodeEditor();
    }
  }
  _updateFromCodeEditor() {
    if (!canToggleWordWrap(this._codeEditorService, this._activeEditor)) {
      return this._setValues(false, false);
    } else {
      const wrappingInfo = this._activeEditor.getOption(166 /* wrappingInfo */);
      this._setValues(true, wrappingInfo.wrappingColumn !== -1);
    }
  }
  _setValues(canToggleWordWrap2, isWordWrap) {
    this._canToggleWordWrap.set(canToggleWordWrap2);
    this._editorWordWrap.set(isWordWrap);
  }
};

EditorWordWrapContextKeyTracker = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IContextKeyService)
], EditorWordWrapContextKeyTracker);

registerWorkbenchContribution2(EditorWordWrapContextKeyTracker.ID, EditorWordWrapContextKeyTracker, WorkbenchPhase.AfterRestored);

registerEditorContribution(ToggleWordWrapController.ID, ToggleWordWrapController, 0 /* Eager */);

registerDiffEditorContribution(DiffToggleWordWrapController.ID, DiffToggleWordWrapController);

registerEditorAction(ToggleWordWrapAction);

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: TOGGLE_WORD_WRAP_ID,
    title: localize(13855, null),
    icon: Codicon.wordWrap
  },
  group: "navigation",
  order: 1,
  when: ContextKeyExpr.and(
    ContextKeyExpr.has(isDominatedByLongLinesKey),
    ContextKeyExpr.has(isWordWrapMinifiedKey)
  )
});

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: TOGGLE_WORD_WRAP_ID,
    title: localize(13856, null),
    icon: Codicon.wordWrap
  },
  group: "navigation",
  order: 1,
  when: ContextKeyExpr.and(
    EditorContextKeys.inDiffEditor.negate(),
    ContextKeyExpr.has(isDominatedByLongLinesKey),
    ContextKeyExpr.not(isWordWrapMinifiedKey)
  )
});

MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
  command: {
    id: TOGGLE_WORD_WRAP_ID,
    title: localize(13853, null),
    toggled: EDITOR_WORD_WRAP,
    precondition: CAN_TOGGLE_WORD_WRAP
  },
  order: 1,
  group: "6_editor"
});
export { writeTransientState, readTransientState, canToggleWordWrap, transientWordWrapState, isWordWrapMinifiedKey, isDominatedByLongLinesKey, CAN_TOGGLE_WORD_WRAP, EDITOR_WORD_WRAP, TOGGLE_WORD_WRAP_ID, ToggleWordWrapAction, ToggleWordWrapController, DiffToggleWordWrapController, EditorWordWrapContextKeyTracker };
