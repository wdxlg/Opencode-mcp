// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/workingCopyHistoryService.ts
import { DeferredPromise, Limiter, RunOnceScheduler } from "./module-0036.mjs";
import { SaveSourceRegistry } from "./module-0926.mjs";
import { localize } from "./module-0001.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { dirname2, extname2, isEqual2, joinPath } from "./module-0034.mjs";
import { hash } from "./module-0039.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { indexOfPath, randomPath } from "./module-0031.mjs";
import { distinct } from "./module-0007.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { FileOperationError, IFileService } from "./module-0269.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { MAX_PARALLEL_HISTORY_IO_OPS } from "./module-3371.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";
import { WorkingCopyHistoryTracker } from "./module-4008.mjs";


// src/vs/workbench/services/workingCopy/common/workingCopyHistoryService.ts
var WorkingCopyHistoryModel = class _WorkingCopyHistoryModel {
  constructor(workingCopyResource, historyHome, entryAddedEmitter, entryChangedEmitter, entryReplacedEmitter, entryRemovedEmitter, options3, fileService, labelService, logService, configurationService) {
    this.historyHome = historyHome;
    this.entryAddedEmitter = entryAddedEmitter;
    this.entryChangedEmitter = entryChangedEmitter;
    this.entryReplacedEmitter = entryReplacedEmitter;
    this.entryRemovedEmitter = entryRemovedEmitter;
    this.options = options3;
    this.fileService = fileService;
    this.labelService = labelService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.entries = [];
    this.whenResolved = void 0;
    this.workingCopyResource = void 0;
    this.workingCopyName = void 0;
    this.historyEntriesFolder = void 0;
    this.historyEntriesListingFile = void 0;
    this.historyEntriesNameMatcher = void 0;
    this.versionId = 0;
    this.storedVersionId = this.versionId;
    this.storeLimiter = new Limiter(1);
    this.setWorkingCopy(workingCopyResource);
  }
  static {
    this.ENTRIES_FILE = "entries.json";
  }
  static {
    this.FILE_SAVED_SOURCE = SaveSourceRegistry.registerSource("default.source", localize(23760, null));
  }
  static {
    this.SETTINGS = {
      MAX_ENTRIES: "workbench.localHistory.maxFileEntries",
      MERGE_PERIOD: "workbench.localHistory.mergeWindow"
    };
  }
  setWorkingCopy(workingCopyResource) {
    this.workingCopyResource = workingCopyResource;
    this.workingCopyName = this.labelService.getUriBasenameLabel(workingCopyResource);
    this.historyEntriesNameMatcher = new RegExp(`[A-Za-z0-9]{4}${escapeRegExpCharacters(extname2(workingCopyResource))}`);
    this.historyEntriesFolder = this.toHistoryEntriesFolder(this.historyHome, workingCopyResource);
    this.historyEntriesListingFile = joinPath(this.historyEntriesFolder, _WorkingCopyHistoryModel.ENTRIES_FILE);
    this.entries = [];
    this.whenResolved = void 0;
  }
  toHistoryEntriesFolder(historyHome, workingCopyResource) {
    return joinPath(historyHome, hash(workingCopyResource.toString()).toString(16));
  }
  async addEntry(source = _WorkingCopyHistoryModel.FILE_SAVED_SOURCE, sourceDescription = void 0, timestamp = Date.now(), token) {
    let entryToReplace = void 0;
    const lastEntry = this.entries.at(-1);
    if (lastEntry && lastEntry.source === source) {
      const configuredReplaceInterval = this.configurationService.getValue(_WorkingCopyHistoryModel.SETTINGS.MERGE_PERIOD, { resource: this.workingCopyResource });
      if (timestamp - lastEntry.timestamp <= configuredReplaceInterval * 1e3) {
        entryToReplace = lastEntry;
      }
    }
    let entry;
    if (entryToReplace) {
      entry = await this.doReplaceEntry(entryToReplace, source, sourceDescription, timestamp, token);
    } else {
      entry = await this.doAddEntry(source, sourceDescription, timestamp, token);
    }
    if (this.options.flushOnChange && !token.isCancellationRequested) {
      await this.store(token);
    }
    return entry;
  }
  async doAddEntry(source, sourceDescription = void 0, timestamp, token) {
    const workingCopyResource = assertReturnsDefined(this.workingCopyResource);
    const workingCopyName = assertReturnsDefined(this.workingCopyName);
    const historyEntriesFolder = assertReturnsDefined(this.historyEntriesFolder);
    const id2 = `${randomPath(void 0, void 0, 4)}${extname2(workingCopyResource)}`;
    const location2 = joinPath(historyEntriesFolder, id2);
    await this.fileService.cloneFile(workingCopyResource, location2);
    const entry = {
      id: id2,
      workingCopy: { resource: workingCopyResource, name: workingCopyName },
      location: location2,
      timestamp,
      source,
      sourceDescription
    };
    this.entries.push(entry);
    this.versionId++;
    this.entryAddedEmitter.fire({ entry });
    return entry;
  }
  async doReplaceEntry(entry, source, sourceDescription = void 0, timestamp, token) {
    const workingCopyResource = assertReturnsDefined(this.workingCopyResource);
    await this.fileService.cloneFile(workingCopyResource, entry.location);
    entry.source = source;
    entry.sourceDescription = sourceDescription;
    entry.timestamp = timestamp;
    this.versionId++;
    this.entryReplacedEmitter.fire({ entry });
    return entry;
  }
  async removeEntry(entry, token) {
    await this.resolveEntriesOnce();
    if (token.isCancellationRequested) {
      return false;
    }
    const index2 = this.entries.indexOf(entry);
    if (index2 === -1) {
      return false;
    }
    await this.deleteEntry(entry);
    this.entries.splice(index2, 1);
    this.versionId++;
    this.entryRemovedEmitter.fire({ entry });
    if (this.options.flushOnChange && !token.isCancellationRequested) {
      await this.store(token);
    }
    return true;
  }
  async updateEntry(entry, properties, token) {
    await this.resolveEntriesOnce();
    if (token.isCancellationRequested) {
      return;
    }
    const index2 = this.entries.indexOf(entry);
    if (index2 === -1) {
      return;
    }
    entry.source = properties.source;
    this.versionId++;
    this.entryChangedEmitter.fire({ entry });
    if (this.options.flushOnChange && !token.isCancellationRequested) {
      await this.store(token);
    }
  }
  async getEntries() {
    await this.resolveEntriesOnce();
    const configuredMaxEntries = this.configurationService.getValue(_WorkingCopyHistoryModel.SETTINGS.MAX_ENTRIES, { resource: this.workingCopyResource });
    if (this.entries.length > configuredMaxEntries) {
      return this.entries.slice(this.entries.length - configuredMaxEntries);
    }
    return this.entries;
  }
  async hasEntries(skipResolve) {
    if (!skipResolve) {
      await this.resolveEntriesOnce();
    }
    return this.entries.length > 0;
  }
  resolveEntriesOnce() {
    if (!this.whenResolved) {
      this.whenResolved = this.doResolveEntries();
    }
    return this.whenResolved;
  }
  async doResolveEntries() {
    const entries2 = await this.resolveEntriesFromDisk();
    for (const entry of this.entries) {
      entries2.set(entry.id, entry);
    }
    this.entries = Array.from(entries2.values()).sort((entryA, entryB) => entryA.timestamp - entryB.timestamp);
  }
  async resolveEntriesFromDisk() {
    const workingCopyResource = assertReturnsDefined(this.workingCopyResource);
    const workingCopyName = assertReturnsDefined(this.workingCopyName);
    const [entryListing, entryStats] = await Promise.all([
      // Resolve entries listing file
      this.readEntriesFile(),
      // Resolve children of history folder
      this.readEntriesFolder()
    ]);
    const entries2 = /* @__PURE__ */ new Map();
    if (entryStats) {
      for (const entryStat of entryStats) {
        entries2.set(entryStat.name, {
          id: entryStat.name,
          workingCopy: { resource: workingCopyResource, name: workingCopyName },
          location: entryStat.resource,
          timestamp: entryStat.mtime,
          source: _WorkingCopyHistoryModel.FILE_SAVED_SOURCE,
          sourceDescription: void 0
        });
      }
    }
    if (entryListing) {
      for (const entry of entryListing.entries) {
        const existingEntry = entries2.get(entry.id);
        if (existingEntry) {
          entries2.set(entry.id, {
            ...existingEntry,
            timestamp: entry.timestamp,
            source: entry.source ?? existingEntry.source,
            sourceDescription: entry.sourceDescription ?? existingEntry.sourceDescription
          });
        }
      }
    }
    return entries2;
  }
  async moveEntries(target, source, token) {
    const timestamp = Date.now();
    const sourceDescription = this.labelService.getUriLabel(assertReturnsDefined(this.workingCopyResource));
    const sourceHistoryEntriesFolder = assertReturnsDefined(this.historyEntriesFolder);
    const targetHistoryEntriesFolder = assertReturnsDefined(target.historyEntriesFolder);
    try {
      for (const entry of this.entries) {
        await this.fileService.move(entry.location, joinPath(targetHistoryEntriesFolder, entry.id), true);
      }
      await this.fileService.del(sourceHistoryEntriesFolder, { recursive: true });
    } catch (error) {
      if (!this.isFileNotFound(error)) {
        try {
          await this.fileService.move(sourceHistoryEntriesFolder, targetHistoryEntriesFolder, true);
        } catch (error2) {
          if (!this.isFileNotFound(error2)) {
            this.traceError(error2);
          }
        }
      }
    }
    const allEntries = distinct([...this.entries, ...target.entries], (entry) => entry.id).sort((entryA, entryB) => entryA.timestamp - entryB.timestamp);
    const targetWorkingCopyResource = assertReturnsDefined(target.workingCopyResource);
    this.setWorkingCopy(targetWorkingCopyResource);
    const targetWorkingCopyName = assertReturnsDefined(target.workingCopyName);
    for (const entry of allEntries) {
      this.entries.push({
        id: entry.id,
        location: joinPath(targetHistoryEntriesFolder, entry.id),
        source: entry.source,
        sourceDescription: entry.sourceDescription,
        timestamp: entry.timestamp,
        workingCopy: {
          resource: targetWorkingCopyResource,
          name: targetWorkingCopyName
        }
      });
    }
    await this.addEntry(source, sourceDescription, timestamp, token);
    await this.store(token);
  }
  async store(token) {
    if (!this.shouldStore()) {
      return;
    }
    await this.storeLimiter.queue(async () => {
      if (token.isCancellationRequested || !this.shouldStore()) {
        return;
      }
      return this.doStore(token);
    });
  }
  shouldStore() {
    return this.storedVersionId !== this.versionId;
  }
  async doStore(token) {
    const historyEntriesFolder = assertReturnsDefined(this.historyEntriesFolder);
    await this.resolveEntriesOnce();
    if (token.isCancellationRequested) {
      return void 0;
    }
    await this.cleanUpEntries();
    const storedVersion = this.versionId;
    if (this.entries.length === 0) {
      try {
        await this.fileService.del(historyEntriesFolder, { recursive: true });
      } catch (error) {
        this.traceError(error);
      }
    } else {
      await this.writeEntriesFile();
    }
    this.storedVersionId = storedVersion;
  }
  async cleanUpEntries() {
    const configuredMaxEntries = this.configurationService.getValue(_WorkingCopyHistoryModel.SETTINGS.MAX_ENTRIES, { resource: this.workingCopyResource });
    if (this.entries.length <= configuredMaxEntries) {
      return;
    }
    const entriesToDelete = this.entries.slice(0, this.entries.length - configuredMaxEntries);
    const entriesToKeep = this.entries.slice(this.entries.length - configuredMaxEntries);
    for (const entryToDelete of entriesToDelete) {
      await this.deleteEntry(entryToDelete);
    }
    this.entries = entriesToKeep;
    for (const entry of entriesToDelete) {
      this.entryRemovedEmitter.fire({ entry });
    }
  }
  async deleteEntry(entry) {
    try {
      await this.fileService.del(entry.location);
    } catch (error) {
      this.traceError(error);
    }
  }
  async writeEntriesFile() {
    const workingCopyResource = assertReturnsDefined(this.workingCopyResource);
    const historyEntriesListingFile = assertReturnsDefined(this.historyEntriesListingFile);
    const serializedModel = {
      version: 1,
      resource: workingCopyResource.toString(),
      entries: this.entries.map((entry) => {
        return {
          id: entry.id,
          source: entry.source !== _WorkingCopyHistoryModel.FILE_SAVED_SOURCE ? entry.source : void 0,
          sourceDescription: entry.sourceDescription,
          timestamp: entry.timestamp
        };
      })
    };
    await this.fileService.writeFile(historyEntriesListingFile, VSBuffer.fromString(JSON.stringify(serializedModel)));
  }
  async readEntriesFile() {
    const historyEntriesListingFile = assertReturnsDefined(this.historyEntriesListingFile);
    let serializedModel = void 0;
    try {
      serializedModel = JSON.parse((await this.fileService.readFile(historyEntriesListingFile)).value.toString());
    } catch (error) {
      if (!this.isFileNotFound(error)) {
        this.traceError(error);
      }
    }
    return serializedModel;
  }
  async readEntriesFolder() {
    const historyEntriesFolder = assertReturnsDefined(this.historyEntriesFolder);
    const historyEntriesNameMatcher = assertReturnsDefined(this.historyEntriesNameMatcher);
    let rawEntries = void 0;
    try {
      rawEntries = (await this.fileService.resolve(historyEntriesFolder, { resolveMetadata: true })).children;
    } catch (error) {
      if (!this.isFileNotFound(error)) {
        this.traceError(error);
      }
    }
    if (!rawEntries) {
      return void 0;
    }
    return rawEntries.filter(
      (entry) => !isEqual2(entry.resource, this.historyEntriesListingFile) && // not the listings file
      historyEntriesNameMatcher.test(entry.name)
      // matching our expected file pattern for entries
    );
  }
  isFileNotFound(error) {
    return error instanceof FileOperationError && error.fileOperationResult === 1 /* FILE_NOT_FOUND */;
  }
  traceError(error) {
    this.logService.trace("[Working Copy History Service]", error);
  }
};

