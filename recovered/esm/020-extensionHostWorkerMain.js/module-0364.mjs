// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/files/common/watcher.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0011.mjs";
import { GLOBSTAR } from "./module-0179.mjs";
import { isAbsolute } from "./module-0022.mjs";


// src/vs/platform/files/common/watcher.ts
var AbstractWatcherClient = class _AbstractWatcherClient extends Disposable {
  constructor(onFileChanges, onLogMessage, verboseLogging, options2) {
    super();
    this.onFileChanges = onFileChanges;
    this.onLogMessage = onLogMessage;
    this.verboseLogging = verboseLogging;
    this.options = options2;
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

function normalizeWatcherPattern(path, pattern) {
  if (typeof pattern === "string" && !pattern.startsWith(GLOBSTAR) && !isAbsolute(pattern)) {
    return { base: path, pattern };
  }
  return pattern;
}
export { normalizeWatcherPattern, AbstractWatcherClient };
