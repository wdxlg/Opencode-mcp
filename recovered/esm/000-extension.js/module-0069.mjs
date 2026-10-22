// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-oauth-flow.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { EXTERNAL_MCP_OAUTH_PATH, EXTERNAL_MCP_OAUTH_PORT } from "./module-0061.mjs";
import { auth, extractWWWAuthenticateParams, refreshAuthorization } from "./module-0070.mjs";


// extensions/opencode/src/external-mcp-oauth-flow.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_http = require("node:http");

var import_node_crypto10 = require("node:crypto");


// extensions/opencode/src/external-mcp-oauth-flow.ts
var OAuthActionError = class extends Error {
  constructor(message2, status = 401, code = "OAUTH_REQUIRED") {
    super(message2);
    this.status = status;
    this.code = code;
    this.name = "OAuthActionError";
  }
  status;
  code;
};

var oauthRequired = () => new OAuthActionError("\u8BF7\u5728 MCP \u670D\u52A1\u5217\u8868\u4E2D\u70B9\u51FB\u300COAuth \u6388\u6743\u300D\uFF0C\u5B8C\u6210\u6D4F\u89C8\u5668\u767B\u5F55\u3002");

function decodeOAuthState(raw) {
  try {
    if (raw.length > 128e3) throw new Error();
    const state = JSON.parse(raw);
    if (!state || typeof state !== "object" || Array.isArray(state)) throw new Error();
    if (state.tokens && (typeof state.tokens.access_token !== "string" || !state.tokens.access_token || /[\r\n\0]/.test(state.tokens.access_token))) throw new Error();
    return state;
  } catch {
    throw new OAuthActionError("OAuth \u5B89\u5168\u5B58\u50A8\u72B6\u6001\u65E0\u6548\uFF0C\u8BF7\u91CD\u65B0\u914D\u7F6E\u5E76\u6388\u6743\u3002");
  }
}

function oauthEndpoint(value) {
  let url2;
  try {
    url2 = new URL(value);
  } catch {
    throw new OAuthActionError("OAuth \u7AEF\u70B9\u5730\u5740\u65E0\u6548\u3002");
  }
  const loopback = ["127.0.0.1", "[::1]", "localhost"].includes(url2.hostname);
  if (url2.username || url2.password || url2.hash || url2.protocol !== "https:" && !(url2.protocol === "http:" && loopback)) throw new OAuthActionError("OAuth \u7AEF\u70B9\u5FC5\u987B\u4F7F\u7528 HTTPS\uFF08\u672C\u673A\u56DE\u73AF\u5730\u5740\u9664\u5916\uFF09\uFF0C\u4E14\u4E0D\u5F97\u5305\u542B\u7528\u6237\u540D\u3001\u5BC6\u7801\u6216\u7247\u6BB5\u3002");
  return url2;
}

function oauthFetch(fetchImpl = fetch, signal) {
  return async (input, init) => {
    const url2 = oauthEndpoint(input instanceof Request ? input.url : String(input));
    const response = await fetchImpl(url2, { ...init, redirect: "error", signal: AbortSignal.any([AbortSignal.timeout(15e3), ...signal ? [signal] : [], ...init?.signal ? [init.signal] : []]) });
    if (response.status >= 300 && response.status < 400) throw new OAuthActionError("OAuth \u7AEF\u70B9\u4E0D\u5141\u8BB8 HTTP \u91CD\u5B9A\u5411\u3002");
    if (!response.body) return response;
    const reader = response.body.getReader();
    const chunks = [];
    let length = 0;
    try {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        length += part.value.byteLength;
        if (length > 128e3) {
          await reader.cancel();
          throw new OAuthActionError("OAuth \u54CD\u5E94\u8D85\u8FC7\u5B89\u5168\u5927\u5C0F\u9650\u5236\u3002");
        }
        chunks.push(part.value);
      }
    } finally {
      reader.releaseLock();
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new Response(bytes, { status: response.status, statusText: response.statusText, headers: response.headers });
  };
}

