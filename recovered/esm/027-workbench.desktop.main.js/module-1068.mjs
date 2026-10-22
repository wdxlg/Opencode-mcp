// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadDecorations.ts
import { DeferredPromise } from "./module-0036.mjs";
import { CancellationError } from "./module-0004.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { dispose } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IDecorationsService } from "./module-1067.mjs";


// src/vs/workbench/api/browser/mainThreadDecorations.ts
var DecorationRequestsQueue = class {
  constructor(_proxy, _handle) {
    this._proxy = _proxy;
    this._handle = _handle;
    this._idPool = 0;
    this._requests = /* @__PURE__ */ new Map();
    this._resolver = /* @__PURE__ */ new Map();
  }
  enqueue(uri5, token) {
    const id2 = ++this._idPool;
    const defer = new DeferredPromise();
    this._requests.set(id2, { id: id2, uri: uri5 });
    this._resolver.set(id2, defer);
    this._processQueue();
    const sub = token.onCancellationRequested(() => {
      this._requests.delete(id2);
      this._resolver.delete(id2);
      defer.error(new CancellationError());
    });
    return defer.p.finally(() => sub.dispose());
  }
  _processQueue() {
    if (this._timer !== void 0) {
      return;
    }
    this._timer = setTimeout(() => {
      const requests = this._requests;
      const resolver = this._resolver;
      this._proxy.$provideDecorations(this._handle, [...requests.values()], CancellationToken.None).then((data) => {
        for (const [id2, defer] of resolver) {
          defer.complete(data[id2]);
        }
      });
      this._requests = /* @__PURE__ */ new Map();
      this._resolver = /* @__PURE__ */ new Map();
      this._timer = void 0;
    }, 0);
  }
};

var MainThreadDecorations = class {
  constructor(context2, _decorationsService) {
    this._decorationsService = _decorationsService;
    this._provider = /* @__PURE__ */ new Map();
    this._proxy = context2.getProxy(ExtHostContext.ExtHostDecorations);
  }
  dispose() {
    this._provider.forEach((value2) => dispose(value2));
    this._provider.clear();
  }
  $registerDecorationProvider(handle2, label3) {
    const emitter = new Emitter();
    const queue = new DecorationRequestsQueue(this._proxy, handle2);
    const registration = this._decorationsService.registerDecorationsProvider({
      label: label3,
      onDidChange: emitter.event,
      provideDecorations: async (uri5, token) => {
        const data = await queue.enqueue(uri5, token);
        if (!data) {
          return void 0;
        }
        const [bubble, tooltip, letter, themeColor] = data;
        return {
          weight: 10,
          bubble: bubble ?? false,
          color: themeColor?.id,
          tooltip,
          letter
        };
      }
    });
    this._provider.set(handle2, [emitter, registration]);
  }
  $onDidChange(handle2, resources) {
    const provider = this._provider.get(handle2);
    if (provider) {
      const [emitter] = provider;
      emitter.fire(resources && resources.map((r2) => URI.revive(r2)));
    }
  }
  $unregisterDecorationProvider(handle2) {
    const provider = this._provider.get(handle2);
    if (provider) {
      dispose(provider);
      this._provider.delete(handle2);
    }
  }
};

MainThreadDecorations = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDecorations),
  __decorateParam(1, IDecorationsService)
], MainThreadDecorations);
export { DecorationRequestsQueue, MainThreadDecorations };
