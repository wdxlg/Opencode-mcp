// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/browser/agentHostIpcChannelTransport.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { MALFORMED_FRAMES_FORCE_CLOSE_THRESHOLD, MALFORMED_FRAMES_LOG_CAP } from "./module-4049.mjs";
import { getAhpLogByteLength } from "./module-4048.mjs";


// src/vs/platform/agentHost/browser/agentHostIpcChannelTransport.ts
var REDACTED_TOKEN = "<redacted>";

var AgentHostIpcChannelTransport = class extends Disposable {
  constructor(_channel, _ahpLogger, clientConnectionKind = "unknown" /* Unknown */) {
    super();
    this._channel = _channel;
    this._ahpLogger = _ahpLogger;
    this.clientConnectionKind = clientConnectionKind;
    this._onMessage = this._register(new Emitter());
    this.onMessage = this._onMessage.event;
    this._onClose = this._register(new Emitter());
    this.onClose = this._onClose.event;
    this._isOpen = false;
    this._closeFired = false;
    this._malformedFrames = 0;
  }
  get isOpen() {
    return this._isOpen && !this._closeFired;
  }
  async connect() {
    if (this._store.isDisposed) {
      throw new Error("Transport is disposed");
    }
    this._register(this._channel.listen("frame")((text2) => this._handleFrame(text2)));
    this._register(this._channel.listen("close")(() => this._fireClose()));
    await this._channel.call("connect");
    this._isOpen = true;
  }
  send(message) {
    if (!this._isOpen || this._closeFired) {
      this._fireClose();
      return;
    }
    const text2 = JSON.stringify(message);
    this._logFrame(message, "c2s", text2);
    this._channel.call("send", text2).catch(() => this._fireClose());
  }
  dispose() {
    if (this._isOpen && !this._closeFired) {
      this._channel.call("close").catch(() => {
      });
    }
    this._fireClose();
    super.dispose();
  }
  _handleFrame(text2) {
    let message;
    try {
      message = JSON.parse(text2);
    } catch (err) {
      this._malformedFrames++;
      if (this._malformedFrames <= MALFORMED_FRAMES_LOG_CAP) {
        const preview = text2.length > 80 ? text2.slice(0, 80) + "\u2026" : text2;
        console.warn(
          `[AgentHostIpcChannelTransport] Malformed frame #${this._malformedFrames} (len=${text2.length}): ${preview}`,
          err instanceof Error ? err.message : String(err)
        );
      }
      if (this._malformedFrames > MALFORMED_FRAMES_FORCE_CLOSE_THRESHOLD) {
        console.warn("[AgentHostIpcChannelTransport] Malformed frame threshold exceeded; closing transport.");
        this._fireClose();
      }
      return;
    }
    this._logFrame(message, "s2c", text2);
    this._onMessage.fire(message);
  }
  _logFrame(message, direction, text2) {
    this._ahpLogger?.log(redactAuthenticationToken(message), direction, getAhpLogByteLength(text2));
  }
  _fireClose() {
    if (this._closeFired) {
      return;
    }
    this._closeFired = true;
    this._isOpen = false;
    this._onClose.fire();
  }
};

function redactAuthenticationToken(message) {
  const candidate = message;
  if (candidate.method !== "authenticate" || typeof candidate.params !== "object" || candidate.params === null) {
    return message;
  }
  const params = candidate.params;
  if (typeof params.token !== "string") {
    return message;
  }
  return { ...candidate, params: { ...params, token: REDACTED_TOKEN } };
}
export { redactAuthenticationToken, REDACTED_TOKEN, AgentHostIpcChannelTransport };
