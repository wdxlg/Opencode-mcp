// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/services/editorWebWorker.ts
import { WorkerTextModelSyncServer } from "./module-0202.mjs";
import { UnicodeTextModelHighlighter } from "./module-0172.mjs";
import { findSectionHeaders } from "./module-0199.mjs";
import { DiffComputer } from "./module-0180.mjs";
import { Range2 } from "./module-0106.mjs";
import { stringDiff } from "./module-0166.mjs";
import { Position } from "./module-0079.mjs";
import { linesDiffComputers } from "./module-0196.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { computeLinks } from "./module-0167.mjs";
import { computeDefaultDocumentColors } from "./module-0198.mjs";
import { StopWatch } from "./module-0016.mjs";
import { BasicInplaceReplace } from "./module-0168.mjs";
import { createMonacoBaseAPI } from "./module-0170.mjs";
import { ensureDependenciesAreSet } from "./module-0194.mjs";
import { StringText } from "./module-0177.mjs";
import { DetailedLineRangeMapping } from "./module-0179.mjs";


// src/vs/editor/common/services/editorWebWorker.ts
var EditorWorker = class _EditorWorker {
  constructor(_foreignModule = null) {
    this._foreignModule = _foreignModule;
    this._requestHandlerBrand = void 0;
    this._workerTextModelSyncServer = new WorkerTextModelSyncServer();
  }
  dispose() {
  }
  async $ping() {
    return "pong";
  }
  _getModel(uri4) {
    return this._workerTextModelSyncServer.getModel(uri4);
  }
  getModels() {
    return this._workerTextModelSyncServer.getModels();
  }
  $acceptNewModel(data) {
    this._workerTextModelSyncServer.$acceptNewModel(data);
  }
  $acceptModelChanged(uri4, e4) {
    this._workerTextModelSyncServer.$acceptModelChanged(uri4, e4);
  }
  $acceptRemovedModel(uri4) {
    this._workerTextModelSyncServer.$acceptRemovedModel(uri4);
  }
  async $computeUnicodeHighlights(url, options3, range2) {
    const model = this._getModel(url);
    if (!model) {
      return { ranges: [], hasMore: false, ambiguousCharacterCount: 0, invisibleCharacterCount: 0, nonBasicAsciiCharacterCount: 0 };
    }
    return UnicodeTextModelHighlighter.computeUnicodeHighlights(model, options3, range2);
  }
  async $findSectionHeaders(url, options3) {
    const model = this._getModel(url);
    if (!model) {
      return [];
    }
    return findSectionHeaders(model, options3);
  }
  // ---- BEGIN diff --------------------------------------------------------------------------
  async $computeDiff(originalUrl, modifiedUrl, options3, algorithm) {
    const original = this._getModel(originalUrl);
    const modified = this._getModel(modifiedUrl);
    if (!original || !modified) {
      return null;
    }
    const diffAlgorithm = await resolveLinesDiffComputer(algorithm);
    const result = _EditorWorker.computeDiff(original, modified, options3, diffAlgorithm);
    return result;
  }
  static computeDiff(originalTextModel, modifiedTextModel, options3, diffAlgorithm) {
    const originalLines = originalTextModel.getLinesContent();
    const modifiedLines = modifiedTextModel.getLinesContent();
    const result = diffAlgorithm.computeDiff(originalLines, modifiedLines, options3);
    const identical = result.changes.length > 0 ? false : this._modelsAreIdentical(originalTextModel, modifiedTextModel);
    function getLineChanges(changes) {
      return changes.map((m) => [m.original.startLineNumber, m.original.endLineNumberExclusive, m.modified.startLineNumber, m.modified.endLineNumberExclusive, m.innerChanges?.map((m2) => [
        m2.originalRange.startLineNumber,
        m2.originalRange.startColumn,
        m2.originalRange.endLineNumber,
        m2.originalRange.endColumn,
        m2.modifiedRange.startLineNumber,
        m2.modifiedRange.startColumn,
        m2.modifiedRange.endLineNumber,
        m2.modifiedRange.endColumn
      ])]);
    }
    return {
      identical,
      quitEarly: result.hitTimeout,
      changes: getLineChanges(result.changes),
      moves: result.moves.map((m) => [
        m.lineRangeMapping.original.startLineNumber,
        m.lineRangeMapping.original.endLineNumberExclusive,
        m.lineRangeMapping.modified.startLineNumber,
        m.lineRangeMapping.modified.endLineNumberExclusive,
        getLineChanges(m.changes)
      ])
    };
  }
  static _modelsAreIdentical(original, modified) {
    const originalLineCount = original.getLineCount();
    const modifiedLineCount = modified.getLineCount();
    if (originalLineCount !== modifiedLineCount) {
      return false;
    }
    for (let line = 1; line <= originalLineCount; line++) {
      const originalLine = original.getLineContent(line);
      const modifiedLine = modified.getLineContent(line);
      if (originalLine !== modifiedLine) {
        return false;
      }
    }
    return true;
  }
  async $computeDirtyDiff(originalUrl, modifiedUrl, ignoreTrimWhitespace) {
    const original = this._getModel(originalUrl);
    const modified = this._getModel(modifiedUrl);
    if (!original || !modified) {
      return null;
    }
    const originalLines = original.getLinesContent();
    const modifiedLines = modified.getLinesContent();
    const diffComputer = new DiffComputer(originalLines, modifiedLines, {
      shouldComputeCharChanges: false,
      shouldPostProcessCharChanges: false,
      shouldIgnoreTrimWhitespace: ignoreTrimWhitespace,
      shouldMakePrettyDiff: true,
      maxComputationTime: 1e3
    });
    return diffComputer.computeDiff().changes;
  }
  async $computeStringDiff(original, modified, options3, algorithm) {
    return (await computeStringDiff(original, modified, options3, algorithm)).toJson();
  }
  static {
    // ---- END diff --------------------------------------------------------------------------
    // ---- BEGIN minimal edits ---------------------------------------------------------------
    this._diffLimit = 1e5;
  }
  async $computeMoreMinimalEdits(modelUrl, edits, pretty2) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return edits;
    }
    const result = [];
    let lastEol = void 0;
    edits = edits.slice(0).sort((a, b) => {
      if (a.range && b.range) {
        return Range2.compareRangesUsingStarts(a.range, b.range);
      }
      const aRng = a.range ? 0 : 1;
      const bRng = b.range ? 0 : 1;
      return aRng - bRng;
    });
    let writeIndex = 0;
    for (let readIndex = 1; readIndex < edits.length; readIndex++) {
      if (Range2.getEndPosition(edits[writeIndex].range).equals(Range2.getStartPosition(edits[readIndex].range))) {
        edits[writeIndex].range = Range2.fromPositions(Range2.getStartPosition(edits[writeIndex].range), Range2.getEndPosition(edits[readIndex].range));
        edits[writeIndex].text += edits[readIndex].text;
      } else {
        writeIndex++;
        edits[writeIndex] = edits[readIndex];
      }
    }
    edits.length = writeIndex + 1;
    for (let { range: range2, text: text2, eol } of edits) {
      if (typeof eol === "number") {
        lastEol = eol;
      }
      if (Range2.isEmpty(range2) && !text2) {
        continue;
      }
      const original = model.getValueInRange(range2);
      text2 = text2.replace(/\r\n|\n|\r/g, model.eol);
      if (original === text2) {
        continue;
      }
      if (Math.max(text2.length, original.length) > _EditorWorker._diffLimit) {
        result.push({ range: range2, text: text2 });
        continue;
      }
      const changes = stringDiff(original, text2, pretty2);
      const editOffset = model.offsetAt(Range2.lift(range2).getStartPosition());
      for (const change of changes) {
        const start = model.positionAt(editOffset + change.originalStart);
        const end = model.positionAt(editOffset + change.originalStart + change.originalLength);
        const newEdit = {
          text: text2.substr(change.modifiedStart, change.modifiedLength),
          range: { startLineNumber: start.lineNumber, startColumn: start.column, endLineNumber: end.lineNumber, endColumn: end.column }
        };
        if (model.getValueInRange(newEdit.range) !== newEdit.text) {
          result.push(newEdit);
        }
      }
    }
    if (typeof lastEol === "number") {
      result.push({ eol: lastEol, text: "", range: { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 } });
    }
    return result;
  }
  $computeHumanReadableDiff(modelUrl, edits, options3) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return edits;
    }
    const result = [];
    let lastEol = void 0;
    edits = edits.slice(0).sort((a, b) => {
      if (a.range && b.range) {
        return Range2.compareRangesUsingStarts(a.range, b.range);
      }
      const aRng = a.range ? 0 : 1;
      const bRng = b.range ? 0 : 1;
      return aRng - bRng;
    });
    for (let { range: range2, text: text2, eol } of edits) {
      let addPositions = function(pos1, pos2) {
        return new Position(pos1.lineNumber + pos2.lineNumber - 1, pos2.lineNumber === 1 ? pos1.column + pos2.column - 1 : pos2.column);
      }, getText = function(lines, range3) {
        const result2 = [];
        for (let i2 = range3.startLineNumber; i2 <= range3.endLineNumber; i2++) {
          const line = lines[i2 - 1];
          if (i2 === range3.startLineNumber && i2 === range3.endLineNumber) {
            result2.push(line.substring(range3.startColumn - 1, range3.endColumn - 1));
          } else if (i2 === range3.startLineNumber) {
            result2.push(line.substring(range3.startColumn - 1));
          } else if (i2 === range3.endLineNumber) {
            result2.push(line.substring(0, range3.endColumn - 1));
          } else {
            result2.push(line);
          }
        }
        return result2;
      };
      if (typeof eol === "number") {
        lastEol = eol;
      }
      if (Range2.isEmpty(range2) && !text2) {
        continue;
      }
      const original = model.getValueInRange(range2);
      text2 = text2.replace(/\r\n|\n|\r/g, model.eol);
      if (original === text2) {
        continue;
      }
      if (Math.max(text2.length, original.length) > _EditorWorker._diffLimit) {
        result.push({ range: range2, text: text2 });
        continue;
      }
      const originalLines = original.split(/\r\n|\n|\r/);
      const modifiedLines = text2.split(/\r\n|\n|\r/);
      const diff4 = linesDiffComputers.getDefault().computeDiff(originalLines, modifiedLines, options3);
      const start = Range2.lift(range2).getStartPosition();
      for (const c of diff4.changes) {
        if (c.innerChanges) {
          for (const x of c.innerChanges) {
            result.push({
              range: Range2.fromPositions(
                addPositions(start, x.originalRange.getStartPosition()),
                addPositions(start, x.originalRange.getEndPosition())
              ),
              text: getText(modifiedLines, x.modifiedRange).join(model.eol)
            });
          }
        } else {
          throw new BugIndicatingError("The experimental diff algorithm always produces inner changes");
        }
      }
    }
    if (typeof lastEol === "number") {
      result.push({ eol: lastEol, text: "", range: { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 } });
    }
    return result;
  }
  // ---- END minimal edits ---------------------------------------------------------------
  async $computeLinks(modelUrl) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return null;
    }
    return computeLinks(model);
  }
  // --- BEGIN default document colors -----------------------------------------------------------
  async $computeDefaultDocumentColors(modelUrl) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return null;
    }
    return computeDefaultDocumentColors(model);
  }
  static {
    // ---- BEGIN suggest --------------------------------------------------------------------------
    this._suggestionsLimit = 1e4;
  }
  async $textualSuggest(modelUrls, leadingWord, wordDef, wordDefFlags) {
    const sw = new StopWatch();
    const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
    const seen = /* @__PURE__ */ new Set();
    outer: for (const url of modelUrls) {
      const model = this._getModel(url);
      if (!model) {
        continue;
      }
      for (const word of model.words(wordDefRegExp)) {
        if (word === leadingWord || !isNaN(Number(word))) {
          continue;
        }
        seen.add(word);
        if (seen.size > _EditorWorker._suggestionsLimit) {
          break outer;
        }
      }
    }
    return { words: Array.from(seen), duration: sw.elapsed() };
  }
  // ---- END suggest --------------------------------------------------------------------------
  //#region -- word ranges --
  async $computeWordRanges(modelUrl, range2, wordDef, wordDefFlags) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return /* @__PURE__ */ Object.create(null);
    }
    const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
    const result = /* @__PURE__ */ Object.create(null);
    for (let line = range2.startLineNumber; line < range2.endLineNumber; line++) {
      const words = model.getLineWords(line, wordDefRegExp);
      for (const word of words) {
        if (!isNaN(Number(word.word))) {
          continue;
        }
        let array3 = result[word.word];
        if (!array3) {
          array3 = [];
          result[word.word] = array3;
        }
        array3.push({
          startLineNumber: line,
          startColumn: word.startColumn,
          endLineNumber: line,
          endColumn: word.endColumn
        });
      }
    }
    return result;
  }
  //#endregion
  async $navigateValueSet(modelUrl, range2, up, wordDef, wordDefFlags) {
    const model = this._getModel(modelUrl);
    if (!model) {
      return null;
    }
    const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
    if (range2.startColumn === range2.endColumn) {
      range2 = {
        startLineNumber: range2.startLineNumber,
        startColumn: range2.startColumn,
        endLineNumber: range2.endLineNumber,
        endColumn: range2.endColumn + 1
      };
    }
    const selectionText = model.getValueInRange(range2);
    const wordRange = model.getWordAtPosition({ lineNumber: range2.startLineNumber, column: range2.startColumn }, wordDefRegExp);
    if (!wordRange) {
      return null;
    }
    const word = model.getValueInRange(wordRange);
    const result = BasicInplaceReplace.INSTANCE.navigateValueSet(range2, selectionText, wordRange, word, up);
    return result;
  }
  // ---- BEGIN foreign module support --------------------------------------------------------------------------
  // foreign method request
  $fmr(method, args2) {
    if (!this._foreignModule || typeof this._foreignModule[method] !== "function") {
      return Promise.reject(new Error("Missing requestHandler or method: " + method));
    }
    try {
      return Promise.resolve(this._foreignModule[method].apply(this._foreignModule, args2));
    } catch (e4) {
      return Promise.reject(e4);
    }
  }
  // ---- END foreign module support --------------------------------------------------------------------------
};

