// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/channels-session/reducer.ts
import { softAssertNever2 } from "./module-0088.mjs";


// src/vs/platform/agentHost/common/state/protocol/channels-session/reducer.ts
var STATUS_ACTIVITY_MASK2 = (1 << 5) - 1;

function withStatusFlag(status, flag, set) {
  return set ? status | flag : status & ~flag;
}

function awaitsUser(request) {
  return request.kind !== "toolClientExecution" /* ToolClientExecution */;
}

function withInputNeededStatus(status, inputNeeded) {
  if (inputNeeded.some(awaitsUser)) {
    return status & ~STATUS_ACTIVITY_MASK2 | 24 /* InputNeeded */;
  }
  return status & ~(24 /* InputNeeded */ & ~8 /* InProgress */);
}

function updateMcpServerCustomization(state, id2, update) {
  const list = state.customizations;
  if (!list) {
    return state;
  }
  const topIdx = list.findIndex((c) => c.id === id2);
  if (topIdx >= 0) {
    const entry = list[topIdx];
    if (entry.type !== "mcpServer" /* McpServer */) {
      return state;
    }
    const updated2 = list.slice();
    updated2[topIdx] = update(entry);
    return { ...state, customizations: updated2 };
  }
  let changed = false;
  const updated = list.map((container) => {
    if (container.type === "mcpServer" /* McpServer */) {
      return container;
    }
    const children = container.children;
    if (!children) {
      return container;
    }
    const childIdx = children.findIndex((c) => c.id === id2);
    if (childIdx < 0) {
      return container;
    }
    const child = children[childIdx];
    if (child.type !== "mcpServer" /* McpServer */) {
      return container;
    }
    changed = true;
    const newChildren = children.slice();
    newChildren[childIdx] = update(child);
    return { ...container, children: newChildren };
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
      const list = state.chats;
      const idx = list.findIndex((c) => c.resource === action.summary.resource);
      if (idx < 0) {
        return { ...state, chats: [...list, action.summary] };
      }
      const updated = list.slice();
      updated[idx] = action.summary;
      return { ...state, chats: updated };
    }
    case "session/chatRemoved" /* SessionChatRemoved */: {
      const list = state.chats;
      const idx = list.findIndex((c) => c.resource === action.chat);
      if (idx < 0) {
        return state;
      }
      const updated = list.slice();
      updated.splice(idx, 1);
      const next = { ...state, chats: updated };
      if (state.defaultChat === action.chat) {
        delete next.defaultChat;
      }
      return next;
    }
    case "session/chatUpdated" /* SessionChatUpdated */: {
      const list = state.chats;
      const idx = list.findIndex((c) => c.resource === action.chat);
      if (idx < 0) {
        return state;
      }
      const { resource: _ignored, ...changes } = action.changes;
      const updated = list.slice();
      updated[idx] = { ...list[idx], ...changes };
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
      const list = state.activeClients;
      const idx = list.findIndex((c) => c.clientId === action.activeClient.clientId);
      if (idx < 0) {
        return { ...state, activeClients: [...list, action.activeClient] };
      }
      const updated = list.slice();
      updated[idx] = action.activeClient;
      return { ...state, activeClients: updated };
    }
    case "session/activeClientRemoved" /* SessionActiveClientRemoved */: {
      const list = state.activeClients;
      const idx = list.findIndex((c) => c.clientId === action.clientId);
      if (idx < 0) {
        return state;
      }
      const updated = list.slice();
      updated.splice(idx, 1);
      return { ...state, activeClients: updated };
    }
    // ── Working Directories ─────────────────────────────────────────────
    case "session/workingDirectorySet" /* SessionWorkingDirectorySet */: {
      const list = state.workingDirectories ?? [];
      if (list.includes(action.directory)) {
        return state;
      }
      return { ...state, workingDirectories: [...list, action.directory] };
    }
    case "session/workingDirectoryRemoved" /* SessionWorkingDirectoryRemoved */: {
      const list = state.workingDirectories;
      if (!list) {
        return state;
      }
      const idx = list.indexOf(action.directory);
      if (idx < 0) {
        return state;
      }
      const updated = list.slice();
      updated.splice(idx, 1);
      return { ...state, workingDirectories: updated };
    }
    case "session/workingDirectoryReplaced" /* SessionWorkingDirectoryReplaced */: {
      const list = state.workingDirectories;
      if (!list) {
        return state;
      }
      const idx = list.indexOf(action.directory);
      if (idx < 0) {
        return state;
      }
      const replacementIdx = list.indexOf(action.replacement);
      if (replacementIdx >= 0 && replacementIdx < idx) {
        return {
          ...state,
          workingDirectories: list.filter((_, index) => index !== idx)
        };
      }
      return {
        ...state,
        workingDirectories: list.map((directory, index) => index === idx ? action.replacement : directory).filter((directory, index) => index === idx || directory !== action.replacement)
      };
    }
    // ── Input Needed ────────────────────────────────────────────────────
    case "session/inputNeededSet" /* SessionInputNeededSet */: {
      const list = state.inputNeeded ?? [];
      const idx = list.findIndex((r) => r.id === action.request.id);
      const inputNeeded = idx < 0 ? [...list, action.request] : list.slice();
      if (idx >= 0) {
        inputNeeded[idx] = action.request;
      }
      return { ...state, inputNeeded, status: withInputNeededStatus(state.status, inputNeeded) };
    }
    case "session/inputNeededRemoved" /* SessionInputNeededRemoved */: {
      const list = state.inputNeeded;
      if (!list) {
        return state;
      }
      const idx = list.findIndex((r) => r.id === action.id);
      if (idx < 0) {
        return state;
      }
      const remaining = list.slice();
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
      const list = state.customizations;
      if (!list) {
        return state;
      }
      const topIdx = list.findIndex((c) => c.id === action.id);
      if (topIdx >= 0) {
        const updated = list.slice();
        updated[topIdx] = applyCustomizationEnablement(list[topIdx], action.enablement);
        return { ...state, customizations: updated };
      }
      for (let i = 0; i < list.length; i++) {
        const container = list[i];
        if (container.type === "mcpServer" /* McpServer */) {
          continue;
        }
        const children = container.children;
        if (!children) {
          continue;
        }
        const childIdx = children.findIndex((c) => c.id === action.id);
        if (childIdx < 0) {
          continue;
        }
        const newChildren = children.slice();
        newChildren[childIdx] = applyCustomizationEnablement(children[childIdx], action.enablement);
        const updated = list.slice();
        updated[i] = { ...container, children: newChildren };
        return { ...state, customizations: updated };
      }
      return state;
    }
    case "session/customizationUpdated" /* SessionCustomizationUpdated */: {
      const list = state.customizations ?? [];
      const idx = list.findIndex((c) => c.id === action.customization.id);
      if (idx < 0) {
        return { ...state, customizations: [...list, action.customization] };
      }
      const updated = [...list];
      updated[idx] = action.customization;
      return { ...state, customizations: updated };
    }
    case "session/customizationRemoved" /* SessionCustomizationRemoved */: {
      const list = state.customizations;
      if (!list) {
        return state;
      }
      const topIdx = list.findIndex((c) => c.id === action.id);
      if (topIdx >= 0) {
        const updated2 = list.slice();
        updated2.splice(topIdx, 1);
        return { ...state, customizations: updated2 };
      }
      let changed = false;
      const updated = list.map((container) => {
        if (container.type === "mcpServer" /* McpServer */) {
          return container;
        }
        const children = container.children;
        if (!children) {
          return container;
        }
        const childIdx = children.findIndex((c) => c.id === action.id);
        if (childIdx < 0) {
          return container;
        }
        changed = true;
        const newChildren = children.slice();
        newChildren.splice(childIdx, 1);
        return { ...container, children: newChildren };
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
