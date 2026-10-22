// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/channels-session/reducer.ts
import { softAssertNever2 } from "./module-2222.mjs";


// src/vs/platform/agentHost/common/state/protocol/channels-session/reducer.ts
var STATUS_ACTIVITY_MASK2 = (1 << 5) - 1;

function withStatusFlag(status2, flag, set) {
  return set ? status2 | flag : status2 & ~flag;
}

function awaitsUser(request2) {
  return request2.kind !== "toolClientExecution" /* ToolClientExecution */;
}

function withInputNeededStatus(status2, inputNeeded) {
  if (inputNeeded.some(awaitsUser)) {
    return status2 & ~STATUS_ACTIVITY_MASK2 | 24 /* InputNeeded */;
  }
  return status2 & ~(24 /* InputNeeded */ & ~8 /* InProgress */);
}

function updateMcpServerCustomization(state, id2, update) {
  const list2 = state.customizations;
  if (!list2) {
    return state;
  }
  const topIdx = list2.findIndex((c) => c.id === id2);
  if (topIdx >= 0) {
    const entry = list2[topIdx];
    if (entry.type !== "mcpServer" /* McpServer */) {
      return state;
    }
    const updated2 = list2.slice();
    updated2[topIdx] = update(entry);
    return { ...state, customizations: updated2 };
  }
  let changed = false;
  const updated = list2.map((container3) => {
    if (container3.type === "mcpServer" /* McpServer */) {
      return container3;
    }
    const children = container3.children;
    if (!children) {
      return container3;
    }
    const childIdx = children.findIndex((c) => c.id === id2);
    if (childIdx < 0) {
      return container3;
    }
    const child = children[childIdx];
    if (child.type !== "mcpServer" /* McpServer */) {
      return container3;
    }
    changed = true;
    const newChildren = children.slice();
    newChildren[childIdx] = update(child);
    return { ...container3, children: newChildren };
  });
  if (!changed) {
    return state;
  }
  return { ...state, customizations: updated };
}

function applyCustomizationEnablement(customization, enablement) {
  switch (customization.type) {
    case "plugin" /* Plugin */:
    case "mcpServer" /* McpServer */: {
      if (enablement.length > 0) {
        return { ...customization, enablement: [...enablement] };
      }
      const { enablement: _enablement, ...withoutEnablement } = customization;
      return withoutEnablement;
    }
    default:
      return { ...customization, enabled: enablement[0]?.enabled ?? true };
  }
}

