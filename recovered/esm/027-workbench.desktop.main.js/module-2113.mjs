// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostToolSetEnablementService.ts
import { createDecorator } from "./module-0077.mjs";
import { parseRemoteAgentHostHarness } from "./module-0958.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostToolSetEnablementService.ts
var IAgentHostToolSetEnablementService = createDecorator("agentHostToolSetEnablementService");

var AGENT_HOST_COPILOT_CLI_SESSION_TYPE = "agent-host-copilotcli";

function isCopilotCliSessionType(sessionType) {
  return sessionType === AGENT_HOST_COPILOT_CLI_SESSION_TYPE || parseRemoteAgentHostHarness(sessionType) === "copilotcli";
}

function isToolEnabledInSet(state, toolSetId, toolId) {
  return state.tools.get(toolId) ?? state.toolSets.get(toolSetId) ?? true;
}

function getToolSetTriState(state, toolSetId, toolIds) {
  let anyOn = false;
  let anyOff = false;
  for (const toolId of toolIds) {
    if (isToolEnabledInSet(state, toolSetId, toolId)) {
      anyOn = true;
    } else {
      anyOff = true;
    }
    if (anyOn && anyOff) {
      return "mixed";
    }
  }
  return anyOn;
}

function countEnabledCustomizationTools(toolSets, state, reader) {
  const enabled = /* @__PURE__ */ new Set();
  for (const ts of toolSets) {
    if (ts.deprecated) {
      continue;
    }
    for (const tool of ts.getTools(reader)) {
      if (isToolEnabledInSet(state, ts.id, tool.id)) {
        enabled.add(tool.id);
      }
    }
  }
  return enabled.size;
}

var STORAGE_KEY2 = "chat.agentHost.toolSetEnablement";

var EMPTY_STATE = { toolSets: /* @__PURE__ */ new Map(), tools: /* @__PURE__ */ new Map() };

var AgentHostToolSetEnablementService = class extends Disposable {
  constructor(_storageService) {
    super();
    this._storageService = _storageService;
    this._state = observableValue("agentHostToolSetEnablement", this._load());
    const storeForListener = this._register(new DisposableStore());
    this._register(this._storageService.onDidChangeValue(0 /* PROFILE */, STORAGE_KEY2, storeForListener)(() => {
      this._state.set(this._load(), void 0);
    }));
  }
  observe(sessionType) {
    return derived((reader) => this._state.read(reader).get(sessionType) ?? EMPTY_STATE);
  }
  getState(sessionType) {
    return this._state.get().get(sessionType) ?? EMPTY_STATE;
  }
  setToolSetEnabled(sessionType, toolSetId, toolIds, enabled) {
    const state = this.getState(sessionType);
    const toolSets = new Map(state.toolSets);
    const tools = new Map(state.tools);
    if (enabled) {
      toolSets.delete(toolSetId);
    } else {
      toolSets.set(toolSetId, false);
    }
    for (const toolId of toolIds) {
      tools.delete(toolId);
    }
    this._setState(sessionType, { toolSets, tools });
  }
  setToolEnabled(sessionType, toolSetId, toolId, enabled) {
    const state = this.getState(sessionType);
    const tools = new Map(state.tools);
    const setDefault = state.toolSets.get(toolSetId) ?? true;
    if (enabled === setDefault) {
      tools.delete(toolId);
    } else {
      tools.set(toolId, enabled);
    }
    this._setState(sessionType, { toolSets: state.toolSets, tools });
  }
  _setState(sessionType, next) {
    const current = new Map(this._state.get());
    if (next.toolSets.size === 0 && next.tools.size === 0) {
      current.delete(sessionType);
    } else {
      current.set(sessionType, { toolSets: new Map(next.toolSets), tools: new Map(next.tools) });
    }
    this._state.set(current, void 0);
    this._save(current);
  }
  _load() {
    const raw = this._storageService.get(STORAGE_KEY2, 0 /* PROFILE */);
    if (!raw) {
      return /* @__PURE__ */ new Map();
    }
    try {
      const parsed = JSON.parse(raw);
      const out = /* @__PURE__ */ new Map();
      for (const [sessionType, entry] of Object.entries(parsed)) {
        const toolSets = /* @__PURE__ */ new Map();
        const tools = /* @__PURE__ */ new Map();
        for (const [id2, value2] of Object.entries(entry.toolSets ?? {})) {
          toolSets.set(id2, value2);
        }
        for (const [id2, value2] of Object.entries(entry.tools ?? {})) {
          tools.set(id2, value2);
        }
        if (toolSets.size > 0 || tools.size > 0) {
          out.set(sessionType, { toolSets, tools });
        }
      }
      return out;
    } catch {
      return /* @__PURE__ */ new Map();
    }
  }
  _save(state) {
    if (state.size === 0) {
      this._storageService.remove(STORAGE_KEY2, 0 /* PROFILE */);
      return;
    }
    const out = {};
    for (const [sessionType, entry] of state) {
      out[sessionType] = {
        toolSets: Object.fromEntries(entry.toolSets),
        tools: Object.fromEntries(entry.tools)
      };
    }
    this._storageService.store(STORAGE_KEY2, JSON.stringify(out), 0 /* PROFILE */, 1 /* MACHINE */);
  }
};

AgentHostToolSetEnablementService = __decorateClass([
  __decorateParam(0, IStorageService)
], AgentHostToolSetEnablementService);

registerSingleton(IAgentHostToolSetEnablementService, AgentHostToolSetEnablementService, 1 /* Delayed */);
export { isCopilotCliSessionType, isToolEnabledInSet, getToolSetTriState, countEnabledCustomizationTools, IAgentHostToolSetEnablementService, AGENT_HOST_COPILOT_CLI_SESSION_TYPE, STORAGE_KEY2, EMPTY_STATE, AgentHostToolSetEnablementService };
