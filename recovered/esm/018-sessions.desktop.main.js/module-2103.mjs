// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostChatInputPicker.contribution.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeyExprs, ChatContextKeys } from "./module-0966.mjs";
import { IsSessionsWindowContext, WorkspaceFolderCountContext } from "./module-0950.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostChatInputPicker.contribution.ts
var OpenAgentHostFolderPickerAction = class _OpenAgentHostFolderPickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openAgentHostFolderPicker";
  }
  constructor() {
    super({
      id: _OpenAgentHostFolderPickerAction.ID,
      title: localize2(8955, "Folder"),
      f1: false,
      // The working directory is an argument to session creation and is
      // fixed once the session has started (its first request), so the
      // chip stays visible afterwards but is disabled.
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.chatSessionIsEmpty),
      menu: [{
        id: MenuId.ChatInputSecondary,
        group: "navigation",
        order: 1.1,
        // Only relevant when there is more than one root folder to choose
        // from and we are in a regular editor window (the agent sessions
        // window has its own workspace picker). Ordered last in the chip
        // row to match the extension-host Copilot CLI layout.
        when: ContextKeyExpr.and(
          ChatContextKeyExprs.isAgentHostSession,
          WorkspaceFolderCountContext.greater(1),
          IsSessionsWindowContext.negate(),
          // Equal-peer providers add every workspace folder automatically, so they do not need a primary picker.
          ChatContextKeys.chatAgentHostHasImmutablePrimaryWorkingDirectory,
          // Hidden by default; the harness decision reveals the picker (e.g. when several folders carry hooks),
          // so the chip never flashes visible-then-hidden while the decision is resolving.
          ChatContextKeys.chatAgentHostFolderPickerVisible
        )
      }]
    });
  }
  async run() {
  }
};

var OpenAgentHostModePickerAction = class _OpenAgentHostModePickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openAgentHostModePicker";
  }
  constructor() {
    super({
      id: _OpenAgentHostModePickerAction.ID,
      title: localize2(8956, "Agent Mode"),
      f1: false,
      precondition: ChatContextKeys.enabled,
      menu: [{
        id: MenuId.ChatInputSecondary,
        group: "navigation",
        order: 0.7,
        when: ChatContextKeyExprs.isAgentHostSession
      }]
    });
  }
  async run() {
  }
};

var OpenAgentHostAutoApprovePickerAction = class _OpenAgentHostAutoApprovePickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openAgentHostAutoApprovePicker";
  }
  constructor() {
    super({
      id: _OpenAgentHostAutoApprovePickerAction.ID,
      title: localize2(8953, "Auto-Approve"),
      f1: false,
      precondition: ChatContextKeys.enabled,
      menu: [{
        id: MenuId.ChatInputSecondary,
        group: "navigation",
        order: 0.8,
        when: ChatContextKeyExprs.isAgentHostSession
      }]
    });
  }
  async run() {
  }
};

var OpenAgentHostPermissionModePickerAction = class _OpenAgentHostPermissionModePickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openAgentHostPermissionModePicker";
  }
  constructor() {
    super({
      id: _OpenAgentHostPermissionModePickerAction.ID,
      title: localize2(8957, "Approvals"),
      f1: false,
      precondition: ChatContextKeys.enabled,
      menu: [{
        id: MenuId.ChatInputSecondary,
        group: "navigation",
        order: 0.9,
        when: ChatContextKeyExprs.isAgentHostSession
      }]
    });
  }
  async run() {
  }
};

var OpenAgentHostCodexApprovalsPickerAction = class _OpenAgentHostCodexApprovalsPickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openAgentHostCodexApprovalsPicker";
  }
  constructor() {
    super({
      id: _OpenAgentHostCodexApprovalsPickerAction.ID,
      title: localize2(8954, "Approvals"),
      f1: false,
      precondition: ChatContextKeys.enabled,
      menu: [{
        id: MenuId.ChatInputSecondary,
        group: "navigation",
        order: 0.9,
        when: ChatContextKeyExprs.isAgentHostSession
      }]
    });
  }
  async run() {
  }
};

function getAgentHostPickerProperty(actionId) {
  switch (actionId) {
    case OpenAgentHostModePickerAction.ID:
      return "mode" /* Mode */;
    case OpenAgentHostAutoApprovePickerAction.ID:
      return "autoApprove" /* AutoApprove */;
    case OpenAgentHostPermissionModePickerAction.ID:
      return "permissionMode" /* PermissionMode */;
    case OpenAgentHostCodexApprovalsPickerAction.ID:
      return "codex.permissionsPreset" /* PermissionsPreset */;
    default:
      return void 0;
  }
}

registerAction2(OpenAgentHostModePickerAction);

registerAction2(OpenAgentHostAutoApprovePickerAction);

registerAction2(OpenAgentHostPermissionModePickerAction);

registerAction2(OpenAgentHostCodexApprovalsPickerAction);

registerAction2(OpenAgentHostFolderPickerAction);
export { getAgentHostPickerProperty, OpenAgentHostFolderPickerAction, OpenAgentHostModePickerAction, OpenAgentHostAutoApprovePickerAction, OpenAgentHostPermissionModePickerAction, OpenAgentHostCodexApprovalsPickerAction };
