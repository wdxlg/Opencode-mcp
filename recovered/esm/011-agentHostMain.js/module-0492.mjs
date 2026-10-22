// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/toolCallContributor.ts



// src/vs/platform/agentHost/node/shared/toolCallContributor.ts
function toolSourceKindFromContributor(contributor) {
  if (!contributor) {
    return "agentHost";
  }
  const kind = contributor.kind;
  switch (kind) {
    case "mcp" /* MCP */:
      return "mcp";
    case "client" /* Client */:
      return "client";
    default:
      return kind;
  }
}

function canRefineContributor(current, next) {
  if (current?.kind === "client" /* Client */) {
    return next.kind === "client" /* Client */ && next.clientId === current.clientId;
  }
  return next.kind !== "client" /* Client */;
}
export { toolSourceKindFromContributor, canRefineContributor };
