// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/tabCompletion.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Range2 } from "./module-0106.mjs";
import { getNonWhitespacePrefix } from "./module-1358.mjs";
import { SnippetCompletion } from "./module-1357.mjs";
import { EditorState } from "./module-0539.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { showSimpleSuggestions } from "./module-0696.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISnippetsService } from "./module-1351.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { EditorCommand, registerEditorCommand, registerEditorContribution } from "./module-0097.mjs";
import { EditorContextKeys } from "./module-0154.mjs";


// src/vs/workbench/contrib/snippets/browser/tabCompletion.ts
var TabCompletionController = class {
  constructor(_editor, _snippetService, _clipboardService, _languageFeaturesService, contextKeyService) {
    this._editor = _editor;
    this._snippetService = _snippetService;
    this._clipboardService = _clipboardService;
    this._languageFeaturesService = _languageFeaturesService;
    this._activeSnippets = [];
    this._hasSnippets = TabCompletionController.ContextKey.bindTo(contextKeyService);
    this._configListener = this._editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(139 /* tabCompletion */)) {
        this._update();
      }
    });
    this._update();
  }
  static {
    this.ID = "editor.tabCompletionController";
  }
  static {
    this.ContextKey = new RawContextKey("hasSnippetCompletions", void 0);
  }
  static get(editor) {
    return editor.getContribution(TabCompletionController.ID);
  }
  dispose() {
    this._configListener.dispose();
    this._selectionListener?.dispose();
  }
  _update() {
    const enabled = this._editor.getOption(139 /* tabCompletion */) === "onlySnippets";
    if (this._enabled !== enabled) {
      this._enabled = enabled;
      if (!this._enabled) {
        this._selectionListener?.dispose();
      } else {
        this._selectionListener = this._editor.onDidChangeCursorSelection((e4) => this._updateSnippets());
        if (this._editor.getModel()) {
          this._updateSnippets();
        }
      }
    }
  }
  _updateSnippets() {
    this._activeSnippets = [];
    this._completionProvider?.dispose();
    if (!this._editor.hasModel()) {
      return;
    }
    const selection = this._editor.getSelection();
    const model = this._editor.getModel();
    model.tokenization.tokenizeIfCheap(selection.positionLineNumber);
    const id2 = model.getLanguageIdAtPosition(selection.positionLineNumber, selection.positionColumn);
    const snippets = this._snippetService.getSnippetsSync(id2, model.uri);
    if (!snippets) {
      this._hasSnippets.set(false);
      return;
    }
    if (Range2.isEmpty(selection)) {
      const prefix = getNonWhitespacePrefix(model, selection.getPosition());
      if (prefix) {
        for (const snippet of snippets) {
          if (prefix.endsWith(snippet.prefix)) {
            this._activeSnippets.push(snippet);
          }
        }
      }
    } else if (!Range2.spansMultipleLines(selection) && model.getValueLengthInRange(selection) <= 100) {
      const selected = model.getValueInRange(selection);
      if (selected) {
        for (const snippet of snippets) {
          if (selected === snippet.prefix) {
            this._activeSnippets.push(snippet);
          }
        }
      }
    }
    const len = this._activeSnippets.length;
    if (len === 0) {
      this._hasSnippets.set(false);
    } else if (len === 1) {
      this._hasSnippets.set(true);
    } else {
      this._hasSnippets.set(true);
      this._completionProvider = {
        _debugDisplayName: "tabCompletion",
        dispose: () => {
          registration.dispose();
        },
        provideCompletionItems: (_model, position2) => {
          if (_model !== model || !selection.containsPosition(position2)) {
            return;
          }
          const suggestions = this._activeSnippets.map((snippet) => {
            const range2 = Range2.fromPositions(position2.delta(0, -snippet.prefix.length), position2);
            return new SnippetCompletion(snippet, range2);
          });
          return { suggestions };
        }
      };
      const registration = this._languageFeaturesService.completionProvider.register(
        { language: model.getLanguageId(), pattern: model.uri.fsPath, scheme: model.uri.scheme },
        this._completionProvider
      );
    }
  }
  async performSnippetCompletions() {
    if (!this._editor.hasModel()) {
      return;
    }
    if (this._activeSnippets.length === 1) {
      const [snippet] = this._activeSnippets;
      let clipboardText;
      if (snippet.needsClipboard) {
        const state = new EditorState(this._editor, 1 /* Value */ | 4 /* Position */);
        clipboardText = await this._clipboardService.readText();
        if (!state.validate(this._editor)) {
          return;
        }
      }
      SnippetController2.get(this._editor)?.insert(snippet.codeSnippet, {
        overwriteBefore: snippet.prefix.length,
        overwriteAfter: 0,
        clipboardText
      });
    } else if (this._activeSnippets.length > 1) {
      if (this._completionProvider) {
        showSimpleSuggestions(this._editor, this._completionProvider);
      }
    }
  }
};

TabCompletionController = __decorateClass([
  __decorateParam(1, ISnippetsService),
  __decorateParam(2, IClipboardService),
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, IContextKeyService)
], TabCompletionController);

registerEditorContribution(TabCompletionController.ID, TabCompletionController, 0 /* Eager */);

var TabCompletionCommand = EditorCommand.bindToContribution(TabCompletionController.get);

registerEditorCommand(new TabCompletionCommand({
  id: "insertSnippet",
  precondition: TabCompletionController.ContextKey,
  handler: (x) => x.performSnippetCompletions(),
  kbOpts: {
    weight: 100 /* EditorContrib */,
    kbExpr: ContextKeyExpr.and(
      EditorContextKeys.editorTextFocus,
      EditorContextKeys.tabDoesNotMoveFocus,
      SnippetController2.InSnippetMode.toNegated()
    ),
    primary: 2 /* Tab */
  }
}));
export { TabCompletionController, TabCompletionCommand };