function safeOAuthError(error2) {
  if (error2 instanceof OAuthActionError) return error2;
  const code = error2?.code;
  if (["invalid_grant", "invalid_client", "unauthorized_client", "access_denied"].includes(String(code))) return oauthRequired();
  const name = error2 instanceof Error ? error2.name : "";
  if (/Issuer|AuthorizationServerMismatch|InsecureToken|InvalidResource/.test(name)) return new OAuthActionError("OAuth \u5B89\u5168\u9A8C\u8BC1\u672A\u901A\u8FC7\uFF0C\u8BF7\u68C0\u67E5\u8BA4\u8BC1\u670D\u52A1\u5E76\u91CD\u65B0\u6388\u6743\u3002");
  if (/Registration/.test(name)) return new OAuthActionError("OAuth \u5BA2\u6237\u7AEF\u6CE8\u518C\u5931\u8D25\uFF1B\u5982\u670D\u52A1\u4E0D\u652F\u6301\u81EA\u52A8\u6CE8\u518C\uFF0C\u8BF7\u586B\u5199\u5176\u63D0\u4F9B\u7684 Client ID\u3002");
  return new OAuthActionError("OAuth \u8BA4\u8BC1\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\u6216\u54CD\u5E94\u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u540E\u91CD\u8BD5\u3002", 503, "OAUTH_UNAVAILABLE");
}

