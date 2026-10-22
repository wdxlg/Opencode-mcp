// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/browser/indexTransformer.ts



// src/vs/workbench/services/textMate/browser/indexTransformer.ts
var MonotonousIndexTransformer = class _MonotonousIndexTransformer {
  constructor(transformation) {
    this.transformation = transformation;
    this.idx = 0;
    this.offset = 0;
  }
  static fromMany(transformations) {
    const transformers = transformations.map((t2) => new _MonotonousIndexTransformer(t2));
    return new CombinedIndexTransformer(transformers);
  }
  /**
   * Precondition: index >= previous-value-of(index).
   */
  transform(index2) {
    let nextChange = this.transformation.replacements.at(this.idx);
    while (nextChange && nextChange.replaceRange.endExclusive <= index2) {
      this.offset += nextChange.getLengthDelta();
      this.idx++;
      nextChange = this.transformation.replacements.at(this.idx);
    }
    if (nextChange && nextChange.replaceRange.start <= index2) {
      return void 0;
    }
    return index2 + this.offset;
  }
};

var CombinedIndexTransformer = class {
  constructor(transformers) {
    this.transformers = transformers;
  }
  transform(index2) {
    for (const transformer of this.transformers) {
      const result = transformer.transform(index2);
      if (result === void 0) {
        return void 0;
      }
      index2 = result;
    }
    return index2;
  }
};
export { MonotonousIndexTransformer, CombinedIndexTransformer };
