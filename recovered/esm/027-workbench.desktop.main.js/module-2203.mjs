// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatToolActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { isResponseVM } from "./module-0978.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { ContextKeyExpr, IContextKeyService as OcContextKeyService } from "./module-0089.mjs";
import { ChatViewId as OcMarketChatViewId } from "./module-0981.mjs";
import { IConfigurationService as OcConfigurationService } from "./module-0132.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { Codicon } from "./module-0085.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService as OcCommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { autorun } from "./module-0052.mjs";
import { showToolsPicker } from "./module-2202.mjs";
import { Iterable } from "./module-0011.mjs";
import { DisposableStore } from "./module-0012.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatToolActions.ts
var AcceptToolConfirmationActionId = "workbench.action.chat.acceptTool";

var SkipToolConfirmationActionId = "workbench.action.chat.skipTool";

var AcceptToolPostConfirmationActionId = "workbench.action.chat.acceptToolPostExecution";

var SkipToolPostConfirmationActionId = "workbench.action.chat.skipToolPostExecution";

var ToolConfirmationAction = class extends Action2 {
  run(accessor, context2) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = context2?.sessionResource ? chatWidgetService.getWidgetBySessionResource(context2.sessionResource) : chatWidgetService.lastFocusedWidget;
    const lastItem = widget?.viewModel?.getItems().at(-1);
    if (!isResponseVM(lastItem)) {
      return;
    }
    for (const item of lastItem.model.response.value) {
      const state = item.kind === "toolInvocation" ? item.state.get() : void 0;
      if (state?.type === IChatToolInvocation.StateKind.WaitingForConfirmation || state?.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
        state.confirm(this.getReason());
        break;
      }
    }
    widget?.focusInput();
  }
};

var AcceptToolConfirmation = class extends ToolConfirmationAction {
  constructor() {
    super({
      id: AcceptToolConfirmationActionId,
      title: localize2(8791, "Accept"),
      f1: false,
      category: CHAT_CATEGORY,
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.Editing.hasToolConfirmation),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        // Override chatEditor.action.accept
        weight: 200 /* WorkbenchContrib */ + 1
      }
    });
  }
  getReason() {
    return { type: 4 /* UserAction */ };
  }
};

var SkipToolConfirmation = class extends ToolConfirmationAction {
  constructor() {
    super({
      id: SkipToolConfirmationActionId,
      title: localize2(8792, "Skip"),
      f1: false,
      category: CHAT_CATEGORY,
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.Editing.hasToolConfirmation),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */ | 512 /* Alt */,
        // Override chatEditor.action.accept
        weight: 200 /* WorkbenchContrib */ + 1
      }
    });
  }
  getReason() {
    return { type: 5 /* Skipped */ };
  }
};

