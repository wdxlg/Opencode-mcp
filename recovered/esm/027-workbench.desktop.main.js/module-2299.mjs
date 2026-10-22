// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatConfirmationWidget.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { renderFileWidgets } from "./module-2142.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatMarkdownAnchorService } from "./module-2140.mjs";
import { DisposableResizeObserver, clearNode, h, isHTMLElement } from "./module-0075.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { Button, ButtonWithDropdown } from "./module-0546.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { EventType2 } from "./module-0251.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ChatMarkdownContentPart } from "./module-2298.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatConfirmationWidget.ts
var ChatQueryTitlePart = class extends Disposable {
  constructor(element, _title, subtitle, _renderer, _instantiationService, _chatMarkdownAnchorService) {
    super();
    this.element = element;
    this._title = _title;
    this._renderer = _renderer;
    this._instantiationService = _instantiationService;
    this._chatMarkdownAnchorService = _chatMarkdownAnchorService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._renderedTitle = this._register(new MutableDisposable());
    this._fileWidgetStore = this._register(new DisposableStore());
    element.classList.add("chat-query-title-part");
    this._renderedTitle.value = this.renderTitle(_title);
    element.append(this._renderedTitle.value.element);
    if (subtitle) {
      const str = this.toMdString(subtitle);
      const renderedTitle = this._register(_renderer.render(str, this.getRenderOptions()));
      const wrapper = document.createElement("small");
      wrapper.appendChild(renderedTitle.element);
      element.append(wrapper);
    }
  }
  get title() {
    return this._title;
  }
  set title(value2) {
    this._title = value2;
    const next = this.renderTitle(value2);
    const previousEl = this._renderedTitle.value?.element;
    if (previousEl?.parentElement) {
      previousEl.replaceWith(next.element);
    } else {
      this.element.appendChild(next.element);
    }
    this._renderedTitle.value = next;
  }
  toMdString(value2) {
    if (typeof value2 === "string") {
      return new MarkdownString("", { supportThemeIcons: true }).appendText(value2);
    } else {
      return new MarkdownString(value2.value, { supportThemeIcons: true, isTrusted: value2.isTrusted });
    }
  }
  setOptions(options3) {
    this.options = options3;
    this.title = this._title;
  }
  renderTitle(value2) {
    const renderedTitle = this._renderer.render(this.toMdString(value2), this.getRenderOptions());
    this._fileWidgetStore.clear();
    if (this.options?.renderFileWidgets) {
      renderFileWidgets(renderedTitle.element, this._instantiationService, this._chatMarkdownAnchorService, this._fileWidgetStore);
    }
    return renderedTitle;
  }
  getRenderOptions() {
    return {
      ...this.options?.markdownRenderOptions,
      asyncRenderCallback: () => this._onDidChangeHeight.fire()
    };
  }
};

ChatQueryTitlePart = __decorateClass([
  __decorateParam(3, IMarkdownRendererService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IChatMarkdownAnchorService)
], ChatQueryTitlePart);

