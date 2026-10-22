// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/mcp/node/mcpGatewaySession.ts
import { hasKey, init_types } from "./module-0016.mjs";
import { __esm } from "./module-0000.mjs";
import { JsonRpcError, JsonRpcProtocol, init_jsonRpcProtocol, isJsonRpcNotification, isJsonRpcResponse } from "./module-0344.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";


// src/vs/platform/mcp/node/mcpGatewaySession.ts
function isInitializeMessage(message) {
  const first2 = Array.isArray(message) ? message[0] : message;
  if (!first2 || !hasKey(first2, { method: true })) {
    return false;
  }
  return first2.method === "initialize";
}

var MCP_LATEST_PROTOCOL_VERSION, MCP_SUPPORTED_PROTOCOL_VERSIONS, MCP_INVALID_REQUEST, MCP_METHOD_NOT_FOUND, MCP_INVALID_PARAMS, McpGatewaySession;

var init_mcpGatewaySession = __esm({
  "src/vs/platform/mcp/node/mcpGatewaySession.ts"() {
    init_jsonRpcProtocol();
    init_lifecycle();
    init_types();
    MCP_LATEST_PROTOCOL_VERSION = "2025-11-25";
    MCP_SUPPORTED_PROTOCOL_VERSIONS = [
      "2025-11-25",
      "2025-06-18",
      "2025-03-26",
      "2024-11-05",
      "2024-10-07"
    ];
    MCP_INVALID_REQUEST = -32600;
    MCP_METHOD_NOT_FOUND = -32601;
    MCP_INVALID_PARAMS = -32602;
    McpGatewaySession = class extends Disposable {
      constructor(id2, _logService, _onDidDispose, _serverInvoker) {
        super();
        this.id = id2;
        this._logService = _logService;
        this._onDidDispose = _onDidDispose;
        this._serverInvoker = _serverInvoker;
        this._sseClients = /* @__PURE__ */ new Set();
        this._lastEventId = 0;
        this._isInitialized = false;
        this._rpc = this._register(new JsonRpcProtocol(
          (message) => this._handleOutgoingMessage(message),
          {
            handleRequest: (request) => this._handleRequest(request),
            handleNotification: (notification) => this._handleNotification(notification)
          }
        ));
        this._register(this._serverInvoker.onDidChangeTools(() => {
          if (!this._isInitialized) {
            return;
          }
          this._logService.info(`[McpGateway][session ${this.id}] Tools changed, notifying client`);
          this._rpc.sendNotification({ method: "notifications/tools/list_changed" });
        }));
        this._register(this._serverInvoker.onDidChangeResources(() => {
          if (!this._isInitialized) {
            return;
          }
          this._logService.info(`[McpGateway][session ${this.id}] Resources changed, notifying client`);
          this._rpc.sendNotification({ method: "notifications/resources/list_changed" });
        }));
      }
      attachSseClient(_req, res) {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive"
        });
        res.write(": connected\n\n");
        this._sseClients.add(res);
        this._logService.info(`[McpGateway][session ${this.id}] SSE client attached (total: ${this._sseClients.size})`);
        res.on("close", () => {
          this._sseClients.delete(res);
          this._logService.info(`[McpGateway][session ${this.id}] SSE client detached (total: ${this._sseClients.size})`);
        });
      }
      async handleIncoming(message) {
        return this._rpc.handleMessage(message);
      }
      dispose() {
        this._logService.info(`[McpGateway][session ${this.id}] Disposing session (SSE clients: ${this._sseClients.size})`);
        for (const client of this._sseClients) {
          if (!client.destroyed) {
            client.end();
          }
        }
        this._sseClients.clear();
        this._onDidDispose();
        super.dispose();
      }
      _handleOutgoingMessage(message) {
        if (isJsonRpcResponse(message)) {
          this._logService.debug(`[McpGateway][session ${this.id}] --> response: ${JSON.stringify(message)}`);
          return;
        }
        if (isJsonRpcNotification(message)) {
          this._logService.debug(`[McpGateway][session ${this.id}] --> notification: ${message.method}`);
          this._broadcastSse(message);
          return;
        }
        this._logService.warn("[McpGatewayService] Ignored unsupported outgoing gateway message");
      }
      _broadcastSse(message) {
        if (this._sseClients.size === 0) {
          this._logService.debug(`[McpGateway][session ${this.id}] No SSE clients to broadcast to, dropping message`);
          return;
        }
        const payload = JSON.stringify(message);
        const eventId = String(++this._lastEventId);
        this._logService.debug(`[McpGateway][session ${this.id}] Broadcasting SSE event id=${eventId} to ${this._sseClients.size}`);
        const lines = payload.split(/\r?\n/g);
        const data = [
          `id: ${eventId}`,
          "event: message",
          ...lines.map((line) => `data: ${line}`),
          "",
          ""
        ].join("\n");
        for (const client of [...this._sseClients]) {
          if (client.destroyed || client.writableEnded) {
            this._sseClients.delete(client);
            continue;
          }
          client.write(data);
        }
      }
      async _handleRequest(request) {
        this._logService.debug(`[McpGateway][session ${this.id}] <-- request: ${request.method} (id=${String(request.id)})`);
        if (request.method === "initialize") {
          return this._handleInitialize(request);
        }
        if (!this._isInitialized) {
          this._logService.warn(`[McpGateway][session ${this.id}] Rejected request '${request.method}': session not initialized`);
          throw new JsonRpcError(MCP_INVALID_REQUEST, "Session is not initialized");
        }
        switch (request.method) {
          case "ping":
            return {};
          case "tools/list":
            return this._handleListTools();
          case "tools/call":
            return this._handleCallTool(request);
          case "resources/list":
            return this._handleListResources();
          case "resources/read":
            return this._handleReadResource(request);
          case "resources/templates/list":
            return this._handleListResourceTemplates();
          default:
            this._logService.warn(`[McpGateway][session ${this.id}] Unknown method: ${request.method}`);
            throw new JsonRpcError(MCP_METHOD_NOT_FOUND, `Method not found: ${request.method}`);
        }
      }
      _handleNotification(notification) {
        this._logService.debug(`[McpGateway][session ${this.id}] <-- notification: ${notification.method}`);
        if (notification.method === "notifications/initialized") {
          this._isInitialized = true;
          this._logService.info(`[McpGateway][session ${this.id}] Session initialized`);
          this._rpc.sendNotification({ method: "notifications/tools/list_changed" });
          this._rpc.sendNotification({ method: "notifications/resources/list_changed" });
        }
      }
      _handleInitialize(request) {
        const params = typeof request.params === "object" && request.params ? request.params : void 0;
        const clientVersion = typeof params?.protocolVersion === "string" ? params.protocolVersion : void 0;
        const clientInfo = params?.clientInfo;
        const negotiatedVersion = clientVersion && MCP_SUPPORTED_PROTOCOL_VERSIONS.includes(clientVersion) ? clientVersion : MCP_LATEST_PROTOCOL_VERSION;
        this._logService.info(`[McpGateway] Initialize: client=${clientInfo?.name ?? "unknown"}/${clientInfo?.version ?? "?"}, clientProtocol=${clientVersion ?? "(none)"}, negotiated=${negotiatedVersion}`);
        if (clientVersion && clientVersion !== negotiatedVersion) {
          this._logService.warn(`[McpGateway] Client requested unsupported protocol version '${clientVersion}', falling back to '${negotiatedVersion}'`);
        }
        return {
          protocolVersion: negotiatedVersion,
          capabilities: {
            tools: {
              listChanged: true
            },
            resources: {
              listChanged: true
            }
          },
          serverInfo: {
            name: "VS Code MCP Gateway",
            version: "1.0.0"
          }
        };
      }
      async _handleCallTool(request) {
        const params = typeof request.params === "object" && request.params ? request.params : void 0;
        if (!params || typeof params.name !== "string") {
          throw new JsonRpcError(MCP_INVALID_PARAMS, "Missing tool call params");
        }
        if (params.arguments && typeof params.arguments !== "object") {
          throw new JsonRpcError(MCP_INVALID_PARAMS, "Invalid tool call arguments");
        }
        const argumentsValue = params.arguments && typeof params.arguments === "object" ? params.arguments : {};
        this._logService.debug(`[McpGateway][session ${this.id}] Calling tool '${params.name}' with args: ${JSON.stringify(argumentsValue)}`);
        try {
          const result = await this._serverInvoker.callTool(params.name, argumentsValue);
          this._logService.debug(`[McpGateway][session ${this.id}] Tool '${params.name}' completed (isError=${result.isError ?? false}, content blocks=${result.content.length})`);
          return result;
        } catch (error) {
          this._logService.error(`[McpGateway][session ${this.id}] Tool '${params.name}' invocation failed`, error);
          throw new JsonRpcError(MCP_INVALID_PARAMS, String(error));
        }
      }
      async _handleListTools() {
        const tools = await this._serverInvoker.listTools();
        this._logService.debug(`[McpGateway][session ${this.id}] Listed ${tools.length} tool(s): [${tools.map((t) => t.name).join(", ")}]`);
        return { tools };
      }
      async _handleListResources() {
        const resources = await this._serverInvoker.listResources();
        this._logService.debug(`[McpGateway][session ${this.id}] Listed ${resources.length} resource(s)`);
        return { resources };
      }
      async _handleReadResource(request) {
        const params = typeof request.params === "object" && request.params ? request.params : void 0;
        if (!params || typeof params.uri !== "string") {
          throw new JsonRpcError(MCP_INVALID_PARAMS, "Missing resource URI");
        }
        this._logService.debug(`[McpGateway][session ${this.id}] Reading resource '${params.uri}'`);
        try {
          const result = await this._serverInvoker.readResource(params.uri);
          this._logService.debug(`[McpGateway][session ${this.id}] Resource read returned ${result.contents.length} content(s)`);
          return result;
        } catch (error) {
          this._logService.error(`[McpGateway][session ${this.id}] Resource read failed for '${params.uri}'`, error);
          throw new JsonRpcError(MCP_INVALID_PARAMS, String(error));
        }
      }
      async _handleListResourceTemplates() {
        const resourceTemplates = await this._serverInvoker.listResourceTemplates();
        this._logService.debug(`[McpGateway][session ${this.id}] Listed ${resourceTemplates.length} resource template(s)`);
        return { resourceTemplates };
      }
    };
  }
});
export { isInitializeMessage, MCP_LATEST_PROTOCOL_VERSION, MCP_SUPPORTED_PROTOCOL_VERSIONS, MCP_INVALID_REQUEST, MCP_METHOD_NOT_FOUND, MCP_INVALID_PARAMS, McpGatewaySession, init_mcpGatewaySession };
