// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSettingsFileSystemProvider.ts
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { AbstractAgentHostConfigFileSystemProvider, AbstractAgentHostConfigSchemaRegistrar, serializeAgentHostConfigDocument } from "./module-2910.mjs";
import { Emitter } from "./module-0017.mjs";
import { equals4 } from "./module-0098.mjs";
import { createFileSystemProviderError } from "./module-0269.mjs";
import { ROOT_STATE_URI } from "./module-1007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSettingsFileSystemProvider.ts
var AGENT_HOST_SETTINGS_SCHEME = "agent-host-settings";

var AGENT_HOST_SETTINGS_LOCAL_AUTHORITY = "local";

function agentHostSettingsUri() {
  return URI.from({
    scheme: AGENT_HOST_SETTINGS_SCHEME,
    authority: AGENT_HOST_SETTINGS_LOCAL_AUTHORITY,
    path: `/settings.jsonc`
  });
}

function parseAmbientHostSettingsUri(uri5) {
  if (uri5.scheme !== AGENT_HOST_SETTINGS_SCHEME || uri5.authority !== AGENT_HOST_SETTINGS_LOCAL_AUTHORITY || uri5.path !== "/settings.jsonc") {
    return void 0;
  }
  return { kind: "local" };
}

var hostSettingsPropertyFilter = () => true;

var hostSettingsLocale = {
  get header() {
    return localize(9020, null);
  },
  get saveHint() {
    return localize(9023, null);
  },
  get parseError() {
    return localize(9022, null);
  },
  get notObject() {
    return localize(9021, null);
  }
};

function readRootConfig(state) {
  if (!state || state instanceof Error) {
    return void 0;
  }
  return state.config;
}

var AgentHostSettingsFileSystemProvider = class extends AbstractAgentHostConfigFileSystemProvider {
  constructor(_schemaRegistrar, _agentHostService, logService) {
    super(logService);
    this._schemaRegistrar = _schemaRegistrar;
    this._agentHostService = _agentHostService;
    this._schemeLabel = AGENT_HOST_SETTINGS_SCHEME;
    this._traceTag = "AgentHostSettings";
    this._locale = hostSettingsLocale;
    this._onDidChangeRootConfig = this._register(new Emitter());
    this._syncRootConfig(this._agentHostService.rootState.value);
    this._register(this._agentHostService.rootState.onDidChange((state) => this._syncRootConfig(state)));
  }
  _syncRootConfig(state) {
    const next = readRootConfig(state);
    const prev = this._rootConfig;
    if (prev === next) {
      return;
    }
    if (!next) {
      this._rootConfig = void 0;
      this._onDidChangeRootConfig.fire();
      return;
    }
    if (prev?.schema === next.schema && equals4(prev.values, next.values)) {
      return;
    }
    this._rootConfig = next;
    this._onDidChangeRootConfig.fire();
  }
  _parseUri(resource) {
    return parseAmbientHostSettingsUri(resource);
  }
  _resolveTarget() {
    return this._agentHostService;
  }
  _missingTargetError() {
    return createFileSystemProviderError("Agent host is not available", "EntryNotFound" /* FileNotFound */);
  }
  _serialize() {
    return serializeAgentHostConfigDocument(this._rootConfig, hostSettingsPropertyFilter, hostSettingsLocale);
  }
  _watchChanges(_target, _ctx, fire) {
    return this._onDidChangeRootConfig.event(() => fire());
  }
  _ensureSchemaRegistered(target) {
    this._schemaRegistrar.ensureRegistered(target);
  }
  _hasConfig() {
    return this._rootConfig !== void 0;
  }
  async _replaceConfig(_target, _ctx, values) {
    const current = this._rootConfig;
    if (!current) {
      return;
    }
    const nextValues = {};
    for (const [key3, value2] of Object.entries(values)) {
      if (current.schema.properties[key3]) {
        nextValues[key3] = value2;
      }
    }
    if (equals4(nextValues, current.values)) {
      return;
    }
    this._rootConfig = { ...current, values: nextValues };
    this._onDidChangeRootConfig.fire();
    this._agentHostService.dispatch(ROOT_STATE_URI, {
      type: "root/configChanged" /* RootConfigChanged */,
      config: nextValues,
      replace: true
    });
  }
  _describeForTrace() {
    return "local agent host";
  }
};

AgentHostSettingsFileSystemProvider = __decorateClass([
  __decorateParam(1, IAgentHostService),
  __decorateParam(2, ILogService)
], AgentHostSettingsFileSystemProvider);

var AgentHostSettingsSchemaRegistrar = class extends AbstractAgentHostConfigSchemaRegistrar {
  constructor(_agentHostService) {
    super();
    this._agentHostService = _agentHostService;
    this._register(this._agentHostService.rootState.onDidChange(() => {
      if (!this._isRegistered(this._agentHostService)) {
        return;
      }
      this._refreshSchema(this._agentHostService);
    }));
  }
  _propertyFilter() {
    return hostSettingsPropertyFilter;
  }
  _settingsUri() {
    return agentHostSettingsUri().toString();
  }
  _schemaId() {
    return `vscode://schemas/agent-host-settings/${AGENT_HOST_SETTINGS_LOCAL_AUTHORITY}.jsonc`;
  }
  _getConfig(target) {
    return readRootConfig(target.rootState.value);
  }
};

AgentHostSettingsSchemaRegistrar = __decorateClass([
  __decorateParam(0, IAgentHostService)
], AgentHostSettingsSchemaRegistrar);
export { agentHostSettingsUri, parseAmbientHostSettingsUri, readRootConfig, AGENT_HOST_SETTINGS_SCHEME, AGENT_HOST_SETTINGS_LOCAL_AUTHORITY, hostSettingsPropertyFilter, hostSettingsLocale, AgentHostSettingsFileSystemProvider, AgentHostSettingsSchemaRegistrar };
