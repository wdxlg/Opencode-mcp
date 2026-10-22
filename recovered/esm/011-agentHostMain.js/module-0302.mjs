// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostUri.ts
import { Schemas } from "./module-0024.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0029.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/platform/agentHost/common/agentHostUri.ts
var AGENT_HOST_SCHEME = "vscode-agent-host";

var AGENT_HOST_META_PARAM = "_ah";

function toAgentHostUri(originalUri, connectionAuthority) {
  return wrapAgentHostUri(originalUri, connectionAuthority, false);
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

var LOCAL_AGENT_HOST_AUTHORITY = "local";

var AGENT_HOST_LABEL_FORMATTER = {
  scheme: AGENT_HOST_SCHEME,
  formatting: {
    label: "${path}",
    separator: "/"
  }
};

function agentHostLabelFormatter(authority, os10) {
  const isWindows2 = os10 === 1 /* Windows */;
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
export { toAgentHostUri, wrapAgentHostUri, readAgentHostUriMeta, isAgentHostContentRefUri, fromAgentHostUri, agentHostLabelFormatter, AGENT_HOST_SCHEME, AGENT_HOST_META_PARAM, LOCAL_AGENT_HOST_AUTHORITY, AGENT_HOST_LABEL_FORMATTER };
