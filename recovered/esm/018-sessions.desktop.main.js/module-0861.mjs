// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/wordOperations/browser/wordOperations.ts
import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand } from "./module-0097.mjs";
import { getMapForWordSeparators } from "./module-0122.mjs";
import { Position } from "./module-0079.mjs";
import { CursorState } from "./module-0113.mjs";
import { Selection } from "./module-0107.mjs";
import { WordOperations } from "./module-0123.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { IsWindowsContext } from "./module-0635.mjs";
import { EditorOptions } from "./module-0105.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { ReplaceCommand } from "./module-0115.mjs";
import { Range2 } from "./module-0106.mjs";
import { localize, localize2 } from "./module-0001.mjs";


// src/vs/editor/contrib/wordOperations/browser/wordOperations.ts
var MoveWordCommand = class extends EditorCommand {
  constructor(opts) {
    super(opts);
    this._inSelectionMode = opts.inSelectionMode;
    this._wordNavigationType = opts.wordNavigationType;
  }
  runEditorCommand(accessor, editor, args2) {
    if (!editor.hasModel()) {
      return;
    }
    const wordSeparators2 = getMapForWordSeparators(editor.getOption(148 /* wordSeparators */), editor.getOption(147 /* wordSegmenterLocales */));
    const model = editor.getModel();
    const selections = editor.getSelections();
    const hasMulticursor = selections.length > 1;
    const result = selections.map((sel) => {
      const inPosition = new Position(sel.positionLineNumber, sel.positionColumn);
      const outPosition = this._move(wordSeparators2, model, inPosition, this._wordNavigationType, hasMulticursor);
      return this._moveTo(sel, outPosition, this._inSelectionMode);
    });
    model.pushStackElement();
    editor._getViewModel().setCursorStates("moveWordCommand", 3 /* Explicit */, result.map((r2) => CursorState.fromModelSelection(r2)));
    if (result.length === 1) {
      const pos = new Position(result[0].positionLineNumber, result[0].positionColumn);
      editor.revealPosition(pos, 0 /* Smooth */);
    }
  }
  _moveTo(from, to, inSelectionMode) {
    if (inSelectionMode) {
      return new Selection(
        from.selectionStartLineNumber,
        from.selectionStartColumn,
        to.lineNumber,
        to.column
      );
    } else {
      return new Selection(
        to.lineNumber,
        to.column,
        to.lineNumber,
        to.column
      );
    }
  }
};

var WordLeftCommand = class extends MoveWordCommand {
  _move(wordSeparators2, model, position2, wordNavigationType, hasMulticursor) {
    return WordOperations.moveWordLeft(wordSeparators2, model, position2, wordNavigationType, hasMulticursor);
  }
};

var WordRightCommand = class extends MoveWordCommand {
  _move(wordSeparators2, model, position2, wordNavigationType, hasMulticursor) {
    return WordOperations.moveWordRight(wordSeparators2, model, position2, wordNavigationType);
  }
};

var CursorWordStartLeft = class extends WordLeftCommand {
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 0 /* WordStart */,
      id: "cursorWordStartLeft",
      precondition: void 0
    });
  }
};

var CursorWordEndLeft = class extends WordLeftCommand {
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 2 /* WordEnd */,
      id: "cursorWordEndLeft",
      precondition: void 0
    });
  }
};

var CursorWordLeft = class extends WordLeftCommand {
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 1 /* WordStartFast */,
      id: "cursorWordLeft",
      precondition: void 0,
      kbOpts: {
        kbExpr: ContextKeyExpr.and(EditorContextKeys.textInputFocus, ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, IsWindowsContext)?.negate()),
        primary: 2048 /* CtrlCmd */ | 15 /* LeftArrow */,
        mac: { primary: 512 /* Alt */ | 15 /* LeftArrow */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
};

var CursorWordStartLeftSelect = class extends WordLeftCommand {
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 0 /* WordStart */,
      id: "cursorWordStartLeftSelect",
      precondition: void 0
    });
  }
};

