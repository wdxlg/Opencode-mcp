// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostUri.ts
import { Schemas } from "./module-0033.mjs";
import { VSBuffer, decodeBase64, encodeBase64, encodeHex } from "./module-0038.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/platform/agentHost/common/agentHostUri.ts
var AGENT_HOST_SCHEME = "vscode-agent-host";

var identityAgentHostResourceUriMapper = {
  fromAgentHost: (resource) => resource,
  toAgentHost: (resource) => resource
};

var AGENT_HOST_META_PARAM = "_ah";

function toAgentHostUri(originalUri, connectionAuthority) {
  return wrapAgentHostUri(originalUri, connectionAuthority, false);
}

function toAgentHostContentUri(originalUri, connectionAuthority) {
  return wrapAgentHostUri(originalUri, connectionAuthority, true);
}

function wrapAgentHostUri(originalUri, connectionAuthority, contentRef) {
  if (connectionAuthority === "local" && originalUri.scheme === Schemas.file) {
    return originalUri;
  }
  const meta = {
    scheme: originalUri.scheme,
    ...originalUri.authority ? { authority: originalUri.authority } : {},
    ...originalUri.query ? { query: originalUri.query } : {},
    ...contentRef ? { contentRef: true } : {}
  };
  const params = new URLSearchParams();
  params.set(AGENT_HOST_META_PARAM, encodeBase64(VSBuffer.fromString(JSON.stringify(meta)), false, true));
  return URI.from({
    scheme: AGENT_HOST_SCHEME,
    authority: connectionAuthority,
    path: originalUri.path || "/",
    query: params.toString(),
    fragment: originalUri.fragment
  });
}

function readAgentHostUriMeta(agentHostUri) {
  const encoded = agentHostUri.query ? new URLSearchParams(agentHostUri.query).get(AGENT_HOST_META_PARAM) : null;
  if (!encoded) {
    return void 0;
  }
  try {
    return JSON.parse(decodeBase64(encoded).toString());
  } catch {
    return void 0;
  }
}

function isAgentHostContentRefUri(agentHostUri) {
  if (agentHostUri.scheme !== AGENT_HOST_SCHEME) {
    return false;
  }
  return readAgentHostUriMeta(agentHostUri)?.contentRef === true;
}

function fromAgentHostUri(agentHostUri) {
  if (agentHostUri.scheme !== AGENT_HOST_SCHEME) {
    return agentHostUri;
  }
  const meta = readAgentHostUriMeta(agentHostUri);
  if (!meta || typeof meta.scheme !== "string") {
    return URI.from({ scheme: Schemas.file, path: agentHostUri.path, fragment: agentHostUri.fragment });
  }
  return URI.from({
    scheme: meta.scheme,
    authority: meta.authority || void 0,
    path: agentHostUri.path,
    query: meta.query || "",
    fragment: agentHostUri.fragment
  });
}

function createAgentHostResourceUriMapper(connectionAuthority) {
  return {
    fromAgentHost: (resource) => toAgentHostUri(resource, connectionAuthority),
    toAgentHost: (resource) => fromAgentHostUri(resource)
  };
}

function normalizeRemoteAgentHostAddress(address) {
  if (address.startsWith("ws://")) {
    return address.slice("ws://".length);
  }
  return address;
}

var REMOTE_LOCAL_AGENT_HOST_AUTHORITY = "remote_local";

var HEX_AGENT_HOST_AUTHORITY_PREFIX = "hex-";

function agentHostAuthority(address) {
  const normalized = normalizeRemoteAgentHostAddress(address);
  if (normalized === "local") {
    return REMOTE_LOCAL_AGENT_HOST_AUTHORITY;
  }
  if (/^[a-z0-9]+$/.test(normalized)) {
    return normalized;
  }
  if (/^[a-z0-9.:\-]+$/.test(normalized) && !/^hex-/i.test(normalized)) {
    return normalized.replaceAll(":", "__");
  }
  return `${HEX_AGENT_HOST_AUTHORITY_PREFIX}${encodeHex(VSBuffer.fromString(normalized))}`;
}

var LOCAL_AGENT_HOST_AUTHORITY = "local";

var AGENT_HOST_LABEL_FORMATTER = {
  scheme: AGENT_HOST_SCHEME,
  formatting: {
    label: "${path}",
    separator: "/"
  }
};

function agentHostLabelFormatter(authority, os) {
  const isWindows2 = os === 1 /* Windows */;
  return {
    scheme: AGENT_HOST_SCHEME,
    authority,
    formatting: {
      label: "${path}",
      separator: isWindows2 ? "\\" : "/",
      normalizeDriveLetter: isWindows2
    }
  };
}
export { toAgentHostUri, toAgentHostContentUri, wrapAgentHostUri, readAgentHostUriMeta, isAgentHostContentRefUri, fromAgentHostUri, createAgentHostResourceUriMapper, normalizeRemoteAgentHostAddress, agentHostAuthority, agentHostLabelFormatter, AGENT_HOST_SCHEME, identityAgentHostResourceUriMapper, AGENT_HOST_META_PARAM, REMOTE_LOCAL_AGENT_HOST_AUTHORITY, HEX_AGENT_HOST_AUTHORITY_PREFIX, LOCAL_AGENT_HOST_AUTHORITY, AGENT_HOST_LABEL_FORMATTER };
