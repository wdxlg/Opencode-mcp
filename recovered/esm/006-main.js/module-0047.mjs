// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/errorMessage.ts
import { init_nls, localize } from "./module-0005.mjs";
import { coalesce, init_arrays } from "./module-0013.mjs";
import { init_types, isString } from "./module-0016.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/base/common/errorMessage.ts
function exceptionToErrorMessage(exception, verbose) {
  if (verbose && (exception.stack || exception.stacktrace)) {
    return localize(116, null, detectSystemErrorMessage(exception), stackToString(exception.stack) || stackToString(exception.stacktrace));
  }
  return detectSystemErrorMessage(exception);
}

function stackToString(stack) {
  if (Array.isArray(stack)) {
    return stack.join("\n");
  }
  return stack;
}

function detectSystemErrorMessage(exception) {
  if (exception.code === "ERR_UNC_HOST_NOT_ALLOWED") {
    return `${exception.message}. Please update the 'security.allowedUNCHosts' setting if you want to allow this host.`;
  }
  if (typeof exception.code === "string" && typeof exception.errno === "number" && typeof exception.syscall === "string") {
    return localize(115, null, exception.message);
  }
  return exception.message || localize(113, null);
}

function toErrorMessage(error = null, verbose = false) {
  if (!error) {
    return localize(113, null);
  }
  if (Array.isArray(error)) {
    const errors = coalesce(error);
    const msg = toErrorMessage(errors[0], verbose);
    if (errors.length > 1) {
      return localize(114, null, msg, errors.length);
    }
    return msg;
  }
  if (isString(error)) {
    return error;
  }
  if (error.detail) {
    const detail = error.detail;
    if (detail.error) {
      return exceptionToErrorMessage(detail.error, verbose);
    }
    if (detail.exception) {
      return exceptionToErrorMessage(detail.exception, verbose);
    }
  }
  if (error.stack) {
    return exceptionToErrorMessage(error, verbose);
  }
  if (error.message) {
    return error.message;
  }
  return localize(113, null);
}

var init_errorMessage = __esm({
  "src/vs/base/common/errorMessage.ts"() {
    init_arrays();
    init_types();
    init_nls();
  }
});
export { exceptionToErrorMessage, stackToString, detectSystemErrorMessage, toErrorMessage, init_errorMessage };
