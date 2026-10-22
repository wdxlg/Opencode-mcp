// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/bracketMatching/browser/bracketMatching.ts
import { registerColor } from "./module-0226.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Disposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { Selection } from "./module-0107.mjs";
import { Range2 } from "./module-0106.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { registerThemingParticipant, themeColorFromId2 } from "./module-0287.mjs";
import { Position } from "./module-0079.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { editorBracketMatchForeground } from "./module-0288.mjs";


// src/vs/editor/contrib/bracketMatching/browser/bracketMatching.ts
var overviewRulerBracketMatchForeground = registerColor("editorOverviewRuler.bracketMatchForeground", "#A0A0A0", localize(986, null));

var JumpToBracketAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.jumpToBracket",
      label: localize2(987, "Go to Bracket"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 93 /* Backslash */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, editor) {
    BracketMatchingController.get(editor)?.jumpToBracket();
  }
};

var SelectToBracketAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.selectToBracket",
      label: localize2(989, "Select to Bracket"),
      precondition: void 0,
      metadata: {
        description: localize2(990, "Select the text inside and including the brackets or curly braces"),
        args: [{
          name: "args",
          schema: {
            type: "object",
            properties: {
              "selectBrackets": {
                type: "boolean",
                default: true
              }
            }
          }
        }]
      }
    });
  }
  run(accessor, editor, args2) {
    let selectBrackets = true;
    if (args2 && args2.selectBrackets === false) {
      selectBrackets = false;
    }
    BracketMatchingController.get(editor)?.selectToBracket(selectBrackets);
  }
};

var RemoveBracketsAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.removeBrackets",
      label: localize2(988, "Remove Brackets"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 1 /* Backspace */,
        weight: 100 /* EditorContrib */
      },
      canTriggerInlineEdits: true
    });
  }
  run(accessor, editor) {
    BracketMatchingController.get(editor)?.removeBrackets(this.id);
  }
};

var BracketsData = class {
  constructor(position2, brackets, options3) {
    this.position = position2;
    this.brackets = brackets;
    this.options = options3;
  }
};

