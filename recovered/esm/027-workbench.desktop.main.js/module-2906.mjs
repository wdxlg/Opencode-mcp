// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostSlashCommand.ts



// src/vs/platform/agentHost/common/agentHostSlashCommand.ts
function parseLeadingSlashCommand(prompt) {
  const match2 = /^\/([^\s/]+)(?:$|\s+([\s\S]*))/.exec(prompt);
  if (!match2) {
    return void 0;
  }
  const rawRest = match2[2] ?? "";
  return {
    command: match2[1],
    rest: rawRest.trim(),
    rawRest
  };
}
export { parseLeadingSlashCommand };
