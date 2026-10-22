// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentCompletionAttachmentMeta.ts



// src/vs/platform/agentHost/common/meta/agentCompletionAttachmentMeta.ts
function toCommandCompletionAttachmentMeta(meta) {
  const result = { command: meta.command };
  if (meta.description !== void 0) {
    result["description"] = meta.description;
  }
  if (meta.argumentHint !== void 0) {
    result["argumentHint"] = meta.argumentHint;
  }
  const action = toCompletionActionMeta(meta.action);
  if (action !== void 0) {
    result["action"] = action;
  }
  return result;
}

function getCompletionAction(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return void 0;
  }
  return readCompletionActionMeta(meta["action"]);
}

function readCompletionActionMeta(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  let applyConfig;
  const rawApplyConfig = raw["applyConfig"];
  if (rawApplyConfig && typeof rawApplyConfig === "object" && !Array.isArray(rawApplyConfig)) {
    for (const [key, entry] of Object.entries(rawApplyConfig)) {
      if (typeof entry === "string") {
        applyConfig ??= {};
        applyConfig[key] = entry;
      }
    }
  }
  if (applyConfig === void 0) {
    return void 0;
  }
  return { applyConfig };
}

function toCompletionActionMeta(action) {
  if (!action?.applyConfig || Object.keys(action.applyConfig).length === 0) {
    return void 0;
  }
  return { applyConfig: { ...action.applyConfig } };
}

function toSkillCompletionAttachmentMeta(meta) {
  const result = { uri: meta.uri };
  if (meta.name !== void 0) {
    result["name"] = meta.name;
  }
  if (meta.displayName !== void 0) {
    result["displayName"] = meta.displayName;
  }
  if (meta.description !== void 0) {
    result["description"] = meta.description;
  }
  return result;
}
export { toCommandCompletionAttachmentMeta, getCompletionAction, readCompletionActionMeta, toCompletionActionMeta, toSkillCompletionAttachmentMeta };
