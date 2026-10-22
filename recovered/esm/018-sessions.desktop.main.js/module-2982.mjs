// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/lineAlignment.ts
import { TextLength } from "./module-0175.mjs";
import { assertFn, checkAdjacentItems } from "./module-0009.mjs";
import { isDefined } from "./module-0010.mjs";
import { RangeMapping3 } from "./module-1135.mjs";
import { Range2 } from "./module-0106.mjs";
import { addLength, lengthBetweenPositions2, lengthOfRange } from "./module-1134.mjs";
import { compareBy } from "./module-0007.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/lineAlignment.ts
function getAlignments(m) {
  const equalRanges1 = toEqualRangeMappings(m.input1Diffs.flatMap((d) => d.rangeMappings), m.baseRange.toExclusiveRange(), m.input1Range.toExclusiveRange());
  const equalRanges2 = toEqualRangeMappings(m.input2Diffs.flatMap((d) => d.rangeMappings), m.baseRange.toExclusiveRange(), m.input2Range.toExclusiveRange());
  const commonRanges = splitUpCommonEqualRangeMappings(equalRanges1, equalRanges2);
  let result = [];
  result.push([m.input1Range.startLineNumber - 1, m.baseRange.startLineNumber - 1, m.input2Range.startLineNumber - 1]);
  function isFullSync(lineAlignment) {
    return lineAlignment.every((i2) => i2 !== void 0);
  }
  for (const m2 of commonRanges) {
    const lineAlignment = [m2.output1Pos?.lineNumber, m2.inputPos.lineNumber, m2.output2Pos?.lineNumber];
    const alignmentIsFullSync = isFullSync(lineAlignment);
    let shouldAdd = true;
    if (alignmentIsFullSync) {
      const isNewFullSyncAlignment = !result.some((r2) => isFullSync(r2) && r2.some((v2, idx) => v2 !== void 0 && v2 === lineAlignment[idx]));
      if (isNewFullSyncAlignment) {
        result = result.filter((r2) => !r2.some((v2, idx) => v2 !== void 0 && v2 === lineAlignment[idx]));
      }
      shouldAdd = isNewFullSyncAlignment;
    } else {
      const isNew = !result.some((r2) => r2.some((v2, idx) => v2 !== void 0 && v2 === lineAlignment[idx]));
      shouldAdd = isNew;
    }
    if (shouldAdd) {
      result.push(lineAlignment);
    } else {
      if (m2.length.isGreaterThan(new TextLength(1, 0))) {
        result.push([
          m2.output1Pos ? m2.output1Pos.lineNumber + 1 : void 0,
          m2.inputPos.lineNumber + 1,
          m2.output2Pos ? m2.output2Pos.lineNumber + 1 : void 0
        ]);
      }
    }
  }
  const finalLineAlignment = [m.input1Range.endLineNumberExclusive, m.baseRange.endLineNumberExclusive, m.input2Range.endLineNumberExclusive];
  result = result.filter((r2) => r2.every((v2, idx) => v2 !== finalLineAlignment[idx]));
  result.push(finalLineAlignment);
  assertFn(
    () => checkAdjacentItems(result.map((r2) => r2[0]).filter(isDefined), (a, b) => a < b) && checkAdjacentItems(result.map((r2) => r2[1]).filter(isDefined), (a, b) => a <= b) && checkAdjacentItems(result.map((r2) => r2[2]).filter(isDefined), (a, b) => a < b) && result.every((alignment) => alignment.filter(isDefined).length >= 2)
  );
  return result;
}

function toEqualRangeMappings(diffs, inputRange, outputRange) {
  const result = [];
  let equalRangeInputStart = inputRange.getStartPosition();
  let equalRangeOutputStart = outputRange.getStartPosition();
  for (const d of diffs) {
    const equalRangeMapping2 = new RangeMapping3(
      Range2.fromPositions(equalRangeInputStart, d.inputRange.getStartPosition()),
      Range2.fromPositions(equalRangeOutputStart, d.outputRange.getStartPosition())
    );
    assertFn(
      () => lengthOfRange(equalRangeMapping2.inputRange).equals(
        lengthOfRange(equalRangeMapping2.outputRange)
      )
    );
    if (!equalRangeMapping2.inputRange.isEmpty()) {
      result.push(equalRangeMapping2);
    }
    equalRangeInputStart = d.inputRange.getEndPosition();
    equalRangeOutputStart = d.outputRange.getEndPosition();
  }
  const equalRangeMapping = new RangeMapping3(
    Range2.fromPositions(equalRangeInputStart, inputRange.getEndPosition()),
    Range2.fromPositions(equalRangeOutputStart, outputRange.getEndPosition())
  );
  assertFn(
    () => lengthOfRange(equalRangeMapping.inputRange).equals(
      lengthOfRange(equalRangeMapping.outputRange)
    )
  );
  if (!equalRangeMapping.inputRange.isEmpty()) {
    result.push(equalRangeMapping);
  }
  return result;
}

function splitUpCommonEqualRangeMappings(equalRangeMappings1, equalRangeMappings2) {
  const result = [];
  const events = [];
  for (const [input, rangeMappings] of [[0, equalRangeMappings1], [1, equalRangeMappings2]]) {
    for (const rangeMapping of rangeMappings) {
      events.push({
        input,
        start: true,
        inputPos: rangeMapping.inputRange.getStartPosition(),
        outputPos: rangeMapping.outputRange.getStartPosition()
      });
      events.push({
        input,
        start: false,
        inputPos: rangeMapping.inputRange.getEndPosition(),
        outputPos: rangeMapping.outputRange.getEndPosition()
      });
    }
  }
  events.sort(compareBy((m) => m.inputPos, Position.compare));
  const starts = [void 0, void 0];
  let lastInputPos;
  for (const event of events) {
    if (lastInputPos && starts.some((s) => !!s)) {
      const length = lengthBetweenPositions2(lastInputPos, event.inputPos);
      if (!length.isZero()) {
        result.push({
          inputPos: lastInputPos,
          length,
          output1Pos: starts[0],
          output2Pos: starts[1]
        });
        if (starts[0]) {
          starts[0] = addLength(starts[0], length);
        }
        if (starts[1]) {
          starts[1] = addLength(starts[1], length);
        }
      }
    }
    starts[event.input] = event.start ? event.outputPos : void 0;
    lastInputPos = event.inputPos;
  }
  return result;
}
export { getAlignments, toEqualRangeMappings, splitUpCommonEqualRangeMappings };