var BracketMatchingController = class _BracketMatchingController extends Disposable {
  static {
    this.ID = "editor.contrib.bracketMatchingController";
  }
  static get(editor) {
    return editor.getContribution(_BracketMatchingController.ID);
  }
  constructor(editor) {
    super();
    this._editor = editor;
    this._lastBracketsData = [];
    this._lastVersionId = 0;
    this._decorations = this._editor.createDecorationsCollection();
    this._updateBracketsSoon = this._register(new RunOnceScheduler(() => this._updateBrackets(), 50));
    this._matchBrackets = this._editor.getOption(80 /* matchBrackets */);
    this._updateBracketsSoon.schedule();
    this._register(editor.onDidChangeCursorPosition((e) => {
      if (this._matchBrackets === "never") {
        return;
      }
      this._updateBracketsSoon.schedule();
    }));
    this._register(editor.onDidChangeModelContent((e) => {
      this._updateBracketsSoon.schedule();
    }));
    this._register(editor.onDidChangeModel((e) => {
      this._lastBracketsData = [];
      this._updateBracketsSoon.schedule();
    }));
    this._register(editor.onDidChangeModelLanguageConfiguration((e) => {
      this._lastBracketsData = [];
      this._updateBracketsSoon.schedule();
    }));
    this._register(editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(80 /* matchBrackets */)) {
        this._matchBrackets = this._editor.getOption(80 /* matchBrackets */);
        this._decorations.clear();
        this._lastBracketsData = [];
        this._lastVersionId = 0;
        this._updateBracketsSoon.schedule();
      }
    }));
    this._register(editor.onDidBlurEditorWidget(() => {
      this._updateBracketsSoon.schedule();
    }));
    this._register(editor.onDidFocusEditorWidget(() => {
      this._updateBracketsSoon.schedule();
    }));
  }
  jumpToBracket() {
    if (!this._editor.hasModel()) {
      return;
    }
    const model = this._editor.getModel();
    const newSelections = this._editor.getSelections().map((selection) => {
      const position2 = selection.getStartPosition();
      const brackets = model.bracketPairs.matchBracket(position2);
      let newCursorPosition = null;
      if (brackets) {
        if (brackets[0].containsPosition(position2) && !brackets[1].containsPosition(position2)) {
          newCursorPosition = brackets[1].getStartPosition();
        } else if (brackets[1].containsPosition(position2)) {
          newCursorPosition = brackets[0].getStartPosition();
        }
      } else {
        const enclosingBrackets = model.bracketPairs.findEnclosingBrackets(position2);
        if (enclosingBrackets) {
          newCursorPosition = enclosingBrackets[1].getStartPosition();
        } else {
          const nextBracket = model.bracketPairs.findNextBracket(position2);
          if (nextBracket && nextBracket.range) {
            newCursorPosition = nextBracket.range.getStartPosition();
          }
        }
      }
      if (newCursorPosition) {
        return new Selection(newCursorPosition.lineNumber, newCursorPosition.column, newCursorPosition.lineNumber, newCursorPosition.column);
      }
      return new Selection(position2.lineNumber, position2.column, position2.lineNumber, position2.column);
    });
    this._editor.setSelections(newSelections);
    this._editor.revealRange(newSelections[0]);
  }
  selectToBracket(selectBrackets) {
    if (!this._editor.hasModel()) {
      return;
    }
    const model = this._editor.getModel();
    const newSelections = [];
    this._editor.getSelections().forEach((selection) => {
      const position2 = selection.getStartPosition();
      let brackets = model.bracketPairs.matchBracket(position2);
      if (!brackets) {
        brackets = model.bracketPairs.findEnclosingBrackets(position2);
        if (!brackets) {
          const nextBracket = model.bracketPairs.findNextBracket(position2);
          if (nextBracket && nextBracket.range) {
            brackets = model.bracketPairs.matchBracket(nextBracket.range.getStartPosition());
          }
        }
      }
      let selectFrom = null;
      let selectTo = null;
      if (brackets) {
        brackets.sort(Range2.compareRangesUsingStarts);
        const [open2, close2] = brackets;
        selectFrom = selectBrackets ? open2.getStartPosition() : open2.getEndPosition();
        selectTo = selectBrackets ? close2.getEndPosition() : close2.getStartPosition();
        if (close2.containsPosition(position2)) {
          const tmp = selectFrom;
          selectFrom = selectTo;
          selectTo = tmp;
        }
      }
      if (selectFrom && selectTo) {
        newSelections.push(new Selection(selectFrom.lineNumber, selectFrom.column, selectTo.lineNumber, selectTo.column));
      }
    });
    if (newSelections.length > 0) {
      this._editor.setSelections(newSelections);
      this._editor.revealRange(newSelections[0]);
    }
  }
  removeBrackets(editSource) {
    if (!this._editor.hasModel()) {
      return;
    }
    const model = this._editor.getModel();
    this._editor.getSelections().forEach((selection) => {
      const position2 = selection.getPosition();
      let brackets = model.bracketPairs.matchBracket(position2);
      if (!brackets) {
        brackets = model.bracketPairs.findEnclosingBrackets(position2);
      }
      if (brackets) {
        this._editor.pushUndoStop();
        this._editor.executeEdits(
          editSource,
          [
            { range: brackets[0], text: "" },
            { range: brackets[1], text: "" }
          ]
        );
        this._editor.pushUndoStop();
      }
    });
  }
  static {
    this._DECORATION_OPTIONS_WITH_OVERVIEW_RULER = ModelDecorationOptions.register({
      description: "bracket-match-overview",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      className: "bracket-match",
      inlineClassName: "bracket-match-inline",
      overviewRuler: {
        color: themeColorFromId2(overviewRulerBracketMatchForeground),
        position: 2 /* Center */
      }
    });
  }
  static {
    this._DECORATION_OPTIONS_WITHOUT_OVERVIEW_RULER = ModelDecorationOptions.register({
      description: "bracket-match-no-overview",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      className: "bracket-match",
      inlineClassName: "bracket-match-inline"
    });
  }
  _updateBrackets() {
    if (this._matchBrackets === "never") {
      return;
    }
    this._recomputeBrackets();
    const newDecorations = [];
    let newDecorationsLen = 0;
    for (const bracketData of this._lastBracketsData) {
      const brackets = bracketData.brackets;
      if (brackets) {
        newDecorations[newDecorationsLen++] = { range: brackets[0], options: bracketData.options };
        newDecorations[newDecorationsLen++] = { range: brackets[1], options: bracketData.options };
      }
    }
    this._decorations.set(newDecorations);
  }
  _recomputeBrackets() {
    if (!this._editor.hasModel() || !this._editor.hasWidgetFocus()) {
      this._lastBracketsData = [];
      this._lastVersionId = 0;
      return;
    }
    const selections = this._editor.getSelections();
    if (selections.length > 100) {
      this._lastBracketsData = [];
      this._lastVersionId = 0;
      return;
    }
    const model = this._editor.getModel();
    const versionId = model.getVersionId();
    let previousData = [];
    if (this._lastVersionId === versionId) {
      previousData = this._lastBracketsData;
    }
    const positions = [];
    let positionsLen = 0;
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const selection = selections[i2];
      if (selection.isEmpty()) {
        positions[positionsLen++] = selection.getStartPosition();
      }
    }
    if (positions.length > 1) {
      positions.sort(Position.compare);
    }
    const newData = [];
    let newDataLen = 0;
    let previousIndex = 0;
    const previousLen = previousData.length;
    for (let i2 = 0, len = positions.length; i2 < len; i2++) {
      const position2 = positions[i2];
      while (previousIndex < previousLen && previousData[previousIndex].position.isBefore(position2)) {
        previousIndex++;
      }
      if (previousIndex < previousLen && previousData[previousIndex].position.equals(position2)) {
        newData[newDataLen++] = previousData[previousIndex];
      } else {
        let brackets = model.bracketPairs.matchBracket(
          position2,
          20
          /* give at most 20ms to compute */
        );
        let options3 = _BracketMatchingController._DECORATION_OPTIONS_WITH_OVERVIEW_RULER;
        if (!brackets && this._matchBrackets === "always") {
          brackets = model.bracketPairs.findEnclosingBrackets(
            position2,
            20
            /* give at most 20ms to compute */
          );
          options3 = _BracketMatchingController._DECORATION_OPTIONS_WITHOUT_OVERVIEW_RULER;
        }
        newData[newDataLen++] = new BracketsData(position2, brackets, options3);
      }
    }
    this._lastBracketsData = newData;
    this._lastVersionId = versionId;
  }
};

registerEditorContribution(BracketMatchingController.ID, BracketMatchingController, 1 /* AfterFirstRender */);

registerEditorAction(SelectToBracketAction);

registerEditorAction(JumpToBracketAction);

registerEditorAction(RemoveBracketsAction);

MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
  group: "5_infile_nav",
  command: {
    id: "editor.action.jumpToBracket",
    title: localize(985, null)
  },
  order: 2
});

registerThemingParticipant((theme, collector) => {
  const bracketMatchForeground = theme.getColor(editorBracketMatchForeground);
  if (bracketMatchForeground) {
    collector.addRule(`.monaco-editor .bracket-match-inline { color: ${bracketMatchForeground} !important; }`);
  }
});
export { overviewRulerBracketMatchForeground, JumpToBracketAction, SelectToBracketAction, RemoveBracketsAction, BracketsData, BracketMatchingController };
