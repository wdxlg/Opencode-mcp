// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTipContentPart.ts
import { $, EventHelper, EventType, addDisposableListener, clearNode, getWindow, runAtThisOrScheduleAtNextAnimationFrame, trackFocus } from "./module-0075.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ChatInputNoticeWidget } from "./module-2041.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { Action2, IMenuService, MenuId, registerAction2 } from "./module-0092.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { CHAT_SETUP_ACTION_ID } from "./module-1476.mjs";
import { openLinkFromMarkdown } from "./module-0541.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatTipService } from "./module-2388.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTipContentPart.ts
var $57 = $;

var ChatTipContentPart = class extends Disposable {
  constructor(tip, _renderer, _chatTipService, _contextMenuService, _menuService, _contextKeyService, _instantiationService, _openerService, _commandService, _chatEntitlementService) {
    super();
    this._renderer = _renderer;
    this._chatTipService = _chatTipService;
    this._contextMenuService = _contextMenuService;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._openerService = _openerService;
    this._commandService = _commandService;
    this._chatEntitlementService = _chatEntitlementService;
    this._onDidHide = this._register(new Emitter());
    this.onDidHide = this._onDidHide.event;
    this._renderedContent = this._register(new MutableDisposable());
    this._toolbar = this._register(new MutableDisposable());
    this._notice = this._register(new ChatInputNoticeWidget({
      variant: "tip" /* Tip */,
      className: "chat-tip-widget",
      ariaRoleDescription: localize(12160, null)
    }));
    this._inChatTipContextKey = ChatContextKeys.inChatTip.bindTo(this._contextKeyService);
    this._multipleChatTipsContextKey = ChatContextKeys.multipleChatTips.bindTo(this._contextKeyService);
    const focusTracker = this._register(trackFocus(this.domNode));
    this._register(focusTracker.onDidFocus(() => this._inChatTipContextKey.set(true)));
    this._register(focusTracker.onDidBlur(() => this._inChatTipContextKey.set(false)));
    this._register({
      dispose: () => {
        this._inChatTipContextKey.reset();
        this._multipleChatTipsContextKey.reset();
      }
    });
    this._renderTip(tip);
    this._register(this._chatTipService.onDidDismissTip(() => {
      this._onDidHide.fire();
    }));
    this._register(this._chatTipService.onDidNavigateTip((tip2) => {
      this._renderTip(tip2);
      runAtThisOrScheduleAtNextAnimationFrame(getWindow(this.domNode), () => this.focus());
    }));
    this._register(this._chatTipService.onDidHideTip(() => {
      this._onDidHide.fire();
    }));
    this._register(this._chatTipService.onDidDisableTips(() => {
      this._onDidHide.fire();
    }));
    this._register(addDisposableListener(this.domNode, EventType.CONTEXT_MENU, (e) => {
      EventHelper.stop(e, true);
      const event = new StandardMouseEvent(getWindow(this.domNode), e);
      this._contextMenuService.showContextMenu({
        getAnchor: () => event,
        getActions: () => {
          const menu = this._menuService.getMenuActions(MenuId.ChatTipContext, this._contextKeyService);
          return getFlatContextMenuActions(menu);
        }
      });
    }));
  }
  get domNode() {
    return this._notice.domNode;
  }
  hasFocus() {
    return this._notice.hasFocus();
  }
  focus() {
    this._notice.focus();
  }
  _renderTip(tip) {
    clearNode(this.domNode);
    this._toolbar.clear();
    this._multipleChatTipsContextKey.set(this._chatTipService.hasMultipleTips());
    const markdownContent = this._renderer.render(tip.content, {
      actionHandler: (link2, md) => {
        this._handleTipAction(link2, md).catch(onUnexpectedError);
      }
    });
    this._renderedContent.value = markdownContent;
    this.domNode.appendChild(markdownContent.element);
    const toolbarContainer = $57(".chat-tip-toolbar");
    this._toolbar.value = this._instantiationService.createInstance(MenuWorkbenchToolBar, toolbarContainer, MenuId.ChatTipToolbar, {
      menuOptions: {
        shouldForwardArgs: true
      }
    });
    this.domNode.appendChild(toolbarContainer);
    const textContent = markdownContent.element.textContent ?? localize(12153, null);
    const hasLink = /\[.*?\]\(.*?\)/.test(tip.content.value);
    const ariaLabel = hasLink ? localize(12161, null, textContent) : textContent;
    this._notice.setAriaLabel(ariaLabel);
  }
  async _handleTipAction(link2, mdStr) {
    if (link2.startsWith("command:") && this._shouldTriggerSetup()) {
      const setupSucceeded = await this._commandService.executeCommand(CHAT_SETUP_ACTION_ID);
      if (!setupSucceeded) {
        return;
      }
    }
    await openLinkFromMarkdown(this._openerService, link2, mdStr.isTrusted);
  }
  _shouldTriggerSetup() {
    if (this._chatEntitlementService.hasByokModels) {
      return false;
    }
    const sentiment = this._chatEntitlementService.sentiment;
    if (!sentiment?.completed) {
      return true;
    }
    return this._chatEntitlementService.entitlement === 1 /* Unknown */;
  }
};

