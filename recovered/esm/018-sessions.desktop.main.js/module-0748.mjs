// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/smartSelect/browser/bracketSelections.ts
import { LinkedList } from "./module-0013.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/contrib/smartSelect/browser/bracketSelections.ts
var BracketSelectionRangeProvider = class _BracketSelectionRangeProvider {
  async provideSelectionRanges(model, positions) {
    const result = [];
    for (const position2 of positions) {
      const bucket = [];
      result.push(bucket);
      const ranges = /* @__PURE__ */ new Map();
      await new Promise((resolve3) => _BracketSelectionRangeProvider._bracketsRightYield(resolve3, 0, model, position2, ranges));
      await new Promise((resolve3) => _BracketSelectionRangeProvider._bracketsLeftYield(resolve3, 0, model, position2, ranges, bucket));
    }
    return result;
  }
  static {
    this._maxDuration = 30;
  }
  static {
    this._maxRounds = 2;
  }
  static _bracketsRightYield(resolve3, round, model, pos, ranges) {
    const counts = /* @__PURE__ */ new Map();
    const t1 = Date.now();
    while (true) {
      if (round >= _BracketSelectionRangeProvider._maxRounds) {
        resolve3();
        break;
      }
      if (!pos) {
        resolve3();
        break;
      }
      const bracket = model.bracketPairs.findNextBracket(pos);
      if (!bracket) {
        resolve3();
        break;
      }
      const d = Date.now() - t1;
      if (d > _BracketSelectionRangeProvider._maxDuration) {
        setTimeout(() => _BracketSelectionRangeProvider._bracketsRightYield(resolve3, round + 1, model, pos, ranges));
        break;
      }
      if (bracket.bracketInfo.isOpeningBracket) {
        const key3 = bracket.bracketInfo.bracketText;
        const val = counts.has(key3) ? counts.get(key3) : 0;
        counts.set(key3, val + 1);
      } else {
        const key3 = bracket.bracketInfo.getOpeningBrackets()[0].bracketText;
        let val = counts.has(key3) ? counts.get(key3) : 0;
        val -= 1;
        counts.set(key3, Math.max(0, val));
        if (val < 0) {
          let list2 = ranges.get(key3);
          if (!list2) {
            list2 = new LinkedList();
            ranges.set(key3, list2);
          }
          list2.push(bracket.range);
        }
      }
      pos = bracket.range.getEndPosition();
    }
  }
  static _bracketsLeftYield(resolve3, round, model, pos, ranges, bucket) {
    const counts = /* @__PURE__ */ new Map();
    const t1 = Date.now();
    while (true) {
      if (round >= _BracketSelectionRangeProvider._maxRounds && ranges.size === 0) {
        resolve3();
        break;
      }
      if (!pos) {
        resolve3();
        break;
      }
      const bracket = model.bracketPairs.findPrevBracket(pos);
      if (!bracket) {
        resolve3();
        break;
      }
      const d = Date.now() - t1;
      if (d > _BracketSelectionRangeProvider._maxDuration) {
        setTimeout(() => _BracketSelectionRangeProvider._bracketsLeftYield(resolve3, round + 1, model, pos, ranges, bucket));
        break;
      }
      if (!bracket.bracketInfo.isOpeningBracket) {
        const key3 = bracket.bracketInfo.getOpeningBrackets()[0].bracketText;
        const val = counts.has(key3) ? counts.get(key3) : 0;
        counts.set(key3, val + 1);
      } else {
        const key3 = bracket.bracketInfo.bracketText;
        let val = counts.has(key3) ? counts.get(key3) : 0;
        val -= 1;
        counts.set(key3, Math.max(0, val));
        if (val < 0) {
          const list2 = ranges.get(key3);
          if (list2) {
            const closing = list2.shift();
            if (list2.size === 0) {
              ranges.delete(key3);
            }
            const innerBracket = Range2.fromPositions(bracket.range.getEndPosition(), closing.getStartPosition());
            const outerBracket = Range2.fromPositions(bracket.range.getStartPosition(), closing.getEndPosition());
            bucket.push({ range: innerBracket });
            bucket.push({ range: outerBracket });
            _BracketSelectionRangeProvider._addBracketLeading(model, outerBracket, bucket);
          }
        }
      }
      pos = bracket.range.getStartPosition();
    }
  }
  static _addBracketLeading(model, bracket, bucket) {
    if (bracket.startLineNumber === bracket.endLineNumber) {
      return;
    }
    const startLine = bracket.startLineNumber;
    const column = model.getLineFirstNonWhitespaceColumn(startLine);
    if (column !== 0 && column !== bracket.startColumn) {
      bucket.push({ range: Range2.fromPositions(new Position(startLine, column), bracket.getEndPosition()) });
      bucket.push({ range: Range2.fromPositions(new Position(startLine, 1), bracket.getEndPosition()) });
    }
    const aboveLine = startLine - 1;
    if (aboveLine > 0) {
      const column2 = model.getLineFirstNonWhitespaceColumn(aboveLine);
      if (column2 === bracket.startColumn && column2 !== model.getLineLastNonWhitespaceColumn(aboveLine)) {
        bucket.push({ range: Range2.fromPositions(new Position(aboveLine, column2), bracket.getEndPosition()) });
        bucket.push({ range: Range2.fromPositions(new Position(aboveLine, 1), bracket.getEndPosition()) });
      }
    }
  }
};
export { BracketSelectionRangeProvider };
