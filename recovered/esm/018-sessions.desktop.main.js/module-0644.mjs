// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoSymbol/browser/peek/referencesController.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { LayoutData, ReferenceWidget } from "./module-0643.mjs";
import { Position } from "./module-0079.mjs";
import { Range2 } from "./module-0106.mjs";
import { createCancelablePromise } from "./module-0036.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { getOuterEditor } from "./module-0621.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { KeyChord } from "./module-0019.mjs";
import { PeekContext } from "./module-0623.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { InputFocusedContext } from "./module-0635.mjs";
import { IListService, WorkbenchListFocusContextKey, WorkbenchTreeElementCanCollapse, WorkbenchTreeElementCanExpand } from "./module-0636.mjs";
import { OneReference } from "./module-0637.mjs";


// src/vs/editor/contrib/gotoSymbol/browser/peek/referencesController.ts
var ctxReferenceSearchVisible = new RawContextKey("referenceSearchVisible", false, localize(1255, null));

var ReferencesController = class {
  constructor(_defaultTreeKeyboardSupport, _editor, contextKeyService, _editorService, _notificationService, _instantiationService, _storageService, _configurationService) {
    this._defaultTreeKeyboardSupport = _defaultTreeKeyboardSupport;
    this._editor = _editor;
    this._editorService = _editorService;
    this._notificationService = _notificationService;
    this._instantiationService = _instantiationService;
    this._storageService = _storageService;
    this._configurationService = _configurationService;
    this._disposables = new DisposableStore();
    this._requestIdPool = 0;
    this._ignoreModelChangeEvent = false;
    this._referenceSearchVisible = ctxReferenceSearchVisible.bindTo(contextKeyService);
  }
  static {
    this.ID = "editor.contrib.referencesController";
  }
  static get(editor) {
    return editor.getContribution(ReferencesController.ID);
  }
  dispose() {
    this._referenceSearchVisible.reset();
    this._disposables.dispose();
    this._widget?.dispose();
    this._model?.dispose();
    this._widget = void 0;
    this._model = void 0;
  }
  toggleWidget(range2, modelPromise, peekMode) {
    let widgetPosition;
    if (this._widget) {
      widgetPosition = this._widget.position;
    }
    this.closeWidget();
    if (!!widgetPosition && range2.containsPosition(widgetPosition)) {
      return;
    }
    this._peekMode = peekMode;
    this._referenceSearchVisible.set(true);
    this._disposables.add(this._editor.onDidChangeModelLanguage(() => {
      this.closeWidget();
    }));
    this._disposables.add(this._editor.onDidChangeModel(() => {
      if (!this._ignoreModelChangeEvent) {
        this.closeWidget();
      }
    }));
    const storageKey = "peekViewLayout";
    const data = LayoutData.fromJSON(this._storageService.get(storageKey, 0 /* PROFILE */, "{}"));
    this._widget = this._instantiationService.createInstance(ReferenceWidget, this._editor, this._defaultTreeKeyboardSupport, data);
    this._widget.setTitle(localize(1253, null));
    this._widget.show(range2);
    this._disposables.add(this._widget.onDidClose(() => {
      modelPromise.cancel();
      if (this._widget) {
        this._storageService.store(storageKey, JSON.stringify(this._widget.layoutData), 0 /* PROFILE */, 1 /* MACHINE */);
        if (!this._widget.isClosing) {
          this.closeWidget();
        }
        this._widget = void 0;
      } else {
        this.closeWidget();
      }
    }));
    this._disposables.add(this._widget.onDidSelectReference((event) => {
      const { element, kind } = event;
      if (!element) {
        return;
      }
      switch (kind) {
        case "open":
          if (event.source !== "editor" || !this._configurationService.getValue("editor.stablePeek")) {
            this.openReference(element, false, false);
          }
          break;
        case "side":
          this.openReference(element, true, false);
          break;
        case "goto":
          if (peekMode) {
            this._gotoReference(element, true);
          } else {
            this.openReference(element, false, true);
          }
          break;
      }
    }));
    const requestId = ++this._requestIdPool;
    modelPromise.then((model) => {
      if (requestId !== this._requestIdPool || !this._widget) {
        model.dispose();
        return void 0;
      }
      this._model?.dispose();
      this._model = model;
      return this._widget.setModel(this._model).then(() => {
        if (this._widget && this._model && this._editor.hasModel()) {
          if (!this._model.isEmpty) {
            this._widget.setMetaTitle(localize(1254, null, this._model.title, this._model.references.length));
          } else {
            this._widget.setMetaTitle("");
          }
          const uri4 = this._editor.getModel().uri;
          const pos = new Position(range2.startLineNumber, range2.startColumn);
          const selection = this._model.nearestReference(uri4, pos);
          if (selection) {
            return this._widget.setSelection(selection).then(() => {
              if (this._widget && this._editor.getOption(99 /* peekWidgetDefaultFocus */) === "editor") {
                this._widget.focusOnPreviewEditor();
              }
            });
          }
        }
        return void 0;
      });
    }, (error) => {
      this._notificationService.error(error);
    });
  }
  changeFocusBetweenPreviewAndReferences() {
    if (!this._widget) {
      return;
    }
    if (this._widget.isPreviewEditorFocused()) {
      this._widget.focusOnReferenceTree();
    } else {
      this._widget.focusOnPreviewEditor();
    }
  }
  async goToNextOrPreviousReference(fwd) {
    if (!this._editor.hasModel() || !this._model || !this._widget) {
      return;
    }
    const currentPosition = this._widget.position;
    if (!currentPosition) {
      return;
    }
    const source = this._model.nearestReference(this._editor.getModel().uri, currentPosition);
    if (!source) {
      return;
    }
    const target = this._model.nextOrPreviousReference(source, fwd);
    const editorFocus = this._editor.hasTextFocus();
    const previewEditorFocus = this._widget.isPreviewEditorFocused();
    await this._widget.setSelection(target);
    await this._gotoReference(target, false);
    if (editorFocus) {
      this._editor.focus();
    } else if (this._widget && previewEditorFocus) {
      this._widget.focusOnPreviewEditor();
    }
  }
  async revealReference(reference) {
    if (!this._editor.hasModel() || !this._model || !this._widget) {
      return;
    }
    await this._widget.revealReference(reference);
  }
  closeWidget(focusEditor = true) {
    this._widget?.dispose();
    this._model?.dispose();
    this._referenceSearchVisible.reset();
    this._disposables.clear();
    this._widget = void 0;
    this._model = void 0;
    if (focusEditor) {
      this._editor.focus();
    }
    this._requestIdPool += 1;
  }
  _gotoReference(ref, pinned) {
    this._widget?.hide();
    this._ignoreModelChangeEvent = true;
    const range2 = Range2.lift(ref.range).collapseToStart();
    return this._editorService.openCodeEditor({
      resource: ref.uri,
      options: { selection: range2, selectionSource: "code.jump" /* JUMP */, pinned }
    }, this._editor).then((openedEditor) => {
      this._ignoreModelChangeEvent = false;
      if (!openedEditor || !this._widget) {
        this.closeWidget();
        return;
      }
      if (this._editor === openedEditor) {
        this._widget.show(range2);
        this._widget.focusOnReferenceTree();
      } else {
        const other = ReferencesController.get(openedEditor);
        const model = this._model.clone();
        this.closeWidget();
        openedEditor.focus();
        other?.toggleWidget(
          range2,
          createCancelablePromise((_) => Promise.resolve(model)),
          this._peekMode ?? false
        );
      }
    }, (err) => {
      this._ignoreModelChangeEvent = false;
      onUnexpectedError(err);
    });
  }
  openReference(ref, sideBySide, pinned) {
    if (!sideBySide) {
      this.closeWidget();
    }
    const { uri: uri4, range: range2 } = ref;
    this._editorService.openCodeEditor({
      resource: uri4,
      options: { selection: range2, selectionSource: "code.jump" /* JUMP */, pinned }
    }, this._editor, sideBySide);
  }
};

