// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/languageSelector.ts
import { normalize } from "./module-0026.mjs";
import { match } from "./module-0857.mjs";


// src/vs/editor/common/languageSelector.ts
function score2(selector, candidateUri, candidateLanguage, candidateIsSynchronized, candidateNotebookUri, candidateNotebookType) {
  if (Array.isArray(selector)) {
    let ret = 0;
    for (const filter2 of selector) {
      const value2 = score2(filter2, candidateUri, candidateLanguage, candidateIsSynchronized, candidateNotebookUri, candidateNotebookType);
      if (value2 === 10) {
        return value2;
      }
      if (value2 > ret) {
        ret = value2;
      }
    }
    return ret;
  } else if (typeof selector === "string") {
    if (!candidateIsSynchronized) {
      return 0;
    }
    if (selector === "*") {
      return 5;
    } else if (selector === candidateLanguage) {
      return 10;
    } else {
      return 0;
    }
  } else if (selector) {
    const { language: language2, pattern, scheme, hasAccessToAllModels, notebookType } = selector;
    if (!candidateIsSynchronized && !hasAccessToAllModels) {
      return 0;
    }
    if (notebookType && candidateNotebookUri) {
      candidateUri = candidateNotebookUri;
    }
    let ret = 0;
    if (scheme) {
      if (scheme === candidateUri.scheme) {
        ret = 10;
      } else if (scheme === "*") {
        ret = 5;
      } else {
        return 0;
      }
    }
    if (language2) {
      if (language2 === candidateLanguage) {
        ret = 10;
      } else if (language2 === "*") {
        ret = Math.max(ret, 5);
      } else {
        return 0;
      }
    }
    if (notebookType) {
      if (notebookType === candidateNotebookType) {
        ret = 10;
      } else if (notebookType === "*" && candidateNotebookType !== void 0) {
        ret = Math.max(ret, 5);
      } else {
        return 0;
      }
    }
    if (pattern) {
      let normalizedPattern;
      if (typeof pattern === "string") {
        normalizedPattern = pattern;
      } else {
        normalizedPattern = { ...pattern, base: normalize(pattern.base) };
      }
      if (normalizedPattern === candidateUri.fsPath || match(normalizedPattern, candidateUri.fsPath)) {
        ret = 10;
      } else {
        return 0;
      }
    }
    return ret;
  } else {
    return 0;
  }
}

function selectLanguageIds(selector, into) {
  if (typeof selector === "string") {
    into.add(selector);
  } else if (Array.isArray(selector)) {
    for (const item of selector) {
      selectLanguageIds(item, into);
    }
  } else {
    const language2 = selector.language;
    if (language2) {
      into.add(language2);
    }
  }
}
export { score2, selectLanguageIds };
