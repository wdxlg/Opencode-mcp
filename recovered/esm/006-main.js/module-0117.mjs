// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/debug/common/extensionHostDebugIpc.ts
import { __esm } from "./module-0000.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";


// src/vs/platform/debug/common/extensionHostDebugIpc.ts
var ExtensionHostDebugBroadcastChannel;

var init_extensionHostDebugIpc = __esm({
  "src/vs/platform/debug/common/extensionHostDebugIpc.ts"() {
    init_event();
    init_lifecycle();
    ExtensionHostDebugBroadcastChannel = class extends Disposable {
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
      call(ctx, command, arg) {
        switch (command) {
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
  }
});
export { ExtensionHostDebugBroadcastChannel, init_extensionHostDebugIpc };
