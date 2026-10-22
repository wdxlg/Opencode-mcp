// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/folding/browser/syntaxRangeProvider.ts
import { DisposableStore } from "./module-0012.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { FoldingRegions, MAX_LINE_NUMBER } from "./module-0678.mjs";


// src/vs/editor/contrib/folding/browser/syntaxRangeProvider.ts
var foldingContext = {};

var ID_SYNTAX_PROVIDER = "syntax";

var SyntaxRangeProvider = class {
  constructor(editorModel, providers2, handleFoldingRangesChange, foldingRangesLimit, fallbackRangeProvider) {
    this.editorModel = editorModel;
    this.providers = providers2;
    this.handleFoldingRangesChange = handleFoldingRangesChange;
    this.foldingRangesLimit = foldingRangesLimit;
    this.fallbackRangeProvider = fallbackRangeProvider;
    this.id = ID_SYNTAX_PROVIDER;
    this.disposables = new DisposableStore();
    if (fallbackRangeProvider) {
      this.disposables.add(fallbackRangeProvider);
    }
    for (const provider of providers2) {
      if (typeof provider.onDidChange === "function") {
        this.disposables.add(provider.onDidChange(handleFoldingRangesChange));
      }
    }
  }
  compute(cancellationToken) {
    return collectSyntaxRanges(this.providers, this.editorModel, cancellationToken).then((ranges) => {
      if (this.editorModel.isDisposed()) {
        return null;
      }
      if (ranges) {
        const res = sanitizeRanges(ranges, this.foldingRangesLimit);
        return res;
      }
      return this.fallbackRangeProvider?.compute(cancellationToken) ?? null;
    });
  }
  dispose() {
    this.disposables.dispose();
  }
};

function collectSyntaxRanges(providers2, model, cancellationToken) {
  let rangeData = null;
  const promises = providers2.map((provider, i2) => {
    return Promise.resolve(provider.provideFoldingRanges(model, foldingContext, cancellationToken)).then((ranges) => {
      if (cancellationToken.isCancellationRequested) {
        return;
      }
      if (Array.isArray(ranges)) {
        if (!Array.isArray(rangeData)) {
          rangeData = [];
        }
        const nLines = model.getLineCount();
        for (const r2 of ranges) {
          if (r2.start > 0 && r2.end > r2.start && r2.end <= nLines) {
            rangeData.push({ start: r2.start, end: r2.end, rank: i2, kind: r2.kind });
          }
        }
      }
    }, onUnexpectedExternalError);
  });
  return Promise.all(promises).then((_) => {
    return rangeData;
  });
}

var RangesCollector2 = class {
  constructor(foldingRangesLimit) {
    this._startIndexes = [];
    this._endIndexes = [];
    this._nestingLevels = [];
    this._nestingLevelCounts = [];
    this._types = [];
    this._length = 0;
    this._foldingRangesLimit = foldingRangesLimit;
  }
  add(startLineNumber, endLineNumber, type, nestingLevel) {
    if (startLineNumber > MAX_LINE_NUMBER || endLineNumber > MAX_LINE_NUMBER) {
      return;
    }
    const index2 = this._length;
    this._startIndexes[index2] = startLineNumber;
    this._endIndexes[index2] = endLineNumber;
    this._nestingLevels[index2] = nestingLevel;
    this._types[index2] = type;
    this._length++;
    if (nestingLevel < 30) {
      this._nestingLevelCounts[nestingLevel] = (this._nestingLevelCounts[nestingLevel] || 0) + 1;
    }
  }
  toIndentRanges() {
    const limit = this._foldingRangesLimit.limit;
    if (this._length <= limit) {
      this._foldingRangesLimit.update(this._length, false);
      const startIndexes = new Uint32Array(this._length);
      const endIndexes = new Uint32Array(this._length);
      for (let i2 = 0; i2 < this._length; i2++) {
        startIndexes[i2] = this._startIndexes[i2];
        endIndexes[i2] = this._endIndexes[i2];
      }
      return new FoldingRegions(startIndexes, endIndexes, this._types);
    } else {
      this._foldingRangesLimit.update(this._length, limit);
      let entries2 = 0;
      let maxLevel = this._nestingLevelCounts.length;
      for (let i2 = 0; i2 < this._nestingLevelCounts.length; i2++) {
        const n2 = this._nestingLevelCounts[i2];
        if (n2) {
          if (n2 + entries2 > limit) {
            maxLevel = i2;
            break;
          }
          entries2 += n2;
        }
      }
      const startIndexes = new Uint32Array(limit);
      const endIndexes = new Uint32Array(limit);
      const types = [];
      for (let i2 = 0, k = 0; i2 < this._length; i2++) {
        const level = this._nestingLevels[i2];
        if (level < maxLevel || level === maxLevel && entries2++ < limit) {
          startIndexes[k] = this._startIndexes[i2];
          endIndexes[k] = this._endIndexes[i2];
          types[k] = this._types[i2];
          k++;
        }
      }
      return new FoldingRegions(startIndexes, endIndexes, types);
    }
  }
};

function sanitizeRanges(rangeData, foldingRangesLimit) {
  const sorted = rangeData.sort((d1, d2) => {
    let diff4 = d1.start - d2.start;
    if (diff4 === 0) {
      diff4 = d1.rank - d2.rank;
    }
    return diff4;
  });
  const collector = new RangesCollector2(foldingRangesLimit);
  let top2 = void 0;
  const previous = [];
  for (const entry of sorted) {
    if (!top2) {
      top2 = entry;
      collector.add(entry.start, entry.end, entry.kind && entry.kind.value, previous.length);
    } else {
      if (entry.start > top2.start) {
        if (entry.end <= top2.end) {
          previous.push(top2);
          top2 = entry;
          collector.add(entry.start, entry.end, entry.kind && entry.kind.value, previous.length);
        } else {
          if (entry.start > top2.end) {
            do {
              top2 = previous.pop();
            } while (top2 && entry.start > top2.end);
            if (top2) {
              previous.push(top2);
            }
            top2 = entry;
          }
          collector.add(entry.start, entry.end, entry.kind && entry.kind.value, previous.length);
        }
      }
    }
  }
  return collector.toIndentRanges();
}
export { collectSyntaxRanges, sanitizeRanges, foldingContext, ID_SYNTAX_PROVIDER, SyntaxRangeProvider, RangesCollector2 };
