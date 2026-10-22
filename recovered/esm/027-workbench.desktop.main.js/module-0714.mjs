// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/snippet/browser/snippetController2.ts
import { observableValue } from "./module-0048.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { SnippetSession } from "./module-0713.mjs";
import { assertType } from "./module-0010.mjs";
import { Position } from "./module-0079.mjs";
import { showSimpleSuggestions } from "./module-0696.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { EditorCommand, registerEditorCommand, registerEditorContribution } from "./module-0097.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";


// src/vs/editor/contrib/snippet/browser/snippetController2.ts
var _defaultOptions2 = {
  overwriteBefore: 0,
  overwriteAfter: 0,
  undoStopBefore: true,
  undoStopAfter: true,
  adjustWhitespace: true,
  clipboardText: void 0,
  overtypingCapturer: void 0
};

var SnippetController2 = class {
  constructor(_editor, _logService, _languageFeaturesService, contextKeyService, _languageConfigurationService) {
    this._editor = _editor;
    this._logService = _logService;
    this._languageFeaturesService = _languageFeaturesService;
    this._languageConfigurationService = _languageConfigurationService;
    this._inSnippetObservable = observableValue(this, false);
    this._snippetListener = new DisposableStore();
    this._modelVersionId = -1;
    this._inSnippet = SnippetController2.InSnippetMode.bindTo(contextKeyService);
    this._hasNextTabstop = SnippetController2.HasNextTabstop.bindTo(contextKeyService);
    this._hasPrevTabstop = SnippetController2.HasPrevTabstop.bindTo(contextKeyService);
    this._inSnippetChoice = SnippetController2.InSnippetChoice.bindTo(contextKeyService);
  }
  static {
    this.ID = "snippetController2";
  }
  static get(editor) {
    return editor.getContribution(SnippetController2.ID);
  }
  static {
    this.InSnippetMode = new RawContextKey("inSnippetMode", false, localize(1590, null));
  }
  static {
    this.HasNextTabstop = new RawContextKey("hasNextTabstop", false, localize(1587, null));
  }
  static {
    this.HasPrevTabstop = new RawContextKey("hasPrevTabstop", false, localize(1588, null));
  }
  static {
    this.InSnippetChoice = new RawContextKey("inSnippetChoice", false, localize(1589, null));
  }
  dispose() {
    this._inSnippet.reset();
    this._inSnippetObservable.set(false, void 0);
    this._hasPrevTabstop.reset();
    this._hasNextTabstop.reset();
    this._inSnippetChoice.reset();
    this._session?.dispose();
    this._snippetListener.dispose();
  }
  apply(edits, opts) {
    try {
      this._doInsert(edits, typeof opts === "undefined" ? _defaultOptions2 : { ..._defaultOptions2, ...opts });
    } catch (e) {
      this.cancel();
      this._logService.error(e);
      this._logService.error("snippet_error");
      this._logService.error("insert_edits=", edits);
      this._logService.error("existing_template=", this._session ? this._session._logInfo() : "<no_session>");
    }
  }
  insert(template2, opts) {
    try {
      this._doInsert(template2, typeof opts === "undefined" ? _defaultOptions2 : { ..._defaultOptions2, ...opts });
    } catch (e) {
      this.cancel();
      this._logService.error(e);
      this._logService.error("snippet_error");
      this._logService.error("insert_template=", template2);
      this._logService.error("existing_template=", this._session ? this._session._logInfo() : "<no_session>");
    }
  }
  _doInsert(template2, opts) {
    if (!this._editor.hasModel()) {
      return;
    }
    this._snippetListener.clear();
    if (opts.undoStopBefore) {
      this._editor.getModel().pushStackElement();
    }
    if (this._session && typeof template2 !== "string") {
      this.cancel();
    }
    if (!this._session) {
      this._modelVersionId = this._editor.getModel().getAlternativeVersionId();
      this._session = new SnippetSession(this._editor, template2, opts, this._languageConfigurationService);
      this._session.insert(opts.reason);
    } else {
      assertType(typeof template2 === "string");
      this._session.merge(template2, opts);
    }
    if (opts.undoStopAfter) {
      this._editor.getModel().pushStackElement();
    }
    if (this._session?.hasChoice) {
      const provider = {
        _debugDisplayName: "snippetChoiceCompletions",
        provideCompletionItems: (model2, position2) => {
          if (!this._session || model2 !== this._editor.getModel() || !Position.equals(this._editor.getPosition(), position2)) {
            return void 0;
          }
          const { activeChoice } = this._session;
          if (!activeChoice || activeChoice.choice.options.length === 0) {
            return void 0;
          }
          const word = model2.getValueInRange(activeChoice.range);
          const isAnyOfOptions = Boolean(activeChoice.choice.options.find((o) => o.value === word));
          const suggestions = [];
          for (let i2 = 0; i2 < activeChoice.choice.options.length; i2++) {
            const option2 = activeChoice.choice.options[i2];
            suggestions.push({
              kind: 13 /* Value */,
              label: option2.value,
              insertText: option2.value,
              sortText: "a".repeat(i2 + 1),
              range: activeChoice.range,
              filterText: isAnyOfOptions ? `${word}_${option2.value}` : void 0,
              command: { id: "jumpToNextSnippetPlaceholder", title: localize(1591, null) }
            });
          }
          return { suggestions };
        }
      };
      const model = this._editor.getModel();
      let registration;
      let isRegistered = false;
      const disable = () => {
        registration?.dispose();
        isRegistered = false;
      };
      const enable = () => {
        if (!isRegistered) {
          registration = this._languageFeaturesService.completionProvider.register({
            language: model.getLanguageId(),
            pattern: model.uri.fsPath,
            scheme: model.uri.scheme,
            exclusive: true
          }, provider);
          this._snippetListener.add(registration);
          isRegistered = true;
        }
      };
      this._choiceCompletions = { provider, enable, disable };
    }
    this._updateState();
    this._snippetListener.add(this._editor.onDidChangeModelContent((e) => e.isFlush && this.cancel()));
    this._snippetListener.add(this._editor.onDidChangeModel(() => this.cancel()));
    this._snippetListener.add(this._editor.onDidChangeCursorSelection(() => this._updateState()));
  }
  _updateState() {
    if (!this._session || !this._editor.hasModel()) {
      return;
    }
    if (this._modelVersionId === this._editor.getModel().getAlternativeVersionId()) {
      return this.cancel();
    }
    if (!this._session.hasPlaceholder) {
      return this.cancel();
    }
    if (this._session.isAtLastPlaceholder || !this._session.isSelectionWithinPlaceholders()) {
      this._editor.getModel().pushStackElement();
      return this.cancel();
    }
    this._inSnippet.set(true);
    this._inSnippetObservable.set(true, void 0);
    this._hasPrevTabstop.set(!this._session.isAtFirstPlaceholder);
    this._hasNextTabstop.set(!this._session.isAtLastPlaceholder);
    this._handleChoice();
  }
  _handleChoice() {
    if (!this._session || !this._editor.hasModel()) {
      this._currentChoice = void 0;
      this._inSnippetChoice.reset();
      return;
    }
    const { activeChoice } = this._session;
    if (!activeChoice || !this._choiceCompletions) {
      this._choiceCompletions?.disable();
      this._currentChoice = void 0;
      this._inSnippetChoice.reset();
      return;
    }
    this._inSnippetChoice.set(true);
    if (this._currentChoice !== activeChoice.choice) {
      this._currentChoice = activeChoice.choice;
      this._choiceCompletions.enable();
      queueMicrotask(() => {
        showSimpleSuggestions(this._editor, this._choiceCompletions.provider);
      });
    }
  }
  finish() {
    while (this._inSnippet.get()) {
      this.next();
    }
  }
  cancel(resetSelection = false) {
    this._inSnippet.reset();
    this._inSnippetObservable.set(false, void 0);
    this._hasPrevTabstop.reset();
    this._hasNextTabstop.reset();
    this._inSnippetChoice.reset();
    this._snippetListener.clear();
    this._currentChoice = void 0;
    this._session?.dispose();
    this._session = void 0;
    this._modelVersionId = -1;
    if (resetSelection) {
      this._editor.setSelections([this._editor.getSelection()]);
    }
  }
  prev() {
    this._session?.prev();
    this._updateState();
  }
  next() {
    this._session?.next();
    this._updateState();
  }
  isInSnippet() {
    return Boolean(this._inSnippet.get());
  }
  get isInSnippetObservable() {
    return this._inSnippetObservable;
  }
  getSessionEnclosingRange() {
    if (this._session) {
      return this._session.getEnclosingRange();
    }
    return void 0;
  }
};

