// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentEphemeralSessionMeta.ts



// src/vs/platform/agentHost/common/meta/agentEphemeralSessionMeta.ts
var VSCODE_EPHEMERAL_SESSION_META_KEY = "vscode.chat.ephemeralSession";

function readEphemeralSessionMeta(source) {
  const value = source._meta?.[VSCODE_EPHEMERAL_SESSION_META_KEY];
  return typeof value === "boolean" ? { isEphemeral: value } : {};
}

function withEphemeralSessionMeta(meta, isEphemeral) {
  if (isEphemeral === void 0) {
    return meta;
  }
  return { ...meta ?? {}, [VSCODE_EPHEMERAL_SESSION_META_KEY]: isEphemeral };
}
export { readEphemeralSessionMeta, withEphemeralSessionMeta, VSCODE_EPHEMERAL_SESSION_META_KEY };
