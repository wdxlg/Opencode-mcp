// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-mcp-transport.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { BridgeSessionRegistry } from "./module-0137.mjs";
import { bridgeManagedCommandOwnerId } from "./module-0138.mjs";
import { createBridgeHttpRoutes, handleBridgeHttpRequest, writeBridgeJsonError, writeBridgeJsonRpcError } from "./module-0132.mjs";
import { BRIDGE_SERVER_INSTRUCTIONS, BRIDGE_TOOL_DEFINITIONS, MAX_REQUEST_BYTES, MAX_SESSIONS, SESSION_EVENT_STORE_LIMIT, SESSION_IDLE_TIMEOUT_MS, SESSION_KEEPALIVE_INTERVAL_MS, SESSION_PRUNE_INTERVAL_MS, SESSION_RETRY_INTERVAL_MS } from "./module-0140.mjs";
import { isInitializeRequest2 } from "./module-0122.mjs";
import { handleModernPost, isModernRequest } from "./module-0129.mjs";
import { JsonRpcRequestIdRegistry, requestIdsOfRequest } from "./module-0136.mjs";
import { BoundedInMemoryEventStore } from "./module-0131.mjs";
import { NodeStreamableHTTPServerTransport } from "./module-0127.mjs";
import { OPENCODE_BEHAVIOR_VERSION } from "./module-0134.mjs";
import { Server } from "./module-0121.mjs";
import { CUSTOM_TOOL_OUTPUT_SCHEMA } from "./module-0029.mjs";
// Multica-inspired ops layer (design borrowed from multica-ai/multica, code self-implemented): wraps every
// tools/call (task-card sync, run records, steer, …) and adds the opencode_ops tool. See docs/multica-borrow.md.
import { multicaRuntime } from "./multica/hooks.mjs";


// extensions/opencode/src/bridge-mcp-transport.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto19 = require("node:crypto");

var import_node_http4 = require("node:http");


// extensions/opencode/src/bridge-mcp-transport.ts
function bridgeMethodOf(body) {
  const list = Array.isArray(body) ? body : [body];
  return list.map((message2) => {
    if (!message2 || typeof message2 !== "object") return "(non-object)";
    const method = message2.method;
    return typeof method === "string" ? method : "(no method)";
  }).join(",");
}

