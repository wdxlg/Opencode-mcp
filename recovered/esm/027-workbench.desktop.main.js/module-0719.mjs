// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/singleTextEditHelpers.ts
import { commonPrefixLength2 } from "./module-0030.mjs";
import { TextLength } from "./module-0175.mjs";
import { Range2 } from "./module-0106.mjs";
import { TextReplacement } from "./module-0178.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/singleTextEditHelpers.ts
function singleTextRemoveCommonPrefix(edit3, model, validModelRange) {
  const modelRange = validModelRange ? edit3.range.intersectRanges(validModelRange) : edit3.range;
  if (!modelRange) {
    return edit3;
  }
  const normalizedText = edit3.text.replaceAll("\r\n", "\n");
  const valueToReplace = model.getValueInRange(modelRange, 1 /* LF */);
  const commonPrefixLen = commonPrefixLength2(valueToReplace, normalizedText);
  const start = TextLength.ofText(valueToReplace.substring(0, commonPrefixLen)).addToPosition(edit3.range.getStartPosition());
  const text2 = normalizedText.substring(commonPrefixLen);
  const range2 = Range2.fromPositions(start, edit3.range.getEndPosition());
  return new TextReplacement(range2, text2);
}

function singleTextEditAugments(edit3, base) {
  return edit3.text.startsWith(base.text) && rangeExtends(edit3.range, base.range);
}

function rangeExtends(extendingRange, rangeToExtend) {
  return rangeToExtend.getStartPosition().equals(extendingRange.getStartPosition()) && rangeToExtend.getEndPosition().isBeforeOrEqual(extendingRange.getEndPosition());
}
export { singleTextRemoveCommonPrefix, singleTextEditAugments, rangeExtends };