var ConfigureToolsAction = class _ConfigureToolsAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.configureTools";
  }
  constructor() {
    super({
      id: _ConfigureToolsAction.ID,
      title: localize(8801, null),
      icon: Codicon.settingsCompact,
      f1: false,
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */),
      menu: [{
        when: ContextKeyExpr.and(
          ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */),
          ChatContextKeys.lockedToCodingAgent.negate()
        ),
        id: MenuId.ChatInput,
        group: "navigation",
        order: 100
      }]
    });
  }
  async run(accessor, ...args2) {
    // OpenCode: 工具配置改为独立窗口（不再使用顶部快速选择框）
    return accessor.get(OcCommandService).executeCommand("opencode.manageTools");
  }
  async runLegacyQuickPick(accessor, ...args2) {
    const instaService = accessor.get(IInstantiationService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const telemetryService = accessor.get(ITelemetryService);
    let widget = chatWidgetService.lastFocusedWidget;
    if (!widget) {
      widget = this.extractWidget(args2);
    }
    if (!widget) {
      return;
    }
    const source = this.extractSource(args2) ?? "chatInput";
    let placeholder;
    let description;
    const { entriesScope, entriesMap } = widget.input.selectedToolsModel;
    switch (entriesScope) {
      case 1 /* Session */:
        placeholder = localize(8800, null);
        description = localize(8796, null);
        break;
      case 2 /* Agent */:
        placeholder = localize(8797, null);
        description = localize(8793, null, widget.input.currentModeObs.get().label.get());
        break;
      case 3 /* Agent_ReadOnly */:
        placeholder = localize(8799, null);
        description = localize(8795, null, widget.input.currentModeObs.get().label.get());
        break;
      case 0 /* Global */:
        placeholder = localize(8798, null);
        description = localize(8794, null);
        break;
    }
    const cts = new CancellationTokenSource();
    const initialMode = widget.input.currentModeObs.get();
    const modeListener = autorun((reader) => {
      if (initialMode.id !== widget.input.currentModeObs.read(reader).id) {
        cts.cancel();
      }
    });
    try {
      const result = await instaService.invokeFunction(showToolsPicker, placeholder, source, description, () => entriesMap.get(), widget.input.selectedLanguageModel.get()?.metadata, cts.token);
      if (result) {
        widget.input.selectedToolsModel.set(result, false);
      }
    } finally {
      modeListener.dispose();
      cts.dispose();
    }
    const tools = widget.input.selectedToolsModel.entriesMap.get();
    telemetryService.publicLog2("chat/selectedTools", {
      total: tools.size,
      enabled: Iterable.reduce(tools, (prev, [_, enabled]) => enabled ? prev + 1 : prev, 0)
    });
  }
  extractWidget(args2) {
    function isChatActionContext(obj) {
      return !!obj && typeof obj === "object" && !!obj.widget;
    }
    for (const arg of args2) {
      if (isChatActionContext(arg)) {
        return arg.widget;
      }
    }
    return void 0;
  }
  extractSource(args2) {
    function isChatActionSource(obj) {
      return !!obj && typeof obj === "object" && !!obj.source;
    }
    for (const arg of args2) {
      if (isChatActionSource(arg)) {
        return arg.source;
      }
    }
    return void 0;
  }
};

// OpenCode: 输入框「配置指令…」按钮，紧跟「配置工具…」之后，打开自定义指令窗口（opencode.manageCommands）
var ConfigureCommandsAction = class _ConfigureCommandsAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.configureCommands";
  }
  constructor() {
    super({
      id: _ConfigureCommandsAction.ID,
      title: { value: "\u914D\u7F6E\u6307\u4EE4\u2026", original: "Configure Commands..." },
      icon: Codicon.symbolKeyword ?? Codicon.settingsCompact,
      f1: false,
      category: CHAT_CATEGORY,
      menu: [{
        when: ChatContextKeys.lockedToCodingAgent.negate(),
        id: MenuId.ChatInput,
        group: "navigation",
        order: 101
      }]
    });
  }
  async run(accessor) {
    return accessor.get(OcCommandService).executeCommand("opencode.manageCommands");
  }
};

// OpenCode ai-plugins-step01: 输入框「配置 Skill…」按钮，打开 opencode.manageSkills
var ConfigureSkillsAction = class _ConfigureSkillsAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.opencodeSkills";
  }
  constructor() {
    super({
      id: _ConfigureSkillsAction.ID,
      title: { value: "配置 Skill…", original: "Configure Skills..." },
      icon: Codicon.book ?? Codicon.settingsCompact,
      f1: true,
      category: CHAT_CATEGORY,
      menu: [{
        when: ChatContextKeys.lockedToCodingAgent.negate(),
        id: MenuId.ChatInput,
        group: "navigation",
        order: 102
      }]
    });
  }
  async run(accessor) {
    return accessor.get(OcCommandService).executeCommand("opencode.manageSkills");
  }
};
// OpenCode market-step01: 「市场…」按钮，打开 opencode.openMarket（在线下载 Skill、插件、MCP、扩展、主题）
var ConfigureMarketAction = class _ConfigureMarketAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.opencodeMarket";
  }
  constructor() {
    super({
      id: _ConfigureMarketAction.ID,
      title: { value: "市场…", original: "Market..." },
      icon: Codicon.cloudDownload ?? Codicon.package ?? Codicon.extensions,
      f1: true,
      category: CHAT_CATEGORY,
      // OpenCode titlebar-step01: 放到对话视图右上角的按钮行
      menu: [{
        when: ContextKeyExpr.equals("view", OcMarketChatViewId),
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 8
      }]
    });
  }
  async run(accessor) {
    return accessor.get(OcCommandService).executeCommand("opencode.openMarket");
  }
};
// OpenCode memory-step01: 对话视图右上角「记忆库」按钮，打开 opencode.openMemory（管理记忆、复制接班提示词）
var OpenMemoryLibraryAction = class _OpenMemoryLibraryAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.opencodeMemory";
  }
  constructor() {
    super({
      id: _OpenMemoryLibraryAction.ID,
      title: { value: "记忆库", original: "Memory Library" },
      icon: Codicon.database ?? Codicon.archive ?? Codicon.book,
      f1: true,
      category: CHAT_CATEGORY,
      menu: [{
        when: ContextKeyExpr.equals("view", OcMarketChatViewId),
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 9
      }]
    });
  }
  async run(accessor) {
    return accessor.get(OcCommandService).executeCommand("opencode.openMemory");
  }
};
// OpenCode ai-plugins-step01: 输入框「管理插件…」按钮，打开 opencode.managePlugins
var ConfigurePluginsAction = class _ConfigurePluginsAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.opencodePlugins";
  }
  constructor() {
    super({
      id: _ConfigurePluginsAction.ID,
      title: { value: "管理插件…", original: "Manage Plugins..." },
      icon: Codicon.extensions ?? Codicon.settingsCompact,
      f1: true,
      category: CHAT_CATEGORY,
      menu: [{
        when: ChatContextKeys.lockedToCodingAgent.negate(),
        id: MenuId.ChatInput,
        group: "navigation",
        order: 103
      }]
    });
  }
  async run(accessor) {
    return accessor.get(OcCommandService).executeCommand("opencode.managePlugins");
  }
};

