// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/webWorker/browser/webWorkerServiceImpl.ts
import { WebWorkerClient } from "./module-0159.mjs";
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { COI } from "./module-0033.mjs";
import { coalesce } from "./module-0007.mjs";
import { getNLSLanguage, getNLSMessages } from "./module-0001.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/platform/webWorker/browser/webWorkerServiceImpl.ts
var WebWorkerService = class _WebWorkerService {
  static {
    this._workerIdPool = 0;
  }
  createWorkerClient(workerDescriptor) {
    let worker;
    const id2 = ++_WebWorkerService._workerIdPool;
    if (workerDescriptor instanceof Worker || isPromiseLike(workerDescriptor)) {
      worker = Promise.resolve(workerDescriptor);
    } else {
      worker = this._createWorker(workerDescriptor);
    }
    return new WebWorkerClient(new WebWorker(worker, id2));
  }
  _createWorker(descriptor) {
    const workerRunnerUrl = this.getWorkerUrl(descriptor);
    const workerUrlWithNls = getWorkerBootstrapUrl(descriptor.label, workerRunnerUrl, this._getWorkerLoadingFailedErrorMessage(descriptor));
    try {
      const worker = createBlobWorker(workerUrlWithNls, { name: descriptor.label, type: "module" });
      return whenESMWorkerReady(worker).finally(() => URL.revokeObjectURL(workerUrlWithNls));
    } catch (error) {
      URL.revokeObjectURL(workerUrlWithNls);
      throw error;
    }
  }
  _getWorkerLoadingFailedErrorMessage(_descriptor) {
    return void 0;
  }
  getWorkerUrl(descriptor) {
    if (!descriptor.esmModuleLocation) {
      throw new Error("Missing esmModuleLocation in WebWorkerDescriptor");
    }
    const uri5 = typeof descriptor.esmModuleLocation === "function" ? descriptor.esmModuleLocation() : descriptor.esmModuleLocation;
    const urlStr = uri5.toString(true);
    return urlStr;
  }
};

var ttPolicy5 = (() => {
  const workerGlobalThis = globalThis;
  if (typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope" && workerGlobalThis.workerttPolicy !== void 0) {
    return workerGlobalThis.workerttPolicy;
  } else {
    return createTrustedTypesPolicy("defaultWorkerFactory", { createScriptURL: (value2) => value2 });
  }
})();

function createBlobWorker(blobUrl, options3) {
  if (!blobUrl.startsWith("blob:")) {
    throw new URIError("Not a blob-url: " + blobUrl);
  }
  return new Worker(ttPolicy5 ? ttPolicy5.createScriptURL(blobUrl) : blobUrl, { ...options3, type: "module" });
}

function getWorkerBootstrapUrl(label3, workerScriptUrl, workerLoadingFailedErrorMessage) {
  if (/^((http:)|(https:)|(file:))/.test(workerScriptUrl) && workerScriptUrl.substring(0, globalThis.origin.length) !== globalThis.origin) {
  } else {
    const start = workerScriptUrl.lastIndexOf("?");
    const end = workerScriptUrl.lastIndexOf("#", start);
    const params = start > 0 ? new URLSearchParams(workerScriptUrl.substring(start + 1, ~end ? end : void 0)) : new URLSearchParams();
    COI.addSearchParam(params, true, true);
    const search2 = params.toString();
    if (!search2) {
      workerScriptUrl = `${workerScriptUrl}#${label3}`;
    } else {
      workerScriptUrl = `${workerScriptUrl}?${params.toString()}#${label3}`;
    }
  }
  const blob = new Blob([coalesce([
    `/*${label3}*/`,
    `globalThis._VSCODE_NLS_MESSAGES = ${JSON.stringify(getNLSMessages())};`,
    `globalThis._VSCODE_NLS_LANGUAGE = ${JSON.stringify(getNLSLanguage())};`,
    `globalThis._VSCODE_FILE_ROOT = ${JSON.stringify(globalThis._VSCODE_FILE_ROOT)};`,
    `globalThis._VSCODE_PRODUCT_JSON = ${JSON.stringify(globalThis._VSCODE_PRODUCT_JSON)};`,
    `const ttPolicy = globalThis.trustedTypes?.createPolicy('defaultWorkerFactory', { createScriptURL: value => value });`,
    `globalThis.workerttPolicy = ttPolicy;`,
    workerLoadingFailedErrorMessage ? "try {" : "",
    `await import(ttPolicy?.createScriptURL(${JSON.stringify(workerScriptUrl)}) ?? ${JSON.stringify(workerScriptUrl)});`,
    workerLoadingFailedErrorMessage ? `} catch (err) { console.error(${JSON.stringify(workerLoadingFailedErrorMessage)}, err); throw err; }` : "",
    `globalThis.postMessage({ type: 'vscode-worker-ready' });`,
    `/*${label3}*/`
  ]).join("")], { type: "application/javascript" });
  return URL.createObjectURL(blob);
}

function whenESMWorkerReady(worker) {
  return new Promise((resolve3, reject) => {
    worker.onmessage = function(e) {
      if (e.data.type === "vscode-worker-ready") {
        worker.onmessage = null;
        resolve3(worker);
      }
    };
    worker.onerror = reject;
  });
}

function isPromiseLike(obj) {
  return !!obj && typeof obj.then === "function";
}

var WebWorker = class extends Disposable {
  constructor(worker, id2) {
    super();
    this._onMessage = this._register(new Emitter());
    this.onMessage = this._onMessage.event;
    this._onError = this._register(new Emitter());
    this.onError = this._onError.event;
    this.id = id2;
    this.worker = worker;
    this.postMessage("-please-ignore-", []);
    const errorHandler2 = (ev) => {
      this._onError.fire(ev);
    };
    this.worker.then((w) => {
      w.onmessage = (ev) => {
        this._onMessage.fire(ev.data);
      };
      w.onmessageerror = (ev) => {
        this._onError.fire(ev);
      };
      if (typeof w.addEventListener === "function") {
        w.addEventListener("error", errorHandler2);
      }
    });
    this._register(toDisposable(() => {
      this.worker?.then((w) => {
        w.onmessage = null;
        w.onmessageerror = null;
        w.removeEventListener("error", errorHandler2);
        w.terminate();
      });
      this.worker = null;
    }));
  }
  getId() {
    return this.id;
  }
  postMessage(message, transfer) {
    this.worker?.then((w) => {
      try {
        w.postMessage(message, transfer);
      } catch (err) {
        onUnexpectedError(err);
        onUnexpectedError(new Error(`FAILED to post message to worker`, { cause: err }));
      }
    });
  }
};
export { createBlobWorker, getWorkerBootstrapUrl, whenESMWorkerReady, isPromiseLike, WebWorkerService, ttPolicy5, WebWorker };
