// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/search/common/searchHelpers.ts
import { TextSearchMatch } from "./module-1000.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/services/search/common/searchHelpers.ts
function editorMatchToTextSearchResult(matches2, model, previewOptions) {
  const firstLine = matches2[0].range.startLineNumber;
  const lastLine = matches2[matches2.length - 1].range.endLineNumber;
  const lineTexts = [];
  for (let i2 = firstLine; i2 <= lastLine; i2++) {
    lineTexts.push(model.getLineContent(i2));
  }
  return new TextSearchMatch(
    lineTexts.join("\n") + "\n",
    matches2.map((m) => new Range2(m.range.startLineNumber - 1, m.range.startColumn - 1, m.range.endLineNumber - 1, m.range.endColumn - 1)),
    previewOptions
  );
}

function editorMatchesToTextSearchResults(matches2, model, previewOptions) {
  let previousEndLine = -1;
  const groupedMatches = [];
  let currentMatches = [];
  matches2.forEach((match2) => {
    if (match2.range.startLineNumber !== previousEndLine) {
      currentMatches = [];
      groupedMatches.push(currentMatches);
    }
    currentMatches.push(match2);
    previousEndLine = match2.range.endLineNumber;
  });
  return groupedMatches.map((sameLineMatches) => {
    return editorMatchToTextSearchResult(sameLineMatches, model, previewOptions);
  });
}

function getTextSearchMatchWithModelContext(matches2, model, query) {
  const results = [];
  let prevLine = -1;
  for (let i2 = 0; i2 < matches2.length; i2++) {
    const { start: matchStartLine, end: matchEndLine } = getMatchStartEnd(matches2[i2]);
    if (typeof query.surroundingContext === "number" && query.surroundingContext > 0) {
      const beforeContextStartLine = Math.max(prevLine + 1, matchStartLine - query.surroundingContext);
      for (let b = beforeContextStartLine; b < matchStartLine; b++) {
        results.push({
          text: model.getLineContent(b + 1),
          lineNumber: b + 1
        });
      }
    }
    results.push(matches2[i2]);
    const nextMatch = matches2[i2 + 1];
    const nextMatchStartLine = nextMatch ? getMatchStartEnd(nextMatch).start : Number.MAX_VALUE;
    if (typeof query.surroundingContext === "number" && query.surroundingContext > 0) {
      const afterContextToLine = Math.min(nextMatchStartLine - 1, matchEndLine + query.surroundingContext, model.getLineCount() - 1);
      for (let a = matchEndLine + 1; a <= afterContextToLine; a++) {
        results.push({
          text: model.getLineContent(a + 1),
          lineNumber: a + 1
        });
      }
    }
    prevLine = matchEndLine;
  }
  return results;
}

function getMatchStartEnd(match2) {
  const matchRanges = match2.rangeLocations.map((e4) => e4.source);
  const matchStartLine = matchRanges[0].startLineNumber;
  const matchEndLine = matchRanges[matchRanges.length - 1].endLineNumber;
  return {
    start: matchStartLine,
    end: matchEndLine
  };
}
export { editorMatchToTextSearchResult, editorMatchesToTextSearchResults, getTextSearchMatchWithModelContext, getMatchStartEnd };