function sessionReducer(state, action, log4) {
  switch (action.type) {
    // ── Lifecycle ──────────────────────────────────────────────────────────
    case "session/ready" /* SessionReady */:
      return { ...state, lifecycle: "ready" /* Ready */ };
    case "session/creationFailed" /* SessionCreationFailed */:
      return {
        ...state,
        lifecycle: "failed" /* Failed */,
        creationError: action.error
      };
    case "session/chatAdded" /* SessionChatAdded */: {
      const list2 = state.chats;
      const idx = list2.findIndex((c) => c.resource === action.summary.resource);
      if (idx < 0) {
        return { ...state, chats: [...list2, action.summary] };
      }
      const updated = list2.slice();
      updated[idx] = action.summary;
      return { ...state, chats: updated };
    }
    case "session/chatRemoved" /* SessionChatRemoved */: {
      const list2 = state.chats;
      const idx = list2.findIndex((c) => c.resource === action.chat);
      if (idx < 0) {
        return state;
      }
      const updated = list2.slice();
      updated.splice(idx, 1);
      const next = { ...state, chats: updated };
      if (state.defaultChat === action.chat) {
        delete next.defaultChat;
      }
      return next;
    }
    case "session/chatUpdated" /* SessionChatUpdated */: {
      const list2 = state.chats;
      const idx = list2.findIndex((c) => c.resource === action.chat);
      if (idx < 0) {
        return state;
      }
      const { resource: _ignored, ...changes } = action.changes;
      const updated = list2.slice();
      updated[idx] = { ...list2[idx], ...changes };
      return { ...state, chats: updated };
    }
    case "session/defaultChatChanged" /* SessionDefaultChatChanged */:
      return { ...state, defaultChat: action.defaultChat };
    // ── Metadata ──────────────────────────────────────────────────────────
    case "session/titleChanged" /* SessionTitleChanged */:
      return { ...state, title: action.title };
    case "session/isReadChanged" /* SessionIsReadChanged */:
      return {
        ...state,
        status: withStatusFlag(state.status, 32 /* IsRead */, action.isRead)
      };
    case "session/isArchivedChanged" /* SessionIsArchivedChanged */:
      return {
        ...state,
        status: withStatusFlag(state.status, 64 /* IsArchived */, action.isArchived)
      };
    case "session/activityChanged" /* SessionActivityChanged */:
      return { ...state, activity: action.activity };
    case "session/changesetsChanged" /* SessionChangesetsChanged */: {
      const { changesets: _omit, ...stateWithoutChangesets } = state;
      return action.changesets ? { ...stateWithoutChangesets, changesets: action.changesets } : stateWithoutChangesets;
    }
    case "session/configChanged" /* SessionConfigChanged */:
      if (!state.config) {
        return state;
      }
      return {
        ...state,
        config: {
          ...state.config,
          values: action.replace ? { ...action.config } : { ...state.config.values, ...action.config }
        }
      };
    case "session/metaChanged" /* SessionMetaChanged */:
      return { ...state, _meta: action._meta };
    case "session/serverToolsChanged" /* SessionServerToolsChanged */:
      return { ...state, serverTools: action.tools };
    case "session/activeClientSet" /* SessionActiveClientSet */: {
      const list2 = state.activeClients;
      const idx = list2.findIndex((c) => c.clientId === action.activeClient.clientId);
      if (idx < 0) {
        return { ...state, activeClients: [...list2, action.activeClient] };
      }
      const updated = list2.slice();
      updated[idx] = action.activeClient;
      return { ...state, activeClients: updated };
    }
    case "session/activeClientRemoved" /* SessionActiveClientRemoved */: {
      const list2 = state.activeClients;
      const idx = list2.findIndex((c) => c.clientId === action.clientId);
      if (idx < 0) {
        return state;
      }
      const updated = list2.slice();
      updated.splice(idx, 1);
      return { ...state, activeClients: updated };
    }
    // ── Working Directories ─────────────────────────────────────────────
    case "session/workingDirectorySet" /* SessionWorkingDirectorySet */: {
      const list2 = state.workingDirectories ?? [];
      if (list2.includes(action.directory)) {
        return state;
      }
      return { ...state, workingDirectories: [...list2, action.directory] };
    }
    case "session/workingDirectoryRemoved" /* SessionWorkingDirectoryRemoved */: {
      const list2 = state.workingDirectories;
      if (!list2) {
        return state;
      }
      const idx = list2.indexOf(action.directory);
      if (idx < 0) {
        return state;
      }
      const updated = list2.slice();
      updated.splice(idx, 1);
      return { ...state, workingDirectories: updated };
    }
    case "session/workingDirectoryReplaced" /* SessionWorkingDirectoryReplaced */: {
      const list2 = state.workingDirectories;
      if (!list2) {
        return state;
      }
      const idx = list2.indexOf(action.directory);
      if (idx < 0) {
        return state;
      }
      const replacementIdx = list2.indexOf(action.replacement);
      if (replacementIdx >= 0 && replacementIdx < idx) {
        return {
          ...state,
          workingDirectories: list2.filter((_, index2) => index2 !== idx)
        };
      }
      return {
        ...state,
        workingDirectories: list2.map((directory, index2) => index2 === idx ? action.replacement : directory).filter((directory, index2) => index2 === idx || directory !== action.replacement)
      };
    }
    // ── Input Needed ────────────────────────────────────────────────────
    case "session/inputNeededSet" /* SessionInputNeededSet */: {
      const list2 = state.inputNeeded ?? [];
      const idx = list2.findIndex((r2) => r2.id === action.request.id);
      const inputNeeded = idx < 0 ? [...list2, action.request] : list2.slice();
      if (idx >= 0) {
        inputNeeded[idx] = action.request;
      }
      return { ...state, inputNeeded, status: withInputNeededStatus(state.status, inputNeeded) };
    }
    case "session/inputNeededRemoved" /* SessionInputNeededRemoved */: {
      const list2 = state.inputNeeded;
      if (!list2) {
        return state;
      }
      const idx = list2.findIndex((r2) => r2.id === action.id);
      if (idx < 0) {
        return state;
      }
      const remaining = list2.slice();
      remaining.splice(idx, 1);
      const next = { ...state, status: withInputNeededStatus(state.status, remaining) };
      if (remaining.length > 0) {
        next.inputNeeded = remaining;
      } else {
        delete next.inputNeeded;
      }
      return next;
    }
    // ── Customizations ──────────────────────────────────────────────────
    case "session/customizationsChanged" /* SessionCustomizationsChanged */:
      return { ...state, customizations: action.customizations };
    case "session/customizationToggled" /* SessionCustomizationToggled */: {
      const list2 = state.customizations;
      if (!list2) {
        return state;
      }
      const topIdx = list2.findIndex((c) => c.id === action.id);
      if (topIdx >= 0) {
        const updated = list2.slice();
        updated[topIdx] = applyCustomizationEnablement(list2[topIdx], action.enablement);
        return { ...state, customizations: updated };
      }
      for (let i2 = 0; i2 < list2.length; i2++) {
        const container3 = list2[i2];
        if (container3.type === "mcpServer" /* McpServer */) {
          continue;
        }
        const children = container3.children;
        if (!children) {
          continue;
        }
        const childIdx = children.findIndex((c) => c.id === action.id);
        if (childIdx < 0) {
          continue;
        }
        const newChildren = children.slice();
        newChildren[childIdx] = applyCustomizationEnablement(children[childIdx], action.enablement);
        const updated = list2.slice();
        updated[i2] = { ...container3, children: newChildren };
        return { ...state, customizations: updated };
      }
      return state;
    }
    case "session/customizationUpdated" /* SessionCustomizationUpdated */: {
      const list2 = state.customizations ?? [];
      const idx = list2.findIndex((c) => c.id === action.customization.id);
      if (idx < 0) {
        return { ...state, customizations: [...list2, action.customization] };
      }
      const updated = [...list2];
      updated[idx] = action.customization;
      return { ...state, customizations: updated };
    }
    case "session/customizationRemoved" /* SessionCustomizationRemoved */: {
      const list2 = state.customizations;
      if (!list2) {
        return state;
      }
      const topIdx = list2.findIndex((c) => c.id === action.id);
      if (topIdx >= 0) {
        const updated2 = list2.slice();
        updated2.splice(topIdx, 1);
        return { ...state, customizations: updated2 };
      }
      let changed = false;
      const updated = list2.map((container3) => {
        if (container3.type === "mcpServer" /* McpServer */) {
          return container3;
        }
        const children = container3.children;
        if (!children) {
          return container3;
        }
        const childIdx = children.findIndex((c) => c.id === action.id);
        if (childIdx < 0) {
          return container3;
        }
        changed = true;
        const newChildren = children.slice();
        newChildren.splice(childIdx, 1);
        return { ...container3, children: newChildren };
      });
      if (!changed) {
        return state;
      }
      return { ...state, customizations: updated };
    }
    case "session/mcpServerStateChanged" /* SessionMcpServerStateChanged */: {
      return updateMcpServerCustomization(state, action.id, (entry) => ({
        ...entry,
        state: action.state,
        channel: action.channel
      }));
    }
    case "session/mcpServerStartRequested" /* SessionMcpServerStartRequested */: {
      return updateMcpServerCustomization(state, action.id, (entry) => ({
        ...entry,
        state: { kind: "starting" /* Starting */ },
        channel: void 0
      }));
    }
    case "session/mcpServerStopRequested" /* SessionMcpServerStopRequested */: {
      return updateMcpServerCustomization(state, action.id, (entry) => ({
        ...entry,
        state: { kind: "stopped" /* Stopped */ },
        channel: void 0
      }));
    }
    default:
      softAssertNever2(action, log4);
      return state;
  }
}
export { withStatusFlag, awaitsUser, withInputNeededStatus, updateMcpServerCustomization, applyCustomizationEnablement, sessionReducer, STATUS_ACTIVITY_MASK2 };
