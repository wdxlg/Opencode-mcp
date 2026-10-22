// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/files/node/watcher/watcherMain.js
// Original module marker: src/vs/platform/files/node/watcher/watcher.ts
import { Disposable } from "./module-0010.mjs";
import { ParcelWatcher } from "./module-0043.mjs";
import { NodeJSWatcher } from "./module-0048.mjs";
import { Emitter, Event } from "./module-0016.mjs";
import { isRecursiveWatchRequest } from "./module-0042.mjs";
import { computeStats } from "./module-0049.mjs";
import { Promises } from "./module-0027.mjs";


// src/vs/platform/files/node/watcher/watcher.ts
var UniversalWatcher = class extends Disposable {
  constructor() {
    super();
    this.recursiveWatcher = this._register(new ParcelWatcher());
    this.nonRecursiveWatcher = this._register(new NodeJSWatcher(this.recursiveWatcher));
    this.onDidChangeFile = Event.any(this.recursiveWatcher.onDidChangeFile, this.nonRecursiveWatcher.onDidChangeFile);
    this.onDidError = Event.any(this.recursiveWatcher.onDidError, this.nonRecursiveWatcher.onDidError);
    this._onDidLogMessage = this._register(new Emitter());
    this.onDidLogMessage = Event.any(this._onDidLogMessage.event, this.recursiveWatcher.onDidLogMessage, this.nonRecursiveWatcher.onDidLogMessage);
    this.requests = [];
    this.failedRecursiveRequests = 0;
    this._register(this.recursiveWatcher.onDidError((e) => {
      if (e.request) {
        this.failedRecursiveRequests++;
      }
    }));
  }
  async watch(requests) {
    this.requests = requests;
    this.failedRecursiveRequests = 0;
    let error;
    try {
      await this.recursiveWatcher.watch(requests.filter((request) => isRecursiveWatchRequest(request)));
    } catch (e) {
      error = e;
    }
    try {
      await this.nonRecursiveWatcher.watch(requests.filter((request) => !isRecursiveWatchRequest(request)));
    } catch (e) {
      if (!error) {
        error = e;
      }
    }
    if (error) {
      throw error;
    }
  }
  async setVerboseLogging(enabled) {
    if (enabled && this.requests.length > 0) {
      this._onDidLogMessage.fire({ type: "trace", message: computeStats(this.requests, this.failedRecursiveRequests, this.recursiveWatcher, this.nonRecursiveWatcher) });
    }
    await Promises.settled([
      this.recursiveWatcher.setVerboseLogging(enabled),
      this.nonRecursiveWatcher.setVerboseLogging(enabled)
    ]);
  }
  async stop() {
    await Promises.settled([
      this.recursiveWatcher.stop(),
      this.nonRecursiveWatcher.stop()
    ]);
  }
};
export { UniversalWatcher };
