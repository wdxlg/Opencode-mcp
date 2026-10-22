// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/common/searchNotebookHelpers.ts
import { TextSearchMatch } from "./module-1000.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/search/common/searchNotebookHelpers.ts
function isINotebookFileMatchNoModel(object2) {
  return "cellResults" in object2;
}

var rawCellPrefix = "rawCell#";

function genericCellMatchesToTextSearchMatches(contentMatches, buffer) {
  let previousEndLine = -1;
  const contextGroupings = [];
  let currentContextGrouping = [];
  contentMatches.forEach((match2) => {
    if (match2.range.startLineNumber !== previousEndLine) {
      if (currentContextGrouping.length > 0) {
        contextGroupings.push([...currentContextGrouping]);
        currentContextGrouping = [];
      }
    }
    currentContextGrouping.push(match2);
    previousEndLine = match2.range.endLineNumber;
  });
  if (currentContextGrouping.length > 0) {
    contextGroupings.push([...currentContextGrouping]);
  }
  const textSearchResults = contextGroupings.map((grouping) => {
    const lineTexts = [];
    const firstLine = grouping[0].range.startLineNumber;
    const lastLine = grouping[grouping.length - 1].range.endLineNumber;
    for (let i2 = firstLine; i2 <= lastLine; i2++) {
      lineTexts.push(buffer.getLineContent(i2));
    }
    return new TextSearchMatch(
      lineTexts.join("\n") + "\n",
      grouping.map((m) => new Range2(m.range.startLineNumber - 1, m.range.startColumn - 1, m.range.endLineNumber - 1, m.range.endColumn - 1))
    );
  });
  return textSearchResults;
}
export { isINotebookFileMatchNoModel, genericCellMatchesToTextSearchMatches, rawCellPrefix };
