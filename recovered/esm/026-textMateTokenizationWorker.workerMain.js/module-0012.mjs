// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/base/common/types.ts



// src/vs/base/common/types.ts
function isString(str) {
  return typeof str === "string";
}

function isIterable(obj) {
  return !!obj && typeof obj[Symbol.iterator] === "function";
}

function isUndefined(obj) {
  return typeof obj === "undefined";
}

function isDefined(arg) {
  return !isUndefinedOrNull(arg);
}

function isUndefinedOrNull(obj) {
  return isUndefined(obj) || obj === null;
}
export { isString, isIterable, isUndefined, isDefined, isUndefinedOrNull };
