// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostFileSystemEventService.ts
import { AsyncEmitter, Emitter } from "./module-0017.mjs";
import { Schemas } from "./module-0026.mjs";
import { URI } from "./module-0025.mjs";
import { GLOBSTAR, GLOB_SPLIT, parse3 } from "./module-0185.mjs";
import { Disposable3 } from "./module-0244.mjs";
import { MainContext } from "./module-0054.mjs";
import { rtrim } from "./module-0023.mjs";
import { normalizeWatcherPattern } from "./module-0392.mjs";
import { Lazy } from "./module-0021.mjs";
import { GlobPattern, WorkspaceEdit2 } from "./module-0245.mjs";
import { WorkspaceEdit } from "./module-0243.mjs";


// src/vs/workbench/api/common/extHostFileSystemEventService.ts
var FileSystemWatcher = class {
  constructor(mainContext, configuration, fileSystemInfo, workspace, extension, dispatcher, globPattern, options2) {
    this.session = Math.random();
    this._onDidCreate = new Emitter();
    this._onDidChange = new Emitter();
    this._onDidDelete = new Emitter();
    this._config = 0;
    if (options2.ignoreCreateEvents) {
      this._config += 1;
    }
    if (options2.ignoreChangeEvents) {
      this._config += 2;
    }
    if (options2.ignoreDeleteEvents) {
      this._config += 4;
    }
    const ignoreCase = typeof globPattern === "string" ? !((fileSystemInfo.getCapabilities(Schemas.file) ?? 0) & 1024 /* PathCaseSensitive */) : fileSystemInfo.extUri.ignorePathCasing(URI.revive(globPattern.baseUri));
    let matchGlob = globPattern;
    if (ignoreCase) {
      matchGlob = typeof globPattern === "string" ? globPattern.toLowerCase() : { base: globPattern.base.toLowerCase(), pattern: globPattern.pattern.toLowerCase() };
    }
    const parsedPattern = parse3(matchGlob, {
      ignoreCase: false
      /* speeds up matching, but requires us to lowercase paths and patterns */
    });
    const excludeOutOfWorkspaceEvents = typeof globPattern === "string";
    const excludeUncorrelatedEvents = false;
    const subscription = dispatcher((events) => {
      if (typeof events.session === "number" && events.session !== this.session) {
        return;
      }
      if (excludeUncorrelatedEvents && typeof events.session === "undefined") {
        return;
      }
      if (!options2.ignoreCreateEvents) {
        for (const { uri: uri2, lowerCaseFsPath } of events.created) {
          if (parsedPattern(ignoreCase ? lowerCaseFsPath : uri2.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri2))) {
            this._onDidCreate.fire(uri2);
          }
        }
      }
      if (!options2.ignoreChangeEvents) {
        for (const { uri: uri2, lowerCaseFsPath } of events.changed) {
          if (parsedPattern(ignoreCase ? lowerCaseFsPath : uri2.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri2))) {
            this._onDidChange.fire(uri2);
          }
        }
      }
      if (!options2.ignoreDeleteEvents) {
        for (const { uri: uri2, lowerCaseFsPath } of events.deleted) {
          if (parsedPattern(ignoreCase ? lowerCaseFsPath : uri2.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri2))) {
            this._onDidDelete.fire(uri2);
          }
        }
      }
    });
    this._disposable = Disposable3.from(this.ensureWatching(mainContext, workspace, configuration, extension, globPattern, options2, false), this._onDidCreate, this._onDidChange, this._onDidDelete, subscription);
  }
  get ignoreCreateEvents() {
    return Boolean(this._config & 1);
  }
  get ignoreChangeEvents() {
    return Boolean(this._config & 2);
  }
  get ignoreDeleteEvents() {
    return Boolean(this._config & 4);
  }
  ensureWatching(mainContext, workspace, configuration, extension, globPattern, options2, correlate) {
    const disposable = Disposable3.from();
    if (typeof globPattern === "string") {
      return disposable;
    }
    if (options2.ignoreChangeEvents && options2.ignoreCreateEvents && options2.ignoreDeleteEvents) {
      return disposable;
    }
    const proxy = mainContext.getProxy(MainContext.MainThreadFileSystemEventService);
    let recursive = false;
    if (globPattern.pattern.includes(GLOBSTAR) || globPattern.pattern.includes(GLOB_SPLIT)) {
      recursive = true;
    }
    const excludes = [];
    let includes = void 0;
    let filter2;
    if (correlate) {
      if (options2.ignoreChangeEvents || options2.ignoreCreateEvents || options2.ignoreDeleteEvents) {
        filter2 = 2 /* UPDATED */ | 4 /* ADDED */ | 8 /* DELETED */;
        if (options2.ignoreChangeEvents) {
          filter2 &= ~2 /* UPDATED */;
        }
        if (options2.ignoreCreateEvents) {
          filter2 &= ~4 /* ADDED */;
        }
        if (options2.ignoreDeleteEvents) {
          filter2 &= ~8 /* DELETED */;
        }
      }
    } else {
      if (recursive && excludes.length === 0) {
        const workspaceFolder = workspace.getWorkspaceFolder(URI.revive(globPattern.baseUri));
        const watcherExcludes = configuration.getConfiguration("files", workspaceFolder).get("watcherExclude");
        if (watcherExcludes) {
          for (const key in watcherExcludes) {
            if (key && watcherExcludes[key] === true) {
              excludes.push(key);
            }
          }
        }
      } else if (!recursive) {
        const workspaceFolder = workspace.getWorkspaceFolder(URI.revive(globPattern.baseUri));
        if (workspaceFolder) {
          const watcherExcludes = configuration.getConfiguration("files", workspaceFolder).get("watcherExclude");
          if (watcherExcludes) {
            for (const key in watcherExcludes) {
              if (key && watcherExcludes[key] === true) {
                const includePattern = `${rtrim(key, "/")}/${GLOBSTAR}`;
                if (!includes) {
                  includes = [];
                }
                includes.push(normalizeWatcherPattern(workspaceFolder.uri.fsPath, includePattern));
              }
            }
          }
          if (!includes || includes.length === 0) {
            return disposable;
          }
        }
      }
    }
    proxy.$watch(extension.identifier.value, this.session, globPattern.baseUri, { recursive, excludes, includes, filter: filter2 }, Boolean(correlate));
    return Disposable3.from({ dispose: () => proxy.$unwatch(this.session) });
  }
  dispose() {
    this._disposable.dispose();
  }
  get onDidCreate() {
    return this._onDidCreate.event;
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  get onDidDelete() {
    return this._onDidDelete.event;
  }
};

