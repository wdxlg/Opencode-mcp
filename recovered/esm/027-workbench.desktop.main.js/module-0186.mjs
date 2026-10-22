// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/diff/defaultLinesDiffComputer/computeMovedLines.ts
import { compareBy, numberComparator, pushMany, reverseOrder } from "./module-0007.mjs";
import { LineRangeFragment, isSpace } from "./module-0182.mjs";
import { LineRangeMapping } from "./module-0179.mjs";
import { SetMap } from "./module-0008.mjs";
import { LineRange, LineRangeSet } from "./module-0174.mjs";
import { MonotonousArray, findLastMonotonous } from "./module-0006.mjs";
import { MyersDiffAlgorithm } from "./module-0184.mjs";
import { LinesSliceCharSequence } from "./module-0185.mjs";
import { Range2 } from "./module-0106.mjs";
import { SequenceDiff } from "./module-0181.mjs";


// src/vs/editor/common/diff/defaultLinesDiffComputer/computeMovedLines.ts
function computeMovedLines(changes, originalLines, modifiedLines, hashedOriginalLines, hashedModifiedLines, timeout2) {
  let { moves, excludedChanges } = computeMovesFromSimpleDeletionsToSimpleInsertions(changes, originalLines, modifiedLines, timeout2);
  if (!timeout2.isValid()) {
    return [];
  }
  const filteredChanges = changes.filter((c) => !excludedChanges.has(c));
  const unchangedMoves = computeUnchangedMoves(filteredChanges, hashedOriginalLines, hashedModifiedLines, originalLines, modifiedLines, timeout2);
  pushMany(moves, unchangedMoves);
  moves = joinCloseConsecutiveMoves(moves);
  moves = moves.filter((current) => {
    const lines = current.original.toOffsetRange().slice(originalLines).map((l) => l.trim());
    const originalText = lines.join("\n");
    return originalText.length >= 15 && countWhere(lines, (l) => l.length >= 2) >= 2;
  });
  moves = removeMovesInSameDiff(changes, moves);
  return moves;
}

function countWhere(arr, predicate) {
  let count2 = 0;
  for (const t2 of arr) {
    if (predicate(t2)) {
      count2++;
    }
  }
  return count2;
}

function computeMovesFromSimpleDeletionsToSimpleInsertions(changes, originalLines, modifiedLines, timeout2) {
  const moves = [];
  const deletions = changes.filter((c) => c.modified.isEmpty && c.original.length >= 3).map((d) => new LineRangeFragment(d.original, originalLines, d));
  const insertions = new Set(changes.filter((c) => c.original.isEmpty && c.modified.length >= 3).map((d) => new LineRangeFragment(d.modified, modifiedLines, d)));
  const excludedChanges = /* @__PURE__ */ new Set();
  for (const deletion of deletions) {
    let highestSimilarity = -1;
    let best;
    for (const insertion of insertions) {
      const similarity = deletion.computeSimilarity(insertion);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        best = insertion;
      }
    }
    if (highestSimilarity > 0.9 && best) {
      insertions.delete(best);
      moves.push(new LineRangeMapping(deletion.range, best.range));
      excludedChanges.add(deletion.source);
      excludedChanges.add(best.source);
    }
    if (!timeout2.isValid()) {
      return { moves, excludedChanges };
    }
  }
  return { moves, excludedChanges };
}

