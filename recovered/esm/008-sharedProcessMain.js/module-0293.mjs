// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/meteredConnection/common/meteredConnectionIpc.ts
import { Disposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";


// src/vs/platform/meteredConnection/common/meteredConnectionIpc.ts
var METERED_CONNECTION_CHANNEL = "meteredConnection";

var MeteredConnectionChannelClient = class extends Disposable {
  constructor(channel) {
    super();
    this._onDidChangeIsConnectionMetered = this._register(new Emitter());
    this.onDidChangeIsConnectionMetered = this._onDidChangeIsConnectionMetered.event;
    this._isConnectionMetered = false;
    channel.call("IsConnectionMetered" /* IsConnectionMetered */).then((value) => {
      this._isConnectionMetered = value;
      if (value) {
        this._onDidChangeIsConnectionMetered.fire(value);
      }
    });
    this._register(channel.listen("OnDidChangeIsConnectionMetered" /* OnDidChangeIsConnectionMetered */)((value) => {
      if (this._isConnectionMetered !== value) {
        this._isConnectionMetered = value;
        this._onDidChangeIsConnectionMetered.fire(value);
      }
    }));
  }
  get isConnectionMetered() {
    return this._isConnectionMetered;
  }
};
export { METERED_CONNECTION_CHANNEL, MeteredConnectionChannelClient };
