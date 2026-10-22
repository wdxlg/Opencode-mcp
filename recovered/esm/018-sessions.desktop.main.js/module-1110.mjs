// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/copilotCliEventsUri.ts
import { env } from "./module-0015.mjs";
import { joinPath } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { agentHostAuthority, fromAgentHostUri, toAgentHostUri } from "./module-1001.mjs";
import { parseRemoteAgentHostSessionTypeAuthority } from "./module-0959.mjs";
import { Schemas } from "./module-0033.mjs";
import { getCopilotHomePath } from "./module-1109.mjs";


// src/vs/workbench/contrib/chat/browser/copilotCliEventsUri.ts
var COPILOT_CLI_PROVIDER = "copilotcli";

var COPILOT_CLI_LOCAL_AH_SCHEME = `agent-host-${COPILOT_CLI_PROVIDER}`;

var COPILOT_CLI_EH_SCHEME = COPILOT_CLI_PROVIDER;

var COPILOT_CLI_AGENT_PROVIDER = COPILOT_CLI_PROVIDER;

function buildLocalEventsUri(userHome, rawSessionId, environment = env) {
  return joinPath(buildLocalCopilotHomeUri(userHome, environment), "session-state", rawSessionId, "events.jsonl");
}

function buildLocalCopilotLogsUri(userHome, environment = env) {
  return joinPath(buildLocalCopilotHomeUri(userHome, environment), "logs");
}

function buildLocalSessionStateUri(userHome, environment = env) {
  return joinPath(buildLocalCopilotHomeUri(userHome, environment), "session-state");
}

function buildRemoteEventsUri(connection, rawSessionId) {
  const homePath = connection.defaultDirectory;
  if (!homePath) {
    return void 0;
  }
  const trimmed = homePath.endsWith("/") ? homePath.slice(0, -1) : homePath;
  const remoteFileUri = URI.from({
    scheme: "file",
    path: `${trimmed}/.copilot/session-state/${rawSessionId}/events.jsonl`
  });
  const authority = agentHostAuthority(connection.address);
  return toAgentHostUri(remoteFileUri, authority);
}

function buildRemoteCopilotLogsUri(connection) {
  const homePath = connection.defaultDirectory;
  if (!homePath) {
    return void 0;
  }
  const trimmed = homePath.endsWith("/") ? homePath.slice(0, -1) : homePath;
  const remoteFileUri = URI.from({
    scheme: "file",
    path: `${trimmed}/.copilot/logs`
  });
  const authority = agentHostAuthority(connection.address);
  return toAgentHostUri(remoteFileUri, authority);
}

function parseRemoteAuthorityFromScheme(scheme) {
  return parseRemoteAgentHostSessionTypeAuthority(scheme, COPILOT_CLI_PROVIDER);
}

function getCopilotCliSessionRawId(sessionResource) {
  if (!sessionResource) {
    return void 0;
  }
  if (sessionResource.scheme !== COPILOT_CLI_LOCAL_AH_SCHEME && sessionResource.scheme !== COPILOT_CLI_EH_SCHEME && !parseRemoteAuthorityFromScheme(sessionResource.scheme)) {
    return void 0;
  }
  return getRawSessionId(sessionResource);
}

function dedupeMigratedCopilotCliSessions(items, resourceOf) {
  let migratedRawIds;
  for (const item of items) {
    const resource = resourceOf(item);
    if (resource.scheme === COPILOT_CLI_LOCAL_AH_SCHEME) {
      const rawId = getCopilotCliSessionRawId(resource);
      if (rawId) {
        (migratedRawIds ??= /* @__PURE__ */ new Set()).add(rawId);
      }
    }
  }
  if (!migratedRawIds) {
    return items.slice();
  }
  return items.filter((item) => {
    const resource = resourceOf(item);
    if (resource.scheme !== COPILOT_CLI_EH_SCHEME) {
      return true;
    }
    const rawId = getCopilotCliSessionRawId(resource);
    return !rawId || !migratedRawIds.has(rawId);
  });
}

function migratedCopilotCliResource(resource) {
  if (resource?.scheme !== COPILOT_CLI_EH_SCHEME) {
    return void 0;
  }
  const rawId = getCopilotCliSessionRawId(resource);
  return rawId ? URI.from({ scheme: COPILOT_CLI_LOCAL_AH_SCHEME, path: `/${rawId}` }) : void 0;
}

function resolveEventsUri(sessionResource, userHome, getConnectionByAuthority, environment = env) {
  if (!sessionResource) {
    return { kind: "no-session" };
  }
  const rawId = getRawSessionId(sessionResource);
  if (!rawId) {
    return { kind: "no-session" };
  }
  if (sessionResource.scheme === COPILOT_CLI_LOCAL_AH_SCHEME || sessionResource.scheme === COPILOT_CLI_EH_SCHEME) {
    return { kind: "ok", resource: buildLocalEventsUri(userHome, rawId, environment) };
  }
  const remoteAuthority = parseRemoteAuthorityFromScheme(sessionResource.scheme);
  if (remoteAuthority) {
    const connection = getConnectionByAuthority(remoteAuthority);
    if (!connection) {
      return { kind: "remote-not-connected", authority: remoteAuthority };
    }
    const resource = buildRemoteEventsUri(connection, rawId);
    if (!resource) {
      return { kind: "remote-no-home", authority: remoteAuthority };
    }
    return { kind: "ok", resource };
  }
  return { kind: "unsupported-scheme", scheme: sessionResource.scheme };
}

function getRawSessionId(sessionResource) {
  const rawId = sessionResource.path.startsWith("/") ? sessionResource.path.substring(1) : sessionResource.path;
  return rawId || void 0;
}

function buildHostLocalEventsPath(sessionResource, userHome, getConnectionByAuthority, environment = env) {
  const result = resolveEventsUri(sessionResource, userHome, getConnectionByAuthority, environment);
  if (result.kind !== "ok") {
    return void 0;
  }
  if (result.resource.scheme === Schemas.file) {
    return result.resource.fsPath;
  }
  return fromAgentHostUri(result.resource).path.replace(/^\/([a-zA-Z]:)/, "$1");
}

function buildLocalCopilotHomeUri(userHome, environment) {
  return URI.file(getCopilotHomePath(userHome.fsPath, environment));
}
export { buildLocalEventsUri, buildLocalCopilotLogsUri, buildLocalSessionStateUri, buildRemoteEventsUri, buildRemoteCopilotLogsUri, parseRemoteAuthorityFromScheme, getCopilotCliSessionRawId, dedupeMigratedCopilotCliSessions, migratedCopilotCliResource, resolveEventsUri, getRawSessionId, buildHostLocalEventsPath, buildLocalCopilotHomeUri, COPILOT_CLI_PROVIDER, COPILOT_CLI_LOCAL_AH_SCHEME, COPILOT_CLI_EH_SCHEME, COPILOT_CLI_AGENT_PROVIDER };
