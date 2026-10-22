// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/experiments/unifiedQuickAccess.ts
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, isDisposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions18 } from "./module-1552.mjs";
import { Event2 } from "./module-0017.mjs";
import { $, EventType, addDisposableListener } from "./module-0075.mjs";
import { createInstantHoverDelegate, getDefaultHoverDelegate } from "./module-0448.mjs";
import { Radio } from "./module-2555.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { ACTION_ID_NEW_CHAT, CHAT_OPEN_ACTION_ID } from "./module-1475.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/experiments/unifiedQuickAccess.ts
var SEND_TO_AGENT_ID = "unified-quick-access-send-to-agent";

var DEFAULT_UNIFIED_QUICK_ACCESS_TABS = [
  {
    id: "agentSessions",
    label: localize(9227, null),
    prefix: "agent ",
    placeholder: localize(9226, null),
    tooltip: localize(9228, null)
  },
  {
    id: "commands",
    label: localize(9230, null),
    prefix: ">",
    placeholder: localize(9229, null),
    tooltip: localize(9231, null)
  },
  {
    id: "files",
    label: localize(9233, null),
    prefix: "",
    placeholder: localize(9232, null),
    tooltip: localize(9234, null)
  }
];

var UnifiedQuickAccess = class extends Disposable {
  constructor(tabs, quickInputService, instantiationService, contextKeyService, layoutService, commandService, keybindingService, hoverService) {
    super();
    this.quickInputService = quickInputService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.layoutService = layoutService;
    this.commandService = commandService;
    this.keybindingService = keybindingService;
    this.hoverService = hoverService;
    this.registry = Registry.as(Extensions18.Quickaccess);
    this.mapProviderToDescriptor = /* @__PURE__ */ new Map();
    this._currentDisposables = this._register(new DisposableStore());
    this._providerDisposables = this._register(new DisposableStore());
    this._isInternalValueChange = false;
    // Flag to prevent recursive tab detection
    this._isUpdatingSendToAgent = false;
    this._tabs = tabs ?? DEFAULT_UNIFIED_QUICK_ACCESS_TABS;
  }
  /**
   * Show the unified quick access widget.
   * @param initialTabId Optional tab ID to start with. Defaults to first tab.
   * @param initialValue Optional initial filter value.
   */
  show(initialTabId, initialValue) {
    if (this._currentPicker) {
      return;
    }
    this._currentDisposables.clear();
    const picker = this._currentDisposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    this._currentPicker = picker;
    picker.ignoreFocusOut = false;
    picker.matchOnDescription = true;
    picker.matchOnDetail = true;
    picker.sortByLabel = false;
    const initialTab = initialTabId ? this._tabs.find((t2) => t2.id === initialTabId) ?? this._tabs[0] : this._tabs[0];
    this._currentTab = initialTab;
    this._injectTabBar(picker);
    this._isInternalValueChange = true;
    picker.value = initialValue ?? "";
    picker.placeholder = initialTab.placeholder;
    this._isInternalValueChange = false;
    this._activateProvider(initialTab, picker);
    this._currentDisposables.add(picker.onDidChangeValue((value2) => {
      if (this._isInternalValueChange) {
        return;
      }
      if (this._arrivedViaShortcut) {
        const shortcut = this._arrivedViaShortcut;
        if (!value2.startsWith(shortcut)) {
          const filesTab = this._tabs.find((t2) => t2.id === "files");
          if (filesTab && filesTab !== this._currentTab) {
            this._arrivedViaShortcut = void 0;
            this._switchTab(filesTab, picker, false);
            return;
          }
        }
      }
      const matchingTab = this._detectTabFromValue(value2);
      if (matchingTab && matchingTab !== this._currentTab) {
        this._switchTab(matchingTab, picker, true);
      }
      this._updateSendButtonState(value2);
      if (this._sendToAgentTimeout) {
        clearTimeout(this._sendToAgentTimeout);
      }
      this._sendToAgentTimeout = setTimeout(() => this._maybeShowSendToAgent(picker), 150);
    }));
    this._currentDisposables.add(picker.onDidAccept(() => {
      const selectedItems = picker.selectedItems;
      const activeItems = picker.activeItems;
      const sendToAgentSelected = selectedItems.length > 0 && selectedItems[0].id === SEND_TO_AGENT_ID;
      const hasRealActiveItem = activeItems.some(
        (item) => item.id !== SEND_TO_AGENT_ID
      );
      let filterText;
      if (this._arrivedViaShortcut && picker.value.startsWith(this._arrivedViaShortcut)) {
        filterText = picker.value.substring(1).trim();
      } else if (this._currentTab) {
        filterText = picker.value.substring(this._currentTab.prefix.length).trim();
      } else {
        filterText = picker.value.trim();
      }
      if (sendToAgentSelected || !hasRealActiveItem && filterText) {
        this._sendMessage(picker.value);
      }
    }));
    this._currentDisposables.add(picker.onDidHide(() => {
      this._providerDisposables.clear();
      this._providerCts?.cancel();
      this._providerCts = void 0;
      this._currentPicker = void 0;
      this._currentTab = void 0;
      this._arrivedViaShortcut = void 0;
      if (this._sendToAgentTimeout) {
        clearTimeout(this._sendToAgentTimeout);
        this._sendToAgentTimeout = void 0;
      }
      this._tabBarContainer?.remove();
      this._tabBarContainer = void 0;
      this._sendButton = void 0;
      this._sendButtonLabel = void 0;
      this._sendButtonIcon = void 0;
      this._sendButtonHover = void 0;
      this._currentDisposables.clear();
    }));
    picker.show();
  }
  /**
   * Hide the unified quick access widget if visible.
   */
  hide() {
    this._currentPicker?.hide();
  }
  /**
   * Check if the widget is currently visible.
   */
  get isVisible() {
    return !!this._currentPicker;
  }
  /**
   * Inject the custom tab bar into the picker's header area.
   */
  _injectTabBar(picker) {
    const showDisposable = this._currentDisposables.add(Event2.once(this.quickInputService.onShow)(() => {
      this._currentDisposables.delete(showDisposable);
      const quickInputWidget = this.layoutService.activeContainer.querySelector(".quick-input-widget");
      if (!quickInputWidget) {
        return;
      }
      const header2 = quickInputWidget.querySelector(".quick-input-header");
      const list2 = quickInputWidget.querySelector(".quick-input-list");
      if (!header2 || !list2) {
        return;
      }
      const tabBarContainer = $("div.unified-quick-access-tabs");
      this._tabBarContainer = tabBarContainer;
      const hoverDelegate = this._currentDisposables.add(createInstantHoverDelegate());
      const radioItems = this._tabs.map((tab) => ({
        text: tab.label,
        tooltip: tab.tooltip,
        isActive: tab === this._currentTab
      }));
      const radio = this._currentDisposables.add(new Radio({
        items: radioItems,
        hoverDelegate
      }));
      tabBarContainer.appendChild(radio.domNode);
      this._currentDisposables.add(radio.onDidSelect((index2) => {
        const selectedTab = this._tabs[index2];
        if (selectedTab && selectedTab !== this._currentTab) {
          this._switchTab(selectedTab, picker, false);
        }
      }));
      const sendButton = this._createSendButton(picker);
      tabBarContainer.appendChild(sendButton);
      list2.parentElement?.insertBefore(tabBarContainer, list2);
      picker._unifiedRadio = radio;
    }));
  }
  /**
   * Create the send button.
   */
  _createSendButton(picker) {
    const container2 = $("div.unified-quick-access-send-container");
    const button = $("button.unified-send-button");
    button.setAttribute("type", "button");
    this._sendButton = button;
    const icon2 = renderIcon(Codicon.send);
    icon2.classList.add("unified-send-icon");
    this._sendButtonIcon = icon2;
    button.appendChild(icon2);
    const labelSpan = $("span.unified-send-label");
    this._sendButtonLabel = labelSpan;
    button.appendChild(labelSpan);
    container2.appendChild(button);
    this._sendButtonHover = this._currentDisposables.add(
      this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), button, "")
    );
    this._updateSendButtonState(picker.value);
    this._currentDisposables.add(addDisposableListener(button, EventType.CLICK, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      const hasInput = picker.value.trim().length > 0;
      if (hasInput) {
        this._sendMessageRaw(picker.value);
      } else {
        this._openChat();
      }
    }));
    return container2;
  }
  /**
   * Update the send button label and tooltip based on input state.
   */
  _updateSendButtonState(value2) {
    if (!this._sendButton || !this._sendButtonLabel || !this._sendButtonIcon) {
      return;
    }
    const hasInput = value2.trim().length > 0;
    if (hasInput) {
      this._sendButtonLabel.textContent = localize(9240, null);
      this._sendButtonHover?.update(localize(9243, null));
      this._sendButtonIcon.style.display = "";
    } else {
      const openChatKeybinding = this.keybindingService.lookupKeybinding(CHAT_OPEN_ACTION_ID);
      const openChatLabel = openChatKeybinding?.getLabel() ?? "";
      this._sendButtonLabel.textContent = localize(9236, null);
      const tooltip = openChatLabel ? localize(9238, null, openChatLabel) : localize(9237, null);
      this._sendButtonHover?.update(tooltip);
      this._sendButtonIcon.style.display = "none";
    }
  }
  /**
   * Open chat without sending a message.
   */
  _openChat() {
    this.hide();
    this.commandService.executeCommand(CHAT_OPEN_ACTION_ID);
  }
  /**
   * Send the exact message to a new agent session (no prefix stripping).
   */
  async _sendMessageRaw(value2) {
    const message = value2.trim();
    if (!message) {
      return;
    }
    this.hide();
    await this.commandService.executeCommand(ACTION_ID_NEW_CHAT);
    const options3 = {
      query: message,
      isPartialQuery: false
    };
    this.commandService.executeCommand(CHAT_OPEN_ACTION_ID, options3);
  }
  /**
   * Send the current message to a new agent session (strips prefix or shortcut character).
   */
  async _sendMessage(value2) {
    let message = value2;
    if (this._arrivedViaShortcut && message.startsWith(this._arrivedViaShortcut)) {
      message = message.substring(1).trim();
    } else if (this._currentTab) {
      if (value2.startsWith(this._currentTab.prefix)) {
        message = value2.substring(this._currentTab.prefix.length).trim();
      }
    }
    if (!message) {
      return;
    }
    this.hide();
    await this.commandService.executeCommand(ACTION_ID_NEW_CHAT);
    const options3 = {
      query: message,
      isPartialQuery: false
    };
    this.commandService.executeCommand(CHAT_OPEN_ACTION_ID, options3);
  }
  /**
   * Check if we should show the "send to agent" item.
   * Always shows it as the first item when user has typed something.
   */
  _maybeShowSendToAgent(picker) {
    if (this._isUpdatingSendToAgent) {
      return;
    }
    let filterText;
    if (this._arrivedViaShortcut && picker.value.startsWith(this._arrivedViaShortcut)) {
      filterText = picker.value.substring(1).trim();
    } else if (this._currentTab) {
      filterText = picker.value.substring(this._currentTab.prefix.length).trim();
    } else {
      filterText = picker.value.trim();
    }
    const fullInput = picker.value.trim();
    const messageToSend = filterText || fullInput;
    if (!messageToSend) {
      return;
    }
    if (picker.busy) {
      return;
    }
    const firstItem = picker.items[0];
    if (firstItem?.id === SEND_TO_AGENT_ID && firstItem.description === fullInput) {
      return;
    }
    const sendItem = {
      id: SEND_TO_AGENT_ID,
      label: `$(send) ${localize(9242, null)}`,
      description: fullInput,
      alwaysShow: true,
      ariaLabel: localize(9241, null, fullInput)
    };
    const currentItems = picker.items.filter(
      (item) => item.id !== SEND_TO_AGENT_ID
    );
    const isSessionsTab = this._currentTab?.id === "agentSessions";
    const hasOtherItems = currentItems.length > 0;
    const showFirst = isSessionsTab || !hasOtherItems;
    this._isUpdatingSendToAgent = true;
    try {
      if (showFirst) {
        picker.items = [sendItem, ...currentItems];
      } else {
        picker.items = currentItems;
      }
    } finally {
      this._isUpdatingSendToAgent = false;
    }
  }
  /**
   * Switch to a different tab.
   */
  _switchTab(tab, picker, preserveFilterText) {
    if (tab === this._currentTab) {
      return;
    }
    const previousTab = this._currentTab;
    this._currentTab = tab;
    const radio = picker._unifiedRadio;
    if (radio) {
      const index2 = this._tabs.indexOf(tab);
      if (index2 >= 0) {
        radio.setActiveItem(index2);
      }
    }
    this._isInternalValueChange = true;
    if (preserveFilterText && previousTab) {
      const currentValue = picker.value;
      let filterText = currentValue;
      if (currentValue.startsWith(previousTab.prefix)) {
        filterText = currentValue.substring(previousTab.prefix.length);
      }
      if (this._arrivedViaShortcut === "<" && tab.id === "agentSessions") {
        filterText = filterText.replace(/^<+/, "");
        picker.value = "<" + filterText;
      } else if (this._arrivedViaShortcut === ">" && tab.id === "commands") {
        filterText = filterText.replace(/^>+/, "");
        picker.value = ">" + filterText;
      } else {
        picker.value = tab.prefix + filterText;
      }
    } else if (previousTab) {
      const currentValue = picker.value;
      if (currentValue.startsWith(previousTab.prefix)) {
        picker.value = currentValue.substring(previousTab.prefix.length);
      }
      if (picker.value.startsWith("<") || picker.value.startsWith(">")) {
        picker.value = picker.value.substring(1);
      }
      this._arrivedViaShortcut = void 0;
    }
    this._isInternalValueChange = false;
    picker.placeholder = tab.placeholder;
    this._activateProvider(tab, picker);
  }
  /**
   * Detect which tab matches the current value based on prefix.
   * Only switches away from current tab if user explicitly typed a different prefix.
   * Supports shortcut keys: ">" for Commands, "<" for Sessions.
   */
  _detectTabFromValue(value2) {
    if (value2 === "<" || value2.startsWith("<")) {
      const sessionsTab = this._tabs.find((t2) => t2.id === "agentSessions");
      if (sessionsTab && this._currentTab?.id !== "agentSessions") {
        this._arrivedViaShortcut = "<";
        return sessionsTab;
      }
    }
    if (value2 === ">" || value2.startsWith(">")) {
      const commandsTab = this._tabs.find((t2) => t2.id === "commands");
      if (commandsTab && this._currentTab?.id !== "commands") {
        this._arrivedViaShortcut = ">";
        return commandsTab;
      }
    }
    if (this._currentTab && value2.startsWith(this._currentTab.prefix)) {
      return this._currentTab;
    }
    const sortedTabs = [...this._tabs].filter((tab) => tab.prefix.length > 0).sort((a, b) => b.prefix.length - a.prefix.length);
    return sortedTabs.find((tab) => value2.startsWith(tab.prefix));
  }
  /**
   * Activate the provider for a given tab.
   */
  _activateProvider(tab, picker) {
    this._providerDisposables.clear();
    this._providerCts?.cancel();
    this._providerCts = new CancellationTokenSource();
    this._providerDisposables.add(this._providerCts);
    if (tab.isSendTab) {
      picker.busy = false;
      picker.items = [{
        label: localize(9239, null),
        alwaysShow: true
      }];
      return;
    }
    picker.items = [];
    picker.busy = true;
    const [provider] = this._getOrInstantiateProvider(tab.prefix);
    if (provider) {
      const tabPrefix = tab.prefix;
      const arrivedViaShortcut = this._arrivedViaShortcut;
      picker.filterValue = (value2) => {
        if (arrivedViaShortcut && value2.startsWith(arrivedViaShortcut)) {
          return value2.substring(1);
        }
        if (value2.startsWith(tabPrefix)) {
          return value2.substring(tabPrefix.length);
        }
        return value2;
      };
      const providerDisposable = provider.provide(picker, this._providerCts.token);
      this._providerDisposables.add(providerDisposable);
    } else {
      picker.busy = false;
      picker.items = [{
        label: localize(9235, null),
        alwaysShow: true
      }];
    }
  }
  /**
   * Get or create a provider instance for the given prefix.
   */
  _getOrInstantiateProvider(prefix) {
    const providerDescriptor = this.registry.getQuickAccessProvider(prefix, this.contextKeyService);
    if (!providerDescriptor) {
      return [void 0, void 0];
    }
    let provider = this.mapProviderToDescriptor.get(providerDescriptor);
    if (!provider) {
      provider = this.instantiationService.createInstance(providerDescriptor.ctor);
      this.mapProviderToDescriptor.set(providerDescriptor, provider);
    }
    return [provider, providerDescriptor];
  }
  dispose() {
    this._providerCts?.cancel();
    for (const provider of this.mapProviderToDescriptor.values()) {
      if (isDisposable(provider)) {
        provider.dispose();
      }
    }
    super.dispose();
  }
};

UnifiedQuickAccess = __decorateClass([
  __decorateParam(1, IQuickInputService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ILayoutService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, IHoverService)
], UnifiedQuickAccess);
export { SEND_TO_AGENT_ID, DEFAULT_UNIFIED_QUICK_ACCESS_TABS, UnifiedQuickAccess };
