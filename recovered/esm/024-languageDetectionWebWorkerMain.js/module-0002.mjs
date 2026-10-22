// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/languageDetection/browser/languageDetectionWebWorkerMain.js
// Original module marker: src/vs/nls.ts



// src/vs/nls.ts
function getNLSLanguage() {
  return globalThis._VSCODE_NLS_LANGUAGE;
}

var isPseudo = getNLSLanguage() === "pseudo" || typeof document !== "undefined" && document.location && typeof document.location.hash === "string" && document.location.hash.indexOf("pseudo=true") >= 0;
export { getNLSLanguage, isPseudo };
