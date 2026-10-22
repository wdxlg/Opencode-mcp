// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostFileMonitorService.ts
import { createDecorator } from "./module-0044.mjs";
import { parse5 } from "./module-0214.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0010.mjs";
import { disposableTimeout } from "./module-0027.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0128.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostFileMonitorService.ts
var IAgentHostFileMonitorService = createDecorator("agentHostFileMonitorService");

var DEFAULT_AGENT_HOST_WATCH_EXCLUDES = Object.freeze([
  "**/.git",
  "**/.git/lfs/**",
  "**/.git/logs/**",
  "**/.git/objects/**",
  "**/.git/subtree-cache/**",
  "**/.git/**/*.lock",
  "**/.git/**/FETCH_HEAD",
  "**/.git/**/fsmonitor--daemon/**",
  "**/*.watchman-cookie-*"
]);

function normalizeExcludes(excludes) {
  return [...excludes].sort();
}

function parseExcludes(excludes) {
  const expression = /* @__PURE__ */ Object.create(null);
  for (const exclude of excludes) {
    expression[exclude] = true;
  }
  return parse5(expression);
}

var AgentHostFileMonitorService = class extends Disposable {
  constructor(_fileService, _logService) {
    super();
    this._fileService = _fileService;
    this._logService = _logService;
    this._entries = this._register(new DisposableMap());
    this._register(this._fileService.onDidFilesChange((event) => this._onDidFilesChange(event)));
    this._register(this._fileService.onDidWatchError((error) => {
      this._logService.warn("[AgentHostFileMonitorService] File watcher error", error);
    }));
  }
  static {
    this._DEFAULT_DEBOUNCE_MS = 750;
  }
  acquire(folder, callback, options = {}) {
    const canonicalFolder = this._canonicalizeFolder(folder);
    const excludes = normalizeExcludes(options.excludes ?? DEFAULT_AGENT_HOST_WATCH_EXCLUDES);
    const debounceMs = options.debounceMs ?? AgentHostFileMonitorService._DEFAULT_DEBOUNCE_MS;
    const key = this._key(canonicalFolder, excludes, debounceMs);
    let entry = this._entries.get(key);
    if (!entry) {
      try {
        entry = this._createEntry(key, canonicalFolder, excludes, debounceMs);
      } catch (err) {
        this._logService.warn(`[AgentHostFileMonitorService] Failed to watch ${canonicalFolder.toString()}`, err);
        return void 0;
      }
      this._entries.set(key, entry);
    }
    entry.callbacks.add(callback);
    return toDisposable(() => {
      const current = this._entries.get(key);
      if (!current) {
        return;
      }
      current.callbacks.delete(callback);
      if (current.callbacks.size === 0) {
        this._entries.deleteAndDispose(key);
      }
    });
  }
  _createEntry(_key, folder, excludes, debounceMs) {
    const disposable = new DisposableStore();
    try {
      const debounce = disposable.add(new MutableDisposable());
      const callbacks = /* @__PURE__ */ new Set();
      const excludeMatcher = parseExcludes(excludes);
      disposable.add(this._fileService.watch(folder, { recursive: true, excludes: [...excludes] }));
      return { folder, callbacks, debounce, debounceMs, excludeMatcher, dispose: () => disposable.dispose() };
    } catch (err) {
      disposable.dispose();
      throw err;
    }
  }
  _onDidFilesChange(event) {
    for (const key of this._entries.keys()) {
      this._onDidFilesChangeEntry(key, event);
    }
  }
  _onDidFilesChangeEntry(key, event) {
    const entry = this._entries.get(key);
    if (!entry || entry.callbacks.size === 0) {
      return;
    }
    if (!event.affects(entry.folder) || !this._hasRelevantRawChange(entry, event)) {
      return;
    }
    entry.debounce.value = disposableTimeout(() => {
      entry.debounce.clear();
      for (const callback of [...entry.callbacks]) {
        try {
          callback();
        } catch (err) {
          this._logService.warn("[AgentHostFileMonitorService] Folder change callback failed", err);
        }
      }
    }, entry.debounceMs);
  }
  _hasRelevantRawChange(entry, event) {
    return this._hasRelevantRawResources(entry, event.rawAdded) || this._hasRelevantRawResources(entry, event.rawUpdated) || this._hasRelevantRawResources(entry, event.rawDeleted);
  }
  _hasRelevantRawResources(entry, resources) {
    for (const resource of resources) {
      if (!extUriBiasedIgnorePathCase.isEqualOrParent(resource, entry.folder)) {
        continue;
      }
      if (!this._isExcluded(entry, resource)) {
        return true;
      }
    }
    return false;
  }
  _isExcluded(entry, resource) {
    const basename3 = extUriBiasedIgnorePathCase.basename(resource);
    const relativePath2 = extUriBiasedIgnorePathCase.relativePath(entry.folder, resource);
    if (relativePath2 !== void 0 && this._matchesExclude(entry, relativePath2, basename3)) {
      return true;
    }
    return this._matchesExclude(entry, resource.path, basename3);
  }
  _matchesExclude(entry, path, basename3) {
    return typeof entry.excludeMatcher(path, basename3) === "string";
  }
  _canonicalizeFolder(folder) {
    return extUriBiasedIgnorePathCase.removeTrailingPathSeparator(extUriBiasedIgnorePathCase.normalizePath(folder));
  }
  _key(folder, excludes, debounceMs) {
    return `${extUriBiasedIgnorePathCase.getComparisonKey(folder)}\0${debounceMs}\0${excludes.join("\n")}`;
  }
};

AgentHostFileMonitorService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ILogService)
], AgentHostFileMonitorService);
export { normalizeExcludes, parseExcludes, IAgentHostFileMonitorService, DEFAULT_AGENT_HOST_WATCH_EXCLUDES, AgentHostFileMonitorService };
