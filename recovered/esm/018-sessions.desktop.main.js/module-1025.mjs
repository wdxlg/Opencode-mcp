// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/plugins/fileBackedInstalledPluginsStore.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { isEqual2, joinPath } from "./module-0034.mjs";
import { RunOnceScheduler, ThrottledDelayer } from "./module-0036.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { revive } from "./module-0265.mjs";


// src/vs/workbench/contrib/chat/common/plugins/fileBackedInstalledPluginsStore.ts
var INSTALLED_JSON_FILENAME = "installed.json";

var INSTALLED_JSON_VERSION = 1;

var LEGACY_INSTALLED_PLUGINS_STORAGE_KEY = "chat.plugins.installed.v1";

var LEGACY_MARKETPLACE_INDEX_STORAGE_KEY = "chat.plugins.marketplaces.index.v1";

var FileBackedInstalledPluginsStore = class extends Disposable {
  constructor(_agentPluginsHome, _oldCacheRoot, _fileService, _logService, _storageService) {
    super();
    this._agentPluginsHome = _agentPluginsHome;
    this._oldCacheRoot = _oldCacheRoot;
    this._fileService = _fileService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._installed = observableValue("file/installed.json", []);
    this._suppressFileWatch = false;
    this._initialized = false;
    this.value = this._installed;
    this._fileUri = joinPath(_agentPluginsHome, INSTALLED_JSON_FILENAME);
    this._writeDelayer = this._register(new ThrottledDelayer(100));
    void this._initialize();
  }
  get() {
    return this._installed.get();
  }
  set(newValue, tx) {
    this._setValue(newValue, tx, true);
  }
  async _initialize() {
    try {
      const read = await this._readFromFile();
      if (read !== void 0) {
        this._setValue(read, void 0, false);
      } else {
        await this._migrateFromStorage();
      }
    } catch (error) {
      this._logService.error("[FileBackedInstalledPluginsStore] Initialization failed", error);
    }
    this._initialized = true;
    this._setupFileWatcher();
  }
  // --- File I/O ----------------------------------------------------------------
  async _readFromFile() {
    try {
      const exists = await this._fileService.exists(this._fileUri);
      if (!exists) {
        return void 0;
      }
      const content = await this._fileService.readFile(this._fileUri);
      const json = JSON.parse(content.value.toString());
      if (!json || !Array.isArray(json.installed)) {
        this._logService.warn("[FileBackedInstalledPluginsStore] installed.json has unexpected format, ignoring");
        return void 0;
      }
      return json.installed.filter((entry) => typeof entry.pluginUri === "string" && typeof entry.marketplace === "string").map((entry) => ({
        pluginUri: URI.parse(entry.pluginUri),
        marketplace: entry.marketplace,
        name: typeof entry.name === "string" ? entry.name : void 0
      }));
    } catch {
      return void 0;
    }
  }
  _scheduleWrite() {
    void this._writeDelayer.trigger(async () => {
      await this._writeToFile();
    });
  }
  async _writeToFile() {
    const entries2 = this.get().map((e4) => ({
      pluginUri: e4.pluginUri.toString(),
      marketplace: e4.marketplace,
      ...e4.name ? { name: e4.name } : {}
    }));
    const data = {
      version: INSTALLED_JSON_VERSION,
      installed: entries2
    };
    try {
      this._suppressFileWatch = true;
      const content = JSON.stringify(data, void 0, "	");
      await this._fileService.createFolder(this._agentPluginsHome);
      await this._fileService.writeFile(this._fileUri, VSBuffer.fromString(content));
      return true;
    } catch (error) {
      this._logService.error("[FileBackedInstalledPluginsStore] Failed to write installed.json", error);
      return false;
    } finally {
      this._suppressFileWatch = false;
    }
  }
  // --- File watching ------------------------------------------------------------
  _setupFileWatcher() {
    if (typeof this._fileService.createWatcher !== "function") {
      return;
    }
    const dir = this._agentPluginsHome;
    const watcher = this._fileService.createWatcher(dir, { recursive: false, excludes: [] });
    this._register(watcher);
    const scheduler = this._register(new RunOnceScheduler(() => this._onFileChanged(), 100));
    this._register(watcher.onDidChange((e4) => {
      if (!this._suppressFileWatch && e4.affects(this._fileUri)) {
        scheduler.schedule();
      }
    }));
  }
  async _onFileChanged() {
    const read = await this._readFromFile();
    if (read !== void 0) {
      this._suppressFileWatch = true;
      try {
        this._setValue(read, void 0, false);
      } finally {
        this._suppressFileWatch = false;
      }
    }
  }
  // --- Write-through to file ----------------------------------------------------
  _setValue(newValue, tx, scheduleWrite) {
    this._installed.set(newValue, tx);
    if (scheduleWrite && this._initialized && !this._suppressFileWatch) {
      this._scheduleWrite();
    }
  }
  // --- Migration from legacy storage -------------------------------------------
  async _migrateFromStorage() {
    const raw = this._storageService.get(LEGACY_INSTALLED_PLUGINS_STORAGE_KEY, -1 /* APPLICATION */);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return;
      }
      const migrated = revive(parsed).map((entry) => {
        const uri4 = URI.revive(entry.pluginUri);
        const rebased = this._rebasePluginUri(uri4);
        return {
          pluginUri: rebased ?? uri4,
          marketplace: entry.plugin?.marketplaceReference?.rawValue ?? "",
          name: entry.plugin?.name
        };
      }).filter((e4) => !!e4.marketplace);
      this._logService.info(`[FileBackedInstalledPluginsStore] Migrating ${migrated.length} plugin(s) from storage to installed.json`);
      this._setValue(migrated, void 0, false);
      const didPersist = await this._writeToFile();
      if (!didPersist) {
        return;
      }
      this._storageService.remove(LEGACY_INSTALLED_PLUGINS_STORAGE_KEY, -1 /* APPLICATION */);
      this._storageService.remove(LEGACY_MARKETPLACE_INDEX_STORAGE_KEY, -1 /* APPLICATION */);
    } catch (error) {
      this._logService.error("[FileBackedInstalledPluginsStore] Migration from storage failed", error);
    }
  }
  /**
   * If the plugin URI was under the old cache root, rebase it to the
   * new agent-plugins directory. Otherwise, return `undefined` to keep
   * the original.
   */
  _rebasePluginUri(uri4) {
    if (!this._oldCacheRoot) {
      return void 0;
    }
    const oldRoot = this._oldCacheRoot;
    if (!isEqual2(uri4, oldRoot) && uri4.scheme === oldRoot.scheme && uri4.path.startsWith(oldRoot.path + "/")) {
      const relativePart = uri4.path.substring(oldRoot.path.length);
      return uri4.with({ path: this._agentPluginsHome.path + relativePart });
    }
    return void 0;
  }
};
export { INSTALLED_JSON_FILENAME, INSTALLED_JSON_VERSION, LEGACY_INSTALLED_PLUGINS_STORAGE_KEY, LEGACY_MARKETPLACE_INDEX_STORAGE_KEY, FileBackedInstalledPluginsStore };
