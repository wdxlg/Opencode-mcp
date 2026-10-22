// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/indentation/browser/indentation.ts
import { EditorAction, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { getReindentEditOperations } from "./module-0812.mjs";
import { Range2 } from "./module-0106.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ShiftCommand } from "./module-0148.mjs";
import { getGoodIndentForLine, getIndentMetadata } from "./module-0150.mjs";
import { getLeadingWhitespace } from "./module-0030.mjs";
import { generateIndent, getSpaceCnt } from "./module-0704.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { getStandardTokenTypeAtPosition } from "./module-0145.mjs";


// src/vs/editor/contrib/indentation/browser/indentation.ts
var IndentationToSpacesAction = class _IndentationToSpacesAction extends EditorAction {
  static {
    this.ID = "editor.action.indentationToSpaces";
  }
  constructor() {
    super({
      id: _IndentationToSpacesAction.ID,
      label: localize2(1332, "Convert Indentation to Spaces"),
      precondition: EditorContextKeys.writable,
      metadata: {
        description: localize2(1333, "Convert the tab indentation to spaces.")
      }
    });
  }
  run(accessor, editor) {
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const modelOpts = model.getOptions();
    const selection = editor.getSelection();
    if (!selection) {
      return;
    }
    const command4 = new IndentationToSpacesCommand(selection, modelOpts.tabSize);
    editor.pushUndoStop();
    editor.executeCommands(this.id, [command4]);
    editor.pushUndoStop();
    model.updateOptions({
      insertSpaces: true
    });
  }
};

var IndentationToTabsAction = class _IndentationToTabsAction extends EditorAction {
  static {
    this.ID = "editor.action.indentationToTabs";
  }
  constructor() {
    super({
      id: _IndentationToTabsAction.ID,
      label: localize2(1334, "Convert Indentation to Tabs"),
      precondition: EditorContextKeys.writable,
      metadata: {
        description: localize2(1335, "Convert the spaces indentation to tabs.")
      }
    });
  }
  run(accessor, editor) {
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const modelOpts = model.getOptions();
    const selection = editor.getSelection();
    if (!selection) {
      return;
    }
    const command4 = new IndentationToTabsCommand(selection, modelOpts.tabSize);
    editor.pushUndoStop();
    editor.executeCommands(this.id, [command4]);
    editor.pushUndoStop();
    model.updateOptions({
      insertSpaces: false
    });
  }
};

var ChangeIndentationSizeAction = class extends EditorAction {
  constructor(insertSpaces, displaySizeOnly, opts) {
    super(opts);
    this.insertSpaces = insertSpaces;
    this.displaySizeOnly = displaySizeOnly;
  }
  run(accessor, editor) {
    const quickInputService = accessor.get(IQuickInputService);
    const modelService = accessor.get(IModelService);
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const creationOpts = modelService.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
    const modelOpts = model.getOptions();
    const picks = [1, 2, 3, 4, 5, 6, 7, 8].map((n2) => ({
      id: n2.toString(),
      label: n2.toString(),
      // add description for tabSize value set in the configuration
      description: n2 === creationOpts.tabSize && n2 === modelOpts.tabSize ? localize(1323, null) : n2 === creationOpts.tabSize ? localize(1325, null) : n2 === modelOpts.tabSize ? localize(1324, null) : void 0
    }));
    const autoFocusIndex = Math.min(model.getOptions().tabSize - 1, 7);
    setTimeout(
      () => {
        quickInputService.pick(picks, { placeHolder: localize(1340, null), activeItem: picks[autoFocusIndex] }).then((pick) => {
          if (pick) {
            if (model && !model.isDisposed()) {
              const pickedVal = parseInt(pick.label, 10);
              if (this.displaySizeOnly) {
                model.updateOptions({
                  tabSize: pickedVal
                });
              } else {
                model.updateOptions({
                  tabSize: pickedVal,
                  indentSize: pickedVal,
                  insertSpaces: this.insertSpaces
                });
              }
            }
          }
        });
      },
      50
      /* quick input is sensitive to being opened so soon after another */
    );
  }
};

var IndentUsingTabs = class _IndentUsingTabs extends ChangeIndentationSizeAction {
  static {
    this.ID = "editor.action.indentUsingTabs";
  }
  constructor() {
    super(false, false, {
      id: _IndentUsingTabs.ID,
      label: localize2(1338, "Indent Using Tabs"),
      precondition: void 0,
      metadata: {
        description: localize2(1339, "Use indentation with tabs.")
      }
    });
  }
};

var IndentUsingSpaces = class _IndentUsingSpaces extends ChangeIndentationSizeAction {
  static {
    this.ID = "editor.action.indentUsingSpaces";
  }
  constructor() {
    super(true, false, {
      id: _IndentUsingSpaces.ID,
      label: localize2(1336, "Indent Using Spaces"),
      precondition: void 0,
      metadata: {
        description: localize2(1337, "Use indentation with spaces.")
      }
    });
  }
};

var ChangeTabDisplaySize = class _ChangeTabDisplaySize extends ChangeIndentationSizeAction {
  static {
    this.ID = "editor.action.changeTabDisplaySize";
  }
  constructor() {
    super(true, true, {
      id: _ChangeTabDisplaySize.ID,
      label: localize2(1321, "Change Tab Display Size"),
      precondition: void 0,
      metadata: {
        description: localize2(1322, "Change the space size equivalent of the tab.")
      }
    });
  }
};

var DetectIndentation = class _DetectIndentation extends EditorAction {
  static {
    this.ID = "editor.action.detectIndentation";
  }
  constructor() {
    super({
      id: _DetectIndentation.ID,
      label: localize2(1326, "Detect Indentation from Content"),
      precondition: void 0,
      metadata: {
        description: localize2(1327, "Detect the indentation from content.")
      }
    });
  }
  run(accessor, editor) {
    const modelService = accessor.get(IModelService);
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const creationOpts = modelService.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
    model.detectIndentation(creationOpts.insertSpaces, creationOpts.tabSize);
  }
};

var ReindentLinesAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.reindentlines",
      label: localize2(1328, "Reindent Lines"),
      precondition: EditorContextKeys.writable,
      metadata: {
        description: localize2(1329, "Reindent the lines of the editor.")
      },
      canTriggerInlineEdits: true
    });
  }
  run(accessor, editor) {
    const languageConfigurationService = accessor.get(ILanguageConfigurationService);
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const edits = getReindentEditOperations(model, languageConfigurationService, 1, model.getLineCount());
    if (edits.length > 0) {
      editor.pushUndoStop();
      editor.executeEdits(this.id, edits);
      editor.pushUndoStop();
    }
  }
};

var ReindentSelectedLinesAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.reindentselectedlines",
      label: localize2(1330, "Reindent Selected Lines"),
      precondition: EditorContextKeys.writable,
      metadata: {
        description: localize2(1331, "Reindent the selected lines of the editor.")
      },
      canTriggerInlineEdits: true
    });
  }
  run(accessor, editor) {
    const languageConfigurationService = accessor.get(ILanguageConfigurationService);
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const selections = editor.getSelections();
    if (selections === null) {
      return;
    }
    const edits = [];
    for (const selection of selections) {
      let startLineNumber = selection.startLineNumber;
      let endLineNumber = selection.endLineNumber;
      if (startLineNumber !== endLineNumber && selection.endColumn === 1) {
        endLineNumber--;
      }
      if (startLineNumber === 1) {
        if (startLineNumber === endLineNumber) {
          continue;
        }
      } else {
        startLineNumber--;
      }
      const editOperations = getReindentEditOperations(model, languageConfigurationService, startLineNumber, endLineNumber);
      edits.push(...editOperations);
    }
    if (edits.length > 0) {
      editor.pushUndoStop();
      editor.executeEdits(this.id, edits);
      editor.pushUndoStop();
    }
  }
};

var AutoIndentOnPasteCommand = class {
  constructor(edits, initialSelection) {
    this._initialSelection = initialSelection;
    this._edits = [];
    this._selectionId = null;
    for (const edit3 of edits) {
      if (edit3.range && typeof edit3.text === "string") {
        this._edits.push(edit3);
      }
    }
  }
  getEditOperations(model, builder) {
    for (const edit3 of this._edits) {
      builder.addEditOperation(Range2.lift(edit3.range), edit3.text);
    }
    let selectionIsSet = false;
    if (Array.isArray(this._edits) && this._edits.length === 1 && this._initialSelection.isEmpty()) {
      if (this._edits[0].range.startColumn === this._initialSelection.endColumn && this._edits[0].range.startLineNumber === this._initialSelection.endLineNumber) {
        selectionIsSet = true;
        this._selectionId = builder.trackSelection(this._initialSelection, true);
      } else if (this._edits[0].range.endColumn === this._initialSelection.startColumn && this._edits[0].range.endLineNumber === this._initialSelection.startLineNumber) {
        selectionIsSet = true;
        this._selectionId = builder.trackSelection(this._initialSelection, false);
      }
    }
    if (!selectionIsSet) {
      this._selectionId = builder.trackSelection(this._initialSelection);
    }
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this._selectionId);
  }
};

