// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/platform/files/common/watcher.ts
import { GLOBSTAR, init_glob, parse2 } from "./module-0039.mjs";
import { init_path, isAbsolute } from "./module-0004.mjs";
import { __esm } from "./module-0000.mjs";
import { Disposable, DisposableStore, MutableDisposable, init_lifecycle } from "./module-0014.mjs";
import { init_platform, isLinux } from "./module-0002.mjs";
import { init_uri } from "./module-0026.mjs";
import { init_files, isParent } from "./module-0038.mjs";


// src/vs/platform/files/common/watcher.ts
function isWatchRequestWithCorrelation(request) {
  return typeof request.correlationId === "number";
}

function coalesceEvents(changes) {
  const coalescer = new EventCoalescer();
  for (const event of changes) {
    coalescer.processEvent(event);
  }
  return coalescer.coalesce();
}

function normalizeWatcherPattern(path3, pattern) {
  if (typeof pattern === "string" && !pattern.startsWith(GLOBSTAR) && !isAbsolute(pattern)) {
    return { base: path3, pattern };
  }
  return pattern;
}

function parseWatcherPatterns(path3, patterns, ignoreCase) {
  const parsedPatterns = [];
  for (const pattern of patterns) {
    parsedPatterns.push(parse2(normalizeWatcherPattern(path3, pattern), { ignoreCase }));
  }
  return parsedPatterns;
}

function isFiltered(event, filter) {
  if (typeof filter === "number") {
    switch (event.type) {
      case 1 /* ADDED */:
        return (filter & 4 /* ADDED */) === 0;
      case 2 /* DELETED */:
        return (filter & 8 /* DELETED */) === 0;
      case 0 /* UPDATED */:
        return (filter & 2 /* UPDATED */) === 0;
    }
  }
  return false;
}

var AbstractWatcherClient, EventCoalescer;

var init_watcher = __esm({
  "src/vs/platform/files/common/watcher.ts"() {
    init_glob();
    init_lifecycle();
    init_path();
    init_platform();
    init_uri();
    init_files();
    AbstractWatcherClient = class _AbstractWatcherClient extends Disposable {
      constructor(onFileChanges, onLogMessage, verboseLogging, options) {
        super();
        this.onFileChanges = onFileChanges;
        this.onLogMessage = onLogMessage;
        this.verboseLogging = verboseLogging;
        this.options = options;
        this.watcherDisposables = this._register(new MutableDisposable());
        this.requests = void 0;
        this.restartCounter = 0;
      }
      static {
        this.MAX_RESTARTS = 5;
      }
      init() {
        const disposables = new DisposableStore();
        this.watcherDisposables.value = disposables;
        this.watcher = this.createWatcher(disposables);
        this.watcher.setVerboseLogging(this.verboseLogging);
        disposables.add(this.watcher.onDidChangeFile((changes) => this.onFileChanges(changes)));
        disposables.add(this.watcher.onDidLogMessage((msg) => this.onLogMessage(msg)));
        disposables.add(this.watcher.onDidError((e) => this.onError(e.error, e.request)));
      }
      onError(error, failedRequest) {
        if (this.canRestart(error, failedRequest)) {
          if (this.restartCounter < _AbstractWatcherClient.MAX_RESTARTS && this.requests) {
            this.error(`restarting watcher after unexpected error: ${error}`);
            this.restart(this.requests);
          } else {
            this.error(`gave up attempting to restart watcher after unexpected error: ${error}`);
          }
        } else {
          this.error(error);
        }
      }
      canRestart(error, failedRequest) {
        if (!this.options.restartOnError) {
          return false;
        }
        if (failedRequest) {
          return false;
        }
        if (error.indexOf("No space left on device") !== -1 || error.indexOf("EMFILE") !== -1) {
          return false;
        }
        return true;
      }
      restart(requests) {
        this.restartCounter++;
        this.init();
        this.watch(requests);
      }
      async watch(requests) {
        this.requests = requests;
        await this.watcher?.watch(requests);
      }
      async setVerboseLogging(verboseLogging) {
        this.verboseLogging = verboseLogging;
        await this.watcher?.setVerboseLogging(verboseLogging);
      }
      error(message) {
        this.onLogMessage({ type: "error", message: `[File Watcher (${this.options.type})] ${message}` });
      }
      trace(message) {
        this.onLogMessage({ type: "trace", message: `[File Watcher (${this.options.type})] ${message}` });
      }
      dispose() {
        this.watcher = void 0;
        return super.dispose();
      }
    };
    EventCoalescer = class {
      constructor() {
        this.coalesced = /* @__PURE__ */ new Set();
        this.mapPathToChange = /* @__PURE__ */ new Map();
      }
      toKey(event) {
        if (isLinux) {
          return event.resource.fsPath;
        }
        return event.resource.fsPath.toLowerCase();
      }
      processEvent(event) {
        const existingEvent = this.mapPathToChange.get(this.toKey(event));
        let keepEvent = false;
        if (existingEvent) {
          const currentChangeType = existingEvent.type;
          const newChangeType = event.type;
          if (existingEvent.resource.fsPath !== event.resource.fsPath && (event.type === 2 /* DELETED */ || event.type === 1 /* ADDED */)) {
            keepEvent = true;
          } else if (currentChangeType === 1 /* ADDED */ && newChangeType === 2 /* DELETED */) {
            this.mapPathToChange.delete(this.toKey(event));
            this.coalesced.delete(existingEvent);
          } else if (currentChangeType === 2 /* DELETED */ && newChangeType === 1 /* ADDED */) {
            existingEvent.type = 0 /* UPDATED */;
          } else if (currentChangeType === 1 /* ADDED */ && newChangeType === 0 /* UPDATED */) {
          } else {
            existingEvent.type = newChangeType;
          }
        } else {
          keepEvent = true;
        }
        if (keepEvent) {
          this.coalesced.add(event);
          this.mapPathToChange.set(this.toKey(event), event);
        }
      }
      coalesce() {
        const addOrChangeEvents = [];
        const deletedPaths = [];
        return Array.from(this.coalesced).filter((e) => {
          if (e.type !== 2 /* DELETED */) {
            addOrChangeEvents.push(e);
            return false;
          }
          return true;
        }).sort((e1, e2) => {
          return e1.resource.fsPath.length - e2.resource.fsPath.length;
        }).filter((e) => {
          if (deletedPaths.some((deletedPath) => isParent(
            e.resource.fsPath,
            deletedPath,
            !isLinux
            /* ignorecase */
          ))) {
            return false;
          }
          deletedPaths.push(e.resource.fsPath);
          return true;
        }).concat(addOrChangeEvents);
      }
    };
  }
});
export { isWatchRequestWithCorrelation, coalesceEvents, normalizeWatcherPattern, parseWatcherPatterns, isFiltered, AbstractWatcherClient, EventCoalescer, init_watcher };
