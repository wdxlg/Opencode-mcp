// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-mcp-modern.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { MODERN_COMMAND_OWNER_PREFIX, MODERN_TASK_OWNER_PREFIX, bridgeOwnerFromIdentity } from "./module-0130.mjs";
import { createMcpHandler, isLegacyRequest } from "./module-0120.mjs";
import { toNodeHandler } from "./module-0127.mjs";


// extensions/opencode/src/bridge-mcp-modern.ts
init_define_OPENCODE_BUILD_INFO();


// extensions/opencode/src/bridge-mcp-modern.ts
var MODERN_CLIENT_INFO_KEY = "io.modelcontextprotocol/clientInfo";

function asRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}

function modernMeta(body) {
  const messages2 = Array.isArray(body) ? body : [body];
  for (const message2 of messages2) {
    const params = asRecord(asRecord(message2)?.params);
    const meta2 = asRecord(params?._meta);
    if (meta2) return meta2;
  }
  return {};
}

function headerValue(request, name) {
  const value = request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value.join("\0") : value ?? "";
}

function modernClientIdentity(request, body) {
  const meta2 = modernMeta(body);
  const clientInfo = asRecord(meta2[MODERN_CLIENT_INFO_KEY]);
  return {
    clientId: headerValue(request, "x-opencode-client-id"),
    account: headerValue(request, "x-opencode-account"),
    workspace: headerValue(request, "x-opencode-workspace"),
    authorization: headerValue(request, "authorization"),
    clientName: typeof clientInfo?.name === "string" ? clientInfo.name : "",
    clientVersion: typeof clientInfo?.version === "string" ? clientInfo.version : ""
  };
}

function modernTaskOwnerId(request, body) {
  return bridgeOwnerFromIdentity(MODERN_TASK_OWNER_PREFIX, modernClientIdentity(request, body));
}

function modernCommandOwnerId(request, body) {
  return bridgeOwnerFromIdentity(MODERN_COMMAND_OWNER_PREFIX, modernClientIdentity(request, body));
}

function nodeHeadersToFetchHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (value === void 0) continue;
    if (Array.isArray(value)) {
      for (const entry of value) headers.append(name, entry);
    } else {
      headers.append(name, value);
    }
  }
  return headers;
}

async function isModernRequest(request, body, diag) {
  try {
    const probe = new Request("http://127.0.0.1/mcp", {
      method: "POST",
      headers: nodeHeadersToFetchHeaders(request.headers),
      body: JSON.stringify(body ?? null)
    });
    return !await isLegacyRequest(probe);
  } catch (error2) {
    diag(`modern classification failed, treating as legacy: ${String(error2)}`);
    return false;
  }
}

async function handleModernPost(request, response, body, deps) {
  await deps.trackRequest(async () => {
    const requestScopeId = modernCommandOwnerId(request, body);
    const handler = createMcpHandler(
      () => deps.createServer(requestScopeId, modernTaskOwnerId(request, body)),
      {
        legacy: "reject",
        onerror: (error2) => deps.diag(`modern handler error: ${error2.message}`)
      }
    );
    await toNodeHandler(handler)(request, response, body);
  });
}
export { asRecord, modernMeta, headerValue, modernClientIdentity, modernTaskOwnerId, modernCommandOwnerId, nodeHeadersToFetchHeaders, isModernRequest, handleModernPost, MODERN_CLIENT_INFO_KEY };