var AutoIndentOnPaste = class {
  constructor(editor, _languageConfigurationService) {
    this.editor = editor;
    this._languageConfigurationService = _languageConfigurationService;
    this.callOnDispose = new DisposableStore();
    this.callOnModel = new DisposableStore();
    this.callOnDispose.add(editor.onDidChangeConfiguration(() => this.update()));
    this.callOnDispose.add(editor.onDidChangeModel(() => this.update()));
    this.callOnDispose.add(editor.onDidChangeModelLanguage(() => this.update()));
  }
  static {
    this.ID = "editor.contrib.autoIndentOnPaste";
  }
  update() {
    this.callOnModel.clear();
    if (!this.editor.getOption(17 /* autoIndentOnPaste */) || this.editor.getOption(16 /* autoIndent */) < 4 /* Full */) {
      return;
    }
    if (!this.editor.hasModel()) {
      return;
    }
    this.callOnModel.add(this.editor.onDidPaste(({ range: range2 }) => {
      this.trigger(range2);
    }));
  }
  trigger(range2) {
    const selections = this.editor.getSelections();
    if (selections === null || selections.length > 1) {
      return;
    }
    const model = this.editor.getModel();
    if (!model) {
      return;
    }
    const containsOnlyWhitespace = this.rangeContainsOnlyWhitespaceCharacters(model, range2);
    if (containsOnlyWhitespace) {
      return;
    }
    if (!this.editor.getOption(18 /* autoIndentOnPasteWithinString */) && isStartOrEndInString(model, range2)) {
      return;
    }
    if (!model.tokenization.isCheapToTokenize(range2.getStartPosition().lineNumber)) {
      return;
    }
    const autoIndent = this.editor.getOption(16 /* autoIndent */);
    const { tabSize, indentSize, insertSpaces } = model.getOptions();
    const textEdits = [];
    const indentConverter = {
      shiftIndent: (indentation) => {
        return ShiftCommand.shiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
      },
      unshiftIndent: (indentation) => {
        return ShiftCommand.unshiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
      }
    };
    let startLineNumber = range2.startLineNumber;
    let firstLineText = model.getLineContent(startLineNumber);
    if (!/\S/.test(firstLineText.substring(0, range2.startColumn - 1))) {
      const indentOfFirstLine = getGoodIndentForLine(autoIndent, model, model.getLanguageId(), startLineNumber, indentConverter, this._languageConfigurationService);
      if (indentOfFirstLine !== null) {
        const oldIndentation = getLeadingWhitespace(firstLineText);
        const newSpaceCnt = getSpaceCnt(indentOfFirstLine, tabSize);
        const oldSpaceCnt = getSpaceCnt(oldIndentation, tabSize);
        if (newSpaceCnt !== oldSpaceCnt) {
          const newIndent = generateIndent(newSpaceCnt, tabSize, insertSpaces);
          textEdits.push({
            range: new Range2(startLineNumber, 1, startLineNumber, oldIndentation.length + 1),
            text: newIndent
          });
          firstLineText = newIndent + firstLineText.substring(oldIndentation.length);
        } else {
          const indentMetadata = getIndentMetadata(model, startLineNumber, this._languageConfigurationService);
          if (indentMetadata === 0 || indentMetadata === 8 /* UNINDENT_MASK */) {
            return;
          }
        }
      }
    }
    const firstLineNumber = startLineNumber;
    while (startLineNumber < range2.endLineNumber) {
      if (!/\S/.test(model.getLineContent(startLineNumber + 1))) {
        startLineNumber++;
        continue;
      }
      break;
    }
    if (startLineNumber !== range2.endLineNumber) {
      const virtualModel = {
        tokenization: {
          getLineTokens: (lineNumber) => {
            return model.tokenization.getLineTokens(lineNumber);
          },
          getLanguageId: () => {
            return model.getLanguageId();
          },
          getLanguageIdAtPosition: (lineNumber, column) => {
            return model.getLanguageIdAtPosition(lineNumber, column);
          }
        },
        getLineContent: (lineNumber) => {
          if (lineNumber === firstLineNumber) {
            return firstLineText;
          } else {
            return model.getLineContent(lineNumber);
          }
        }
      };
      const indentOfSecondLine = getGoodIndentForLine(autoIndent, virtualModel, model.getLanguageId(), startLineNumber + 1, indentConverter, this._languageConfigurationService);
      if (indentOfSecondLine !== null) {
        const newSpaceCntOfSecondLine = getSpaceCnt(indentOfSecondLine, tabSize);
        const oldSpaceCntOfSecondLine = getSpaceCnt(getLeadingWhitespace(model.getLineContent(startLineNumber + 1)), tabSize);
        if (newSpaceCntOfSecondLine !== oldSpaceCntOfSecondLine) {
          const spaceCntOffset = newSpaceCntOfSecondLine - oldSpaceCntOfSecondLine;
          for (let i2 = startLineNumber + 1; i2 <= range2.endLineNumber; i2++) {
            const lineContent = model.getLineContent(i2);
            const originalIndent = getLeadingWhitespace(lineContent);
            const originalSpacesCnt = getSpaceCnt(originalIndent, tabSize);
            const newSpacesCnt = originalSpacesCnt + spaceCntOffset;
            const newIndent = generateIndent(newSpacesCnt, tabSize, insertSpaces);
            if (newIndent !== originalIndent) {
              textEdits.push({
                range: new Range2(i2, 1, i2, originalIndent.length + 1),
                text: newIndent
              });
            }
          }
        }
      }
    }
    if (textEdits.length > 0) {
      this.editor.pushUndoStop();
      const cmd = new AutoIndentOnPasteCommand(textEdits, this.editor.getSelection());
      this.editor.executeCommand("autoIndentOnPaste", cmd);
      this.editor.pushUndoStop();
    }
  }
  rangeContainsOnlyWhitespaceCharacters(model, range2) {
    const lineContainsOnlyWhitespace = (content2) => {
      return content2.trim().length === 0;
    };
    let containsOnlyWhitespace = true;
    if (range2.startLineNumber === range2.endLineNumber) {
      const lineContent = model.getLineContent(range2.startLineNumber);
      const linePart = lineContent.substring(range2.startColumn - 1, range2.endColumn - 1);
      containsOnlyWhitespace = lineContainsOnlyWhitespace(linePart);
    } else {
      for (let i2 = range2.startLineNumber; i2 <= range2.endLineNumber; i2++) {
        const lineContent = model.getLineContent(i2);
        if (i2 === range2.startLineNumber) {
          const linePart = lineContent.substring(range2.startColumn - 1);
          containsOnlyWhitespace = lineContainsOnlyWhitespace(linePart);
        } else if (i2 === range2.endLineNumber) {
          const linePart = lineContent.substring(0, range2.endColumn - 1);
          containsOnlyWhitespace = lineContainsOnlyWhitespace(linePart);
        } else {
          containsOnlyWhitespace = model.getLineFirstNonWhitespaceColumn(i2) === 0;
        }
        if (!containsOnlyWhitespace) {
          break;
        }
      }
    }
    return containsOnlyWhitespace;
  }
  dispose() {
    this.callOnDispose.dispose();
    this.callOnModel.dispose();
  }
};

