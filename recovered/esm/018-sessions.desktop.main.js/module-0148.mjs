// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/commands/shiftCommand.ts
import { CursorColumns } from "./module-0110.mjs";
import { firstNonWhitespaceIndex } from "./module-0030.mjs";
import { getEnterAction } from "./module-0147.mjs";
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";


// src/vs/editor/common/commands/shiftCommand.ts
var repeatCache = /* @__PURE__ */ Object.create(null);

function cachedStringRepeat(str, count2) {
  if (count2 <= 0) {
    return "";
  }
  if (!repeatCache[str]) {
    repeatCache[str] = ["", str];
  }
  const cache2 = repeatCache[str];
  for (let i2 = cache2.length; i2 <= count2; i2++) {
    cache2[i2] = cache2[i2 - 1] + str;
  }
  return cache2[count2];
}

var ShiftCommand = class {
  constructor(range2, opts, _languageConfigurationService) {
    this._languageConfigurationService = _languageConfigurationService;
    this._opts = opts;
    this._selection = range2;
    this._selectionId = null;
    this._useLastEditRangeForCursorEndPosition = false;
    this._selectionStartColumnStaysPut = false;
  }
  static unshiftIndent(line, column, tabSize, indentSize, insertSpaces) {
    const contentStartVisibleColumn = CursorColumns.visibleColumnFromColumn(line, column, tabSize);
    if (insertSpaces) {
      const indent = cachedStringRepeat(" ", indentSize);
      const desiredTabStop = CursorColumns.prevIndentTabStop(contentStartVisibleColumn, indentSize);
      const indentCount = desiredTabStop / indentSize;
      return cachedStringRepeat(indent, indentCount);
    } else {
      const indent = "	";
      const desiredTabStop = CursorColumns.prevRenderTabStop(contentStartVisibleColumn, tabSize);
      const indentCount = desiredTabStop / tabSize;
      return cachedStringRepeat(indent, indentCount);
    }
  }
  static shiftIndent(line, column, tabSize, indentSize, insertSpaces) {
    const contentStartVisibleColumn = CursorColumns.visibleColumnFromColumn(line, column, tabSize);
    if (insertSpaces) {
      const indent = cachedStringRepeat(" ", indentSize);
      const desiredTabStop = CursorColumns.nextIndentTabStop(contentStartVisibleColumn, indentSize);
      const indentCount = desiredTabStop / indentSize;
      return cachedStringRepeat(indent, indentCount);
    } else {
      const indent = "	";
      const desiredTabStop = CursorColumns.nextRenderTabStop(contentStartVisibleColumn, tabSize);
      const indentCount = desiredTabStop / tabSize;
      return cachedStringRepeat(indent, indentCount);
    }
  }
  _addEditOperation(builder, range2, text2) {
    if (this._useLastEditRangeForCursorEndPosition) {
      builder.addTrackedEditOperation(range2, text2);
    } else {
      builder.addEditOperation(range2, text2);
    }
  }
  getEditOperations(model, builder) {
    const startLine = this._selection.startLineNumber;
    let endLine = this._selection.endLineNumber;
    if (this._selection.endColumn === 1 && startLine !== endLine) {
      endLine = endLine - 1;
    }
    const { tabSize, indentSize, insertSpaces } = this._opts;
    const shouldIndentEmptyLines = startLine === endLine;
    if (this._opts.useTabStops) {
      if (this._selection.isEmpty()) {
        if (/^\s*$/.test(model.getLineContent(startLine))) {
          this._useLastEditRangeForCursorEndPosition = true;
        }
      }
      let previousLineExtraSpaces = 0, extraSpaces = 0;
      for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++, previousLineExtraSpaces = extraSpaces) {
        extraSpaces = 0;
        const lineText = model.getLineContent(lineNumber);
        let indentationEndIndex = firstNonWhitespaceIndex(lineText);
        if (this._opts.isUnshift && (lineText.length === 0 || indentationEndIndex === 0)) {
          continue;
        }
        if (!shouldIndentEmptyLines && !this._opts.isUnshift && lineText.length === 0) {
          continue;
        }
        if (indentationEndIndex === -1) {
          indentationEndIndex = lineText.length;
        }
        if (lineNumber > 1) {
          const contentStartVisibleColumn = CursorColumns.visibleColumnFromColumn(lineText, indentationEndIndex + 1, tabSize);
          if (contentStartVisibleColumn % indentSize !== 0) {
            if (model.tokenization.isCheapToTokenize(lineNumber - 1)) {
              const enterAction = getEnterAction(this._opts.autoIndent, model, new Range2(lineNumber - 1, model.getLineMaxColumn(lineNumber - 1), lineNumber - 1, model.getLineMaxColumn(lineNumber - 1)), this._languageConfigurationService);
              if (enterAction) {
                extraSpaces = previousLineExtraSpaces;
                if (enterAction.appendText) {
                  for (let j = 0, lenJ = enterAction.appendText.length; j < lenJ && extraSpaces < indentSize; j++) {
                    if (enterAction.appendText.charCodeAt(j) === 32 /* Space */) {
                      extraSpaces++;
                    } else {
                      break;
                    }
                  }
                }
                if (enterAction.removeText) {
                  extraSpaces = Math.max(0, extraSpaces - enterAction.removeText);
                }
                for (let j = 0; j < extraSpaces; j++) {
                  if (indentationEndIndex === 0 || lineText.charCodeAt(indentationEndIndex - 1) !== 32 /* Space */) {
                    break;
                  }
                  indentationEndIndex--;
                }
              }
            }
          }
        }
        if (this._opts.isUnshift && indentationEndIndex === 0) {
          continue;
        }
        let desiredIndent;
        if (this._opts.isUnshift) {
          desiredIndent = ShiftCommand.unshiftIndent(lineText, indentationEndIndex + 1, tabSize, indentSize, insertSpaces);
        } else {
          desiredIndent = ShiftCommand.shiftIndent(lineText, indentationEndIndex + 1, tabSize, indentSize, insertSpaces);
        }
        this._addEditOperation(builder, new Range2(lineNumber, 1, lineNumber, indentationEndIndex + 1), desiredIndent);
        if (lineNumber === startLine && !this._selection.isEmpty()) {
          this._selectionStartColumnStaysPut = this._selection.startColumn <= indentationEndIndex + 1;
        }
      }
    } else {
      if (!this._opts.isUnshift && this._selection.isEmpty() && model.getLineLength(startLine) === 0) {
        this._useLastEditRangeForCursorEndPosition = true;
      }
      const oneIndent = insertSpaces ? cachedStringRepeat(" ", indentSize) : "	";
      for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
        const lineText = model.getLineContent(lineNumber);
        let indentationEndIndex = firstNonWhitespaceIndex(lineText);
        if (this._opts.isUnshift && (lineText.length === 0 || indentationEndIndex === 0)) {
          continue;
        }
        if (!shouldIndentEmptyLines && !this._opts.isUnshift && lineText.length === 0) {
          continue;
        }
        if (indentationEndIndex === -1) {
          indentationEndIndex = lineText.length;
        }
        if (this._opts.isUnshift && indentationEndIndex === 0) {
          continue;
        }
        if (this._opts.isUnshift) {
          indentationEndIndex = Math.min(indentationEndIndex, indentSize);
          for (let i2 = 0; i2 < indentationEndIndex; i2++) {
            const chr = lineText.charCodeAt(i2);
            if (chr === 9 /* Tab */) {
              indentationEndIndex = i2 + 1;
              break;
            }
          }
          this._addEditOperation(builder, new Range2(lineNumber, 1, lineNumber, indentationEndIndex + 1), "");
        } else {
          this._addEditOperation(builder, new Range2(lineNumber, 1, lineNumber, 1), oneIndent);
          if (lineNumber === startLine && !this._selection.isEmpty()) {
            this._selectionStartColumnStaysPut = this._selection.startColumn === 1;
          }
        }
      }
    }
    this._selectionId = builder.trackSelection(this._selection);
  }
  computeCursorState(model, helper) {
    if (this._useLastEditRangeForCursorEndPosition) {
      const lastOp = helper.getInverseEditOperations()[0];
      return new Selection(lastOp.range.endLineNumber, lastOp.range.endColumn, lastOp.range.endLineNumber, lastOp.range.endColumn);
    }
    const result = helper.getTrackedSelection(this._selectionId);
    if (this._selectionStartColumnStaysPut) {
      const initialStartColumn = this._selection.startColumn;
      const resultStartColumn = result.startColumn;
      if (resultStartColumn <= initialStartColumn) {
        return result;
      }
      if (result.getDirection() === 0 /* LTR */) {
        return new Selection(result.startLineNumber, initialStartColumn, result.endLineNumber, result.endColumn);
      }
      return new Selection(result.endLineNumber, result.endColumn, result.startLineNumber, initialStartColumn);
    }
    return result;
  }
};

ShiftCommand = __decorateClass([
  __decorateParam(2, ILanguageConfigurationService)
], ShiftCommand);
export { cachedStringRepeat, repeatCache, ShiftCommand };
