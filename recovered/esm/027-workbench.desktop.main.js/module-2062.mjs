// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatExecuteActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { AgentSessionProviders, getAgentSessionProvider } from "./module-0982.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ChatStopCancellationNoopEventName, IChatService } from "./module-0972.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { basename2 } from "./module-0034.mjs";
import { IChatSessionsService, localChatSessionType } from "./module-0960.mjs";
import { CreateRemoteAgentJobAction } from "./module-2061.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ACTION_ID_NEW_CHAT, CHAT_CATEGORY, clearChatSessionPreservingType, handleCurrentEditingSession, handleModeSwitch } from "./module-1476.mjs";
import { Codicon } from "./module-0085.mjs";
import { ctxHasEditorModification, ctxHasRequestInProgress, ctxIsGlobalEditingSession } from "./module-2057.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { getEditingSessionContext } from "./module-2056.mjs";
import { reportChatModeChange } from "./module-2054.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";
import { AgentHostAllowSignedOutWhenUsableSettingId } from "./module-1107.mjs";
import { assertType } from "./module-0010.mjs";
import { chatVariableLeader } from "./module-0987.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ILogService } from "./module-0095.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IChatModeService, buildCustomAgentHandoffsInfo, getHandoffId } from "./module-1470.mjs";
import { URI } from "./module-0032.mjs";
import { DisposableStore } from "./module-0012.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatExecuteActions.ts
var SubmitAction = class extends Action2 {
  async run(accessor, ...args2) {
    const context2 = args2[0];
    const telemetryService = accessor.get(ITelemetryService);
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context2?.widget ?? widgetService.lastFocusedWidget;
    const pendingDelegationTarget = widget?.input.pendingDelegationTarget;
    if (pendingDelegationTarget && pendingDelegationTarget !== AgentSessionProviders.Local) {
      return await this.handleDelegation(accessor, widget, pendingDelegationTarget);
    }
    if (widget?.viewModel?.editing) {
      const configurationService = accessor.get(IConfigurationService);
      const dialogService = accessor.get(IDialogService);
      const chatService = accessor.get(IChatService);
      const chatModel = chatService.getSession(widget.viewModel.sessionResource);
      if (!chatModel) {
        return;
      }
      const session = chatModel.editingSession;
      if (!session) {
        return;
      }
      const requestId = widget.viewModel?.editing.id;
      if (requestId) {
        const chatRequests = chatModel.getRequests();
        const itemIndex = chatRequests.findIndex((request2) => request2.id === requestId);
        const editsToUndo = chatRequests.length - itemIndex;
        const requestsToRemove = chatRequests.slice(itemIndex);
        const requestIdsToRemove = new Set(requestsToRemove.map((request2) => request2.id));
        const entriesModifiedInRequestsToRemove = session.entries.get().filter((entry) => requestIdsToRemove.has(entry.lastModifyingRequestId)) ?? [];
        const shouldPrompt = entriesModifiedInRequestsToRemove.length > 0 && configurationService.getValue("chat.editing.confirmEditRequestRemoval") === true;
        let message;
        if (editsToUndo === 1) {
          if (entriesModifiedInRequestsToRemove.length === 1) {
            message = localize(8649, null, basename2(entriesModifiedInRequestsToRemove[0].modifiedURI));
          } else {
            message = localize(8650, null, entriesModifiedInRequestsToRemove.length);
          }
        } else {
          if (entriesModifiedInRequestsToRemove.length === 1) {
            message = localize(8645, null, basename2(entriesModifiedInRequestsToRemove[0].modifiedURI));
          } else {
            message = localize(8646, null, entriesModifiedInRequestsToRemove.length);
          }
        }
        const confirmation = shouldPrompt ? await dialogService.confirm({
          title: editsToUndo === 1 ? localize(8651, null) : localize(8648, null, editsToUndo),
          message,
          primaryButton: localize(8647, null),
          checkbox: { label: localize(8644, null), checked: false },
          type: "info"
        }) : { confirmed: true };
        if (!confirmation.confirmed) {
          telemetryService.publicLog2("chat.undoEditsConfirmation", {
            editRequestType: configurationService.getValue("chat.editRequests"),
            outcome: "cancelled",
            editsUndoCount: editsToUndo
          });
          return;
        } else if (editsToUndo > 0) {
          telemetryService.publicLog2("chat.undoEditsConfirmation", {
            editRequestType: configurationService.getValue("chat.editRequests"),
            outcome: "applied",
            editsUndoCount: editsToUndo
          });
        }
        if (confirmation.checkboxChecked) {
          await configurationService.updateValue("chat.editing.confirmEditRequestRemoval", false);
        }
        const snapshotRequestId = chatRequests[itemIndex].id;
        await session.restoreSnapshot(snapshotRequestId, void 0);
      }
    } else if (widget?.viewModel?.model.checkpoint) {
      widget.viewModel.model.setCheckpoint(void 0);
    }
    widget?.acceptInput(context2?.inputValue, context2?.acceptInputOptions);
  }
  async handleDelegation(accessor, widget, delegationTarget) {
    const chatSessionsService = accessor.get(IChatSessionsService);
    const contributions = chatSessionsService.getAllChatSessionContributions();
    const targetContribution = contributions.find((contrib) => {
      const providerType = getAgentSessionProvider(contrib.type);
      return providerType === delegationTarget || contrib.type === delegationTarget;
    });
    if (!targetContribution) {
      throw new Error(`No contribution found for delegation target: ${delegationTarget}`);
    }
    if (targetContribution.canDelegate === false) {
      throw new Error(`The contribution for delegation target: ${delegationTarget} does not support delegation.`);
    }
    return new CreateRemoteAgentJobAction().run(accessor, targetContribution, widget);
  }
};