var LazyRevivedFileSystemEvents = class _LazyRevivedFileSystemEvents {
  constructor(_events) {
    this._events = _events;
    this._created = new Lazy(() => this._events.created.map(_LazyRevivedFileSystemEvents._revive));
    this._changed = new Lazy(() => this._events.changed.map(_LazyRevivedFileSystemEvents._revive));
    this._deleted = new Lazy(() => this._events.deleted.map(_LazyRevivedFileSystemEvents._revive));
    this.session = this._events.session;
  }
  get created() {
    return this._created.value;
  }
  get changed() {
    return this._changed.value;
  }
  get deleted() {
    return this._deleted.value;
  }
  static _revive(uriComponents) {
    const uri2 = URI.revive(uriComponents);
    return { uri: uri2, lowerCaseFsPath: uri2.fsPath.toLowerCase() };
  }
};

var ExtHostFileSystemEventService = class {
  constructor(_mainContext, _logService, _extHostDocumentsAndEditors) {
    this._mainContext = _mainContext;
    this._logService = _logService;
    this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
    this._onFileSystemEvent = new Emitter();
    this._onDidRenameFile = new Emitter();
    this._onDidCreateFile = new Emitter();
    this._onDidDeleteFile = new Emitter();
    this._onWillRenameFile = new AsyncEmitter();
    this._onWillCreateFile = new AsyncEmitter();
    this._onWillDeleteFile = new AsyncEmitter();
    this.onDidRenameFile = this._onDidRenameFile.event;
    this.onDidCreateFile = this._onDidCreateFile.event;
    this.onDidDeleteFile = this._onDidDeleteFile.event;
  }
  //--- file events
  createFileSystemWatcher(workspace, configProvider, fileSystemInfo, extension, globPattern, options2) {
    return new FileSystemWatcher(this._mainContext, configProvider, fileSystemInfo, workspace, extension, this._onFileSystemEvent.event, GlobPattern.from(globPattern), options2);
  }
  $onFileEvent(events) {
    this._onFileSystemEvent.fire(new LazyRevivedFileSystemEvents(events));
  }
  //--- file operations
  $onDidRunFileOperation(operation, files) {
    switch (operation) {
      case 2 /* MOVE */:
        this._onDidRenameFile.fire(Object.freeze({ files: files.map((f) => ({ oldUri: URI.revive(f.source), newUri: URI.revive(f.target) })) }));
        break;
      case 1 /* DELETE */:
        this._onDidDeleteFile.fire(Object.freeze({ files: files.map((f) => URI.revive(f.target)) }));
        break;
      case 0 /* CREATE */:
      case 3 /* COPY */:
        this._onDidCreateFile.fire(Object.freeze({ files: files.map((f) => URI.revive(f.target)) }));
        break;
      default:
    }
  }
  getOnWillRenameFileEvent(extension) {
    return this._createWillExecuteEvent(extension, this._onWillRenameFile);
  }
  getOnWillCreateFileEvent(extension) {
    return this._createWillExecuteEvent(extension, this._onWillCreateFile);
  }
  getOnWillDeleteFileEvent(extension) {
    return this._createWillExecuteEvent(extension, this._onWillDeleteFile);
  }
  _createWillExecuteEvent(extension, emitter) {
    return (listener, thisArg, disposables) => {
      const wrappedListener = function wrapped(e) {
        listener.call(thisArg, e);
      };
      wrappedListener.extension = extension;
      return emitter.event(wrappedListener, void 0, disposables);
    };
  }
  async $onWillRunFileOperation(operation, files, timeout2, token) {
    switch (operation) {
      case 2 /* MOVE */:
        return await this._fireWillEvent(this._onWillRenameFile, { files: files.map((f) => ({ oldUri: URI.revive(f.source), newUri: URI.revive(f.target) })) }, timeout2, token);
      case 1 /* DELETE */:
        return await this._fireWillEvent(this._onWillDeleteFile, { files: files.map((f) => URI.revive(f.target)) }, timeout2, token);
      case 0 /* CREATE */:
      case 3 /* COPY */:
        return await this._fireWillEvent(this._onWillCreateFile, { files: files.map((f) => URI.revive(f.target)) }, timeout2, token);
    }
    return void 0;
  }
  async _fireWillEvent(emitter, data, timeout2, token) {
    const extensionNames = /* @__PURE__ */ new Set();
    const edits = [];
    await emitter.fireAsync(data, token, async (thenable, listener) => {
      const now = Date.now();
      const result = await Promise.resolve(thenable);
      if (result instanceof WorkspaceEdit) {
        edits.push([listener.extension, result]);
        extensionNames.add(listener.extension.displayName ?? listener.extension.identifier.value);
      }
      if (Date.now() - now > timeout2) {
        this._logService.warn("SLOW file-participant", listener.extension.identifier);
      }
    });
    if (token.isCancellationRequested) {
      return void 0;
    }
    if (edits.length === 0) {
      return void 0;
    }
    const dto = { edits: [] };
    for (const [, edit2] of edits) {
      const { edits: edits2 } = WorkspaceEdit2.from(edit2, {
        getTextDocumentVersion: (uri2) => this._extHostDocumentsAndEditors.getDocument(uri2)?.version,
        getNotebookDocumentVersion: () => void 0
      });
      dto.edits = dto.edits.concat(edits2);
    }
    return { edit: dto, extensionNames: Array.from(extensionNames) };
  }
};
export { FileSystemWatcher, LazyRevivedFileSystemEvents, ExtHostFileSystemEventService };
