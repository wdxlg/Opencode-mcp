// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatSelectedTools.ts
import { ILanguageModelToolsService, ToolAndToolSetEnablementMap, isToolSet } from "./module-0991.mjs";
import { isObject } from "./module-0010.mjs";
import { Disposable } from "./module-0012.mjs";
import { ObservableMap } from "./module-0067.mjs";
import { derived } from "./module-0054.mjs";
import { observableMemento } from "./module-1018.mjs";
import { PromptFileRewriter } from "./module-2136.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatSelectedTools.ts
var ToolEnablementStates;

((ToolEnablementStates2) => {
  function fromMap(map) {
    const toolSets = /* @__PURE__ */ new Map(), tools = /* @__PURE__ */ new Map();
    for (const [entry, enabled] of map) {
      if (isToolSet(entry)) {
        toolSets.set(entry.id, enabled);
      } else {
        tools.set(entry.id, enabled);
      }
    }
    return { toolSets, tools };
  }
  ToolEnablementStates2.fromMap = fromMap;
  function isStoredDataV1(data) {
    return isObject(data) && data.version === void 0 && (data.disabledTools === void 0 || Array.isArray(data.disabledTools)) && (data.disabledToolSets === void 0 || Array.isArray(data.disabledToolSets));
  }
  function isStoredDataV2(data) {
    return isObject(data) && data.version === 2 && Array.isArray(data.toolSetEntries) && Array.isArray(data.toolEntries);
  }
  function fromStorage(storage) {
    try {
      const parsed = JSON.parse(storage);
      if (isStoredDataV2(parsed)) {
        return { toolSets: new Map(parsed.toolSetEntries), tools: new Map(parsed.toolEntries) };
      } else if (isStoredDataV1(parsed)) {
        const toolSetEntries = parsed.disabledToolSets?.map((id2) => [id2, false]);
        const toolEntries = parsed.disabledTools?.map((id2) => [id2, false]);
        return { toolSets: new Map(toolSetEntries), tools: new Map(toolEntries) };
      }
    } catch {
    }
    return { toolSets: /* @__PURE__ */ new Map(), tools: /* @__PURE__ */ new Map() };
  }
  ToolEnablementStates2.fromStorage = fromStorage;
  function toStorage(state) {
    const storageData = {
      version: 2,
      toolSetEntries: Array.from(state.toolSets.entries()),
      toolEntries: Array.from(state.tools.entries())
    };
    return JSON.stringify(storageData);
  }
  ToolEnablementStates2.toStorage = toStorage;
})(ToolEnablementStates || (ToolEnablementStates = {}));

var ChatSelectedTools = class extends Disposable {
  constructor(_mode, languageModel, _toolsService, _storageService, _instantiationService) {
    super();
    this._mode = _mode;
    this.languageModel = languageModel;
    this._toolsService = _toolsService;
    this._instantiationService = _instantiationService;
    this._sessionStates = new ObservableMap();
    /**
     * All tools and tool sets with their enabled state.
     * Tools are filtered based on the current model context.
     */
    this.entriesMap = derived((r2) => {
      const map = /* @__PURE__ */ new Map();
      const lm = this.languageModel.read(r2)?.metadata;
      const currentMode = this._mode.read(r2);
      let currentMap = this._sessionStates.observable.read(r2).get(currentMode.id);
      if (!currentMap && currentMode.kind === "agent" /* Agent */) {
        const modeTools = currentMode.customTools?.read(r2);
        if (modeTools) {
          currentMap = ToolEnablementStates.fromMap(this._toolsService.toToolAndToolSetEnablementMap(modeTools, lm));
        }
      }
      if (!currentMap) {
        currentMap = this._globalState.read(r2);
      }
      for (const tool of this._currentTools.read(r2)) {
        if (tool.canBeReferencedInPrompt) {
          map.set(tool, currentMap.tools.get(tool.id) !== false);
        }
      }
      for (const toolSet of this._toolsService.getToolSetsForModel(lm, r2)) {
        if (toolSet.hiddenInToolsPicker) {
          continue;
        }
        const toolSetEnabled = currentMap.toolSets.get(toolSet.id) !== false;
        map.set(toolSet, toolSetEnabled);
        for (const tool of toolSet.getTools(r2)) {
          map.set(tool, toolSetEnabled || currentMap.tools.get(tool.id) === true);
        }
      }
      return ToolAndToolSetEnablementMap.fromMap(map);
    });
    this.userSelectedTools = derived((r2) => {
      const result = {};
      const map = this.entriesMap.read(r2);
      for (const [item, enabled] of map) {
        if (!isToolSet(item)) {
          result[item.id] = enabled;
        }
      }
      return result;
    });
    const globalStateMemento = observableMemento({
      key: "chat/selectedTools",
      defaultValue: { toolSets: /* @__PURE__ */ new Map(), tools: /* @__PURE__ */ new Map() },
      fromStorage: ToolEnablementStates.fromStorage,
      toStorage: ToolEnablementStates.toStorage
    });
    this._globalState = this._store.add(globalStateMemento(0 /* PROFILE */, 1 /* MACHINE */, _storageService));
    this._currentTools = languageModel.map((lm) => _toolsService.observeTools(lm?.metadata)).map((o, r2) => o.read(r2));
  }
  get entriesScope() {
    const mode = this._mode.get();
    if (this._sessionStates.has(mode.id)) {
      return 1 /* Session */;
    }
    if (mode.kind === "agent" /* Agent */ && mode.customTools?.get() && mode.uri) {
      return mode.source?.storage !== "extension" /* extension */ ? 2 /* Agent */ : 3 /* Agent_ReadOnly */;
    }
    return 0 /* Global */;
  }
  get currentMode() {
    return this._mode.get();
  }
  resetSessionEnablementState() {
    const mode = this._mode.get();
    this._sessionStates.delete(mode.id);
  }
  set(enablementMap, sessionOnly) {
    const mode = this._mode.get();
    if (sessionOnly || this._sessionStates.has(mode.id)) {
      this._sessionStates.set(mode.id, ToolEnablementStates.fromMap(enablementMap));
      return;
    }
    if (mode.kind === "agent" /* Agent */ && mode.customTools?.get() && mode.uri) {
      if (mode.source?.storage !== "extension" /* extension */) {
        this.updateCustomModeTools(mode.uri.get(), enablementMap);
        return;
      } else {
        this._sessionStates.set(mode.id, ToolEnablementStates.fromMap(enablementMap));
        return;
      }
    }
    this._globalState.set(ToolEnablementStates.fromMap(enablementMap), void 0);
  }
  async updateCustomModeTools(uri4, enablementMap) {
    await this._instantiationService.createInstance(PromptFileRewriter).openAndRewriteTools(uri4, enablementMap, CancellationToken.None);
  }
};

ChatSelectedTools = __decorateClass([
  __decorateParam(2, ILanguageModelToolsService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService)
], ChatSelectedTools);
export { ToolEnablementStates, ChatSelectedTools };
