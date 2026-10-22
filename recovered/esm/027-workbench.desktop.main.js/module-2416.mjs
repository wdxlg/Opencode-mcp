// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputCompletionUtils.ts
import { FuzzyScoreOptions, fuzzyScore, fuzzyScoreGracefulAggressive } from "./module-0453.mjs";
import { getWordAtText } from "./module-0103.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputCompletionUtils.ts
var attachedContextCompletionSortText = "\0";

var attachedContextCompletionAdditionalTriggerCharacters = [":", "-"];

function getAttachedContextCompletionSortText(score3) {
  return `${attachedContextCompletionSortText}${(2147483647 - score3).toString(16).padStart(8, "0")}`;
}

function getAttachedContextCompletionMatch(typedWord, leader, name, kind, suggestOptions) {
  if (!typedWord) {
    return { filterText: typedWord, score: 0 };
  }
  const searchableText = `${leader}${name} ${leader}attachment:${name} ${name} ${kind}`;
  const scoreFn = suggestOptions.filterGraceful ? fuzzyScoreGracefulAggressive : fuzzyScore;
  const score3 = scoreFn(
    typedWord,
    typedWord.toLowerCase(),
    0,
    searchableText,
    searchableText.toLowerCase(),
    0,
    { ...FuzzyScoreOptions.default, firstMatchCanBeWeak: !suggestOptions.matchOnWordStartOnly }
  );
  return score3 ? { filterText: typedWord, score: score3[0] } : void 0;
}

function escapeForCharClass(text2) {
  return text2.replace(/[-\\^\]]/g, "\\$&");
}

function getCompletionRangeWord(rangeResult) {
  return rangeResult.varWord?.word.slice(0, rangeResult.insert.endColumn - rangeResult.insert.startColumn);
}

function computeCompletionRanges2(model, position2, reg3, onlyOnWordStart = false) {
  const varWord = getWordAtText(position2.column, reg3, model.getLineContent(position2.lineNumber), 0);
  if (!varWord && model.getWordUntilPosition(position2).word) {
    return;
  }
  if (!varWord && position2.column > 1) {
    const textBefore = model.getValueInRange(new Range2(position2.lineNumber, position2.column - 1, position2.lineNumber, position2.column));
    if (textBefore !== " ") {
      return;
    }
  }
  if (varWord && onlyOnWordStart) {
    const wordBefore = model.getWordUntilPosition({ lineNumber: position2.lineNumber, column: varWord.startColumn });
    if (wordBefore.word) {
      return;
    }
  }
  let insert2;
  let replace;
  if (!varWord) {
    insert2 = replace = Range2.fromPositions(position2);
  } else {
    insert2 = new Range2(position2.lineNumber, varWord.startColumn, position2.lineNumber, position2.column);
    replace = new Range2(position2.lineNumber, varWord.startColumn, position2.lineNumber, varWord.endColumn);
  }
  return { insert: insert2, replace, varWord };
}

function isEmptyUpToCompletionWord(model, rangeResult) {
  const startToCompletionWordStart = new Range2(1, 1, rangeResult.replace.startLineNumber, rangeResult.replace.startColumn);
  return !!model.getValueInRange(startToCompletionWordStart).match(/^\s*$/);
}

function isAtTriggerCharacterToken(model, position2, triggerCharacters) {
  if (triggerCharacters.length === 0) {
    return false;
  }
  const line = model.getLineContent(position2.lineNumber);
  const beforeCursor = line.slice(0, position2.column - 1);
  const wsIdx = beforeCursor.search(/\s\S*$/);
  const token = wsIdx >= 0 ? beforeCursor.slice(wsIdx + 1) : beforeCursor;
  if (token.length === 0) {
    return false;
  }
  return triggerCharacters.includes(token[0]);
}
export { getAttachedContextCompletionSortText, getAttachedContextCompletionMatch, escapeForCharClass, getCompletionRangeWord, computeCompletionRanges2, isEmptyUpToCompletionWord, isAtTriggerCharacterToken, attachedContextCompletionSortText, attachedContextCompletionAdditionalTriggerCharacters };