function computeUnchangedMoves(changes, hashedOriginalLines, hashedModifiedLines, originalLines, modifiedLines, timeout2) {
  const moves = [];
  const original3LineHashes = new SetMap();
  for (const change of changes) {
    for (let i2 = change.original.startLineNumber; i2 < change.original.endLineNumberExclusive - 2; i2++) {
      const key3 = `${hashedOriginalLines[i2 - 1]}:${hashedOriginalLines[i2 + 1 - 1]}:${hashedOriginalLines[i2 + 2 - 1]}`;
      original3LineHashes.add(key3, { range: new LineRange(i2, i2 + 3) });
    }
  }
  const possibleMappings = [];
  changes.sort(compareBy((c) => c.modified.startLineNumber, numberComparator));
  for (const change of changes) {
    let lastMappings = [];
    for (let i2 = change.modified.startLineNumber; i2 < change.modified.endLineNumberExclusive - 2; i2++) {
      const key3 = `${hashedModifiedLines[i2 - 1]}:${hashedModifiedLines[i2 + 1 - 1]}:${hashedModifiedLines[i2 + 2 - 1]}`;
      const currentModifiedRange = new LineRange(i2, i2 + 3);
      const nextMappings = [];
      original3LineHashes.forEach(key3, ({ range: range2 }) => {
        for (const lastMapping of lastMappings) {
          if (lastMapping.originalLineRange.endLineNumberExclusive + 1 === range2.endLineNumberExclusive && lastMapping.modifiedLineRange.endLineNumberExclusive + 1 === currentModifiedRange.endLineNumberExclusive) {
            lastMapping.originalLineRange = new LineRange(lastMapping.originalLineRange.startLineNumber, range2.endLineNumberExclusive);
            lastMapping.modifiedLineRange = new LineRange(lastMapping.modifiedLineRange.startLineNumber, currentModifiedRange.endLineNumberExclusive);
            nextMappings.push(lastMapping);
            return;
          }
        }
        const mapping2 = {
          modifiedLineRange: currentModifiedRange,
          originalLineRange: range2
        };
        possibleMappings.push(mapping2);
        nextMappings.push(mapping2);
      });
      lastMappings = nextMappings;
    }
    if (!timeout2.isValid()) {
      return [];
    }
  }
  possibleMappings.sort(reverseOrder(compareBy((m) => m.modifiedLineRange.length, numberComparator)));
  const modifiedSet = new LineRangeSet();
  const originalSet = new LineRangeSet();
  for (const mapping2 of possibleMappings) {
    const diffOrigToMod = mapping2.modifiedLineRange.startLineNumber - mapping2.originalLineRange.startLineNumber;
    const modifiedSections = modifiedSet.subtractFrom(mapping2.modifiedLineRange);
    const originalTranslatedSections = originalSet.subtractFrom(mapping2.originalLineRange).getWithDelta(diffOrigToMod);
    const modifiedIntersectedSections = modifiedSections.getIntersection(originalTranslatedSections);
    for (const s of modifiedIntersectedSections.ranges) {
      if (s.length < 3) {
        continue;
      }
      const modifiedLineRange = s;
      const originalLineRange = s.delta(-diffOrigToMod);
      moves.push(new LineRangeMapping(originalLineRange, modifiedLineRange));
      modifiedSet.addRange(modifiedLineRange);
      originalSet.addRange(originalLineRange);
    }
  }
  moves.sort(compareBy((m) => m.original.startLineNumber, numberComparator));
  const monotonousChanges = new MonotonousArray(changes);
  for (let i2 = 0; i2 < moves.length; i2++) {
    const move2 = moves[i2];
    const firstTouchingChangeOrig = monotonousChanges.findLastMonotonous((c) => c.original.startLineNumber <= move2.original.startLineNumber);
    const firstTouchingChangeMod = findLastMonotonous(changes, (c) => c.modified.startLineNumber <= move2.modified.startLineNumber);
    const linesAbove = Math.max(
      move2.original.startLineNumber - firstTouchingChangeOrig.original.startLineNumber,
      move2.modified.startLineNumber - firstTouchingChangeMod.modified.startLineNumber
    );
    const lastTouchingChangeOrig = monotonousChanges.findLastMonotonous((c) => c.original.startLineNumber < move2.original.endLineNumberExclusive);
    const lastTouchingChangeMod = findLastMonotonous(changes, (c) => c.modified.startLineNumber < move2.modified.endLineNumberExclusive);
    const linesBelow = Math.max(
      lastTouchingChangeOrig.original.endLineNumberExclusive - move2.original.endLineNumberExclusive,
      lastTouchingChangeMod.modified.endLineNumberExclusive - move2.modified.endLineNumberExclusive
    );
    let extendToTop;
    for (extendToTop = 0; extendToTop < linesAbove; extendToTop++) {
      const origLine = move2.original.startLineNumber - extendToTop - 1;
      const modLine = move2.modified.startLineNumber - extendToTop - 1;
      if (origLine > originalLines.length || modLine > modifiedLines.length) {
        break;
      }
      if (modifiedSet.contains(modLine) || originalSet.contains(origLine)) {
        break;
      }
      if (!areLinesSimilar(originalLines[origLine - 1], modifiedLines[modLine - 1], timeout2)) {
        break;
      }
    }
    if (extendToTop > 0) {
      originalSet.addRange(new LineRange(move2.original.startLineNumber - extendToTop, move2.original.startLineNumber));
      modifiedSet.addRange(new LineRange(move2.modified.startLineNumber - extendToTop, move2.modified.startLineNumber));
    }
    let extendToBottom;
    for (extendToBottom = 0; extendToBottom < linesBelow; extendToBottom++) {
      const origLine = move2.original.endLineNumberExclusive + extendToBottom;
      const modLine = move2.modified.endLineNumberExclusive + extendToBottom;
      if (origLine > originalLines.length || modLine > modifiedLines.length) {
        break;
      }
      if (modifiedSet.contains(modLine) || originalSet.contains(origLine)) {
        break;
      }
      if (!areLinesSimilar(originalLines[origLine - 1], modifiedLines[modLine - 1], timeout2)) {
        break;
      }
    }
    if (extendToBottom > 0) {
      originalSet.addRange(new LineRange(move2.original.endLineNumberExclusive, move2.original.endLineNumberExclusive + extendToBottom));
      modifiedSet.addRange(new LineRange(move2.modified.endLineNumberExclusive, move2.modified.endLineNumberExclusive + extendToBottom));
    }
    if (extendToTop > 0 || extendToBottom > 0) {
      moves[i2] = new LineRangeMapping(
        new LineRange(move2.original.startLineNumber - extendToTop, move2.original.endLineNumberExclusive + extendToBottom),
        new LineRange(move2.modified.startLineNumber - extendToTop, move2.modified.endLineNumberExclusive + extendToBottom)
      );
    }
  }
  return moves;
}

