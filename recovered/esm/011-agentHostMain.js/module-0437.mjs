// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/files/node/watcher/nodejs/nodejsWatcherLib.ts
import { Disposable, DisposableStore, MutableDisposable, thenRegisterOrDispose, toDisposable } from "./module-0010.mjs";
import { RunOnceWorker, ThrottledWorker } from "./module-0027.mjs";
import { CancellationTokenSource } from "./module-0017.mjs";
import { Lazy } from "./module-0020.mjs";
import { Promises2 } from "./module-0038.mjs";
import { isLinux, isMacintosh } from "./module-0013.mjs";
import { coalesceEvents, isFiltered, isWatchRequestWithCorrelation, parseWatcherPatterns } from "./module-0433.mjs";
import { URI } from "./module-0023.mjs";
import { isEqual, isEqualOrParent } from "./module-0022.mjs";
import { basename, dirname, isAbsolute, join } from "./module-0018.mjs";
import { normalizeNFC } from "./module-0039.mjs";
import { joinPath } from "./module-0025.mjs";


// src/vs/platform/files/node/watcher/nodejs/nodejsWatcherLib.ts
import { watch, promises as promises9 } from "fs";

var NodeJSFileWatcherLibrary = class _NodeJSFileWatcherLibrary extends Disposable {
  constructor(request, recursiveWatcher, onDidFilesChange, onDidWatchFail, onLogMessage, verboseLogging) {
    super();
    this.request = request;
    this.recursiveWatcher = recursiveWatcher;
    this.onDidFilesChange = onDidFilesChange;
    this.onDidWatchFail = onDidWatchFail;
    this.onLogMessage = onLogMessage;
    this.verboseLogging = verboseLogging;
    // Reduce likelyhood of spam from file events via throttling.
    // These numbers are a bit more aggressive compared to the
    // recursive watcher because we can have many individual
    // node.js watchers per request.
    // (https://github.com/microsoft/vscode/issues/124723)
    this.throttledFileChangesEmitter = this._register(new ThrottledWorker(
      {
        maxWorkChunkSize: 100,
        // only process up to 100 changes at once before...
        throttleDelay: 200,
        // ...resting for 200ms until we process events again...
        maxBufferedWork: 1e4
        // ...but never buffering more than 10000 events in memory
      },
      (events) => this.onDidFilesChange(events)
    ));
    // Aggregate file changes over FILE_CHANGES_HANDLER_DELAY
    // to coalesce events and reduce spam.
    this.fileChangesAggregator = this._register(new RunOnceWorker((events) => this.handleFileChanges(events), _NodeJSFileWatcherLibrary.FILE_CHANGES_HANDLER_DELAY));
    this.cts = new CancellationTokenSource();
    this.realPath = new Lazy(async () => {
      let result = this.request.path;
      try {
        result = await Promises2.realpath(this.request.path);
        if (this.request.path !== result) {
          this.trace(`correcting a path to watch that seems to be a symbolic link (original: ${this.request.path}, real: ${result})`);
        }
      } catch (error) {
      }
      return result;
    });
    this._isReusingRecursiveWatcher = false;
    this.didFail = false;
    const ignoreCase = !isLinux;
    this.excludes = parseWatcherPatterns(this.request.path, this.request.excludes, ignoreCase);
    this.includes = this.request.includes ? parseWatcherPatterns(this.request.path, this.request.includes, ignoreCase) : void 0;
    this.filter = isWatchRequestWithCorrelation(this.request) ? this.request.filter : void 0;
    this.ready = this.watch();
  }
  static {
    // A delay in reacting to file deletes to support
    // atomic save operations where a tool may chose
    // to delete a file before creating it again for
    // an update.
    this.FILE_DELETE_HANDLER_DELAY = 100;
  }
  static {
    // A delay for collecting file changes from node.js
    // before collecting them for coalescing and emitting
    // Same delay as used for the recursive watcher.
    this.FILE_CHANGES_HANDLER_DELAY = 75;
  }
  get isReusingRecursiveWatcher() {
    return this._isReusingRecursiveWatcher;
  }
  get failed() {
    return this.didFail;
  }
  async watch() {
    try {
      const stat3 = await promises9.stat(this.request.path);
      if (this.cts.token.isCancellationRequested) {
        return;
      }
      await thenRegisterOrDispose(this.doWatch(stat3.isDirectory()), this._store);
    } catch (error) {
      if (error.code !== "ENOENT") {
        this.error(error);
      } else {
        this.trace(`ignoring a path for watching who's stat info failed to resolve: ${this.request.path} (error: ${error})`);
      }
      this.notifyWatchFailed();
    }
  }
  notifyWatchFailed() {
    this.didFail = true;
    this.onDidWatchFail?.();
  }
  async doWatch(isDirectory) {
    const activeWatch = new MutableDisposable();
    try {
      await this.doWatchGeneration(isDirectory, activeWatch);
      return activeWatch;
    } catch (error) {
      activeWatch.dispose();
      throw error;
    }
  }
  async doWatchGeneration(isDirectory, activeWatch) {
    const disposables = new DisposableStore();
    activeWatch.value = disposables;
    if (activeWatch.value !== disposables) {
      disposables.dispose();
      return;
    }
    if (this.doWatchWithExistingWatcher(isDirectory, disposables, activeWatch)) {
      this.trace(`reusing an existing recursive watcher for ${this.request.path}`);
      this._isReusingRecursiveWatcher = true;
    } else {
      this._isReusingRecursiveWatcher = false;
      await this.doWatchWithNodeJS(isDirectory, disposables, activeWatch);
    }
  }
  doWatchWithExistingWatcher(isDirectory, disposables, activeWatch) {
    if (isDirectory) {
      return false;
    }
    const resource = URI.file(this.request.path);
    const subscription = this.recursiveWatcher?.subscribe(this.request.path, async (error, change) => {
      if (disposables.isDisposed) {
        return;
      }
      if (error) {
        await this.doWatchGeneration(isDirectory, activeWatch);
      } else if (change) {
        if (typeof change.cId === "number" || typeof this.request.correlationId === "number") {
          this.onFileChange(
            { resource, type: change.type, cId: this.request.correlationId },
            true
            /* skip excludes/includes (file is explicitly watched) */
          );
        }
      }
    });
    if (subscription) {
      disposables.add(subscription);
      return true;
    }
    return false;
  }
  async doWatchWithNodeJS(isDirectory, disposables, activeWatch) {
    const realPath = await this.realPath.value;
    if (this.cts.token.isCancellationRequested || disposables.isDisposed) {
      return;
    }
    if (isMacintosh && isEqualOrParent(realPath, "/Volumes/", true)) {
      this.error(`Refusing to watch ${realPath} for changes using fs.watch() for possibly being a network share where watching is unreliable and unstable.`);
      return;
    }
    const cts = new CancellationTokenSource(this.cts.token);
    disposables.add(toDisposable(() => cts.dispose(true)));
    const watcherDisposables = new DisposableStore();
    disposables.add(watcherDisposables);
    try {
      const requestResource = URI.file(this.request.path);
      const pathBasename = basename(realPath);
      const watcher = watch(realPath);
      watcherDisposables.add(toDisposable(() => {
        watcher.removeAllListeners();
        watcher.close();
      }));
      this.trace(`Started watching: '${realPath}'`);
      const folderChildren = /* @__PURE__ */ new Set();
      if (isDirectory) {
        try {
          for (const child of await Promises2.readdir(realPath)) {
            folderChildren.add(child);
          }
        } catch (error) {
          this.error(error);
        }
      }
      if (cts.token.isCancellationRequested) {
        return;
      }
      const mapPathToStatDisposable = /* @__PURE__ */ new Map();
      watcherDisposables.add(toDisposable(() => {
        for (const [, disposable] of mapPathToStatDisposable) {
          disposable.dispose();
        }
        mapPathToStatDisposable.clear();
      }));
      watcher.on("error", (code, signal) => {
        if (cts.token.isCancellationRequested) {
          return;
        }
        this.error(`Failed to watch ${realPath} for changes using fs.watch() (${code}, ${signal})`);
        this.notifyWatchFailed();
      });
      watcher.on("change", (type, raw) => {
        if (cts.token.isCancellationRequested) {
          return;
        }
        if (this.verboseLogging) {
          this.traceWithCorrelation(`[raw] ["${type}"] ${raw}`);
        }
        let changedFileName = "";
        if (raw) {
          changedFileName = raw.toString();
          if (isMacintosh) {
            changedFileName = normalizeNFC(changedFileName);
          }
        }
        if (!changedFileName || type !== "change" && type !== "rename") {
          return;
        }
        if (isDirectory) {
          if (type === "rename") {
            const isAbsoluteWatchedPathChange = isAbsolute(changedFileName) && isEqual(basename(changedFileName), pathBasename, !isLinux);
            const pendingStat = mapPathToStatDisposable.get(changedFileName);
            if (isAbsoluteWatchedPathChange && pendingStat) {
              return;
            }
            pendingStat?.dispose();
            const timeoutHandle = setTimeout(async () => {
              mapPathToStatDisposable.delete(changedFileName);
              if (isAbsoluteWatchedPathChange) {
                activeWatch.clear();
                const watchedPathExists = await Promises2.exists(realPath);
                if (this.cts.token.isCancellationRequested) {
                  return;
                }
                if (watchedPathExists) {
                  await this.doWatchGeneration(true, activeWatch);
                } else {
                  this.onWatchedPathDeleted(requestResource);
                }
                return;
              }
              if (isEqual(changedFileName, pathBasename, !isLinux) && !await Promises2.exists(realPath)) {
                activeWatch.clear();
                this.onWatchedPathDeleted(requestResource);
                return;
              }
              if (cts.token.isCancellationRequested) {
                return;
              }
              const fileExists3 = await this.existsChildStrictCase(join(realPath, changedFileName));
              if (cts.token.isCancellationRequested) {
                return;
              }
              let type2;
              if (fileExists3) {
                if (folderChildren.has(changedFileName)) {
                  type2 = 0 /* UPDATED */;
                } else {
                  type2 = 1 /* ADDED */;
                  folderChildren.add(changedFileName);
                }
              } else {
                folderChildren.delete(changedFileName);
                type2 = 2 /* DELETED */;
              }
              this.onFileChange({ resource: joinPath(requestResource, changedFileName), type: type2, cId: this.request.correlationId });
            }, _NodeJSFileWatcherLibrary.FILE_DELETE_HANDLER_DELAY);
            mapPathToStatDisposable.set(changedFileName, toDisposable(() => clearTimeout(timeoutHandle)));
          } else {
            let type2;
            if (folderChildren.has(changedFileName)) {
              type2 = 0 /* UPDATED */;
            } else {
              type2 = 1 /* ADDED */;
              folderChildren.add(changedFileName);
            }
            this.onFileChange({ resource: joinPath(requestResource, changedFileName), type: type2, cId: this.request.correlationId });
          }
        } else {
          if (type === "rename" || !isEqual(changedFileName, pathBasename, !isLinux)) {
            const timeoutHandle = setTimeout(async () => {
              const fileExists3 = await Promises2.exists(realPath);
              if (cts.token.isCancellationRequested) {
                return;
              }
              if (fileExists3) {
                activeWatch.clear();
                this.onFileChange(
                  { resource: requestResource, type: 0 /* UPDATED */, cId: this.request.correlationId },
                  true
                  /* skip excludes/includes (file is explicitly watched) */
                );
                await this.doWatchGeneration(false, activeWatch);
              } else {
                activeWatch.clear();
                this.onWatchedPathDeleted(requestResource);
              }
            }, _NodeJSFileWatcherLibrary.FILE_DELETE_HANDLER_DELAY);
            watcherDisposables.clear();
            watcherDisposables.add(toDisposable(() => clearTimeout(timeoutHandle)));
          } else {
            this.onFileChange(
              { resource: requestResource, type: 0 /* UPDATED */, cId: this.request.correlationId },
              true
              /* skip excludes/includes (file is explicitly watched) */
            );
          }
        }
      });
    } catch (error) {
      if (cts.token.isCancellationRequested) {
        return;
      }
      this.error(`Failed to watch ${realPath} for changes using fs.watch() (${error.toString()})`);
      this.notifyWatchFailed();
    }
  }
  onWatchedPathDeleted(resource) {
    this.warn("Watcher shutdown because watched path got deleted");
    this.onFileChange(
      { resource, type: 2 /* DELETED */, cId: this.request.correlationId },
      true
      /* skip excludes/includes (file is explicitly watched) */
    );
    this.fileChangesAggregator.flush();
    this.notifyWatchFailed();
  }
  onFileChange(event, skipIncludeExcludeChecks = false) {
    if (this.cts.token.isCancellationRequested) {
      return;
    }
    if (this.verboseLogging) {
      this.traceWithCorrelation(`${event.type === 1 /* ADDED */ ? "[ADDED]" : event.type === 2 /* DELETED */ ? "[DELETED]" : "[CHANGED]"} ${event.resource.fsPath}`);
    }
    if (!skipIncludeExcludeChecks && this.excludes.some((exclude) => exclude(event.resource.fsPath))) {
      if (this.verboseLogging) {
        this.traceWithCorrelation(` >> ignored (excluded) ${event.resource.fsPath}`);
      }
    } else if (!skipIncludeExcludeChecks && this.includes && this.includes.length > 0 && !this.includes.some((include) => include(event.resource.fsPath))) {
      if (this.verboseLogging) {
        this.traceWithCorrelation(` >> ignored (not included) ${event.resource.fsPath}`);
      }
    } else {
      this.fileChangesAggregator.work(event);
    }
  }
  handleFileChanges(fileChanges) {
    const coalescedFileChanges = coalesceEvents(fileChanges);
    const filteredEvents = [];
    for (const event of coalescedFileChanges) {
      if (isFiltered(event, this.filter)) {
        if (this.verboseLogging) {
          this.traceWithCorrelation(` >> ignored (filtered) ${event.resource.fsPath}`);
        }
        continue;
      }
      filteredEvents.push(event);
    }
    if (filteredEvents.length === 0) {
      return;
    }
    if (this.verboseLogging) {
      for (const event of filteredEvents) {
        this.traceWithCorrelation(` >> normalized ${event.type === 1 /* ADDED */ ? "[ADDED]" : event.type === 2 /* DELETED */ ? "[DELETED]" : "[CHANGED]"} ${event.resource.fsPath}`);
      }
    }
    const worked = this.throttledFileChangesEmitter.work(filteredEvents);
    if (!worked) {
      this.warn(`started ignoring events due to too many file change events at once (incoming: ${filteredEvents.length}, most recent change: ${filteredEvents[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
    } else {
      if (this.throttledFileChangesEmitter.pending > 0) {
        this.trace(`started throttling events due to large amount of file change events at once (pending: ${this.throttledFileChangesEmitter.pending}, most recent change: ${filteredEvents[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
      }
    }
  }
  async existsChildStrictCase(path) {
    if (isLinux) {
      return Promises2.exists(path);
    }
    try {
      const pathBasename = basename(path);
      const children = await Promises2.readdir(dirname(path));
      return children.some((child) => child === pathBasename);
    } catch (error) {
      this.trace(error);
      return false;
    }
  }
  setVerboseLogging(verboseLogging) {
    this.verboseLogging = verboseLogging;
  }
  error(error) {
    if (!this.cts.token.isCancellationRequested) {
      this.onLogMessage?.({ type: "error", message: `[File Watcher (node.js)] ${error}` });
    }
  }
  warn(message) {
    if (!this.cts.token.isCancellationRequested) {
      this.onLogMessage?.({ type: "warn", message: `[File Watcher (node.js)] ${message}` });
    }
  }
  trace(message) {
    if (!this.cts.token.isCancellationRequested && this.verboseLogging) {
      this.onLogMessage?.({ type: "trace", message: `[File Watcher (node.js)] ${message}` });
    }
  }
  traceWithCorrelation(message) {
    if (!this.cts.token.isCancellationRequested && this.verboseLogging) {
      this.trace(`${message}${typeof this.request.correlationId === "number" ? ` <${this.request.correlationId}> ` : ``}`);
    }
  }
  dispose() {
    this.cts.dispose(true);
    super.dispose();
  }
};
export { watch, promises9, NodeJSFileWatcherLibrary };
