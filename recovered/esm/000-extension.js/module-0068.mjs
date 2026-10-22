// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-oauth.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { OAuthActionError, authorizeExternalMcp, decodeOAuthState, oauthRequired, refreshExternalMcpOAuth } from "./module-0069.mjs";


// extensions/opencode/src/external-mcp-oauth.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto11 = require("node:crypto");


// extensions/opencode/src/external-mcp-oauth.ts
var stamp = (token) => (0, import_node_crypto11.createHash)("sha256").update(token).digest("hex");

var ExternalMcpOAuth = class {
  constructor(catalog, deps) {
    this.catalog = catalog;
    this.deps = deps;
    catalog.setOAuthProvider((server) => this.runtime(server));
  }
  catalog;
  deps;
  active = /* @__PURE__ */ new Map();
  handles = /* @__PURE__ */ new Map();
  disposed = false;
  current(id, reference, surface = "either") {
    if (this.disposed || !this.deps.trusted()) throw new OAuthActionError("\u53D7\u9650\u5DE5\u4F5C\u533A\u4E0D\u4F1A\u8BFB\u53D6\u6216\u4F7F\u7528 OAuth \u51ED\u636E\u3002");
    const server = this.catalog.snapshot().servers.find((item) => item.id === id);
    if (!server || !server.enabled || server.authType !== "oauth" || !server.oauthRef || reference && reference !== server.oauthRef || surface === "editor" && !server.editorEnabled || surface === "bridge" && !server.bridgeEnabled || !server.editorEnabled && !server.bridgeEnabled) throw oauthRequired();
    return server;
  }
  async resource(server) {
    if (!server.urlRef) throw oauthRequired();
    return new URL(await this.catalog.readSecret(server, server.urlRef)).toString();
  }
  runtime(server) {
    const reference = server.oauthRef ?? "";
    return { key: reference, token: (staleStamp) => this.token(server.id, reference, "bridge", staleStamp) };
  }
  /** The unguessable handle is never catalog metadata or a discoverable definition; it is stripped before HTTP. */
  async issueEditorHandle(server) {
    this.current(server.id, server.oauthRef, "editor");
    const resource = await this.resource(server);
    for (const [handle2, entry] of this.handles) {
      if (entry.id !== server.id) continue;
      if (entry.reference === server.oauthRef && entry.resource === resource) return handle2;
      this.handles.delete(handle2);
    }
    if (this.handles.size >= 64) this.handles.delete(this.handles.keys().next().value);
    const handle = (0, import_node_crypto11.randomBytes)(32).toString("base64url");
    this.handles.set(handle, { id: server.id, reference: server.oauthRef, resource });
    return handle;
  }
  async editorToken(handle, resource, staleStamp) {
    if (typeof handle !== "string" || handle.length !== 43 || typeof resource !== "string" || resource.length > 8192 || staleStamp !== void 0 && (typeof staleStamp !== "string" || !/^[0-9a-f]{64}$/.test(staleStamp))) throw oauthRequired();
    const binding = this.handles.get(handle);
    let canonical2;
    try {
      canonical2 = new URL(resource).toString();
    } catch {
      throw oauthRequired();
    }
    if (!binding || canonical2 !== binding.resource) throw oauthRequired();
    const server = this.current(binding.id, binding.reference, "editor");
    if (await this.resource(server) !== binding.resource) throw oauthRequired();
    return this.token(binding.id, binding.reference, "editor", staleStamp);
  }
  /** The shared file lock serializes refresh-token rotation across windows, not only concurrent calls in this process. */
  async token(id, reference, surface, staleStamp) {
    this.current(id, reference, surface);
    return this.catalog.withOAuthState(id, reference, async (raw, server, save) => {
      this.current(id, reference, surface);
      const record4 = decodeOAuthState(raw);
      const resource = await this.resource(server);
      if (!record4.tokens || record4.resource !== resource) throw oauthRequired();
      const now = this.deps.now?.() ?? Date.now();
      const lead = Math.min(3e4, Math.max(0, (record4.tokens.expires_in ?? 300) * 100));
      const expired = record4.expiresAt !== void 0 && record4.expiresAt <= now;
      const due = !!record4.tokens.refresh_token && record4.expiresAt !== void 0 && record4.expiresAt <= now + lead;
      const rejected = staleStamp !== void 0 && staleStamp === stamp(record4.tokens.access_token);
      if (expired || due || rejected) {
        try {
          await refreshExternalMcpOAuth(record4, server.oauth ?? {}, resource, this.deps);
          this.current(id, reference, surface);
          await save(JSON.stringify(record4));
        } catch (error2) {
          if (error2 instanceof OAuthActionError && error2.status === 401) {
            record4.tokens = void 0;
            record4.expiresAt = void 0;
            await save(JSON.stringify(record4));
            this.deps.changed?.();
          }
          throw error2;
        }
      }
      this.current(id, reference, surface);
      if (!record4.tokens) throw oauthRequired();
      return { token: record4.tokens.access_token, stamp: stamp(record4.tokens.access_token) };
    });
  }
  async status(server) {
    if (this.disposed || !this.deps.trusted()) return "needs-auth";
    if (this.active.has(server.id)) return "authorizing";
    try {
      if (!server.oauthRef) return "needs-auth";
      const record4 = decodeOAuthState(await this.catalog.readSecret(server, server.oauthRef));
      const now = this.deps.now?.() ?? Date.now();
      return record4.tokens && record4.resource === await this.resource(server) && (record4.expiresAt === void 0 || record4.expiresAt > now || !!record4.tokens.refresh_token) ? "authorized" : "needs-auth";
    } catch {
      return "needs-auth";
    }
  }
  async authorize(id, parent) {
    const server = this.current(id);
    if (this.active.has(id)) throw new OAuthActionError("\u6B64\u670D\u52A1\u6B63\u5728\u7B49\u5F85\u6D4F\u89C8\u5668\u6388\u6743\uFF0C\u8BF7\u5148\u5B8C\u6210\u6216\u53D6\u6D88\u5F53\u524D\u6388\u6743\u3002", 409, "OAUTH_BUSY");
    const controller = new AbortController();
    const signal = parent ? AbortSignal.any([parent, controller.signal]) : controller.signal;
    this.active.set(id, { controller, reference: server.oauthRef, urlRef: server.urlRef });
    this.deps.changed?.();
    try {
      const record4 = await this.catalog.withOAuthState(id, server.oauthRef, async (raw) => decodeOAuthState(raw));
      const runtime = await this.catalog.resolve(server);
      const next = await authorizeExternalMcp(record4, server.oauth ?? {}, runtime.url, runtime.headers, { ...this.deps, signal, httpTransport: runtime.httpTransport });
      if (signal.aborted) throw new OAuthActionError("OAuth \u6388\u6743\u5DF2\u53D6\u6D88\u3002", 401, "OAUTH_CANCELLED");
      this.current(id, server.oauthRef);
      await this.catalog.withOAuthState(id, server.oauthRef, async (_raw, _server, save) => {
        this.current(id, server.oauthRef);
        await save(JSON.stringify(next), true);
      });
      return { authorized: true };
    } finally {
      this.active.delete(id);
      this.deps.changed?.();
    }
  }
  async logout(id) {
    if (!this.deps.trusted()) throw oauthRequired();
    this.cancel(id);
    const server = this.catalog.snapshot().servers.find((item) => item.id === id);
    if (!server?.oauthRef) throw oauthRequired();
    await this.catalog.withOAuthState(id, server.oauthRef, async (raw, _server, save) => {
      const record4 = decodeOAuthState(raw);
      await save(JSON.stringify({ ...record4.clientSecret ? { clientSecret: record4.clientSecret } : {} }), true);
    });
    for (const [handle, entry] of this.handles) if (entry.id === id) this.handles.delete(handle);
    this.deps.changed?.();
  }
  async configure(id, options, clientSecret) {
    if (!this.deps.trusted()) throw oauthRequired();
    this.cancel(id);
    await this.catalog.updateServer(id, async (server, store) => {
      if (server.transport !== "http") throw new OAuthActionError("OAuth \u4EC5\u9002\u7528\u4E8E HTTP/SSE \u670D\u52A1\u3002");
      if (Object.keys(server.headerRefs ?? {}).some((key) => key.toLowerCase() === "authorization")) throw new OAuthActionError("\u8BF7\u5148\u5728\u300C\u5BC6\u94A5\u2026\u300D\u4E2D\u79FB\u9664 Authorization\uFF0C\u518D\u542F\u7528 OAuth\u3002");
      const old = server.oauthRef;
      let previous = {};
      try {
        if (old) previous = decodeOAuthState(await this.catalog.readSecret(server, old));
      } catch {
      }
      const secret = clientSecret ?? (server.oauth?.clientId === options.clientId ? previous.clientSecret : void 0);
      server.authType = "oauth";
      server.oauth = options;
      server.oauthRef = await store(JSON.stringify({ ...options.clientId && secret ? { clientSecret: secret } : {} }));
      return old ? [old] : [];
    });
    this.deps.changed?.();
  }
  cancel(id) {
    this.active.get(id)?.controller.abort();
  }
  cancelAll() {
    for (const entry of this.active.values()) entry.controller.abort();
  }
  cancelUnavailable() {
    for (const [id, active] of this.active) {
      try {
        if (this.current(id, active.reference).urlRef !== active.urlRef) this.cancel(id);
      } catch {
        this.cancel(id);
      }
    }
  }
  dispose() {
    this.disposed = true;
    this.cancelAll();
    this.handles.clear();
  }
};
export { import_node_crypto11, stamp, ExternalMcpOAuth };
