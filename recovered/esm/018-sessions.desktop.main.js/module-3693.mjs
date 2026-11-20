// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostPermissionPickerDelegate.ts
import { KNOWN_AUTO_APPROVE_VALUES } from "./module-1740.mjs";
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { observableSignal } from "./module-0058.mjs";
import { AgentHostCustomTerminalToolEnabledSettingId } from "./module-2096.mjs";
import { AgentHostSdkSandboxEnabledSettingId, AgentHostSdkSandboxWindowsEnabledSettingId, getAgentHostCopilotSandboxSettingId } from "./module-1108.mjs";
import { CopilotCLISessionType } from "./module-3672.mjs";
import { derived } from "./module-0054.mjs";
import { localize } from "./module-0001.mjs";
import { isChatPermissionLevel } from "./module-0965.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAgentHostEnablementService } from "./module-0964.mjs";
import { narrowClaudePermissionMode } from "./module-2097.mjs";
import { narrowCodexPermissionsPreset } from "./module-2098.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostPermissionPickerDelegate.ts
var REQUIRED_AUTO_APPROVE_VALUE = "default";

var REQUIRED_MODE_VALUE = "interactive";

var REQUIRED_PERMISSION_MODE_VALUE = "default";

var REQUIRED_CODEX_APPROVALS_VALUE = "default";

function isWellKnownAutoApproveSchema2(schema10) {
  if (schema10.type !== "string" || !Array.isArray(schema10.enum) || schema10.enum.length === 0) {
    return false;
  }
  if (!schema10.enum.includes(REQUIRED_AUTO_APPROVE_VALUE)) {
    return false;
  }
  return schema10.enum.every((value2) => typeof value2 === "string" && KNOWN_AUTO_APPROVE_VALUES.has(value2));
}


function isWellKnownModeSchema(schema10) {
  if (schema10.type !== "string" || !Array.isArray(schema10.enum) || schema10.enum.length === 0) {
    return false;
  }
  if (!schema10.enum.includes(REQUIRED_MODE_VALUE)) {
    return false;
  }
  return true;
}

function isWellKnownClaudePermissionModeSchema(schema10) {
  if (schema10.type !== "string" || !Array.isArray(schema10.enum) || schema10.enum.length === 0) {
    return false;
  }
  if (!schema10.enum.includes(REQUIRED_PERMISSION_MODE_VALUE)) {
    return false;
  }
  return schema10.enum.every((value2) => narrowClaudePermissionMode(value2) !== void 0);
}

function isWellKnownCodexApprovalsSchema(schema10) {
  if (schema10.type !== "string" || !Array.isArray(schema10.enum) || schema10.enum.length === 0) {
    return false;
  }
  if (!schema10.enum.includes(REQUIRED_CODEX_APPROVALS_VALUE)) {
    return false;
  }
  return schema10.enum.every((value2) => narrowCodexPermissionsPreset(value2) !== void 0);
}
export { isWellKnownAutoApproveSchema2, isWellKnownModeSchema, isWellKnownClaudePermissionModeSchema, isWellKnownCodexApprovalsSchema, REQUIRED_AUTO_APPROVE_VALUE, REQUIRED_MODE_VALUE, REQUIRED_PERMISSION_MODE_VALUE, REQUIRED_CODEX_APPROVALS_VALUE };
