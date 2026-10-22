// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/codexSessionConfigKeys.ts



// src/vs/platform/agentHost/common/codexSessionConfigKeys.ts
var CODEX_PERMISSIONS_PRESETS = ["default", "auto-review", "full-access"];

var CODEX_DEFAULT_PERMISSIONS_PRESET = "default";

function getCodexAutonomousSessionConfig(policyRestricted) {
  return policyRestricted ? void 0 : { ["codex.permissionsPreset" /* PermissionsPreset */]: "auto-review" };
}

function narrowCodexPermissionsPreset(raw) {
  switch (raw) {
    case "default":
    case "auto-review":
    case "full-access":
      return raw;
    default:
      return void 0;
  }
}

function resolveCodexPermissionsPreset(preset) {
  switch (preset) {
    case "auto-review":
      return { approvalPolicy: "on-request", sandboxMode: "workspace-write", approvalsReviewer: "auto_review" };
    case "full-access":
      return { approvalPolicy: "never", sandboxMode: "danger-full-access", approvalsReviewer: "user" };
    case "default":
    default:
      return { approvalPolicy: "on-request", sandboxMode: "workspace-write", approvalsReviewer: "user" };
  }
}

function presetForResolvedPermissions(resolved) {
  for (const preset of CODEX_PERMISSIONS_PRESETS) {
    const axes = resolveCodexPermissionsPreset(preset);
    if (axes.approvalPolicy === resolved.approvalPolicy && axes.sandboxMode === resolved.sandboxMode && axes.approvalsReviewer === resolved.approvalsReviewer) {
      return preset;
    }
  }
  return void 0;
}
export { getCodexAutonomousSessionConfig, narrowCodexPermissionsPreset, resolveCodexPermissionsPreset, presetForResolvedPermissions, CODEX_PERMISSIONS_PRESETS, CODEX_DEFAULT_PERMISSIONS_PRESET };
