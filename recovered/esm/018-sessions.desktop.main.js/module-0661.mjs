// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/comment/browser/blockCommentCommand.ts
import { Range2 } from "./module-0106.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Position } from "./module-0079.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/editor/contrib/comment/browser/blockCommentCommand.ts
var BlockCommentCommand = class _BlockCommentCommand {
  constructor(selection, insertSpace, languageConfigurationService) {
    this.languageConfigurationService = languageConfigurationService;
    this._selection = selection;
    this._insertSpace = insertSpace;
    this._usedEndToken = null;
  }
  static _haystackHasNeedleAtOffset(haystack, needle, offset) {
    if (offset < 0) {
      return false;
    }
    const needleLength = needle.length;
    const haystackLength = haystack.length;
    if (offset + needleLength > haystackLength) {
      return false;
    }
    for (let i2 = 0; i2 < needleLength; i2++) {
      const codeA = haystack.charCodeAt(offset + i2);
      const codeB = needle.charCodeAt(i2);
      if (codeA === codeB) {
        continue;
      }
      if (codeA >= 65 /* A */ && codeA <= 90 /* Z */ && codeA + 32 === codeB) {
        continue;
      }
      if (codeB >= 65 /* A */ && codeB <= 90 /* Z */ && codeB + 32 === codeA) {
        continue;
      }
      return false;
    }
    return true;
  }
  _createOperationsForBlockComment(selection, startToken, endToken, insertSpace, model, builder) {
    const startLineNumber = selection.startLineNumber;
    const startColumn = selection.startColumn;
    const endLineNumber = selection.endLineNumber;
    const endColumn = selection.endColumn;
    const startLineText = model.getLineContent(startLineNumber);
    const endLineText = model.getLineContent(endLineNumber);
    let startTokenIndex = startLineText.lastIndexOf(startToken, startColumn - 1 + startToken.length);
    let endTokenIndex = endLineText.indexOf(endToken, endColumn - 1 - endToken.length);
    if (startTokenIndex !== -1 && endTokenIndex !== -1) {
      if (startLineNumber === endLineNumber) {
        const lineBetweenTokens = startLineText.substring(startTokenIndex + startToken.length, endTokenIndex);
        if (lineBetweenTokens.indexOf(endToken) >= 0) {
          startTokenIndex = -1;
          endTokenIndex = -1;
        }
      } else {
        const startLineAfterStartToken = startLineText.substring(startTokenIndex + startToken.length);
        const endLineBeforeEndToken = endLineText.substring(0, endTokenIndex);
        if (startLineAfterStartToken.indexOf(endToken) >= 0 || endLineBeforeEndToken.indexOf(endToken) >= 0) {
          startTokenIndex = -1;
          endTokenIndex = -1;
        }
      }
    }
    let ops;
    if (startTokenIndex !== -1 && endTokenIndex !== -1) {
      if (insertSpace && startTokenIndex + startToken.length < startLineText.length && startLineText.charCodeAt(startTokenIndex + startToken.length) === 32 /* Space */) {
        startToken = startToken + " ";
      }
      if (insertSpace && endTokenIndex > 0 && endLineText.charCodeAt(endTokenIndex - 1) === 32 /* Space */) {
        endToken = " " + endToken;
        endTokenIndex -= 1;
      }
      ops = _BlockCommentCommand._createRemoveBlockCommentOperations(
        new Range2(startLineNumber, startTokenIndex + startToken.length + 1, endLineNumber, endTokenIndex + 1),
        startToken,
        endToken
      );
    } else {
      ops = _BlockCommentCommand._createAddBlockCommentOperations(selection, startToken, endToken, this._insertSpace);
      this._usedEndToken = ops.length === 1 ? endToken : null;
    }
    for (const op of ops) {
      builder.addTrackedEditOperation(op.range, op.text);
    }
  }
  static _createRemoveBlockCommentOperations(r2, startToken, endToken) {
    const res = [];
    if (!Range2.isEmpty(r2)) {
      res.push(EditOperation.delete(new Range2(
        r2.startLineNumber,
        r2.startColumn - startToken.length,
        r2.startLineNumber,
        r2.startColumn
      )));
      res.push(EditOperation.delete(new Range2(
        r2.endLineNumber,
        r2.endColumn,
        r2.endLineNumber,
        r2.endColumn + endToken.length
      )));
    } else {
      res.push(EditOperation.delete(new Range2(
        r2.startLineNumber,
        r2.startColumn - startToken.length,
        r2.endLineNumber,
        r2.endColumn + endToken.length
      )));
    }
    return res;
  }
  static _createAddBlockCommentOperations(r2, startToken, endToken, insertSpace) {
    const res = [];
    if (!Range2.isEmpty(r2)) {
      res.push(EditOperation.insert(new Position(r2.startLineNumber, r2.startColumn), startToken + (insertSpace ? " " : "")));
      res.push(EditOperation.insert(new Position(r2.endLineNumber, r2.endColumn), (insertSpace ? " " : "") + endToken));
    } else {
      res.push(EditOperation.replace(new Range2(
        r2.startLineNumber,
        r2.startColumn,
        r2.endLineNumber,
        r2.endColumn
      ), startToken + "  " + endToken));
    }
    return res;
  }
  getEditOperations(model, builder) {
    const startLineNumber = this._selection.startLineNumber;
    const startColumn = this._selection.startColumn;
    model.tokenization.tokenizeIfCheap(startLineNumber);
    const languageId = model.getLanguageIdAtPosition(startLineNumber, startColumn);
    const config = this.languageConfigurationService.getLanguageConfiguration(languageId).comments;
    if (!config || !config.blockCommentStartToken || !config.blockCommentEndToken) {
      return;
    }
    this._createOperationsForBlockComment(this._selection, config.blockCommentStartToken, config.blockCommentEndToken, this._insertSpace, model, builder);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    if (inverseEditOperations.length === 2) {
      const startTokenEditOperation = inverseEditOperations[0];
      const endTokenEditOperation = inverseEditOperations[1];
      return new Selection(
        startTokenEditOperation.range.endLineNumber,
        startTokenEditOperation.range.endColumn,
        endTokenEditOperation.range.startLineNumber,
        endTokenEditOperation.range.startColumn
      );
    } else {
      const srcRange = inverseEditOperations[0].range;
      const deltaColumn = this._usedEndToken ? -this._usedEndToken.length - 1 : 0;
      return new Selection(
        srcRange.endLineNumber,
        srcRange.endColumn + deltaColumn,
        srcRange.endLineNumber,
        srcRange.endColumn + deltaColumn
      );
    }
  }
};
export { BlockCommentCommand };
