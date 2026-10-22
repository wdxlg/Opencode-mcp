// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentCompletionAttachmentMeta.ts



// src/vs/platform/agentHost/common/meta/agentCompletionAttachmentMeta.ts
function readCompletionAttachmentMeta(attachment) {
  const meta = attachment._meta;
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return void 0;
  }
  if (typeof meta["command"] === "string") {
    const action = readCompletionActionMeta(meta["action"]);
    return {
      kind: "command",
      command: meta["command"],
      ...typeof meta["description"] === "string" ? { description: meta["description"] } : {},
      ...typeof meta["argumentHint"] === "string" ? { argumentHint: meta["argumentHint"] } : {},
      ...action ? { action } : {}
    };
  }
  if (typeof meta["uri"] === "string") {
    return {
      kind: "skill",
      uri: meta["uri"],
      ...typeof meta["name"] === "string" ? { name: meta["name"] } : {},
      ...typeof meta["displayName"] === "string" ? { displayName: meta["displayName"] } : {},
      ...typeof meta["description"] === "string" ? { description: meta["description"] } : {}
    };
  }
  return void 0;
}

function getCompletionAction(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return void 0;
  }
  return readCompletionActionMeta(meta["action"]);
}

function readCompletionActionMeta(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
  let applyConfig;
  const rawApplyConfig = raw["applyConfig"];
  if (rawApplyConfig && typeof rawApplyConfig === "object" && !Array.isArray(rawApplyConfig)) {
    for (const [key3, entry] of Object.entries(rawApplyConfig)) {
      if (typeof entry === "string") {
        applyConfig ??= {};
        applyConfig[key3] = entry;
      }
    }
  }
  if (applyConfig === void 0) {
    return void 0;
  }
  return { applyConfig };
}

function getCommandArgumentHint(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return void 0;
  }
  return typeof meta["argumentHint"] === "string" ? meta["argumentHint"] : void 0;
}
export { readCompletionAttachmentMeta, getCompletionAction, readCompletionActionMeta, getCommandArgumentHint };
