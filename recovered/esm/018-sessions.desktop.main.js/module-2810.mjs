// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchCompare.ts
import { isSearchTreeFileMatch, isSearchTreeFolderMatch, isSearchTreeMatch } from "./module-2519.mjs";
import { isSearchTreeAIFileMatch } from "./module-2806.mjs";
import { compareFileExtensions, compareFileNames, comparePaths } from "./module-1521.mjs";
import { isIMatchInNotebook } from "./module-2809.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/search/browser/searchCompare.ts
var elemAIndex = -1;

var elemBIndex = -1;

function searchMatchComparer(elementA, elementB, sortOrder = "default" /* Default */) {
  if (isSearchTreeFileMatch(elementA) && isSearchTreeFolderMatch(elementB)) {
    return 1;
  }
  if (isSearchTreeFileMatch(elementB) && isSearchTreeFolderMatch(elementA)) {
    return -1;
  }
  if (isSearchTreeFolderMatch(elementA) && isSearchTreeFolderMatch(elementB)) {
    elemAIndex = elementA.index();
    elemBIndex = elementB.index();
    if (elemAIndex !== -1 && elemBIndex !== -1) {
      return elemAIndex - elemBIndex;
    }
    if (isSearchTreeAIFileMatch(elementA) && isSearchTreeAIFileMatch(elementB)) {
      return elementA.rank - elementB.rank;
    }
    switch (sortOrder) {
      case "countDescending" /* CountDescending */:
        return elementB.count() - elementA.count();
      case "countAscending" /* CountAscending */:
        return elementA.count() - elementB.count();
      case "type" /* Type */:
        return compareFileExtensions(elementA.name(), elementB.name());
      case "fileNames" /* FileNames */:
        return compareFileNames(elementA.name(), elementB.name());
      // Fall through otherwise
      default:
        if (!elementA.resource || !elementB.resource) {
          return 0;
        }
        return comparePaths(elementA.resource.fsPath, elementB.resource.fsPath) || compareFileNames(elementA.name(), elementB.name());
    }
  }
  if (isSearchTreeFileMatch(elementA) && isSearchTreeFileMatch(elementB)) {
    switch (sortOrder) {
      case "countDescending" /* CountDescending */:
        return elementB.count() - elementA.count();
      case "countAscending" /* CountAscending */:
        return elementA.count() - elementB.count();
      case "type" /* Type */:
        return compareFileExtensions(elementA.name(), elementB.name());
      case "fileNames" /* FileNames */:
        return compareFileNames(elementA.name(), elementB.name());
      case "modified" /* Modified */: {
        const fileStatA = elementA.fileStat;
        const fileStatB = elementB.fileStat;
        if (fileStatA && fileStatB) {
          return fileStatB.mtime - fileStatA.mtime;
        }
      }
      // Fall through otherwise
      default:
        return comparePaths(elementA.resource.fsPath, elementB.resource.fsPath) || compareFileNames(elementA.name(), elementB.name());
    }
  }
  if (isIMatchInNotebook(elementA) && isIMatchInNotebook(elementB)) {
    return compareNotebookPos(elementA, elementB);
  }
  if (isSearchTreeMatch(elementA) && isSearchTreeMatch(elementB)) {
    return Range2.compareRangesUsingStarts(elementA.range(), elementB.range());
  }
  return 0;
}

function compareNotebookPos(match1, match2) {
  if (match1.cellIndex === match2.cellIndex) {
    if (match1.webviewIndex !== void 0 && match2.webviewIndex !== void 0) {
      return match1.webviewIndex - match2.webviewIndex;
    } else if (match1.webviewIndex === void 0 && match2.webviewIndex === void 0) {
      return Range2.compareRangesUsingStarts(match1.range(), match2.range());
    } else {
      if (match1.webviewIndex !== void 0) {
        return 1;
      } else {
        return -1;
      }
    }
  } else if (match1.cellIndex < match2.cellIndex) {
    return -1;
  } else {
    return 1;
  }
}
export { searchMatchComparer, compareNotebookPos, elemAIndex, elemBIndex };
