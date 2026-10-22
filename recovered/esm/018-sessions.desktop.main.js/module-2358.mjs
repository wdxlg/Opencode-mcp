// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/viewsWelcome/chatViewWelcomeController.ts
import { $, append, clearNode } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { Event2 } from "./module-0017.mjs";
import { chatViewsWelcomeRegistry } from "./module-2357.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { renderIcon } from "./module-0467.mjs";
import { URI } from "./module-0032.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { StringSHA1 } from "./module-0039.mjs";
import { createCSSRule } from "./module-0224.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ILogService } from "./module-0095.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";


// src/vs/workbench/contrib/chat/browser/viewsWelcome/chatViewWelcomeController.ts
var $55 = $;

var ChatViewWelcomeController = class extends Disposable {
  constructor(container2, delegate, location2, contextKeyService, instantiationService) {
    super();
    this.container = container2;
    this.delegate = delegate;
    this.location = location2;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.enabled = false;
    this.enabledDisposables = this._register(new DisposableStore());
    this.renderDisposables = this._register(new DisposableStore());
    this._isShowingWelcome = observableValue(this, false);
    this.element = append(this.container, $(".chat-view-welcome"));
    this._register(Event2.runAndSubscribe(
      delegate.onDidChangeViewWelcomeState,
      () => this.update()
    ));
    this._register(chatViewsWelcomeRegistry.onDidChange(() => this.update(true)));
  }
  get isShowingWelcome() {
    return this._isShowingWelcome;
  }
  getMatchingWelcomeView() {
    const descriptors = chatViewsWelcomeRegistry.get();
    const matchingDescriptors = descriptors.filter((descriptor) => this.contextKeyService.contextMatchesRules(descriptor.when));
    return matchingDescriptors.at(0);
  }
  update(force) {
    const enabled = this.delegate.shouldShowWelcome();
    if (this.enabled === enabled && !force) {
      return;
    }
    this.enabled = enabled;
    this.enabledDisposables.clear();
    if (!enabled) {
      this.container.classList.toggle("chat-view-welcome-visible", false);
      this.renderDisposables.clear();
      this._isShowingWelcome.set(false, void 0);
      return;
    }
    const descriptors = chatViewsWelcomeRegistry.get();
    if (descriptors.length) {
      this.render(descriptors);
      const descriptorKeys = new Set(descriptors.flatMap((d) => d.when.keys()));
      this.enabledDisposables.add(this.contextKeyService.onDidChangeContext((e4) => {
        if (e4.affectsSome(descriptorKeys)) {
          this.render(descriptors);
        }
      }));
    }
  }
  render(descriptors) {
    this.renderDisposables.clear();
    clearNode(this.element);
    const matchingDescriptors = descriptors.filter((descriptor) => this.contextKeyService.contextMatchesRules(descriptor.when));
    const enabledDescriptor = matchingDescriptors.at(0);
    if (enabledDescriptor) {
      const content = {
        icon: enabledDescriptor.icon,
        title: enabledDescriptor.title,
        message: enabledDescriptor.content
      };
      const welcomeView = this.renderDisposables.add(this.instantiationService.createInstance(ChatViewWelcomePart, content, { firstLinkToButton: true, location: this.location }));
      this.element.appendChild(welcomeView.element);
      this.container.classList.toggle("chat-view-welcome-visible", true);
      this._isShowingWelcome.set(true, void 0);
    } else {
      this.container.classList.toggle("chat-view-welcome-visible", false);
      this._isShowingWelcome.set(false, void 0);
    }
  }
};

ChatViewWelcomeController = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService)
], ChatViewWelcomeController);

var ChatViewWelcomePart = class extends Disposable {
  constructor(content, options3, openerService, logService, markdownRendererService) {
    super();
    this.content = content;
    this.openerService = openerService;
    this.logService = logService;
    this.markdownRendererService = markdownRendererService;
    this.element = $(".chat-welcome-view");
    try {
      const icon2 = append(this.element, $55(".chat-welcome-view-icon"));
      if (content.useLargeIcon) {
        icon2.classList.add("large-icon");
      }
      if (content.icon) {
        if (ThemeIcon.isThemeIcon(content.icon)) {
          const iconElement = renderIcon(content.icon);
          icon2.appendChild(iconElement);
        } else if (URI.isUri(content.icon)) {
          const cssUrl = asCSSUrl(content.icon);
          const hash2 = new StringSHA1();
          hash2.update(cssUrl);
          const iconId = `chat-welcome-icon-${hash2.digest()}`;
          const iconClass = `.chat-welcome-view-icon.${iconId}`;
          createCSSRule(iconClass, `
					mask: ${cssUrl} no-repeat 50% 50%;
					-webkit-mask: ${cssUrl} no-repeat 50% 50%;
					background-color: var(--vscode-icon-foreground);
				`);
          icon2.classList.add(iconId, "custom-icon");
        }
      }
      const title = append(this.element, $55(".chat-welcome-view-title"));
      title.textContent = content.title;
      const message = append(this.element, $55(".chat-welcome-view-message"));
      const messageResult = this.renderMarkdownMessageContent(content.message, options3);
      append(message, messageResult.element);
      if (content.additionalMessage) {
        const disclaimers = append(this.element, $55(".chat-welcome-view-disclaimer"));
        if (typeof content.additionalMessage === "string") {
          disclaimers.textContent = content.additionalMessage;
        } else {
          const additionalMessageResult = this.renderMarkdownMessageContent(content.additionalMessage, options3);
          disclaimers.appendChild(additionalMessageResult.element);
        }
      }
      if (content.tips) {
        const tips = append(this.element, $55(".chat-welcome-view-tips"));
        const tipsResult = this._register(this.markdownRendererService.render(content.tips));
        tips.appendChild(tipsResult.element);
      }
    } catch (err) {
      this.logService.error("Failed to render chat view welcome content", err);
    }
  }
  needsRerender(content) {
    return !!(this.content.title !== content.title || this.content.message.value !== content.message.value || this.content.additionalMessage !== content.additionalMessage || this.content.tips?.value !== content.tips?.value);
  }
  renderMarkdownMessageContent(content, options3) {
    const messageResult = this._register(this.markdownRendererService.render(content));
    const firstLink = options3?.firstLinkToButton ? messageResult.element.querySelector("a") : void 0;
    if (firstLink) {
      const target = firstLink.getAttribute("data-href");
      const button = this._register(new Button(firstLink.parentElement, defaultButtonStyles));
      button.label = firstLink.textContent ?? "";
      if (target) {
        this._register(button.onDidClick(() => {
          this.openerService.open(target, { allowCommands: true });
        }));
      }
      firstLink.replaceWith(button.element);
    }
    return messageResult;
  }
};

ChatViewWelcomePart = __decorateClass([
  __decorateParam(2, IOpenerService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IMarkdownRendererService)
], ChatViewWelcomePart);
export { $55, ChatViewWelcomeController, ChatViewWelcomePart };
