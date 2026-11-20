// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentSessionSettingsFileSystemProvider.ts
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { AbstractAgentHostConfigFileSystemProvider, AbstractAgentHostConfigSchemaRegistrar, serializeAgentHostConfigDocument } from "./module-2910.mjs";
import { equals4 } from "./module-0098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentSessionSettingsFileSystemProvider.ts
var AGENT_SESSION_SETTINGS_SCHEME = "agent-session-settings";

var SUBSCRIPTION_OWNER2 = "AgentSessionSettingsEditor";

function agentSessionSettingsUri(backendSession) {
  const rawId = backendSession.path.startsWith("/") ? backendSession.path.substring(1) : backendSession.path;
  return URI.from({
    scheme: AGENT_SESSION_SETTINGS_SCHEME,
    authority: backendSession.scheme,
    path: `/${rawId}.jsonc`
  });
}

function parseSessionSettingsUri(uri5) {
  if (uri5.scheme !== AGENT_SESSION_SETTINGS_SCHEME || !uri5.authority) {
    return void 0;
  }
  let rawId = uri5.path.startsWith("/") ? uri5.path.substring(1) : uri5.path;
  const lastDot = rawId.lastIndexOf(".");
  if (lastDot > 0) {
    rawId = rawId.substring(0, lastDot);
  }
  if (!rawId) {
    return void 0;
  }
  return { backendSession: URI.from({ scheme: uri5.authority, path: `/${rawId}` }) };
}

var sessionSettingsPropertyFilter = (_key, schema10) => {
  const s = schema10;
  return s.sessionMutable === true && s.readOnly !== true;
};

var sessionSettingsLocale = {
  get header() {
    return localize(9031, null);
  },
  get saveHint() {
    return localize(9034, null);
  },
  get parseError() {
    return localize(9033, null);
  },
  get notObject() {
    return localize(9032, null);
  }
};

function readSessionConfig(state) {
  if (!state || state instanceof Error || !state.config) {
    return void 0;
  }
  return state.config;
}

var AgentSessionSettingsFileSystemProvider = class extends AbstractAgentHostConfigFileSystemProvider {
  constructor(_schemaRegistrar, _agentHostService, _configurationService, logService) {
    super(logService);
    this._schemaRegistrar = _schemaRegistrar;
    this._agentHostService = _agentHostService;
    this._configurationService = _configurationService;
    this._schemeLabel = AGENT_SESSION_SETTINGS_SCHEME;
    this._traceTag = "AgentSessionSettings";
    this._locale = sessionSettingsLocale;
  }
  _parseUri(resource) {
    return parseSessionSettingsUri(resource);
  }
  _resolveTarget(ctx) {
    const ref = this._agentHostService.getSubscription(1 /* Session */, ctx.backendSession, SUBSCRIPTION_OWNER2);
    return { backendSession: ctx.backendSession, ref };
  }
  _releaseTarget(target) {
    target.ref.dispose();
  }
  _serialize(target) {
    return serializeAgentHostConfigDocument(readSessionConfig(target.ref.object.value), sessionSettingsPropertyFilter, sessionSettingsLocale);
  }
  _watchChanges(target, _ctx, fire) {
    return target.ref.object.onDidChange(() => fire());
  }
  _ensureSchemaRegistered(target) {
    this._schemaRegistrar.ensureRegistered(target.backendSession);
  }
  _hasConfig(target) {
    return readSessionConfig(target.ref.object.value) !== void 0;
  }
  // The input is the user's full view of editable values. Dispatch as a
  // replace: every non-editable property is forced through unchanged from
  // the current values, and an editable property the user omitted is left
  // out of the replacement payload entirely, clearing it.
  async _replaceConfig(target, ctx, values) {
    const current = readSessionConfig(target.ref.object.value);
    if (!current) {
      return;
    }
    const nextValues = {};
    for (const [key3, schema10] of Object.entries(current.schema.properties)) {
      if (sessionSettingsPropertyFilter(key3, schema10)) {
        if (Object.hasOwn(values, key3)) {
          nextValues[key3] = values[key3];
        }
      } else if (Object.hasOwn(current.values, key3)) {
        nextValues[key3] = current.values[key3];
      }
    }
    if (equals4(nextValues, current.values)) {
      return;
    }
    this._agentHostService.dispatch(ctx.backendSession.toString(), {
      type: "session/configChanged" /* SessionConfigChanged */,
      config: nextValues,
      replace: true
    });
  }
  _describeForTrace(ctx) {
    return `session ${ctx.backendSession.toString()}`;
  }
};

AgentSessionSettingsFileSystemProvider = __decorateClass([
  __decorateParam(1, IAgentHostService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ILogService)
], AgentSessionSettingsFileSystemProvider);

var AgentSessionSettingsSchemaRegistrar = class extends AbstractAgentHostConfigSchemaRegistrar {
  constructor(_agentHostService) {
    super();
    this._agentHostService = _agentHostService;
  }
  _propertyFilter() {
    return sessionSettingsPropertyFilter;
  }
  _settingsUri(backendSession) {
    return agentSessionSettingsUri(backendSession).toString();
  }
  _schemaId(backendSession) {
    const rawId = backendSession.path.startsWith("/") ? backendSession.path.substring(1) : backendSession.path;
    return `vscode://schemas/agent-session-settings/${backendSession.scheme}/${rawId}.jsonc`;
  }
  _getConfig(backendSession) {
    const sub = this._agentHostService.getSubscriptionUnmanaged(1 /* Session */, backendSession);
    return readSessionConfig(sub?.value);
  }
};

AgentSessionSettingsSchemaRegistrar = __decorateClass([
  __decorateParam(0, IAgentHostService)
], AgentSessionSettingsSchemaRegistrar);
export { agentSessionSettingsUri, parseSessionSettingsUri, readSessionConfig, AGENT_SESSION_SETTINGS_SCHEME, SUBSCRIPTION_OWNER2, sessionSettingsPropertyFilter, sessionSettingsLocale, AgentSessionSettingsFileSystemProvider, AgentSessionSettingsSchemaRegistrar };
