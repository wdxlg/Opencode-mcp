// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/webSocketTransport.ts
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { AhpJsonlLogger, getAhpLogByteLength } from "./module-0412.mjs";
import { JSON_RPC_PARSE_ERROR } from "./module-0056.mjs";
import { connectionTokenQueryName } from "./module-0024.mjs";
import { generateUuid } from "./module-0042.mjs";


// src/vs/platform/agentHost/node/webSocketTransport.ts
var WebSocketProtocolTransport = class extends Disposable {
  constructor(_ws, _WebSocket, _ahpLogger) {
    super();
    this._ws = _ws;
    this._WebSocket = _WebSocket;
    this._ahpLogger = _ahpLogger;
    this.transportKind = "websocket" /* WebSocket */;
    this._onMessage = this._register(new Emitter());
    this.onMessage = this._onMessage.event;
    this._onClose = this._register(new Emitter());
    this.onClose = this._onClose.event;
    if (this._ahpLogger) {
      this._register(this._ahpLogger);
    }
    this._ws.on("message", (data) => {
      try {
        const text = typeof data === "string" ? data : data.toString("utf-8");
        const message = JSON.parse(text);
        this._ahpLogger?.log(message, "c2s", getAhpLogByteLength(text));
        this._onMessage.fire(message);
      } catch {
        this.send({ jsonrpc: "2.0", id: null, error: { code: JSON_RPC_PARSE_ERROR, message: "Parse error" } });
      }
    });
    this._ws.on("close", () => {
      this._onClose.fire();
    });
    this._ws.on("error", () => {
      this._onClose.fire();
    });
  }
  send(message) {
    if (this._ws.readyState === this._WebSocket.OPEN) {
      const text = JSON.stringify(message);
      this._ahpLogger?.log(message, "s2c", getAhpLogByteLength(text));
      this._ws.send(text);
    }
  }
  dispose() {
    this._ws.close();
    super.dispose();
  }
};

var WebSocketProtocolServer = class _WebSocketProtocolServer extends Disposable {
  constructor(options, _logService, _ahpLogOptions, ws, http) {
    super();
    this._logService = _logService;
    this._ahpLogOptions = _ahpLogOptions;
    this._connectionCount = 0;
    this._onConnection = this._register(new Emitter());
    this.onConnection = this._onConnection.event;
    this._WebSocket = ws.WebSocket;
    const opts = typeof options === "number" ? { port: options } : options;
    const host = opts.host ?? "127.0.0.1";
    const verifyClient = opts.connectionTokenValidate ? (info, cb) => {
      let tokens;
      try {
        tokens = new URL(info.req.url ?? "", "http://localhost").searchParams.getAll(connectionTokenQueryName);
      } catch {
        this._logService.warn("[WebSocketProtocol] Connection rejected: invalid request URL");
        cb(false, 400, "Bad Request");
        return;
      }
      const token = tokens.length > 1 ? tokens : tokens[0];
      if (!opts.connectionTokenValidate(token)) {
        this._logService.warn("[WebSocketProtocol] Connection rejected: invalid connection token");
        cb(false, 403, "Forbidden");
        return;
      }
      cb(true);
    } : void 0;
    if (opts.socketPath) {
      this._httpServer = http.createServer();
      this._wss = new ws.WebSocketServer({ server: this._httpServer, verifyClient });
      const httpServer = this._httpServer;
      this.whenListening = new Promise((resolve3, reject) => {
        httpServer.once("listening", () => {
          this._logService.info(`[WebSocketProtocol] Server listening on socket ${opts.socketPath}`);
          resolve3();
        });
        httpServer.once("error", reject);
      });
      this._httpServer.listen(opts.socketPath);
    } else {
      this._wss = new ws.WebSocketServer({ port: opts.port, host, verifyClient });
      const wss = this._wss;
      this.whenListening = new Promise((resolve3, reject) => {
        wss.once("listening", () => {
          const addr = wss.address();
          const bound = !addr || typeof addr === "string" ? `${host}:${opts.port}` : `${addr.address}:${addr.port}`;
          this._logService.info(`[WebSocketProtocol] Server listening on ${bound}`);
          resolve3();
        });
        wss.once("error", reject);
      });
    }
    this._wss.on("connection", (wsConn) => {
      this._logService.trace("[WebSocketProtocol] New client connection");
      const transport = new WebSocketProtocolTransport(wsConn, this._WebSocket, this._createAhpLogger());
      this._onConnection.fire(transport);
    });
    this._wss.on("error", (err) => {
      this._logService.error("[WebSocketProtocol] Server error", err);
    });
  }
  get address() {
    const addr = this._wss.address();
    if (!addr || typeof addr === "string") {
      return addr ?? void 0;
    }
    return `${addr.address}:${addr.port}`;
  }
  /**
   * The actual TCP port the server is bound to. `undefined` when the
   * listener has not bound yet (await {@link whenListening} first) or
   * when the server is bound to a unix socket / named pipe.
   */
  get boundPort() {
    const addr = this._wss.address();
    if (!addr || typeof addr === "string") {
      return void 0;
    }
    return addr.port;
  }
  /**
   * Creates a new WebSocket protocol server. Dynamically imports `ws` and
   * `http` so callers don't pay the cost when unused.
   */
  static async create(options, logService, ahpLogOptions) {
    const [ws, http] = await Promise.all([
      import("ws"),
      import("http")
    ]);
    return new _WebSocketProtocolServer(options, logService, ahpLogOptions, ws, http);
  }
  _createAhpLogger() {
    if (!this._ahpLogOptions) {
      return void 0;
    }
    return this._ahpLogOptions.instantiationService.createInstance(
      AhpJsonlLogger,
      {
        logsHome: this._ahpLogOptions.logsHome,
        connectionId: `agent-host-${++this._connectionCount}-${generateUuid()}`,
        transport: "websocket"
      }
    );
  }
  dispose() {
    this._wss.close();
    this._httpServer?.close();
    super.dispose();
  }
};
export { WebSocketProtocolTransport, WebSocketProtocolServer };