var WorkingCopyHistoryService = class extends Disposable {
  constructor(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, logService, configurationService) {
    super();
    this.fileService = fileService;
    this.remoteAgentService = remoteAgentService;
    this.environmentService = environmentService;
    this.uriIdentityService = uriIdentityService;
    this.labelService = labelService;
    this.logService = logService;
    this.configurationService = configurationService;
    this._onDidAddEntry = this._register(new Emitter());
    this.onDidAddEntry = this._onDidAddEntry.event;
    this._onDidChangeEntry = this._register(new Emitter());
    this.onDidChangeEntry = this._onDidChangeEntry.event;
    this._onDidReplaceEntry = this._register(new Emitter());
    this.onDidReplaceEntry = this._onDidReplaceEntry.event;
    this._onDidMoveEntries = this._register(new Emitter());
    this.onDidMoveEntries = this._onDidMoveEntries.event;
    this._onDidRemoveEntry = this._register(new Emitter());
    this.onDidRemoveEntry = this._onDidRemoveEntry.event;
    this._onDidRemoveEntries = this._register(new Emitter());
    this.onDidRemoveEntries = this._onDidRemoveEntries.event;
    this.localHistoryHome = new DeferredPromise();
    this.models = new ResourceMap((resource) => this.uriIdentityService.extUri.getComparisonKey(resource));
    this.resolveLocalHistoryHome();
  }
  static {
    this.FILE_MOVED_SOURCE = SaveSourceRegistry.registerSource("moved.source", localize(23762, null));
  }
  static {
    this.FILE_RENAMED_SOURCE = SaveSourceRegistry.registerSource("renamed.source", localize(23763, null));
  }
  async resolveLocalHistoryHome() {
    let historyHome = void 0;
    try {
      const remoteEnv = await this.remoteAgentService.getEnvironment();
      if (remoteEnv) {
        historyHome = remoteEnv.localHistoryHome;
      }
    } catch (error) {
      this.logService.trace(error);
    }
    if (!historyHome) {
      historyHome = this.environmentService.localHistoryHome;
    }
    this.localHistoryHome.complete(historyHome);
  }
  async moveEntries(source, target) {
    const limiter = new Limiter(MAX_PARALLEL_HISTORY_IO_OPS);
    const promises = [];
    for (const [resource, model] of this.models) {
      if (!this.uriIdentityService.extUri.isEqualOrParent(resource, source)) {
        continue;
      }
      let targetResource;
      if (this.uriIdentityService.extUri.isEqual(source, resource)) {
        targetResource = target;
      } else {
        const index2 = indexOfPath(resource.path, source.path);
        targetResource = joinPath(target, resource.path.substr(index2 + source.path.length + 1));
      }
      let saveSource;
      if (this.uriIdentityService.extUri.isEqual(dirname2(resource), dirname2(targetResource))) {
        saveSource = WorkingCopyHistoryService.FILE_RENAMED_SOURCE;
      } else {
        saveSource = WorkingCopyHistoryService.FILE_MOVED_SOURCE;
      }
      promises.push(limiter.queue(() => this.doMoveEntries(model, saveSource, resource, targetResource)));
    }
    if (!promises.length) {
      return [];
    }
    const resources = await Promise.all(promises);
    this._onDidMoveEntries.fire();
    return resources;
  }
  async doMoveEntries(source, saveSource, sourceWorkingCopyResource, targetWorkingCopyResource) {
    const target = await this.getModel(targetWorkingCopyResource);
    await source.moveEntries(target, saveSource, CancellationToken.None);
    this.models.delete(sourceWorkingCopyResource);
    this.models.set(targetWorkingCopyResource, source);
    return targetWorkingCopyResource;
  }
  async addEntry({ resource, source, timestamp }, token) {
    if (!this.fileService.hasProvider(resource)) {
      return void 0;
    }
    const model = await this.getModel(resource);
    if (token.isCancellationRequested) {
      return void 0;
    }
    return model.addEntry(source, void 0, timestamp, token);
  }
  async updateEntry(entry, properties, token) {
    const model = await this.getModel(entry.workingCopy.resource);
    if (token.isCancellationRequested) {
      return;
    }
    return model.updateEntry(entry, properties, token);
  }
  async removeEntry(entry, token) {
    const model = await this.getModel(entry.workingCopy.resource);
    if (token.isCancellationRequested) {
      return false;
    }
    return model.removeEntry(entry, token);
  }
  async removeAll(token) {
    const historyHome = await this.localHistoryHome.p;
    if (token.isCancellationRequested) {
      return;
    }
    this.models.clear();
    await this.fileService.del(historyHome, { recursive: true });
    this._onDidRemoveEntries.fire();
  }
  async getEntries(resource, token) {
    const model = await this.getModel(resource);
    if (token.isCancellationRequested) {
      return [];
    }
    const entries2 = await model.getEntries();
    return entries2 ?? [];
  }
  async getAll(token) {
    const historyHome = await this.localHistoryHome.p;
    if (token.isCancellationRequested) {
      return [];
    }
    const all = new ResourceMap();
    for (const [resource, model] of this.models) {
      const hasInMemoryEntries = await model.hasEntries(
        true
        /* skip resolving because we resolve below from disk */
      );
      if (hasInMemoryEntries) {
        all.set(resource, true);
      }
    }
    try {
      const resolvedHistoryHome = await this.fileService.resolve(historyHome);
      if (resolvedHistoryHome.children) {
        const limiter = new Limiter(MAX_PARALLEL_HISTORY_IO_OPS);
        const promises = [];
        for (const child of resolvedHistoryHome.children) {
          promises.push(limiter.queue(async () => {
            if (token.isCancellationRequested) {
              return;
            }
            try {
              const serializedModel = JSON.parse((await this.fileService.readFile(joinPath(child.resource, WorkingCopyHistoryModel.ENTRIES_FILE))).value.toString());
              if (serializedModel.entries.length > 0) {
                all.set(URI.parse(serializedModel.resource), true);
              }
            } catch (error) {
            }
          }));
        }
        await Promise.all(promises);
      }
    } catch (error) {
    }
    return Array.from(all.keys());
  }
  async getModel(resource) {
    const historyHome = await this.localHistoryHome.p;
    let model = this.models.get(resource);
    if (!model) {
      model = new WorkingCopyHistoryModel(resource, historyHome, this._onDidAddEntry, this._onDidChangeEntry, this._onDidReplaceEntry, this._onDidRemoveEntry, this.getModelOptions(), this.fileService, this.labelService, this.logService, this.configurationService);
      this.models.set(resource, model);
    }
    return model;
  }
};

