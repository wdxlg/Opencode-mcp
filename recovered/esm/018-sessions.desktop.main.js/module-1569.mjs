// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/statusbar/statusbarPart.ts
import { MultiWindowParts, Part } from "./module-1563.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Disposable, DisposableStore, MutableDisposable, disposeIfDisposable, toDisposable } from "./module-0012.mjs";
import { StatusbarViewModel } from "./module-1567.mjs";
import { WorkbenchHoverDelegate } from "./module-0520.mjs";
import { $, EventHelper, EventType, addDisposableListener, clearNode, getWindow, isHTMLElement } from "./module-0075.mjs";
import { isManagedHoverTooltipHTMLElement, isManagedHoverTooltipMarkdownString } from "./module-0548.mjs";
import { IStatusbarService, isStatusbarEntryLocation, isStatusbarEntryPriority } from "./module-0895.mjs";
import { hash } from "./module-0039.mjs";
import { StatusbarEntryItem } from "./module-1568.mjs";
import { equals } from "./module-0007.mjs";
import { StatusBarFocused } from "./module-0950.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { STATUS_BAR_BACKGROUND, STATUS_BAR_BORDER, STATUS_BAR_FOCUS_BORDER, STATUS_BAR_FOREGROUND, STATUS_BAR_ITEM_COMPACT_HOVER_BACKGROUND, STATUS_BAR_ITEM_FOCUS_BORDER, STATUS_BAR_ITEM_HOVER_BACKGROUND, STATUS_BAR_NO_FOLDER_BACKGROUND, STATUS_BAR_NO_FOLDER_BORDER, STATUS_BAR_NO_FOLDER_FOREGROUND } from "./module-0868.mjs";
import { isHighContrast } from "./module-0247.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { Separator, toAction } from "./module-0082.mjs";
import { ToggleStatusbarVisibilityAction } from "./module-1561.mjs";
import { localize } from "./module-0001.mjs";
import { HideStatusbarEntryAction, ManageExtensionAction, ToggleStatusbarEntryVisibilityAction } from "./module-1566.mjs";
import { activeContrastBorder, contrastBorder } from "./module-0227.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/browser/parts/statusbar/statusbarPart.ts
var StatusbarPart = class extends Part {
  constructor(id2, instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService, configurationService) {
    super(id2, { hasTitle: false }, themeService, storageService, layoutService);
    this.instantiationService = instantiationService;
    this.contextService = contextService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.minimumWidth = 0;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.pendingEntries = [];
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this.onDidOverrideEntry = this._register(new Emitter());
    this.entryOverrides = /* @__PURE__ */ new Map();
    this.compactEntriesDisposable = this._register(new MutableDisposable());
    this.styleOverrides = /* @__PURE__ */ new Set();
    this.viewModel = this._register(new StatusbarViewModel(storageService));
    this.onDidChangeEntryVisibility = this.viewModel.onDidChangeEntryVisibility;
    this.hoverDelegate = this._register(this.instantiationService.createInstance(WorkbenchHoverDelegate, "element", {
      instantHover: true,
      dynamicDelay(content) {
        if (typeof content === "function" || isHTMLElement(content) || isManagedHoverTooltipMarkdownString(content) && typeof content.markdown === "function" || isManagedHoverTooltipHTMLElement(content)) {
          return 500;
        }
        return void 0;
      }
    }, (_, focus) => ({
      persistence: {
        hideOnKeyDown: true,
        sticky: focus
      },
      appearance: {
        maxHeightRatio: 0.9
      }
    })));
    this.registerListeners();
  }
  static {
    this.HEIGHT = 22;
  }
  static {
    /**
     * Vertical padding reserved around the main status bar under the floating panels
     * experiment so its items remain centered. The part grows by this amount and
     * the matching padding is applied in `floatingPanels.css`.
     */
    this.FLOATING_BOTTOM_PADDING = 6;
  }
  static {
    this.COMPACT_DENSITY_FLOATING_BOTTOM_PADDING = 4;
  }
  //#region IView
  get floatingBottomPadding() {
    if (this.getId() !== "workbench.parts.statusbar" /* STATUSBAR_PART */ || !this.layoutService.isFloatingPanelsEnabled()) {
      return 0;
    }
    return this.layoutService.isModernUICompact() ? StatusbarPart.COMPACT_DENSITY_FLOATING_BOTTOM_PADDING : StatusbarPart.FLOATING_BOTTOM_PADDING;
  }
  get minimumHeight() {
    return StatusbarPart.HEIGHT + this.floatingBottomPadding;
  }
  get maximumHeight() {
    return StatusbarPart.HEIGHT + this.floatingBottomPadding;
  }
  registerListeners() {
    this._register(this.onDidChangeEntryVisibility(() => this.updateCompactEntries()));
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.updateStyles()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (this.getId() === "workbench.parts.statusbar" /* STATUSBAR_PART */ && (e4.affectsConfiguration("workbench.experimental.modernUI" /* MODERN_UI */) || e4.affectsConfiguration("window.density.layout" /* MODERN_UI_DENSITY */))) {
        this._onDidChange.fire(void 0);
        if (this.element) {
          this.updateStyles();
        }
      }
    }));
  }
  overrideEntry(id2, override) {
    this.entryOverrides.set(id2, override);
    this.onDidOverrideEntry.fire(id2);
    return toDisposable(() => {
      const currentOverride = this.entryOverrides.get(id2);
      if (currentOverride === override) {
        this.entryOverrides.delete(id2);
        this.onDidOverrideEntry.fire(id2);
      }
    });
  }
  withEntryOverride(entry, id2) {
    const override = this.entryOverrides.get(id2);
    if (override) {
      entry = { ...entry, ...override };
    }
    return entry;
  }
  addEntry(entry, id2, alignment, priorityOrLocation = 0) {
    let priority;
    if (isStatusbarEntryPriority(priorityOrLocation)) {
      priority = priorityOrLocation;
    } else {
      priority = {
        primary: priorityOrLocation,
        secondary: hash(id2)
        // derive from identifier to accomplish uniqueness
      };
    }
    if (!this.element) {
      return this.doAddPendingEntry(entry, id2, alignment, priority);
    }
    return this.doAddEntry(entry, id2, alignment, priority);
  }
  doAddPendingEntry(entry, id2, alignment, priority) {
    const pendingEntry = { entry, id: id2, alignment, priority };
    this.pendingEntries.push(pendingEntry);
    const accessor = {
      update: (entry2) => {
        if (pendingEntry.accessor) {
          pendingEntry.accessor.update(entry2);
        } else {
          pendingEntry.entry = entry2;
        }
      },
      dispose: () => {
        if (pendingEntry.accessor) {
          pendingEntry.accessor.dispose();
        } else {
          this.pendingEntries = this.pendingEntries.filter((entry2) => entry2 !== pendingEntry);
        }
      }
    };
    return accessor;
  }
  doAddEntry(entry, id2, alignment, priority) {
    const disposables = new DisposableStore();
    const itemContainer = this.doCreateStatusItem(id2, alignment);
    const item = disposables.add(this.instantiationService.createInstance(StatusbarEntryItem, itemContainer, this.withEntryOverride(entry, id2), this.hoverDelegate));
    const viewModelEntry = new class {
      constructor() {
        this.id = id2;
        this.extensionId = entry.extensionId;
        this.alignment = alignment;
        this.priority = priority;
        this.container = itemContainer;
        this.labelContainer = item.labelContainer;
      }
      get name() {
        return item.name;
      }
      get hasCommand() {
        return item.hasCommand;
      }
    }();
    const { needsFullRefresh } = this.doAddOrRemoveModelEntry(viewModelEntry, true);
    if (needsFullRefresh) {
      this.appendStatusbarEntries();
    } else {
      this.appendStatusbarEntry(viewModelEntry);
    }
    let lastEntry = entry;
    const accessor = {
      update: (entry2) => {
        lastEntry = entry2;
        const hadBackgroundColor = itemContainer.classList.contains("has-background-color");
        item.update(this.withEntryOverride(entry2, id2));
        if (hadBackgroundColor !== itemContainer.classList.contains("has-background-color")) {
          this.updateVisibleBackgroundColorNeighbors();
        }
      },
      dispose: () => {
        const { needsFullRefresh: needsFullRefresh2 } = this.doAddOrRemoveModelEntry(viewModelEntry, false);
        if (needsFullRefresh2) {
          this.appendStatusbarEntries();
        } else {
          itemContainer.remove();
          this.updateCompactEntries();
        }
        disposables.dispose();
      }
    };
    disposables.add(this.onDidOverrideEntry.event((overrideEntryId) => {
      if (overrideEntryId === id2) {
        accessor.update(lastEntry);
      }
    }));
    return accessor;
  }
  doCreateStatusItem(id2, alignment, ...extraClasses) {
    const itemContainer = $(".statusbar-item", { id: id2 });
    if (extraClasses) {
      itemContainer.classList.add(...extraClasses);
    }
    if (alignment === 1 /* RIGHT */) {
      itemContainer.classList.add("right");
    } else {
      itemContainer.classList.add("left");
    }
    return itemContainer;
  }
  doAddOrRemoveModelEntry(entry, add) {
    const entriesBefore = this.viewModel.entries;
    if (add) {
      this.viewModel.add(entry);
    } else {
      this.viewModel.remove(entry);
    }
    const entriesAfter = this.viewModel.entries;
    if (add) {
      entriesBefore.splice(entriesAfter.indexOf(entry), 0, entry);
    } else {
      entriesBefore.splice(entriesBefore.indexOf(entry), 1);
    }
    const needsFullRefresh = !equals(entriesBefore, entriesAfter);
    return { needsFullRefresh };
  }
  isEntryVisible(id2) {
    return !this.viewModel.isHidden(id2);
  }
  updateEntryVisibility(id2, visible) {
    if (visible) {
      this.viewModel.show(id2);
    } else {
      this.viewModel.hide(id2);
    }
  }
  focusNextEntry() {
    this.viewModel.focusNextEntry();
  }
  focusPreviousEntry() {
    this.viewModel.focusPreviousEntry();
  }
  isEntryFocused() {
    return this.viewModel.isEntryFocused();
  }
  focus(preserveEntryFocus = true) {
    this.getContainer()?.focus();
    const lastFocusedEntry = this.viewModel.lastFocusedEntry;
    if (preserveEntryFocus && lastFocusedEntry) {
      setTimeout(() => lastFocusedEntry.labelContainer.focus(), 0);
    }
  }
  createContentArea(parent) {
    this.element = parent;
    const scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.element));
    StatusBarFocused.bindTo(scopedContextKeyService).set(true);
    this.leftItemsContainer = $(".left-items.items-container");
    this.element.appendChild(this.leftItemsContainer);
    this.element.tabIndex = 0;
    this.rightItemsContainer = $(".right-items.items-container");
    this.element.appendChild(this.rightItemsContainer);
    this._register(addDisposableListener(parent, EventType.CONTEXT_MENU, (e4) => this.showContextMenu(e4)));
    this._register(Gesture.addTarget(parent));
    this._register(addDisposableListener(parent, EventType2.Contextmenu, (e4) => this.showContextMenu(e4)));
    this.createInitialStatusbarEntries();
    return this.element;
  }
  createInitialStatusbarEntries() {
    this.appendStatusbarEntries();
    while (this.pendingEntries.length) {
      const pending = this.pendingEntries.shift();
      if (pending) {
        pending.accessor = this.addEntry(pending.entry, pending.id, pending.alignment, pending.priority.primary);
      }
    }
  }
  appendStatusbarEntries() {
    const leftItemsContainer = assertReturnsDefined(this.leftItemsContainer);
    const rightItemsContainer = assertReturnsDefined(this.rightItemsContainer);
    clearNode(leftItemsContainer);
    clearNode(rightItemsContainer);
    for (const entry of [
      ...this.viewModel.getEntries(0 /* LEFT */),
      ...this.viewModel.getEntries(1 /* RIGHT */).reverse()
      // reversing due to flex: row-reverse
    ]) {
      const target = entry.alignment === 0 /* LEFT */ ? leftItemsContainer : rightItemsContainer;
      target.appendChild(entry.container);
    }
    this.updateCompactEntries();
  }
  appendStatusbarEntry(entry) {
    const entries2 = this.viewModel.getEntries(entry.alignment);
    if (entry.alignment === 1 /* RIGHT */) {
      entries2.reverse();
    }
    const target = assertReturnsDefined(entry.alignment === 0 /* LEFT */ ? this.leftItemsContainer : this.rightItemsContainer);
    const index2 = entries2.indexOf(entry);
    if (index2 + 1 === entries2.length) {
      target.appendChild(entry.container);
    } else {
      target.insertBefore(entry.container, entries2[index2 + 1].container);
    }
    this.updateCompactEntries();
  }
  updateCompactEntries() {
    const entries2 = this.viewModel.entries;
    const mapIdToVisibleEntry = /* @__PURE__ */ new Map();
    for (const entry of entries2) {
      if (!this.viewModel.isHidden(entry.id)) {
        mapIdToVisibleEntry.set(entry.id, entry);
      }
      entry.container.classList.remove("compact-left", "compact-right");
    }
    const compactEntryGroups = /* @__PURE__ */ new Map();
    for (const entry of mapIdToVisibleEntry.values()) {
      if (isStatusbarEntryLocation(entry.priority.primary) && // entry references another entry as location
      entry.priority.primary.compact) {
        const locationId = entry.priority.primary.location.id;
        const location2 = mapIdToVisibleEntry.get(locationId);
        if (!location2) {
          continue;
        }
        let compactEntryGroup = compactEntryGroups.get(locationId);
        if (!compactEntryGroup) {
          for (const group2 of compactEntryGroups.values()) {
            if (group2.has(locationId)) {
              compactEntryGroup = group2;
              break;
            }
          }
          if (!compactEntryGroup) {
            compactEntryGroup = /* @__PURE__ */ new Map();
            compactEntryGroups.set(locationId, compactEntryGroup);
          }
        }
        compactEntryGroup.set(entry.id, entry);
        compactEntryGroup.set(location2.id, location2);
        if (entry.priority.primary.alignment === 0 /* LEFT */) {
          location2.container.classList.add("compact-left");
          entry.container.classList.add("compact-right");
        } else {
          location2.container.classList.add("compact-right");
          entry.container.classList.add("compact-left");
        }
      }
    }
    const statusBarItemHoverBackground = this.getColor(STATUS_BAR_ITEM_HOVER_BACKGROUND);
    const statusBarItemCompactHoverBackground = this.getColor(STATUS_BAR_ITEM_COMPACT_HOVER_BACKGROUND);
    this.compactEntriesDisposable.value = new DisposableStore();
    if (statusBarItemHoverBackground && statusBarItemCompactHoverBackground && !isHighContrast(this.theme.type)) {
      for (const [, compactEntryGroup] of compactEntryGroups) {
        for (const compactEntry of compactEntryGroup.values()) {
          if (!compactEntry.hasCommand) {
            continue;
          }
          this.compactEntriesDisposable.value.add(addDisposableListener(compactEntry.labelContainer, EventType.MOUSE_OVER, () => {
            compactEntryGroup.forEach((compactEntry2) => compactEntry2.labelContainer.style.backgroundColor = statusBarItemHoverBackground);
            compactEntry.labelContainer.style.backgroundColor = statusBarItemCompactHoverBackground;
          }));
          this.compactEntriesDisposable.value.add(addDisposableListener(compactEntry.labelContainer, EventType.MOUSE_OUT, () => {
            compactEntryGroup.forEach((compactEntry2) => compactEntry2.labelContainer.style.backgroundColor = "");
          }));
        }
      }
    }
    this.updateVisibleBackgroundColorNeighbors();
  }
  updateVisibleBackgroundColorNeighbors() {
    this.doUpdateVisibleBackgroundColorNeighbors(this.viewModel.getEntries(0 /* LEFT */), 0 /* LEFT */);
    this.doUpdateVisibleBackgroundColorNeighbors(this.viewModel.getEntries(1 /* RIGHT */).reverse(), 1 /* RIGHT */);
  }
  doUpdateVisibleBackgroundColorNeighbors(entries2, alignment) {
    let previousVisibleEntry;
    for (const entry of entries2) {
      entry.container.classList.remove("visible-background-color-neighbor");
      if (this.viewModel.isHidden(entry.id)) {
        continue;
      }
      const isCompactNeighbor = alignment === 0 /* LEFT */ ? previousVisibleEntry?.container.classList.contains("compact-right") && entry.container.classList.contains("compact-left") : previousVisibleEntry?.container.classList.contains("compact-left") && entry.container.classList.contains("compact-right");
      if (previousVisibleEntry?.container.classList.contains("has-background-color") && entry.container.classList.contains("has-background-color") && !isCompactNeighbor) {
        entry.container.classList.add("visible-background-color-neighbor");
      }
      previousVisibleEntry = entry;
    }
  }
  showContextMenu(e4) {
    EventHelper.stop(e4, true);
    const event = new StandardMouseEvent(getWindow(this.element), e4);
    let actions = void 0;
    this.contextMenuService.showContextMenu({
      getAnchor: () => event,
      getActions: () => {
        actions = this.getContextMenuActions(event);
        return actions;
      },
      onHide: () => {
        if (actions) {
          disposeIfDisposable(actions);
        }
      }
    });
  }
  getContextMenuActions(event) {
    const actions = [];
    actions.push(toAction({ id: ToggleStatusbarVisibilityAction.ID, label: localize(6915, null), run: () => this.instantiationService.invokeFunction((accessor) => new ToggleStatusbarVisibilityAction().run(accessor)) }));
    actions.push(new Separator());
    const handledEntries = /* @__PURE__ */ new Set();
    for (const entry of this.viewModel.entries) {
      if (!handledEntries.has(entry.id)) {
        actions.push(new ToggleStatusbarEntryVisibilityAction(entry.id, entry.name, this.viewModel));
        handledEntries.add(entry.id);
      }
    }
    let statusEntryUnderMouse = void 0;
    for (let element = event.target; element; element = element.parentElement) {
      const entry = this.viewModel.findEntry(element);
      if (entry) {
        statusEntryUnderMouse = entry;
        break;
      }
    }
    if (statusEntryUnderMouse) {
      actions.push(new Separator());
      if (statusEntryUnderMouse.extensionId) {
        actions.push(this.instantiationService.createInstance(ManageExtensionAction, statusEntryUnderMouse.extensionId));
      }
      actions.push(new HideStatusbarEntryAction(statusEntryUnderMouse.id, statusEntryUnderMouse.name, this.viewModel));
    }
    return actions;
  }
  updateStyles() {
    super.updateStyles();
    const container2 = assertReturnsDefined(this.getContainer());
    const styleOverride = [...this.styleOverrides].sort((a, b) => a.priority - b.priority)[0];
    const backgroundColor = this.getColor(styleOverride?.background ?? (this.contextService.getWorkbenchState() !== 1 /* EMPTY */ ? STATUS_BAR_BACKGROUND : STATUS_BAR_NO_FOLDER_BACKGROUND)) || "";
    container2.style.backgroundColor = backgroundColor;
    container2.style.boxShadow = this.getId() === "workbench.parts.statusbar" /* STATUSBAR_PART */ && this.layoutService.isFloatingPanelsEnabled() && !isHighContrast(this.theme.type) && backgroundColor ? `0 1px 0 ${backgroundColor}` : "";
    const foregroundColor = this.getColor(styleOverride?.foreground ?? (this.contextService.getWorkbenchState() !== 1 /* EMPTY */ ? STATUS_BAR_FOREGROUND : STATUS_BAR_NO_FOLDER_FOREGROUND)) || "";
    container2.style.color = foregroundColor;
    const itemBorderColor = this.getColor(STATUS_BAR_ITEM_FOCUS_BORDER);
    this.updateCompactEntries();
    const borderColor = this.getColor(styleOverride?.border ?? (this.contextService.getWorkbenchState() !== 1 /* EMPTY */ ? STATUS_BAR_BORDER : STATUS_BAR_NO_FOLDER_BORDER)) || this.getColor(contrastBorder);
    if (borderColor) {
      container2.classList.add("status-border-top");
      container2.style.setProperty("--status-border-top-color", borderColor);
    } else {
      container2.classList.remove("status-border-top");
      container2.style.removeProperty("--status-border-top-color");
    }
    const statusBarFocusColor = this.getColor(STATUS_BAR_FOCUS_BORDER);
    if (!this.styleElement) {
      this.styleElement = createStyleSheet(container2, void 0, this._store);
    }
    this.styleElement.textContent = `

				/* Status bar focus outline */
				.monaco-workbench .part.statusbar:focus {
					outline-color: ${statusBarFocusColor};
				}

				/* Status bar item focus outline */
				.monaco-workbench .part.statusbar > .items-container > .statusbar-item a:focus-visible {
					outline: 1px solid ${this.getColor(activeContrastBorder) ?? itemBorderColor};
					outline-offset: ${borderColor ? "-2px" : "-1px"};
				}

				/* Notification Beak */
				.monaco-workbench .part.statusbar > .items-container > .statusbar-item.has-beak > .status-bar-item-beak-container:before {
					border-bottom-color: ${borderColor ?? backgroundColor};
				}
			`;
  }
  layout(width2, height, top2, left) {
    super.layout(width2, height, top2, left);
    super.layoutContents(width2, height);
  }
  overrideStyle(style) {
    this.styleOverrides.add(style);
    this.updateStyles();
    return toDisposable(() => {
      this.styleOverrides.delete(style);
      this.updateStyles();
    });
  }
  toJSON() {
    return {
      type: "workbench.parts.statusbar" /* STATUSBAR_PART */
    };
  }
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
};

