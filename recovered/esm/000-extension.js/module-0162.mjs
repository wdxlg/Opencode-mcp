// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/codex-auth.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { fetchWithExtensionHostFallbacks, resolveExtensionHostProxy } from "./module-0106.mjs";


// extensions/opencode/src/codex-auth.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto22 = require("node:crypto");

var import_node_fs22 = __toESM(require("node:fs"));

var import_node_http5 = __toESM(require("node:http"));

var import_node_os8 = __toESM(require("node:os"));

var import_node_path28 = __toESM(require("node:path"));

var vscode11 = __toESM(require("vscode"));

var CODEX_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";

var CODEX_ISSUER = "https://auth.openai.com";

var CODEX_AUTHORIZE_URL = `${CODEX_ISSUER}/oauth/authorize`;

var CODEX_TOKEN_URL = `${CODEX_ISSUER}/oauth/token`;

var CODEX_REVOKE_URL = `${CODEX_ISSUER}/oauth/revoke`;

var CODEX_API_BASE_URL = "https://chatgpt.com/backend-api/codex";

var CODEX_REDIRECT_PORT = 1455;

var CODEX_REDIRECT_URI = `http://localhost:${CODEX_REDIRECT_PORT}/auth/callback`;

var CODEX_SCOPE = "openid profile email offline_access api.connectors.read api.connectors.invoke";

var CODEX_ORIGINATOR = "codex_cli_rs";

var CODEX_CLIENT_VERSION = "0.160.0";

var CODEX_USER_AGENT = `codex_cli_rs/${CODEX_CLIENT_VERSION}`;

var CODEX_BETA_HEADER = "responses=experimental";

var CODEX_AUTH_TIMEOUT_MS = 3e5;

var CODEX_TOKEN_REQUEST_TIMEOUT_MS = 2e4;

var REFRESH_LEAD_TIME_MS = 5 * 6e4;

var authChangeEmitter = new vscode11.EventEmitter();

var loginStateChangeEmitter = new vscode11.EventEmitter();

var onCodexAuthChange = authChangeEmitter.event;

var onCodexLoginStateChange = loginStateChangeEmitter.event;

function codexHomeDir() {
  const home = process.env.CODEX_HOME?.trim();
  return home ? import_node_path28.default.resolve(home) : import_node_path28.default.join(import_node_os8.default.homedir(), ".codex");
}

function authFilePath() {
  return import_node_path28.default.join(codexHomeDir(), "auth.json");
}

function readAuthFile() {
  try {
    const file = authFilePath();
    if (!import_node_fs22.default.existsSync(file)) return void 0;
    return JSON.parse(import_node_fs22.default.readFileSync(file, "utf8"));
  } catch {
    return void 0;
  }
}