ReferencesController = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IConfigurationService)
], ReferencesController);

function withController(accessor, fn) {
  const outerEditor = getOuterEditor(accessor);
  if (!outerEditor) {
    return;
  }
  const controller = ReferencesController.get(outerEditor);
  if (controller) {
    fn(controller);
  }
}

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "togglePeekWidgetFocus",
  weight: 100 /* EditorContrib */,
  primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 60 /* F2 */),
  when: ContextKeyExpr.or(ctxReferenceSearchVisible, PeekContext.inPeekEditor),
  handler(accessor) {
    withController(accessor, (controller) => {
      controller.changeFocusBetweenPreviewAndReferences();
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "goToNextReference",
  weight: 100 /* EditorContrib */ - 10,
  primary: 62 /* F4 */,
  secondary: [70 /* F12 */],
  when: ContextKeyExpr.or(ctxReferenceSearchVisible, PeekContext.inPeekEditor),
  handler(accessor) {
    withController(accessor, (controller) => {
      controller.goToNextOrPreviousReference(true);
    });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "goToPreviousReference",
  weight: 100 /* EditorContrib */ - 10,
  primary: 1024 /* Shift */ | 62 /* F4 */,
  secondary: [1024 /* Shift */ | 70 /* F12 */],
  when: ContextKeyExpr.or(ctxReferenceSearchVisible, PeekContext.inPeekEditor),
  handler(accessor) {
    withController(accessor, (controller) => {
      controller.goToNextOrPreviousReference(false);
    });
  }
});

CommandsRegistry.registerCommandAlias("goToNextReferenceFromEmbeddedEditor", "goToNextReference");

CommandsRegistry.registerCommandAlias("goToPreviousReferenceFromEmbeddedEditor", "goToPreviousReference");

CommandsRegistry.registerCommandAlias("closeReferenceSearchEditor", "closeReferenceSearch");

CommandsRegistry.registerCommand(
  "closeReferenceSearch",
  (accessor) => withController(accessor, (controller) => controller.closeWidget())
);

KeybindingsRegistry.registerKeybindingRule({
  id: "closeReferenceSearch",
  weight: 100 /* EditorContrib */ - 101,
  primary: 9 /* Escape */,
  secondary: [1024 /* Shift */ | 9 /* Escape */],
  when: ContextKeyExpr.and(PeekContext.inPeekEditor, ContextKeyExpr.not("config.editor.stablePeek"))
});

KeybindingsRegistry.registerKeybindingRule({
  id: "closeReferenceSearch",
  weight: 200 /* WorkbenchContrib */ + 50,
  primary: 9 /* Escape */,
  secondary: [1024 /* Shift */ | 9 /* Escape */],
  when: ContextKeyExpr.and(
    ctxReferenceSearchVisible,
    ContextKeyExpr.not("config.editor.stablePeek"),
    ContextKeyExpr.or(
      EditorContextKeys.editorTextFocus,
      InputFocusedContext.negate()
    )
  )
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "revealReference",
  weight: 200 /* WorkbenchContrib */,
  primary: 3 /* Enter */,
  mac: {
    primary: 3 /* Enter */,
    secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */]
  },
  when: ContextKeyExpr.and(ctxReferenceSearchVisible, WorkbenchListFocusContextKey, WorkbenchTreeElementCanCollapse.negate(), WorkbenchTreeElementCanExpand.negate()),
  handler(accessor) {
    const listService = accessor.get(IListService);
    const focus = listService.lastFocusedList?.getFocus();
    if (Array.isArray(focus) && focus[0] instanceof OneReference) {
      withController(accessor, (controller) => controller.revealReference(focus[0]));
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "openReferenceToSide",
  weight: 100 /* EditorContrib */,
  primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
  mac: {
    primary: 256 /* WinCtrl */ | 3 /* Enter */
  },
  when: ContextKeyExpr.and(ctxReferenceSearchVisible, WorkbenchListFocusContextKey, WorkbenchTreeElementCanCollapse.negate(), WorkbenchTreeElementCanExpand.negate()),
  handler(accessor) {
    const listService = accessor.get(IListService);
    const focus = listService.lastFocusedList?.getFocus();
    if (Array.isArray(focus) && focus[0] instanceof OneReference) {
      withController(accessor, (controller) => controller.openReference(focus[0], true, true));
    }
  }
});

CommandsRegistry.registerCommand("openReference", (accessor) => {
  const listService = accessor.get(IListService);
  const focus = listService.lastFocusedList?.getFocus();
  if (Array.isArray(focus) && focus[0] instanceof OneReference) {
    withController(accessor, (controller) => controller.openReference(focus[0], false, true));
  }
});
export { withController, ctxReferenceSearchVisible, ReferencesController };
