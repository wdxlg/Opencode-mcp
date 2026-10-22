// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchCompare.ts
import { createParentList, isSearchTreeFileMatch, isSearchTreeFolderMatch, isSearchTreeMatch } from "./module-2545.mjs";
import { isSearchTreeAIFileMatch } from "./module-2831.mjs";
import { compareFileExtensions, compareFileNames, comparePaths } from "./module-1529.mjs";
import { isIMatchInNotebook } from "./module-2834.mjs";
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

function searchComparer(elementA, elementB, sortOrder = "default" /* Default */) {
  const elemAParents = createParentList(elementA);
  const elemBParents = createParentList(elementB);
  let i2 = elemAParents.length - 1;
  let j = elemBParents.length - 1;
  while (i2 >= 0 && j >= 0) {
    if (elemAParents[i2].id() !== elemBParents[j].id()) {
      return searchMatchComparer(elemAParents[i2], elemBParents[j], sortOrder);
    }
    i2--;
    j--;
  }
  const elemAAtEnd = i2 === 0;
  const elemBAtEnd = j === 0;
  if (elemAAtEnd && !elemBAtEnd) {
    return 1;
  } else if (!elemAAtEnd && elemBAtEnd) {
    return -1;
  }
  return 0;
}
export { searchMatchComparer, compareNotebookPos, searchComparer, elemAIndex, elemBIndex };
