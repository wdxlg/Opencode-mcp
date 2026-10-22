// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/files/common/diskFileSystemProvider.ts
import { Disposable, toDisposable } from "./module-0011.mjs";
import { Emitter } from "./module-0017.mjs";
import { ThrottledDelayer } from "./module-0028.mjs";
import { insert } from "./module-0006.mjs";
import { isRecursiveWatchRequest, reviveFileChanges } from "./module-0115.mjs";
import { onUnexpectedError } from "./module-0003.mjs";
import { normalize } from "./module-0019.mjs";
import { removeTrailingPathSeparator } from "./module-0023.mjs";


// src/vs/platform/files/common/diskFileSystemProvider.ts
var AbstractDiskFileSystemProvider = class extends Disposable {
  constructor(logService, options) {
    super();
    this.logService = logService;
    this.options = options;
    this._onDidChangeFile = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChangeFile.event;
    this._onDidWatchError = this._register(new Emitter());
    this.onDidWatchError = this._onDidWatchError.event;
    this.universalWatchRequests = [];
    this.universalWatchRequestDelayer = this._register(new ThrottledDelayer(this.getRefreshWatchersDelay(this.universalWatchRequests.length)));
    this.nonRecursiveWatchRequests = [];
    this.nonRecursiveWatchRequestDelayer = this._register(new ThrottledDelayer(this.getRefreshWatchersDelay(this.nonRecursiveWatchRequests.length)));
  }
  watch(resource, opts) {
    if (opts.recursive || this.options?.watcher?.forceUniversal) {
      return this.watchUniversal(resource, opts);
    }
    return this.watchNonRecursive(resource, opts);
  }
  getRefreshWatchersDelay(count) {
    if (count > 200) {
      return 500;
    }
    return 0;
  }
  watchUniversal(resource, opts) {
    const request = this.toWatchRequest(resource, opts);
    const remove2 = insert(this.universalWatchRequests, request);
    this.refreshUniversalWatchers();
    return toDisposable(() => {
      remove2();
      this.refreshUniversalWatchers();
    });
  }
  toWatchRequest(resource, opts) {
    const request = {
      path: this.toWatchPath(resource),
      excludes: opts.excludes,
      includes: opts.includes,
      recursive: opts.recursive,
      filter: opts.filter,
      correlationId: opts.correlationId
    };
    if (isRecursiveWatchRequest(request)) {
      const usePolling = this.options?.watcher?.recursive?.usePolling;
      if (usePolling === true) {
        request.pollingInterval = this.options?.watcher?.recursive?.pollingInterval ?? 5e3;
      } else if (Array.isArray(usePolling)) {
        if (usePolling.includes(request.path)) {
          request.pollingInterval = this.options?.watcher?.recursive?.pollingInterval ?? 5e3;
        }
      }
    }
    return request;
  }
  refreshUniversalWatchers() {
    this.universalWatchRequestDelayer.trigger(() => {
      return this.doRefreshUniversalWatchers();
    }, this.getRefreshWatchersDelay(this.universalWatchRequests.length)).catch((error) => onUnexpectedError(error));
  }
  doRefreshUniversalWatchers() {
    if (!this.universalWatcher) {
      this.universalWatcher = this._register(this.createUniversalWatcher(
        (changes) => this._onDidChangeFile.fire(reviveFileChanges(changes)),
        (msg) => this.onWatcherLogMessage(msg),
        this.logService.getLevel() === 1 /* Trace */
      ));
      this._register(this.logService.onDidChangeLogLevel(() => {
        this.universalWatcher?.setVerboseLogging(this.logService.getLevel() === 1 /* Trace */);
      }));
    }
    return this.universalWatcher.watch(this.universalWatchRequests);
  }
  watchNonRecursive(resource, opts) {
    const request = {
      path: this.toWatchPath(resource),
      excludes: opts.excludes,
      includes: opts.includes,
      recursive: false,
      filter: opts.filter,
      correlationId: opts.correlationId
    };
    const remove2 = insert(this.nonRecursiveWatchRequests, request);
    this.refreshNonRecursiveWatchers();
    return toDisposable(() => {
      remove2();
      this.refreshNonRecursiveWatchers();
    });
  }
  refreshNonRecursiveWatchers() {
    this.nonRecursiveWatchRequestDelayer.trigger(() => {
      return this.doRefreshNonRecursiveWatchers();
    }, this.getRefreshWatchersDelay(this.nonRecursiveWatchRequests.length)).catch((error) => onUnexpectedError(error));
  }
  doRefreshNonRecursiveWatchers() {
    if (!this.nonRecursiveWatcher) {
      this.nonRecursiveWatcher = this._register(this.createNonRecursiveWatcher(
        (changes) => this._onDidChangeFile.fire(reviveFileChanges(changes)),
        (msg) => this.onWatcherLogMessage(msg),
        this.logService.getLevel() === 1 /* Trace */
      ));
      this._register(this.logService.onDidChangeLogLevel(() => {
        this.nonRecursiveWatcher?.setVerboseLogging(this.logService.getLevel() === 1 /* Trace */);
      }));
    }
    return this.nonRecursiveWatcher.watch(this.nonRecursiveWatchRequests);
  }
  //#endregion
  onWatcherLogMessage(msg) {
    if (msg.type === "error") {
      this._onDidWatchError.fire(msg.message);
    }
    this.logWatcherMessage(msg);
  }
  logWatcherMessage(msg) {
    this.logService[msg.type](msg.message);
  }
  toFilePath(resource) {
    return normalize(resource.fsPath);
  }
  toWatchPath(resource) {
    const filePath = this.toFilePath(resource);
    return removeTrailingPathSeparator(filePath);
  }
};
export { AbstractDiskFileSystemProvider };