var BridgeMcpTransport = class {
  constructor(deps) {
    this.deps = deps;
    deps.log("[bridge] session continuity: bounded-retention-v1 (capacity bounded; explicit close/shutdown still apply)");
    this.sessions = new BridgeSessionRegistry({
      closeSession: (session) => {
        try {
          void session.transport.close();
        } catch {
        }
        try {
          void session.server.close();
        } catch {
        }
      },
      onSessionDestroyed: (sessionId, _session, reason) => {
        const commandOwnerId = _session.owner || bridgeManagedCommandOwnerId(sessionId);
        // A replacement connection for this proven source retains its command scope.
        if (!this.hasOwnerPeer(commandOwnerId)) {
          this.deps.endRemoteConversation(commandOwnerId);
          this.deps.releaseCommandOwner(commandOwnerId);
        }
        this.revision_ += 1;
        this.deps.log(`[bridge] session destroyed: ${sessionId} reason=${reason}`);
      }
    });
  }
  deps;
  sessions;
  httpServer;
  localPort;
  sessionPruneTimer;
  activeRequests = 0;
  revision_ = 0;
  connectionEpoch = (0, import_node_crypto19.randomUUID)();
  modernConnections = new Map();
  presenceLeaseMs = 120000;
  /**
   * DELETE can cause the SDK to emit both onsessionclosed and onclose. Retain
   * the request context only while its handler is in flight so either callback
   * preserves the client-requested reason without mislabeling other closes.
   */
  deleteInFlightSessionIds = /* @__PURE__ */ new Set();
  lifecycle = "idle";
  startInFlight;
  closeInFlight;
  startOptions;
  /** Transport-side revision; the facade adds this to its own for getStatus(). */
  get revision() {
    return this.revision_;
  }
  snapshot() {
    let lastSessionActivityAt;
    for (const session of this.sessions.values()) {
      lastSessionActivityAt = Math.max(lastSessionActivityAt ?? 0, session.lastActivity);
    }
    return {
      localPort: this.localPort,
      activeRequests: this.activeRequests,
      connected: this.currentConnections().length > 0,
      revision: this.revision_,
      sessions: this.sessions.size,
      lastSessionActivityAt
    };
  }
  /** Internal (non-snapshot) predicate for facade lifecycle/tunnel-recovery reads. */
  isListening() {
    return this.lifecycle === "listening";
  }
  now() {
    return this.deps.now ? this.deps.now() : Date.now();
  }
  // ---- Lifecycle (segmented; never a single reordering stop()) --------------
  /**
   * Start the local HTTP/MCP listener. Idempotent and concurrency-safe: a second
   * call while `starting` reuses the in-flight promise (only one listen), a call
   * while `listening` resolves immediately, and a call while `closing` waits for
   * the close to finish before starting fresh.
   */
  async start(options) {
    if (this.lifecycle === "listening") return;
    if (this.lifecycle === "starting" && this.startInFlight) return this.startInFlight;
    if (this.lifecycle === "closing" && this.closeInFlight) {
      await this.closeInFlight;
      return this.start(options);
    }
    this.lifecycle = "starting";
    const startOptions = { ...options };
    this.startOptions = startOptions;
    const run = (async () => {
      try {
        await this.startHttpServer(startOptions);
        this.lifecycle = "listening";
      } catch (error2) {
        const server = this.httpServer;
        this.httpServer = void 0;
        if (server) {
          await new Promise((resolve) => server.close(() => resolve()));
        }
        if (this.sessionPruneTimer) {
          this.sessionPruneTimer.clear();
          this.sessionPruneTimer = void 0;
        }
        this.localPort = void 0;
        this.startOptions = void 0;
        this.lifecycle = "idle";
        throw error2;
      }
    })();
    this.startInFlight = run;
    try {
      await run;
    } finally {
      this.startInFlight = void 0;
    }
  }
  /**
   * First stop segment: stop pruning and destroy all sessions. Intentionally
   * does NOT zero `activeRequests` — that happens in closeListener(), preserving
   * the original ordering (sessions/prune → tunnel kill → activeRequests/listener).
   */
  destroySessionsAndStopPruning() {
    if (this.sessionPruneTimer) {
      this.sessionPruneTimer.clear();
      this.sessionPruneTimer = void 0;
    }
    this.sessions.destroyAll("bridge-shutdown");
    this.modernConnections.clear();
  }
  /**
   * Third stop segment: zero active requests, close the listener and clear the
   * local port. Idempotent and concurrency-safe. If a start is still in flight,
   * wait for it to settle first — swallowing any startup error so cleanup still
   * completes — then close.
   */
  async closeListener() {
    if (this.lifecycle === "closing" && this.closeInFlight) return this.closeInFlight;
    if (this.lifecycle === "starting" && this.startInFlight) {
      try {
        await this.startInFlight;
      } catch {
      }
      return this.closeListener();
    }
    if (this.lifecycle === "idle") {
      this.activeRequests = 0;
      this.localPort = void 0;
      this.startOptions = void 0;
      return;
    }
    this.lifecycle = "closing";
    const run = (async () => {
      this.activeRequests = 0;
      const server = this.httpServer;
      this.httpServer = void 0;
      if (server) {
        await new Promise((resolve) => server.close(() => resolve()));
      }
      this.localPort = void 0;
      this.startOptions = void 0;
    })();
    this.closeInFlight = run;
    try {
      await run;
    } finally {
      this.lifecycle = "idle";
      this.closeInFlight = void 0;
    }
  }
  // ---- HTTP listener -------------------------------------------------------
  async startHttpServer(options) {
    this.connectionEpoch = (0, import_node_crypto19.randomUUID)();
    this.modernConnections.clear();
    const routes = createBridgeHttpRoutes(options.routeToken);
    const handler = (request, response) => {
      void handleBridgeHttpRequest(
        {
          routes,
          maxRequestBytes: MAX_REQUEST_BYTES,
          // Keep the optional Streamable HTTP GET/SSE channel available for every
          // provider. Some remote MCP clients open it immediately after initialize;
          // rejecting it only for Quick Tunnel made otherwise healthy servers look
          // disconnected even though POST JSON responses were working.
          standaloneGetEnabled: true
        },
        {
          getSessionCount: () => this.sessions.size,
          handlePost: (incoming, outgoing, body, sessionId) => this.handlePost(incoming, outgoing, body, sessionId),
          handleGet: (incoming, outgoing, sessionId) => this.handleGet(incoming, outgoing, sessionId),
          handleDelete: (incoming, outgoing, sessionId) => this.handleDelete(incoming, outgoing, sessionId)
        },
        request,
        response
      ).catch((error2) => {
        const message2 = error2 instanceof Error ? error2.message : String(error2);
        this.deps.log(`[bridge] HTTP error: ${message2}`);
        this.deps.log(`[bridge] HTTP error STACK: ${error2 instanceof Error ? error2.stack : "n/a"}`);
        writeBridgeJsonError(response, 500, message2);
      });
    };
    const server = this.deps.createHttpServer ? this.deps.createHttpServer(handler) : (0, import_node_http4.createServer)(handler);
    this.httpServer = server;
    server.keepAliveTimeout = 75e3; server.headersTimeout = 76e3; // OpenCode: Tailscale Funnel/Cloudflare reuse idle upstream connections longer than Node default 5s; a socket closed mid-reuse shows as intermittent 502 Bad Gateway
    await new Promise((resolve, reject) => {
      const onError = (error2) => {
        server.off("listening", onListening);
        if (options.provider === "cloudflare-named" && error2.code === "EADDRINUSE") {
          reject(new Error(`Cloudflare Named Tunnel local port ${options.namedTunnelLocalPort} is already in use. Choose another port and update the Cloudflare published application Service URL.`));
          return;
        }
        reject(error2);
      };
      const onListening = () => {
        server.off("error", onError);
        resolve();
      };
      server.once("error", onError);
      server.once("listening", onListening);
      server.listen(options.provider === "cloudflare-named" ? options.namedTunnelLocalPort : 0, "127.0.0.1");
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Bridge local HTTP server did not expose a TCP port.");
    this.localPort = address.port;
    this.sessionPruneTimer = this.deps.createTimer ? this.deps.createTimer(() => this.pruneSessions(), SESSION_PRUNE_INTERVAL_MS) : createUnrefInterval(() => this.pruneSessions(), SESSION_PRUNE_INTERVAL_MS);
  }
  // ---- Request handlers ----------------------------------------------------
  commandOwner(scope, binding) {
    // Each MCP dialogue keeps its own owner; one assistant source link may carry several parallel dialogues.
    if (!binding?.bindingId) return bridgeManagedCommandOwnerId(scope);
    const sourceTag = ":assistant-source:" + binding.bindingId;
    return bridgeManagedCommandOwnerId(String(scope || "").includes(sourceTag) ? scope : scope + sourceTag);
  }
  hasOwnerPeer(owner) {
    if (this.sessions.values().some(session => session.owner === owner && session.confirmed && !session.superseded)) return true;
    const peer = this.modernConnections.get(owner);
    return !!peer && (peer.activeRequests > 0 || this.now() - peer.lastSeen <= this.presenceLeaseMs);
  }
  noteModern(owner, binding, delta = 0) {
    const at = this.now(), previous = this.modernConnections.get(owner);
    this.modernConnections.set(owner, { owner, sourceBindingId: binding?.bindingId || null, confirmedAt: previous?.confirmedAt || at, lastSeen: at, activeRequests: Math.max(0, (previous?.activeRequests || 0) + delta) });
    for (const [key, peer] of this.modernConnections) if (!peer.activeRequests && at - peer.lastSeen > this.presenceLeaseMs) this.modernConnections.delete(key);
    if(this.modernConnections.size>256){const oldest=[...this.modernConnections].filter(([,peer])=>!peer.activeRequests).sort((a,b)=>a[1].lastSeen-b[1].lastSeen)[0];if(oldest)this.modernConnections.delete(oldest[0]);}
  }
  currentConnections() {
    if (this.lifecycle !== "listening") return [];
    const at = this.now(), peers = new Map();
    const add = peer => {
      const previous = peers.get(peer.owner);
      if (!previous) { peers.set(peer.owner,peer); return; }
      const latest=peer.lastSeen>=previous.lastSeen?peer:previous;
      const activeRequests=(peer.activeRequests||0)+(previous.activeRequests||0),activeStreams=(peer.activeStreams||0)+(previous.activeStreams||0);
      peers.set(peer.owner,{...latest,lastSeen:Math.max(peer.lastSeen,previous.lastSeen),confirmedAt:Math.max(peer.confirmedAt,previous.confirmedAt),activeRequests,activeStreams,connectionState:activeStreams?"stream-open":activeRequests?"request-active":"confirmed-recent"});
    };
    for (const session of this.sessions.values()) {
      if (!session.confirmed || session.superseded) continue;
      if (!session.activeRequests && !session.activeStreams && at - session.lastConfirmedAt > this.presenceLeaseMs) continue;
      add({ owner: session.owner, sourceBindingId: session.assistantBindingId, confirmed: true, confirmedAt: session.confirmedAt, lastSeen: session.lastConfirmedAt, activeRequests: session.activeRequests, activeStreams: session.activeStreams, connectionState: session.activeStreams ? "stream-open" : session.activeRequests ? "request-active" : "confirmed-recent", protocol: "session", epoch: this.connectionEpoch });
    }
    for (const peer of this.modernConnections.values()) {
      if (!peer.activeRequests && at - peer.lastSeen > this.presenceLeaseMs) continue;
      add({ ...peer, confirmed: true, activeStreams: 0, connectionState: peer.activeRequests ? "request-active" : "confirmed-recent", protocol: "stateless", epoch: this.connectionEpoch });
    }
    return [...peers.values()];
  }
  confirmSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || session.superseded) return;
    session.lastConfirmedAt = this.now();
    if (session.confirmed) return;
    session.confirmed = true; session.confirmedAt = session.lastConfirmedAt;
    void this.deps.recordAssistantConnection?.(session.assistantConnectionBinding);
    this.deps.beginRemoteConversation(session.owner);
    // Only an authenticated source binding can identify a real dialogue. Never use
    // a nickname, shared URL, IP, or client-supplied overview UUID to evict a peer.
    // Parallel dialogues may share one source link: never supersede a sibling session (each has its own owner).
    if (false) for (const previous of this.sessions.values()) {
      if (previous === session || previous.assistantBindingId !== session.assistantBindingId || previous.superseded) continue;
      previous.superseded = true;
      this.retireSuperseded(previous.id);
    }
    this.revision_++;
  }
  retireSuperseded(sessionId) {
    const session = this.sessions.get(sessionId);
    // Drain already-accepted RPCs; closing a notification stream is not permission
    // to cancel a shell command or an external operation.
    if (session?.superseded && !session.activeRequests) this.sessions.destroy(sessionId, "source-superseded");
  }
  assistantBinding(request,response) {
    try { return {ok:true,binding:this.deps.resolveAssistantSource?.(request)||null}; }
    catch { writeBridgeJsonError(response,403,"Assistant source capability is invalid, revoked or outside its original route.");return {ok:false}; }
  }
  sameAssistantBinding(session,binding,response) {
    if((session.assistantBindingId||null)!==(binding?.bindingId||null)){writeBridgeJsonError(response,403,"The MCP session belongs to another assistant source.");return false;}return true;
  }
  async handlePost(request, response, body, sessionId) {
    const source=this.assistantBinding(request,response);if(!source.ok)return;
    if (!sessionId && !isInitializeRequest2(body) && await isModernRequest(request, body, this.deps.diag)) {
      this.deps.diag(`POST modern-era method=${bridgeMethodOf(body)}`);
      await handleModernPost(request, response, body, this.modernDeps(source.binding));
      return;
    }
    if (sessionId) {
      const session = this.sessions.get(sessionId);
      if (!session) {
        this.deps.diag(`POST no-session sid=${sessionId.slice(0, 8)} -> 404`);
        writeBridgeJsonError(response, 404, "Session not found. The MCP session may have expired.");
        return;
      }
      if(!this.sameAssistantBinding(session,source.binding,response))return;
      if (session.superseded) { writeBridgeJsonError(response,409,"This dialogue already has a newer confirmed MCP connection. Reuse its current connection instead of opening duplicates."); return; }
      session.lastActivity = this.now();
      const requestIds = requestIdsOfRequest(body);
      const claim = session.requestIds.claim(requestIds);
      if (!claim.ok) {
        this.deps.diag(`POST duplicate request id sid=${sessionId.slice(0, 8)} id=${String(claim.conflictId)}`);
        writeBridgeJsonRpcError(
          response,
          409,
          -32009,
          "Duplicate JSON-RPC request id is already in flight for this MCP session.",
          claim.conflictId
        );
        return;
      }
      session.activeRequests += 1;
      this.activeRequests += 1;
      try {
        await session.transport.handleRequest(request, response, body);
        if(session.confirmed && response.statusCode < 400) await this.deps.recordAssistantConnection?.(source.binding);
      } finally {
        session.requestIds.release(requestIds);
        session.activeRequests = Math.max(0, session.activeRequests - 1);
        session.lastActivity = this.now();
        if (session.confirmed && response.statusCode < 400) session.lastConfirmedAt = session.lastActivity;
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        this.retireSuperseded(sessionId);
      }
      return;
    }
    if (!isInitializeRequest2(body)) {
      this.deps.diag(`POST no-sid non-initialize -> 400 method=${bridgeMethodOf(body)}`);
      writeBridgeJsonError(response, 400, "Bad Request: a POST without Mcp-Session-Id must be an MCP initialize request.");
      return;
    }
    this.sessions.makeRoom(MAX_SESSIONS);
    if (this.sessions.size >= MAX_SESSIONS) {
      writeBridgeJsonError(response, 503, "Bridge session capacity reached. Close an existing MCP session and retry.");
      return;
    }
    const { transport, server } = this.createSession(source.binding);
    this.activeRequests += 1;
    try {
      await server.connect(transport);
      await transport.handleRequest(request, response, body);
    } catch (error2) {
      const newSessionId = transport.sessionId;
      if (newSessionId) this.sessions.destroy(newSessionId, "initialize-error");
      throw error2;
    } finally {
      this.activeRequests = Math.max(0, this.activeRequests - 1);
    }
  }
  async handleGet(request, response, sessionId) {
    const source=this.assistantBinding(request,response);if(!source.ok)return;
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.deps.diag(`GET no-session sid=${sessionId.slice(0, 8)} -> 404`);
      writeBridgeJsonError(response, 404, "Session not found. The MCP session may have expired.");
      return;
    }
    if(!this.sameAssistantBinding(session,source.binding,response))return;
    if (session.superseded) { writeBridgeJsonError(response,409,"This dialogue has a newer MCP connection."); return; }
    const getStartedAt = this.now();
    this.deps.diag(`GET stream open sid=${sessionId.slice(0, 8)}`);
    response.once("close", () => {
      this.deps.diag(`GET stream closed sid=${sessionId.slice(0, 8)} after ${this.now() - getStartedAt}ms aborted=${request.aborted === true} destroyed=${response.destroyed === true} finished=${response.writableFinished === true}`);
    });
    session.lastActivity = this.now();
    session.activeStreams += 1;
    if (session.confirmed) session.lastConfirmedAt = this.now();
    let released = false;
    const releaseStream = () => {
      if (released) return;
      released = true;
      session.activeStreams = Math.max(0, session.activeStreams - 1);
      session.lastActivity = this.now();
    };
    response.once("close", releaseStream);
    try {
      await session.transport.handleRequest(request, response);
    } finally {
      if (response.writableEnded || response.destroyed) {
        response.off("close", releaseStream);
        releaseStream();
      }
    }
  }
  async handleDelete(request, response, sessionId) {
    const source=this.assistantBinding(request,response);if(!source.ok)return;
    const existing=this.sessions.get(sessionId);if(existing&&!this.sameAssistantBinding(existing,source.binding,response))return;
    this.deleteInFlightSessionIds.add(sessionId);
    try {
      const destroyed = await this.sessions.destroyAfter(
        sessionId,
        async (session) => {
          await session.transport.handleRequest(request, response);
        },
        "delete"
      );
      if (!destroyed) {
        writeBridgeJsonError(response, 404, "Session not found.");
      }
    } finally {
      this.deleteInFlightSessionIds.delete(sessionId);
    }
  }
  // ---- Session assembly (always performed here; never bypassed by tests) ----
  createSession(sourceBinding=null) {
    const initialSessionId = (0, import_node_crypto19.randomUUID)();
    const initialOwner = this.commandOwner(initialSessionId, sourceBinding);
    const server = this.instantiateMcpServer(initialOwner);
    let transport;
    const options = {
      sessionIdGenerator: () => initialSessionId,
      enableJsonResponse: this.startOptions?.provider === "cloudflare",
      eventStore: new BoundedInMemoryEventStore(SESSION_EVENT_STORE_LIMIT),
      keepAliveMs: SESSION_KEEPALIVE_INTERVAL_MS,
      retryInterval: SESSION_RETRY_INTERVAL_MS,
      onsessioninitialized: (sid) => {
        const owner = this.commandOwner(sid, sourceBinding);
        this.deps.bindAssistantSource?.(owner,sourceBinding);
        this.sessions.set(sid, {
          id: sid, owner, confirmed: false, confirmedAt: 0, lastConfirmedAt: 0, superseded: false,
          transport,
          server,
          requestIds: new JsonRpcRequestIdRegistry(),
          lastActivity: this.now(),
          activeRequests: 0,
          activeStreams: 0,
          assistantBindingId: sourceBinding?.bindingId||null,
          assistantConnectionBinding: sourceBinding
        });
        this.revision_ += 1;
        this.deps.log(`[bridge] new MCP session: ${sid}`);
      },
      onsessionclosed: (sid) => {
        this.destroyClosedSession(sid);
      }
    };
    transport = this.deps.createSessionTransport ? this.deps.createSessionTransport(options) : new NodeStreamableHTTPServerTransport(options);
    server.oninitialized = () => this.confirmSession(transport.sessionId);
    this.registerToolHandlers(server, () => transport.sessionId, undefined, sourceBinding);
    transport.onclose = () => {
      const sid = transport.sessionId;
      if (sid) this.destroyClosedSession(sid);
    };
    return { transport, server };
  }
  /**
   * Build a bare MCP server carrying the Bridge identity, capabilities and instructions.
   * Shared by both protocol eras so the two paths can never drift apart.
   */
  instantiateMcpServer(ownerId) {
    const serverInfo = { name: "opencode-bridge", version: OPENCODE_BEHAVIOR_VERSION };
    const serverOptions = {
      capabilities: { tools: { listChanged: true }, logging: {}, prompts: {}, resources: {} },
      // Upstream tools can disappear immediately after stop/trust revocation;
      // the old public/60s tool cache must not continue exposing stale names.
      cacheHints: {
        "tools/list": { ttlMs: 0, cacheScope: "private" },
        "server/discover": { ttlMs: 3e5, cacheScope: "public" }
      },
      // Keep this connection-specific rule beside the MCP metadata it must reach;
      // BRIDGE_SERVER_INSTRUCTIONS remains the shared base prompt.
      instructions: this.deps.serverInstructions?.(ownerId) ?? BRIDGE_SERVER_INSTRUCTIONS
    };
    return this.deps.createMcpServer ? this.deps.createMcpServer(serverInfo, serverOptions) : new Server(serverInfo, serverOptions);
  }
  /**
   * Dependencies handed to the modern-era path. Deliberately narrow: it can mint a
   * per-request server, bracket an in-flight request and log — nothing session-shaped
   * is reachable from there.
   */
  modernDeps(sourceBinding=null) {
    return {
      createServer: (scopeId, taskOwnerId) => {
        const sourceScope=sourceBinding?scopeId+":assistant-source:"+sourceBinding.bindingId:scopeId;
        const sourceOwner=sourceBinding&&taskOwnerId?taskOwnerId+":assistant-source:"+sourceBinding.bindingId:taskOwnerId;
        const server = this.instantiateMcpServer(this.commandOwner(sourceScope, sourceBinding));
        this.registerToolHandlers(server, () => sourceScope, sourceOwner, sourceBinding, true);
        return server;
      },
      trackRequest: async (run) => {
        this.activeRequests += 1;
        try {
          return await run();
        } finally {
          this.activeRequests = Math.max(0, this.activeRequests - 1);
        }
      },
      diag: (message2) => this.deps.diag(message2)
    };
  }
  /**
   * Register the Bridge tool surface on `server`.
   *
   * `resolveSessionId` supplies the command-owner scope: the legacy path passes the
   * transport's session id, while the modern path passes the stable owner derived
   * from the modern client envelope because it has no Mcp-Session-Id.
   */
  registerToolHandlers(server, resolveSessionId, taskOwnerId, sourceBinding=null, modern=false) {
    const observe = async action => {
      const commandOwnerId = this.commandOwner(resolveSessionId(), sourceBinding);
      const resolvedTaskOwner = sourceBinding ? commandOwnerId : taskOwnerId;
      this.deps.bindAssistantSource?.(commandOwnerId,sourceBinding);
      if (resolvedTaskOwner) this.deps.bindAssistantSource?.(resolvedTaskOwner,sourceBinding);
      if (modern) { this.noteModern(commandOwnerId,sourceBinding,1); await this.deps.recordAssistantConnection?.(sourceBinding); }
      try { return await action(commandOwnerId,resolvedTaskOwner); }
      finally { if (modern) this.noteModern(commandOwnerId,sourceBinding,-1); }
    };
    server.setRequestHandler("tools/list", async () => observe(async () => {
      const builtin = this.deps.listBuiltinTools?.() ?? BRIDGE_TOOL_DEFINITIONS;
      const custom = this.deps.listCustomTools?.() ?? [];
      const reserved = /* @__PURE__ */ new Set([...BRIDGE_TOOL_DEFINITIONS.map((tool) => tool.name), ...custom.map((tool) => tool.name)]);
      let external = [];
      try {
        external = await this.deps.listExternalTools?.(reserved) ?? [];
      } catch {
      }
      return { tools: [
        ...builtin.map((tool) => ({
          name: tool.name,
          title: tool.title ?? tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          outputSchema: tool.outputSchema,
          annotations: tool.annotations
        })),
        ...custom.map((tool) => ({
          name: tool.name,
          title: tool.title,
          description: tool.description,
          inputSchema: tool.inputSchema,
          outputSchema: CUSTOM_TOOL_OUTPUT_SCHEMA,
          // User-added tools run an arbitrary local command, so they are declared
          // destructive: clients must not auto-approve them the way they may for
          // the read-only built-ins.
          annotations: {
            title: tool.title,
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: false,
            openWorldHint: false
          }
        })),
        ...external.map(({ serverId: _source, upstreamName: _upstream, ...tool }) => tool),
        ...(multicaRuntime().opsToolVisible() && !reserved.has("opencode_ops") ? [multicaRuntime().opsTool()] : [])
      ] };
    }));
    // Clients that ignore initialize instructions can still discover onboarding through prompts/resources.
    server.setRequestHandler("prompts/list", async () => ({ prompts: [{ name: "opencode-start", title: "开始使用 OpenCode", description: "接入说明：先调用 start，再按返回的 next_steps 建立任务卡、读取 Skills。" }] }));
    server.setRequestHandler("prompts/get", async (request) => observe(async (commandOwnerId) => {
      if (request.params?.name !== "opencode-start") throw new Error(`Unknown prompt: ${request.params?.name}`);
      const text = `${this.deps.serverInstructions?.(commandOwnerId) ?? BRIDGE_SERVER_INSTRUCTIONS}\n\n现在先调用 start，再按其返回的 next_steps 继续。`;
      return { description: "OpenCode 接入说明", messages: [{ role: "user", content: { type: "text", text } }] };
    }));
    server.setRequestHandler("resources/list", async () => ({ resources: [{ uri: "opencode://rules/effective", name: "effective-rules", title: "当前有效规则", description: "当前工作区的完整有效规则（JSON）。读取不等于确认；确认请调用 start。", mimeType: "application/json" }] }));
    server.setRequestHandler("resources/read", async (request, extra) => observe(async (commandOwnerId, resolvedTaskOwner) => {
      const uri = request.params?.uri;
      if (uri !== "opencode://rules/effective") throw new Error(`Unknown resource: ${uri}`);
      const result = await this.deps.dispatchToolCall("bridge_get_effective_rules", {}, { signal: extra?.signal, commandOwnerId, taskOwnerId: resolvedTaskOwner });
      const text = (result?.content || []).filter((item) => item?.type === "text").map((item) => item.text).join("\n");
      return { contents: [{ uri, mimeType: "application/json", text }] };
    }));
    server.setRequestHandler("tools/call", async (request, extra) => observe(async (commandOwnerId,resolvedTaskOwner) => {
      const toolName = request.params.name;
      const args = request.params.arguments ?? {};
      const dispatch = () => this.deps.dispatchToolCall(toolName, args, {
        signal: extra.signal,
        commandOwnerId,
        taskOwnerId: resolvedTaskOwner,
        clientName: (() => { try { return (server.getClientVersion?.() ?? server.server?.getClientVersion?.())?.name; } catch { return void 0; } })(),
        // 建议11：只有 legacy 有状态会话能把 elicitation/create 推给客户端；modern 路径与未开启时为 undefined。
        elicit: modern ? void 0 : this.elicitorFor(server, extra)
      });
      // The ops layer never blocks or alters the call unless a feature that defaults to off is enabled.
      const result = await multicaRuntime().runToolCall({ toolName, args, ownerId: commandOwnerId, taskOwnerId: resolvedTaskOwner, signal: extra.signal }, dispatch);
      let outContent = result.content;
      if (result._stepBudgetWarning && Array.isArray(outContent) && outContent.length > 0 && outContent[0]?.type === "text") {
        outContent = [{ ...outContent[0], text: `${outContent[0].text}\n\n${result._stepBudgetWarning}` }, ...outContent.slice(1)];
      }
      return {
        content: outContent,
        isError: result.isError,
        structuredContent: result.structuredContent,
        ...(result._meta ? { _meta: result._meta } : {})
      };
    }));
  }
  /**
   * 建议11：bridge_ask_user 的 MCP elicitation 通道。默认关闭，设置 opencode.bridge.elicitation=true 才启用。
   * 仅当客户端在 initialize 声明了 elicitation（form，或旧版空对象）时返回发问函数，否则 undefined，
   * 调用方照常只走任务板提问。表单回答来自远端客户端界面，不等同于本地任务板，故默认关闭。
   */
  elicitorFor(server, extra) {
    if (this.deps.elicitationEnabled?.() !== true) return void 0;
    let caps;
    try { caps = server.getClientCapabilities?.(); } catch { return void 0; }
    const el = caps?.elicitation;
    if (!el || typeof el !== "object") return void 0;
    const formDeclared = Boolean(el.form);
    if (!formDeclared && Object.keys(el).length !== 0) return void 0;
    const relatedRequestId = extra?.requestId ?? extra?.mcpReq?.id;
    return (params, signal) => {
      const options = { signal, timeout: 6 * 60 * 60 * 1e3, ...relatedRequestId !== void 0 ? { relatedRequestId } : {} };
      const formParams = { ...params, mode: "form" };
      return formDeclared ? server.elicitInput(formParams, options) : server._sendElicitationLeg(formParams, options);
    };
  }
  /** Notify all legacy sessions; modern per-request sessions rely on private, zero-TTL list hints. */
  /**
   * recovered.33 push delivery: stateful (legacy Streamable HTTP) sessions whose owner is the message
   * recipient get an MCP `notifications/message` (logger opencode.bridge.inbox). The modern per-request
   * path has no server→client channel, so those clients use bridge_wait_messages long-polling instead.
   * Metadata only; the text is read through bridge_list_messages / bridge_wait_messages. Never throws.
   */
  notifyInbox(message, agentIdFor) {
    if (!message?.recipient || typeof agentIdFor !== "function") return 0;
    let sent = 0;
    for (const session of this.sessions.values()) {
      let id;
      try { id = agentIdFor(session.owner); } catch { continue; }
      if (!session.owner || id !== message.recipient || session.superseded) continue;
      sent++;
      void session.server.notification?.({ method: "notifications/message", params: { level: "info", logger: "opencode.bridge.inbox", data: { type: "bridge_inbox_message", message_id: message.id, sequence: message.sequence, task_id: message.taskId, workspace_id: message.workspaceId, kind: message.kind, sender: message.sender, hint: "新协作消息：调用 bridge_wait_messages 或 bridge_list_messages(after_sequence) 读取；通知不等于已读或已处理。" } } })?.catch?.(() => void 0);
    }
    return sent;
  }
  notifyToolsChanged() {
    this.revision_++;
    for (const session of this.sessions.values()) {
      void session.server.notification?.({ method: "notifications/tools/list_changed" }).catch(() => void 0);
    }
  }
  pruneSessions() {
    this.sessions.prune(this.now(), SESSION_IDLE_TIMEOUT_MS, MAX_SESSIONS);
  }
  /** Attribute a close to DELETE only while that request is actively handled. */
  destroyClosedSession(sessionId) {
    const reason = this.deleteInFlightSessionIds.has(sessionId) ? "delete" : "transport-close";
    this.sessions.destroy(sessionId, reason);
  }
};

function createUnrefInterval(callback, ms) {
  const timer = setInterval(callback, ms);
  timer.unref?.();
  return { clear: () => clearInterval(timer) };
}
export { bridgeMethodOf, createUnrefInterval, import_node_crypto19, import_node_http4, BridgeMcpTransport };
