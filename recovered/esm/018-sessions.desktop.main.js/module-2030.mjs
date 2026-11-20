// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatSuggestNextWidget.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, addDisposableListener, append, isHTMLElement } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { getAgentCanContinueIn, getAgentSessionProvider, getAgentSessionProviderIcon, getAgentSessionProviderName } from "./module-0983.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatSuggestNextWidget.ts
var ChatSuggestNextWidget = class extends Disposable {
  constructor(configurationService, contextMenuService, chatSessionsService, contextKeyService) {
    super();
    this.configurationService = configurationService;
    this.contextMenuService = contextMenuService;
    this.chatSessionsService = chatSessionsService;
    this.contextKeyService = contextKeyService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._onDidSelectPrompt = this._register(new Emitter());
    this.onDidSelectPrompt = this._onDidSelectPrompt.event;
    this.buttonDisposables = /* @__PURE__ */ new Map();
    this.domNode = this.createSuggestNextWidget();
  }
  get height() {
    return this.domNode.style.display === "none" ? 0 : this.domNode.offsetHeight;
  }
  getCurrentMode() {
    return this._currentMode;
  }
  createSuggestNextWidget() {
    const container2 = $(".chat-suggest-next-widget.chat-welcome-view-suggested-prompts");
    container2.style.display = "none";
    this.titleElement = append(container2, $(".chat-welcome-view-suggested-prompts-title"));
    this.promptsContainer = container2;
    return container2;
  }
  render(mode) {
    const handoffs = mode.handOffs?.get();
    if (!handoffs || handoffs.length === 0) {
      this.hide();
      return;
    }
    this._currentMode = mode;
    const modeName = mode.name.get() || mode.label.get() || localize(12100, null);
    this.titleElement.textContent = localize(12101, null, modeName);
    const childrenToRemove = [];
    for (let i2 = 1; i2 < this.promptsContainer.children.length; i2++) {
      childrenToRemove.push(this.promptsContainer.children[i2]);
    }
    for (const child of childrenToRemove) {
      const disposables = this.buttonDisposables.get(child);
      if (disposables) {
        disposables.dispose();
        this.buttonDisposables.delete(child);
      }
      this.promptsContainer.removeChild(child);
    }
    for (const handoff of handoffs) {
      const promptButton = this.createPromptButton(handoff);
      this.promptsContainer.appendChild(promptButton);
    }
    this.domNode.style.display = "flex";
    this._onDidChangeHeight.fire();
  }
  createPromptButton(handoff) {
    const disposables = new DisposableStore();
    const handoffLabel = handoff.label;
    const getCurrentHandoff = () => {
      const currentHandoffs = this._currentMode?.handOffs?.get();
      return currentHandoffs?.find((h3) => h3.label === handoffLabel) ?? handoff;
    };
    const button = $(".chat-welcome-view-suggested-prompt");
    button.setAttribute("tabindex", "0");
    button.setAttribute("role", "button");
    button.setAttribute("aria-label", localize(12102, null, handoff.label));
    const titleElement = append(button, $(".chat-welcome-view-suggested-prompt-title"));
    titleElement.textContent = handoff.label;
    const showContinueOn = handoff.showContinueOn ?? true;
    const currentSessionType = this.contextKeyService.getContextKeyValue(ChatContextKeys.chatSessionType.key);
    const contributions = this.chatSessionsService.getAllChatSessionContributions();
    const availableContributions = contributions.filter((c) => {
      if (!c.canDelegate) {
        return false;
      }
      if (c.type === currentSessionType) {
        return false;
      }
      const provider = getAgentSessionProvider(c.type);
      return provider !== void 0 && getAgentCanContinueIn(provider);
    });
    if (showContinueOn && availableContributions.length > 0) {
      button.classList.add("chat-suggest-next-has-dropdown");
      const dropdownContainer = append(button, $(".chat-suggest-next-dropdown"));
      dropdownContainer.setAttribute("tabindex", "0");
      dropdownContainer.setAttribute("role", "button");
      dropdownContainer.setAttribute("aria-label", localize(12103, null, handoff.label));
      dropdownContainer.setAttribute("aria-haspopup", "true");
      const separator2 = append(dropdownContainer, $(".chat-suggest-next-separator"));
      separator2.setAttribute("aria-hidden", "true");
      const chevron = append(dropdownContainer, $(".codicon.codicon-chevron-down-compact.dropdown-chevron"));
      chevron.setAttribute("aria-hidden", "true");
      const showContextMenu = (e4, anchor) => {
        e4.preventDefault();
        e4.stopPropagation();
        const actions = availableContributions.map((contrib) => {
          const provider = getAgentSessionProvider(contrib.type);
          const icon2 = getAgentSessionProviderIcon(provider);
          const name = getAgentSessionProviderName(provider);
          return new Action(
            contrib.type,
            localize(12105, null, name),
            ThemeIcon.isThemeIcon(icon2) ? ThemeIcon.asClassName(icon2) : void 0,
            true,
            () => {
              const currentHandoff = getCurrentHandoff();
              if (currentHandoff) {
                this._onDidSelectPrompt.fire({ handoff: currentHandoff, agentId: contrib.name });
              }
            }
          );
        });
        this.contextMenuService.showContextMenu({
          getAnchor: () => anchor || dropdownContainer,
          getActions: () => actions,
          autoSelectFirstItem: true
        });
      };
      disposables.add(addDisposableListener(dropdownContainer, "click", (e4) => {
        showContextMenu(e4, dropdownContainer);
      }));
      disposables.add(addDisposableListener(dropdownContainer, "keydown", (e4) => {
        if (e4.key === "Enter" || e4.key === " ") {
          showContextMenu(e4, dropdownContainer);
        }
      }));
      disposables.add(addDisposableListener(button, "click", (e4) => {
        if (isHTMLElement(e4.target) && e4.target.closest(".chat-suggest-next-dropdown")) {
          return;
        }
        const currentHandoff = getCurrentHandoff();
        if (currentHandoff) {
          this._onDidSelectPrompt.fire({ handoff: currentHandoff });
        }
      }));
    } else {
      disposables.add(addDisposableListener(button, "click", () => {
        const currentHandoff = getCurrentHandoff();
        if (currentHandoff) {
          this._onDidSelectPrompt.fire({ handoff: currentHandoff });
        }
      }));
    }
    disposables.add(addDisposableListener(button, "keydown", (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        const currentHandoff = getCurrentHandoff();
        if (currentHandoff) {
          this._onDidSelectPrompt.fire({ handoff: currentHandoff });
        }
      }
    }));
    this.buttonDisposables.set(button, disposables);
    return button;
  }
  hide() {
    if (this.domNode.style.display !== "none") {
      this._currentMode = void 0;
      this.domNode.style.display = "none";
      this._onDidChangeHeight.fire();
    }
  }
  dispose() {
    for (const disposables of this.buttonDisposables.values()) {
      disposables.dispose();
    }
    this.buttonDisposables.clear();
    super.dispose();
  }
};

ChatSuggestNextWidget = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IChatSessionsService),
  __decorateParam(3, IContextKeyService)
], ChatSuggestNextWidget);
export { ChatSuggestNextWidget };
