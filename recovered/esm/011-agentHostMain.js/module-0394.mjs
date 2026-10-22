// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexSessionConfigKeys.ts
import { CODEX_DEFAULT_PERMISSIONS_PRESET, narrowCodexPermissionsPreset, presetForResolvedPermissions, resolveCodexPermissionsPreset } from "./module-0393.mjs";


// src/vs/platform/agentHost/node/codex/codexSessionConfigKeys.ts
function narrowApprovalPolicy(value) {
  switch (value) {
    case "never":
    case "on-request":
    case "untrusted":
      return value;
    default:
      return void 0;
  }
}

function narrowSandboxMode(value) {
  switch (value) {
    case "read-only":
    case "workspace-write":
    case "danger-full-access":
      return value;
    default:
      return void 0;
  }
}

function resolveCodexPermissions(values, defaults) {
  const preset = narrowCodexPermissionsPreset(values?.["codex.permissionsPreset" /* PermissionsPreset */]);
  if (preset) {
    return resolveCodexPermissionsPreset(preset);
  }
  return {
    approvalPolicy: narrowApprovalPolicy(values?.["codex.approvalPolicy" /* ApprovalPolicy */]) ?? defaults.approvalPolicy,
    sandboxMode: narrowSandboxMode(values?.["codex.sandboxMode" /* SandboxMode */]) ?? defaults.sandboxMode,
    approvalsReviewer: "user"
  };
}

function migrateCodexPermissionValues(config, defaults) {
  const explicitPreset = narrowCodexPermissionsPreset(config?.["codex.permissionsPreset" /* PermissionsPreset */]);
  if (explicitPreset) {
    return { ["codex.permissionsPreset" /* PermissionsPreset */]: explicitPreset };
  }
  const resolved = resolveCodexPermissions(config, defaults);
  const equivalentPreset = presetForResolvedPermissions(resolved);
  if (equivalentPreset) {
    return { ["codex.permissionsPreset" /* PermissionsPreset */]: equivalentPreset };
  }
  if (resolved.sandboxMode === "read-only") {
    return {
      ["codex.approvalPolicy" /* ApprovalPolicy */]: resolved.approvalPolicy,
      ["codex.sandboxMode" /* SandboxMode */]: resolved.sandboxMode
    };
  }
  return {
    ["codex.permissionsPreset" /* PermissionsPreset */]: resolved.sandboxMode === "danger-full-access" ? "full-access" : CODEX_DEFAULT_PERMISSIONS_PRESET
  };
}

function narrowAdditionalDirectories(value) {
  if (!Array.isArray(value)) {
    return void 0;
  }
  return value.filter((entry) => typeof entry === "string" && entry.length > 0);
}

function narrowBoolean(value) {
  return typeof value === "boolean" ? value : void 0;
}

function narrowWebSearchMode(value) {
  switch (value) {
    case "disabled":
    case "cached":
    case "live":
      return value;
    default:
      return void 0;
  }
}

function narrowReasoningEffort(value) {
  switch (value) {
    case "none":
    case "minimal":
    case "low":
    case "medium":
    case "high":
    case "xhigh":
    case "max":
    case "ultra":
      return value;
    default:
      return void 0;
  }
}

function narrowPersonality(value) {
  switch (value) {
    case "none":
    case "friendly":
    case "pragmatic":
      return value;
    default:
      return void 0;
  }
}

function narrowReasoningSummary(value) {
  switch (value) {
    case "auto":
    case "concise":
    case "detailed":
    case "none":
      return value;
    default:
      return void 0;
  }
}

function collaborationModeKind(value) {
  return value === "plan" ? "plan" : "default";
}
export { narrowApprovalPolicy, narrowSandboxMode, resolveCodexPermissions, migrateCodexPermissionValues, narrowAdditionalDirectories, narrowBoolean, narrowWebSearchMode, narrowReasoningEffort, narrowPersonality, narrowReasoningSummary, collaborationModeKind };