StatusbarPart = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IWorkbenchLayoutService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IConfigurationService)
], StatusbarPart);

var MainStatusbarPart = class extends StatusbarPart {
  constructor(instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService, configurationService) {
    super("workbench.parts.statusbar" /* STATUSBAR_PART */, instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService, configurationService);
  }
};

MainStatusbarPart = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IThemeService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IWorkbenchLayoutService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IConfigurationService)
], MainStatusbarPart);

var AuxiliaryStatusbarPart = class extends StatusbarPart {
  constructor(container2, instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService, configurationService) {
    const id2 = AuxiliaryStatusbarPart.COUNTER++;
    super(`workbench.parts.auxiliaryStatus.${id2}`, instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService, configurationService);
    this.container = container2;
    this.height = StatusbarPart.HEIGHT;
  }
  static {
    this.COUNTER = 1;
  }
};

AuxiliaryStatusbarPart = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IWorkbenchLayoutService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IConfigurationService)
], AuxiliaryStatusbarPart);

var StatusbarService = class extends MultiWindowParts {
  constructor(instantiationService, storageService, themeService) {
    super("workbench.statusBarService", themeService, storageService);
    this.instantiationService = instantiationService;
    this._onDidCreateAuxiliaryStatusbarPart = this._register(new Emitter());
    this.onDidCreateAuxiliaryStatusbarPart = this._onDidCreateAuxiliaryStatusbarPart.event;
    this.mainPart = this._register(this.instantiationService.createInstance(MainStatusbarPart));
    this._register(this.registerPart(this.mainPart));
    this.onDidChangeEntryVisibility = this.mainPart.onDidChangeEntryVisibility;
  }
  //#region Auxiliary Statusbar Parts
  createAuxiliaryStatusbarPart(container2, instantiationService) {
    const statusbarPartContainer = $("footer.part.statusbar", {
      "role": "status",
      "aria-live": "off",
      "tabIndex": "0"
    });
    statusbarPartContainer.style.position = "relative";
    container2.appendChild(statusbarPartContainer);
    const statusbarPart = instantiationService.createInstance(AuxiliaryStatusbarPart, statusbarPartContainer);
    const disposable = this.registerPart(statusbarPart);
    statusbarPart.create(statusbarPartContainer);
    Event2.once(statusbarPart.onWillDispose)(() => disposable.dispose());
    this._onDidCreateAuxiliaryStatusbarPart.fire(statusbarPart);
    return statusbarPart;
  }
  createScoped(statusbarEntryContainer, disposables) {
    return disposables.add(this.instantiationService.createInstance(ScopedStatusbarService, statusbarEntryContainer));
  }
  addEntry(entry, id2, alignment, priorityOrLocation = 0) {
    if (entry.showInAllWindows) {
      return this.doAddEntryToAllWindows(entry, id2, alignment, priorityOrLocation);
    }
    return this.mainPart.addEntry(entry, id2, alignment, priorityOrLocation);
  }
  doAddEntryToAllWindows(originalEntry, id2, alignment, priorityOrLocation = 0) {
    const entryDisposables = new DisposableStore();
    const accessors = /* @__PURE__ */ new Set();
    let entry = originalEntry;
    function addEntry(part) {
      const partDisposables = new DisposableStore();
      partDisposables.add(part.onWillDispose(() => partDisposables.dispose()));
      const accessor = partDisposables.add(part.addEntry(entry, id2, alignment, priorityOrLocation));
      accessors.add(accessor);
      partDisposables.add(toDisposable(() => accessors.delete(accessor)));
      entryDisposables.add(partDisposables);
      partDisposables.add(toDisposable(() => entryDisposables.delete(partDisposables)));
    }
    for (const part of this.parts) {
      addEntry(part);
    }
    entryDisposables.add(this.onDidCreateAuxiliaryStatusbarPart((part) => addEntry(part)));
    return {
      update: (updatedEntry) => {
        entry = updatedEntry;
        for (const update of accessors) {
          update.update(updatedEntry);
        }
      },
      dispose: () => entryDisposables.dispose()
    };
  }
  isEntryVisible(id2) {
    return this.mainPart.isEntryVisible(id2);
  }
  updateEntryVisibility(id2, visible) {
    for (const part of this.parts) {
      part.updateEntryVisibility(id2, visible);
    }
  }
  overrideEntry(id2, override) {
    const disposables = new DisposableStore();
    for (const part of this.parts) {
      disposables.add(part.overrideEntry(id2, override));
    }
    return disposables;
  }
  focus(preserveEntryFocus) {
    this.activePart.focus(preserveEntryFocus);
  }
  focusNextEntry() {
    this.activePart.focusNextEntry();
  }
  focusPreviousEntry() {
    this.activePart.focusPreviousEntry();
  }
  isEntryFocused() {
    return this.activePart.isEntryFocused();
  }
  overrideStyle(style) {
    const disposables = new DisposableStore();
    for (const part of this.parts) {
      disposables.add(part.overrideStyle(style));
    }
    return disposables;
  }
  //#endregion
};

