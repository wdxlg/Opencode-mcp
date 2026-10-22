// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/agentHostSandboxForwarder.ts
import { AgentHostCustomTerminalToolEnabledSettingId } from "./module-2104.mjs";
import { AgentHostSdkSandboxEnabledSettingId, AgentHostSdkSandboxWindowsEnabledSettingId } from "./module-1107.mjs";
import { Disposable } from "./module-0012.mjs";
import { SANDBOX_SETTING_KEYS, readAgentHostSandboxValues } from "./module-3313.mjs";
import { equals4 } from "./module-0098.mjs";
import { ROOT_STATE_URI } from "./module-1007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostConnectionsService } from "./module-0959.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/agentHostSandboxForwarder.ts
var HOST_POLICY_SETTING_KEYS = [
  AgentHostCustomTerminalToolEnabledSettingId,
  AgentHostSdkSandboxEnabledSettingId,
  AgentHostSdkSandboxWindowsEnabledSettingId
];

var AgentHostSandboxForwarder = class extends Disposable {
  constructor(_connectionsService, _configurationService, _logService) {
    super();
    this._connectionsService = _connectionsService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    /**
     * Connections that have already had their initial push attempted
     * (successfully or via a pending listener waiting for the sandbox
     * schema). Used to avoid re-scheduling pushes for connections that
     * are still present across `onDidChangeConnections` events.
     */
    this._scheduled = /* @__PURE__ */ new Map();
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (SANDBOX_SETTING_KEYS.some((key3) => e.affectsConfiguration(key3)) || HOST_POLICY_SETTING_KEYS.some((key3) => e.affectsConfiguration(key3))) {
        this._desired = void 0;
        this._pushToAllConnections();
      }
    }));
    this._register(this._connectionsService.onDidChangeConnections(() => {
      this._syncConnectionListeners();
    }));
    this._syncConnectionListeners();
  }
  static {
    this.ID = "workbench.contrib.agentHostSandboxForwarder";
  }
  _syncConnectionListeners() {
    const live = /* @__PURE__ */ new Set();
    for (const info of this._connectionsService.connections) {
      if (!info.connection) {
        continue;
      }
      live.add(info.connection);
      if (!this._scheduled.has(info.connection)) {
        this._scheduleInitialPush(info.connection);
      }
    }
    for (const [connection, listener] of this._scheduled) {
      if (!live.has(connection)) {
        listener.dispose();
        this._scheduled.delete(connection);
      }
    }
  }
  /**
   * Push immediately if the host is already advertising the sandbox
   * schema; otherwise subscribe to `rootState.onDidChange` long enough
   * to catch the schema and push exactly once, then unsubscribe.
   */
  _scheduleInitialPush(connection) {
    if (this._tryPush(connection)) {
      this._scheduled.set(connection, Disposable.None);
      return;
    }
    const listener = connection.rootState.onDidChange(() => {
      if (this._tryPush(connection)) {
        this._scheduled.get(connection)?.dispose();
        this._scheduled.set(connection, Disposable.None);
      }
    });
    this._scheduled.set(connection, listener);
  }
  _pushToAllConnections() {
    for (const info of this._connectionsService.connections) {
      if (info.connection) {
        this._tryPush(info.connection);
      }
    }
  }
  /**
   * Attempt to dispatch the desired sandbox config to `connection`.
   * Returns `true` once the host has advertised the sandbox schema
   * (whether or not an actual dispatch was needed); `false` if the
   * schema is not yet available and the caller should keep waiting.
   */
  _tryPush(connection) {
    const rootState = connection.rootState.value;
    if (!rootState || rootState instanceof Error) {
      return false;
    }
    const schemaProperties = rootState.config?.schema.properties;
    if (!schemaProperties?.["sandbox" /* Sandbox */]) {
      return false;
    }
    const desired = this._getDesired();
    const current = rootState.config?.values?.["sandbox" /* Sandbox */] ?? {};
    if (!equals4(current, desired)) {
      connection.dispatch(ROOT_STATE_URI, {
        type: "root/configChanged" /* RootConfigChanged */,
        config: { ["sandbox" /* Sandbox */]: desired }
      });
    }
    return true;
  }
  _getDesired() {
    if (this._desired === void 0) {
      this._desired = this._computeDesired();
    }
    return this._desired;
  }
  /**
   * Compute the sandbox config to forward to the Agent Host.
   *
   *  - When the Agent Host's own terminal sandbox engine is enabled
   *    (`chat.agentHost.customTerminalTool.enabled === true`), forward the
   *    user's full `chat.agent.sandbox.*` policy verbatim. The engine reads
   *    those values directly.
   *
   *  - Otherwise (the SDK runs the shell tool), gate on
   *    `chat.agentHost.sdkSandbox.enabled` and
   *    `chat.agentHost.sdkSandbox.enabledWindows` independently:
   *      - both `'off'` (the default) — forward an empty object so any
   *        previously-pushed values are cleared and the SDK runs commands
   *        unsandboxed.
   *      - either `'on'` — forward the user's policy and
   *        set `enabled` and `enabled.windows` from their corresponding SDK
   *        settings. The SDK sandbox modes are independent of the
   *        engine sandbox mode, so the user can run the SDK sandboxed
   *        even when the engine sandbox is off.
   */
  _computeDesired() {
    const customTerminalToolEnabled = this._configurationService.getValue(AgentHostCustomTerminalToolEnabledSettingId) === true;
    const values = readAgentHostSandboxValues(this._configurationService, this._logService);
    if (customTerminalToolEnabled) {
      return values;
    }
    const sdkSandbox = this._configurationService.getValue(AgentHostSdkSandboxEnabledSettingId) ?? "off" /* Off */;
    const windowsSdkSandbox = this._configurationService.getValue(AgentHostSdkSandboxWindowsEnabledSettingId) ?? "off" /* Off */;
    const sdkSandboxEnabled = sdkSandbox === "on" /* On */;
    const windowsSdkSandboxEnabled = windowsSdkSandbox === "on" /* On */;
    if (!sdkSandboxEnabled && !windowsSdkSandboxEnabled) {
      return {};
    }
    values["enabled" /* Enabled */] = sdkSandboxEnabled ? "on" /* On */ : "off" /* Off */;
    values["enabled.windows" /* WindowsEnabled */] = windowsSdkSandboxEnabled ? "on" /* On */ : "off" /* Off */;
    return values;
  }
  dispose() {
    for (const listener of this._scheduled.values()) {
      listener.dispose();
    }
    this._scheduled.clear();
    super.dispose();
  }
};

AgentHostSandboxForwarder = __decorateClass([
  __decorateParam(0, IAgentHostConnectionsService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ILogService)
], AgentHostSandboxForwarder);
export { HOST_POLICY_SETTING_KEYS, AgentHostSandboxForwarder };
