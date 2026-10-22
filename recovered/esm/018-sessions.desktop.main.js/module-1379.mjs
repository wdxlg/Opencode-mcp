// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/broadcast.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { mainWindow } from "./module-0002.mjs";
import { getErrorMessage } from "./module-0004.mjs";


// src/vs/base/browser/broadcast.ts
var BroadcastDataChannel = class extends Disposable {
  constructor(channelName) {
    super();
    this.channelName = channelName;
    this._onDidReceiveData = this._register(new Emitter());
    this.onDidReceiveData = this._onDidReceiveData.event;
    if ("BroadcastChannel" in mainWindow) {
      try {
        this.broadcastChannel = new BroadcastChannel(channelName);
        const listener = (event) => {
          this._onDidReceiveData.fire(event.data);
        };
        this.broadcastChannel.addEventListener("message", listener);
        this._register(toDisposable(() => {
          if (this.broadcastChannel) {
            this.broadcastChannel.removeEventListener("message", listener);
            this.broadcastChannel.close();
          }
        }));
      } catch (error) {
        console.warn("Error while creating broadcast channel. Falling back to localStorage.", getErrorMessage(error));
      }
    }
    if (!this.broadcastChannel) {
      this.channelName = `BroadcastDataChannel.${channelName}`;
      this.createBroadcastChannel();
    }
  }
  createBroadcastChannel() {
    const listener = (event) => {
      if (event.key === this.channelName && event.newValue) {
        this._onDidReceiveData.fire(JSON.parse(event.newValue));
      }
    };
    mainWindow.addEventListener("storage", listener);
    this._register(toDisposable(() => mainWindow.removeEventListener("storage", listener)));
  }
  /**
   * Sends the data to other BroadcastChannel objects set up for this channel. Data can be structured objects, e.g. nested objects and arrays.
   * @param data data to broadcast
   */
  postData(data) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(data);
    } else {
      localStorage.removeItem(this.channelName);
      localStorage.setItem(this.channelName, JSON.stringify(data));
    }
  }
};
export { BroadcastDataChannel };