AutoIndentOnPaste = __decorateClass([
  __decorateParam(1, ILanguageConfigurationService)
], AutoIndentOnPaste);

function isStartOrEndInString(model, range2) {
  const isPositionInString = (position2) => {
    const tokenType = getStandardTokenTypeAtPosition(model, position2);
    return tokenType === 2 /* String */;
  };
  return isPositionInString(range2.getStartPosition()) || isPositionInString(range2.getEndPosition());
}

function getIndentationEditOperations(model, builder, tabSize, tabsToSpaces) {
  if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
    return;
  }
  let spaces2 = "";
  for (let i2 = 0; i2 < tabSize; i2++) {
    spaces2 += " ";
  }
  const spacesRegExp = new RegExp(spaces2, "gi");
  for (let lineNumber = 1, lineCount = model.getLineCount(); lineNumber <= lineCount; lineNumber++) {
    let lastIndentationColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
    if (lastIndentationColumn === 0) {
      lastIndentationColumn = model.getLineMaxColumn(lineNumber);
    }
    if (lastIndentationColumn === 1) {
      continue;
    }
    const originalIndentationRange = new Range2(lineNumber, 1, lineNumber, lastIndentationColumn);
    const originalIndentation = model.getValueInRange(originalIndentationRange);
    const newIndentation = tabsToSpaces ? originalIndentation.replace(/\t/ig, spaces2) : originalIndentation.replace(spacesRegExp, "	");
    builder.addEditOperation(originalIndentationRange, newIndentation);
  }
}

