// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/relayTransport.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { MALFORMED_FRAMES_FORCE_CLOSE_THRESHOLD, MALFORMED_FRAMES_LOG_CAP } from "./module-4049.mjs";
import { getAhpLogByteLength } from "./module-4048.mjs";
import { ReconnectingTransport } from "./module-4237.mjs";


// src/vs/platform/agentHost/common/relayTransport.ts
var RelayTransport = class extends Disposable {
  constructor(_connectionId, _channel, _ahpLogger, _logService, _logPrefix, clientConnectionKind) {
    super();
    this._connectionId = _connectionId;
    this._channel = _channel;
    this._ahpLogger = _ahpLogger;
    this._logService = _logService;
    this._logPrefix = _logPrefix;
    this.clientConnectionKind = clientConnectionKind;
    this._onMessage = this._register(new Emitter());
    this.onMessage = this._onMessage.event;
    this._onClose = this._register(new Emitter());
    this.onClose = this._onClose.event;
    this._malformedFrames = 0;
    this._closeFired = false;
    if (this._ahpLogger) {
      this._register(this._ahpLogger);
    }
    this._register(this._channel.onDidRelayMessage((msg) => {
      if (this._connectionId !== void 0 && msg.connectionId === this._connectionId) {
        let parsed;
        try {
          parsed = JSON.parse(msg.data);
        } catch (err) {
          this._malformedFrames++;
          if (this._malformedFrames <= MALFORMED_FRAMES_LOG_CAP) {
            const preview = msg.data.length > 80 ? msg.data.slice(0, 80) + "\u2026" : msg.data;
            this._logService.warn(
              `${this._logPrefix} Malformed frame #${this._malformedFrames} (len=${msg.data.length}): ${preview}`,
              err instanceof Error ? err.message : String(err)
            );
          }
          if (this._malformedFrames > MALFORMED_FRAMES_FORCE_CLOSE_THRESHOLD && !this._closeFired) {
            this._logService.warn(`${this._logPrefix} Malformed frame threshold exceeded; closing relay.`);
            this._fireClose();
          }
          return;
        }
        this._ahpLogger?.log(parsed, "s2c", getAhpLogByteLength(msg.data));
        this._onMessage.fire(parsed);
      }
    }));
    this._register(this._channel.onDidRelayClose((closedId) => {
      if (this._connectionId !== void 0 && closedId === this._connectionId) {
        this._logService.info(`${this._logPrefix} onDidRelayClose`);
        this._fireClose();
      }
    }));
  }
  send(message) {
    const connectionId = this._connectionId;
    if (connectionId === void 0) {
      this._logService.warn(`${this._logPrefix} send before the relay channel was established; dropping message`);
      return;
    }
    const text2 = JSON.stringify(message);
    this._ahpLogger?.log(message, "c2s", getAhpLogByteLength(text2));
    this._channel.relaySend(connectionId, text2).catch((err) => {
      this._logService.error(`${this._logPrefix} relaySend failed`, err);
    });
  }
  _fireClose() {
    if (!this._closeFired) {
      this._closeFired = true;
      this._onClose.fire();
    }
  }
};

var ReconnectingRelayTransport = class extends ReconnectingTransport {
  constructor(establish, channel, createAhpLogger, logService, logPrefix, clientConnectionKind) {
    super(
      async () => {
        const connectionHandle = await establish();
        return {
          transport: new RelayTransport(connectionHandle.connectionId, channel, createAhpLogger(), logService, logPrefix, clientConnectionKind),
          close: connectionHandle.close
        };
      },
      logService,
      logPrefix,
      clientConnectionKind,
      "send before the relay channel was established; dropping message"
    );
  }
};
export { RelayTransport, ReconnectingRelayTransport };
