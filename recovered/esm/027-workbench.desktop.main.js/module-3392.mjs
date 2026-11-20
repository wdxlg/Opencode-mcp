// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatActions.ts
import { registerActiveXtermAction } from "./module-3272.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { MENU_TERMINAL_CHAT_WIDGET_STATUS, TerminalChatContextKeys } from "./module-1153.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ITerminalChatService, ITerminalEditorService, ITerminalGroupService, ITerminalService, isDetachedTerminalInstance } from "./module-1149.mjs";
import { TerminalChatController } from "./module-3390.mjs";
import { isString } from "./module-0010.mjs";
import { AbstractInlineChatAction } from "./module-2948.mjs";
import { Codicon } from "./module-0085.mjs";
import { IChatService } from "./module-0972.mjs";
import { ChatViewId, IChatWidgetService } from "./module-0981.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { getIconId } from "./module-1175.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IPreferencesService } from "./module-1294.mjs";


// src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatActions.ts
registerActiveXtermAction({
  id: "workbench.action.terminal.chat.start" /* Start */,
  title: localize2(20444, "Open Inline Chat"),
  category: localize2(20445, "Terminal"),
  keybinding: {
    primary: 2048 /* CtrlCmd */ | 39 /* KeyI */,
    when: ContextKeyExpr.and(TerminalContextKeys.focusInAny),
    // HACK: Force weight to be higher than the extension contributed keybinding to override it until it gets replaced
    weight: 400 /* ExternalExtension */ + 1
    // KeybindingWeight.WorkbenchContrib,
  },
  f1: true,
  precondition: ContextKeyExpr.and(
    ChatContextKeys.enabled,
    ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    TerminalChatContextKeys.hasChatAgent
  ),
  menu: {
    id: MenuId.TerminalInstanceContext,
    group: "0_chat" /* Chat */,
    order: 2,
    when: ChatContextKeys.enabled
  },
  run: (_xterm, _accessor, activeInstance, opts) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    if (!contr) {
      return;
    }
    if (opts) {
      let isValidOptionsObject = function(obj) {
        return typeof obj === "object" && obj !== null && "query" in obj && isString(obj.query);
      };
      opts = isString(opts) ? { query: opts } : opts;
      if (isValidOptionsObject(opts)) {
        contr.updateInput(opts.query, false);
        if (!opts.isPartialQuery) {
          contr.terminalChatWidget?.acceptInput();
        }
      }
    }
    contr.terminalChatWidget?.reveal();
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.chat.close" /* Close */,
  title: localize2(20433, "Close"),
  category: AbstractInlineChatAction.category,
  keybinding: {
    primary: 9 /* Escape */,
    when: ContextKeyExpr.and(
      ContextKeyExpr.or(TerminalContextKeys.focus, TerminalChatContextKeys.focused),
      TerminalChatContextKeys.visible
    ),
    weight: 200 /* WorkbenchContrib */
  },
  menu: [{
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 2
  }],
  icon: Codicon.close,
  f1: true,
  precondition: ContextKeyExpr.and(
    ChatContextKeys.enabled,
    TerminalChatContextKeys.visible
  ),
  run: (_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.terminalChatWidget?.clear();
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.chat.runCommand" /* RunCommand */,
  title: localize2(20439, "Run Chat Command"),
  shortTitle: localize2(20438, "Run"),
  category: AbstractInlineChatAction.category,
  precondition: ContextKeyExpr.and(
    ChatContextKeys.enabled,
    ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    TerminalChatContextKeys.requestActive.negate(),
    TerminalChatContextKeys.responseContainsCodeBlock,
    TerminalChatContextKeys.responseContainsMultipleCodeBlocks.negate()
  ),
  icon: Codicon.play,
  keybinding: {
    when: TerminalChatContextKeys.requestActive.negate(),
    weight: 200 /* WorkbenchContrib */,
    primary: 2048 /* CtrlCmd */ | 3 /* Enter */
  },
  menu: {
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 0,
    when: ContextKeyExpr.and(TerminalChatContextKeys.responseContainsCodeBlock, TerminalChatContextKeys.responseContainsMultipleCodeBlocks.negate(), TerminalChatContextKeys.requestActive.negate())
  },
  run: (_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.terminalChatWidget?.acceptCommand(true);
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.chat.runFirstCommand" /* RunFirstCommand */,
  title: localize2(20441, "Run First Chat Command"),
  shortTitle: localize2(20440, "Run First"),
  category: AbstractInlineChatAction.category,
  precondition: ContextKeyExpr.and(
    ChatContextKeys.enabled,
    ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    TerminalChatContextKeys.requestActive.negate(),
    TerminalChatContextKeys.responseContainsMultipleCodeBlocks
  ),
  icon: Codicon.play,
  keybinding: {
    when: TerminalChatContextKeys.requestActive.negate(),
    weight: 200 /* WorkbenchContrib */,
    primary: 2048 /* CtrlCmd */ | 3 /* Enter */
  },
  menu: {
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 0,
    when: ContextKeyExpr.and(TerminalChatContextKeys.responseContainsMultipleCodeBlocks, TerminalChatContextKeys.requestActive.negate())
  },
  run: (_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.terminalChatWidget?.acceptCommand(true);
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.chat.insertCommand" /* InsertCommand */,
  title: localize2(20435, "Insert Chat Command"),
  shortTitle: localize2(20434, "Insert"),
  category: AbstractInlineChatAction.category,
  icon: Codicon.insert,
  precondition: ContextKeyExpr.and(
    ChatContextKeys.enabled,
    ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    TerminalChatContextKeys.requestActive.negate(),
    TerminalChatContextKeys.responseContainsCodeBlock,
    TerminalChatContextKeys.responseContainsMultipleCodeBlocks.negate()
  ),
  keybinding: {
    when: TerminalChatContextKeys.requestActive.negate(),
    weight: 200 /* WorkbenchContrib */,
    primary: 512 /* Alt */ | 3 /* Enter */,
    secondary: [2048 /* CtrlCmd */ | 3 /* Enter */ | 512 /* Alt */]
  },
  menu: {
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 1,
    when: ContextKeyExpr.and(TerminalChatContextKeys.responseContainsCodeBlock, TerminalChatContextKeys.responseContainsMultipleCodeBlocks.negate(), TerminalChatContextKeys.requestActive.negate())
  },
  run: (_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.terminalChatWidget?.acceptCommand(false);
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.chat.insertFirstCommand" /* InsertFirstCommand */,
  title: localize2(20437, "Insert First Chat Command"),
  shortTitle: localize2(20436, "Insert First"),
  category: AbstractInlineChatAction.category,
  precondition: ContextKeyExpr.and(
    ChatContextKeys.enabled,
    ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    TerminalChatContextKeys.requestActive.negate(),
    TerminalChatContextKeys.responseContainsMultipleCodeBlocks
  ),
  keybinding: {
    when: TerminalChatContextKeys.requestActive.negate(),
    weight: 200 /* WorkbenchContrib */,
    primary: 512 /* Alt */ | 3 /* Enter */,
    secondary: [2048 /* CtrlCmd */ | 3 /* Enter */ | 512 /* Alt */]
  },
  menu: {
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 1,
    when: ContextKeyExpr.and(TerminalChatContextKeys.responseContainsMultipleCodeBlocks, TerminalChatContextKeys.requestActive.negate())
  },
  run: (_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.terminalChatWidget?.acceptCommand(false);
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.chat.rerunRequest" /* RerunRequest */,
  title: localize2(20431, "Rerun Request"),
  f1: false,
  icon: Codicon.refresh,
  category: AbstractInlineChatAction.category,
  precondition: ContextKeyExpr.and(
    ChatContextKeys.enabled,
    ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    TerminalChatContextKeys.requestActive.negate()
  ),
  keybinding: {
    weight: 200 /* WorkbenchContrib */,
    primary: 2048 /* CtrlCmd */ | 48 /* KeyR */,
    when: TerminalChatContextKeys.focused
  },
  menu: {
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 5,
    when: ContextKeyExpr.and(TerminalChatContextKeys.inputHasText.toNegated(), TerminalChatContextKeys.requestActive.negate())
  },
  run: async (_xterm, _accessor, activeInstance) => {
    const chatService = _accessor.get(IChatService);
    const chatWidgetService = _accessor.get(IChatWidgetService);
    const contr = TerminalChatController.activeChatController;
    const model = contr?.terminalChatWidget?.inlineChatWidget.chatWidget.viewModel?.model;
    if (!model) {
      return;
    }
    const lastRequest2 = model.getRequests().at(-1);
    if (lastRequest2) {
      const widget = chatWidgetService.getWidgetBySessionResource(model.sessionResource);
      await chatService.resendRequest(lastRequest2, {
        noCommandDetection: false,
        attempt: lastRequest2.attempt + 1,
        location: "terminal" /* Terminal */,
        userSelectedModelId: widget?.input.currentLanguageModel
      });
    }
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.chat.viewInChat" /* ViewInChat */,
  title: localize2(20448, "View in Chat"),
  category: AbstractInlineChatAction.category,
  precondition: ContextKeyExpr.and(
    ChatContextKeys.enabled,
    ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    TerminalChatContextKeys.requestActive.negate(),
    TerminalChatContextKeys.usesAgentHost.negate()
  ),
  icon: Codicon.chatSparkle,
  menu: [{
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "zzz",
    order: 1,
    isHiddenByDefault: true,
    when: ContextKeyExpr.and(TerminalChatContextKeys.responseContainsCodeBlock, TerminalChatContextKeys.requestActive.negate(), TerminalChatContextKeys.usesAgentHost.negate())
  }],
  run: (_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.viewInChat();
  }
});

registerAction2(class ShowChatTerminalsAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.terminal.chat.viewHiddenChatTerminals" /* ViewHiddenChatTerminals */,
      title: localize2(20447, "View Hidden Chat Terminals"),
      category: localize2(20446, "Terminal"),
      f1: true,
      precondition: ContextKeyExpr.and(TerminalChatContextKeys.hasHiddenChatTerminals, ChatContextKeys.enabled),
      menu: [{
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(TerminalChatContextKeys.hasHiddenChatTerminals, ContextKeyExpr.equals("view", ChatViewId)),
        group: "terminal",
        order: 0,
        isHiddenByDefault: true
      }]
    });
  }
  async run(accessor) {
    const terminalService = accessor.get(ITerminalService);
    const groupService = accessor.get(ITerminalGroupService);
    const editorService = accessor.get(ITerminalEditorService);
    const terminalChatService = accessor.get(ITerminalChatService);
    const quickInputService = accessor.get(IQuickInputService);
    const instantiationService = accessor.get(IInstantiationService);
    const chatService = accessor.get(IChatService);
    const telemetryService = accessor.get(ITelemetryService);
    const visible = /* @__PURE__ */ new Set([...groupService.instances, ...editorService.instances]);
    const toolInstances = terminalChatService.getToolSessionTerminalInstances();
    if (toolInstances.length === 0) {
      return;
    }
    const all = /* @__PURE__ */ new Map();
    for (const i2 of toolInstances) {
      if (!visible.has(i2)) {
        all.set(i2.instanceId, i2);
      }
    }
    if (all.size === 0) {
      return;
    }
    telemetryService.publicLog2("terminal.chatViewHiddenTerminals", {
      hiddenCount: all.size
    });
    if (all.size === 1) {
      const instance2 = Array.from(all.values())[0];
      terminalService.setActiveInstance(instance2);
      await terminalService.revealTerminal(instance2);
      await terminalService.focusInstance(instance2);
      this._logRevealHiddenTerminal(telemetryService, "single");
      return;
    }
    const items = [];
    const lastCommandLocalized = (command4) => localize2(20432, "Last: {0}", command4).value;
    const MAX_DETAIL_LENGTH = 80;
    const metas = [];
    for (const instance2 of all.values()) {
      const iconId = instantiationService.invokeFunction(getIconId, instance2);
      const label3 = `$(${iconId}) ${instance2.title}`;
      const lastCommand = instance2.capabilities.get(2 /* CommandDetection */)?.commands.at(-1)?.command;
      const chatSessionResource = terminalChatService.getChatSessionResourceForInstance(instance2);
      let chatSessionTitle;
      if (chatSessionResource) {
        const liveTitle = chatService.getSession(chatSessionResource)?.title;
        chatSessionTitle = liveTitle ?? chatService.getSessionTitle(chatSessionResource);
      }
      const description = chatSessionTitle;
      let detail2;
      let tooltip;
      if (lastCommand) {
        const commandLines = lastCommand.split("\n");
        const firstLine3 = commandLines[0];
        const displayCommand = firstLine3.length > MAX_DETAIL_LENGTH ? firstLine3.substring(0, MAX_DETAIL_LENGTH) + "\u2026" : firstLine3;
        detail2 = lastCommandLocalized(displayCommand);
        const wasTruncated = firstLine3.length > MAX_DETAIL_LENGTH;
        const hasMultipleLines = commandLines.length > 1;
        if (wasTruncated || hasMultipleLines) {
          if (hasMultipleLines) {
            tooltip = { value: `\`\`\`
${lastCommand}
\`\`\``, supportThemeIcons: true };
          } else {
            tooltip = lastCommandLocalized(lastCommand);
          }
        }
      }
      metas.push({
        label: label3,
        description,
        detail: detail2,
        tooltip,
        id: String(instance2.instanceId)
      });
    }
    for (const m of metas) {
      items.push({
        label: m.label,
        description: m.description,
        detail: m.detail,
        tooltip: m.tooltip,
        id: m.id
      });
    }
    const qp = quickInputService.createQuickPick();
    qp.placeholder = localize2(20442, "Select a chat terminal to show and focus").value;
    qp.items = items;
    qp.canSelectMany = false;
    qp.title = localize2(20443, "Chat Terminals").value;
    qp.matchOnDescription = true;
    qp.matchOnDetail = true;
    const qpDisposables = new DisposableStore();
    qpDisposables.add(qp);
    qpDisposables.add(qp.onDidAccept(async () => {
      const sel = qp.selectedItems[0];
      if (sel) {
        const instance2 = all.get(Number(sel.id));
        if (instance2) {
          terminalService.setActiveInstance(instance2);
          await terminalService.revealTerminal(instance2);
          qp.hide();
          await terminalService.focusInstance(instance2);
          this._logRevealHiddenTerminal(telemetryService, "quickPick");
        } else {
          qp.hide();
        }
      } else {
        qp.hide();
      }
    }));
    qpDisposables.add(qp.onDidHide(() => {
      qpDisposables.dispose();
      qp.dispose();
    }));
    qp.show();
  }
  _logRevealHiddenTerminal(telemetryService, via) {
    telemetryService.publicLog2("terminal.chatRevealHiddenTerminal", { via });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.terminal.chat.focusMostRecentChatTerminal" /* FocusMostRecentChatTerminal */,
  weight: 200 /* WorkbenchContrib */,
  when: ChatContextKeys.inChatSession,
  handler: async (accessor) => {
    const terminalChatService = accessor.get(ITerminalChatService);
    const part = terminalChatService.getMostRecentProgressPart();
    if (!part) {
      return;
    }
    await part.focusTerminal();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.terminal.chat.focusMostRecentChatTerminalOutput" /* FocusMostRecentChatTerminalOutput */,
  weight: 200 /* WorkbenchContrib */,
  when: ChatContextKeys.inChatSession,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 45 /* KeyO */,
  handler: async (accessor) => {
    const terminalChatService = accessor.get(ITerminalChatService);
    const part = terminalChatService.getMostRecentProgressPart();
    if (!part) {
      return;
    }
    await part.toggleOutputFromKeyboard();
  }
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.terminal.chat.focusMostRecentChatTerminal" /* FocusMostRecentChatTerminal */,
    title: localize(20429, null)
  },
  when: ChatContextKeys.inChatSession
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.terminal.chat.focusMostRecentChatTerminalOutput" /* FocusMostRecentChatTerminalOutput */,
    title: localize(20430, null)
  },
  when: ChatContextKeys.inChatSession
});

CommandsRegistry.registerCommand("workbench.action.terminal.chat.openTerminalSettingsLink" /* OpenTerminalSettingsLink */, async (accessor, scopeRaw) => {
  const preferencesService = accessor.get(IPreferencesService);
  {
    const scope = parseInt(scopeRaw);
    const target = !isNaN(scope) ? scope : void 0;
    const options3 = {
      jsonEditor: true,
      revealSetting: {
        key: "chat.tools.terminal.autoApprove" /* AutoApprove */
      }
    };
    switch (target) {
      case 1 /* APPLICATION */:
        preferencesService.openApplicationSettings(options3);
        break;
      case 2 /* USER */:
      case 3 /* USER_LOCAL */:
        preferencesService.openUserSettings(options3);
        break;
      case 4 /* USER_REMOTE */:
        preferencesService.openRemoteSettings(options3);
        break;
      case 5 /* WORKSPACE */:
      case 6 /* WORKSPACE_FOLDER */:
        preferencesService.openWorkspaceSettings(options3);
        break;
      default: {
        preferencesService.openSettings({
          target: 2 /* USER */,
          query: `@id:${"chat.tools.terminal.autoApprove" /* AutoApprove */}`
        });
        break;
      }
    }
  }
});

CommandsRegistry.registerCommand("workbench.action.terminal.chat.disableSessionAutoApproval" /* DisableSessionAutoApproval */, async (accessor, chatSessionResource) => {
  const terminalChatService = accessor.get(ITerminalChatService);
  terminalChatService.setChatSessionAutoApproval(chatSessionResource, false);
});
export {};