function writeAuthFile(auth2) {
  const file = authFilePath();
  import_node_fs22.default.mkdirSync(import_node_path28.default.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
  import_node_fs22.default.writeFileSync(temporary, `${JSON.stringify(auth2, null, 2)}
`, { mode: 384 });
  import_node_fs22.default.renameSync(temporary, file);
}

function storedTokens(auth2) {
  const tokens = auth2?.tokens ?? {};
  return {
    access_token: tokens.access_token ?? auth2?.access_token,
    refresh_token: tokens.refresh_token ?? auth2?.refresh_token,
    id_token: tokens.id_token ?? auth2?.id_token,
    account_id: tokens.account_id ?? auth2?.account_id,
    plan_type: tokens.plan_type ?? auth2?.plan_type
  };
}

function decodeJwtPayload(token) {
  try {
    const segment = token.split(".")[1];
    if (!segment) return void 0;
    const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return void 0;
  }
}

function tokenExpirySeconds(accessToken) {
  const claims = decodeJwtPayload(accessToken);
  return typeof claims?.exp === "number" && Number.isFinite(claims.exp) ? claims.exp : void 0;
}

function authClaim(claims) {
  const value = claims?.["https://api.openai.com/auth"];
  return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}

function accountFromAuth(auth2) {
  if (!auth2) return void 0;
  const tokens = storedTokens(auth2);
  if (!tokens.access_token) return void 0;
  const claims = typeof tokens.id_token === "string" ? decodeJwtPayload(tokens.id_token) : void 0;
  const authInfo = authClaim(claims);
  const accountId = tokens.account_id ?? (typeof authInfo?.chatgpt_account_id === "string" ? authInfo.chatgpt_account_id : void 0) ?? (typeof authInfo?.account_id === "string" ? authInfo.account_id : void 0);
  if (!accountId) return void 0;
  return {
    accountId,
    email: typeof authInfo?.email === "string" ? authInfo.email : typeof claims?.email === "string" ? claims.email : void 0,
    planType: tokens.plan_type ?? (typeof authInfo?.chatgpt_plan_type === "string" ? authInfo.chatgpt_plan_type : void 0)
  };
}

async function postTokenEndpoint(body, contentType, label) {
  const target = new URL(CODEX_TOKEN_URL);
  const httpConfiguration = vscode11.workspace.getConfiguration("http");
  const proxySupport = httpConfiguration.get("proxySupport");
  const configuredProxy = httpConfiguration.get("proxy")?.trim();
  const proxyUrl = proxySupport === "off" ? void 0 : resolveExtensionHostProxy(target, configuredProxy);
  const signal = AbortSignal.timeout(CODEX_TOKEN_REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetchWithExtensionHostFallbacks(target, {
      method: "POST",
      headers: { "content-type": contentType },
      body,
      signal,
      proxyUrl,
      configuredProxy,
      rejectUnauthorized: httpConfiguration.get("proxyStrictSSL", true),
      useElectron: proxySupport !== "off",
      proxySupport: proxySupport === "off" ? "off" : void 0,
      attemptTimeoutMs: 8e3
    });
  } catch (error2) {
    const timedOut = signal.aborted || error2 instanceof Error && (error2.name === "TimeoutError" || error2.name === "AbortError");
    const detail = timedOut ? "token request timed out" : error2 instanceof Error ? error2.message : String(error2);
    throw new Error(`${label}: ${detail}.`);
  }
  const raw = await response.text();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
  }
  if (!response.ok) {
    const detail = typeof payload?.error_description === "string" ? payload.error_description : typeof payload?.error === "string" ? payload.error : typeof payload?.detail === "string" ? payload.detail : raw.slice(0, 300);
    throw new Error(`${label}: ${detail || `HTTP ${response.status}`}`);
  }
  if (typeof payload?.access_token !== "string") throw new Error(`${label}: the token endpoint returned no access token.`);
  return payload;
}

async function exchangeCode(code, codeVerifier) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: CODEX_REDIRECT_URI,
    client_id: CODEX_CLIENT_ID,
    code_verifier: codeVerifier
  }).toString();
  const payload = await postTokenEndpoint(body, "application/x-www-form-urlencoded", "Codex sign-in failed");
  return {
    access_token: payload.access_token,
    refresh_token: typeof payload.refresh_token === "string" ? payload.refresh_token : void 0,
    id_token: typeof payload.id_token === "string" ? payload.id_token : void 0
  };
}

async function refreshTokens(tokens, auth2) {
  if (!tokens.refresh_token) {
    throw new Error("Codex session has no refresh token. Sign in again with 'OpenCode: Sign in with Codex'.");
  }
  const body = JSON.stringify({ client_id: CODEX_CLIENT_ID, grant_type: "refresh_token", refresh_token: tokens.refresh_token });
  const refreshed = await postTokenEndpoint(body, "application/json", "Codex session refresh failed");
  const nextIdToken = typeof refreshed.id_token === "string" ? refreshed.id_token : tokens.id_token;
  const claims = typeof nextIdToken === "string" ? decodeJwtPayload(nextIdToken) : void 0;
  const authInfo = authClaim(claims);
  const accountId = tokens.account_id ?? (typeof authInfo?.chatgpt_account_id === "string" ? authInfo.chatgpt_account_id : void 0);
  if (!accountId) {
    throw new Error("Codex session refresh succeeded but the account ID could not be determined. Sign in again.");
  }
  writeAuthFile({
    ...auth2 ?? {},
    auth_mode: auth2?.auth_mode ?? "chatgpt",
    tokens: {
      access_token: refreshed.access_token,
      refresh_token: typeof refreshed.refresh_token === "string" ? refreshed.refresh_token : tokens.refresh_token,
      id_token: claims ?? nextIdToken,
      account_id: accountId,
      plan_type: tokens.plan_type ?? (typeof authInfo?.chatgpt_plan_type === "string" ? authInfo.chatgpt_plan_type : void 0)
    },
    last_refresh: (/* @__PURE__ */ new Date()).toISOString()
  });
  authChangeEmitter.fire();
  return { accessToken: refreshed.access_token, accountId };
}

var refreshInFlight;