function areLinesSimilar(line1, line2, timeout2) {
  if (line1.trim() === line2.trim()) {
    return true;
  }
  if (line1.length > 300 && line2.length > 300) {
    return false;
  }
  const myersDiffingAlgorithm = new MyersDiffAlgorithm();
  const result = myersDiffingAlgorithm.compute(
    new LinesSliceCharSequence([line1], new Range2(1, 1, 1, line1.length), false),
    new LinesSliceCharSequence([line2], new Range2(1, 1, 1, line2.length), false),
    timeout2
  );
  let commonNonSpaceCharCount = 0;
  const inverted = SequenceDiff.invert(result.diffs, line1.length);
  for (const seq of inverted) {
    seq.seq1Range.forEach((idx) => {
      if (!isSpace(line1.charCodeAt(idx))) {
        commonNonSpaceCharCount++;
      }
    });
  }
  function countNonWsChars(str) {
    let count2 = 0;
    for (let i2 = 0; i2 < line1.length; i2++) {
      if (!isSpace(str.charCodeAt(i2))) {
        count2++;
      }
    }
    return count2;
  }
  const longerLineLength = countNonWsChars(line1.length > line2.length ? line1 : line2);
  const r2 = commonNonSpaceCharCount / longerLineLength > 0.6 && longerLineLength > 10;
  return r2;
}

function joinCloseConsecutiveMoves(moves) {
  if (moves.length === 0) {
    return moves;
  }
  moves.sort(compareBy((m) => m.original.startLineNumber, numberComparator));
  const result = [moves[0]];
  for (let i2 = 1; i2 < moves.length; i2++) {
    const last = result[result.length - 1];
    const current = moves[i2];
    const originalDist = current.original.startLineNumber - last.original.endLineNumberExclusive;
    const modifiedDist = current.modified.startLineNumber - last.modified.endLineNumberExclusive;
    const currentMoveAfterLast = originalDist >= 0 && modifiedDist >= 0;
    if (currentMoveAfterLast && originalDist + modifiedDist <= 2) {
      result[result.length - 1] = last.join(current);
      continue;
    }
    result.push(current);
  }
  return result;
}

function removeMovesInSameDiff(changes, moves) {
  const changesMonotonous = new MonotonousArray(changes);
  moves = moves.filter((m) => {
    const diffBeforeEndOfMoveOriginal = changesMonotonous.findLastMonotonous((c) => c.original.startLineNumber < m.original.endLineNumberExclusive) || new LineRangeMapping(new LineRange(1, 1), new LineRange(1, 1));
    const diffBeforeEndOfMoveModified = findLastMonotonous(changes, (c) => c.modified.startLineNumber < m.modified.endLineNumberExclusive);
    const differentDiffs = diffBeforeEndOfMoveOriginal !== diffBeforeEndOfMoveModified;
    return differentDiffs;
  });
  return moves;
}
export { computeMovedLines, countWhere, computeMovesFromSimpleDeletionsToSimpleInsertions, computeUnchangedMoves, areLinesSimilar, joinCloseConsecutiveMoves, removeMovesInSameDiff };