var CursorWordEndLeftSelect = class extends WordLeftCommand {
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 2 /* WordEnd */,
      id: "cursorWordEndLeftSelect",
      precondition: void 0
    });
  }
};

var CursorWordLeftSelect = class extends WordLeftCommand {
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 1 /* WordStartFast */,
      id: "cursorWordLeftSelect",
      precondition: void 0,
      kbOpts: {
        kbExpr: ContextKeyExpr.and(EditorContextKeys.textInputFocus, ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, IsWindowsContext)?.negate()),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 15 /* LeftArrow */,
        mac: { primary: 512 /* Alt */ | 1024 /* Shift */ | 15 /* LeftArrow */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
};

var CursorWordAccessibilityLeft = class extends WordLeftCommand {
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 3 /* WordAccessibility */,
      id: "cursorWordAccessibilityLeft",
      precondition: void 0
    });
  }
  _move(wordCharacterClassifier, model, position2, wordNavigationType, hasMulticursor) {
    return super._move(getMapForWordSeparators(EditorOptions.wordSeparators.defaultValue, wordCharacterClassifier.intlSegmenterLocales), model, position2, wordNavigationType, hasMulticursor);
  }
};

var CursorWordAccessibilityLeftSelect = class extends WordLeftCommand {
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 3 /* WordAccessibility */,
      id: "cursorWordAccessibilityLeftSelect",
      precondition: void 0
    });
  }
  _move(wordCharacterClassifier, model, position2, wordNavigationType, hasMulticursor) {
    return super._move(getMapForWordSeparators(EditorOptions.wordSeparators.defaultValue, wordCharacterClassifier.intlSegmenterLocales), model, position2, wordNavigationType, hasMulticursor);
  }
};

var CursorWordStartRight = class extends WordRightCommand {
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 0 /* WordStart */,
      id: "cursorWordStartRight",
      precondition: void 0
    });
  }
};

var CursorWordEndRight = class extends WordRightCommand {
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 2 /* WordEnd */,
      id: "cursorWordEndRight",
      precondition: void 0,
      kbOpts: {
        kbExpr: ContextKeyExpr.and(EditorContextKeys.textInputFocus, ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, IsWindowsContext)?.negate()),
        primary: 2048 /* CtrlCmd */ | 17 /* RightArrow */,
        mac: { primary: 512 /* Alt */ | 17 /* RightArrow */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
};

var CursorWordRight = class extends WordRightCommand {
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 2 /* WordEnd */,
      id: "cursorWordRight",
      precondition: void 0
    });
  }
};

var CursorWordStartRightSelect = class extends WordRightCommand {
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 0 /* WordStart */,
      id: "cursorWordStartRightSelect",
      precondition: void 0
    });
  }
};

var CursorWordEndRightSelect = class extends WordRightCommand {
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 2 /* WordEnd */,
      id: "cursorWordEndRightSelect",
      precondition: void 0,
      kbOpts: {
        kbExpr: ContextKeyExpr.and(EditorContextKeys.textInputFocus, ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, IsWindowsContext)?.negate()),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 17 /* RightArrow */,
        mac: { primary: 512 /* Alt */ | 1024 /* Shift */ | 17 /* RightArrow */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
};

var CursorWordRightSelect = class extends WordRightCommand {
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 2 /* WordEnd */,
      id: "cursorWordRightSelect",
      precondition: void 0
    });
  }
};

var CursorWordAccessibilityRight = class extends WordRightCommand {
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 3 /* WordAccessibility */,
      id: "cursorWordAccessibilityRight",
      precondition: void 0
    });
  }
  _move(wordCharacterClassifier, model, position2, wordNavigationType, hasMulticursor) {
    return super._move(getMapForWordSeparators(EditorOptions.wordSeparators.defaultValue, wordCharacterClassifier.intlSegmenterLocales), model, position2, wordNavigationType, hasMulticursor);
  }
};

