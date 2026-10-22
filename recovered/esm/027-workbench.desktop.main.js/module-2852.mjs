// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/notebookSearch/searchNotebookHelpers.ts
import { genericCellMatchesToTextSearchMatches, rawCellPrefix } from "./module-2850.mjs";
import { TextSearchMatch } from "./module-0999.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/search/browser/notebookSearch/searchNotebookHelpers.ts
function getIDFromINotebookCellMatch(match2) {
  if (isINotebookCellMatchWithModel(match2)) {
    return match2.cell.id;
  } else {
    return `${rawCellPrefix}${match2.index}`;
  }
}

function isINotebookFileMatchWithModel(object2) {
  return "cellResults" in object2 && object2.cellResults instanceof Array && object2.cellResults.every(isINotebookCellMatchWithModel);
}

function isINotebookCellMatchWithModel(object2) {
  return "cell" in object2;
}

function contentMatchesToTextSearchMatches(contentMatches, cell) {
  return genericCellMatchesToTextSearchMatches(
    contentMatches,
    cell.textBuffer
  );
}

function webviewMatchesToTextSearchMatches(webviewMatches) {
  return webviewMatches.map(
    (rawMatch) => rawMatch.searchPreviewInfo ? new TextSearchMatch(
      rawMatch.searchPreviewInfo.line,
      new Range2(0, rawMatch.searchPreviewInfo.range.start, 0, rawMatch.searchPreviewInfo.range.end),
      void 0,
      rawMatch.index
    ) : void 0
  ).filter((e) => !!e);
}
export { getIDFromINotebookCellMatch, isINotebookFileMatchWithModel, isINotebookCellMatchWithModel, contentMatchesToTextSearchMatches, webviewMatchesToTextSearchMatches };