ChatTipContentPart = __decorateClass([
  __decorateParam(2, IChatTipService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, IChatEntitlementService)
], ChatTipContentPart);

registerAction2(class PreviousTipAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.previousTip",
      title: localize2(12158, "Previous tip"),
      icon: Codicon.chevronLeft,
      precondition: ChatContextKeys.multipleChatTips,
      f1: false,
      menu: [{
        id: MenuId.ChatTipToolbar,
        group: "navigation",
        order: 1
      }]
    });
  }
  async run(accessor) {
    const chatTipService = accessor.get(IChatTipService);
    chatTipService.navigateToPreviousTip();
  }
});

registerAction2(class NextTipAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.nextTip",
      title: localize2(12157, "Next tip"),
      icon: Codicon.chevronRight,
      precondition: ChatContextKeys.multipleChatTips,
      f1: false,
      menu: [{
        id: MenuId.ChatTipToolbar,
        group: "navigation",
        order: 2
      }]
    });
  }
  async run(accessor) {
    const chatTipService = accessor.get(IChatTipService);
    chatTipService.navigateToNextTip();
  }
});

registerAction2(class DismissTipToolbarAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.dismissTipToolbar",
      title: localize2(12156, "Dismiss tip"),
      icon: Codicon.check,
      f1: false,
      menu: [{
        id: MenuId.ChatTipToolbar,
        group: "navigation",
        order: 3
      }]
    });
  }
  async run(accessor) {
    accessor.get(IChatTipService).dismissTipForSession();
  }
});

registerAction2(class DismissTipAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.dismissTip",
      title: localize2(12155, "Dismiss this tip"),
      f1: false,
      menu: [{
        id: MenuId.ChatTipContext,
        group: "chatTip",
        order: 1
      }]
    });
  }
  async run(accessor) {
    accessor.get(IChatTipService).dismissTipForSession();
  }
});

registerAction2(class DisableTipsAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.disableTips",
      title: localize2(12154, "Disable tips"),
      icon: Codicon.bellSlash,
      f1: false,
      menu: [{
        id: MenuId.ChatTipContext,
        group: "chatTip",
        order: 2
      }, {
        id: MenuId.ChatTipToolbar,
        group: "navigation",
        order: 5
      }]
    });
  }
  async run(accessor) {
    const chatTipService = accessor.get(IChatTipService);
    const commandService = accessor.get(ICommandService);
    await chatTipService.disableTips();
    await commandService.executeCommand("workbench.action.openSettings", "chat.tips.enabled");
  }
});

registerAction2(class ResetDismissedTipsAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.resetDismissedTips",
      title: localize2(12159, "Reset Dismissed Tips"),
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor) {
    accessor.get(IChatTipService).clearDismissedTips();
  }
});
export { $57, ChatTipContentPart };
