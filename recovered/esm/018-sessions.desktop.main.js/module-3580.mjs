// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/promptTemplatePlaceholder.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/sessions/contrib/chat/browser/promptTemplatePlaceholder.ts
var REPLACE_PROMPT_TEMPLATE_PLACEHOLDER_COMMAND_ID = "sessions.chat.replacePromptTemplatePlaceholder";

var PromptTemplatePlaceholderFocused = new RawContextKey("sessionsPromptTemplatePlaceholderFocused", false, localize(4502, null));

var activePromptTemplatePlaceholderController;

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: REPLACE_PROMPT_TEMPLATE_PLACEHOLDER_COMMAND_ID,
  weight: 200 /* WorkbenchContrib */ + 2,
  when: PromptTemplatePlaceholderFocused,
  primary: 3 /* Enter */,
  handler: () => activePromptTemplatePlaceholderController?.replaceAtCursor()
});

var PromptTemplatePlaceholderController = class _PromptTemplatePlaceholderController extends Disposable {
  constructor(_editor, _onWillReplace) {
    super();
    this._editor = _editor;
    this._onWillReplace = _onWillReplace;
    this._wasPresent = false;
    this._decorations = this._editor.createDecorationsCollection();
    this._focusedContextKey = PromptTemplatePlaceholderFocused.bindTo(this._editor.contextKeyService);
    this._register(toDisposable(() => this._decorations.clear()));
    this._register(toDisposable(() => {
      this._focusedContextKey.reset();
      if (activePromptTemplatePlaceholderController === this) {
        activePromptTemplatePlaceholderController = void 0;
      }
    }));
    this._register(this._editor.onDidChangeModelContent(() => {
      this._updateDecorations();
      this._updateActiveState();
    }));
    this._register(this._editor.onDidChangeCursorPosition(() => this._updateActiveState()));
    this._register(this._editor.onDidFocusEditorWidget(() => this._updateActiveState()));
    this._register(this._editor.onDidBlurEditorWidget(() => this._updateActiveState()));
    this._register(this._editor.onMouseUp((event) => {
      if (!event.event.leftButton || event.target.type !== 6 /* CONTENT_TEXT */ || !this._editor.getSelection()?.isEmpty()) {
        return;
      }
      this.replaceAt(event.target.position);
    }));
  }
  static {
    this._className = "sessions-prompt-template-placeholder";
  }
  setPlaceholder(placeholder) {
    this._placeholder = placeholder;
    this._wasPresent = false;
    this._updateDecorations();
    this._updateActiveState();
  }
  replaceAtCursor() {
    const position2 = this._editor.getPosition();
    return position2 ? this.replaceAt(position2) : false;
  }
  replaceAt(position2) {
    if (!this._contains(position2)) {
      return false;
    }
    this._onWillReplace();
    const model = this._editor.getModel();
    const range2 = this._decorations.getRange(0);
    if (!model || !range2 || !this._placeholder || !this._contains(position2) || model.getValueInRange(range2) !== this._placeholder) {
      return false;
    }
    const start = range2.getStartPosition();
    this._editor.pushUndoStop();
    const edited = this._editor.executeEdits("sessions.promptTemplatePlaceholder", [{ range: range2, text: "" }], [Selection.fromPositions(start)]);
    if (edited) {
      this._editor.pushUndoStop();
      this._editor.focus();
    }
    this._updateActiveState();
    return edited;
  }
  _updateActiveState() {
    const position2 = this._editor.getPosition();
    const active = this._editor.hasTextFocus() && !!position2 && this._contains(position2);
    this._focusedContextKey.set(active);
    if (active) {
      activePromptTemplatePlaceholderController = this;
    } else if (activePromptTemplatePlaceholderController === this) {
      activePromptTemplatePlaceholderController = void 0;
    }
  }
  _contains(position2) {
    const model = this._editor.getModel();
    const range2 = this._decorations.getRange(0);
    if (!model || !range2) {
      return false;
    }
    const offset = model.getOffsetAt(position2);
    return offset >= model.getOffsetAt(range2.getStartPosition()) && offset < model.getOffsetAt(range2.getEndPosition());
  }
  _updateDecorations() {
    const model = this._editor.getModel();
    const match2 = this._placeholder && model ? model.findMatches(this._placeholder, model.getFullModelRange(), false, true, null, false, 1)[0] : void 0;
    if (!match2) {
      this._decorations.clear();
      if (this._wasPresent) {
        this._placeholder = void 0;
      }
      return;
    }
    this._wasPresent = true;
    this._decorations.set([{
      range: match2.range,
      options: {
        description: "sessions-prompt-template-placeholder",
        inlineClassName: _PromptTemplatePlaceholderController._className,
        hoverMessage: { value: localize(4501, null) }
      }
    }]);
  }
};
export { REPLACE_PROMPT_TEMPLATE_PLACEHOLDER_COMMAND_ID, PromptTemplatePlaceholderFocused, activePromptTemplatePlaceholderController, PromptTemplatePlaceholderController };