var whenNoActiveRequest = ChatContextKeys.hasActiveRequest.negate();

var whenNotInProgress = ChatContextKeys.requestInProgress.negate();

var ChatSubmitAction = class _ChatSubmitAction extends SubmitAction {
  static {
    this.ID = "workbench.action.chat.submit";
  }
  constructor() {
    const menuCondition = ChatContextKeys.chatModeKind.isEqualTo("ask" /* Ask */);
    const precondition2 = ContextKeyExpr.and(
      ContextKeyExpr.or(ChatContextKeys.inputHasSendableContent, ChatContextKeys.inputHasBranch),
      ContextKeyExpr.or(whenNotInProgress, ChatContextKeys.editingRequestType.isEqualTo(ChatContextKeys.EditingRequestType.Sent)),
      ChatContextKeys.chatSessionOptionsValid
    );
    super({
      id: _ChatSubmitAction.ID,
      title: localize2(8664, "Send"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.arrowUpCompact,
      precondition: precondition2,
      toggled: {
        condition: ChatContextKeys.lockedToCodingAgent,
        icon: Codicon.arrowUpCompact,
        tooltip: localize(8670, null)
      },
      keybinding: {
        when: ContextKeyExpr.and(
          ChatContextKeys.inChatInput,
          ChatContextKeys.withinEditSessionDiff.negate()
        ),
        primary: 3 /* Enter */,
        weight: 100 /* EditorContrib */
      },
      menu: [
        {
          id: MenuId.ChatExecute,
          order: 4,
          when: ContextKeyExpr.and(
            whenNoActiveRequest,
            menuCondition,
            ChatContextKeys.withinEditSessionDiff.negate()
          ),
          group: "navigation",
          alt: {
            id: "workbench.action.chat.sendToNewChat",
            title: localize2(8643, "Send to New Chat"),
            icon: Codicon.plus
          }
        },
        {
          id: MenuId.ChatEditorInlineExecute,
          group: "navigation",
          order: 4,
          when: ContextKeyExpr.and(
            ContextKeyExpr.or(ctxHasEditorModification.negate(), ChatContextKeys.inputHasText),
            whenNoActiveRequest,
            menuCondition
          )
        }
      ]
    });
  }
};

var ToggleAgentModeActionId = "workbench.action.chat.toggleAgentMode";

var ToggleChatModeAction = class _ToggleChatModeAction extends Action2 {
  static {
    this.ID = ToggleAgentModeActionId;
  }
  constructor() {
    super({
      id: _ToggleChatModeAction.ID,
      title: localize2(8668, "Switch to Next Agent"),
      f1: true,
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ChatContextKeys.requestInProgress.negate()
      )
    });
  }
  async run(accessor, ...args2) {
    const commandService = accessor.get(ICommandService);
    const instaService = accessor.get(IInstantiationService);
    const telemetryService = accessor.get(ITelemetryService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const arg = args2.at(0);
    let widget;
    if (arg?.sessionResource) {
      widget = chatWidgetService.getWidgetBySessionResource(arg.sessionResource);
    } else {
      widget = getEditingSessionContext(accessor, args2)?.chatWidget;
    }
    if (!widget) {
      return;
    }
    const chatSession = widget.viewModel?.model;
    const requestCount = chatSession?.getRequests().length ?? 0;
    const modes = widget.input.currentChatModesObs.get();
    const switchToMode = (arg && (modes.findModeById(arg.modeId) || modes.findModeByName(arg.modeId))) ?? this.getNextMode(widget, requestCount, modes);
    const currentMode = widget.input.currentModeObs.get();
    if (switchToMode.id === currentMode.id) {
      return;
    }
    const chatModeCheck = await instaService.invokeFunction(handleModeSwitch, widget.input.currentModeKind, switchToMode.kind, requestCount, widget.viewModel?.model);
    if (!chatModeCheck) {
      return;
    }
    reportChatModeChange(telemetryService, currentMode, switchToMode, requestCount);
    widget.input.setChatMode(switchToMode.id, true, true);
    if (chatModeCheck.needToClearSession) {
      await commandService.executeCommand(ACTION_ID_NEW_CHAT);
    }
  }
  getNextMode(chatWidget, requestCount, modes) {
    const flat = [
      ...modes.builtin.filter((mode) => {
        return mode.kind !== "edit" /* Edit */ || requestCount === 0;
      }),
      ...modes.custom ?? []
    ];
    const curModeIndex = flat.findIndex((mode) => mode.id === chatWidget.input.currentModeObs.get().id);
    const newMode = flat[(curModeIndex + 1) % flat.length];
    return newMode;
  }
};

var SwitchToNextModelAction = class _SwitchToNextModelAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.switchToNextModel";
  }
  constructor() {
    super({
      id: _SwitchToNextModelAction.ID,
      title: localize2(8666, "Switch to Next Model"),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  run(accessor, ...args2) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    widget?.input.switchToNextModel();
  }
};

var SwitchToNextPinnedModelAction = class _SwitchToNextPinnedModelAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.switchToNextPinnedModel";
  }
  constructor() {
    super({
      id: _SwitchToNextPinnedModelAction.ID,
      title: localize2(8667, "Switch to Next Pinned Model"),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  run(accessor, ...args2) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    widget?.input.switchToNextPinnedModel();
  }
};

var OpenModelPickerAction = class _OpenModelPickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openModelPicker";
  }
  constructor() {
    super({
      id: _OpenModelPickerAction.ID,
      title: localize2(8659, "Open Model Picker"),
      category: CHAT_CATEGORY,
      f1: false,
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 89 /* Period */,
        weight: 200 /* WorkbenchContrib */,
        when: ChatContextKeys.inChatInput
      },
      precondition: ChatContextKeys.enabled,
      menu: {
        id: MenuId.ChatInput,
        order: 3,
        group: "navigation",
        when: ContextKeyExpr.and(
          // Hide the model picker while a delegation (continue in) target is pending
          ChatContextKeys.hasPendingDelegationTarget.negate(),
          ContextKeyExpr.or(
            ChatContextKeys.lockedToCodingAgent.negate(),
            ChatContextKeys.chatSessionHasTargetedModels
          ),
          ContextKeyExpr.or(
            ContextKeyExpr.equals(ChatContextKeys.location.key, "panel" /* Chat */),
            ContextKeyExpr.equals(ChatContextKeys.location.key, "editor" /* EditorInline */),
            ContextKeyExpr.equals(ChatContextKeys.location.key, "notebook" /* Notebook */),
            ContextKeyExpr.equals(ChatContextKeys.location.key, "terminal" /* Terminal */)
          ),
          // Hide in welcome view when session type is not local
          ContextKeyExpr.or(
            ChatContextKeys.inAgentSessionsWelcome.negate(),
            ChatContextKeys.chatSessionHasTargetedModels,
            ChatContextKeys.agentSessionType.isEqualTo(AgentSessionProviders.Local),
            ContextKeyExpr.and(
              IsSessionsWindowContext,
              ChatContextKeys.agentSessionType.isEqualTo(AgentSessionProviders.AgentHostCopilot),
              ContextKeyExpr.equals(`config.${AgentHostAllowSignedOutWhenUsableSettingId}`, true)
            )
          )
        )
      }
    });
  }
  async run(accessor, ...args2) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      await widgetService.reveal(widget);
      widget.input.openModelPicker();
    }
  }
};

