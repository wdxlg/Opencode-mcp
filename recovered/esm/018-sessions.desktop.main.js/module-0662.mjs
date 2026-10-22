// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/comment/browser/lineCommentCommand.ts
import { firstNonWhitespaceIndex } from "./module-0030.mjs";
import { BlockCommentCommand } from "./module-0661.mjs";
import { Position } from "./module-0079.mjs";
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";
import { EditOperation } from "./module-0162.mjs";


// src/vs/editor/contrib/comment/browser/lineCommentCommand.ts
var LineCommentCommand = class _LineCommentCommand {
  constructor(languageConfigurationService, selection, indentSize, type, insertSpace, ignoreEmptyLines, ignoreFirstLine) {
    this.languageConfigurationService = languageConfigurationService;
    this._selection = selection;
    this._indentSize = indentSize;
    this._type = type;
    this._insertSpace = insertSpace;
    this._selectionId = null;
    this._deltaColumn = 0;
    this._moveEndPositionDown = false;
    this._ignoreEmptyLines = ignoreEmptyLines;
    this._ignoreFirstLine = ignoreFirstLine || false;
  }
  /**
   * Do an initial pass over the lines and gather info about the line comment string.
   * Returns null if any of the lines doesn't support a line comment string.
   */
  static _gatherPreflightCommentStrings(model, startLineNumber, endLineNumber, languageConfigurationService) {
    model.tokenization.tokenizeIfCheap(startLineNumber);
    const languageId = model.getLanguageIdAtPosition(startLineNumber, 1);
    const config = languageConfigurationService.getLanguageConfiguration(languageId).comments;
    const commentStr = config ? config.lineCommentToken : null;
    if (!commentStr) {
      return null;
    }
    const lines = [];
    for (let i2 = 0, lineCount = endLineNumber - startLineNumber + 1; i2 < lineCount; i2++) {
      lines[i2] = {
        ignore: false,
        commentStr,
        commentStrOffset: 0,
        commentStrLength: commentStr.length
      };
    }
    return lines;
  }
  /**
   * Analyze lines and decide which lines are relevant and what the toggle should do.
   * Also, build up several offsets and lengths useful in the generation of editor operations.
   */
  static _analyzeLines(type, insertSpace, model, lines, startLineNumber, ignoreEmptyLines, ignoreFirstLine, languageConfigurationService, languageId) {
    let onlyWhitespaceLines = true;
    const config = languageConfigurationService.getLanguageConfiguration(languageId).comments;
    const lineCommentNoIndent = config?.lineCommentNoIndent ?? false;
    let shouldRemoveComments;
    if (type === 0 /* Toggle */) {
      shouldRemoveComments = true;
    } else if (type === 1 /* ForceAdd */) {
      shouldRemoveComments = false;
    } else {
      shouldRemoveComments = true;
    }
    for (let i2 = 0, lineCount = lines.length; i2 < lineCount; i2++) {
      const lineData = lines[i2];
      const lineNumber = startLineNumber + i2;
      if (lineNumber === startLineNumber && ignoreFirstLine) {
        lineData.ignore = true;
        continue;
      }
      const lineContent = model.getLineContent(lineNumber);
      const lineContentStartOffset = firstNonWhitespaceIndex(lineContent);
      if (lineContentStartOffset === -1) {
        lineData.ignore = ignoreEmptyLines;
        lineData.commentStrOffset = lineCommentNoIndent ? 0 : lineContent.length;
        continue;
      }
      onlyWhitespaceLines = false;
      const offset = lineCommentNoIndent ? 0 : lineContentStartOffset;
      lineData.ignore = false;
      lineData.commentStrOffset = offset;
      if (shouldRemoveComments && !BlockCommentCommand._haystackHasNeedleAtOffset(lineContent, lineData.commentStr, offset)) {
        if (type === 0 /* Toggle */) {
          shouldRemoveComments = false;
        } else if (type === 1 /* ForceAdd */) {
        } else {
          lineData.ignore = true;
        }
      }
      if (shouldRemoveComments && insertSpace) {
        const commentStrEndOffset = lineContentStartOffset + lineData.commentStrLength;
        if (commentStrEndOffset < lineContent.length && lineContent.charCodeAt(commentStrEndOffset) === 32 /* Space */) {
          lineData.commentStrLength += 1;
        }
      }
    }
    if (type === 0 /* Toggle */ && onlyWhitespaceLines) {
      shouldRemoveComments = false;
      for (let i2 = 0, lineCount = lines.length; i2 < lineCount; i2++) {
        lines[i2].ignore = false;
      }
    }
    return {
      supported: true,
      shouldRemoveComments,
      lines
    };
  }
  /**
   * Analyze all lines and decide exactly what to do => not supported | insert line comments | remove line comments
   */
  static _gatherPreflightData(type, insertSpace, model, startLineNumber, endLineNumber, ignoreEmptyLines, ignoreFirstLine, languageConfigurationService) {
    const lines = _LineCommentCommand._gatherPreflightCommentStrings(model, startLineNumber, endLineNumber, languageConfigurationService);
    const languageId = model.getLanguageIdAtPosition(startLineNumber, 1);
    if (lines === null) {
      return {
        supported: false
      };
    }
    return _LineCommentCommand._analyzeLines(type, insertSpace, model, lines, startLineNumber, ignoreEmptyLines, ignoreFirstLine, languageConfigurationService, languageId);
  }
  /**
   * Given a successful analysis, execute either insert line comments, either remove line comments
   */
  _executeLineComments(model, builder, data, s) {
    let ops;
    if (data.shouldRemoveComments) {
      ops = _LineCommentCommand._createRemoveLineCommentsOperations(data.lines, s.startLineNumber);
    } else {
      _LineCommentCommand._normalizeInsertionPoint(model, data.lines, s.startLineNumber, this._indentSize);
      ops = this._createAddLineCommentsOperations(data.lines, s.startLineNumber);
    }
    const cursorPosition = new Position(s.positionLineNumber, s.positionColumn);
    for (let i2 = 0, len = ops.length; i2 < len; i2++) {
      builder.addEditOperation(ops[i2].range, ops[i2].text);
      if (Range2.isEmpty(ops[i2].range) && Range2.getStartPosition(ops[i2].range).equals(cursorPosition)) {
        const lineContent = model.getLineContent(cursorPosition.lineNumber);
        if (lineContent.length + 1 === cursorPosition.column) {
          this._deltaColumn = (ops[i2].text || "").length;
        }
      }
    }
    this._selectionId = builder.trackSelection(s);
  }
  _attemptRemoveBlockComment(model, s, startToken, endToken) {
    let startLineNumber = s.startLineNumber;
    let endLineNumber = s.endLineNumber;
    const startTokenAllowedBeforeColumn = endToken.length + Math.max(
      model.getLineFirstNonWhitespaceColumn(s.startLineNumber),
      s.startColumn
    );
    let startTokenIndex = model.getLineContent(startLineNumber).lastIndexOf(startToken, startTokenAllowedBeforeColumn - 1);
    let endTokenIndex = model.getLineContent(endLineNumber).indexOf(endToken, s.endColumn - 1 - startToken.length);
    if (startTokenIndex !== -1 && endTokenIndex === -1) {
      endTokenIndex = model.getLineContent(startLineNumber).indexOf(endToken, startTokenIndex + startToken.length);
      endLineNumber = startLineNumber;
    }
    if (startTokenIndex === -1 && endTokenIndex !== -1) {
      startTokenIndex = model.getLineContent(endLineNumber).lastIndexOf(startToken, endTokenIndex);
      startLineNumber = endLineNumber;
    }
    if (s.isEmpty() && (startTokenIndex === -1 || endTokenIndex === -1)) {
      startTokenIndex = model.getLineContent(startLineNumber).indexOf(startToken);
      if (startTokenIndex !== -1) {
        endTokenIndex = model.getLineContent(startLineNumber).indexOf(endToken, startTokenIndex + startToken.length);
      }
    }
    if (startTokenIndex !== -1 && model.getLineContent(startLineNumber).charCodeAt(startTokenIndex + startToken.length) === 32 /* Space */) {
      startToken += " ";
    }
    if (endTokenIndex !== -1 && model.getLineContent(endLineNumber).charCodeAt(endTokenIndex - 1) === 32 /* Space */) {
      endToken = " " + endToken;
      endTokenIndex -= 1;
    }
    if (startTokenIndex !== -1 && endTokenIndex !== -1) {
      return BlockCommentCommand._createRemoveBlockCommentOperations(
        new Range2(startLineNumber, startTokenIndex + startToken.length + 1, endLineNumber, endTokenIndex + 1),
        startToken,
        endToken
      );
    }
    return null;
  }
  /**
   * Given an unsuccessful analysis, delegate to the block comment command
   */
  _executeBlockComment(model, builder, s) {
    model.tokenization.tokenizeIfCheap(s.startLineNumber);
    const languageId = model.getLanguageIdAtPosition(s.startLineNumber, 1);
    const config = this.languageConfigurationService.getLanguageConfiguration(languageId).comments;
    if (!config || !config.blockCommentStartToken || !config.blockCommentEndToken) {
      return;
    }
    const startToken = config.blockCommentStartToken;
    const endToken = config.blockCommentEndToken;
    let ops = this._attemptRemoveBlockComment(model, s, startToken, endToken);
    if (!ops) {
      if (s.isEmpty()) {
        const lineContent = model.getLineContent(s.startLineNumber);
        let firstNonWhitespaceIndex2 = firstNonWhitespaceIndex(lineContent);
        if (firstNonWhitespaceIndex2 === -1) {
          firstNonWhitespaceIndex2 = lineContent.length;
        }
        ops = BlockCommentCommand._createAddBlockCommentOperations(
          new Range2(s.startLineNumber, firstNonWhitespaceIndex2 + 1, s.startLineNumber, lineContent.length + 1),
          startToken,
          endToken,
          this._insertSpace
        );
      } else {
        ops = BlockCommentCommand._createAddBlockCommentOperations(
          new Range2(s.startLineNumber, model.getLineFirstNonWhitespaceColumn(s.startLineNumber), s.endLineNumber, model.getLineMaxColumn(s.endLineNumber)),
          startToken,
          endToken,
          this._insertSpace
        );
      }
      if (ops.length === 1) {
        this._deltaColumn = startToken.length + 1;
      }
    }
    this._selectionId = builder.trackSelection(s);
    for (const op of ops) {
      builder.addEditOperation(op.range, op.text);
    }
  }
  getEditOperations(model, builder) {
    let s = this._selection;
    this._moveEndPositionDown = false;
    if (s.startLineNumber === s.endLineNumber && this._ignoreFirstLine) {
      builder.addEditOperation(new Range2(s.startLineNumber, model.getLineMaxColumn(s.startLineNumber), s.startLineNumber + 1, 1), s.startLineNumber === model.getLineCount() ? "" : "\n");
      this._selectionId = builder.trackSelection(s);
      return;
    }
    if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
      this._moveEndPositionDown = true;
      s = s.setEndPosition(s.endLineNumber - 1, model.getLineMaxColumn(s.endLineNumber - 1));
    }
    const data = _LineCommentCommand._gatherPreflightData(
      this._type,
      this._insertSpace,
      model,
      s.startLineNumber,
      s.endLineNumber,
      this._ignoreEmptyLines,
      this._ignoreFirstLine,
      this.languageConfigurationService
    );
    if (data.supported) {
      return this._executeLineComments(model, builder, data, s);
    }
    return this._executeBlockComment(model, builder, s);
  }
  computeCursorState(model, helper) {
    let result = helper.getTrackedSelection(this._selectionId);
    if (this._moveEndPositionDown) {
      result = result.setEndPosition(result.endLineNumber + 1, 1);
    }
    return new Selection(
      result.selectionStartLineNumber,
      result.selectionStartColumn + this._deltaColumn,
      result.positionLineNumber,
      result.positionColumn + this._deltaColumn
    );
  }
  /**
   * Generate edit operations in the remove line comment case
   */
  static _createRemoveLineCommentsOperations(lines, startLineNumber) {
    const res = [];
    for (let i2 = 0, len = lines.length; i2 < len; i2++) {
      const lineData = lines[i2];
      if (lineData.ignore) {
        continue;
      }
      res.push(EditOperation.delete(new Range2(
        startLineNumber + i2,
        lineData.commentStrOffset + 1,
        startLineNumber + i2,
        lineData.commentStrOffset + lineData.commentStrLength + 1
      )));
    }
    return res;
  }
  /**
   * Generate edit operations in the add line comment case
   */
  _createAddLineCommentsOperations(lines, startLineNumber) {
    const res = [];
    const afterCommentStr = this._insertSpace ? " " : "";
    for (let i2 = 0, len = lines.length; i2 < len; i2++) {
      const lineData = lines[i2];
      if (lineData.ignore) {
        continue;
      }
      res.push(EditOperation.insert(new Position(startLineNumber + i2, lineData.commentStrOffset + 1), lineData.commentStr + afterCommentStr));
    }
    return res;
  }
  static nextVisibleColumn(currentVisibleColumn, indentSize, isTab, columnSize) {
    if (isTab) {
      return currentVisibleColumn + (indentSize - currentVisibleColumn % indentSize);
    }
    return currentVisibleColumn + columnSize;
  }
  /**
   * Adjust insertion points to have them vertically aligned in the add line comment case
   */
  static _normalizeInsertionPoint(model, lines, startLineNumber, indentSize) {
    let minVisibleColumn = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
    let j;
    let lenJ;
    for (let i2 = 0, len = lines.length; i2 < len; i2++) {
      if (lines[i2].ignore) {
        continue;
      }
      const lineContent = model.getLineContent(startLineNumber + i2);
      let currentVisibleColumn = 0;
      for (let j2 = 0, lenJ2 = lines[i2].commentStrOffset; currentVisibleColumn < minVisibleColumn && j2 < lenJ2; j2++) {
        currentVisibleColumn = _LineCommentCommand.nextVisibleColumn(currentVisibleColumn, indentSize, lineContent.charCodeAt(j2) === 9 /* Tab */, 1);
      }
      if (currentVisibleColumn < minVisibleColumn) {
        minVisibleColumn = currentVisibleColumn;
      }
    }
    minVisibleColumn = Math.floor(minVisibleColumn / indentSize) * indentSize;
    for (let i2 = 0, len = lines.length; i2 < len; i2++) {
      if (lines[i2].ignore) {
        continue;
      }
      const lineContent = model.getLineContent(startLineNumber + i2);
      let currentVisibleColumn = 0;
      for (j = 0, lenJ = lines[i2].commentStrOffset; currentVisibleColumn < minVisibleColumn && j < lenJ; j++) {
        currentVisibleColumn = _LineCommentCommand.nextVisibleColumn(currentVisibleColumn, indentSize, lineContent.charCodeAt(j) === 9 /* Tab */, 1);
      }
      if (currentVisibleColumn > minVisibleColumn) {
        lines[i2].commentStrOffset = j - 1;
      } else {
        lines[i2].commentStrOffset = j;
      }
    }
  }
};
export { LineCommentCommand };
