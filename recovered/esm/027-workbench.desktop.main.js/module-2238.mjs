// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentSystemNotificationMeta.ts



// src/vs/platform/agentHost/common/meta/agentSystemNotificationMeta.ts
var knownKinds = /* @__PURE__ */ new Set([
  "worktreeCreationFailure" /* WorktreeCreationFailure */,
  "agentMergeEnabled" /* AgentMergeEnabled */,
  "agentMergeDisabled" /* AgentMergeDisabled */
]);

function readAgentSystemNotificationMeta(source) {
  const meta = source._meta;
  if (!meta) {
    return {};
  }
  const kind = meta["kind"];
  return {
    kind: typeof kind === "string" && knownKinds.has(kind) ? kind : void 0,
    severity: meta["severity"] === "warning" /* Warning */ ? meta["severity"] : void 0
  };
}
export { readAgentSystemNotificationMeta, knownKinds };
