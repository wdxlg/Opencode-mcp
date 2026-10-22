// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentSessionSettingsFileSystemProvider.ts
import { URI } from "./module-0032.mjs";
import { toSessionId } from "./module-1767.mjs";
import { localize } from "./module-0001.mjs";
import { serializeAgentHostConfigDocument } from "./module-4323.mjs";
import { AbstractMultiProviderAgentHostConfigSchemaRegistrar, AbstractSessionsAgentHostConfigFileSystemProvider } from "./module-4324.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ILogService } from "./module-0095.mjs";
import { DisposableStore } from "./module-0012.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentSessionSettingsFileSystemProvider.ts
var AGENT_SESSION_SETTINGS_SCHEME = "agent-session-settings";

function agentSessionSettingsUri(session) {
  return URI.from({
    scheme: AGENT_SESSION_SETTINGS_SCHEME,
    authority: session.providerId,
    path: `/${session.resource.scheme}${session.resource.path}.jsonc`
  });
}

function parseSessionSettingsUri(uri4) {
  if (uri4.scheme !== AGENT_SESSION_SETTINGS_SCHEME) {
    return void 0;
  }
  const providerId = uri4.authority;
  if (!providerId) {
    return void 0;
  }
  const path = uri4.path.startsWith("/") ? uri4.path.substring(1) : uri4.path;
  const firstSlash = path.indexOf("/");
  if (firstSlash <= 0) {
    return void 0;
  }
  const resourceScheme = path.substring(0, firstSlash);
  let rest = path.substring(firstSlash);
  const lastDot = rest.lastIndexOf(".");
  if (lastDot > 0) {
    rest = rest.substring(0, lastDot);
  }
  if (!resourceScheme || rest === "/") {
    return void 0;
  }
  const resource = URI.from({ scheme: resourceScheme, path: rest });
  return { providerId, sessionId: toSessionId(providerId, resource) };
}

var sessionSettingsPropertyFilter = (_key, schema10) => {
  const s = schema10;
  return s.sessionMutable === true && s.readOnly !== true;
};

var sessionSettingsLocale = {
  get header() {
    return localize(5005, null);
  },
  get saveHint() {
    return localize(5008, null);
  },
  get parseError() {
    return localize(5007, null);
  },
  get notObject() {
    return localize(5006, null);
  }
};

function serializeSessionSettings(provider, sessionId) {
  return serializeAgentHostConfigDocument(provider.getSessionConfig(sessionId), sessionSettingsPropertyFilter, sessionSettingsLocale);
}

var AgentSessionSettingsFileSystemProvider = class extends AbstractSessionsAgentHostConfigFileSystemProvider {
  constructor(_schemaRegistrar, sessionsProvidersService, logService) {
    super(sessionsProvidersService, logService);
    this._schemaRegistrar = _schemaRegistrar;
    this._schemeLabel = AGENT_SESSION_SETTINGS_SCHEME;
    this._traceTag = "AgentSessionSettings";
    this._locale = sessionSettingsLocale;
  }
  _parseUri(resource) {
    return parseSessionSettingsUri(resource);
  }
  _serialize(provider, ctx) {
    return serializeSessionSettings(provider, ctx.sessionId);
  }
  _watchChanges(provider, ctx, fire) {
    return provider.onDidChangeSessionConfig((changedSessionId) => {
      if (changedSessionId === ctx.sessionId) {
        fire();
      }
    });
  }
  _ensureSchemaRegistered(provider, ctx) {
    const session = provider.getSessions().find((s) => s.sessionId === ctx.sessionId);
    if (session) {
      this._schemaRegistrar.ensureRegistered(session);
    }
  }
  _hasConfig(provider, ctx) {
    return provider.getSessionConfig(ctx.sessionId) !== void 0;
  }
  // The input is the user's full view of editable values. Dispatch as a
  // replace — `replaceSessionConfig` guarantees non-editable properties
  // (non-mutable or readOnly) are preserved regardless of what we send,
  // and unknown keys are ignored.
  _replaceConfig(provider, ctx, values) {
    return provider.replaceSessionConfig(ctx.sessionId, values);
  }
  _describeForTrace(ctx) {
    return `session ${ctx.sessionId}`;
  }
};

AgentSessionSettingsFileSystemProvider = __decorateClass([
  __decorateParam(1, ISessionsProvidersService),
  __decorateParam(2, ILogService)
], AgentSessionSettingsFileSystemProvider);

var AgentSessionSettingsSchemaRegistrar = class extends AbstractMultiProviderAgentHostConfigSchemaRegistrar {
  _propertyFilter() {
    return sessionSettingsPropertyFilter;
  }
  _settingsUri(session) {
    return agentSessionSettingsUri(session).toString();
  }
  // Schema content is served via the `vscode://schemas/...` filesystem
  // provider (see `SettingsFileSystemProvider`); the JSON language client
  // only knows how to fetch schema content for that scheme. The
  // settings-file URI is used as the fileMatch glob so the schema is
  // applied to the actual editor document.
  _schemaId(session) {
    return `vscode://schemas/agent-session-settings/${session.providerId}/${session.resource.scheme}/${session.resource.path}.jsonc`;
  }
  _getConfig(session) {
    const provider = this._sessionsProvidersService.getProvider(session.providerId);
    return provider?.getSessionConfig(session.sessionId);
  }
  _targetsForProvider(provider) {
    return provider.getSessions();
  }
  _observeProvider(provider, onChanged, onRemoved) {
    const store = new DisposableStore();
    store.add(provider.onDidChangeSessionConfig((sessionId) => {
      const session = provider.getSessions().find((s) => s.sessionId === sessionId);
      if (session) {
        onChanged(session);
      }
    }));
    store.add(provider.onDidChangeSessions((e4) => {
      for (const removed of e4.removed) {
        onRemoved(removed);
      }
    }));
    return store;
  }
};
export { agentSessionSettingsUri, parseSessionSettingsUri, serializeSessionSettings, AGENT_SESSION_SETTINGS_SCHEME, sessionSettingsPropertyFilter, sessionSettingsLocale, AgentSessionSettingsFileSystemProvider, AgentSessionSettingsSchemaRegistrar };
