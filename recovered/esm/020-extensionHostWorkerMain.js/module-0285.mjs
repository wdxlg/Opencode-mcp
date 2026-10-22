// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/extensions/worker/polyfillNestedWorker.ts



// src/vs/workbench/services/extensions/worker/polyfillNestedWorker.ts
var _bootstrapFnSource = (function _bootstrapFn(workerUrl) {
  const listener = (event) => {
    globalThis.removeEventListener("message", listener);
    const port = event.data;
    Object.defineProperties(globalThis, {
      "postMessage": {
        value(data2, transferOrOptions) {
          port.postMessage(data2, transferOrOptions);
        }
      },
      "onmessage": {
        get() {
          return port.onmessage;
        },
        set(value) {
          port.onmessage = value;
        }
      }
      // todo onerror
    });
    port.addEventListener("message", (msg) => {
      globalThis.dispatchEvent(new MessageEvent("message", { data: msg.data, ports: msg.ports ? [...msg.ports] : void 0 }));
    });
    port.start();
    globalThis.Worker = class {
      constructor() {
        throw new TypeError("Nested workers from within nested worker are NOT supported.");
      }
    };
    importScripts(workerUrl);
  };
  globalThis.addEventListener("message", listener);
}).toString();

var NestedWorker = class extends EventTarget {
  constructor(nativePostMessage2, stringOrUrl, options2) {
    super();
    this.onmessage = null;
    this.onmessageerror = null;
    this.onerror = null;
    const bootstrap = `((${_bootstrapFnSource})('${stringOrUrl}'))`;
    const blob = new Blob([bootstrap], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    const channel = new MessageChannel();
    const id2 = blobUrl;
    const msg = {
      type: "_newWorker",
      id: id2,
      port: channel.port2,
      url: blobUrl,
      options: options2
    };
    nativePostMessage2(msg, [channel.port2]);
    this.postMessage = channel.port1.postMessage.bind(channel.port1);
    this.terminate = () => {
      const msg2 = {
        type: "_terminateWorker",
        id: id2
      };
      nativePostMessage2(msg2);
      URL.revokeObjectURL(blobUrl);
      channel.port1.close();
      channel.port2.close();
    };
    Object.defineProperties(this, {
      "onmessage": {
        get() {
          return channel.port1.onmessage;
        },
        set(value) {
          channel.port1.onmessage = value;
        }
      },
      "onmessageerror": {
        get() {
          return channel.port1.onmessageerror;
        },
        set(value) {
          channel.port1.onmessageerror = value;
        }
      }
      // todo onerror
    });
    channel.port1.addEventListener("messageerror", (evt) => {
      const msgEvent = new MessageEvent("messageerror", { data: evt.data });
      this.dispatchEvent(msgEvent);
    });
    channel.port1.addEventListener("message", (evt) => {
      const msgEvent = new MessageEvent("message", { data: evt.data });
      this.dispatchEvent(msgEvent);
    });
    channel.port1.start();
  }
};
export { _bootstrapFnSource, NestedWorker };
