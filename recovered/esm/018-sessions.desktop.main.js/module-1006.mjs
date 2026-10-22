// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentToolCallMeta.ts



// src/vs/platform/agentHost/common/meta/agentToolCallMeta.ts
function isToolKind(value2) {
  return value2 === "terminal" || value2 === "subagent" || value2 === "search" || value2 === "read";
}

function readToolCallUiMeta(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
  if (typeof raw["resourceUri"] !== "string" || raw["resourceUri"].length === 0) {
    return void 0;
  }
  const result = { resourceUri: raw["resourceUri"] };
  if (typeof raw["channel"] === "string" && raw["channel"].length > 0) {
    result.channel = raw["channel"];
  }
  return result;
}

function readToolSearchCandidates(value2) {
  if (!Array.isArray(value2)) {
    return void 0;
  }
  const result = [];
  for (const candidate of value2) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return void 0;
    }
    const raw = candidate;
    if (typeof raw["name"] !== "string" || typeof raw["description"] !== "string") {
      return void 0;
    }
    result.push({
      name: raw["name"],
      description: raw["description"]
    });
  }
  return result;
}

function readToolCallMeta(source) {
  const meta = source._meta;
  if (!meta) {
    return {};
  }
  const result = {};
  if (isToolKind(meta["toolKind"])) {
    result.toolKind = meta["toolKind"];
  }
  if (typeof meta["language"] === "string") {
    result.language = meta["language"];
  }
  if (typeof meta["subagentDescription"] === "string") {
    result.subagentDescription = meta["subagentDescription"];
  }
  if (typeof meta["subagentAgentName"] === "string") {
    result.subagentAgentName = meta["subagentAgentName"];
  }
  if (typeof meta["subagentChatUri"] === "string") {
    result.subagentChatUri = meta["subagentChatUri"];
  }
  if (typeof meta["mcpServerName"] === "string") {
    result.mcpServerName = meta["mcpServerName"];
  }
  if (typeof meta["mcpToolName"] === "string") {
    result.mcpToolName = meta["mcpToolName"];
  }
  if (typeof meta["autoApproveBySetting"] === "boolean") {
    result.autoApproveBySetting = meta["autoApproveBySetting"];
  }
  if (typeof meta["autoApproveRuleResolvable"] === "boolean") {
    result.autoApproveRuleResolvable = meta["autoApproveRuleResolvable"];
  }
  const toolSearchCandidates = readToolSearchCandidates(meta["toolSearchCandidates"]);
  if (toolSearchCandidates) {
    result.toolSearchCandidates = toolSearchCandidates;
  }
  const ui = readToolCallUiMeta(meta["ui"]);
  if (ui) {
    result.ui = ui;
  }
  return result;
}
export { isToolKind, readToolCallUiMeta, readToolSearchCandidates, readToolCallMeta };
