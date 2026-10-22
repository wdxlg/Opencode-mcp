// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/toolbar/toolbar.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { EventMultiplexer } from "./module-0017.mjs";
import { createInstantHoverDelegate } from "./module-0448.mjs";
import { ActionBar } from "./module-0477.mjs";
import { DropdownMenuActionViewItem } from "./module-0502.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Action, Separator, SubmenuAction } from "./module-0082.mjs";
import { getWindow, isHTMLElement } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/base/browser/ui/toolbar/toolbar.ts
var ACTION_MIN_WIDTH = 20;

var ACTION_PADDING = 4;

var ACTION_MIN_WIDTH_VAR = "--vscode-toolbar-action-min-width";

var ToolBar = class extends Disposable {
  constructor(container2, contextMenuProvider, options3 = { orientation: 0 /* HORIZONTAL */ }) {
    super();
    this.container = container2;
    this.submenuActionViewItems = [];
    this.hasSecondaryActions = false;
    this._onDidChangeDropdownVisibility = this._register(new EventMultiplexer());
    this.originalPrimaryActions = [];
    this.originalSecondaryActions = [];
    this.hiddenActions = [];
    this.disposables = this._register(new DisposableStore());
    options3.hoverDelegate = options3.hoverDelegate ?? this._register(createInstantHoverDelegate());
    this.options = options3;
    this.toggleMenuAction = this._register(new ToggleMenuAction(() => this.toggleMenuActionViewItem?.show(), options3.toggleMenuTitle));
    this.element = document.createElement("div");
    this.element.className = "monaco-toolbar";
    container2.appendChild(this.element);
    this.actionBar = this._register(new ActionBar(this.element, {
      orientation: options3.orientation,
      ariaLabel: options3.ariaLabel,
      actionRunner: options3.actionRunner,
      allowContextMenu: options3.allowContextMenu,
      highlightToggledItems: options3.highlightToggledItems,
      hoverDelegate: options3.hoverDelegate,
      actionViewItemProvider: (action, viewItemOptions) => {
        if (action.id === ToggleMenuAction.ID) {
          this.toggleMenuActionViewItem = new DropdownMenuActionViewItem(
            action,
            { getActions: () => this.toggleMenuAction.menuActions },
            contextMenuProvider,
            {
              actionViewItemProvider: this.options.actionViewItemProvider,
              actionRunner: this.actionRunner,
              keybindingProvider: this.options.getKeyBinding,
              classNames: ThemeIcon.asClassNameArray(options3.moreIcon ?? Codicon.toolBarMore),
              menuClassName: this.options.dropdownMenuClassName,
              closeAnimation: this.options.dropdownMenuCloseAnimation,
              anchorAlignmentProvider: this.options.anchorAlignmentProvider,
              menuAsChild: !!this.options.renderDropdownAsChildElement,
              skipTelemetry: this.options.skipTelemetry,
              isMenu: true,
              hoverDelegate: this.options.hoverDelegate
            }
          );
          this.toggleMenuActionViewItem.setActionContext(this.actionBar.context);
          this.disposables.add(this._onDidChangeDropdownVisibility.add(this.toggleMenuActionViewItem.onDidChangeVisibility));
          return this.toggleMenuActionViewItem;
        }
        if (options3.actionViewItemProvider) {
          const result = options3.actionViewItemProvider(action, viewItemOptions);
          if (result) {
            return result;
          }
        }
        if (action instanceof SubmenuAction) {
          const result = new DropdownMenuActionViewItem(
            action,
            action.actions,
            contextMenuProvider,
            {
              actionViewItemProvider: this.options.actionViewItemProvider,
              actionRunner: this.actionRunner,
              keybindingProvider: this.options.getKeyBinding,
              classNames: action.class,
              menuClassName: this.options.dropdownMenuClassName,
              closeAnimation: this.options.dropdownMenuCloseAnimation,
              anchorAlignmentProvider: this.options.anchorAlignmentProvider,
              menuAsChild: !!this.options.renderDropdownAsChildElement,
              skipTelemetry: this.options.skipTelemetry,
              hoverDelegate: this.options.hoverDelegate
            }
          );
          result.setActionContext(this.actionBar.context);
          this.submenuActionViewItems.push(result);
          this.disposables.add(this._onDidChangeDropdownVisibility.add(result.onDidChangeVisibility));
          return result;
        }
        return void 0;
      }
    }));
    if (this.options.responsiveBehavior?.enabled) {
      this.element.classList.toggle("responsive", true);
      this.element.classList.toggle("responsive-all", this.options.responsiveBehavior.kind === "all");
      this.element.classList.toggle("responsive-last", this.options.responsiveBehavior.kind === "last");
      this.element.style.setProperty(ACTION_MIN_WIDTH_VAR, `${this.getConfiguredActionMinWidth()}px`);
      const observer = new ResizeObserver(() => {
        this.updateActions(this.getAvailableWidth());
      });
      observer.observe(this.options.responsiveBehavior?.observedElement ?? this.element);
      this._store.add(toDisposable(() => observer.disconnect()));
    }
  }
  get onDidChangeDropdownVisibility() {
    return this._onDidChangeDropdownVisibility.event;
  }
  set actionRunner(actionRunner) {
    this.actionBar.actionRunner = actionRunner;
  }
  get actionRunner() {
    return this.actionBar.actionRunner;
  }
  set context(context2) {
    this.actionBar.context = context2;
    this.toggleMenuActionViewItem?.setActionContext(context2);
    for (const actionViewItem of this.submenuActionViewItems) {
      actionViewItem.setActionContext(context2);
    }
  }
  getElement() {
    return this.element;
  }
  /** Focuses the item at `index`, or the first item when no index is given. */
  focus(index2) {
    this.actionBar.focus(index2);
  }
  getItemsWidth() {
    let itemsWidth = 0;
    for (let i2 = 0; i2 < this.actionBar.length(); i2++) {
      itemsWidth += this.actionBar.getWidth(i2);
    }
    return itemsWidth;
  }
  getItemAction(indexOrElement) {
    return this.actionBar.getAction(indexOrElement);
  }
  getItemWidth(index2) {
    return this.actionBar.getWidth(index2);
  }
  getItemElement(index2) {
    const element = this.actionBar.getContainer().firstElementChild?.children.item(index2);
    return isHTMLElement(element) ? element : void 0;
  }
  getItemViewItem(index2) {
    return this.actionBar.viewItems[index2];
  }
  getUnshrunkItemWidth(index2) {
    const actionItem = this.actionBar.getContainer().firstElementChild?.children.item(index2);
    if (!isHTMLElement(actionItem)) {
      return this.actionBar.getWidth(index2);
    }
    const previousFlexShrink = actionItem.style.flexShrink;
    const previousMinWidth = actionItem.style.minWidth;
    try {
      actionItem.style.flexShrink = "0";
      if (!previousMinWidth) {
        actionItem.style.minWidth = "0";
      }
      return this.actionBar.getWidth(index2);
    } finally {
      actionItem.style.flexShrink = previousFlexShrink;
      actionItem.style.minWidth = previousMinWidth;
    }
  }
  getItemsLength() {
    return this.actionBar.length();
  }
  hasOverflow() {
    return this.actionBar.hasAction(this.toggleMenuAction);
  }
  setAriaLabel(label3) {
    this.actionBar.setAriaLabel(label3);
  }
  /**
   * Force the responsive overflow logic to re-evaluate item visibility.
   * Call this after action view items change their rendered size externally
   * (e.g. label text changes) without the toolbar being notified.
   */
  relayout() {
    if (this.options.responsiveBehavior?.enabled) {
      const width2 = this.getAvailableWidth();
      this.updateActions(width2);
    }
  }
  setActions(primaryActions, secondaryActions) {
    this.clear();
    this.originalPrimaryActions = primaryActions ? primaryActions.slice(0) : [];
    this.originalSecondaryActions = secondaryActions ? secondaryActions.slice(0) : [];
    const primaryActionsToSet = primaryActions ? primaryActions.slice(0) : [];
    this.hasSecondaryActions = !!(secondaryActions && secondaryActions.length > 0);
    if (this.hasSecondaryActions && secondaryActions) {
      this.toggleMenuAction.menuActions = secondaryActions.slice(0);
      primaryActionsToSet.push(this.toggleMenuAction);
    }
    if (primaryActionsToSet.length > 0 && this.options.trailingSeparator) {
      primaryActionsToSet.push(new Separator());
    }
    primaryActionsToSet.forEach((action) => {
      this.actionBar.push(action, { icon: this.options.icon ?? true, label: this.options.label ?? false, keybinding: this.getKeybindingLabel(action) });
    });
    this.updateOverflowClassName();
    this.applyResponsiveActionMinWidths();
    if (this.options.responsiveBehavior?.enabled) {
      this.hiddenActions.length = 0;
      if (this.options.responsiveBehavior?.minItems !== void 0) {
        const itemCount = this.options.responsiveBehavior.minItems;
        const primaryActionsMinWidth = this.originalPrimaryActions.slice(0, itemCount).reduce((total, action) => total + this.getActionMinWidth(action), 0);
        let overflowWidth = 0;
        if (this.originalSecondaryActions.length > 0 || itemCount < this.originalPrimaryActions.length) {
          overflowWidth = ACTION_MIN_WIDTH + ACTION_PADDING;
        }
        this.container.style.minWidth = `${primaryActionsMinWidth + overflowWidth}px`;
        this.element.style.minWidth = `${primaryActionsMinWidth + overflowWidth}px`;
      } else {
        const minimumActionWidth = this.originalPrimaryActions.length > 0 ? this.getActionMinWidth(this.originalPrimaryActions[0]) : ACTION_MIN_WIDTH + ACTION_PADDING;
        this.container.style.minWidth = `${minimumActionWidth}px`;
        this.element.style.minWidth = `${minimumActionWidth}px`;
      }
      this.updateActions(this.getAvailableWidth());
    }
  }
  isEmpty() {
    return this.actionBar.isEmpty();
  }
  getKeybindingLabel(action) {
    const key3 = this.options.getKeyBinding?.(action);
    return key3?.getLabel() ?? void 0;
  }
  getConfiguredActionMinWidth(action) {
    if (action?.id === ToggleMenuAction.ID) {
      return ACTION_MIN_WIDTH;
    }
    return this.options.responsiveBehavior?.getActionMinWidth?.(action ?? this.toggleMenuAction) ?? this.options.responsiveBehavior?.actionMinWidth ?? ACTION_MIN_WIDTH;
  }
  getActionMinWidth(action) {
    return this.getConfiguredActionMinWidth(action) + ACTION_PADDING;
  }
  getAvailableWidth() {
    if (this.options.responsiveBehavior?.getAvailableWidth) {
      return this.options.responsiveBehavior.getAvailableWidth();
    }
    return this.element.getBoundingClientRect().width;
  }
  applyResponsiveActionMinWidths() {
    if (!this.options.responsiveBehavior?.enabled) {
      return;
    }
    if (this.options.responsiveBehavior.kind === "last") {
      const hasToggleMenuAction = this.actionBar.hasAction(this.toggleMenuAction);
      const shrinkableIndex = hasToggleMenuAction ? this.actionBar.length() - 2 : this.actionBar.length() - 1;
      const shrinkableAction = shrinkableIndex >= 0 ? this.actionBar.getAction(shrinkableIndex) : void 0;
      const minWidth = `${this.getConfiguredActionMinWidth(shrinkableAction)}px`;
      if (this.element.style.getPropertyValue(ACTION_MIN_WIDTH_VAR) !== minWidth) {
        this.element.style.setProperty(ACTION_MIN_WIDTH_VAR, minWidth);
      }
      return;
    }
    const actionsContainer = this.actionBar.getContainer().firstElementChild;
    if (!isHTMLElement(actionsContainer)) {
      return;
    }
    for (let i2 = 0; i2 < actionsContainer.children.length; i2++) {
      const actionItem = actionsContainer.children.item(i2);
      if (!isHTMLElement(actionItem)) {
        continue;
      }
      const action = this.actionBar.getAction(i2);
      const minWidth = `${this.getConfiguredActionMinWidth(action)}px`;
      if (actionItem.style.minWidth !== minWidth) {
        actionItem.style.minWidth = minWidth;
      }
    }
  }
  updateActions(containerWidth) {
    if (this.actionBar.isEmpty()) {
      return;
    }
    this.applyResponsiveActionMinWidths();
    const parsedMinWidth = parseInt(this.element.style.minWidth);
    containerWidth = Math.max(containerWidth, Number.isNaN(parsedMinWidth) ? 0 : parsedMinWidth);
    const isActionItemVisible = (index2) => {
      const element = this.getItemElement(index2);
      return !element || getWindow(element).getComputedStyle(element).display !== "none";
    };
    const getVisiblePrimaryActionIndexes = () => {
      const indexes = [];
      for (let index2 = 0; index2 < this.actionBar.length(); index2++) {
        if (this.actionBar.getAction(index2) !== this.toggleMenuAction && isActionItemVisible(index2)) {
          indexes.push(index2);
        }
      }
      return indexes;
    };
    const actionBarMinimumWidth = () => {
      if (this.options.responsiveBehavior?.kind === "last") {
        const hasToggleMenuAction = this.actionBar.hasAction(this.toggleMenuAction);
        const primaryActionIndexes = getVisiblePrimaryActionIndexes();
        if (primaryActionIndexes.length === 0) {
          return hasToggleMenuAction ? ACTION_MIN_WIDTH + ACTION_PADDING : 0;
        }
        let itemsWidth = 0;
        for (const index2 of primaryActionIndexes.slice(0, -1)) {
          itemsWidth += this.actionBar.getWidth(index2) + ACTION_PADDING;
        }
        const action = this.actionBar.getAction(primaryActionIndexes.at(-1));
        itemsWidth += this.getActionMinWidth(action);
        itemsWidth += hasToggleMenuAction ? ACTION_MIN_WIDTH + ACTION_PADDING : 0;
        return itemsWidth;
      } else {
        let itemsWidth = 0;
        for (let i2 = 0; i2 < this.actionBar.length(); i2++) {
          if (isActionItemVisible(i2)) {
            itemsWidth += this.getActionMinWidth(this.actionBar.getAction(i2));
          }
        }
        return itemsWidth;
      }
    };
    const projectedActionBarMinimumWidth = (actionToAdd, keepToggleMenuAction) => {
      let itemsWidth = this.getActionMinWidth(actionToAdd);
      if (this.options.responsiveBehavior?.kind === "last") {
        const primaryActionIndexes = getVisiblePrimaryActionIndexes();
        for (const [position2, index2] of primaryActionIndexes.entries()) {
          const itemWidth = position2 === primaryActionIndexes.length - 1 ? this.getUnshrunkItemWidth(index2) : this.actionBar.getWidth(index2);
          itemsWidth += itemWidth + ACTION_PADDING;
        }
      } else {
        for (let i2 = 0; i2 < this.actionBar.length(); i2++) {
          const action = this.actionBar.getAction(i2);
          if (action && action !== this.toggleMenuAction && isActionItemVisible(i2)) {
            itemsWidth += this.getActionMinWidth(action);
          }
        }
      }
      if (keepToggleMenuAction) {
        itemsWidth += ACTION_MIN_WIDTH + ACTION_PADDING;
      }
      return itemsWidth;
    };
    let minimumWidth = actionBarMinimumWidth();
    if (minimumWidth <= containerWidth && this.hiddenActions.length === 0) {
      return;
    }
    if (minimumWidth > containerWidth) {
      const allowOverflow = this.options.responsiveBehavior?.allowOverflow;
      if (allowOverflow === false || typeof allowOverflow === "function" && !allowOverflow()) {
        return;
      }
      if (this.options.responsiveBehavior?.minItems !== void 0) {
        const primaryActionsCount = getVisiblePrimaryActionIndexes().length;
        if (primaryActionsCount <= this.options.responsiveBehavior.minItems) {
          return;
        }
      }
      while (minimumWidth > containerWidth && this.actionBar.length() > 0) {
        const index2 = getVisiblePrimaryActionIndexes().at(-1);
        if (index2 === void 0) {
          break;
        }
        const action = this.actionBar.getAction(index2);
        if (!action) {
          break;
        }
        this.hiddenActions.push(action);
        this.hiddenActions.sort((a, b) => this.originalPrimaryActions.indexOf(a) - this.originalPrimaryActions.indexOf(b));
        this.actionBar.pull(index2);
        if (this.originalSecondaryActions.length === 0 && this.hiddenActions.length === 1) {
          this.actionBar.push(this.toggleMenuAction, {
            icon: this.options.icon ?? true,
            label: this.options.label ?? false,
            keybinding: this.getKeybindingLabel(this.toggleMenuAction)
          });
          this.updateOverflowClassName();
        }
        this.applyResponsiveActionMinWidths();
        minimumWidth = actionBarMinimumWidth();
      }
    } else {
      while (this.hiddenActions.length > 0) {
        const action = this.hiddenActions.shift();
        const keepToggleMenuAction = this.originalSecondaryActions.length > 0 || this.hiddenActions.length > 0;
        if (projectedActionBarMinimumWidth(action, keepToggleMenuAction) > containerWidth) {
          this.hiddenActions.unshift(action);
          break;
        }
        this.actionBar.push(action, {
          icon: this.options.icon ?? true,
          label: this.options.label ?? false,
          keybinding: this.getKeybindingLabel(action),
          index: this.originalPrimaryActions.slice(0, this.originalPrimaryActions.indexOf(action)).reduce((index2, precedingAction) => index2 + (this.actionBar.hasAction(precedingAction) ? 1 : 0), 0)
        });
        if (this.originalSecondaryActions.length === 0 && this.hiddenActions.length === 0) {
          this.toggleMenuAction.menuActions = [];
          this.actionBar.pull(this.actionBar.length() - 1);
          this.updateOverflowClassName();
        }
        this.applyResponsiveActionMinWidths();
      }
    }
    const hiddenActions = this.hiddenActions.map((action) => this.options.responsiveBehavior?.getOverflowAction?.(
      action,
      () => this.toggleMenuActionViewItem?.element
    ) ?? action);
    if (this.originalSecondaryActions.length > 0 || hiddenActions.length > 0) {
      const secondaryActions = this.originalSecondaryActions.slice(0);
      this.toggleMenuAction.menuActions = Separator.join(hiddenActions, secondaryActions);
    }
    this.updateOverflowClassName();
    this.applyResponsiveActionMinWidths();
  }
  updateOverflowClassName() {
    this.actionBar.domNode.classList.toggle("has-overflow", this.actionBar.hasAction(this.toggleMenuAction));
  }
  clear() {
    this.submenuActionViewItems = [];
    this.disposables.clear();
    this.actionBar.clear();
  }
  dispose() {
    this.clear();
    this.disposables.dispose();
    this.element.remove();
    super.dispose();
  }
};

var ToggleMenuAction = class _ToggleMenuAction extends Action {
  static {
    this.ID = "toolbar.toggle.more";
  }
  constructor(toggleDropdownMenu, title) {
    title = title || localize(32, null);
    super(_ToggleMenuAction.ID, title, void 0, true);
    this._menuActions = [];
    this.toggleDropdownMenu = toggleDropdownMenu;
  }
  async run() {
    this.toggleDropdownMenu();
  }
  get menuActions() {
    return this._menuActions;
  }
  set menuActions(actions) {
    this._menuActions = actions;
  }
};
export { ACTION_MIN_WIDTH, ACTION_PADDING, ACTION_MIN_WIDTH_VAR, ToolBar, ToggleMenuAction };