var OpenPermissionPickerAction = class _OpenPermissionPickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openPermissionPicker";
  }
  constructor() {
    super({
      id: _OpenPermissionPickerAction.ID,
      title: localize2(8661, "Open Permission Picker"),
      tooltip: localize(8672, null),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ChatContextKeys.enabled,
      menu: {
        id: MenuId.ChatInputSecondary,
        order: 1,
        group: "navigation",
        when: ContextKeyExpr.and(
          ChatContextKeys.enabled,
          ChatContextKeys.location.isEqualTo("panel" /* Chat */),
          ChatContextKeys.chatModeKind.notEqualsTo("ask" /* Ask */),
          ChatContextKeys.inQuickChat.negate(),
          ContextKeyExpr.or(
            ChatContextKeys.lockedToCodingAgent.negate(),
            ChatContextKeys.lockedCodingAgentId.isEqualTo(AgentSessionProviders.Background)
          )
        )
      }
    });
  }
  async run(accessor) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      widget.input.openPermissionPicker();
    }
  }
};

var OpenModePickerAction = class _OpenModePickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openModePicker";
  }
  constructor() {
    super({
      id: _OpenModePickerAction.ID,
      title: localize2(8660, "Open Agent Picker"),
      tooltip: localize(8671, null),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ChatContextKeys.enabled,
      keybinding: {
        when: ContextKeyExpr.and(
          ChatContextKeys.inChatInput,
          ChatContextKeys.location.isEqualTo("panel" /* Chat */)
        ),
        primary: 2048 /* CtrlCmd */ | 89 /* Period */,
        weight: 100 /* EditorContrib */
      },
      menu: [
        {
          id: MenuId.ChatInput,
          order: 1,
          when: ContextKeyExpr.and(
            ChatContextKeys.enabled,
            ChatContextKeys.location.isEqualTo("panel" /* Chat */),
            ChatContextKeys.inQuickChat.negate(),
            // Hide the agent picker while a delegation (continue in) target is pending
            ChatContextKeys.hasPendingDelegationTarget.negate(),
            ContextKeyExpr.or(
              ChatContextKeys.lockedToCodingAgent.negate(),
              ChatContextKeys.chatSessionHasCustomAgentTarget
            ),
            // Show in welcome view for local sessions or sessions with custom agent target
            ContextKeyExpr.or(
              ChatContextKeys.inAgentSessionsWelcome.negate(),
              ChatContextKeys.chatSessionHasCustomAgentTarget,
              ChatContextKeys.agentSessionType.isEqualTo(AgentSessionProviders.Local)
            )
          ),
          group: "navigation"
        }
      ]
    });
  }
  async run(accessor, ...args2) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      widget.input.openModePicker();
    }
  }
};

