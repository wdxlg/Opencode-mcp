// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/search/common/searchNotebookHelpers.ts
import { TextSearchMatch } from "./module-0241.mjs";
import { Range } from "./module-0084.mjs";


// src/vs/workbench/contrib/search/common/searchNotebookHelpers.ts
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
    for (let i = firstLine; i <= lastLine; i++) {
      lineTexts.push(buffer.getLineContent(i));
    }
    return new TextSearchMatch(
      lineTexts.join("\n") + "\n",
      grouping.map((m) => new Range(m.range.startLineNumber - 1, m.range.startColumn - 1, m.range.endLineNumber - 1, m.range.endColumn - 1))
    );
  });
  return textSearchResults;
}
export { genericCellMatchesToTextSearchMatches };
