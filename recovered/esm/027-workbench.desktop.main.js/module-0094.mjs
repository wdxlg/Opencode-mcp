// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/errorMessage.ts
import { localize } from "./module-0001.mjs";
import { coalesce } from "./module-0007.mjs";
import { isString } from "./module-0010.mjs";


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
    const detail2 = error.detail;
    if (detail2.error) {
      return exceptionToErrorMessage(detail2.error, verbose);
    }
    if (detail2.exception) {
      return exceptionToErrorMessage(detail2.exception, verbose);
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

function isErrorWithActions(obj) {
  const candidate = obj;
  return candidate instanceof Error && Array.isArray(candidate.actions);
}

function createErrorWithActions(messageOrError, actions) {
  let error;
  if (typeof messageOrError === "string") {
    error = new Error(messageOrError);
  } else {
    error = messageOrError;
  }
  error.actions = actions;
  return error;
}
export { exceptionToErrorMessage, stackToString, detectSystemErrorMessage, toErrorMessage, isErrorWithActions, createErrorWithActions };