async function getRequestContext(forceRefresh = false) {
  if (forceRefresh && refreshInFlight) return refreshInFlight;
  const auth2 = readAuthFile();
  const tokens = storedTokens(auth2);
  if (!tokens.access_token) {
    throw new Error("Not signed in to Codex. Run 'OpenCode: Sign in with Codex' first.");
  }
  const account = accountFromAuth(auth2);
  if (!account) {
    throw new Error("Codex credentials are missing the account ID. Sign in again with 'OpenCode: Sign in with Codex'.");
  }
  const expiresAt = tokenExpirySeconds(tokens.access_token);
  const needsRefresh = forceRefresh || expiresAt === void 0 || expiresAt * 1e3 < Date.now() + REFRESH_LEAD_TIME_MS;
  if (!needsRefresh) return { accessToken: tokens.access_token, accountId: account.accountId };
  if (!refreshInFlight) {
    refreshInFlight = refreshTokens(tokens, auth2).finally(() => {
      refreshInFlight = void 0;
    });
  }
  return refreshInFlight;
}

async function getStatus() {
  const auth2 = readAuthFile();
  const account = accountFromAuth(auth2);
  if (!account) return { signedIn: false };
  const tokens = storedTokens(auth2);
  return { signedIn: true, account, expiresAt: tokenExpirySeconds(tokens.access_token ?? "") };
}

async function revokeTokensBestEffort(tokens) {
  const token = tokens.refresh_token ?? tokens.access_token;
  if (!token) return;
  try {
    await fetch(CODEX_REVOKE_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: CODEX_CLIENT_ID, token }).toString(),
      signal: AbortSignal.timeout(5e3)
    });
  } catch {
  }
}

async function signOut() {
  const auth2 = readAuthFile();
  const tokens = storedTokens(auth2);
  if (auth2?.openai_api_key && !tokens.access_token) {
    throw new Error("~/.codex/auth.json contains an API-key login. OpenCode only manages ChatGPT sign-in; sign out with the Codex CLI instead.");
  }
  await revokeTokensBestEffort(tokens);
  const file = authFilePath();
  if (import_node_fs22.default.existsSync(file)) import_node_fs22.default.rmSync(file, { force: true });
  authChangeEmitter.fire();
  loginStateChangeEmitter.fire();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character] ?? character);
}