// OpenCode: 「AI 命名」开关，放在「对话」列表工具栏（刷新/搜索/筛选一行）；开启时图标变实心并显示蓝色；开启时按钮高亮（toggled），对话名由 AI 生成
var ocAiTitleKeys;
var ToggleAiTitleAction = class _ToggleAiTitleAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.toggleAiTitle";
  }
  constructor() {
    super({
      id: _ToggleAiTitleAction.ID,
      title: { value: "AI \u547D\u540D\u5BF9\u8BDD", original: "AI Chat Titles" },
      icon: Codicon.sparkle ?? Codicon.edit,
      toggled: { condition: ContextKeyExpr.or(ContextKeyExpr.and(ContextKeyExpr.equals("config.opencode.chat.aiTitle", true), ContextKeyExpr.not("opencodeAiTitleTouched")), ContextKeyExpr.equals("opencodeAiTitleOn", true)), icon: Codicon.sparkleFilled ?? Codicon.sparkle, title: "AI \u547D\u540D\u5BF9\u8BDD\uFF1A\u5DF2\u5F00\u542F" },
      f1: false,
      category: CHAT_CATEGORY,
      menu: [{
        id: MenuId.AgentSessionsToolbar,
        group: "navigation",
        order: 10
      }]
    });
  }
  async run(accessor) {
    // 先在界面上立刻切换高亮（乐观更新），再直接在工作台写设置，不经过扩展进程
    const contextKeyService = accessor.get(OcContextKeyService);
    const configurationService = accessor.get(OcConfigurationService);
    const next = configurationService.getValue("opencode.chat.aiTitle") !== true;
    ocAiTitleKeys ??= { touched: contextKeyService.createKey("opencodeAiTitleTouched", false), on: contextKeyService.createKey("opencodeAiTitleOn", false) };
    ocAiTitleKeys.on.set(next);
    ocAiTitleKeys.touched.set(true);
    try {
      await configurationService.updateValue("opencode.chat.aiTitle", next, 2);
    } catch {
      ocAiTitleKeys.on.set(!next);
    }
  }
};

function registerChatToolActions() {
  const store = new DisposableStore();
  store.add(registerAction2(AcceptToolConfirmation));
  store.add(registerAction2(SkipToolConfirmation));
  store.add(registerAction2(ConfigureToolsAction));
  store.add(registerAction2(ConfigureCommandsAction));
  store.add(registerAction2(ConfigureSkillsAction));
  store.add(registerAction2(ConfigurePluginsAction));
  store.add(registerAction2(ConfigureMarketAction));
  store.add(registerAction2(OpenMemoryLibraryAction));
  store.add(registerAction2(ToggleAiTitleAction));
  return store;
}
export { registerChatToolActions, AcceptToolConfirmationActionId, SkipToolConfirmationActionId, AcceptToolPostConfirmationActionId, SkipToolPostConfirmationActionId, ToolConfirmationAction, AcceptToolConfirmation, SkipToolConfirmation, ConfigureToolsAction, ConfigureCommandsAction };
