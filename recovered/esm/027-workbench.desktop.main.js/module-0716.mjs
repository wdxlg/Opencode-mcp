// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/utils.ts
import { Permutation, compareBy } from "./module-0007.mjs";
import { Range2 } from "./module-0106.mjs";
import { TextEdit2 } from "./module-0178.mjs";
import { getPositionOffsetTransformerFromTextModel } from "./module-0715.mjs";
import { observableValue } from "./module-0048.mjs";
import { autorun } from "./module-0052.mjs";
import { transaction } from "./module-0045.mjs";
import { bindContextKey } from "./module-0444.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/utils.ts
var array = [];

function getReadonlyEmptyArray() {
  return array;
}

function getEndPositionsAfterApplying(edits) {
  const newRanges = getModifiedRangesAfterApplying(edits);
  return newRanges.map((range2) => range2.getEndPosition());
}

function getModifiedRangesAfterApplying(edits) {
  const sortPerm = Permutation.createSortPermutation(edits, compareBy((e) => e.range, Range2.compareRangesUsingStarts));
  const edit3 = new TextEdit2(sortPerm.apply(edits));
  const sortedNewRanges = edit3.getNewRanges();
  return sortPerm.inverse().apply(sortedNewRanges);
}

function removeTextReplacementCommonSuffixPrefix(edits, textModel) {
  const transformer = getPositionOffsetTransformerFromTextModel(textModel);
  const text2 = textModel.getValue();
  const stringReplacements = edits.map((edit3) => transformer.getStringReplacement(edit3));
  const minimalStringReplacements = stringReplacements.map((replacement) => replacement.removeCommonSuffixPrefix(text2));
  return minimalStringReplacements.map((replacement) => transformer.getTextReplacement(replacement));
}

function convertItemsToStableObservables(items, store) {
  const result = observableValue("result", []);
  const innerObservables = [];
  store.add(autorun((reader) => {
    const itemsValue = items.read(reader);
    transaction((tx) => {
      if (itemsValue.length !== innerObservables.length) {
        innerObservables.length = itemsValue.length;
        for (let i2 = 0; i2 < innerObservables.length; i2++) {
          if (!innerObservables[i2]) {
            innerObservables[i2] = observableValue("item", itemsValue[i2]);
          }
        }
        result.set([...innerObservables], tx);
      }
      innerObservables.forEach((o, i2) => o.set(itemsValue[i2], tx));
    });
  }));
  return result;
}

var ObservableContextKeyService = class {
  constructor(_contextKeyService) {
    this._contextKeyService = _contextKeyService;
  }
  bind(key3, obs) {
    return bindContextKey(key3, this._contextKeyService, obs instanceof Function ? obs : (reader) => obs.read(reader));
  }
};

function wait(ms, cancellationToken) {
  return new Promise((resolve3) => {
    let d = void 0;
    const handle2 = setTimeout(() => {
      if (d) {
        d.dispose();
      }
      resolve3();
    }, ms);
    if (cancellationToken) {
      d = cancellationToken.onCancellationRequested(() => {
        clearTimeout(handle2);
        if (d) {
          d.dispose();
        }
        resolve3();
      });
    }
  });
}

var ErrorResult = class _ErrorResult {
  constructor(error, message = void 0) {
    this.error = error;
    this.message = message;
  }
  static message(message) {
    return new _ErrorResult(void 0, message);
  }
  static is(obj) {
    return obj instanceof _ErrorResult;
  }
  logError() {
    if (this.message) {
      console.error(`ErrorResult: ${this.message}`, this.error);
    } else {
      console.error(`ErrorResult: An unexpected error-case occurred, usually caused by invalid input.`, this.error);
    }
  }
};
export { getReadonlyEmptyArray, getEndPositionsAfterApplying, getModifiedRangesAfterApplying, removeTextReplacementCommonSuffixPrefix, convertItemsToStableObservables, wait, array, ObservableContextKeyService, ErrorResult };
