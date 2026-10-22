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
import { isAssistedPermissionsEnabled, isPermissionLevelVisible } from "./module-2041.mjs";
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

var AgentHostPermissionPickerDelegate = class extends Disposable {
  constructor(_session, _sessionsProvidersService, _configurationService, agentHostEnablementService) {
    super();
    this._session = _session;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._configurationService = _configurationService;
    /** Fires every time any agent-host provider's session config changes. */
    this._configChangedSignal = observableSignal("agentHostPermissionPicker.configChanged");
    this._providerSubscriptions = this._register(new DisposableMap());
    this.sandboxTogglePresentation = "standalone";
    this.sandboxToggleConfigurationKeys = [
      AgentHostCustomTerminalToolEnabledSettingId,
      AgentHostSdkSandboxEnabledSettingId,
      AgentHostSdkSandboxWindowsEnabledSettingId,
      "chat.agent.sandbox.enabled" /* AgentSandboxEnabled */,
      "chat.agent.sandbox.enabledWindows" /* AgentSandboxWindowsEnabled */
    ];
    this.isSandboxToggleApplicable = () => this._session.get()?.sessionType === CopilotCLISessionType.id;
    this.getSandboxToggleSettingId = () => {
      if (!this.isSandboxToggleApplicable()) {
        return void 0;
      }
      const customTerminalToolEnabled = this._configurationService.getValue(AgentHostCustomTerminalToolEnabledSettingId) === true;
      return getAgentHostCopilotSandboxSettingId(customTerminalToolEnabled);
    };
    /** Agent-host sessions seed their default approval level from this setting. */
    this.defaultSettingKey = "chat.defaultConfiguration" /* DefaultConfiguration */;
    this.managedSandboxEnforced = agentHostEnablementService.managedSandboxEnforced;
    this._watchProviders(this._sessionsProvidersService.getProviders());
    this._register(this._sessionsProvidersService.onDidChangeProviders((e4) => {
      for (const provider of e4.removed) {
        this._providerSubscriptions.deleteAndDispose(provider.id);
      }
      this._watchProviders(e4.added);
      this._configChangedSignal.trigger(void 0);
    }));
    this.currentPermissionLevel = derived(this, (reader) => this._readLevel(reader));
    this.isApplicable = derived(this, (reader) => this._readIsWellKnown(reader));
    this.isResolving = derived(this, (reader) => {
      this._configChangedSignal.read(reader);
      const session = this._session.read(reader);
      if (!session) {
        return false;
      }
      const provider = this._getProvider(session.providerId);
      return provider?.isSessionConfigResolving(session.sessionId).read(reader) ?? false;
    });
  }
  get availableLevels() {
    const session = this._session.get();
    if (!session) {
      return ["default" /* Default */];
    }
    const provider = this._getProvider(session.providerId);
    const schema10 = provider?.getSessionConfig(session.sessionId)?.schema.properties["autoApprove" /* AutoApprove */];
    const values = schema10?.type === "string" && Array.isArray(schema10.enum) ? schema10.enum : [];
    const assistedPermissionsEnabled = isAssistedPermissionsEnabled(this._configurationService);
    return [
      "default" /* Default */,
      "assisted" /* Assisted */,
      "autoApprove" /* AutoApprove */
    ].filter((level) => values.includes(level) && isPermissionLevelVisible(level, assistedPermissionsEnabled));
  }
  getPermissionLevelMeta(level, meta) {
    switch (level) {
      case "default" /* Default */:
        return {
          ...meta,
          label: localize(4927, null),
          detail: localize(4922, null)
        };
      case "assisted" /* Assisted */:
        return { ...meta, detail: localize(4921, null) };
      case "autoApprove" /* AutoApprove */:
        return { ...meta, detail: localize(4920, null) };
      case "autopilot" /* Autopilot */:
        return meta;
    }
  }
  setPermissionLevel(level) {
    if (!isPermissionLevelVisible(level, isAssistedPermissionsEnabled(this._configurationService))) {
      return;
    }
    const session = this._session.get();
    if (!session) {
      return;
    }
    const provider = this._getProvider(session.providerId);
    if (!provider) {
      return;
    }
    if (provider.isSessionConfigResolving(session.sessionId).get()) {
      return;
    }
    if (!this.availableLevels.includes(level)) {
      return;
    }
    provider.setSessionConfigValue(session.sessionId, "autoApprove" /* AutoApprove */, level).catch(() => {
    });
  }
  getPermissionLevelHover(level, _meta) {
    switch (level) {
      case "default" /* Default */:
        return localize(4926, null);
      case "autoApprove" /* AutoApprove */:
        return localize(4924, null);
      case "assisted" /* Assisted */:
        return localize(4923, null);
      case "autopilot" /* Autopilot */:
        return localize(4925, null);
    }
  }
  _readLevel(reader) {
    this._configChangedSignal.read(reader);
    const session = this._session.read(reader);
    if (!session) {
      return "default" /* Default */;
    }
    const provider = this._getProvider(session.providerId);
    if (!provider) {
      return "default" /* Default */;
    }
    const value2 = provider.getSessionConfig(session.sessionId)?.values["autoApprove" /* AutoApprove */];
    if (value2 === "autopilot" /* Autopilot */) {
      return "default" /* Default */;
    }
    return isChatPermissionLevel(value2) ? value2 : "default" /* Default */;
  }
  _readIsWellKnown(reader) {
    this._configChangedSignal.read(reader);
    const session = this._session.read(reader);
    if (!session) {
      return false;
    }
    const provider = this._getProvider(session.providerId);
    if (!provider) {
      return false;
    }
    const schema10 = provider.getSessionConfig(session.sessionId)?.schema.properties["autoApprove" /* AutoApprove */];
    return !!schema10 && isWellKnownAutoApproveSchema2(schema10);
  }
  _getProvider(providerId) {
    const provider = this._sessionsProvidersService.getProvider(providerId);
    return provider && isAgentHostProvider(provider) ? provider : void 0;
  }
  _watchProviders(providers2) {
    for (const provider of providers2) {
      if (!isAgentHostProvider(provider) || this._providerSubscriptions.has(provider.id)) {
        continue;
      }
      const subscriptions = new DisposableStore();
      subscriptions.add(provider.onDidChangeSessionConfig(() => {
        this._configChangedSignal.trigger(void 0);
      }));
      this._providerSubscriptions.set(provider.id, subscriptions);
    }
  }
};

AgentHostPermissionPickerDelegate = __decorateClass([
  __decorateParam(1, ISessionsProvidersService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IAgentHostEnablementService)
], AgentHostPermissionPickerDelegate);

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
export { isWellKnownAutoApproveSchema2, isWellKnownModeSchema, isWellKnownClaudePermissionModeSchema, isWellKnownCodexApprovalsSchema, REQUIRED_AUTO_APPROVE_VALUE, REQUIRED_MODE_VALUE, REQUIRED_PERMISSION_MODE_VALUE, REQUIRED_CODEX_APPROVALS_VALUE, AgentHostPermissionPickerDelegate };
