// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/editContext/screenReaderUtils.ts
import { Range2 } from "./module-0106.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/editor/browser/controller/editContext/screenReaderUtils.ts
var SimplePagedScreenReaderStrategy = class {
  _getPageOfLine(lineNumber, linesPerPage) {
    return Math.floor((lineNumber - 1) / linesPerPage);
  }
  _getRangeForPage(page, linesPerPage) {
    const offset = page * linesPerPage;
    const startLineNumber = offset + 1;
    const endLineNumber = offset + linesPerPage;
    return new Range2(startLineNumber, 1, endLineNumber + 1, 1);
  }
  fromEditorSelection(model, selection, linesPerPage, trimLongText) {
    const LIMIT_CHARS = 500;
    const selectionStartPage = this._getPageOfLine(selection.startLineNumber, linesPerPage);
    const selectionStartPageRange = this._getRangeForPage(selectionStartPage, linesPerPage);
    const selectionEndPage = this._getPageOfLine(selection.endLineNumber, linesPerPage);
    const selectionEndPageRange = this._getRangeForPage(selectionEndPage, linesPerPage);
    let pretextRange = selectionStartPageRange.intersectRanges(new Range2(1, 1, selection.startLineNumber, selection.startColumn));
    if (trimLongText && model.getValueLengthInRange(pretextRange, 1 /* LF */) > LIMIT_CHARS) {
      const pretextStart = model.modifyPosition(pretextRange.getEndPosition(), -LIMIT_CHARS);
      pretextRange = Range2.fromPositions(pretextStart, pretextRange.getEndPosition());
    }
    const pretext = model.getValueInRange(pretextRange, 1 /* LF */);
    const lastLine = model.getLineCount();
    const lastLineMaxColumn = model.getLineMaxColumn(lastLine);
    let posttextRange = selectionEndPageRange.intersectRanges(new Range2(selection.endLineNumber, selection.endColumn, lastLine, lastLineMaxColumn));
    if (trimLongText && model.getValueLengthInRange(posttextRange, 1 /* LF */) > LIMIT_CHARS) {
      const posttextEnd = model.modifyPosition(posttextRange.getStartPosition(), LIMIT_CHARS);
      posttextRange = Range2.fromPositions(posttextRange.getStartPosition(), posttextEnd);
    }
    const posttext = model.getValueInRange(posttextRange, 1 /* LF */);
    let text2;
    if (selectionStartPage === selectionEndPage || selectionStartPage + 1 === selectionEndPage) {
      text2 = model.getValueInRange(selection, 1 /* LF */);
    } else {
      const selectionRange1 = selectionStartPageRange.intersectRanges(selection);
      const selectionRange2 = selectionEndPageRange.intersectRanges(selection);
      text2 = model.getValueInRange(selectionRange1, 1 /* LF */) + String.fromCharCode(8230) + model.getValueInRange(selectionRange2, 1 /* LF */);
    }
    if (trimLongText && text2.length > 2 * LIMIT_CHARS) {
      text2 = text2.substring(0, LIMIT_CHARS) + String.fromCharCode(8230) + text2.substring(text2.length - LIMIT_CHARS, text2.length);
    }
    let selectionStart;
    let selectionEnd;
    if (selection.getDirection() === 0 /* LTR */) {
      selectionStart = pretext.length;
      selectionEnd = pretext.length + text2.length;
    } else {
      selectionEnd = pretext.length;
      selectionStart = pretext.length + text2.length;
    }
    return {
      value: pretext + text2 + posttext,
      selection,
      selectionStart,
      selectionEnd,
      startPositionWithinEditor: pretextRange.getStartPosition(),
      newlineCountBeforeSelection: pretextRange.endLineNumber - pretextRange.startLineNumber
    };
  }
};

function ariaLabelForScreenReaderContent(options3, keybindingService) {
  const accessibilitySupport = options3.get(2 /* accessibilitySupport */);
  if (accessibilitySupport === 1 /* Disabled */) {
    const toggleKeybindingLabel = keybindingService.lookupKeybinding("editor.action.toggleScreenReaderAccessibilityMode")?.getAriaLabel();
    const runCommandKeybindingLabel = keybindingService.lookupKeybinding("workbench.action.showCommands")?.getAriaLabel();
    const keybindingEditorKeybindingLabel = keybindingService.lookupKeybinding("workbench.action.openGlobalKeybindings")?.getAriaLabel();
    const editorNotAccessibleMessage = localize(176, null);
    if (toggleKeybindingLabel) {
      return localize(177, null, editorNotAccessibleMessage, toggleKeybindingLabel);
    } else if (runCommandKeybindingLabel) {
      return localize(178, null, editorNotAccessibleMessage, runCommandKeybindingLabel);
    } else if (keybindingEditorKeybindingLabel) {
      return localize(179, null, editorNotAccessibleMessage, keybindingEditorKeybindingLabel);
    } else {
      return editorNotAccessibleMessage;
    }
  }
  return options3.get(8 /* ariaLabel */);
}

function newlinecount(text2) {
  let result = 0;
  let startIndex = -1;
  do {
    startIndex = text2.indexOf("\n", startIndex + 1);
    if (startIndex === -1) {
      break;
    }
    result++;
  } while (true);
  return result;
}
export { ariaLabelForScreenReaderContent, newlinecount, SimplePagedScreenReaderStrategy };