WorkingCopyHistoryService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IConfigurationService)
], WorkingCopyHistoryService);

var NativeWorkingCopyHistoryService = class extends WorkingCopyHistoryService {
  constructor(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, lifecycleService, logService, configurationService) {
    super(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, logService, configurationService);
    this.lifecycleService = lifecycleService;
    // 5min
    this.isRemotelyStored = typeof this.environmentService.remoteAuthority === "string";
    this.storeAllCts = this._register(new CancellationTokenSource());
    this.storeAllScheduler = this._register(new RunOnceScheduler(() => this.storeAll(this.storeAllCts.token), NativeWorkingCopyHistoryService.STORE_ALL_INTERVAL));
    this.registerListeners();
  }
  static {
    this.STORE_ALL_INTERVAL = 5 * 60 * 1e3;
  }
  registerListeners() {
    if (!this.isRemotelyStored) {
      this._register(this.lifecycleService.onWillShutdown((e4) => this.onWillShutdown(e4)));
      this._register(Event2.any(this.onDidAddEntry, this.onDidChangeEntry, this.onDidReplaceEntry, this.onDidRemoveEntry)(() => this.onDidChangeModels()));
    }
  }
  getModelOptions() {
    return {
      flushOnChange: this.isRemotelyStored
      /* because the connection might drop anytime */
    };
  }
  onWillShutdown(e4) {
    this.storeAllScheduler.dispose();
    this.storeAllCts.dispose(true);
    e4.join(this.storeAll(e4.token), { id: "join.workingCopyHistory", label: localize(23761, null) });
  }
  onDidChangeModels() {
    if (!this.storeAllScheduler.isScheduled()) {
      this.storeAllScheduler.schedule();
    }
  }
  async storeAll(token) {
    const limiter = new Limiter(MAX_PARALLEL_HISTORY_IO_OPS);
    const promises = [];
    const models = Array.from(this.models.values());
    for (const model of models) {
      promises.push(limiter.queue(async () => {
        if (token.isCancellationRequested) {
          return;
        }
        try {
          await model.store(token);
        } catch (error) {
          this.logService.trace(error);
        }
      }));
    }
    await Promise.all(promises);
  }
};

NativeWorkingCopyHistoryService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, ILifecycleService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IConfigurationService)
], NativeWorkingCopyHistoryService);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(WorkingCopyHistoryTracker, 3 /* Restored */);
export { WorkingCopyHistoryModel, WorkingCopyHistoryService, NativeWorkingCopyHistoryService };
