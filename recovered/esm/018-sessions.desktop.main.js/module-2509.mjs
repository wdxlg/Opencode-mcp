// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatCopyActions.ts
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { Disposable, MutableDisposable, markAsSingleton } from "./module-0012.mjs";
import { $, append, getActiveElement, getActiveWindow, isAncestor, isHTMLElement } from "./module-0075.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { status } from "./module-0076.mjs";
import { Action2, MenuId, MenuItemAction, registerAction2 } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { CHAT_CATEGORY, stringifyItem } from "./module-1475.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { isChatTreeItem, isRequestVM, isResponseVM } from "./module-0979.mjs";
import { toPortableMarkdown } from "./module-2348.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { katexContainerClassName, katexContainerLatexAttributeName } from "./module-0977.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatCopyActions.ts
var CopyItemActionId = "workbench.action.chat.copyItem";

var copyFeedbackDuration = 1200;

var copyIconClasses = ThemeIcon.asClassNameArray(Codicon.copy);

var copiedIconClasses = ThemeIcon.asClassNameArray(Codicon.check);

var ChatCopyActionViewItem = class extends MenuEntryActionViewItem {
  constructor() {
    super(...arguments);
    this.copiedStateReset = this._register(new MutableDisposable());
    this.actionRunnerListener = this._register(new MutableDisposable());
    this.copied = false;
  }
  get actionRunner() {
    return super.actionRunner;
  }
  set actionRunner(actionRunner) {
    super.actionRunner = actionRunner;
    this.bindActionRunner(actionRunner);
  }
  render(container2) {
    super.render(container2);
    this.bindActionRunner(super.actionRunner);
    if (!this.element || !this.label) {
      return;
    }
    this.element.classList.add("chat-copy-action");
    this.clearLabelIconClasses();
    this.label.style.backgroundImage = "";
    this.label.classList.remove("icon");
    this.label.textContent = "";
    this.label.setAttribute("aria-hidden", "true");
    const iconContainer = append(this.label, $(".chat-copy-action-icons"));
    const copyIcon2 = append(iconContainer, $(".chat-copy-action-icon.chat-copy-action-icon-copy"));
    copyIcon2.classList.add(...copyIconClasses);
    copyIcon2.setAttribute("aria-hidden", "true");
    const copiedIcon = append(iconContainer, $(".chat-copy-action-icon.chat-copy-action-icon-copied"));
    copiedIcon.classList.add(...copiedIconClasses);
    copiedIcon.setAttribute("aria-hidden", "true");
    this.renderCopiedState();
  }
  getTooltip() {
    return this.copied ? localize(8628, null) : super.getTooltip();
  }
  updateAriaLabel() {
    this.element?.setAttribute("aria-label", this.copied ? localize(8629, null) : localize(8627, null));
  }
  updateClass() {
    super.updateClass();
    this.clearLabelIconClasses();
    if (this.label) {
      this.label.style.backgroundImage = "";
      this.label.classList.remove("icon");
    }
  }
  clearLabelIconClasses() {
    this.label?.classList.remove(...copyIconClasses, ...copiedIconClasses);
  }
  renderCopiedState() {
    this.element?.classList.toggle("copied", this.copied);
    this.updateTooltip();
  }
  bindActionRunner(actionRunner) {
    this.actionRunnerListener.value = actionRunner.onDidRun((e4) => {
      if (e4.action !== this.action || e4.error) {
        return;
      }
      this.copied = true;
      this.renderCopiedState();
      this.copiedStateReset.value = disposableTimeout(() => {
        this.copied = false;
        this.renderCopiedState();
      }, copyFeedbackDuration);
      status(localize(8631, null));
    });
  }
};

var ChatCopyActionRendering = class extends Disposable {
  static {
    this.ID = "chat.copyActionRendering";
  }
  constructor(actionViewItemService, instantiationService) {
    super();
    const disposable = this._register(actionViewItemService.register(MenuId.ChatMessageFooter, CopyItemActionId, (action, options3) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(ChatCopyActionViewItem, action, options3);
    }));
    markAsSingleton(disposable);
  }
};

ChatCopyActionRendering = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService)
], ChatCopyActionRendering);

