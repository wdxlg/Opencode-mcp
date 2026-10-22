// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatToolActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { isResponseVM } from "./module-0978.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { Codicon } from "./module-0085.mjs";
import { IInstantiationService } from "./module-0077.mjs";
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

function registerChatToolActions() {
  const store = new DisposableStore();
  store.add(registerAction2(AcceptToolConfirmation));
  store.add(registerAction2(SkipToolConfirmation));
  store.add(registerAction2(ConfigureToolsAction));
  return store;
}
export { registerChatToolActions, AcceptToolConfirmationActionId, SkipToolConfirmationActionId, AcceptToolPostConfirmationActionId, SkipToolPostConfirmationActionId, ToolConfirmationAction, AcceptToolConfirmation, SkipToolConfirmation, ConfigureToolsAction };