StatusbarService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IThemeService)
], StatusbarService);

var ScopedStatusbarService = class extends Disposable {
  constructor(statusbarEntryContainer, statusbarService) {
    super();
    this.statusbarEntryContainer = statusbarEntryContainer;
    this.statusbarService = statusbarService;
    this.onDidChangeEntryVisibility = this.statusbarEntryContainer.onDidChangeEntryVisibility;
  }
  createAuxiliaryStatusbarPart(container2, instantiationService) {
    return this.statusbarService.createAuxiliaryStatusbarPart(container2, instantiationService);
  }
  createScoped(statusbarEntryContainer, disposables) {
    return this.statusbarService.createScoped(statusbarEntryContainer, disposables);
  }
  getPart() {
    return this.statusbarEntryContainer;
  }
  addEntry(entry, id2, alignment, priorityOrLocation = 0) {
    return this.statusbarEntryContainer.addEntry(entry, id2, alignment, priorityOrLocation);
  }
  isEntryVisible(id2) {
    return this.statusbarEntryContainer.isEntryVisible(id2);
  }
  updateEntryVisibility(id2, visible) {
    this.statusbarEntryContainer.updateEntryVisibility(id2, visible);
  }
  overrideEntry(id2, override) {
    return this.statusbarEntryContainer.overrideEntry(id2, override);
  }
  focus(preserveEntryFocus) {
    this.statusbarEntryContainer.focus(preserveEntryFocus);
  }
  focusNextEntry() {
    this.statusbarEntryContainer.focusNextEntry();
  }
  focusPreviousEntry() {
    this.statusbarEntryContainer.focusPreviousEntry();
  }
  isEntryFocused() {
    return this.statusbarEntryContainer.isEntryFocused();
  }
  overrideStyle(style) {
    return this.statusbarEntryContainer.overrideStyle(style);
  }
};

ScopedStatusbarService = __decorateClass([
  __decorateParam(1, IStatusbarService)
], ScopedStatusbarService);

registerSingleton(IStatusbarService, StatusbarService, 0 /* Eager */);
export { StatusbarPart, MainStatusbarPart, AuxiliaryStatusbarPart, StatusbarService, ScopedStatusbarService };