async function startLogin(cancellationToken) {
  const existing = await getStatus();
  if (existing.signedIn) {
    throw new Error(`Already signed in to Codex as ${existing.account?.email ?? existing.account?.accountId}. Sign out first to switch accounts.`);
  }
  const codeVerifier = (0, import_node_crypto22.randomBytes)(48).toString("base64url");
  const codeChallenge = (0, import_node_crypto22.createHash)("sha256").update(codeVerifier).digest("base64url");
  const state = (0, import_node_crypto22.randomBytes)(16).toString("hex");
  const authorizeParams = new URLSearchParams({
    response_type: "code",
    client_id: CODEX_CLIENT_ID,
    redirect_uri: CODEX_REDIRECT_URI,
    scope: CODEX_SCOPE,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    id_token_add_organizations: "true",
    codex_cli_simplified_flow: "true",
    state,
    originator: CODEX_ORIGINATOR
  });
  const authorizeUrl = `${CODEX_AUTHORIZE_URL}?${authorizeParams.toString()}`;
  let server;
  let settled = false;
  let resolveCode;
  let rejectLogin;
  const settle = (result) => {
    if (settled) return;
    settled = true;
    if (server) {
      try {
        server.close();
      } catch {
      }
      server = void 0;
    }
    if (typeof result === "string") resolveCode?.(result);
    else rejectLogin?.(result);
  };
  server = import_node_http5.default.createServer((request, response) => {
    let url2;
    try {
      url2 = new URL(request.url ?? "/", CODEX_REDIRECT_URI);
    } catch {
      response.writeHead(400);
      response.end("Bad request");
      return;
    }
    if (url2.pathname !== "/auth/callback") {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    const errorCode = url2.searchParams.get("error");
    if (errorCode) {
      const description = url2.searchParams.get("error_description") ?? "The authorization request was denied.";
      response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
      response.end(`<!doctype html><meta charset="utf-8"><h3>Codex sign-in failed</h3><p>${escapeHtml(description)}</p><p>You can close this window and try again.</p>`);
      settle(new Error(`Codex sign-in was not completed: ${description}`));
      return;
    }
    const returnedState = url2.searchParams.get("state");
    if (returnedState !== state) {
      response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
      response.end('<!doctype html><meta charset="utf-8"><h3>Codex sign-in failed</h3><p>The callback state did not match. You can close this window and try again.</p>');
      settle(new Error("Codex sign-in callback state mismatch."));
      return;
    }
    const code2 = url2.searchParams.get("code");
    if (!code2) {
      response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
      response.end('<!doctype html><meta charset="utf-8"><h3>Codex sign-in failed</h3><p>Missing authorization code. You can close this window and try again.</p>');
      settle(new Error("Codex sign-in callback was missing the authorization code."));
      return;
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end('<!doctype html><meta charset="utf-8"><h3>Signed in to Codex</h3><p>You can close this window and return to OpenCode.</p>');
    settle(code2);
  });
  const codePromise = new Promise((resolve, reject) => {
    resolveCode = resolve;
    rejectLogin = reject;
  });
  const timeout = setTimeout(() => settle(new Error(`Codex sign-in timed out after ${CODEX_AUTH_TIMEOUT_MS / 1e3} seconds.`)), CODEX_AUTH_TIMEOUT_MS);
  const cancellation = cancellationToken?.onCancellationRequested(() => settle(new vscode11.CancellationError()));
  const cleanup = () => {
    clearTimeout(timeout);
    cancellation?.dispose();
  };
  try {
    await new Promise((resolveListen, rejectListen) => {
      server?.once("error", (error2) => {
        if (error2.code === "EADDRINUSE") {
          rejectListen(new Error(`Port ${CODEX_REDIRECT_PORT} is already in use. Free it (it is the Codex OAuth callback port) and try again.`));
        } else {
          rejectListen(error2);
        }
      });
      server?.listen(CODEX_REDIRECT_PORT, "localhost", resolveListen);
    });
  } catch (error2) {
    cleanup();
    try {
      server?.close();
    } catch {
    }
    throw error2;
  }
  const opened = await vscode11.env.openExternal(vscode11.Uri.parse(authorizeUrl));
  if (!opened) {
    cleanup();
    throw new Error("Could not open the browser for Codex sign-in. Run 'OpenCode: Show Codex Account Status' for help.");
  }
  let code;
  try {
    code = await codePromise;
  } finally {
    cleanup();
  }
  const tokens = await exchangeCode(code, codeVerifier);
  const claims = typeof tokens.id_token === "string" ? decodeJwtPayload(tokens.id_token) : void 0;
  const authInfo = authClaim(claims);
  const accountId = typeof authInfo?.chatgpt_account_id === "string" ? authInfo.chatgpt_account_id : "";
  if (!accountId) {
    throw new Error("Codex sign-in succeeded but the account ID could not be read from the token. Try signing in again.");
  }
  const account = {
    accountId,
    email: typeof authInfo?.email === "string" ? authInfo.email : typeof claims?.email === "string" ? claims.email : void 0,
    planType: typeof authInfo?.chatgpt_plan_type === "string" ? authInfo.chatgpt_plan_type : void 0
  };
  writeAuthFile({
    auth_mode: "chatgpt",
    tokens: {
      id_token: claims ?? tokens.id_token,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      account_id: accountId,
      plan_type: account.planType
    },
    last_refresh: (/* @__PURE__ */ new Date()).toISOString()
  });
  authChangeEmitter.fire();
  loginStateChangeEmitter.fire();
  return account;
}

var codexAuthManager = {
  getStatus,
  getRequestContext,
  forceRefresh: () => getRequestContext(true),
  startLogin,
  signOut
};
export { codexHomeDir, authFilePath, readAuthFile, writeAuthFile, storedTokens, decodeJwtPayload, tokenExpirySeconds, authClaim, accountFromAuth, postTokenEndpoint, exchangeCode, refreshTokens, getRequestContext, getStatus, revokeTokensBestEffort, signOut, escapeHtml, startLogin, import_node_crypto22, import_node_fs22, import_node_http5, import_node_os8, import_node_path28, vscode11, CODEX_CLIENT_ID, CODEX_ISSUER, CODEX_AUTHORIZE_URL, CODEX_TOKEN_URL, CODEX_REVOKE_URL, CODEX_API_BASE_URL, CODEX_REDIRECT_PORT, CODEX_REDIRECT_URI, CODEX_SCOPE, CODEX_ORIGINATOR, CODEX_CLIENT_VERSION, CODEX_USER_AGENT, CODEX_BETA_HEADER, CODEX_AUTH_TIMEOUT_MS, CODEX_TOKEN_REQUEST_TIMEOUT_MS, REFRESH_LEAD_TIME_MS, authChangeEmitter, loginStateChangeEmitter, onCodexAuthChange, onCodexLoginStateChange, refreshInFlight, codexAuthManager };
