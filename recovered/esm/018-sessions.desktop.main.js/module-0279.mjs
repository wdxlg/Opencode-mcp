// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/view/viewController.ts
import { CoreNavigationCommands } from "./module-0157.mjs";
import { Position } from "./module-0079.mjs";
import { Selection } from "./module-0107.mjs";
import { containsRTL } from "./module-0030.mjs";
import { isLinux } from "./module-0014.mjs";


// src/vs/editor/browser/view/viewController.ts
var ViewController = class _ViewController {
  constructor(configuration2, viewModel, userInputEvents, commandDelegate) {
    this.configuration = configuration2;
    this.viewModel = viewModel;
    this.userInputEvents = userInputEvents;
    this.commandDelegate = commandDelegate;
  }
  paste(text2, pasteOnNewLine, multicursorText, mode) {
    this.commandDelegate.paste(text2, pasteOnNewLine, multicursorText, mode);
  }
  type(text2) {
    this.commandDelegate.type(text2);
  }
  compositionType(text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
    this.commandDelegate.compositionType(text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta);
  }
  compositionStart() {
    this.commandDelegate.startComposition();
  }
  compositionEnd() {
    this.commandDelegate.endComposition();
  }
  cut() {
    this.commandDelegate.cut();
  }
  setSelection(modelSelection) {
    CoreNavigationCommands.SetSelection.runCoreEditorCommand(this.viewModel, {
      source: "keyboard",
      selection: modelSelection
    });
  }
  _validateViewColumn(viewPosition) {
    const minColumn = this.viewModel.getLineMinColumn(viewPosition.lineNumber);
    if (viewPosition.column < minColumn) {
      return new Position(viewPosition.lineNumber, minColumn);
    }
    return viewPosition;
  }
  _hasMulticursorModifier(data) {
    switch (this.configuration.options.get(86 /* multiCursorModifier */)) {
      case "altKey":
        return data.altKey;
      case "ctrlKey":
        return data.ctrlKey;
      case "metaKey":
        return data.metaKey;
      default:
        return false;
    }
  }
  _hasNonMulticursorModifier(data) {
    switch (this.configuration.options.get(86 /* multiCursorModifier */)) {
      case "altKey":
        return data.ctrlKey || data.metaKey;
      case "ctrlKey":
        return data.altKey || data.metaKey;
      case "metaKey":
        return data.ctrlKey || data.altKey;
      default:
        return false;
    }
  }
  /**
   * Selects content inside brackets if the position is right after an opening bracket or right before a closing bracket.
   * @param pos The position in the model.
   * @param model The text model.
   */
  static _trySelectBracketContent(model, pos) {
    if (pos.column > 1) {
      const pair = model.bracketPairs.matchBracket(pos.with(void 0, pos.column - 1));
      if (pair && pair[0].getEndPosition().equals(pos)) {
        return Selection.fromPositions(pair[0].getEndPosition(), pair[1].getStartPosition());
      }
    }
    if (pos.column <= model.getLineMaxColumn(pos.lineNumber)) {
      const pair = model.bracketPairs.matchBracket(pos);
      if (pair && pair[1].getStartPosition().equals(pos)) {
        return Selection.fromPositions(pair[0].getEndPosition(), pair[1].getStartPosition());
      }
    }
    return void 0;
  }
  /**
   * Selects content inside a string if the position is right after an opening quote or right before a closing quote.
   * @param pos The position in the model.
   * @param model The text model.
   */
  static _trySelectStringContent(model, pos) {
    const { lineNumber, column } = pos;
    const { tokenization: tokens } = model;
    if (!tokens.hasAccurateTokensForLine(lineNumber)) {
      if (tokens.isCheapToTokenize(lineNumber)) {
        tokens.forceTokenization(lineNumber);
      } else {
        return void 0;
      }
    }
    const lineTokens = tokens.getLineTokens(lineNumber);
    let startIndex = lineTokens.findTokenIndexAtOffset(column - 1);
    let endIndex = startIndex;
    while (startIndex > 0 && lineTokens.getStandardTokenType(startIndex - 1) === 2 /* String */) {
      startIndex--;
    }
    while (endIndex + 1 < lineTokens.getCount() && lineTokens.getStandardTokenType(endIndex + 1) === 2 /* String */) {
      endIndex++;
    }
    const tokenStart = lineTokens.getStartOffset(startIndex);
    const tokenEnd = lineTokens.getEndOffset(endIndex);
    if (column !== tokenStart + 2 && column !== tokenEnd) {
      return void 0;
    }
    const lineContent = model.getLineContent(lineNumber);
    const firstChar = lineContent.charAt(tokenStart);
    if (firstChar !== '"' && firstChar !== "'" && firstChar !== "`") {
      return void 0;
    }
    if (lineContent.charAt(tokenEnd - 1) !== firstChar) {
      return void 0;
    }
    const content = lineContent.substring(tokenStart + 1, tokenEnd - 1);
    if (containsRTL(content)) {
      return void 0;
    }
    return new Selection(lineNumber, tokenStart + 2, lineNumber, tokenEnd);
  }
  dispatchMouse(data) {
    const options3 = this.configuration.options;
    const selectionClipboardIsOn = isLinux && options3.get(121 /* selectionClipboard */);
    const columnSelection = options3.get(28 /* columnSelection */);
    const scrollOnMiddleClick = options3.get(171 /* scrollOnMiddleClick */);
    if (data.middleButton && !selectionClipboardIsOn) {
      if (scrollOnMiddleClick) {
      } else {
        this._columnSelect(data.position, data.mouseColumn, data.inSelectionMode);
      }
    } else if (data.startedOnLineNumbers) {
      if (this._hasMulticursorModifier(data)) {
        if (data.inSelectionMode) {
          this._lastCursorLineSelect(data.position, data.revealType);
        } else {
          this._createCursor(data.position, true);
        }
      } else {
        if (data.inSelectionMode) {
          this._lineSelectDrag(data.position, data.revealType);
        } else {
          this._lineSelect(data.position, data.revealType);
        }
      }
    } else if (data.mouseDownCount >= 4) {
      this._selectAll();
    } else if (data.mouseDownCount === 3) {
      if (this._hasMulticursorModifier(data)) {
        if (data.inSelectionMode) {
          this._lastCursorLineSelectDrag(data.position, data.revealType);
        } else {
          this._lastCursorLineSelect(data.position, data.revealType);
        }
      } else {
        if (data.inSelectionMode) {
          this._lineSelectDrag(data.position, data.revealType);
        } else {
          this._lineSelect(data.position, data.revealType);
        }
      }
    } else if (data.mouseDownCount === 2) {
      if (!data.onInjectedText) {
        if (this._hasMulticursorModifier(data)) {
          this._lastCursorWordSelect(data.position, data.revealType);
        } else {
          if (data.inSelectionMode) {
            this._wordSelectDrag(data.position, data.revealType);
          } else {
            let selection;
            if (options3.get(173 /* doubleClickSelectsBlock */)) {
              const model = this.viewModel.model;
              const modelPos = this._convertViewToModelPosition(data.position);
              selection = _ViewController._trySelectBracketContent(model, modelPos) || _ViewController._trySelectStringContent(model, modelPos);
            }
            if (selection) {
              this._select(selection);
            } else {
              this._wordSelect(data.position, data.revealType);
            }
          }
        }
      }
    } else {
      if (this._hasMulticursorModifier(data)) {
        if (!this._hasNonMulticursorModifier(data)) {
          if (data.shiftKey) {
            this._columnSelect(data.position, data.mouseColumn, true);
          } else {
            if (data.inSelectionMode) {
              this._lastCursorMoveToSelect(data.position, data.revealType);
            } else {
              this._createCursor(data.position, false);
            }
          }
        }
      } else {
        if (data.inSelectionMode) {
          if (data.altKey) {
            this._columnSelect(data.position, data.mouseColumn, true);
          } else {
            if (columnSelection) {
              this._columnSelect(data.position, data.mouseColumn, true);
            } else {
              this._moveToSelect(data.position, data.revealType);
            }
          }
        } else {
          this.moveTo(data.position, data.revealType);
        }
      }
    }
  }
  _usualArgs(viewPosition, revealType) {
    viewPosition = this._validateViewColumn(viewPosition);
    return {
      source: "mouse",
      position: this._convertViewToModelPosition(viewPosition),
      viewPosition,
      revealType
    };
  }
  moveTo(viewPosition, revealType) {
    CoreNavigationCommands.MoveTo.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
  }
  _moveToSelect(viewPosition, revealType) {
    CoreNavigationCommands.MoveToSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
  }
  _columnSelect(viewPosition, mouseColumn, doColumnSelect) {
    viewPosition = this._validateViewColumn(viewPosition);
    CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(this.viewModel, {
      source: "mouse",
      position: this._convertViewToModelPosition(viewPosition),
      viewPosition,
      mouseColumn,
      doColumnSelect
    });
  }
  _createCursor(viewPosition, wholeLine) {
    viewPosition = this._validateViewColumn(viewPosition);
    CoreNavigationCommands.CreateCursor.runCoreEditorCommand(this.viewModel, {
      source: "mouse",
      position: this._convertViewToModelPosition(viewPosition),
      viewPosition,
      wholeLine
    });
  }
  _lastCursorMoveToSelect(viewPosition, revealType) {
    CoreNavigationCommands.LastCursorMoveToSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
  }
  _wordSelect(viewPosition, revealType) {
    CoreNavigationCommands.WordSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
  }
  _wordSelectDrag(viewPosition, revealType) {
    CoreNavigationCommands.WordSelectDrag.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
  }
  _lastCursorWordSelect(viewPosition, revealType) {
    CoreNavigationCommands.LastCursorWordSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
  }
  _lineSelect(viewPosition, revealType) {
    CoreNavigationCommands.LineSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
  }
  _lineSelectDrag(viewPosition, revealType) {
    CoreNavigationCommands.LineSelectDrag.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
  }
  _lastCursorLineSelect(viewPosition, revealType) {
    CoreNavigationCommands.LastCursorLineSelect.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
  }
  _lastCursorLineSelectDrag(viewPosition, revealType) {
    CoreNavigationCommands.LastCursorLineSelectDrag.runCoreEditorCommand(this.viewModel, this._usualArgs(viewPosition, revealType));
  }
  _select(selection) {
    CoreNavigationCommands.SetSelection.runCoreEditorCommand(this.viewModel, { source: "mouse", selection });
  }
  _selectAll() {
    CoreNavigationCommands.SelectAll.runCoreEditorCommand(this.viewModel, { source: "mouse" });
  }
  // ----------------------
  _convertViewToModelPosition(viewPosition) {
    return this.viewModel.coordinatesConverter.convertViewPositionToModelPosition(viewPosition);
  }
  emitKeyDown(e4) {
    this.userInputEvents.emitKeyDown(e4);
  }
  emitKeyUp(e4) {
    this.userInputEvents.emitKeyUp(e4);
  }
  emitContextMenu(e4) {
    this.userInputEvents.emitContextMenu(e4);
  }
  emitMouseMove(e4) {
    this.userInputEvents.emitMouseMove(e4);
  }
  emitMouseLeave(e4) {
    this.userInputEvents.emitMouseLeave(e4);
  }
  emitMouseUp(e4) {
    this.userInputEvents.emitMouseUp(e4);
  }
  emitMouseDown(e4) {
    this.userInputEvents.emitMouseDown(e4);
  }
  emitMouseDrag(e4) {
    this.userInputEvents.emitMouseDrag(e4);
  }
  emitMouseDrop(e4) {
    this.userInputEvents.emitMouseDrop(e4);
  }
  emitMouseDropCanceled() {
    this.userInputEvents.emitMouseDropCanceled();
  }
  emitMouseWheel(e4) {
    this.userInputEvents.emitMouseWheel(e4);
  }
};
export { ViewController };
