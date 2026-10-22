// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/files/electron-browser/diskFileSystemProvider.ts
import { AbstractDiskFileSystemProvider } from "./module-3763.mjs";
import { DiskFileSystemProviderClient, LOCAL_FILE_SYSTEM_CHANNEL_NAME } from "./module-3753.mjs";
import { isLinux } from "./module-0014.mjs";
import { UniversalWatcherClient } from "./module-3764.mjs";
import { LogService } from "./module-3761.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/services/files/electron-browser/diskFileSystemProvider.ts
var DiskFileSystemProvider = class extends AbstractDiskFileSystemProvider {
  constructor(mainProcessService, utilityProcessWorkerWorkbenchService, logService, loggerService) {
    super(logService, { watcher: {
      forceUniversal: true
      /* send all requests to universal watcher process */
    } });
    this.utilityProcessWorkerWorkbenchService = utilityProcessWorkerWorkbenchService;
    this.loggerService = loggerService;
    this._watcherLogService = void 0;
    this.provider = this._register(new DiskFileSystemProviderClient(mainProcessService.getChannel(LOCAL_FILE_SYSTEM_CHANNEL_NAME), { pathCaseSensitive: isLinux, trash: true }));
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.provider.onDidChangeFile((changes) => this._onDidChangeFile.fire(changes)));
    this._register(this.provider.onDidWatchError((error) => this._onDidWatchError.fire(error)));
  }
  //#region File Capabilities
  get onDidChangeCapabilities() {
    return this.provider.onDidChangeCapabilities;
  }
  get capabilities() {
    return this.provider.capabilities;
  }
  //#endregion
  //#region File Metadata Resolving
  stat(resource) {
    return this.provider.stat(resource);
  }
  realpath(resource) {
    return this.provider.realpath(resource);
  }
  readdir(resource) {
    return this.provider.readdir(resource);
  }
  //#endregion
  //#region File Reading/Writing
  readFile(resource, opts) {
    return this.provider.readFile(resource, opts);
  }
  readFileStream(resource, opts, token) {
    return this.provider.readFileStream(resource, opts, token);
  }
  writeFile(resource, content2, opts) {
    return this.provider.writeFile(resource, content2, opts);
  }
  open(resource, opts) {
    return this.provider.open(resource, opts);
  }
  close(fd) {
    return this.provider.close(fd);
  }
  read(fd, pos, data, offset, length) {
    return this.provider.read(fd, pos, data, offset, length);
  }
  write(fd, pos, data, offset, length) {
    return this.provider.write(fd, pos, data, offset, length);
  }
  //#endregion
  //#region Move/Copy/Delete/Create Folder
  mkdir(resource) {
    return this.provider.mkdir(resource);
  }
  delete(resource, opts) {
    return this.provider.delete(resource, opts);
  }
  rename(from, to, opts) {
    return this.provider.rename(from, to, opts);
  }
  copy(from, to, opts) {
    return this.provider.copy(from, to, opts);
  }
  //#endregion
  //#region Clone File
  cloneFile(from, to) {
    return this.provider.cloneFile(from, to);
  }
  //#endregion
  //#region File Watching
  createUniversalWatcher(onChange, onLogMessage, verboseLogging) {
    return new UniversalWatcherClient((changes) => onChange(changes), (msg) => onLogMessage(msg), verboseLogging, this.utilityProcessWorkerWorkbenchService);
  }
  createNonRecursiveWatcher() {
    throw new Error("Method not implemented in sandbox.");
  }
  get watcherLogService() {
    if (!this._watcherLogService) {
      this._watcherLogService = new LogService(this.loggerService.createLogger("fileWatcher", { name: localize(23155, null) }));
    }
    return this._watcherLogService;
  }
  logWatcherMessage(msg) {
    this.watcherLogService[msg.type](msg.message);
    if (msg.type !== "trace" && msg.type !== "debug") {
      super.logWatcherMessage(msg);
    }
  }
  //#endregion
};
export { DiskFileSystemProvider };