var IndentationToSpacesCommand = class {
  constructor(selection, tabSize) {
    this.selection = selection;
    this.tabSize = tabSize;
    this.selectionId = null;
  }
  getEditOperations(model, builder) {
    this.selectionId = builder.trackSelection(this.selection);
    getIndentationEditOperations(model, builder, this.tabSize, true);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this.selectionId);
  }
};

var IndentationToTabsCommand = class {
  constructor(selection, tabSize) {
    this.selection = selection;
    this.tabSize = tabSize;
    this.selectionId = null;
  }
  getEditOperations(model, builder) {
    this.selectionId = builder.trackSelection(this.selection);
    getIndentationEditOperations(model, builder, this.tabSize, false);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this.selectionId);
  }
};

registerEditorContribution(AutoIndentOnPaste.ID, AutoIndentOnPaste, 2 /* BeforeFirstInteraction */);

registerEditorAction(IndentationToSpacesAction);

registerEditorAction(IndentationToTabsAction);

registerEditorAction(IndentUsingTabs);

registerEditorAction(IndentUsingSpaces);

registerEditorAction(ChangeTabDisplaySize);

registerEditorAction(DetectIndentation);

registerEditorAction(ReindentLinesAction);

registerEditorAction(ReindentSelectedLinesAction);
export { isStartOrEndInString, getIndentationEditOperations, IndentationToSpacesAction, IndentationToTabsAction, ChangeIndentationSizeAction, IndentUsingTabs, IndentUsingSpaces, ChangeTabDisplaySize, DetectIndentation, ReindentLinesAction, ReindentSelectedLinesAction, AutoIndentOnPasteCommand, AutoIndentOnPaste, IndentationToSpacesCommand, IndentationToTabsCommand };
