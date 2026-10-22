// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentConfigurationService.ts
import { createDecorator } from "./module-0044.mjs";
import { ROOT_STATE_URI, isAhpChatChannel, parseSubagentSessionUri } from "./module-0047.mjs";
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { agentHostCustomizationConfigSchema, defaultAgentHostCustomizationConfigValues } from "./module-0105.mjs";
import { sandboxConfigSchema } from "./module-0117.mjs";
import { copilotCliConfigSchema } from "./module-0107.mjs";
import { agentMergeRootConfigSchema } from "./module-0116.mjs";
import { ProtocolError } from "./module-0056.mjs";
import { getAgentCustomizationSettingsEntries, getProviderBackedRootConfigKeys, withAgentCustomizationSettings } from "./module-0100.mjs";
import { dirname } from "./module-0018.mjs";
import { agentHostProxyConfigSchema, clientOwnedApprovalRootConfigKeys, platformRootSchema } from "./module-0057.mjs";
import { hasKey } from "./module-0008.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentConfigurationService.ts
import * as fs2 from "fs";


// src/vs/platform/agentHost/node/agentConfigurationService.ts
var IAgentConfigurationService = createDecorator("agentConfigurationService");

function getEffectiveWorkingDirectory(stateManager, session) {
  const own = stateManager.getSessionState(session)?.workingDirectories?.[0];
  if (own !== void 0) {
    return own;
  }
  const parentInfo = parseSubagentSessionUri(session);
  if (parentInfo) {
    return stateManager.getSessionState(parentInfo.parentSession.toString())?.workingDirectories?.[0];
  }
  return void 0;
}

function getEffectiveWorkingDirectories(stateManager, session) {
  const own = stateManager.getSessionState(session)?.workingDirectories;
  if (own !== void 0) {
    return own;
  }
  const parentInfo = parseSubagentSessionUri(session);
  if (parentInfo) {
    return stateManager.getSessionState(parentInfo.parentSession.toString())?.workingDirectories;
  }
  return void 0;
}

