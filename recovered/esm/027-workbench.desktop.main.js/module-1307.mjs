// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webviewView/browser/webviewViewService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { promiseWithResolvers } from "./module-0036.mjs";


// src/vs/workbench/contrib/webviewView/browser/webviewViewService.ts
var IWebviewViewService = createDecorator("webviewViewService");

var WebviewViewService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._resolvers = /* @__PURE__ */ new Map();
    this._awaitingRevival = /* @__PURE__ */ new Map();
    this._onNewResolverRegistered = this._register(new Emitter());
    this.onNewResolverRegistered = this._onNewResolverRegistered.event;
  }
  register(viewType, resolver) {
    if (this._resolvers.has(viewType)) {
      throw new Error(`View resolver already registered for ${viewType}`);
    }
    this._resolvers.set(viewType, resolver);
    this._onNewResolverRegistered.fire({ viewType });
    const pending = this._awaitingRevival.get(viewType);
    if (pending) {
      resolver.resolve(pending.webview, CancellationToken.None).then(() => {
        this._awaitingRevival.delete(viewType);
        pending.subscription.dispose();
        pending.resolve();
      });
    }
    return toDisposable(() => {
      this._resolvers.delete(viewType);
    });
  }
  resolve(viewType, webview, cancellation) {
    const resolver = this._resolvers.get(viewType);
    if (!resolver) {
      if (this._awaitingRevival.has(viewType)) {
        throw new Error("View already awaiting revival");
      }
      if (cancellation.isCancellationRequested) {
        return Promise.resolve();
      }
      const { promise, resolve: resolve3 } = promiseWithResolvers();
      const subscription = cancellation.onCancellationRequested(() => {
        if (this._awaitingRevival.get(viewType)?.resolve === resolve3) {
          this._awaitingRevival.delete(viewType);
          subscription.dispose();
          resolve3();
        }
      });
      this._awaitingRevival.set(viewType, { webview, resolve: resolve3, subscription });
      return promise;
    }
    return resolver.resolve(webview, cancellation);
  }
};
export { IWebviewViewService, WebviewViewService };