async function openOAuthCallback(port, state, signal, timeoutMs = 3e5) {
  let complete;
  let fail2;
  let settled = false;
  const result = new Promise((resolve, reject) => {
    complete = resolve;
    fail2 = reject;
  });
  void result.catch(() => void 0);
  let redirectUri = "";
  const server = (0, import_node_http.createServer)((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    const reply = (status, text2) => {
      response.writeHead(status);
      response.end(`<!doctype html><meta charset="utf-8"><title>OpenCode OAuth</title><p>${text2}</p>`);
    };
    let url2;
    try {
      if (!redirectUri || !request.url || request.url.length > 16384) throw new Error();
      url2 = new URL(request.url, redirectUri);
    } catch {
      reply(400, "\u65E0\u6548\u7684\u56DE\u8C03\u8BF7\u6C42\u3002");
      return;
    }
    if (request.method !== "GET" || request.headers.host !== new URL(redirectUri).host || url2.origin !== new URL(redirectUri).origin || url2.pathname !== EXTERNAL_MCP_OAUTH_PATH) {
      reply(404, "\u65E0\u6548\u7684\u56DE\u8C03\u5730\u5740\u3002");
      return;
    }
    const supplied = url2.searchParams.getAll("state");
    if (supplied.length !== 1 || Buffer.byteLength(supplied[0]) !== Buffer.byteLength(state) || !(0, import_node_crypto10.timingSafeEqual)(Buffer.from(supplied[0]), Buffer.from(state))) {
      reply(400, "\u6388\u6743\u6821\u9A8C\u5931\u8D25\uFF0C\u8BF7\u8FD4\u56DE OpenCode \u91CD\u8BD5\u3002");
      return;
    }
    if (settled) {
      reply(410, "\u6B64\u6388\u6743\u56DE\u8C03\u5DF2\u5904\u7406\u3002");
      return;
    }
    const codes2 = url2.searchParams.getAll("code"), errors = url2.searchParams.getAll("error"), issuers = url2.searchParams.getAll("iss");
    if (codes2.length > 1 || errors.length > 1 || issuers.length > 1 || codes2.length && errors.length) {
      reply(400, "\u56DE\u8C03\u53C2\u6570\u65E0\u6548\u3002");
      return;
    }
    if (errors.length) {
      settled = true;
      reply(200, "\u6388\u6743\u672A\u5B8C\u6210\uFF0C\u53EF\u4EE5\u5173\u95ED\u6B64\u9875\u9762\u5E76\u8FD4\u56DE OpenCode\u3002");
      fail2(new OAuthActionError("\u7528\u6237\u672A\u6388\u4E88 OAuth \u6743\u9650\uFF0C\u914D\u7F6E\u5DF2\u4FDD\u7559\uFF0C\u53EF\u7A0D\u540E\u91CD\u8BD5\u3002", 401, "OAUTH_CANCELLED"));
      return;
    }
    if (codes2.length !== 1 || !codes2[0] || codes2[0].length > 8192) {
      reply(400, "\u56DE\u8C03\u7F3A\u5C11\u6709\u6548\u6388\u6743\u7801\u3002");
      return;
    }
    settled = true;
    reply(200, "\u6388\u6743\u56DE\u8C03\u5DF2\u6536\u5230\uFF0C\u8BF7\u8FD4\u56DE OpenCode \u67E5\u770B\u7ED3\u679C\u3002");
    complete({ code: codes2[0], ...issuers.length ? { iss: issuers[0] } : {} });
  });
  server.requestTimeout = 1e4;
  server.headersTimeout = 1e4;
  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, "127.0.0.1", resolve);
    });
  } catch {
    server.close();
    throw new OAuthActionError("OAuth \u672C\u673A\u56DE\u8C03\u7AEF\u53E3\u4E0D\u53EF\u7528\uFF1B\u8BF7\u5148\u7ED3\u675F\u5176\u4ED6\u6388\u6743\u7A97\u53E3\uFF0C\u6216\u8C03\u6574\u56DE\u8C03\u7AEF\u53E3\u540E\u91CD\u8BD5\u3002", 409, "OAUTH_PORT_BUSY");
  }
  const address = server.address();
  if (!address || typeof address === "string") throw new OAuthActionError("\u65E0\u6CD5\u5EFA\u7ACB OAuth \u672C\u673A\u56DE\u8C03\u3002");
  redirectUri = `http://127.0.0.1:${address.port}${EXTERNAL_MCP_OAUTH_PATH}`;
  const abort = () => {
    if (!settled) {
      settled = true;
      fail2(new OAuthActionError("OAuth \u6388\u6743\u5DF2\u53D6\u6D88\uFF0C\u914D\u7F6E\u5DF2\u4FDD\u7559\u3002", 401, "OAUTH_CANCELLED"));
    }
    server.closeAllConnections();
    server.close();
  };
  const timer = setTimeout(() => {
    if (!settled) {
      settled = true;
      fail2(new OAuthActionError("OAuth \u6388\u6743\u7B49\u5F85\u8D85\u65F6\uFF0C\u8BF7\u91CD\u65B0\u53D1\u8D77\u3002", 401, "OAUTH_TIMEOUT"));
    }
    server.closeAllConnections();
    server.close();
  }, timeoutMs);
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  return { redirectUri, result, close: () => {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
    abort();
  } };
}

