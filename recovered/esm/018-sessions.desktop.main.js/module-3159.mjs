// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/task/taskHelpers.ts
import { localize } from "./module-0001.mjs";
import { MarkdownString } from "./module-0462.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/task/taskHelpers.ts
function toolResultDetailsFromResponse(terminalResults) {
  return Array.from(new Map(
    terminalResults.flatMap(
      (r2) => r2.resources?.filter((res) => res.uri).map((res) => {
        const range2 = res.range;
        const item = range2 !== void 0 ? { uri: res.uri, range: range2 } : res.uri;
        const key3 = range2 !== void 0 ? `${res.uri.toString()}-${range2.toString()}` : `${res.uri.toString()}`;
        return [key3, item];
      }) ?? []
    )
  ).values());
}

function toolResultMessageFromResponse(result, taskLabel, toolResultDetails, terminalResults, getOutputTool, isBackground) {
  let resultSummary = "";
  if (result?.exitCode) {
    resultSummary = localize(20609, null, taskLabel, result.exitCode);
  } else {
    resultSummary += `\`${taskLabel}\` task `;
    const problemCount = toolResultDetails.length;
    if (getOutputTool) {
      return problemCount ? new MarkdownString(`Got output for ${resultSummary} with \`${problemCount}\` problem${problemCount === 1 ? "" : "s"}`) : new MarkdownString(`Got output for ${resultSummary}`);
    } else {
      const problemCount2 = toolResultDetails.length;
      resultSummary += terminalResults.every((r2) => r2.state === "Idle" /* Idle */) ? problemCount2 ? `finished with \`${problemCount2}\` problem${problemCount2 === 1 ? "" : "s"}` : "finished" : isBackground ? problemCount2 ? `started and will continue to run in the background with \`${problemCount2}\` problem${problemCount2 === 1 ? "" : "s"}` : "started and will continue to run in the background" : problemCount2 ? `started with \`${problemCount2}\` problem${problemCount2 === 1 ? "" : "s"}` : "started";
    }
  }
  return new MarkdownString(resultSummary);
}
export { toolResultDetailsFromResponse, toolResultMessageFromResponse };
