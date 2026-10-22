// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/parameterHints/browser/parameterHints.ts
import { Disposable } from "./module-0012.mjs";
import { ParameterHintsModel } from "./module-0829.mjs";
import { Lazy } from "./module-0028.mjs";
import { ParameterHintsWidget } from "./module-0830.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand, registerEditorContribution } from "./module-0097.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Context2 } from "./module-0828.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";


// src/vs/editor/contrib/parameterHints/browser/parameterHints.ts
var ParameterHintsController = class extends Disposable {
  static {
    this.ID = "editor.controller.parameterHints";
  }
  static get(editor) {
    return editor.getContribution(ParameterHintsController.ID);
  }
  constructor(editor, instantiationService, languageFeaturesService) {
    super();
    this.editor = editor;
    this.model = this._register(new ParameterHintsModel(editor, languageFeaturesService.signatureHelpProvider));
    this._register(this.model.onChangedHints((newParameterHints) => {
      if (newParameterHints) {
        this.widget.value.show();
        this.widget.value.render(newParameterHints);
      } else {
        this.widget.rawValue?.hide();
      }
    }));
    this.widget = new Lazy(() => this._register(instantiationService.createInstance(ParameterHintsWidget, this.editor, this.model)));
  }
  cancel() {
    this.model.cancel();
  }
  previous() {
    this.widget.rawValue?.previous();
  }
  next() {
    this.widget.rawValue?.next();
  }
  trigger(context2) {
    this.model.trigger(context2, 0);
  }
};

ParameterHintsController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILanguageFeaturesService)
], ParameterHintsController);

var TriggerParameterHintsAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.triggerParameterHints",
      label: localize2(1496, "Trigger Parameter Hints"),
      precondition: EditorContextKeys.hasSignatureHelpProvider,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 10 /* Space */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, editor) {
    const controller = ParameterHintsController.get(editor);
    controller?.trigger({
      triggerKind: 1 /* Invoke */
    });
  }
};

registerEditorContribution(ParameterHintsController.ID, ParameterHintsController, 2 /* BeforeFirstInteraction */);

registerEditorAction(TriggerParameterHintsAction);

var weight3 = 100 /* EditorContrib */ + 75;

var ParameterHintsCommand = EditorCommand.bindToContribution(ParameterHintsController.get);

registerEditorCommand(new ParameterHintsCommand({
  id: "closeParameterHints",
  precondition: Context2.Visible,
  handler: (x) => x.cancel(),
  kbOpts: {
    weight: weight3,
    kbExpr: EditorContextKeys.focus,
    primary: 9 /* Escape */,
    secondary: [1024 /* Shift */ | 9 /* Escape */]
  }
}));

registerEditorCommand(new ParameterHintsCommand({
  id: "showPrevParameterHint",
  precondition: ContextKeyExpr.and(Context2.Visible, Context2.MultipleSignatures),
  handler: (x) => x.previous(),
  kbOpts: {
    weight: weight3,
    kbExpr: EditorContextKeys.focus,
    primary: 16 /* UpArrow */,
    secondary: [512 /* Alt */ | 16 /* UpArrow */],
    mac: { primary: 16 /* UpArrow */, secondary: [512 /* Alt */ | 16 /* UpArrow */, 256 /* WinCtrl */ | 46 /* KeyP */] }
  }
}));

registerEditorCommand(new ParameterHintsCommand({
  id: "showNextParameterHint",
  precondition: ContextKeyExpr.and(Context2.Visible, Context2.MultipleSignatures),
  handler: (x) => x.next(),
  kbOpts: {
    weight: weight3,
    kbExpr: EditorContextKeys.focus,
    primary: 18 /* DownArrow */,
    secondary: [512 /* Alt */ | 18 /* DownArrow */],
    mac: { primary: 18 /* DownArrow */, secondary: [512 /* Alt */ | 18 /* DownArrow */, 256 /* WinCtrl */ | 44 /* KeyN */] }
  }
}));
export { ParameterHintsController, TriggerParameterHintsAction, weight3, ParameterHintsCommand };