var OpenSessionTargetPickerAction = class _OpenSessionTargetPickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openSessionTargetPicker";
  }
  constructor() {
    super({
      id: _OpenSessionTargetPickerAction.ID,
      title: localize2(8662, "Open Session Target Picker"),
      tooltip: localize(8673, null),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(ChatContextKeys.chatSessionIsEmpty, ChatContextKeys.inAgentSessionsWelcome), ChatContextKeys.currentlyEditingInput.negate(), ChatContextKeys.currentlyEditing.negate()),
      menu: [
        {
          id: MenuId.ChatInput,
          order: 0,
          when: ContextKeyExpr.and(
            ChatContextKeys.enabled,
            ChatContextKeys.location.isEqualTo("panel" /* Chat */),
            ChatContextKeys.inQuickChat.negate(),
            ChatContextKeys.chatSessionIsEmpty,
            IsSessionsWindowContext
          ),
          group: "navigation"
        },
        {
          id: MenuId.ChatInputSecondary,
          order: 0,
          when: ContextKeyExpr.and(
            ChatContextKeys.enabled,
            ChatContextKeys.location.isEqualTo("panel" /* Chat */),
            ChatContextKeys.inQuickChat.negate(),
            IsSessionsWindowContext.negate(),
            ChatContextKeys.chatSessionIsEmpty
          ),
          group: "navigation"
        }
      ]
    });
  }
  async run(accessor, ...args2) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      widget.input.openSessionTargetPicker();
    }
  }
};

var OpenDelegationPickerAction = class _OpenDelegationPickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openDelegationPicker";
  }
  constructor() {
    super({
      id: _OpenDelegationPickerAction.ID,
      title: localize2(8658, "Open Delegation Picker"),
      tooltip: localize(8652, null),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.chatSessionIsEmpty.negate(), ChatContextKeys.currentlyEditingInput.negate(), ChatContextKeys.currentlyEditing.negate()),
      menu: [
        {
          id: MenuId.ChatInputSecondary,
          order: 0.5,
          when: ContextKeyExpr.and(
            ChatContextKeys.enabled,
            ChatContextKeys.location.isEqualTo("panel" /* Chat */),
            ChatContextKeys.inQuickChat.negate(),
            ChatContextKeys.chatSessionSupportsDelegation,
            ChatContextKeys.chatSessionIsEmpty.negate(),
            IsSessionsWindowContext.negate()
          ),
          group: "navigation"
        }
      ]
    });
  }
  async run(accessor, ...args2) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      widget.input.openDelegationPicker();
    }
  }
};

