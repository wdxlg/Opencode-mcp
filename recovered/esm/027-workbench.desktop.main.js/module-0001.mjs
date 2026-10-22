// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/nls.ts



// src/vs/nls.ts
function getNLSMessages() {
  return globalThis._VSCODE_NLS_MESSAGES;
}

function getNLSLanguage() {
  return globalThis._VSCODE_NLS_LANGUAGE;
}

var isPseudo = getNLSLanguage() === "pseudo" || typeof document !== "undefined" && document.location && typeof document.location.hash === "string" && document.location.hash.indexOf("pseudo=true") >= 0;

function _format(message, args2) {
  let result;
  if (args2.length === 0) {
    result = message;
  } else {
    result = message.replace(/\{(\d+)\}/g, (match2, rest) => {
      const index2 = parseInt(rest, 10);
      const arg = args2[index2];
      let result2 = match2;
      if (typeof arg === "string") {
        result2 = arg;
      } else if (typeof arg === "number" || typeof arg === "boolean" || arg === void 0 || arg === null) {
        result2 = String(arg);
      }
      return result2;
    });
  }
  if (isPseudo) {
    result = "\uFF3B" + result.replace(/[aouei]/g, "$&$&") + "\uFF3D";
  }
  return result;
}

function localize(data, message, ...args2) {
  if (typeof data === "number") {
    return _format(lookupMessage(data, message), args2);
  }
  return _format(message, args2);
}

function lookupMessage(index2, fallback2) {
  const message = getNLSMessages()?.[index2];
  if (typeof message !== "string") {
    if (typeof fallback2 === "string") {
      return fallback2;
    }
    throw new Error(`!!! NLS MISSING: ${index2} !!!`);
  }
  return message;
}

function localize2(data, originalMessage, ...args2) {
  let message;
  if (typeof data === "number") {
    message = lookupMessage(data, originalMessage);
  } else {
    message = originalMessage;
  }
  const value2 = _format(message, args2);
  return {
    value: value2,
    original: originalMessage === message ? value2 : _format(originalMessage, args2)
  };
}
export { getNLSMessages, getNLSLanguage, _format, localize, lookupMessage, localize2, isPseudo };