function providerFor(record4, options, redirectUri, state, redirect, now) {
  let verifier;
  return {
    redirectUrl: redirectUri,
    clientMetadata: { client_name: "OpenCode", redirect_uris: [redirectUri], grant_types: ["authorization_code", "refresh_token"], response_types: ["code"], application_type: "native", token_endpoint_auth_method: record4.clientSecret ? "client_secret_basic" : "none", ...options.scope ? { scope: options.scope } : {} },
    state: () => state,
    clientInformation: (ctx) => options.clientId ? { client_id: options.clientId, ...record4.clientSecret ? { client_secret: record4.clientSecret } : {}, ...ctx?.issuer ? { issuer: ctx.issuer } : {} } : record4.client && (!ctx || record4.client.issuer === ctx.issuer) ? record4.client : void 0,
    saveClientInformation: (client) => {
      record4.client = client;
    },
    tokens: (ctx) => record4.tokens && (!ctx || record4.tokens.issuer === ctx.issuer) ? record4.tokens : void 0,
    saveTokens: (tokens) => {
      if (tokens.token_type.toLowerCase() !== "bearer" || !tokens.access_token || /[\r\n\0]/.test(tokens.access_token) || tokens.expires_in !== void 0 && (!Number.isFinite(tokens.expires_in) || tokens.expires_in < 0)) throw new OAuthActionError("OAuth \u4EE4\u724C\u683C\u5F0F\u65E0\u6548\u3002");
      const previous = record4.tokens;
      record4.tokens = { ...tokens, ...!tokens.refresh_token && previous?.refresh_token ? { refresh_token: previous.refresh_token } : {} };
      record4.expiresAt = typeof tokens.expires_in === "number" ? now() + tokens.expires_in * 1e3 : void 0;
    },
    saveCodeVerifier: (value) => {
      verifier = value;
    },
    codeVerifier: () => {
      if (!verifier) throw oauthRequired();
      return verifier;
    },
    redirectToAuthorization: redirect,
    saveResourceUrl: (value) => {
      record4.resourceIndicator = value;
    },
    saveDiscoveryState: (value) => {
      const metadata = value.authorizationServerMetadata;
      if (!options.clientId && metadata && !metadata.registration_endpoint && record4.client?.issuer !== metadata.issuer) throw new OAuthActionError("\u6B64\u670D\u52A1\u4E0D\u652F\u6301\u81EA\u52A8\u5BA2\u6237\u7AEF\u6CE8\u518C\uFF0C\u8BF7\u5728 OAuth \u8BBE\u7F6E\u4E2D\u586B\u5199\u670D\u52A1\u63D0\u4F9B\u7684 Client ID\u3002", 401, "OAUTH_CLIENT_REQUIRED");
      record4.discovery = value;
    },
    discoveryState: () => record4.discovery,
    invalidateCredentials: (kind) => {
      if (kind === "client" || kind === "all") record4.client = void 0;
      if (kind === "tokens" || kind === "all") {
        record4.tokens = void 0;
        record4.expiresAt = void 0;
      }
      if (kind === "discovery" || kind === "all") record4.discovery = void 0;
      if (kind === "verifier" || kind === "all") verifier = void 0;
    }
  };
}

