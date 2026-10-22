// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/assert.ts
import { BugIndicatingError, onUnexpectedError } from "./module-0004.mjs";


// src/vs/base/common/assert.ts
function ok(value2, message) {
  if (!value2) {
    throw new Error(message ? `Assertion failed (${message})` : "Assertion Failed");
  }
}

function assertNever(value2, message = "Unreachable") {
  throw new Error(message);
}

function softAssertNever(value2) {
}

function assert(condition, messageOrError = "unexpected state") {
  if (!condition) {
    const errorToThrow = typeof messageOrError === "string" ? new BugIndicatingError(`Assertion Failed: ${messageOrError}`) : messageOrError;
    throw errorToThrow;
  }
}

function softAssert(condition, message = "Soft Assertion Failed") {
  if (!condition) {
    onUnexpectedError(new BugIndicatingError(message));
  }
}

function assertFn(condition) {
  if (!condition()) {
    debugger;
    condition();
    onUnexpectedError(new BugIndicatingError("Assertion Failed"));
  }
}

function checkAdjacentItems(items, predicate) {
  let i2 = 0;
  while (i2 < items.length - 1) {
    const a = items[i2];
    const b = items[i2 + 1];
    if (!predicate(a, b)) {
      return false;
    }
    i2++;
  }
  return true;
}
export { ok, assertNever, softAssertNever, assert, softAssert, assertFn, checkAdjacentItems };
