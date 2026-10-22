// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/diff/externalLinesDiffComputer.ts
import { resolveAmdNodeModulePath } from "./module-0191.mjs";
import { ensureDependenciesAreSet } from "./module-0194.mjs";
import { StringText } from "./module-0177.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { LineRangeMapping, RangeMapping, lineRangeMappingFromRangeMappings } from "./module-0179.mjs";
import { LineRange } from "./module-0174.mjs";
import { LinesDiff, MovedText } from "./module-0173.mjs";


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
  computeDiff(originalLines, modifiedLines, options3) {
    ensureDependenciesAreSet();
    const originalText = new StringText(originalLines.join("\n"));
    const modifiedText = new StringText(modifiedLines.join("\n"));
    const result = this._computer.computeDiff(originalText.value, modifiedText.value, {
      // TODO: this currently throws
      ignoreTrimWhitespace: true,
      // ignoreTrimWhitespace: options.ignoreTrimWhitespace,
      // TODO: support this. Currently throws with "Time is not implemented in this environment."
      // maxComputationTimeMs: options.maxComputationTimeMs,
      computeMoves: options3.computeMoves,
      extendToSubwords: options3.extendToSubwords
    });
    const originalTransformer = originalText.getTransformer();
    const modifiedTransformer = modifiedText.getTransformer();
    const rangeMappings = [];
    let delta2 = 0;
    for (const r2 of result.edits.replacements) {
      const modifiedStart = r2.range.start + delta2;
      const modifiedEndExclusive = modifiedStart + r2.newText.length;
      const originalRange = originalTransformer.getRange(new OffsetRange(r2.range.start, r2.range.endExclusive));
      const modifiedRange = modifiedTransformer.getRange(new OffsetRange(modifiedStart, modifiedEndExclusive));
      rangeMappings.push(new RangeMapping(originalRange, modifiedRange));
      delta2 += r2.newText.length - (r2.range.endExclusive - r2.range.start);
    }
    const changes = lineRangeMappingFromRangeMappings(rangeMappings, originalText, modifiedText);
    const moves = [];
    if (options3.computeMoves) {
      for (const move2 of result.moves) {
        const originalStartPos = originalTransformer.getPosition(move2.range.original.start);
        const originalEndPos = originalTransformer.getPosition(move2.range.original.endExclusive);
        const modifiedStartPos = modifiedTransformer.getPosition(move2.range.modified.start);
        const modifiedEndPos = modifiedTransformer.getPosition(move2.range.modified.endExclusive);
        const originalLineRange = new LineRange(originalStartPos.lineNumber, originalEndPos.lineNumber);
        const modifiedLineRange = new LineRange(modifiedStartPos.lineNumber, modifiedEndPos.lineNumber);
        moves.push(new MovedText(new LineRangeMapping(originalLineRange, modifiedLineRange), []));
      }
    }
    return new LinesDiff(changes, moves, result.hitTimeout);
  }
};
export { loadExternalModule, loadExternalComputer, getExternalLinesDiffComputer, externalModulePromise, externalDiffComputerPromise, externalWasmDiffComputerPromise, ExternalLinesDiffComputer };