var OpenWorkspacePickerAction = class _OpenWorkspacePickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openWorkspacePicker";
  }
  constructor() {
    super({
      id: _OpenWorkspacePickerAction.ID,
      title: localize2(8663, "Open Workspace Picker"),
      tooltip: localize(8669, null),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.inAgentSessionsWelcome),
      menu: [
        {
          id: MenuId.ChatInputSecondary,
          order: 0.6,
          when: ContextKeyExpr.and(
            ChatContextKeys.inAgentSessionsWelcome,
            ChatContextKeys.chatSessionType.isEqualTo(localChatSessionType)
          ),
          group: "navigation"
        }
      ]
    });
  }
  async run(accessor, ...args2) {
  }
};

var ChatSessionPrimaryPickerAction = class _ChatSessionPrimaryPickerAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.chatSessionPrimaryPicker";
  }
  constructor() {
    super({
      id: _ChatSessionPrimaryPickerAction.ID,
      title: localize2(8657, "Open Primary Session Picker"),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ChatContextKeys.enabled,
      menu: [
        {
          // Cloud sessions: keep on the primary chat input toolbar
          id: MenuId.ChatInput,
          order: 4,
          group: "navigation",
          when: ContextKeyExpr.and(
            ChatContextKeys.chatSessionHasModels,
            ChatContextKeys.chatSessionType.isEqualTo(AgentSessionProviders.Cloud),
            ContextKeyExpr.or(
              ChatContextKeys.lockedToCodingAgent,
              ContextKeyExpr.and(
                ChatContextKeys.inAgentSessionsWelcome,
                ChatContextKeys.chatSessionType.notEqualsTo("local")
              )
            )
          )
        },
        {
          // All other coding agents (Claude, etc.): show in the secondary toolbar.
          // In the Agents window only, hide the worktree/branch pickers for Copilot
          // CLI sessions because their option groups are surfaced through the CLI
          // session UI there. They remain visible in the regular VS Code workbench.
          id: MenuId.ChatInputSecondary,
          order: 4,
          group: "navigation",
          when: ContextKeyExpr.and(
            ChatContextKeys.chatSessionHasModels,
            ChatContextKeys.chatSessionType.notEqualsTo(AgentSessionProviders.Cloud),
            ContextKeyExpr.or(
              IsSessionsWindowContext.negate(),
              ChatContextKeys.chatSessionType.notEqualsTo(AgentSessionProviders.Background)
            ),
            ContextKeyExpr.or(
              ChatContextKeys.lockedToCodingAgent,
              ContextKeyExpr.and(
                ChatContextKeys.inAgentSessionsWelcome,
                ChatContextKeys.chatSessionType.notEqualsTo("local")
              )
            )
          )
        }
      ]
    });
  }
  async run(accessor, ...args2) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      widget.input.openChatSessionPicker();
    }
  }
};

var ChangeChatModelActionId = "workbench.action.chat.changeModel";

var ChangeChatModelAction = class _ChangeChatModelAction extends Action2 {
  static {
    this.ID = ChangeChatModelActionId;
  }
  constructor() {
    super({
      id: _ChangeChatModelAction.ID,
      title: localize2(8656, "Change Model"),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ChatContextKeys.enabled
    });
  }
  run(accessor, ...args2) {
    const modelInfo = args2[0];
    assertType(typeof modelInfo.vendor === "string" && typeof modelInfo.id === "string" && typeof modelInfo.family === "string");
    const widgetService = accessor.get(IChatWidgetService);
    const widgets2 = widgetService.getAllWidgets();
    for (const widget of widgets2) {
      widget.input.switchModel(modelInfo);
    }
  }
};

