// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/debug/common/extensionHostDebugIpc.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/platform/debug/common/extensionHostDebugIpc.ts
var ExtensionHostDebugBroadcastChannel = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onCloseEmitter = this._register(new Emitter());
    this._onReloadEmitter = this._register(new Emitter());
    this._onTerminateEmitter = this._register(new Emitter());
    this._onAttachEmitter = this._register(new Emitter());
  }
  static {
    this.ChannelName = "extensionhostdebugservice";
  }
  call(ctx, command4, arg) {
    switch (command4) {
      case "close":
        return Promise.resolve(this._onCloseEmitter.fire({ sessionId: arg[0] }));
      case "reload":
        return Promise.resolve(this._onReloadEmitter.fire({ sessionId: arg[0] }));
      case "terminate":
        return Promise.resolve(this._onTerminateEmitter.fire({ sessionId: arg[0] }));
      case "attach":
        return Promise.resolve(this._onAttachEmitter.fire({ sessionId: arg[0], port: arg[1], subId: arg[2] }));
    }
    throw new Error("Method not implemented.");
  }
  listen(ctx, event, arg) {
    switch (event) {
      case "close":
        return this._onCloseEmitter.event;
      case "reload":
        return this._onReloadEmitter.event;
      case "terminate":
        return this._onTerminateEmitter.event;
      case "attach":
        return this._onAttachEmitter.event;
    }
    throw new Error("Method not implemented.");
  }
};

var ExtensionHostDebugChannelClient = class extends Disposable {
  constructor(channel) {
    super();
    this.channel = channel;
  }
  reload(sessionId) {
    this.channel.call("reload", [sessionId]);
  }
  get onReload() {
    return this.channel.listen("reload");
  }
  close(sessionId) {
    this.channel.call("close", [sessionId]);
  }
  get onClose() {
    return this.channel.listen("close");
  }
  attachSession(sessionId, port, subId) {
    this.channel.call("attach", [sessionId, port, subId]);
  }
  get onAttachSession() {
    return this.channel.listen("attach");
  }
  terminateSession(sessionId, subId) {
    this.channel.call("terminate", [sessionId, subId]);
  }
  get onTerminateSession() {
    return this.channel.listen("terminate");
  }
  openExtensionDevelopmentHostWindow(args2, debugRenderer) {
    return this.channel.call("openExtensionDevelopmentHostWindow", [args2, debugRenderer]);
  }
  attachToCurrentWindowRenderer(windowId) {
    return this.channel.call("attachToCurrentWindowRenderer", [windowId]);
  }
};
export { ExtensionHostDebugBroadcastChannel, ExtensionHostDebugChannelClient };
