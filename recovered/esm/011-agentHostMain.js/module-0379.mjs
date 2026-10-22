// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexDelegation.ts



// src/vs/platform/agentHost/node/codex/codexDelegation.ts
var CODEX_DELEGATION_PATTERN = /^\s*<codex_delegation>\s*<source_thread_id>\s*(?<sourceThreadId>[\s\S]*?)\s*<\/source_thread_id>\s*<input>\s*(?<input>[\s\S]*?)\s*<\/input>\s*<\/codex_delegation>\s*$/i;

function parseCodexDelegation(text) {
  const groups = CODEX_DELEGATION_PATTERN.exec(text)?.groups;
  if (!groups) {
    return void 0;
  }
  const sourceThreadId = decodeXmlText(groups["sourceThreadId"]).trim();
  if (!sourceThreadId) {
    return void 0;
  }
  return {
    sourceThreadId,
    input: decodeXmlText(groups["input"]).trim()
  };
}

function codexDelegationDisplayText(text) {
  if (!text) {
    return void 0;
  }
  const delegation = parseCodexDelegation(text);
  if (delegation) {
    return delegation.input || void 0;
  }
  return /^\s*<codex_delegation>/i.test(text) ? void 0 : text;
}

function decodeXmlText(text) {
  return text.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
}
export { parseCodexDelegation, codexDelegationDisplayText, decodeXmlText, CODEX_DELEGATION_PATTERN };