async function authorizeExternalMcp(record4, options, resource, headers, deps) {
  const state = (0, import_node_crypto10.randomBytes)(32).toString("base64url");
  const callback = await openOAuthCallback(deps.callbackPort ?? options.redirectPort ?? EXTERNAL_MCP_OAUTH_PORT, state, deps.signal, deps.timeoutMs);
  const fetchImpl = deps.fetch ?? fetch;
  const boundedFetch = oauthFetch(fetchImpl, deps.signal);
  const next = structuredClone(record4);
  next.tokens = void 0;
  next.expiresAt = void 0;
  next.discovery = void 0;
  if (!options.clientId && next.redirectUri !== callback.redirectUri) next.client = void 0;
  next.resource = resource;
  next.redirectUri = callback.redirectUri;
  try {
    const serverUrl = oauthEndpoint(resource);
    const probe = (method) => fetchImpl(serverUrl, {
      method,
      redirect: "error",
      signal: AbortSignal.any([AbortSignal.timeout(15e3), ...deps.signal ? [deps.signal] : []]),
      headers: { ...headers, "Content-Type": "application/json", Accept: "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18" },
      ...method === "POST" ? { body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "OpenCode OAuth", version: "1" } } }) } : {}
    });
    let challenge = await probe(deps.httpTransport === "sse" ? "GET" : "POST");
    if (deps.httpTransport === "auto" && [400, 404, 405, 406, 415].includes(challenge.status)) {
      await challenge.body?.cancel().catch(() => void 0);
      challenge = await probe("GET");
    }
    const discovered = challenge.status === 401 ? extractWWWAuthenticateParams(challenge) : {};
    await challenge.body?.cancel().catch(() => void 0);
    const provider = providerFor(next, options, callback.redirectUri, state, async (url2) => {
      oauthEndpoint(url2);
      if (url2.searchParams.get("state") !== state || url2.searchParams.get("code_challenge_method") !== "S256" || !url2.searchParams.get("code_challenge") || url2.searchParams.get("redirect_uri") !== callback.redirectUri) throw new OAuthActionError("OAuth PKCE/\u56DE\u8C03\u6821\u9A8C\u5931\u8D25\u3002");
      if (deps.signal?.aborted || !await deps.openAuthorization(url2, serverUrl)) throw new OAuthActionError("OAuth \u6388\u6743\u5DF2\u53D6\u6D88\uFF0C\u914D\u7F6E\u5DF2\u4FDD\u7559\u3002", 401, "OAUTH_CANCELLED");
    }, deps.now ?? Date.now);
    const parameters = { serverUrl, fetchFn: boundedFetch, scope: options.scope ?? discovered.scope, resourceMetadataUrl: discovered.resourceMetadataUrl };
    if (await auth(provider, { ...parameters, forceReauthorization: true }) !== "REDIRECT") throw new OAuthActionError("OAuth \u670D\u52A1\u672A\u63D0\u4F9B\u6D4F\u89C8\u5668\u6388\u6743\u6D41\u7A0B\u3002");
    const response = await callback.result;
    if (deps.signal?.aborted) throw new OAuthActionError("OAuth \u6388\u6743\u5DF2\u53D6\u6D88\u3002", 401, "OAUTH_CANCELLED");
    if (await auth(provider, { ...parameters, authorizationCode: response.code, iss: response.iss }) !== "AUTHORIZED" || !next.tokens) throw oauthRequired();
    return next;
  } catch (error2) {
    if (deps.signal?.aborted) throw new OAuthActionError("OAuth \u6388\u6743\u5DF2\u53D6\u6D88\uFF0C\u914D\u7F6E\u5DF2\u4FDD\u7559\u3002", 401, "OAUTH_CANCELLED");
    throw safeOAuthError(error2);
  } finally {
    callback.close();
  }
}

async function refreshExternalMcpOAuth(record4, options, resource, deps) {
  const discovery = record4.discovery;
  const issuer = discovery?.authorizationServerMetadata?.issuer ?? discovery?.authorizationServerUrl;
  if (!record4.tokens?.refresh_token || !record4.redirectUri || record4.resource !== resource || !issuer || !discovery?.authorizationServerUrl || record4.tokens.issuer !== issuer) throw oauthRequired();
  const clientInformation = options.clientId ? { client_id: options.clientId, ...record4.clientSecret ? { client_secret: record4.clientSecret } : {}, issuer } : record4.client;
  if (!clientInformation || clientInformation.issuer !== issuer) throw oauthRequired();
  const provider = providerFor(record4, options, record4.redirectUri, "", async () => {
    throw oauthRequired();
  }, deps.now ?? Date.now);
  try {
    const tokens = await refreshAuthorization(discovery.authorizationServerUrl, {
      metadata: discovery.authorizationServerMetadata,
      clientInformation,
      refreshToken: record4.tokens.refresh_token,
      resource: new URL(record4.resourceIndicator ?? resource),
      fetchFn: oauthFetch(deps.fetch, deps.signal)
    });
    await provider.saveTokens({ ...tokens, issuer }, { issuer });
  } catch (error2) {
    if (deps.signal?.aborted) throw new OAuthActionError("OAuth \u8BF7\u6C42\u5DF2\u53D6\u6D88\u3002", 401, "OAUTH_CANCELLED");
    throw safeOAuthError(error2);
  }
}
export { decodeOAuthState, oauthEndpoint, oauthFetch, safeOAuthError, openOAuthCallback, providerFor, authorizeExternalMcp, refreshExternalMcpOAuth, import_node_http, import_node_crypto10, OAuthActionError, oauthRequired };
