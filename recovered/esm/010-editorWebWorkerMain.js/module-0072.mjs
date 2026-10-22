// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/editor/common/services/editorWebWorkerMain.js
// Original module marker: src/vs/editor/common/diff/externalLinesDiffComputer.ts
import { resolveAmdNodeModulePath } from "./module-0068.mjs";
import { ensureDependenciesAreSet } from "./module-0071.mjs";
import { StringText } from "./module-0053.mjs";
import { OffsetRange } from "./module-0049.mjs";
import { LineRangeMapping, RangeMapping, lineRangeMappingFromRangeMappings } from "./module-0055.mjs";
import { LineRange } from "./module-0050.mjs";
import { LinesDiff, MovedText } from "./module-0048.mjs";


// src/vs/editor/common/diff/externalLinesDiffComputer.ts
var externalModulePromise;

var externalDiffComputerPromise;

var externalWasmDiffComputerPromise;

function loadExternalModule() {
  if (!externalModulePromise) {
    const url = resolveAmdNodeModulePath("@vscode/diff", "dist/index.js");
    externalModulePromise = import(
      /* webpackIgnore: true */
      /* @vite-ignore */
      `${url}`
    );
  }
  return externalModulePromise;
}

function loadExternalComputer(useWasm) {
  if (useWasm) {
    if (!externalWasmDiffComputerPromise) {
      externalWasmDiffComputerPromise = loadExternalModule().then((m) => m.createDiffComputer({ useWasm: true }));
    }
    return externalWasmDiffComputerPromise;
  }
  if (!externalDiffComputerPromise) {
    externalDiffComputerPromise = loadExternalModule().then((m) => m.createDiffComputer({ useWasm: false }));
  }
  return externalDiffComputerPromise;
}

async function getExternalLinesDiffComputer(useWasm) {
  const computer = await loadExternalComputer(useWasm);
  return new ExternalLinesDiffComputer(computer);
}

var ExternalLinesDiffComputer = class {
  constructor(_computer) {
    this._computer = _computer;
  }
  computeDiff(originalLines, modifiedLines, options) {
    ensureDependenciesAreSet();
    const originalText = new StringText(originalLines.join("\n"));
    const modifiedText = new StringText(modifiedLines.join("\n"));
    const result = this._computer.computeDiff(originalText.value, modifiedText.value, {
      // TODO: this currently throws
      ignoreTrimWhitespace: true,
      // ignoreTrimWhitespace: options.ignoreTrimWhitespace,
      // TODO: support this. Currently throws with "Time is not implemented in this environment."
      // maxComputationTimeMs: options.maxComputationTimeMs,
      computeMoves: options.computeMoves,
      extendToSubwords: options.extendToSubwords
    });
    const originalTransformer = originalText.getTransformer();
    const modifiedTransformer = modifiedText.getTransformer();
    const rangeMappings = [];
    let delta = 0;
    for (const r of result.edits.replacements) {
      const modifiedStart = r.range.start + delta;
      const modifiedEndExclusive = modifiedStart + r.newText.length;
      const originalRange = originalTransformer.getRange(new OffsetRange(r.range.start, r.range.endExclusive));
      const modifiedRange = modifiedTransformer.getRange(new OffsetRange(modifiedStart, modifiedEndExclusive));
      rangeMappings.push(new RangeMapping(originalRange, modifiedRange));
      delta += r.newText.length - (r.range.endExclusive - r.range.start);
    }
    const changes = lineRangeMappingFromRangeMappings(rangeMappings, originalText, modifiedText);
    const moves = [];
    if (options.computeMoves) {
      for (const move of result.moves) {
        const originalStartPos = originalTransformer.getPosition(move.range.original.start);
        const originalEndPos = originalTransformer.getPosition(move.range.original.endExclusive);
        const modifiedStartPos = modifiedTransformer.getPosition(move.range.modified.start);
        const modifiedEndPos = modifiedTransformer.getPosition(move.range.modified.endExclusive);
        const originalLineRange = new LineRange(originalStartPos.lineNumber, originalEndPos.lineNumber);
        const modifiedLineRange = new LineRange(modifiedStartPos.lineNumber, modifiedEndPos.lineNumber);
        moves.push(new MovedText(new LineRangeMapping(originalLineRange, modifiedLineRange), []));
      }
    }
    return new LinesDiff(changes, moves, result.hitTimeout);
  }
};
export { loadExternalModule, loadExternalComputer, getExternalLinesDiffComputer, externalModulePromise, externalDiffComputerPromise, externalWasmDiffComputerPromise, ExternalLinesDiffComputer };
