// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditorLayoutDebug.ts
import { generateUuid } from "./module-0190.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { hasKey } from "./module-0010.mjs";


// src/vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditorLayoutDebug.ts
function isMultiDiffEditorLayoutDebugStateProvider(candidate) {
  return !!candidate && "getLayoutDebugState" in candidate && typeof candidate.getLayoutDebugState === "function";
}

function createMultiDiffEditorLayoutDebugModel(state, modelService, languageService) {
  let previousState = state.get();
  const id2 = generateUuid();
  const logModel = modelService.createModel(
    `${JSON.stringify({ timestamp: Date.now(), set: previousState })}
`,
    languageService.createById("jsonl"),
    URI.from({ scheme: Schemas.inMemory, path: `/multi-diff-editor-layout-${id2}.jsonl` })
  );
  const store = new DisposableStore();
  store.add(logModel.onWillDispose(() => store.dispose()));
  store.add(autorun((reader) => {
    const nextState = state.read(reader);
    const operations = createJsonPatch(previousState, nextState);
    if (!logModel.isDisposed() && operations.length > 0) {
      appendJsonLines(logModel, [{ timestamp: Date.now(), patch: operations }]);
    }
    previousState = nextState;
  }));
  return logModel;
}

function createJsonPatch(previous, next, path = []) {
  if (Object.is(previous, next)) {
    return [];
  }
  if (Array.isArray(previous) && Array.isArray(next)) {
    if (previous.length !== next.length) {
      return [{ op: "replace", path: toJsonPointer(path), value: next }];
    }
    const operations = [];
    for (let index2 = 0; index2 < previous.length; index2++) {
      appendJsonPatchOperations(operations, createJsonPatch(previous[index2], next[index2], [...path, index2]));
    }
    return operations;
  }
  if (isJsonObject(previous) && isJsonObject(next)) {
    const operations = [];
    for (const key3 of Object.keys(previous)) {
      if (!hasKey(next, { [key3]: true })) {
        operations.push({ op: "remove", path: toJsonPointer([...path, key3]) });
      }
    }
    for (const [key3, value2] of Object.entries(next)) {
      if (!hasKey(previous, { [key3]: true })) {
        if (value2 !== void 0) {
          operations.push({ op: "add", path: toJsonPointer([...path, key3]), value: value2 });
        }
      } else if (value2 !== void 0 && previous[key3] !== void 0) {
        appendJsonPatchOperations(operations, createJsonPatch(previous[key3], value2, [...path, key3]));
      }
    }
    return operations;
  }
  return [{ op: "replace", path: toJsonPointer(path), value: next }];
}

function appendJsonPatchOperations(target, patch2) {
  forEachJsonPatchOperation(patch2, (operation) => target.push(operation));
}

function forEachJsonPatchOperation(patch2, callback) {
  for (const entry of patch2) {
    if (isJsonPatch(entry)) {
      forEachJsonPatchOperation(entry, callback);
    } else {
      callback(entry);
    }
  }
}

function isJsonPatch(value2) {
  return Array.isArray(value2);
}

function appendJsonLines(model, values) {
  const end = model.getPositionAt(model.getValueLength());
  model.applyEdits([{
    range: { startLineNumber: end.lineNumber, startColumn: end.column, endLineNumber: end.lineNumber, endColumn: end.column },
    text: values.map((value2) => `${JSON.stringify(value2)}
`).join("")
  }]);
}

function isJsonObject(value2) {
  return typeof value2 === "object" && value2 !== null && !Array.isArray(value2);
}

function toJsonPointer(path) {
  return path.map((segment) => `/${String(segment).replaceAll("~", "~0").replaceAll("/", "~1")}`).join("");
}
export { isMultiDiffEditorLayoutDebugStateProvider, createMultiDiffEditorLayoutDebugModel, createJsonPatch, appendJsonPatchOperations, forEachJsonPatchOperation, isJsonPatch, appendJsonLines, isJsonObject, toJsonPointer };