var BaseSimpleChatConfirmationWidget = class extends Disposable {
  constructor(context2, options3, instantiationService, _markdownRendererService, contextMenuService, contextKeyService) {
    super();
    this.context = context2;
    this.instantiationService = instantiationService;
    this._markdownRendererService = _markdownRendererService;
    this._onDidClick = this._register(new Emitter());
    this.messageContentDisposables = this._register(new MutableDisposable());
    const { title, subtitle, message, buttons } = options3;
    const elements = h(".chat-confirmation-widget-container@container", [
      h(".chat-confirmation-widget@root", [
        h(".chat-confirmation-widget-title@title"),
        h(".chat-confirmation-widget-message-container", [
          h(".chat-confirmation-widget-message@message"),
          h(".chat-buttons-container@buttonsContainer", [
            h(".chat-buttons@buttons"),
            h(".chat-toolbar@toolbar")
          ])
        ])
      ])
    ]);
    configureAccessibilityContainer(elements.container, title, message);
    this._domNode = elements.root;
    this._register(instantiationService.createInstance(
      ChatQueryTitlePart,
      elements.title,
      title,
      subtitle
    ));
    this.messageElement = elements.message;
    const messageParent = this.messageElement.parentElement;
    const messageNextSibling = this.messageElement.nextSibling;
    this.messageScrollable = this._register(new DomScrollableElement(this.messageElement, {
      vertical: 1 /* Auto */,
      horizontal: 2 /* Hidden */,
      consumeMouseWheelIfScrollbarIsNeeded: true
    }));
    this.messageScrollable.getDomNode().classList.add("chat-confirmation-widget-message-scrollable");
    messageParent?.insertBefore(this.messageScrollable.getDomNode(), messageNextSibling);
    const messageResizeObserver = this._register(new DisposableResizeObserver("BaseSimpleChatConfirmationWidget.message", () => this.messageScrollable.scanDomNode()));
    this._register(messageResizeObserver.observe(this.messageElement));
    this._register(messageResizeObserver.observe(this.messageScrollable.getDomNode()));
    buttons.forEach((buttonData) => {
      const buttonOptions = { ...defaultButtonStyles, small: true, secondary: buttonData.isSecondary, title: buttonData.tooltip, disabled: buttonData.disabled };
      let button;
      if (buttonData.moreActions) {
        button = new ButtonWithDropdown(elements.buttons, {
          ...buttonOptions,
          contextMenuProvider: contextMenuService,
          addPrimaryActionToDropdown: false,
          actions: buttonData.moreActions.map((action) => {
            if (action instanceof Separator) {
              return action;
            }
            return this._register(new Action(
              action.label,
              action.label,
              void 0,
              !action.disabled,
              () => {
                this._onDidClick.fire({ button: action, isTouchClick: false });
                return Promise.resolve();
              }
            ));
          })
        });
      } else {
        button = new Button(elements.buttons, buttonOptions);
      }
      this._register(button);
      button.label = buttonData.label;
      this._register(button.onDidClick((event) => this._onDidClick.fire({ button: buttonData, isTouchClick: !!event && event.type === EventType2.Tap })));
      if (buttonData.onDidChangeDisablement) {
        this._register(buttonData.onDidChangeDisablement((disabled) => button.enabled = !disabled));
      }
    });
    if (options3?.toolbarData) {
      const overlay = contextKeyService.createOverlay([
        ["chatConfirmationPartType", options3.toolbarData.partType],
        ["chatConfirmationPartSource", options3.toolbarData.partSource]
      ]);
      const nestedInsta = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, overlay])));
      this._register(nestedInsta.createInstance(
        MenuWorkbenchToolBar,
        elements.toolbar,
        MenuId.ChatConfirmationMenu,
        {
          // buttonConfigProvider: () => ({ showLabel: false, showIcon: true }),
          menuOptions: {
            arg: options3.toolbarData.arg,
            shouldForwardArgs: true
          }
        }
      ));
    }
  }
  get onDidClick() {
    return this._onDidClick.event;
  }
  get domNode() {
    return this._domNode;
  }
  setShowButtons(showButton) {
    this.domNode.classList.toggle("hideButtons", !showButton);
  }
  renderMessage(element) {
    const store = new DisposableStore();
    const messageContentResizeObserver = store.add(new DisposableResizeObserver("BaseSimpleChatConfirmationWidget.messageContent", () => this.messageScrollable.scanDomNode()));
    store.add(messageContentResizeObserver.observe(element));
    this.messageContentDisposables.value = store;
    this.messageElement.append(element);
    this.messageScrollable.scanDomNode();
  }
};

BaseSimpleChatConfirmationWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMarkdownRendererService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IContextKeyService)
], BaseSimpleChatConfirmationWidget);

var SimpleChatConfirmationWidget = class extends BaseSimpleChatConfirmationWidget {
  constructor(context2, options3, instantiationService, markdownRendererService, contextMenuService, contextKeyService) {
    super(context2, options3, instantiationService, markdownRendererService, contextMenuService, contextKeyService);
    this.updateMessage(options3.message);
  }
  updateMessage(message) {
    this._renderedMessage?.remove();
    const renderedMessage = this._register(this._markdownRendererService.render(
      typeof message === "string" ? new MarkdownString(message) : message
    ));
    this.renderMessage(renderedMessage.element);
    this._renderedMessage = renderedMessage.element;
  }
};

SimpleChatConfirmationWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMarkdownRendererService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IContextKeyService)
], SimpleChatConfirmationWidget);