var ChatEditingSessionSubmitAction = class _ChatEditingSessionSubmitAction extends SubmitAction {
  static {
    this.ID = "workbench.action.edits.submit";
  }
  constructor() {
    const notInProgressOrEditing = ContextKeyExpr.and(
      ContextKeyExpr.or(whenNoActiveRequest, ChatContextKeys.editingRequestType.isEqualTo(ChatContextKeys.EditingRequestType.Sent)),
      ChatContextKeys.editingRequestType.notEqualsTo(ChatContextKeys.EditingRequestType.Queue),
      ChatContextKeys.editingRequestType.notEqualsTo(ChatContextKeys.EditingRequestType.Steer)
    );
    const menuCondition = ChatContextKeys.chatModeKind.notEqualsTo("ask" /* Ask */);
    const precondition2 = ContextKeyExpr.and(
      ContextKeyExpr.or(ChatContextKeys.inputHasSendableContent, ChatContextKeys.inputHasBranch),
      notInProgressOrEditing,
      ChatContextKeys.chatSessionOptionsValid
    );
    super({
      id: _ChatEditingSessionSubmitAction.ID,
      title: localize2(8653, "Send"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.arrowUpCompact,
      precondition: precondition2,
      toggled: {
        condition: ChatContextKeys.inputHasBranch,
        icon: Codicon.arrowUpCompact,
        tooltip: localize(8674, null)
      },
      menu: [
        {
          id: MenuId.ChatExecute,
          order: 4,
          when: ContextKeyExpr.and(
            notInProgressOrEditing,
            menuCondition
          ),
          group: "navigation",
          alt: {
            id: "workbench.action.chat.sendToNewChat",
            title: localize2(8643, "Send to New Chat"),
            icon: Codicon.plus
          }
        }
      ]
    });
  }
};

var SubmitWithoutDispatchingAction = class _SubmitWithoutDispatchingAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.submitWithoutDispatching";
  }
  constructor() {
    const precondition2 = ContextKeyExpr.and(
      ChatContextKeys.inputHasText,
      whenNotInProgress,
      ChatContextKeys.chatModeKind.isEqualTo("ask" /* Ask */)
    );
    super({
      id: _SubmitWithoutDispatchingAction.ID,
      title: localize2(8665, "Send"),
      f1: false,
      category: CHAT_CATEGORY,
      precondition: precondition2,
      keybinding: {
        when: ChatContextKeys.inChatInput,
        primary: 512 /* Alt */ | 1024 /* Shift */ | 3 /* Enter */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, ...args2) {
    const context2 = args2[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context2?.widget ?? widgetService.lastFocusedWidget;
    widget?.acceptInput(context2?.inputValue, { noCommandDetection: true });
  }
};

var ChatSubmitWithCodebaseAction = class _ChatSubmitWithCodebaseAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.submitWithCodebase";
  }
  constructor() {
    const precondition2 = ContextKeyExpr.and(
      ChatContextKeys.inputHasText,
      whenNotInProgress
    );
    super({
      id: _ChatSubmitWithCodebaseAction.ID,
      title: localize2(8640, "Send with {0}", `${chatVariableLeader}codebase`),
      precondition: precondition2,
      keybinding: {
        when: ChatContextKeys.inChatInput,
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, ...args2) {
    const context2 = args2[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context2?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const languageModelToolsService = accessor.get(ILanguageModelToolsService);
    const codebaseTool = languageModelToolsService.getToolByName("codebase");
    if (!codebaseTool) {
      return;
    }
    widget.input.attachmentModel.addContext({
      id: codebaseTool.id,
      name: codebaseTool.displayName ?? "",
      fullName: codebaseTool.displayName ?? "",
      value: void 0,
      icon: ThemeIcon.isThemeIcon(codebaseTool.icon) ? codebaseTool.icon : void 0,
      kind: "tool"
    });
    widget.acceptInput();
  }
};

var SendToNewChatAction = class extends Action2 {
  constructor() {
    const precondition2 = ChatContextKeys.inputHasText;
    super({
      id: "workbench.action.chat.sendToNewChat",
      title: localize2(8643, "Send to New Chat"),
      precondition: precondition2,
      category: CHAT_CATEGORY,
      f1: false,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */,
        when: ChatContextKeys.inChatInput
      }
    });
  }
  async run(accessor, ...args2) {
    const context2 = args2[0];
    const widgetService = accessor.get(IChatWidgetService);
    const dialogService = accessor.get(IDialogService);
    const chatService = accessor.get(IChatService);
    const instantiationService = accessor.get(IInstantiationService);
    const widget = context2?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const inputBeforeClear = widget.getInput();
    if (widget.viewModel) {
      await chatService.cancelCurrentRequestForSession(widget.viewModel.sessionResource, "newSessionAction");
    }
    if (widget.viewModel?.model) {
      if (!await handleCurrentEditingSession(widget.viewModel.model, void 0, dialogService)) {
        return;
      }
    }
    widget.setInput("");
    await instantiationService.invokeFunction(clearChatSessionPreservingType, widget, void 0);
    widget.acceptInput(inputBeforeClear, { storeToHistory: true });
  }
};

var CancelChatActionId = "workbench.action.chat.cancel";

var CancelAction = class _CancelAction extends Action2 {
  static {
    this.ID = CancelChatActionId;
  }
  constructor() {
    super({
      id: _CancelAction.ID,
      title: localize2(8654, "Cancel"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.stopCircle,
      menu: [
        {
          id: MenuId.ChatExecute,
          when: ContextKeyExpr.and(
            ChatContextKeys.hasActiveRequest,
            ChatContextKeys.remoteJobCreating.negate(),
            ChatContextKeys.currentlyEditing.negate()
          ),
          order: 4,
          group: "navigation"
        },
        {
          id: MenuId.ChatEditorInlineExecute,
          when: ContextKeyExpr.and(
            ctxIsGlobalEditingSession.negate(),
            ctxHasRequestInProgress
          ),
          order: 4,
          group: "navigation"
        }
      ],
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 9 /* Escape */,
        when: ContextKeyExpr.and(
          ChatContextKeys.hasActiveRequest,
          ChatContextKeys.remoteJobCreating.negate()
        ),
        win: { primary: 512 /* Alt */ | 1 /* Backspace */ }
      }
    });
  }
  async run(accessor, ...args2) {
    const context2 = args2[0];
    const widgetService = accessor.get(IChatWidgetService);
    const logService = accessor.get(ILogService);
    const telemetryService = accessor.get(ITelemetryService);
    const widget = context2?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      telemetryService.publicLog2(ChatStopCancellationNoopEventName, {
        source: "cancelAction",
        reason: "noWidget",
        requestInProgress: "unknown",
        pendingRequests: 0
      });
      logService.info("ChatCancelAction#run: No focused chat widget was found");
      return;
    }
    const chatService = accessor.get(IChatService);
    if (widget.viewModel) {
      await chatService.cancelCurrentRequestForSession(widget.viewModel.sessionResource, "cancelAction");
    } else {
      telemetryService.publicLog2(ChatStopCancellationNoopEventName, {
        source: "cancelAction",
        reason: "noViewModel",
        requestInProgress: "unknown",
        pendingRequests: 0
      });
      logService.info("ChatCancelAction#run: Canceled chat widget has no view model");
    }
  }
};

var CancelChatEditId = "workbench.edit.chat.cancel";

var CancelEdit = class _CancelEdit extends Action2 {
  static {
    this.ID = CancelChatEditId;
  }
  constructor() {
    super({
      id: _CancelEdit.ID,
      title: localize2(8655, "Cancel Edit"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.x,
      menu: [
        {
          id: MenuId.ChatMessageTitle,
          group: "navigation",
          order: 1,
          when: ContextKeyExpr.and(ChatContextKeys.isRequest, ChatContextKeys.currentlyEditing, ContextKeyExpr.equals(`config.${"chat.editRequests" /* EditRequests */}`, "input"))
        }
      ],
      keybinding: {
        primary: 9 /* Escape */,
        when: ContextKeyExpr.and(
          ChatContextKeys.inChatInput,
          EditorContextKeys.hoverVisible.toNegated(),
          EditorContextKeys.hasNonEmptySelection.toNegated(),
          EditorContextKeys.hasMultipleSelections.toNegated(),
          ContextKeyExpr.or(ChatContextKeys.currentlyEditing, ChatContextKeys.currentlyEditingInput)
        ),
        weight: 100 /* EditorContrib */ - 5
      }
    });
  }
  run(accessor, ...args2) {
    const context2 = args2[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context2?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    return widget.cancelEditing();
  }
};

var GetHandoffsActionId = "workbench.action.chat.getHandoffs";

var GetHandoffsAction = class _GetHandoffsAction extends Action2 {
  static {
    this.ID = GetHandoffsActionId;
  }
  constructor() {
    super({
      id: _GetHandoffsAction.ID,
      title: localize2(8642, "Get Handoffs"),
      f1: false,
      category: CHAT_CATEGORY
    });
  }
  async run(accessor, ...args2) {
    const modeService = accessor.get(IChatModeService);
    const arg = args2.at(0);
    const { builtin, custom } = await modeService.getLocalModes();
    let allModes = [...builtin, ...custom];
    if (arg?.sourceCustomAgent) {
      const filterName = arg.sourceCustomAgent;
      allModes = allModes.filter((m) => m.name.get().toLowerCase() === filterName.toLowerCase());
    }
    return buildCustomAgentHandoffsInfo(allModes);
  }
};

var ExecuteHandoffActionId = "workbench.action.chat.executeHandoff";

var ExecuteHandoffAction = class _ExecuteHandoffAction extends Action2 {
  static {
    this.ID = ExecuteHandoffActionId;
  }
  constructor() {
    super({
      id: _ExecuteHandoffAction.ID,
      title: localize2(8641, "Execute Handoff"),
      f1: false,
      category: CHAT_CATEGORY
    });
  }
  async run(accessor, ...args2) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const arg = args2.at(0);
    if (!arg?.id && !arg?.label) {
      return { success: false, error: "Either id or label is required" };
    }
    let widget;
    if (arg.sessionResource) {
      let sessionResource;
      try {
        sessionResource = URI.parse(arg.sessionResource);
      } catch {
        return { success: false, error: `Invalid sessionResource URI: '${arg.sessionResource}'` };
      }
      widget = chatWidgetService.getWidgetBySessionResource(sessionResource);
    } else {
      widget = chatWidgetService.lastFocusedWidget;
    }
    if (!widget) {
      return { success: false, error: "No chat widget found. Provide sessionResource or focus a chat widget." };
    }
    let sourceMode;
    if (arg.sourceCustomAgent) {
      const filterName = arg.sourceCustomAgent.toLowerCase();
      const { builtin, custom } = widget.input.currentChatModesObs.get();
      sourceMode = [...builtin, ...custom].find((m) => m.name.get().toLowerCase() === filterName || m.id.toLowerCase() === filterName);
    }
    if (!sourceMode) {
      sourceMode = widget.input.currentModeObs.get();
    }
    const handoffs = sourceMode?.handOffs?.get();
    if (!handoffs || handoffs.length === 0) {
      return { success: false, error: `No handoffs available for mode '${sourceMode?.name.get()}'` };
    }
    let matchedHandoff = arg.id ? handoffs.find((h3) => getHandoffId(h3) === arg.id) : void 0;
    if (!matchedHandoff && arg.label) {
      const labelLower = arg.label.trim().toLowerCase();
      matchedHandoff = handoffs.find((h3) => h3.label.trim().toLowerCase() === labelLower);
    }
    if (!matchedHandoff) {
      const identifier2 = arg.id ?? arg.label;
      return { success: false, error: `No handoff with identifier '${identifier2}' found for mode '${sourceMode?.name.get()}'` };
    }
    await widget.executeHandoff(matchedHandoff);
    return { success: true, targetMode: matchedHandoff.agent };
  }
};

function registerChatExecuteActions() {
  const store = new DisposableStore();
  store.add(registerAction2(ChatSubmitAction));
  store.add(registerAction2(ChatEditingSessionSubmitAction));
  store.add(registerAction2(SubmitWithoutDispatchingAction));
  store.add(registerAction2(CancelAction));
  store.add(registerAction2(SendToNewChatAction));
  store.add(registerAction2(ChatSubmitWithCodebaseAction));
  store.add(registerAction2(ToggleChatModeAction));
  store.add(registerAction2(SwitchToNextModelAction));
  store.add(registerAction2(SwitchToNextPinnedModelAction));
  store.add(registerAction2(OpenModelPickerAction));
  store.add(registerAction2(OpenPermissionPickerAction));
  store.add(registerAction2(OpenModePickerAction));
  store.add(registerAction2(OpenSessionTargetPickerAction));
  store.add(registerAction2(OpenDelegationPickerAction));
  store.add(registerAction2(OpenWorkspacePickerAction));
  store.add(registerAction2(ChatSessionPrimaryPickerAction));
  store.add(registerAction2(ChangeChatModelAction));
  store.add(registerAction2(CancelEdit));
  store.add(registerAction2(GetHandoffsAction));
  store.add(registerAction2(ExecuteHandoffAction));
  return store;
}
export { registerChatExecuteActions, SubmitAction, whenNoActiveRequest, whenNotInProgress, ChatSubmitAction, ToggleAgentModeActionId, ToggleChatModeAction, SwitchToNextModelAction, SwitchToNextPinnedModelAction, OpenModelPickerAction, OpenPermissionPickerAction, OpenModePickerAction, OpenSessionTargetPickerAction, OpenDelegationPickerAction, OpenWorkspacePickerAction, ChatSessionPrimaryPickerAction, ChangeChatModelActionId, ChangeChatModelAction, ChatEditingSessionSubmitAction, SubmitWithoutDispatchingAction, ChatSubmitWithCodebaseAction, SendToNewChatAction, CancelChatActionId, CancelAction, CancelChatEditId, CancelEdit, GetHandoffsActionId, GetHandoffsAction, ExecuteHandoffActionId, ExecuteHandoffAction };