if (typeof importScripts === "function") {
  globalThis.monaco = createMonacoBaseAPI();
}

function resolveLinesDiffComputer(algorithm) {
  switch (algorithm) {
    case "legacy":
      return linesDiffComputers.getLegacy();
    case "advanced":
      return linesDiffComputers.getDefault();
    case "advanced-external":
      return linesDiffComputers.getAdvancedExternal();
    case "advanced-wasm":
      return linesDiffComputers.getAdvancedWasm();
  }
}

async function computeStringDiff(original, modified, options3, algorithm) {
  const diffAlgorithm = await resolveLinesDiffComputer(algorithm);
  ensureDependenciesAreSet();
  const originalText = new StringText(original);
  const originalLines = originalText.getLines();
  const modifiedText = new StringText(modified);
  const modifiedLines = modifiedText.getLines();
  const result = diffAlgorithm.computeDiff(originalLines, modifiedLines, { ignoreTrimWhitespace: false, maxComputationTimeMs: options3.maxComputationTimeMs, computeMoves: false, extendToSubwords: false });
  const textEdit = DetailedLineRangeMapping.toTextEdit(result.changes, modifiedText);
  const strEdit = originalText.getTransformer().getStringEdit(textEdit);
  return strEdit;
}
export { resolveLinesDiffComputer, computeStringDiff, EditorWorker };
