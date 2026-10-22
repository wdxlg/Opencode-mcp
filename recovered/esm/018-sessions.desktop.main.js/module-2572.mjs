// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugFilters.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { parseTimeToken, stripTimestampTokens } from "./module-2571.mjs";
import { CHAT_DEBUG_CMD_TOGGLE_MODEL_TURN, CHAT_DEBUG_CMD_TOGGLE_PROMPT_DISCOVERY, CHAT_DEBUG_CMD_TOGGLE_SUBAGENT, CHAT_DEBUG_CMD_TOGGLE_TOOL_CALL, CHAT_DEBUG_FILTER_ACTIVE, CHAT_DEBUG_KIND_MODEL_TURN, CHAT_DEBUG_KIND_PROMPT_DISCOVERY, CHAT_DEBUG_KIND_SUBAGENT, CHAT_DEBUG_KIND_TOOL_CALL } from "./module-2570.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { MenuRegistry } from "./module-0092.mjs";
import { viewFilterSubmenu } from "./module-1332.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugFilters.ts
var ChatDebugFilterState = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    // Kind visibility
    this.filterKindToolCall = true;
    this.filterKindModelTurn = true;
    this.filterKindPromptDiscovery = true;
    this.filterKindSubagent = true;
    // Text filter
    this.textFilter = "";
  }
  isKindVisible(kind, category9) {
    switch (kind) {
      case "toolCall":
        return this.filterKindToolCall;
      case "modelTurn":
        return this.filterKindModelTurn;
      case "generic":
        if (category9 !== "discovery" && category9 !== "customization") {
          return true;
        }
        return this.filterKindPromptDiscovery;
      case "subagentInvocation":
        return this.filterKindSubagent;
      default:
        return true;
    }
  }
  isAllKindsVisible() {
    return this.filterKindToolCall && this.filterKindModelTurn && this.filterKindPromptDiscovery && this.filterKindSubagent;
  }
  isAllFiltersDefault() {
    return this.isAllKindsVisible();
  }
  setTextFilter(text2) {
    const normalized = text2.toLowerCase();
    if (this.textFilter !== normalized) {
      this.textFilter = normalized;
      this.beforeTimestamp = parseTimeToken(normalized, "before");
      this.afterTimestamp = parseTimeToken(normalized, "after");
      this._onDidChange.fire();
    }
  }
  /** Returns the text filter with before:/after: tokens removed. */
  get textFilterWithoutTimestamps() {
    return stripTimestampTokens(this.textFilter);
  }
  isTimestampVisible(created) {
    const time = created.getTime();
    if (this.beforeTimestamp !== void 0 && time > this.beforeTimestamp) {
      return false;
    }
    if (this.afterTimestamp !== void 0 && time < this.afterTimestamp) {
      return false;
    }
    return true;
  }
  fire() {
    this._onDidChange.fire();
  }
};

function registerFilterMenuItems(state, scopedContextKeyService) {
  const store = new DisposableStore();
  CHAT_DEBUG_FILTER_ACTIVE.bindTo(scopedContextKeyService).set(true);
  const kindToolCallKey = CHAT_DEBUG_KIND_TOOL_CALL.bindTo(scopedContextKeyService);
  kindToolCallKey.set(true);
  const kindModelTurnKey = CHAT_DEBUG_KIND_MODEL_TURN.bindTo(scopedContextKeyService);
  kindModelTurnKey.set(true);
  const kindPromptDiscoveryKey = CHAT_DEBUG_KIND_PROMPT_DISCOVERY.bindTo(scopedContextKeyService);
  kindPromptDiscoveryKey.set(true);
  const kindSubagentKey = CHAT_DEBUG_KIND_SUBAGENT.bindTo(scopedContextKeyService);
  kindSubagentKey.set(true);
  const registerToggle = (id2, title, key3, group2, getter, setter, ctxKey) => {
    store.add(CommandsRegistry.registerCommand(id2, () => {
      const newVal = !getter();
      setter(newVal);
      ctxKey.set(newVal);
      state.fire();
    }));
    store.add(MenuRegistry.appendMenuItem(viewFilterSubmenu, {
      command: { id: id2, title, toggled: key3 },
      group: group2,
      when: CHAT_DEBUG_FILTER_ACTIVE
    }));
  };
  registerToggle(CHAT_DEBUG_CMD_TOGGLE_TOOL_CALL, localize(10594, null), CHAT_DEBUG_KIND_TOOL_CALL, "1_kind", () => state.filterKindToolCall, (v2) => {
    state.filterKindToolCall = v2;
  }, kindToolCallKey);
  registerToggle(CHAT_DEBUG_CMD_TOGGLE_MODEL_TURN, localize(10591, null), CHAT_DEBUG_KIND_MODEL_TURN, "1_kind", () => state.filterKindModelTurn, (v2) => {
    state.filterKindModelTurn = v2;
  }, kindModelTurnKey);
  registerToggle(CHAT_DEBUG_CMD_TOGGLE_PROMPT_DISCOVERY, localize(10592, null), CHAT_DEBUG_KIND_PROMPT_DISCOVERY, "1_kind", () => state.filterKindPromptDiscovery, (v2) => {
    state.filterKindPromptDiscovery = v2;
  }, kindPromptDiscoveryKey);
  registerToggle(CHAT_DEBUG_CMD_TOGGLE_SUBAGENT, localize(10593, null), CHAT_DEBUG_KIND_SUBAGENT, "1_kind", () => state.filterKindSubagent, (v2) => {
    state.filterKindSubagent = v2;
  }, kindSubagentKey);
  return store;
}

function bindFilterContextKeys(state, scopedContextKeyService) {
  CHAT_DEBUG_FILTER_ACTIVE.bindTo(scopedContextKeyService).set(true);
  const kindToolCallKey = CHAT_DEBUG_KIND_TOOL_CALL.bindTo(scopedContextKeyService);
  const kindModelTurnKey = CHAT_DEBUG_KIND_MODEL_TURN.bindTo(scopedContextKeyService);
  const kindPromptDiscoveryKey = CHAT_DEBUG_KIND_PROMPT_DISCOVERY.bindTo(scopedContextKeyService);
  const kindSubagentKey = CHAT_DEBUG_KIND_SUBAGENT.bindTo(scopedContextKeyService);
  return () => {
    kindToolCallKey.set(state.filterKindToolCall);
    kindModelTurnKey.set(state.filterKindModelTurn);
    kindPromptDiscoveryKey.set(state.filterKindPromptDiscovery);
    kindSubagentKey.set(state.filterKindSubagent);
  };
}
export { registerFilterMenuItems, bindFilterContextKeys, ChatDebugFilterState };
