// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/plugins/workspacePluginSettingsService.ts
import { createDecorator } from "./module-0077.mjs";
import { parseMarketplaceObjectEntry } from "./module-1026.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { joinPath } from "./module-0034.mjs";
import { autorun } from "./module-0052.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { parse5 } from "./module-0885.mjs";
import { CLAUDE_CONFIG_FOLDER } from "./module-0997.mjs";
import { derived } from "./module-0054.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/common/plugins/workspacePluginSettingsService.ts
var SETTINGS_FILENAME = "settings.json";

var SETTINGS_LOCAL_FILENAME = "settings.local.json";

var COPILOT_CONFIG_FOLDER2 = ".github/copilot";

var IWorkspacePluginSettingsService = createDecorator("workspacePluginSettingsService");

function parseEnabledPlugins(json) {
  const result = /* @__PURE__ */ new Map();
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return result;
  }
  const obj = json;
  for (const [key3, value2] of Object.entries(obj)) {
    if (typeof value2 === "boolean") {
      result.set(key3, value2);
    }
  }
  return result;
}

function parseExtraMarketplaces(json, logPrefix, logService) {
  const entries2 = [];
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return entries2;
  }
  const obj = json;
  for (const [name, value2] of Object.entries(obj)) {
    if (!value2 || typeof value2 !== "object") {
      logService.debug(`${logPrefix} Ignoring non-object extraKnownMarketplaces entry: ${name}`);
      continue;
    }
    const reference = parseMarketplaceObjectEntry({ ...value2, name });
    if (!reference) {
      logService.debug(`${logPrefix} Could not parse marketplace reference for: ${name}`);
      continue;
    }
    entries2.push({ name, reference });
  }
  return entries2;
}

var EMPTY_DATA = { marketplaces: [], enabledPlugins: /* @__PURE__ */ new Map() };

var WorkspaceSettingsReader = class extends Disposable {
  constructor(configFolder, logPrefix, fileService, workspaceContextService, _logService) {
    super();
    this._logService = _logService;
    this._data = observableValue("data", EMPTY_DATA);
    this.data = this._data;
    const settingsDirs = observableFromEvent(
      this,
      workspaceContextService.onDidChangeWorkspaceFolders,
      () => workspaceContextService.getWorkspace().folders.map((f) => f.uri.path ? joinPath(f.uri, configFolder) : joinPath(f.uri.with({ path: "/" }), configFolder))
    );
    const watcherStore = this._register(new DisposableStore());
    this._register(autorun((reader) => {
      const dirs = settingsDirs.read(reader);
      watcherStore.clear();
      const scheduler = new RunOnceScheduler(() => this._readSettings(dirs, logPrefix, fileService), 100);
      watcherStore.add(scheduler);
      for (const dir of dirs) {
        const watcher = fileService.createWatcher(dir, { recursive: false, excludes: [] });
        watcherStore.add(watcher);
        watcherStore.add(watcher.onDidChange((e4) => {
          if (e4.affects(joinPath(dir, SETTINGS_FILENAME)) || e4.affects(joinPath(dir, SETTINGS_LOCAL_FILENAME))) {
            scheduler.schedule();
          }
        }));
      }
      this._readSettings(dirs, logPrefix, fileService);
    }));
  }
  async _readSettings(dirs, logPrefix, fileService) {
    const allMarketplaces = [];
    const mergedEnabled = /* @__PURE__ */ new Map();
    for (const dir of dirs) {
      const sharedUri = joinPath(dir, SETTINGS_FILENAME);
      const localUri = joinPath(dir, SETTINGS_LOCAL_FILENAME);
      for (const uri4 of [sharedUri, localUri]) {
        try {
          const content = await fileService.readFile(uri4);
          const json = parse5(content.value.toString());
          if (!json || typeof json !== "object") {
            continue;
          }
          const root = json;
          const marketplaces = parseExtraMarketplaces(root.extraKnownMarketplaces, logPrefix, this._logService);
          for (const entry of marketplaces) {
            if (!allMarketplaces.some((e4) => e4.reference.canonicalId === entry.reference.canonicalId)) {
              allMarketplaces.push(entry);
            }
          }
          const enabled = parseEnabledPlugins(root.enabledPlugins);
          for (const [key3, value2] of enabled) {
            mergedEnabled.set(key3, value2);
          }
        } catch {
          this._logService.debug(`${logPrefix} Could not read ${uri4.toString()}`);
        }
      }
    }
    this._data.set({ marketplaces: allMarketplaces, enabledPlugins: mergedEnabled }, void 0);
  }
};

var WorkspacePluginSettingsService = class extends Disposable {
  constructor(fileService, workspaceContextService, logService) {
    super();
    const claudeReader = this._register(new WorkspaceSettingsReader(
      CLAUDE_CONFIG_FOLDER,
      "[ClaudePluginSettings]",
      fileService,
      workspaceContextService,
      logService
    ));
    const copilotReader = this._register(new WorkspaceSettingsReader(
      COPILOT_CONFIG_FOLDER2,
      "[CopilotPluginSettings]",
      fileService,
      workspaceContextService,
      logService
    ));
    this.extraMarketplaces = derived((reader) => {
      const claude = claudeReader.data.read(reader).marketplaces;
      const copilot = copilotReader.data.read(reader).marketplaces;
      const byCanonicalId = /* @__PURE__ */ new Map();
      for (const entry of [...claude, ...copilot]) {
        if (!byCanonicalId.has(entry.reference.canonicalId)) {
          byCanonicalId.set(entry.reference.canonicalId, entry);
        }
      }
      return [...byCanonicalId.values()];
    });
    this.enabledPlugins = derived((reader) => {
      const claude = claudeReader.data.read(reader).enabledPlugins;
      const copilot = copilotReader.data.read(reader).enabledPlugins;
      const merged = /* @__PURE__ */ new Map();
      for (const [key3, value2] of claude) {
        merged.set(key3, value2);
      }
      for (const [key3, value2] of copilot) {
        if (!merged.has(key3)) {
          merged.set(key3, value2);
        }
      }
      return merged;
    });
  }
};

WorkspacePluginSettingsService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, ILogService)
], WorkspacePluginSettingsService);
export { parseEnabledPlugins, parseExtraMarketplaces, SETTINGS_FILENAME, SETTINGS_LOCAL_FILENAME, COPILOT_CONFIG_FOLDER2, IWorkspacePluginSettingsService, EMPTY_DATA, WorkspaceSettingsReader, WorkspacePluginSettingsService };
