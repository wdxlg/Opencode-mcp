// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/commandLineAnalyzer.ts



// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/commandLineAnalyzer.ts
function isAutoApproveRule(rule) {
  return !!rule && "sourceText" in rule;
}

function isNpmScriptAutoApproveRule(rule) {
  return !!rule && "type" in rule && rule.type === "npmScript";
}
export { isAutoApproveRule, isNpmScriptAutoApproveRule };
