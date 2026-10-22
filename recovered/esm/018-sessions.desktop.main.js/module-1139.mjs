// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/utils.ts
import { DisposableStore } from "./module-0012.mjs";
import { autorunOpts } from "./module-0052.mjs";
import { ArrayQueue, CompareResult } from "./module-0007.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/utils.ts
function setStyle(element, style) {
  Object.entries(style).forEach(([key3, value2]) => {
    element.style.setProperty(key3, toSize(value2));
  });
}

function toSize(value2) {
  return typeof value2 === "number" ? `${value2}px` : value2;
}

function applyObservableDecorations2(editor, decorations) {
  const d = new DisposableStore();
  let decorationIds = [];
  d.add(autorunOpts({ debugName: () => `Apply decorations from ${decorations.debugName}` }, (reader) => {
    const d2 = decorations.read(reader);
    editor.changeDecorations((a) => {
      decorationIds = a.deltaDecorations(decorationIds, d2);
    });
  }));
  d.add({
    dispose: () => {
      editor.changeDecorations((a) => {
        decorationIds = a.deltaDecorations(decorationIds, []);
      });
    }
  });
  return d;
}

function* leftJoin(left, right, compare6) {
  const rightQueue = new ArrayQueue(right);
  for (const leftElement of left) {
    rightQueue.takeWhile((rightElement) => CompareResult.isGreaterThan(compare6(leftElement, rightElement)));
    const equals5 = rightQueue.takeWhile((rightElement) => CompareResult.isNeitherLessOrGreaterThan(compare6(leftElement, rightElement)));
    yield { left: leftElement, rights: equals5 || [] };
  }
}

function* join3(left, right, compare6) {
  const rightQueue = new ArrayQueue(right);
  for (const leftElement of left) {
    const skipped = rightQueue.takeWhile((rightElement) => CompareResult.isGreaterThan(compare6(leftElement, rightElement)));
    if (skipped) {
      yield { rights: skipped };
    }
    const equals5 = rightQueue.takeWhile((rightElement) => CompareResult.isNeitherLessOrGreaterThan(compare6(leftElement, rightElement)));
    yield { left: leftElement, rights: equals5 || [] };
  }
}

function setFields(obj, fields) {
  return Object.assign(obj, fields);
}

function deepMerge(source1, source2) {
  const result = {};
  for (const key3 in source1) {
    result[key3] = source1[key3];
  }
  for (const key3 in source2) {
    const source2Value = source2[key3];
    if (typeof result[key3] === "object" && source2Value && typeof source2Value === "object") {
      result[key3] = deepMerge(result[key3], source2Value);
    } else {
      result[key3] = source2Value;
    }
  }
  return result;
}

var PersistentStore = class {
  constructor(key3, storageService) {
    this.key = key3;
    this.storageService = storageService;
    this.hasValue = false;
    this.value = void 0;
  }
  get() {
    if (!this.hasValue) {
      const value2 = this.storageService.get(this.key, 0 /* PROFILE */);
      if (value2 !== void 0) {
        try {
          this.value = JSON.parse(value2);
        } catch (e4) {
          onUnexpectedError(e4);
        }
      }
      this.hasValue = true;
    }
    return this.value;
  }
  set(newValue) {
    this.value = newValue;
    this.storageService.store(
      this.key,
      JSON.stringify(this.value),
      0 /* PROFILE */,
      0 /* USER */
    );
  }
};

PersistentStore = __decorateClass([
  __decorateParam(1, IStorageService)
], PersistentStore);
export { setStyle, toSize, applyObservableDecorations2, leftJoin, join3, setFields, deepMerge, PersistentStore };