var BaseChatConfirmationWidget = class extends Disposable {
  constructor(_context, options3, instantiationService, markdownRendererService, contextMenuService, contextKeyService, chatMarkdownAnchorService) {
    super();
    this._context = _context;
    this.instantiationService = instantiationService;
    this.markdownRendererService = markdownRendererService;
    this.contextMenuService = contextMenuService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this._onDidClick = this._register(new Emitter());
    this._buttons = [];
    this.messageContentDisposables = this._register(new MutableDisposable());
    this.markdownContentPart = this._register(new MutableDisposable());
    const { title, subtitle, message, buttons, icon: icon2, footerBanner } = options3;
    this.fileWidgetOptions = options3.fileWidgetOptions;
    const elements = h(".chat-confirmation-widget-container@container", [
      h(".chat-confirmation-widget2@root", [
        h(".chat-confirmation-widget-title", [
          h(".chat-title@title"),
          h(".chat-toolbar-container@buttonsContainer", [
            h(".chat-toolbar@toolbar")
          ])
        ]),
        h(".chat-confirmation-widget-message@message"),
        h(".chat-confirmation-widget-buttons", [
          h(".chat-buttons@buttons")
        ])
      ])
    ]);
    configureAccessibilityContainer(elements.container, title, message, footerBanner);
    this._domNode = elements.root;
    this._buttonsDomNode = elements.buttons;
    this._register(instantiationService.createInstance(
      ChatQueryTitlePart,
      elements.title,
      new MarkdownString(icon2 ? `$(${icon2.id}) ${typeof title === "string" ? title : title.value}` : typeof title === "string" ? title : title.value),
      subtitle
    ));
    this.messageElement = elements.message;
    const messageParent = this.messageElement.parentElement;
    const messageNextSibling = this.messageElement.nextSibling;
    this.messageScrollable = this._register(new DomScrollableElement(this.messageElement, {
      vertical: 1 /* Auto */,
      horizontal: 2 /* Hidden */,
      consumeMouseWheelIfScrollbarIsNeeded: true
    }));
    this.messageScrollable.getDomNode().classList.add("chat-confirmation-widget-message-scrollable");
    messageParent?.insertBefore(this.messageScrollable.getDomNode(), messageNextSibling);
    const messageResizeObserver = this._register(new DisposableResizeObserver("BaseChatConfirmationWidget.message", () => this.messageScrollable.scanDomNode()));
    this._register(messageResizeObserver.observe(this.messageElement));
    this._register(messageResizeObserver.observe(this.messageScrollable.getDomNode()));
    if (footerBanner) {
      this.messageScrollable.getDomNode().insertAdjacentElement("afterend", footerBanner);
      if (!footerBanner.hasAttribute("aria-live")) {
        footerBanner.setAttribute("aria-live", "polite");
      }
    }
    this.updateButtons(buttons);
    if (options3?.toolbarData) {
      const overlay = contextKeyService.createOverlay([
        ["chatConfirmationPartType", options3.toolbarData.partType],
        ["chatConfirmationPartSource", options3.toolbarData.partSource]
      ]);
      const nestedInsta = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, overlay])));
      this._register(nestedInsta.createInstance(
        MenuWorkbenchToolBar,
        elements.toolbar,
        MenuId.ChatConfirmationMenu,
        {
          // buttonConfigProvider: () => ({ showLabel: false, showIcon: true }),
          menuOptions: {
            arg: options3.toolbarData.arg,
            shouldForwardArgs: true
          }
        }
      ));
    }
  }
  get onDidClick() {
    return this._onDidClick.event;
  }
  get domNode() {
    return this._domNode;
  }
  setShowButtons(showButton) {
    this.domNode.classList.toggle("hideButtons", !showButton);
  }
  get codeblocksPartId() {
    return this.markdownContentPart.value?.codeblocksPartId;
  }
  get codeblocks() {
    return this.markdownContentPart.value?.codeblocks;
  }
  updateButtons(buttons) {
    const focusedButton = this._buttons.find((button) => button.widget.hasFocus());
    const focusedDropdown = focusedButton?.widget instanceof ButtonWithDropdown && focusedButton.widget.dropdownButton.hasFocus();
    this._buttons = [];
    while (this._buttonsDomNode.children.length > 0) {
      this._buttonsDomNode.children[0].remove();
    }
    for (const buttonData of buttons) {
      const buttonOptions = { ...defaultButtonStyles, small: true, secondary: buttonData.isSecondary, title: buttonData.tooltip, disabled: buttonData.disabled };
      let button;
      if (buttonData.moreActions) {
        button = new ButtonWithDropdown(this._buttonsDomNode, {
          ...buttonOptions,
          contextMenuProvider: this.contextMenuService,
          addPrimaryActionToDropdown: false,
          actions: buttonData.moreActions.map((action) => {
            if (action instanceof Separator) {
              return action;
            }
            return this._register(new Action(
              action.label,
              action.label,
              void 0,
              !action.disabled,
              () => {
                this._onDidClick.fire({ button: action, isTouchClick: false });
                return Promise.resolve();
              }
            ));
          })
        });
      } else {
        button = new Button(this._buttonsDomNode, buttonOptions);
      }
      this._register(button);
      this._buttons.push({ label: buttonData.label, widget: button });
      button.label = buttonData.label;
      this._register(button.onDidClick((event) => this._onDidClick.fire({ button: buttonData, isTouchClick: !!event && event.type === EventType2.Tap })));
      if (buttonData.onDidChangeDisablement) {
        this._register(buttonData.onDidChangeDisablement((disabled) => button.enabled = !disabled));
      }
    }
    const buttonToFocus = focusedButton && this._buttons.find((button) => button.label === focusedButton.label)?.widget;
    if (focusedDropdown && buttonToFocus instanceof ButtonWithDropdown) {
      buttonToFocus.dropdownButton.focus();
    } else {
      buttonToFocus?.focus();
    }
  }
  renderMessage(element) {
    this.markdownContentPart.clear();
    if (!isHTMLElement(element)) {
      const part = this._register(this.instantiationService.createInstance(
        ChatMarkdownContentPart,
        {
          kind: "markdownContent",
          content: typeof element === "string" ? new MarkdownString().appendMarkdown(element) : element
        },
        this._context,
        this._context.editorPool,
        false,
        this._context.codeBlockStartIndex,
        this.markdownRendererService,
        void 0,
        this._context.currentWidth.get(),
        {
          allowInlineDiffs: true,
          horizontalPadding: 6
        }
      ));
      renderFileWidgets(part.domNode, this.instantiationService, this.chatMarkdownAnchorService, this._store, this.fileWidgetOptions);
      this.markdownContentPart.value = part;
      element = part.domNode;
    }
    clearNode(this.messageElement);
    const store = new DisposableStore();
    const messageContentResizeObserver = store.add(new DisposableResizeObserver("BaseChatConfirmationWidget.messageContent", () => this.messageScrollable.scanDomNode()));
    store.add(messageContentResizeObserver.observe(element));
    if (this.markdownContentPart.value) {
      store.add(this.markdownContentPart.value.onDidChangeHeight(() => this.messageScrollable.scanDomNode()));
    }
    this.messageContentDisposables.value = store;
    this.messageElement.append(element);
    this.messageScrollable.scanDomNode();
  }
};

BaseChatConfirmationWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMarkdownRendererService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IChatMarkdownAnchorService)
], BaseChatConfirmationWidget);

var ChatConfirmationWidget = class extends BaseChatConfirmationWidget {
  constructor(context2, options3, instantiationService, markdownRendererService, contextMenuService, contextKeyService, chatMarkdownAnchorService) {
    super(context2, options3, instantiationService, markdownRendererService, contextMenuService, contextKeyService, chatMarkdownAnchorService);
    this.renderMessage(options3.message);
  }
  updateMessage(message) {
    this._renderedMessage?.remove();
    const renderedMessage = this._register(this.markdownRendererService.render(
      typeof message === "string" ? new MarkdownString(message) : message
    ));
    this.renderMessage(renderedMessage.element);
    this._renderedMessage = renderedMessage.element;
  }
};

ChatConfirmationWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMarkdownRendererService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IChatMarkdownAnchorService)
], ChatConfirmationWidget);

var ChatCustomConfirmationWidget = class extends BaseChatConfirmationWidget {
  constructor(context2, options3, instantiationService, markdownRendererService, contextMenuService, contextKeyService, chatMarkdownAnchorService) {
    super(context2, options3, instantiationService, markdownRendererService, contextMenuService, contextKeyService, chatMarkdownAnchorService);
    this.renderMessage(options3.message);
  }
};

ChatCustomConfirmationWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMarkdownRendererService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IChatMarkdownAnchorService)
], ChatCustomConfirmationWidget);

function configureAccessibilityContainer(container3, title, message, footerBanner) {
  container3.tabIndex = 0;
  const titleAsString = typeof title === "string" ? title : title.value;
  const messageAsString = typeof message === "string" ? message : message && "value" in message ? message.value : message && "textContent" in message ? message.textContent : "";
  const bannerAsString = footerBanner?.textContent?.trim() ?? "";
  container3.setAttribute("aria-label", bannerAsString ? localize(11897, null, titleAsString, messageAsString, bannerAsString) : localize(11896, null, titleAsString, messageAsString));
  container3.classList.add("chat-confirmation-widget-container");
}
export { configureAccessibilityContainer, ChatQueryTitlePart, BaseSimpleChatConfirmationWidget, SimpleChatConfirmationWidget, BaseChatConfirmationWidget, ChatConfirmationWidget, ChatCustomConfirmationWidget };
