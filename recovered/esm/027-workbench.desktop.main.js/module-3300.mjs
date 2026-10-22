// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalTabbedView.ts
import { $, EventType, addDisposableListener, disposableWindowInterval, getWindow, isActiveElement } from "./module-0075.mjs";
import { Disposable, dispose } from "./module-0012.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { TerminalTabList } from "./module-3271.mjs";
import { TerminalTabsChatEntry } from "./module-3299.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { Event2 } from "./module-0017.mjs";
import { TerminalContribContextKeyStrings } from "./module-1172.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { openContextMenu } from "./module-3268.mjs";
import { containsDragType } from "./module-0273.mjs";
import { getTerminalResourcesFromDragEvent, parseTerminalUri } from "./module-2158.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { getInstanceHoverInfo } from "./module-3269.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalChatService, ITerminalConfigurationService, ITerminalGroupService, ITerminalService } from "./module-1149.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalTabbedView.ts
var $106 = $;

var TerminalTabbedView = class extends Disposable {
  constructor(parentElement, _terminalService, _terminalChatService, _terminalConfigurationService, _terminalGroupService, _instantiationService, _contextMenuService, _configurationService, menuService, _storageService, contextKeyService, _hoverService) {
    super();
    this._terminalService = _terminalService;
    this._terminalChatService = _terminalChatService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._terminalGroupService = _terminalGroupService;
    this._instantiationService = _instantiationService;
    this._contextMenuService = _contextMenuService;
    this._configurationService = _configurationService;
    this._storageService = _storageService;
    this._hoverService = _hoverService;
    this._cancelContextMenu = false;
    this._emptyAreaDropTargetCount = 0;
    this._tabContainer = $106(".tabs-container");
    const tabListContainer = $106(".tabs-list-container");
    this._tabListContainer = tabListContainer;
    this._tabListElement = $106(".tabs-list");
    tabListContainer.appendChild(this._tabListElement);
    this._tabContainer.appendChild(tabListContainer);
    this._instanceMenu = this._register(menuService.createMenu(MenuId.TerminalInstanceContext, contextKeyService));
    this._tabsListMenu = this._register(menuService.createMenu(MenuId.TerminalTabContext, contextKeyService));
    this._tabsListEmptyMenu = this._register(menuService.createMenu(MenuId.TerminalTabEmptyAreaContext, contextKeyService));
    this._tabList = this._register(this._instantiationService.createInstance(TerminalTabList, this._tabListElement));
    this._tabListDomElement = this._tabList.getHTMLElement();
    this._chatEntry = this._register(this._instantiationService.createInstance(TerminalTabsChatEntry, tabListContainer, this._tabContainer));
    const terminalOuterContainer = $106(".terminal-outer-container");
    this._terminalContainer = $106(".terminal-groups-container");
    terminalOuterContainer.appendChild(this._terminalContainer);
    this._terminalService.setContainers(parentElement, this._terminalContainer);
    this._terminalIsTabsNarrowContextKey = TerminalContextKeys.tabsNarrow.bindTo(contextKeyService);
    this._terminalTabsFocusContextKey = TerminalContextKeys.tabsFocus.bindTo(contextKeyService);
    this._terminalTabsMouseContextKey = TerminalContextKeys.tabsMouse.bindTo(contextKeyService);
    this._tabTreeIndex = this._terminalConfigurationService.config.tabs.location === "left" ? 0 : 1;
    this._terminalContainerIndex = this._terminalConfigurationService.config.tabs.location === "left" ? 1 : 0;
    this._register(_configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminal.integrated.tabs.enabled" /* TabsEnabled */) || e.affectsConfiguration("terminal.integrated.tabs.hideCondition" /* TabsHideCondition */)) {
        this._refreshShowTabs();
      } else if (e.affectsConfiguration("terminal.integrated.tabs.location" /* TabsLocation */)) {
        this._tabTreeIndex = this._terminalConfigurationService.config.tabs.location === "left" ? 0 : 1;
        this._terminalContainerIndex = this._terminalConfigurationService.config.tabs.location === "left" ? 1 : 0;
        if (this._shouldShowTabs()) {
          this._splitView.swapViews(0, 1);
          this._removeSashListener();
          this._addSashListener();
          this._splitView.resizeView(this._tabTreeIndex, this._getLastListWidth());
        }
      }
    }));
    this._register(Event2.any(this._terminalGroupService.onDidChangeInstances, this._terminalGroupService.onDidChangeGroups)(() => {
      this._refreshShowTabs();
      this._updateChatTerminalsEntry();
    }));
    this._register(Event2.any(this._terminalChatService.onDidRegisterTerminalInstanceWithToolSession, this._terminalService.onDidChangeInstances, this._terminalService.onDidDisposeInstance)(() => {
      this._refreshShowTabs();
      this._updateChatTerminalsEntry();
    }));
    this._register(contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(/* @__PURE__ */ new Set([TerminalContribContextKeyStrings.ChatHasHiddenTerminals]))) {
        this._refreshShowTabs();
        this._updateChatTerminalsEntry();
      }
    }));
    this._attachEventListeners(parentElement, this._terminalContainer);
    this._register(this._terminalGroupService.onDidChangePanelOrientation((orientation) => {
      this._panelOrientation = orientation;
      if (this._panelOrientation === 0 /* VERTICAL */) {
        this._terminalContainer.classList.add("terminal-side-view" /* ViewIsVertical */);
      } else {
        this._terminalContainer.classList.remove("terminal-side-view" /* ViewIsVertical */);
      }
    }));
    this._splitView = new SplitView(parentElement, { orientation: 1 /* HORIZONTAL */, proportionalLayout: false });
    this._setupSplitView(terminalOuterContainer);
    this._updateChatTerminalsEntry();
  }
  _shouldShowTabs() {
    const enabled = this._terminalConfigurationService.config.tabs.enabled;
    const hide4 = this._terminalConfigurationService.config.tabs.hideCondition;
    const hiddenChatTerminals = this._terminalChatService.getToolSessionTerminalInstances(true);
    if (!enabled) {
      return false;
    }
    if (hiddenChatTerminals.length > 0) {
      return true;
    }
    switch (hide4) {
      case "never":
        return true;
      case "singleTerminal":
        if (this._terminalGroupService.instances.length > 1) {
          return true;
        }
        break;
      case "singleGroup":
        if (this._terminalGroupService.groups.length > 1) {
          return true;
        }
        break;
    }
    return false;
  }
  _refreshShowTabs() {
    if (this._shouldShowTabs()) {
      if (this._splitView.length === 1) {
        this._addTabTree();
        this._addSashListener();
        this._splitView.resizeView(this._tabTreeIndex, this._getLastListWidth());
        this.rerenderTabs();
      }
    } else {
      if (this._splitView.length === 2 && !this._terminalTabsMouseContextKey.get()) {
        this._splitView.removeView(this._tabTreeIndex);
        this._plusButton?.remove();
        this._removeSashListener();
      }
    }
  }
  _updateChatTerminalsEntry() {
    this._chatEntry?.update();
  }
  _getLastListWidth() {
    const widthKey = this._panelOrientation === 0 /* VERTICAL */ ? "tabs-list-width-vertical" /* TabsListWidthVertical */ : "tabs-list-width-horizontal" /* TabsListWidthHorizontal */;
    const storedValue = this._storageService.get(widthKey, 0 /* PROFILE */);
    if (!storedValue || !parseInt(storedValue)) {
      return this._panelOrientation === 0 /* VERTICAL */ ? 46 /* NarrowViewWidth */ : 120 /* DefaultWidth */;
    }
    return parseInt(storedValue);
  }
  _handleOnDidSashReset() {
    let idealWidth = 80 /* WideViewMinimumWidth */;
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = 1;
    offscreenCanvas.height = 1;
    const ctx = offscreenCanvas.getContext("2d");
    if (ctx) {
      const style = getWindow(this._tabListElement).getComputedStyle(this._tabListElement);
      ctx.font = `${style.fontStyle} ${style.fontSize} ${style.fontFamily}`;
      const maxInstanceWidth = this._terminalGroupService.instances.reduce((p, c) => {
        return Math.max(p, ctx.measureText(c.title + (c.description || "")).width + this._getAdditionalWidth(c));
      }, 0);
      idealWidth = Math.ceil(Math.max(maxInstanceWidth, 80 /* WideViewMinimumWidth */));
    }
    const currentWidth = Math.ceil(this._splitView.getViewSize(this._tabTreeIndex));
    if (currentWidth === idealWidth) {
      idealWidth = 46 /* NarrowViewWidth */;
    }
    this._splitView.resizeView(this._tabTreeIndex, idealWidth);
    this._updateListWidth(idealWidth);
  }
  _getAdditionalWidth(instance2) {
    const additionalWidth = 40;
    const statusIconWidth = instance2.statusList.statuses.length > 0 ? 30 /* StatusIcon */ : 0;
    const splitAnnotationWidth = (this._terminalGroupService.getGroupForInstance(instance2)?.terminalInstances.length || 0) > 1 ? 30 /* SplitAnnotation */ : 0;
    return additionalWidth + splitAnnotationWidth + statusIconWidth;
  }
  _handleOnDidSashChange() {
    const listWidth = this._splitView.getViewSize(this._tabTreeIndex);
    if (!this._width || listWidth <= 0) {
      return;
    }
    this._updateListWidth(listWidth);
  }
  _updateListWidth(width2) {
    if (width2 < 63 /* MidpointViewWidth */ && width2 >= 46 /* NarrowViewWidth */) {
      width2 = 46 /* NarrowViewWidth */;
      this._splitView.resizeView(this._tabTreeIndex, width2);
    } else if (width2 >= 63 /* MidpointViewWidth */ && width2 < 80 /* WideViewMinimumWidth */) {
      width2 = 80 /* WideViewMinimumWidth */;
      this._splitView.resizeView(this._tabTreeIndex, width2);
    }
    this.rerenderTabs();
    const widthKey = this._panelOrientation === 0 /* VERTICAL */ ? "tabs-list-width-vertical" /* TabsListWidthVertical */ : "tabs-list-width-horizontal" /* TabsListWidthHorizontal */;
    this._storageService.store(widthKey, width2, 0 /* PROFILE */, 0 /* USER */);
  }
  _setupSplitView(terminalOuterContainer) {
    this._register(this._splitView.onDidSashReset(() => this._handleOnDidSashReset()));
    this._register(this._splitView.onDidSashChange(() => this._handleOnDidSashChange()));
    if (this._shouldShowTabs()) {
      this._addTabTree();
    }
    this._splitView.addView({
      element: terminalOuterContainer,
      layout: (width2) => this._terminalGroupService.groups.forEach((tab) => tab.layout(width2, this._height || 0)),
      minimumSize: 120,
      maximumSize: Number.POSITIVE_INFINITY,
      onDidChange: () => Disposable.None,
      priority: 2 /* High */
    }, Sizing.Distribute, this._terminalContainerIndex);
    if (this._shouldShowTabs()) {
      this._addSashListener();
    }
  }
  _addTabTree() {
    this._splitView.addView({
      element: this._tabContainer,
      layout: (width2) => this._tabList.layout(this._height || 0, width2),
      minimumSize: 46 /* NarrowViewWidth */,
      maximumSize: 500 /* MaximumWidth */,
      onDidChange: () => Disposable.None,
      priority: 1 /* Low */
    }, Sizing.Distribute, this._tabTreeIndex);
    this.rerenderTabs();
  }
  rerenderTabs() {
    this._updateHasText();
    this._tabList.refresh();
  }
  _addSashListener() {
    let interval;
    this._sashDisposables = [
      this._splitView.sashes[0].onDidStart((e) => {
        interval = disposableWindowInterval(getWindow(this._splitView.el), () => {
          this.rerenderTabs();
        }, 100);
      }),
      this._splitView.sashes[0].onDidEnd((e) => {
        interval.dispose();
      })
    ];
  }
  _removeSashListener() {
    if (this._sashDisposables) {
      dispose(this._sashDisposables);
      this._sashDisposables = void 0;
    }
  }
  _updateHasText() {
    const hasText = this._tabListElement.clientWidth > 63 /* MidpointViewWidth */;
    this._tabContainer.classList.toggle("has-text", hasText);
    this._terminalIsTabsNarrowContextKey.set(!hasText);
    this._updateChatTerminalsEntry();
  }
  layout(width2, height) {
    const chatItemHeight = this._chatEntry?.element.style.display === "none" ? 0 : this._chatEntry?.element.clientHeight;
    this._height = height - (chatItemHeight ?? 0);
    this._width = width2;
    this._splitView.layout(width2);
    if (this._shouldShowTabs()) {
      this._splitView.resizeView(this._tabTreeIndex, this._getLastListWidth());
    }
    this._updateHasText();
  }
  _attachEventListeners(parentDomElement, terminalContainer) {
    this._register(addDisposableListener(this._tabContainer, "mouseleave", async (event) => {
      this._terminalTabsMouseContextKey.set(false);
      this._refreshShowTabs();
      event.stopPropagation();
    }));
    this._register(addDisposableListener(this._tabContainer, "mouseenter", async (event) => {
      this._terminalTabsMouseContextKey.set(true);
      event.stopPropagation();
    }));
    this._register(addDisposableListener(this._tabContainer, "dragenter", (event) => {
      if (!this._shouldHandleEmptyAreaDrop(event)) {
        this._resetEmptyAreaDropState();
        return;
      }
      this._emptyAreaDropTargetCount++;
      this._setEmptyAreaDropState(true);
    }));
    this._register(addDisposableListener(this._tabContainer, "dragover", (event) => {
      if (!this._shouldHandleEmptyAreaDrop(event)) {
        this._resetEmptyAreaDropState();
        return;
      }
      event.preventDefault();
      this._setEmptyAreaDropState(true);
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    }));
    this._register(addDisposableListener(this._tabContainer, "dragleave", (event) => {
      if (!this._shouldHandleEmptyAreaDrop(event)) {
        if (!this._tabContainer.contains(event.relatedTarget)) {
          this._resetEmptyAreaDropState();
        }
        return;
      }
      if (this._tabContainer.contains(event.relatedTarget)) {
        return;
      }
      this._emptyAreaDropTargetCount = Math.max(0, this._emptyAreaDropTargetCount - 1);
      if (this._emptyAreaDropTargetCount === 0) {
        this._resetEmptyAreaDropState();
      }
    }));
    this._register(addDisposableListener(this._tabContainer, "drop", (event) => {
      if (!this._shouldHandleEmptyAreaDrop(event)) {
        return;
      }
      void this._handleContainerDrop(event);
    }));
    this._register(addDisposableListener(terminalContainer, "mousedown", async (event) => {
      const terminal2 = this._terminalGroupService.activeInstance;
      if (this._terminalGroupService.instances.length > 0 && terminal2) {
        const result = await terminal2.handleMouseEvent(event, this._instanceMenu);
        if (typeof result === "object" && result.cancelContextMenu) {
          this._cancelContextMenu = true;
        }
      }
    }));
    this._register(addDisposableListener(terminalContainer, "contextmenu", (event) => {
      const rightClickBehavior = this._terminalConfigurationService.config.rightClickBehavior;
      if (rightClickBehavior === "nothing" && !event.shiftKey) {
        this._cancelContextMenu = true;
      }
      terminalContainer.focus();
      if (!this._cancelContextMenu) {
        openContextMenu(getWindow(terminalContainer), event, this._terminalGroupService.activeInstance, this._instanceMenu, this._contextMenuService);
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      this._cancelContextMenu = false;
    }));
    this._register(addDisposableListener(this._tabContainer, "contextmenu", (event) => {
      const rightClickBehavior = this._terminalConfigurationService.config.rightClickBehavior;
      if (rightClickBehavior === "nothing" && !event.shiftKey) {
        this._cancelContextMenu = true;
      }
      if (!this._cancelContextMenu) {
        const emptyList = this._tabList.getFocus().length === 0;
        if (!emptyList) {
          this._terminalGroupService.lastAccessedMenu = "tab-list";
        }
        const selectedInstances = this._tabList.getSelectedElements();
        const focusedInstance = this._tabList.getFocusedElements()?.[0];
        if (focusedInstance) {
          selectedInstances.splice(selectedInstances.findIndex((e) => e.instanceId === focusedInstance.instanceId), 1);
          selectedInstances.unshift(focusedInstance);
        }
        openContextMenu(getWindow(this._tabContainer), event, selectedInstances, emptyList ? this._tabsListEmptyMenu : this._tabsListMenu, this._contextMenuService, emptyList ? this._getTabActions() : void 0);
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      this._cancelContextMenu = false;
    }));
    this._register(addDisposableListener(terminalContainer.ownerDocument, "keydown", (event) => {
      terminalContainer.classList.toggle("alt-active", !!event.altKey);
    }));
    this._register(addDisposableListener(terminalContainer.ownerDocument, "keyup", (event) => {
      terminalContainer.classList.toggle("alt-active", !!event.altKey);
    }));
    this._register(addDisposableListener(parentDomElement, "keyup", (event) => {
      if (event.keyCode === 27) {
        event.stopPropagation();
      }
    }));
    this._register(addDisposableListener(this._tabContainer, EventType.FOCUS_IN, () => {
      this._terminalTabsFocusContextKey.set(true);
    }));
    this._register(addDisposableListener(this._tabContainer, EventType.FOCUS_OUT, () => {
      this._terminalTabsFocusContextKey.set(false);
    }));
  }
  _shouldHandleEmptyAreaDrop(event) {
    const targetNode = event.target;
    if (targetNode && (this._tabListDomElement.contains(targetNode) || this._tabListElement.contains(targetNode))) {
      return false;
    }
    return !!event.dataTransfer && containsDragType(event, "Terminals" /* Terminals */);
  }
  _setEmptyAreaDropState(active) {
    this._tabListContainer.classList.toggle("drop-target", active);
    this._tabContainer.classList.toggle("drop-target", active);
    this._chatEntry?.element.classList.toggle("drop-target", active);
  }
  _resetEmptyAreaDropState() {
    this._emptyAreaDropTargetCount = 0;
    this._setEmptyAreaDropState(false);
  }
  async _handleContainerDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this._resetEmptyAreaDropState();
    const primaryBackend = this._terminalService.getPrimaryBackend();
    const resources = getTerminalResourcesFromDragEvent(event);
    let sourceInstances;
    const promises = [];
    if (resources) {
      for (const uri5 of resources) {
        const instance2 = this._terminalService.getInstanceFromResource(uri5);
        if (instance2) {
          if (sourceInstances) {
            sourceInstances.push(instance2);
          } else {
            sourceInstances = [instance2];
          }
          this._terminalService.moveToTerminalView(instance2);
        } else if (primaryBackend) {
          const terminalIdentifier = parseTerminalUri(uri5);
          if (terminalIdentifier.instanceId) {
            promises.push(primaryBackend.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId));
          }
        }
      }
    }
    if (promises.length) {
      const processes = (await Promise.all(promises)).filter((process3) => !!process3);
      let lastInstance;
      for (const attachPersistentProcess of processes) {
        lastInstance = await this._terminalService.createTerminal({ config: { attachPersistentProcess } });
      }
      if (lastInstance) {
        this._terminalService.setActiveInstance(lastInstance);
      }
      return;
    }
    if (!sourceInstances || !sourceInstances.length) {
      sourceInstances = this._tabList.getSelectedElements();
      if (!sourceInstances.length) {
        return;
      }
    }
    this._terminalGroupService.moveGroupToEnd(sourceInstances);
    this._terminalService.setActiveInstance(sourceInstances[0]);
    const indexes = sourceInstances.map((instance2) => this._terminalGroupService.instances.indexOf(instance2)).filter((index2) => index2 >= 0);
    if (indexes.length) {
      this._tabList.setSelection(indexes);
      this._tabList.setFocus([indexes[0]]);
    }
  }
  _getTabActions() {
    return [
      new Separator(),
      this._configurationService.inspect("terminal.integrated.tabs.location" /* TabsLocation */).userValue === "left" ? new Action("moveRight", localize(20078, null), void 0, void 0, async () => {
        this._configurationService.updateValue("terminal.integrated.tabs.location" /* TabsLocation */, "right");
      }) : new Action("moveLeft", localize(20077, null), void 0, void 0, async () => {
        this._configurationService.updateValue("terminal.integrated.tabs.location" /* TabsLocation */, "left");
      }),
      new Action("hideTabs", localize(20076, null), void 0, void 0, async () => {
        this._configurationService.updateValue("terminal.integrated.tabs.enabled" /* TabsEnabled */, false);
      })
    ];
  }
  setEditable(isEditing) {
    if (!isEditing) {
      this._tabList.domFocus();
    }
    this._tabList.refresh(false);
  }
  focusTabs() {
    if (!this._shouldShowTabs()) {
      return;
    }
    this._terminalTabsFocusContextKey.set(true);
    const selected = this._tabList.getSelection();
    this._tabList.domFocus();
    if (selected) {
      this._tabList.setFocus(selected);
    }
  }
  focus() {
    if (this._terminalService.connectionState === 1 /* Connected */) {
      this._focus();
      return;
    }
    const previousActiveElement = this._tabListElement.ownerDocument.activeElement;
    if (previousActiveElement) {
      const listener = this._register(Event2.once(this._terminalService.onDidChangeConnectionState)(() => {
        if (isActiveElement(previousActiveElement)) {
          this._focus();
        }
        this._store.delete(listener);
      }));
    }
  }
  focusHover() {
    if (this._shouldShowTabs()) {
      this._tabList.focusHover();
      return;
    }
    const instance2 = this._terminalGroupService.activeInstance;
    if (!instance2) {
      return;
    }
    this._hoverService.showInstantHover({
      ...getInstanceHoverInfo(instance2, this._storageService),
      target: this._terminalContainer,
      trapFocus: true
    }, true);
  }
  _focus() {
    this._terminalGroupService.activeInstance?.focusWhenReady();
  }
};

TerminalTabbedView = __decorateClass([
  __decorateParam(1, ITerminalService),
  __decorateParam(2, ITerminalChatService),
  __decorateParam(3, ITerminalConfigurationService),
  __decorateParam(4, ITerminalGroupService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IHoverService)
], TerminalTabbedView);
export { $106, TerminalTabbedView };