function registerChatCopyActions() {
  KeybindingsRegistry.registerKeybindingRule({
    id: "editor.action.pasteAsText",
    weight: 200 /* WorkbenchContrib */,
    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 52 /* KeyV */,
    when: ChatContextKeys.inputHasFocus
  });
  registerAction2(class CopyAllAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.copyAll",
        title: localize2(8625, "Copy All"),
        f1: false,
        category: CHAT_CATEGORY,
        menu: {
          id: MenuId.ChatContext,
          when: ChatContextKeys.responseIsFiltered.negate(),
          group: "copy"
        }
      });
    }
    run(accessor, context2) {
      const clipboardService = accessor.get(IClipboardService);
      const chatWidgetService = accessor.get(IChatWidgetService);
      const widget = (isRequestVM(context2) || isResponseVM(context2)) && chatWidgetService.getWidgetBySessionResource(context2.sessionResource) || chatWidgetService.lastFocusedWidget;
      if (widget) {
        const viewModel = widget.viewModel;
        const sessionAsText = viewModel?.getItems().filter((item) => isRequestVM(item) || isResponseVM(item) && !item.errorDetails?.responseIsFiltered).map((item) => stringifyItem(item)).join("\n\n");
        if (sessionAsText) {
          clipboardService.writeText(toPortableMarkdown(sessionAsText));
        }
      }
    }
  });
  registerAction2(class CopyItemAction extends Action2 {
    constructor() {
      super({
        id: CopyItemActionId,
        title: localize2(8630, "Copy"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.copy,
        menu: [
          {
            id: MenuId.ChatContext,
            when: ChatContextKeys.responseIsFiltered.negate(),
            group: "copy"
          },
          {
            id: MenuId.ChatMessageFooter,
            group: "navigation",
            order: 1,
            when: ContextKeyExpr.and(ChatContextKeys.isResponse, ChatContextKeys.responseIsFiltered.negate())
          }
        ]
      });
    }
    async run(accessor, ...args2) {
      const chatWidgetService = accessor.get(IChatWidgetService);
      const clipboardService = accessor.get(IClipboardService);
      const widget = chatWidgetService.lastFocusedWidget;
      let item = args2[0];
      if (!isChatTreeItem(item)) {
        item = widget?.getFocus();
        if (!item) {
          return;
        }
      }
      const nativeSelection = getActiveWindow().getSelection();
      const selectedText = nativeSelection?.toString();
      if (widget && selectedText && selectedText.length > 0 && isAncestor(getActiveElement(), widget.domNode)) {
        await clipboardService.writeText(selectedText);
        return;
      }
      if (!isRequestVM(item) && !isResponseVM(item)) {
        return;
      }
      const text2 = stringifyItem(item, false);
      await clipboardService.writeText(toPortableMarkdown(text2));
    }
  });
  registerAction2(class CopyFinalResponseAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.copyFinalResponse",
        title: localize2(8626, "Copy Final Response"),
        f1: false,
        category: CHAT_CATEGORY,
        menu: {
          id: MenuId.ChatContext,
          when: ContextKeyExpr.and(ChatContextKeys.isResponse, ChatContextKeys.responseIsFiltered.negate()),
          group: "copy"
        }
      });
    }
    async run(accessor, ...args2) {
      const chatWidgetService = accessor.get(IChatWidgetService);
      const clipboardService = accessor.get(IClipboardService);
      const widget = chatWidgetService.lastFocusedWidget;
      let item = args2[0];
      if (!isChatTreeItem(item)) {
        item = widget?.getFocus();
        if (!item) {
          return;
        }
      }
      if (!isResponseVM(item)) {
        return;
      }
      const text2 = item.response.getFinalResponse();
      if (text2) {
        await clipboardService.writeText(toPortableMarkdown(text2));
      }
    }
  });
  registerAction2(class CopyKatexMathSourceAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.copyKatexMathSource",
        title: localize2(8624, "Copy Math Source"),
        f1: false,
        category: CHAT_CATEGORY,
        menu: {
          id: MenuId.ChatContext,
          group: "copy",
          when: ChatContextKeys.isKatexMathElement
        }
      });
    }
    async run(accessor, ...args2) {
      const chatWidgetService = accessor.get(IChatWidgetService);
      const clipboardService = accessor.get(IClipboardService);
      const widget = chatWidgetService.lastFocusedWidget;
      let item = args2[0];
      if (!isChatTreeItem(item)) {
        item = widget?.getFocus();
        if (!item) {
          return;
        }
      }
      let selectedElement = null;
      const activeElement = getActiveElement();
      const nativeSelection = getActiveWindow().getSelection();
      if (widget && nativeSelection && nativeSelection.rangeCount > 0 && isAncestor(activeElement, widget.domNode)) {
        const range2 = nativeSelection.getRangeAt(0);
        selectedElement = range2.commonAncestorContainer;
        if (selectedElement.nodeType === Node.TEXT_NODE) {
          selectedElement = selectedElement.parentElement;
        }
      }
      if (!selectedElement) {
        selectedElement = activeElement?.querySelector(`.${katexContainerClassName}`) ?? null;
      }
      const katexElement = isHTMLElement(selectedElement) ? selectedElement.closest(`.${katexContainerClassName}`) : null;
      const latexSource = katexElement?.getAttribute(katexContainerLatexAttributeName) || "";
      if (latexSource) {
        await clipboardService.writeText(latexSource);
      }
    }
  });
}
export { registerChatCopyActions, CopyItemActionId, copyFeedbackDuration, copyIconClasses, copiedIconClasses, ChatCopyActionViewItem, ChatCopyActionRendering };
