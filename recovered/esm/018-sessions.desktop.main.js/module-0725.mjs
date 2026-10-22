// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionIsVisible.ts
import { singleTextRemoveCommonPrefix } from "./module-0719.mjs";
import { matchesSubString } from "./module-0453.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionIsVisible.ts
function inlineCompletionIsVisible(singleTextEdit, originalRange, model, cursorPosition) {
  const minimizedReplacement = singleTextRemoveCommonPrefix(singleTextEdit, model);
  const editRange = singleTextEdit.range;
  if (!editRange || originalRange && !originalRange.getStartPosition().equals(editRange.getStartPosition()) || cursorPosition.lineNumber !== minimizedReplacement.range.startLineNumber || minimizedReplacement.isEmpty) {
    return false;
  }
  const originalValue = model.getValueInRange(minimizedReplacement.range, 1 /* LF */);
  const filterText = minimizedReplacement.text;
  const cursorPosIndex = Math.max(0, cursorPosition.column - minimizedReplacement.range.startColumn);
  let filterTextBefore = filterText.substring(0, cursorPosIndex);
  let filterTextAfter = filterText.substring(cursorPosIndex);
  let originalValueBefore = originalValue.substring(0, cursorPosIndex);
  let originalValueAfter = originalValue.substring(cursorPosIndex);
  const originalValueIndent = model.getLineIndentColumn(minimizedReplacement.range.startLineNumber);
  if (minimizedReplacement.range.startColumn <= originalValueIndent) {
    originalValueBefore = originalValueBefore.trimStart();
    if (originalValueBefore.length === 0) {
      originalValueAfter = originalValueAfter.trimStart();
    }
    filterTextBefore = filterTextBefore.trimStart();
    if (filterTextBefore.length === 0) {
      filterTextAfter = filterTextAfter.trimStart();
    }
  }
  return filterTextBefore.startsWith(originalValueBefore) && !!matchesSubString(originalValueAfter, filterTextAfter);
}
export { inlineCompletionIsVisible };
