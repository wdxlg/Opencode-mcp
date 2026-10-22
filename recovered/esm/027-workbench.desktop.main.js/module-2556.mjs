// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatBranchActions.ts
import { IChatWidgetService } from "./module-0981.mjs";
import { isRequestVM, isResponseVM } from "./module-0978.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IChatBranchService } from "./module-2015.mjs";
import { Codicon } from "./module-0085.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IChatService } from "./module-0972.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatBranchActions.ts
function getBranchRowContext(accessor, args2) {
  const element = args2[0];
  const widgetService = accessor.get(IChatWidgetService);
  const widget = widgetService.lastFocusedWidget;
  if (!widget?.viewModel) {
    return void 0;
  }
  const item = element && (isRequestVM(element) || isResponseVM(element)) ? element : widget.getFocus();
  if (!item) {
    return void 0;
  }
  return { widget, rowId: item.id };
}

var ChatBranchNavigateAction = class extends Action2 {
  constructor(direction) {
    const isNext = direction === "next";
    super({
      id: isNext ? "workbench.action.chat.opencode.branchNext" : "workbench.action.chat.opencode.branchPrev",
      title: isNext ? localize2(8582, "\u25B6") : localize2(8583, "\u25C0"),
      f1: false,
      category: CHAT_CATEGORY,
      menu: {
        id: MenuId.ChatMessageFooter,
        group: "navigation",
        order: direction === "next" ? 0.55 : 0.5,
        when: ContextKeyExpr.and(
          ChatContextKeys.isResponse,
          isNext ? ChatContextKeys.openCodeBranchHasNext : ChatContextKeys.openCodeBranchHasPrev
        )
      }
    });
    this.direction = direction;
  }
  run(accessor, ...args2) {
    const context2 = getBranchRowContext(accessor, args2);
    if (!context2) {
      return;
    }
    const branchService = accessor.get(IChatBranchService);
    const viewModel = context2.widget.viewModel;
    if (!viewModel) {
      return;
    }
    const sessionResource = viewModel.sessionResource;
    if (!sessionResource) {
      return;
    }
    const info = branchService.getRowInfo(sessionResource, context2.rowId);
    if (!info) {
      return;
    }
    const model = viewModel.model;
    if (model.requestInProgress.get() || model.hasActiveRequest.get()) {
      return;
    }
    const targetIndex = info.variantIndex + (this.direction === "next" ? 1 : -1);
    const target = info.group.variants[targetIndex];
    if (!target) {
      return;
    }
    branchService.setActiveVariant(sessionResource, info.group.id, target.requestId);
  }
};

var ChatBranchMergeAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.opencode.branchMerge",
      title: localize2(8581, "\u5408\u5E76\u603B\u7ED3"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.gitMerge,
      menu: {
        id: MenuId.ChatMessageFooter,
        group: "navigation",
        order: 1.2,
        when: ContextKeyExpr.and(ChatContextKeys.isResponse, ChatContextKeys.openCodeBranchCanMerge)
      }
    });
  }
  async run(accessor, ...args2) {
    const context2 = getBranchRowContext(accessor, args2);
    if (!context2) {
      return;
    }
    const { widget, rowId } = context2;
    const sessionResource = widget.viewModel?.sessionResource;
    if (!sessionResource) {
      return;
    }
    const model = widget.viewModel.model;
    if (model.requestInProgress.get() || model.hasActiveRequest.get()) {
      return;
    }
    if (!(accessor.get(IConfigurationService).getValue("opencode.multiModel.enabled") ?? true)) {
      return;
    }
    const branchService = accessor.get(IChatBranchService);
    const info = branchService.getRowInfo(sessionResource, rowId);
    if (!info || info.canMerge === false) {
      return;
    }
    await widget.acceptInput(void 0, {
      openCodeBranchIntent: { kind: "merge", groupId: info.group.id },
      forceEmptyInput: true,
      isSystemInitiated: true,
      systemInitiatedLabel: "\u5408\u5E76\u603B\u7ED3"
    });
  }
};

var ChatBranchAdoptAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.opencode.branchAdopt",
      title: localize2(8579, "\u91C7\u7EB3"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.check,
      menu: {
        id: MenuId.ChatMessageFooter,
        group: "navigation",
        order: 1.4,
        when: ContextKeyExpr.and(ChatContextKeys.isResponse, ChatContextKeys.openCodeBranchCanAdopt)
      }
    });
  }
  async run(accessor, ...args2) {
    const context2 = getBranchRowContext(accessor, args2);
    if (!context2) {
      return;
    }
    const { widget, rowId } = context2;
    const sessionResource = widget.viewModel?.sessionResource;
    if (!sessionResource) {
      return;
    }
    const branchService = accessor.get(IChatBranchService);
    const info = branchService.getRowInfo(sessionResource, rowId);
    if (!info) {
      return;
    }
    const variant = info.group.variants[info.variantIndex];
    branchService.adoptVariant(sessionResource, variant.requestId);
    await accessor.get(ICommandService).executeCommand("opencode.branch.adoptVariant", info.group.id, variant.requestId);
  }
};

var ChatBranchDeleteAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.opencode.branchDelete",
      title: localize2(8580, "\u5220\u9664\u5206\u652F"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.trash,
      menu: {
        id: MenuId.ChatMessageFooter,
        group: "navigation",
        order: 1.6,
        when: ContextKeyExpr.and(ChatContextKeys.isResponse, ChatContextKeys.openCodeBranchCanDelete)
      }
    });
  }
  async run(accessor, ...args2) {
    const context2 = getBranchRowContext(accessor, args2);
    if (!context2) {
      return;
    }
    const { widget, rowId } = context2;
    const sessionResource = widget.viewModel?.sessionResource;
    if (!sessionResource) {
      return;
    }
    const model = widget.viewModel.model;
    if (model.requestInProgress.get() || model.hasActiveRequest.get()) {
      return;
    }
    const branchService = accessor.get(IChatBranchService);
    const info = branchService.getRowInfo(sessionResource, rowId);
    if (!info || info.canDelete === false) {
      return;
    }
    const variant = info.group.variants[info.variantIndex];
    await accessor.get(IChatService).removeRequest(sessionResource, variant.requestId);
    branchService.removeRequest(sessionResource, variant.requestId);
  }
};

function registerChatBranchActions() {
  registerAction2(class ChatBranchPrevAction extends ChatBranchNavigateAction {
    constructor() {
      super("previous");
    }
  });
  registerAction2(class ChatBranchNextAction extends ChatBranchNavigateAction {
    constructor() {
      super("next");
    }
  });
  registerAction2(ChatBranchMergeAction);
  registerAction2(ChatBranchAdoptAction);
  registerAction2(ChatBranchDeleteAction);
}
export { getBranchRowContext, registerChatBranchActions, ChatBranchNavigateAction, ChatBranchMergeAction, ChatBranchAdoptAction, ChatBranchDeleteAction };
