// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/worker/extensionHostWorker.ts
import { URI } from "./module-0023.mjs";
import { FileAccess } from "./module-0031.mjs";
import { basename } from "./module-0022.mjs";
import { NestedWorker } from "./module-0285.mjs";
import { Emitter } from "./module-0019.mjs";
import { VSBuffer } from "./module-0013.mjs";
import { createMessageOfType, isMessageOfType } from "./module-0020.mjs";
import { mark } from "./module-0021.mjs";
import { ExtensionHostMain } from "./module-0284.mjs";


// src/vs/workbench/api/worker/extensionHostWorker.ts
var nativeClose = self.close.bind(self);

self.close = () => console.trace(`'close' has been blocked`);

var nativePostMessage = postMessage.bind(self);

self.postMessage = () => console.trace(`'postMessage' has been blocked`);

function shouldTransformUri(uri2) {
  return /^(file|vscode-remote):/i.test(uri2);
}

var nativeFetch = fetch.bind(self);

function patchFetching(asBrowserUri) {
  self.fetch = async function(input, init) {
    if (input instanceof Request) {
      return nativeFetch(input, init);
    }
    if (shouldTransformUri(String(input))) {
      input = (await asBrowserUri(URI.parse(String(input)))).toString(true);
    }
    return nativeFetch(input, init);
  };
  self.XMLHttpRequest = class extends XMLHttpRequest {
    open(method, url, async, username, password) {
      (async () => {
        if (shouldTransformUri(url.toString())) {
          url = (await asBrowserUri(URI.parse(url.toString()))).toString(true);
        }
        super.open(method, url, async ?? true, username, password);
      })();
    }
  };
}

self.importScripts = () => {
  throw new Error(`'importScripts' has been blocked`);
};

self.addEventListener = () => console.trace(`'addEventListener' has been blocked`);

self["AMDLoader"] = void 0;

self["NLSLoaderPlugin"] = void 0;

self["define"] = void 0;

self["require"] = void 0;

self["webkitRequestFileSystem"] = void 0;

self["webkitRequestFileSystemSync"] = void 0;

self["webkitResolveLocalFileSystemSyncURL"] = void 0;

self["webkitResolveLocalFileSystemURL"] = void 0;

if (self.Worker) {
  const _Worker = self.Worker;
  Worker = function(stringUrl, options2) {
    if (/^file:/i.test(stringUrl.toString())) {
      stringUrl = FileAccess.uriToBrowserUri(URI.parse(stringUrl.toString())).toString(true);
    } else if (/^vscode-remote:/i.test(stringUrl.toString())) {
      throw new Error(`Creating workers from remote extensions is currently not supported.`);
    }
    const bootstrapFnSource = (function bootstrapFn(workerUrl) {
      function asWorkerBrowserUrl(url) {
        if (typeof url === "string" || url instanceof URL) {
          return String(url).replace(/^file:\/\//i, "vscode-file://vscode-app");
        }
        return url;
      }
      const nativeFetch2 = fetch.bind(self);
      self.fetch = function(input, init) {
        if (input instanceof Request) {
          return nativeFetch2(input, init);
        }
        return nativeFetch2(asWorkerBrowserUrl(input), init);
      };
      self.XMLHttpRequest = class extends XMLHttpRequest {
        open(method, url, async, username, password) {
          return super.open(method, asWorkerBrowserUrl(url), async ?? true, username, password);
        }
      };
      const nativeImportScripts = importScripts.bind(self);
      self.importScripts = (...urls) => {
        nativeImportScripts(...urls.map(asWorkerBrowserUrl));
      };
      nativeImportScripts(workerUrl);
    }).toString();
    const js = `(${bootstrapFnSource}('${stringUrl}'))`;
    options2 = options2 || {};
    options2.name = `${name} -> ${options2.name || basename(stringUrl.toString())}`;
    const blob = new Blob([js], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    return new _Worker(blobUrl, options2);
  };
} else {
  self.Worker = class extends NestedWorker {
    constructor(stringOrUrl, options2) {
      super(nativePostMessage, stringOrUrl, { name: basename(stringOrUrl.toString()), ...options2 });
    }
  };
}

var hostUtil = new class {
  constructor() {
    this.pid = void 0;
  }
  exit(_code) {
    nativeClose();
  }
}();

var ExtensionWorker = class {
  constructor() {
    const channel = new MessageChannel();
    const emitter = new Emitter();
    let terminating = false;
    nativePostMessage(channel.port2, [channel.port2]);
    channel.port1.onmessage = (event) => {
      const { data: data2 } = event;
      if (!(data2 instanceof ArrayBuffer)) {
        console.warn("UNKNOWN data received", data2);
        return;
      }
      const msg = VSBuffer.wrap(new Uint8Array(data2, 0, data2.byteLength));
      if (isMessageOfType(msg, 2 /* Terminate */)) {
        terminating = true;
        onTerminate("received terminate message from renderer");
        return;
      }
      emitter.fire(msg);
    };
    this.protocol = {
      onMessage: emitter.event,
      send: (vsbuf) => {
        if (!terminating) {
          const data2 = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
          channel.port1.postMessage(data2, [data2]);
        }
      }
    };
  }
};

function connectToRenderer(protocol) {
  return new Promise((resolve2) => {
    const once = protocol.onMessage((raw) => {
      once.dispose();
      const initData = JSON.parse(raw.toString());
      protocol.send(createMessageOfType(0 /* Initialized */));
      resolve2({ protocol, initData });
    });
    protocol.send(createMessageOfType(1 /* Ready */));
  });
}

var onTerminate = (reason) => nativeClose();

function isInitMessage(a) {
  return !!a && typeof a === "object" && a.type === "vscode.init" && a.data instanceof Map;
}

function create() {
  mark(`code/extHost/willConnectToRenderer`);
  const res = new ExtensionWorker();
  return {
    onmessage(message) {
      if (!isInitMessage(message)) {
        return;
      }
      connectToRenderer(res.protocol).then((data2) => {
        mark(`code/extHost/didWaitForInitData`);
        const extHostMain = new ExtensionHostMain(
          data2.protocol,
          data2.initData,
          hostUtil,
          null,
          message.data
        );
        patchFetching((uri2) => extHostMain.asBrowserUri(uri2));
        onTerminate = (reason) => extHostMain.terminate(reason);
      });
    }
  };
}
export { shouldTransformUri, patchFetching, connectToRenderer, isInitMessage, create, nativeClose, nativePostMessage, nativeFetch, hostUtil, ExtensionWorker, onTerminate };