var AgentConfigurationService = class extends Disposable {
  constructor(_stateManager, _logService, _rootConfigResource, providerConfigurations = []) {
    super();
    this._stateManager = _stateManager;
    this._logService = _logService;
    this._rootConfigResource = _rootConfigResource;
    this._rootConfigWrite = Promise.resolve();
    this._rootTransientValueKeys = /* @__PURE__ */ new Set();
    this._onDidRootConfigChange = this._register(new Emitter());
    this.onDidRootConfigChange = this._onDidRootConfigChange.event;
    this._onDidSessionConfigChange = this._register(new Emitter());
    this.onDidSessionConfigChange = this._onDidSessionConfigChange.event;
    const existing = this._stateManager.rootState.config;
    const ownSchema = agentHostCustomizationConfigSchema.toProtocol();
    const sandboxSchema = sandboxConfigSchema.toProtocol();
    const copilotCliSchema = copilotCliConfigSchema.toProtocol();
    const agentMergeSchema = agentMergeRootConfigSchema.toProtocol();
    this._stateManager.rootState.config = {
      schema: {
        type: "object",
        properties: { ...existing?.schema.properties, ...ownSchema.properties, ...sandboxSchema.properties, ...copilotCliSchema.properties, ...agentMergeSchema.properties }
      },
      values: { ...existing?.values, ...this._loadPersistedRootConfig() }
    };
    for (const registration of providerConfigurations) {
      this.registerProviderConfiguration(registration);
    }
    this._register(this._stateManager.onDidEmitEnvelope((envelope) => {
      if (envelope.action.type === "root/configChanged" /* RootConfigChanged */) {
        this._onDidRootConfigChange.fire();
      } else if (envelope.action.type === "session/configChanged" /* SessionConfigChanged */) {
        this._onDidSessionConfigChange.fire({
          session: envelope.channel,
          config: envelope.action.config,
          origin: envelope.origin
        });
      }
    }));
  }
  getEffectiveValue(session, schema, key) {
    for (const values of this._effectiveChain(session)) {
      const raw = values[key];
      if (raw === void 0) {
        continue;
      }
      try {
        schema.assertValid(key, raw);
        return raw;
      } catch (err) {
        const reason = err instanceof ProtocolError ? err.message : String(err);
        this._logService.warn(`[AgentConfigurationService] Value for '${key}' on ${session} failed schema validation, falling back: ${reason}`);
      }
    }
    return void 0;
  }
  getEffectiveWorkingDirectories(session) {
    return getEffectiveWorkingDirectories(this._stateManager, session);
  }
  updateSessionConfig(session, patch) {
    this._stateManager.dispatchServerAction(session, {
      type: "session/configChanged" /* SessionConfigChanged */,
      config: patch
    });
  }
  getSessionConfigValues(session) {
    if (isAhpChatChannel(session)) {
      throw new Error(`Expected a session URI, received chat channel ${session}`);
    }
    return this._stateManager.getSessionState(session)?.config?.values;
  }
  getRootValue(schema, key) {
    const root = this._stateManager.rootState.config?.values;
    const raw = root?.[key];
    if (raw === void 0) {
      return void 0;
    }
    try {
      schema.assertValid(key, raw);
      return raw;
    } catch (err) {
      const reason = err instanceof ProtocolError ? err.message : String(err);
      this._logService.warn(`[AgentConfigurationService] Host value for '${key}' failed schema validation, ignoring: ${reason}`);
      return void 0;
    }
  }
  updateRootConfig(patch, replace = false) {
    this._stateManager.dispatchServerAction(ROOT_STATE_URI, {
      type: "root/configChanged" /* RootConfigChanged */,
      config: patch,
      replace
    });
    this.persistRootConfig();
  }
  persistRootConfig() {
    if (!this._rootConfigResource) {
      return;
    }
    const values = { ...this._stateManager.rootState.config?.values ?? { ["customizations" /* Customizations */]: [] } };
    for (const key of this._rootTransientValueKeys) {
      delete values[key];
    }
    for (const key of getProviderBackedRootConfigKeys(this._stateManager.rootState)) {
      delete values[key];
    }
    const content = JSON.stringify(values, void 0, "	");
    const resource = this._rootConfigResource;
    this._rootConfigWrite = this._rootConfigWrite.catch((err) => {
      this._logService.warn("[AgentConfigurationService] Previous host config write failed", err);
    }).then(async () => {
      await fs2.promises.mkdir(dirname(resource.fsPath), { recursive: true });
      await fs2.promises.writeFile(resource.fsPath, `${content}
`, "utf8");
    }).catch((err) => {
      this._logService.error(`[AgentConfigurationService] Failed to persist host config to ${resource.fsPath}`, err);
    });
  }
  async whenIdle() {
    await this._rootConfigWrite;
  }
  registerProviderConfiguration(registration) {
    const config = this._stateManager.rootState.config;
    if (!config) {
      return;
    }
    Object.assign(config.schema.properties, registration.properties);
    for (const [key, property] of Object.entries(registration.properties)) {
      if (config.values[key] === void 0 && property.default !== void 0) {
        config.values[key] = property.default;
      }
    }
    const registrations = getAgentCustomizationSettingsEntries(this._stateManager.rootState).filter((entry) => entry.provider !== registration.provider);
    this._stateManager.rootState._meta = withAgentCustomizationSettings(this._stateManager.rootState, [...registrations, {
      provider: registration.provider,
      title: registration.title,
      description: registration.description,
      settings: registration.settings,
      configurationFile: registration.configurationFile
    }]);
  }
  getRootConfigValues() {
    return this._stateManager.rootState.config?.values ?? {};
  }
  publishRootTransientValues(patch) {
    for (const key of Object.keys(patch)) {
      this._rootTransientValueKeys.add(key);
    }
    this._stateManager.dispatchServerAction(ROOT_STATE_URI, {
      type: "root/configChanged" /* RootConfigChanged */,
      config: { ...patch }
    });
  }
  /**
   * Yields the raw value bags that contribute to the effective config
   * for `session`, in precedence order: session, parent subagent
   * session (if any), host.
   */
  *_effectiveChain(session) {
    const own = this._stateManager.getSessionState(session)?.config?.values;
    if (own) {
      yield own;
    }
    const parentInfo = parseSubagentSessionUri(session);
    if (parentInfo) {
      const parent = this._stateManager.getSessionState(parentInfo.parentSession.toString())?.config?.values;
      if (parent) {
        yield parent;
      }
    }
    const host = this._stateManager.rootState.config?.values;
    if (host) {
      yield host;
    }
  }
  _loadPersistedRootConfig() {
    const defaults = defaultAgentHostCustomizationConfigValues;
    if (!this._rootConfigResource) {
      return { ...defaults };
    }
    try {
      const raw = fs2.readFileSync(this._rootConfigResource.fsPath, "utf8");
      const parsed = JSON.parse(raw);
      return {
        ...this._loadPersistedPlatformRootConfig(parsed),
        ...agentHostCustomizationConfigSchema.validateOrDefault(parsed, defaults),
        ...sandboxConfigSchema.validateOrDefault(parsed, {}),
        ...copilotCliConfigSchema.validateOrDefault(parsed, {}),
        ...agentMergeRootConfigSchema.validateOrDefault(parsed, {}),
        ...agentHostProxyConfigSchema.validateOrDefault(parsed, {})
      };
    } catch (err) {
      const code = err && typeof err === "object" && hasKey(err, { code: true }) ? String(err.code) : void 0;
      if (code !== "ENOENT") {
        this._logService.warn(`[AgentConfigurationService] Failed to read host config from ${this._rootConfigResource.fsPath}: ${err instanceof Error ? err.message : String(err)}`);
      }
      return { ...defaults };
    }
  }
  /**
   * Restores the platform-owned half of the persisted bag. The host reads
   * some of these before any client connects (`showExternalSessions`, the
   * migrate-legacy gate, provider enablement), so without this a restart
   * runs its first pass against the schema default.
   */
  _loadPersistedPlatformRootConfig(parsed) {
    const values = { ...platformRootSchema.validateOrDefault(parsed, {}) };
    for (const key of clientOwnedApprovalRootConfigKeys) {
      delete values[key];
    }
    return values;
  }
};

AgentConfigurationService = __decorateClass([
  __decorateParam(1, ILogService)
], AgentConfigurationService);
export { getEffectiveWorkingDirectory, getEffectiveWorkingDirectories, fs2, IAgentConfigurationService, AgentConfigurationService };
