// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalCompletionModel.ts
import { SimpleCompletionModel } from "./module-3227.mjs";
import { isString } from "./module-0010.mjs";
import { count } from "./module-0030.mjs";
import { isWindows } from "./module-0014.mjs";


// src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalCompletionModel.ts
var TerminalCompletionModel = class extends SimpleCompletionModel {
  constructor(items, lineContext) {
    super(items, lineContext, compareCompletionsFn);
  }
};

var compareCompletionsFn = (leadingLineContent, a, b) => {
  if (a.completion.kind === 101 /* InlineSuggestionAlwaysOnTop */ && a.completion.kind !== b.completion.kind) {
    return -1;
  }
  if (b.completion.kind === 101 /* InlineSuggestionAlwaysOnTop */ && a.completion.kind !== b.completion.kind) {
    return 1;
  }
  let score3 = b.score[0] - a.score[0];
  if (score3 !== 0) {
    return score3;
  }
  if (a.completion.kind === 100 /* InlineSuggestion */ && a.completion.kind !== b.completion.kind) {
    return -1;
  }
  if (b.completion.kind === 100 /* InlineSuggestion */ && a.completion.kind !== b.completion.kind) {
    return 1;
  }
  if (a.punctuationPenalty !== b.punctuationPenalty) {
    return a.punctuationPenalty - b.punctuationPenalty;
  }
  const isArg = leadingLineContent.includes(" ");
  if (!isArg && a.completion.kind === 0 /* File */ && b.completion.kind === 0 /* File */) {
    if (a.labelLowExcludeFileExt !== b.labelLowExcludeFileExt) {
      return a.labelLowExcludeFileExt.localeCompare(b.labelLowExcludeFileExt, void 0, { ignorePunctuation: true });
    }
    score3 = a.labelLowExcludeFileExt.length - b.labelLowExcludeFileExt.length;
    if (score3 !== 0) {
      return score3;
    }
    score3 = fileExtScore(b.fileExtLow) - fileExtScore(a.fileExtLow);
    if (score3 !== 0) {
      return score3;
    }
    score3 = a.fileExtLow.length - b.fileExtLow.length;
    if (score3 !== 0) {
      return score3;
    }
  }
  if (a.completion.kind === 4 /* Argument */ && b.completion.kind === 4 /* Argument */ && /^\s*git\b/.test(leadingLineContent)) {
    const aLabel = isString(a.completion.label) ? a.completion.label : a.completion.label.label;
    const bLabel = isString(b.completion.label) ? b.completion.label : b.completion.label.label;
    const aIsMainOrMaster = aLabel === "main" || aLabel === "master";
    const bIsMainOrMaster = bLabel === "main" || bLabel === "master";
    if (aIsMainOrMaster && !bIsMainOrMaster) {
      return -1;
    }
    if (bIsMainOrMaster && !aIsMainOrMaster) {
      return 1;
    }
  }
  if (a.completion.kind === 2 /* Method */ && b.completion.kind === 2 /* Method */) {
    if (!isString(a.completion.label) && a.completion.label.description && !isString(b.completion.label) && b.completion.label.description) {
      score3 = 0;
    } else if (!isString(a.completion.label) && a.completion.label.description) {
      score3 = -2;
    } else if (!isString(b.completion.label) && b.completion.label.description) {
      score3 = 2;
    }
    score3 += (b.completion.detail ? 1 : 0) + (b.completion.documentation ? 2 : 0) - (a.completion.detail ? 1 : 0) - (a.completion.documentation ? 2 : 0);
    if (score3 !== 0) {
      return score3;
    }
  }
  if (a.completion.kind === 1 /* Folder */ && b.completion.kind === 1 /* Folder */) {
    if (a.labelLowNormalizedPath && b.labelLowNormalizedPath) {
      score3 = count(a.labelLowNormalizedPath, "/") - count(b.labelLowNormalizedPath, "/");
      if (score3 !== 0) {
        return score3;
      }
      if (b.labelLowNormalizedPath.startsWith(a.labelLowNormalizedPath)) {
        return -1;
      }
      if (a.labelLowNormalizedPath.startsWith(b.labelLowNormalizedPath)) {
        return 1;
      }
    }
  }
  if (a.completion.kind !== b.completion.kind) {
    if ((a.completion.kind === 2 /* Method */ || a.completion.kind === 3 /* Alias */) && (b.completion.kind !== 2 /* Method */ && b.completion.kind !== 3 /* Alias */)) {
      return -1;
    }
    if ((b.completion.kind === 2 /* Method */ || b.completion.kind === 3 /* Alias */) && (a.completion.kind !== 2 /* Method */ && a.completion.kind !== 3 /* Alias */)) {
      return 1;
    }
    if (a.completion.kind === 4 /* Argument */ && b.completion.kind !== 4 /* Argument */) {
      return -1;
    }
    if (b.completion.kind === 4 /* Argument */ && a.completion.kind !== 4 /* Argument */) {
      return 1;
    }
    if (isResourceKind(a.completion.kind) && !isResourceKind(b.completion.kind)) {
      return 1;
    }
    if (isResourceKind(b.completion.kind) && !isResourceKind(a.completion.kind)) {
      return -1;
    }
  }
  return a.labelLow.localeCompare(b.labelLow, void 0, { ignorePunctuation: true });
};

var isResourceKind = (kind) => kind === 0 /* File */ || kind === 1 /* Folder */ || kind === 8 /* SymbolicLinkFile */ || kind === 9 /* SymbolicLinkFolder */;

var fileExtScores = new Map(isWindows ? [
  // Windows - .ps1 > .exe > .bat > .cmd. This is the command precedence when running the files
  //           without an extension, tested manually in pwsh v7.4.4
  ["ps1", 0.09],
  ["exe", 0.08],
  ["bat", 0.07],
  ["cmd", 0.07],
  ["msi", 0.06],
  ["com", 0.06],
  // Non-Windows
  ["sh", -0.05],
  ["bash", -0.05],
  ["zsh", -0.05],
  ["fish", -0.05],
  ["csh", -0.06],
  // C shell
  ["ksh", -0.06]
  // Korn shell
  // Scripting language files are excluded here as the standard behavior on Windows will just open
  // the file in a text editor, not run the file
] : [
  // Pwsh
  ["ps1", 0.05],
  // Windows
  ["bat", -0.05],
  ["cmd", -0.05],
  ["exe", -0.05],
  // Non-Windows
  ["sh", 0.05],
  ["bash", 0.05],
  ["zsh", 0.05],
  ["fish", 0.05],
  ["csh", 0.04],
  // C shell
  ["ksh", 0.04],
  // Korn shell
  // Scripting languages
  ["py", 0.05],
  // Python
  ["pl", 0.05]
  // Perl
]);

function fileExtScore(ext) {
  return fileExtScores.get(ext) || 0;
}
export { fileExtScore, TerminalCompletionModel, compareCompletionsFn, isResourceKind, fileExtScores };