SnippetController2 = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ILanguageConfigurationService)
], SnippetController2);

registerEditorContribution(SnippetController2.ID, SnippetController2, 4 /* Lazy */);

var CommandCtor = EditorCommand.bindToContribution(SnippetController2.get);

registerEditorCommand(new CommandCtor({
  id: "jumpToNextSnippetPlaceholder",
  precondition: ContextKeyExpr.and(SnippetController2.InSnippetMode, SnippetController2.HasNextTabstop),
  handler: (ctrl) => ctrl.next(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 30,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 2 /* Tab */
  }
}));

registerEditorCommand(new CommandCtor({
  id: "jumpToPrevSnippetPlaceholder",
  precondition: ContextKeyExpr.and(SnippetController2.InSnippetMode, SnippetController2.HasPrevTabstop),
  handler: (ctrl) => ctrl.prev(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 30,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 1024 /* Shift */ | 2 /* Tab */
  }
}));

KeybindingsRegistry.registerKeybindingRule({
  id: "jumpToPrevSnippetPlaceholder",
  weight: 100 /* EditorContrib */ + 91,
  when: ContextKeyExpr.and(SnippetController2.InSnippetMode, SnippetController2.HasPrevTabstop, SnippetController2.InSnippetChoice, EditorContextKeys.textInputFocus),
  primary: 1024 /* Shift */ | 2 /* Tab */
});

registerEditorCommand(new CommandCtor({
  id: "leaveSnippet",
  precondition: SnippetController2.InSnippetMode,
  handler: (ctrl) => ctrl.cancel(true),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 30,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 9 /* Escape */,
    secondary: [1024 /* Shift */ | 9 /* Escape */]
  }
}));

registerEditorCommand(new CommandCtor({
  id: "acceptSnippet",
  precondition: SnippetController2.InSnippetMode,
  handler: (ctrl) => ctrl.finish()
  // kbOpts: {
  // 	weight: KeybindingWeight.EditorContrib + 30,
  // 	kbExpr: EditorContextKeys.textFocus,
  // 	primary: KeyCode.Enter,
  // }
}));
export { _defaultOptions2, SnippetController2, CommandCtor };
