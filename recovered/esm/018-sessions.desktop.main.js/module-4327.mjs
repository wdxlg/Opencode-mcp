// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostSettingsFileSystemProvider.ts
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { serializeAgentHostConfigDocument } from "./module-4323.mjs";
import { AbstractMultiProviderAgentHostConfigSchemaRegistrar, AbstractSessionsAgentHostConfigFileSystemProvider } from "./module-4324.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostSettingsFileSystemProvider.ts
var AGENT_HOST_SETTINGS_SCHEME = "agent-host-settings";

function agentHostSettingsUri(providerId) {
  return URI.from({
    scheme: AGENT_HOST_SETTINGS_SCHEME,
    authority: providerId,
    path: `/settings.jsonc`
  });
}

function parseHostSettingsUri(uri4) {
  if (uri4.scheme !== AGENT_HOST_SETTINGS_SCHEME) {
    return void 0;
  }
  const providerId = uri4.authority;
  if (!providerId) {
    return void 0;
  }
  return { providerId };
}

var hostSettingsPropertyFilter = () => true;

var hostSettingsLocale = {
  get header() {
    return localize(4967, null);
  },
  get saveHint() {
    return localize(4970, null);
  },
  get parseError() {
    return localize(4969, null);
  },
  get notObject() {
    return localize(4968, null);
  }
};

function serializeHostSettings(provider) {
  return serializeAgentHostConfigDocument(provider.getRootConfig(), hostSettingsPropertyFilter, hostSettingsLocale);
}

var AgentHostSettingsFileSystemProvider = class extends AbstractSessionsAgentHostConfigFileSystemProvider {
  constructor(_schemaRegistrar, sessionsProvidersService, logService) {
    super(sessionsProvidersService, logService);
    this._schemaRegistrar = _schemaRegistrar;
    this._schemeLabel = AGENT_HOST_SETTINGS_SCHEME;
    this._traceTag = "AgentHostSettings";
    this._locale = hostSettingsLocale;
  }
  _parseUri(resource) {
    return parseHostSettingsUri(resource);
  }
  _serialize(provider) {
    return serializeHostSettings(provider);
  }
  _watchChanges(provider, _ctx, fire) {
    return provider.onDidChangeRootConfig(() => fire());
  }
  _ensureSchemaRegistered(provider) {
    this._schemaRegistrar.ensureRegistered(provider);
  }
  _hasConfig(provider) {
    return provider.getRootConfig() !== void 0;
  }
  _replaceConfig(provider, _ctx, values) {
    return provider.replaceRootConfig(values);
  }
  _describeForTrace(ctx) {
    return `provider ${ctx.providerId}`;
  }
};

AgentHostSettingsFileSystemProvider = __decorateClass([
  __decorateParam(1, ISessionsProvidersService),
  __decorateParam(2, ILogService)
], AgentHostSettingsFileSystemProvider);

var AgentHostSettingsSchemaRegistrar = class extends AbstractMultiProviderAgentHostConfigSchemaRegistrar {
  _propertyFilter() {
    return hostSettingsPropertyFilter;
  }
  _settingsUri(provider) {
    return agentHostSettingsUri(provider.id).toString();
  }
  _schemaId(provider) {
    return `vscode://schemas/agent-host-settings/${provider.id}.jsonc`;
  }
  _getConfig(target) {
    return target.getRootConfig();
  }
  _targetsForProvider(provider) {
    return [provider];
  }
  _observeProvider(provider, onChanged, _onRemoved) {
    return provider.onDidChangeRootConfig(() => onChanged(provider));
  }
};
export { agentHostSettingsUri, parseHostSettingsUri, serializeHostSettings, AGENT_HOST_SETTINGS_SCHEME, hostSettingsPropertyFilter, hostSettingsLocale, AgentHostSettingsFileSystemProvider, AgentHostSettingsSchemaRegistrar };
