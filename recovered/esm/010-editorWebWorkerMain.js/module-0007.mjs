// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/editor/common/services/editorWebWorkerMain.js
// Original module marker: src/vs/base/common/types.ts



// src/vs/base/common/types.ts
function isString(str) {
  return typeof str === "string";
}

function isIterable(obj) {
  return !!obj && typeof obj[Symbol.iterator] === "function";
}
export { isString, isIterable };