var CursorWordAccessibilityRightSelect = class extends WordRightCommand {
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 3 /* WordAccessibility */,
      id: "cursorWordAccessibilityRightSelect",
      precondition: void 0
    });
  }
  _move(wordCharacterClassifier, model, position2, wordNavigationType, hasMulticursor) {
    return super._move(getMapForWordSeparators(EditorOptions.wordSeparators.defaultValue, wordCharacterClassifier.intlSegmenterLocales), model, position2, wordNavigationType, hasMulticursor);
  }
};

var DeleteWordCommand = class extends EditorCommand {
  constructor(opts) {
    super({ canTriggerInlineEdits: true, ...opts });
    this._whitespaceHeuristics = opts.whitespaceHeuristics;
    this._wordNavigationType = opts.wordNavigationType;
  }
  runEditorCommand(accessor, editor, args2) {
    const languageConfigurationService = accessor?.get(ILanguageConfigurationService);
    if (!editor.hasModel() || !languageConfigurationService) {
      return;
    }
    const wordSeparators2 = getMapForWordSeparators(editor.getOption(148 /* wordSeparators */), editor.getOption(147 /* wordSegmenterLocales */));
    const model = editor.getModel();
    const selections = editor.getSelections();
    const autoClosingBrackets = editor.getOption(10 /* autoClosingBrackets */);
    const autoClosingQuotes = editor.getOption(15 /* autoClosingQuotes */);
    const autoClosingPairs = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getAutoClosingPairs();
    const viewModel = editor._getViewModel();
    const commands = selections.map((sel) => {
      const deleteRange = this._delete({
        wordSeparators: wordSeparators2,
        model,
        selection: sel,
        whitespaceHeuristics: this._whitespaceHeuristics,
        autoClosingDelete: editor.getOption(13 /* autoClosingDelete */),
        autoClosingBrackets,
        autoClosingQuotes,
        autoClosingPairs,
        autoClosedCharacters: viewModel.getCursorAutoClosedCharacters()
      }, this._wordNavigationType);
      return new ReplaceCommand(deleteRange, "");
    });
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
};

var DeleteWordLeftCommand = class extends DeleteWordCommand {
  _delete(ctx, wordNavigationType) {
    const r2 = WordOperations.deleteWordLeft(ctx, wordNavigationType);
    if (r2) {
      return r2;
    }
    return new Range2(1, 1, 1, 1);
  }
};

var DeleteWordRightCommand = class extends DeleteWordCommand {
  _delete(ctx, wordNavigationType) {
    const r2 = WordOperations.deleteWordRight(ctx, wordNavigationType);
    if (r2) {
      return r2;
    }
    const lineCount = ctx.model.getLineCount();
    const maxColumn = ctx.model.getLineMaxColumn(lineCount);
    return new Range2(lineCount, maxColumn, lineCount, maxColumn);
  }
};

var DeleteWordStartLeft = class extends DeleteWordLeftCommand {
  constructor() {
    super({
      whitespaceHeuristics: false,
      wordNavigationType: 0 /* WordStart */,
      id: "deleteWordStartLeft",
      precondition: EditorContextKeys.writable
    });
  }
};

var DeleteWordEndLeft = class extends DeleteWordLeftCommand {
  constructor() {
    super({
      whitespaceHeuristics: false,
      wordNavigationType: 2 /* WordEnd */,
      id: "deleteWordEndLeft",
      precondition: EditorContextKeys.writable
    });
  }
};

var DeleteWordLeft = class extends DeleteWordLeftCommand {
  constructor() {
    super({
      whitespaceHeuristics: true,
      wordNavigationType: 0 /* WordStart */,
      id: "deleteWordLeft",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
        mac: { primary: 512 /* Alt */ | 1 /* Backspace */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
};

var DeleteWordStartRight = class extends DeleteWordRightCommand {
  constructor() {
    super({
      whitespaceHeuristics: false,
      wordNavigationType: 0 /* WordStart */,
      id: "deleteWordStartRight",
      precondition: EditorContextKeys.writable
    });
  }
};

var DeleteWordEndRight = class extends DeleteWordRightCommand {
  constructor() {
    super({
      whitespaceHeuristics: false,
      wordNavigationType: 2 /* WordEnd */,
      id: "deleteWordEndRight",
      precondition: EditorContextKeys.writable
    });
  }
};

var DeleteWordRight = class extends DeleteWordRightCommand {
  constructor() {
    super({
      whitespaceHeuristics: true,
      wordNavigationType: 2 /* WordEnd */,
      id: "deleteWordRight",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 /* CtrlCmd */ | 20 /* Delete */,
        mac: { primary: 512 /* Alt */ | 20 /* Delete */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
};

var DeleteInsideWord = class extends EditorAction {
  constructor() {
    super({
      id: "deleteInsideWord",
      precondition: EditorContextKeys.writable,
      label: localize2(1761, "Delete Word"),
      metadata: {
        description: localize2(1763, "Delete the word at the cursor"),
        args: [{
          name: "args",
          schema: {
            type: "object",
            properties: {
              "onlyWord": {
                type: "boolean",
                default: false,
                description: localize(1762, null)
              }
            }
          }
        }]
      }
    });
  }
  run(accessor, editor, args2) {
    if (!editor.hasModel()) {
      return;
    }
    const onlyWord = !!(args2 && typeof args2 === "object" && args2.onlyWord);
    const wordSeparators2 = getMapForWordSeparators(editor.getOption(148 /* wordSeparators */), editor.getOption(147 /* wordSegmenterLocales */));
    const model = editor.getModel();
    const selections = editor.getSelections();
    const commands = selections.map((sel) => {
      const deleteRange = WordOperations.deleteInsideWord(wordSeparators2, model, sel, onlyWord);
      return new ReplaceCommand(deleteRange, "");
    });
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
};

registerEditorCommand(new CursorWordStartLeft());

registerEditorCommand(new CursorWordEndLeft());

registerEditorCommand(new CursorWordLeft());

registerEditorCommand(new CursorWordStartLeftSelect());

registerEditorCommand(new CursorWordEndLeftSelect());

registerEditorCommand(new CursorWordLeftSelect());

registerEditorCommand(new CursorWordStartRight());

registerEditorCommand(new CursorWordEndRight());

registerEditorCommand(new CursorWordRight());

registerEditorCommand(new CursorWordStartRightSelect());

registerEditorCommand(new CursorWordEndRightSelect());

registerEditorCommand(new CursorWordRightSelect());

registerEditorCommand(new CursorWordAccessibilityLeft());

registerEditorCommand(new CursorWordAccessibilityLeftSelect());

registerEditorCommand(new CursorWordAccessibilityRight());

registerEditorCommand(new CursorWordAccessibilityRightSelect());

registerEditorCommand(new DeleteWordStartLeft());

registerEditorCommand(new DeleteWordEndLeft());

registerEditorCommand(new DeleteWordLeft());

registerEditorCommand(new DeleteWordStartRight());

registerEditorCommand(new DeleteWordEndRight());

registerEditorCommand(new DeleteWordRight());

registerEditorAction(DeleteInsideWord);
export { MoveWordCommand, WordLeftCommand, WordRightCommand, CursorWordStartLeft, CursorWordEndLeft, CursorWordLeft, CursorWordStartLeftSelect, CursorWordEndLeftSelect, CursorWordLeftSelect, CursorWordAccessibilityLeft, CursorWordAccessibilityLeftSelect, CursorWordStartRight, CursorWordEndRight, CursorWordRight, CursorWordStartRightSelect, CursorWordEndRightSelect, CursorWordRightSelect, CursorWordAccessibilityRight, CursorWordAccessibilityRightSelect, DeleteWordCommand, DeleteWordLeftCommand, DeleteWordRightCommand, DeleteWordStartLeft, DeleteWordEndLeft, DeleteWordLeft, DeleteWordStartRight, DeleteWordEndRight, DeleteWordRight, DeleteInsideWord };
