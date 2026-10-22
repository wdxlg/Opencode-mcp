// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/files/node/watcher/nodejs/nodejsWatcher.ts
import { __esm } from "./module-0000.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { init_glob, patternsEquals } from "./module-0177.mjs";
import { BaseWatcher, init_baseWatcher } from "./module-0185.mjs";
import { init_platform, isLinux } from "./module-0006.mjs";
import { NodeJSFileWatcherLibrary, init_nodejsWatcherLib } from "./module-0186.mjs";
import { ThrottledWorker, init_async } from "./module-0034.mjs";
import { MutableDisposable, init_lifecycle } from "./module-0018.mjs";


// src/vs/platform/files/node/watcher/nodejs/nodejsWatcher.ts
var NodeJSWatcher;

var init_nodejsWatcher = __esm({
  "src/vs/platform/files/node/watcher/nodejs/nodejsWatcher.ts"() {
    init_event();
    init_glob();
    init_baseWatcher();
    init_platform();
    init_nodejsWatcherLib();
    init_async();
    init_lifecycle();
    NodeJSWatcher = class extends BaseWatcher {
      constructor(recursiveWatcher) {
        super();
        this.recursiveWatcher = recursiveWatcher;
        this.onDidError = Event.None;
        this._watchers = /* @__PURE__ */ new Map();
        this.worker = this._register(new MutableDisposable());
      }
      get watchers() {
        return this._watchers.values();
      }
      async doWatch(requests) {
        requests = this.removeDuplicateRequests(requests);
        const requestsToStart = [];
        const watchersToStop = new Set(Array.from(this.watchers));
        for (const request of requests) {
          const watcher = this._watchers.get(this.requestToWatcherKey(request));
          if (watcher && patternsEquals(watcher.request.excludes, request.excludes) && patternsEquals(watcher.request.includes, request.includes)) {
            watchersToStop.delete(watcher);
          } else {
            requestsToStart.push(request);
          }
        }
        if (requestsToStart.length) {
          this.trace(`Request to start watching: ${requestsToStart.map((request) => this.requestToString(request)).join(",")}`);
        }
        if (watchersToStop.size) {
          this.trace(`Request to stop watching: ${Array.from(watchersToStop).map((watcher) => this.requestToString(watcher.request)).join(",")}`);
        }
        this.worker.clear();
        for (const watcher of watchersToStop) {
          this.stopWatching(watcher);
        }
        this.createWatchWorker().work(requestsToStart);
      }
      createWatchWorker() {
        this.worker.value = new ThrottledWorker({
          maxWorkChunkSize: 100,
          // only start 100 watchers at once before...
          throttleDelay: 100,
          // ...resting for 100ms until we start watchers again...
          maxBufferedWork: Number.MAX_VALUE
          // ...and never refuse any work.
        }, (requests) => {
          for (const request of requests) {
            this.startWatching(request);
          }
        });
        return this.worker.value;
      }
      requestToWatcherKey(request) {
        return typeof request.correlationId === "number" ? request.correlationId : this.pathToWatcherKey(request.path);
      }
      pathToWatcherKey(path4) {
        return isLinux ? path4 : path4.toLowerCase();
      }
      startWatching(request) {
        const instance = new NodeJSFileWatcherLibrary(request, this.recursiveWatcher, (changes) => this._onDidChangeFile.fire(changes), () => this._onDidWatchFail.fire(request), (msg) => this._onDidLogMessage.fire(msg), this.verboseLogging);
        const watcher = { request, instance };
        this._watchers.set(this.requestToWatcherKey(request), watcher);
      }
      async stop() {
        await super.stop();
        for (const watcher of this.watchers) {
          this.stopWatching(watcher);
        }
      }
      stopWatching(watcher) {
        this.trace(`stopping file watcher`, watcher);
        this._watchers.delete(this.requestToWatcherKey(watcher.request));
        watcher.instance.dispose();
      }
      removeDuplicateRequests(requests) {
        const mapCorrelationtoRequests = /* @__PURE__ */ new Map();
        for (const request of requests) {
          let requestsForCorrelation = mapCorrelationtoRequests.get(request.correlationId);
          if (!requestsForCorrelation) {
            requestsForCorrelation = /* @__PURE__ */ new Map();
            mapCorrelationtoRequests.set(request.correlationId, requestsForCorrelation);
          }
          const path4 = this.pathToWatcherKey(request.path);
          if (requestsForCorrelation.has(path4)) {
            this.trace(`ignoring a request for watching who's path is already watched: ${this.requestToString(request)}`);
          }
          requestsForCorrelation.set(path4, request);
        }
        return Array.from(mapCorrelationtoRequests.values()).flatMap((requests2) => Array.from(requests2.values()));
      }
      async setVerboseLogging(enabled) {
        super.setVerboseLogging(enabled);
        for (const watcher of this.watchers) {
          watcher.instance.setVerboseLogging(enabled);
        }
      }
      trace(message, watcher) {
        if (this.verboseLogging) {
          this._onDidLogMessage.fire({ type: "trace", message: this.toMessage(message, watcher) });
        }
      }
      warn(message) {
        this._onDidLogMessage.fire({ type: "warn", message: this.toMessage(message) });
      }
      toMessage(message, watcher) {
        return watcher ? `[File Watcher (node.js)] ${message} (${this.requestToString(watcher.request)})` : `[File Watcher (node.js)] ${message}`;
      }
    };
  }
});
export { NodeJSWatcher, init_nodejsWatcher };
