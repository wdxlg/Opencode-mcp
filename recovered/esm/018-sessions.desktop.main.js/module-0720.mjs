// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/computeGhostText.ts
import { singleTextRemoveCommonPrefix } from "./module-0719.mjs";
import { getLeadingWhitespace } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { TextReplacement } from "./module-0178.mjs";
import { GhostText, GhostTextPart } from "./module-0718.mjs";
import { LcsDiff } from "./module-0166.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/computeGhostText.ts
function computeGhostText(edit3, model, mode, cursorPosition, previewSuffixLength = 0) {
  let e4 = singleTextRemoveCommonPrefix(edit3, model);
  if (e4.range.endLineNumber !== e4.range.startLineNumber) {
    return void 0;
  }
  const sourceLine = model.getLineContent(e4.range.startLineNumber);
  const sourceIndentationLength = getLeadingWhitespace(sourceLine).length;
  const suggestionTouchesIndentation = e4.range.startColumn - 1 <= sourceIndentationLength;
  if (suggestionTouchesIndentation) {
    const suggestionAddedIndentationLength = getLeadingWhitespace(e4.text).length;
    const replacedIndentation = sourceLine.substring(e4.range.startColumn - 1, sourceIndentationLength);
    const [startPosition, endPosition] = [e4.range.getStartPosition(), e4.range.getEndPosition()];
    const newStartPosition = startPosition.column + replacedIndentation.length <= endPosition.column ? startPosition.delta(0, replacedIndentation.length) : endPosition;
    const rangeThatDoesNotReplaceIndentation = Range2.fromPositions(newStartPosition, endPosition);
    const suggestionWithoutIndentationChange = e4.text.startsWith(replacedIndentation) ? e4.text.substring(replacedIndentation.length) : e4.text.substring(suggestionAddedIndentationLength);
    e4 = new TextReplacement(rangeThatDoesNotReplaceIndentation, suggestionWithoutIndentationChange);
  }
  const valueToBeReplaced = model.getValueInRange(e4.range);
  const changes = cachingDiff(valueToBeReplaced, e4.text);
  if (!changes) {
    return void 0;
  }
  const lineNumber = e4.range.startLineNumber;
  const parts = new Array();
  if (mode === "prefix") {
    const filteredChanges = changes.filter((c) => c.originalLength === 0);
    if (filteredChanges.length > 1 || filteredChanges.length === 1 && filteredChanges[0].originalStart !== valueToBeReplaced.length) {
      return void 0;
    }
  }
  const previewStartInCompletionText = e4.text.length - previewSuffixLength;
  for (const c of changes) {
    const insertColumn = e4.range.startColumn + c.originalStart + c.originalLength;
    if (mode === "subwordSmart" && cursorPosition && cursorPosition.lineNumber === e4.range.startLineNumber && insertColumn < cursorPosition.column) {
      return void 0;
    }
    if (c.originalLength > 0) {
      return void 0;
    }
    if (c.modifiedLength === 0) {
      continue;
    }
    const modifiedEnd = c.modifiedStart + c.modifiedLength;
    const nonPreviewTextEnd = Math.max(c.modifiedStart, Math.min(modifiedEnd, previewStartInCompletionText));
    const nonPreviewText = e4.text.substring(c.modifiedStart, nonPreviewTextEnd);
    const italicText = e4.text.substring(nonPreviewTextEnd, Math.max(c.modifiedStart, modifiedEnd));
    if (nonPreviewText.length > 0) {
      parts.push(new GhostTextPart(insertColumn, nonPreviewText, false));
    }
    if (italicText.length > 0) {
      parts.push(new GhostTextPart(insertColumn, italicText, true));
    }
  }
  return new GhostText(lineNumber, parts);
}

var lastRequest = void 0;

function cachingDiff(originalValue, newValue) {
  if (lastRequest?.originalValue === originalValue && lastRequest?.newValue === newValue) {
    return lastRequest?.changes;
  } else {
    let changes = smartDiff(originalValue, newValue, true);
    if (changes) {
      const deletedChars = deletedCharacters(changes);
      if (deletedChars > 0) {
        const newChanges = smartDiff(originalValue, newValue, false);
        if (newChanges && deletedCharacters(newChanges) < deletedChars) {
          changes = newChanges;
        }
      }
    }
    lastRequest = {
      originalValue,
      newValue,
      changes
    };
    return changes;
  }
}

function deletedCharacters(changes) {
  let sum2 = 0;
  for (const c of changes) {
    sum2 += c.originalLength;
  }
  return sum2;
}

function smartDiff(originalValue, newValue, smartBracketMatching) {
  if (originalValue.length > 5e3 || newValue.length > 5e3) {
    return void 0;
  }
  function getMaxCharCode(val) {
    let maxCharCode2 = 0;
    for (let i2 = 0, len = val.length; i2 < len; i2++) {
      const charCode = val.charCodeAt(i2);
      if (charCode > maxCharCode2) {
        maxCharCode2 = charCode;
      }
    }
    return maxCharCode2;
  }
  const maxCharCode = Math.max(getMaxCharCode(originalValue), getMaxCharCode(newValue));
  function getUniqueCharCode(id2) {
    if (id2 < 0) {
      throw new Error("unexpected");
    }
    return maxCharCode + id2 + 1;
  }
  function getElements(source) {
    let level = 0;
    let group2 = 0;
    const characters = new Int32Array(source.length);
    for (let i2 = 0, len = source.length; i2 < len; i2++) {
      if (smartBracketMatching && source[i2] === "(") {
        const id2 = group2 * 100 + level;
        characters[i2] = getUniqueCharCode(2 * id2);
        level++;
      } else if (smartBracketMatching && source[i2] === ")") {
        level = Math.max(level - 1, 0);
        const id2 = group2 * 100 + level;
        characters[i2] = getUniqueCharCode(2 * id2 + 1);
        if (level === 0) {
          group2++;
        }
      } else {
        characters[i2] = source.charCodeAt(i2);
      }
    }
    return characters;
  }
  const elements1 = getElements(originalValue);
  const elements2 = getElements(newValue);
  return new LcsDiff({ getElements: () => elements1 }, { getElements: () => elements2 }).ComputeDiff(false).changes;
}
export { computeGhostText, cachingDiff, deletedCharacters, smartDiff, lastRequest };
