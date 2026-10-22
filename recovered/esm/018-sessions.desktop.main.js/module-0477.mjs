// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/actionbar/actionbar.ts
import { Disposable, DisposableMap, DisposableStore, dispose } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { createInstantHoverDelegate } from "./module-0448.mjs";
import { ActionRunner, Separator } from "./module-0082.mjs";
import { EventHelper, EventType, addDisposableListener, clearNode, getActiveElement, isAncestor, isHTMLElement, trackFocus } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ActionViewItem, BaseActionViewItem } from "./module-0476.mjs";
import { isFunction, isNumber } from "./module-0010.mjs";


// src/vs/base/browser/ui/actionbar/actionbar.ts
var ActionBar = class extends Disposable {
  constructor(container2, options3 = {}) {
    super();
    this._actionRunnerDisposables = this._register(new DisposableStore());
    this.viewItemDisposables = this._register(new DisposableMap());
    // Trigger Key Tracking
    this.triggerKeyDown = false;
    this.focusable = true;
    this._onDidBlur = this._register(new Emitter());
    this._onDidCancel = this._register(new Emitter({ onWillAddFirstListener: () => this.cancelHasListener = true }));
    this.cancelHasListener = false;
    this._onDidRun = this._register(new Emitter());
    this._onWillRun = this._register(new Emitter());
    this.options = options3;
    this._context = options3.context ?? null;
    this._orientation = this.options.orientation ?? 0 /* HORIZONTAL */;
    this._triggerKeys = {
      keyDown: this.options.triggerKeys?.keyDown ?? false,
      keys: this.options.triggerKeys?.keys ?? [3 /* Enter */, 10 /* Space */]
    };
    this._hoverDelegate = options3.hoverDelegate ?? this._register(createInstantHoverDelegate());
    if (this.options.actionRunner) {
      this._actionRunner = this.options.actionRunner;
    } else {
      this._actionRunner = new ActionRunner();
      this._actionRunnerDisposables.add(this._actionRunner);
    }
    this._actionRunnerDisposables.add(this._actionRunner.onDidRun((e4) => this._onDidRun.fire(e4)));
    this._actionRunnerDisposables.add(this._actionRunner.onWillRun((e4) => this._onWillRun.fire(e4)));
    this._viewItems = [];
    this.focusedItem = void 0;
    this.domNode = document.createElement("div");
    this.domNode.className = "monaco-action-bar";
    let previousKeys;
    let nextKeys;
    switch (this._orientation) {
      case 0 /* HORIZONTAL */:
        previousKeys = [15 /* LeftArrow */];
        nextKeys = [17 /* RightArrow */];
        break;
      case 1 /* VERTICAL */:
        previousKeys = [16 /* UpArrow */];
        nextKeys = [18 /* DownArrow */];
        this.domNode.className += " vertical";
        break;
    }
    this._register(addDisposableListener(this.domNode, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      let eventHandled = true;
      const focusedItem = typeof this.focusedItem === "number" ? this.viewItems[this.focusedItem] : void 0;
      if (previousKeys && (event.equals(previousKeys[0]) || event.equals(previousKeys[1]))) {
        eventHandled = this.focusPrevious();
      } else if (nextKeys && (event.equals(nextKeys[0]) || event.equals(nextKeys[1]))) {
        eventHandled = this.focusNext();
      } else if (event.equals(9 /* Escape */) && this.cancelHasListener) {
        this._onDidCancel.fire();
      } else if (event.equals(14 /* Home */)) {
        eventHandled = this.focusFirst();
      } else if (event.equals(13 /* End */)) {
        eventHandled = this.focusLast();
      } else if (event.equals(2 /* Tab */) && focusedItem instanceof BaseActionViewItem && focusedItem.trapsArrowNavigation) {
        eventHandled = this.focusNext(void 0, true);
      } else if (this.isTriggerKeyEvent(event)) {
        if (this._triggerKeys.keyDown) {
          this.doTrigger(event);
        } else {
          this.triggerKeyDown = true;
        }
      } else {
        eventHandled = false;
      }
      if (eventHandled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }));
    this._register(addDisposableListener(this.domNode, EventType.KEY_UP, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (this.isTriggerKeyEvent(event)) {
        if (!this._triggerKeys.keyDown && this.triggerKeyDown) {
          this.triggerKeyDown = false;
          this.doTrigger(event);
        }
        event.preventDefault();
        event.stopPropagation();
      } else if (event.equals(2 /* Tab */) || event.equals(1024 /* Shift */ | 2 /* Tab */) || event.equals(16 /* UpArrow */) || event.equals(18 /* DownArrow */) || event.equals(15 /* LeftArrow */) || event.equals(17 /* RightArrow */)) {
        this.updateFocusedItem();
      }
    }));
    this.focusTracker = this._register(trackFocus(this.domNode));
    this._register(this.focusTracker.onDidBlur(() => {
      if (getActiveElement() === this.domNode || !isAncestor(getActiveElement(), this.domNode)) {
        this._onDidBlur.fire();
        this.previouslyFocusedItem = this.focusedItem;
        this.focusedItem = void 0;
        this.triggerKeyDown = false;
      }
    }));
    this._register(this.focusTracker.onDidFocus(() => this.updateFocusedItem()));
    this.actionsList = document.createElement("ul");
    this.actionsList.className = "actions-container";
    if (this.options.highlightToggledItems) {
      this.actionsList.classList.add("highlight-toggled");
    }
    this.actionsList.setAttribute("role", this.options.ariaRole || "toolbar");
    if (this.options.ariaLabel) {
      this.actionsList.setAttribute("aria-label", this.options.ariaLabel);
    }
    this.domNode.appendChild(this.actionsList);
    container2.appendChild(this.domNode);
  }
  get viewItems() {
    return this._viewItems;
  }
  get onDidBlur() {
    return this._onDidBlur.event;
  }
  get onDidCancel() {
    return this._onDidCancel.event;
  }
  get onDidRun() {
    return this._onDidRun.event;
  }
  get onWillRun() {
    return this._onWillRun.event;
  }
  refreshRole() {
    if (this.length() >= 1) {
      this.actionsList.setAttribute("role", this.options.ariaRole || "toolbar");
    } else {
      this.actionsList.setAttribute("role", "presentation");
    }
  }
  setAriaLabel(label3) {
    if (label3) {
      this.actionsList.setAttribute("aria-label", label3);
    } else {
      this.actionsList.removeAttribute("aria-label");
    }
  }
  // Some action bars should not be focusable at times
  // When an action bar is not focusable make sure to make all the elements inside it not focusable
  // When an action bar is focusable again, make sure the first item can be focused
  setFocusable(focusable) {
    this.focusable = focusable;
    if (this.focusable) {
      const firstEnabled = this.viewItems.find((vi) => vi instanceof BaseActionViewItem && vi.isEnabled());
      if (firstEnabled instanceof BaseActionViewItem) {
        firstEnabled.setFocusable(true);
      }
    } else {
      this.viewItems.forEach((vi) => {
        if (vi instanceof BaseActionViewItem) {
          vi.setFocusable(false);
        }
      });
    }
  }
  isTriggerKeyEvent(event) {
    let ret = false;
    this._triggerKeys.keys.forEach((keyCode) => {
      ret = ret || event.equals(keyCode);
    });
    return ret;
  }
  updateFocusedItem() {
    for (let i2 = 0; i2 < this.actionsList.children.length; i2++) {
      const elem = this.actionsList.children[i2];
      if (isAncestor(getActiveElement(), elem)) {
        this.focusedItem = i2;
        this.viewItems[this.focusedItem]?.showHover?.();
        break;
      }
    }
  }
  get context() {
    return this._context;
  }
  set context(context2) {
    this._context = context2;
    this.viewItems.forEach((i2) => i2.setActionContext(context2));
  }
  get actionRunner() {
    return this._actionRunner;
  }
  set actionRunner(actionRunner) {
    this._actionRunner = actionRunner;
    this._actionRunnerDisposables.clear();
    this._actionRunnerDisposables.add(this._actionRunner.onDidRun((e4) => this._onDidRun.fire(e4)));
    this._actionRunnerDisposables.add(this._actionRunner.onWillRun((e4) => this._onWillRun.fire(e4)));
    this.viewItems.forEach((item) => item.actionRunner = actionRunner);
  }
  getContainer() {
    return this.domNode;
  }
  hasAction(action) {
    return this.viewItems.findIndex((candidate) => candidate.action.id === action.id) !== -1;
  }
  getAction(indexOrElement) {
    if (typeof indexOrElement === "number") {
      return this.viewItems[indexOrElement]?.action;
    }
    if (isHTMLElement(indexOrElement)) {
      while (indexOrElement.parentElement !== this.actionsList) {
        if (!indexOrElement.parentElement) {
          return void 0;
        }
        indexOrElement = indexOrElement.parentElement;
      }
      for (let i2 = 0; i2 < this.actionsList.childNodes.length; i2++) {
        if (this.actionsList.childNodes[i2] === indexOrElement) {
          return this.viewItems[i2].action;
        }
      }
    }
    return void 0;
  }
  push(arg, options3 = {}) {
    const actions = Array.isArray(arg) ? arg : [arg];
    let index2 = isNumber(options3.index) ? options3.index : null;
    actions.forEach((action) => {
      const actionViewItemElement = document.createElement("li");
      actionViewItemElement.className = "action-item";
      actionViewItemElement.setAttribute("role", "presentation");
      let item;
      const viewItemOptions = { hoverDelegate: this._hoverDelegate, ...options3, isTabList: this.options.ariaRole === "tablist" };
      if (this.options.actionViewItemProvider) {
        item = this.options.actionViewItemProvider(action, viewItemOptions);
      }
      if (!item) {
        item = new ActionViewItem(this.context, action, viewItemOptions);
      }
      if (!this.options.allowContextMenu) {
        this.viewItemDisposables.set(item, addDisposableListener(actionViewItemElement, EventType.CONTEXT_MENU, (e4) => {
          EventHelper.stop(e4, true);
        }));
      }
      item.actionRunner = this._actionRunner;
      item.setActionContext(this.context);
      item.render(actionViewItemElement);
      if (index2 === null || index2 < 0 || index2 >= this.actionsList.children.length) {
        this.actionsList.appendChild(actionViewItemElement);
        this._viewItems.push(item);
      } else {
        this.actionsList.insertBefore(actionViewItemElement, this.actionsList.children[index2]);
        this._viewItems.splice(index2, 0, item);
        index2++;
      }
    });
    if (this.focusable) {
      let didFocus = false;
      for (const item of this.viewItems) {
        if (!(item instanceof BaseActionViewItem)) {
          continue;
        }
        let focus;
        if (didFocus) {
          focus = false;
        } else if (item.action.id === Separator.ID) {
          focus = false;
        } else if (!item.isEnabled() && this.options.focusOnlyEnabledItems) {
          focus = false;
        } else {
          focus = true;
        }
        if (focus) {
          item.setFocusable(true);
          didFocus = true;
        } else {
          item.setFocusable(false);
        }
      }
    }
    if (typeof this.focusedItem === "number") {
      this.focus(this.focusedItem);
    }
    this.refreshRole();
  }
  getWidth(index2) {
    return this.actionsList.children.item(index2)?.clientWidth ?? 0;
  }
  getHeight(index2) {
    return this.actionsList.children.item(index2)?.clientHeight ?? 0;
  }
  pull(index2) {
    if (index2 >= 0 && index2 < this.viewItems.length) {
      this.actionsList.childNodes[index2].remove();
      this.viewItemDisposables.deleteAndDispose(this.viewItems[index2]);
      dispose(this._viewItems.splice(index2, 1));
      this.refreshRole();
    }
  }
  clear() {
    if (this.isEmpty()) {
      return;
    }
    this._viewItems = dispose(this._viewItems);
    this.viewItemDisposables.clearAndDisposeAll();
    clearNode(this.actionsList);
    this.refreshRole();
  }
  length() {
    return this.viewItems.length;
  }
  isEmpty() {
    return this.viewItems.length === 0;
  }
  isFocused(index2) {
    return index2 === void 0 ? isAncestor(getActiveElement(), this.domNode) : isAncestor(getActiveElement(), this.actionsList.children[index2]);
  }
  focus(arg) {
    let selectFirst = false;
    let index2 = void 0;
    if (arg === void 0) {
      selectFirst = true;
    } else if (typeof arg === "number") {
      index2 = arg;
    } else if (typeof arg === "boolean") {
      selectFirst = arg;
    }
    if (selectFirst && typeof this.focusedItem === "undefined") {
      const firstEnabled = this.viewItems.findIndex((item) => item.isEnabled());
      this.focusedItem = firstEnabled === -1 ? void 0 : firstEnabled;
      this.updateFocus(void 0, void 0, true);
    } else {
      if (index2 !== void 0) {
        this.focusedItem = index2;
      }
      this.updateFocus(void 0, void 0, true);
    }
  }
  focusFirst() {
    this.focusedItem = this.length() - 1;
    return this.focusNext(true);
  }
  focusLast() {
    this.focusedItem = 0;
    return this.focusPrevious(true);
  }
  focusNext(forceLoop, forceFocus) {
    if (typeof this.focusedItem === "undefined") {
      this.focusedItem = this.viewItems.length - 1;
    } else if (this.viewItems.length <= 1) {
      return false;
    }
    const startIndex = this.focusedItem;
    let item;
    do {
      if (!forceLoop && this.options.preventLoopNavigation && this.focusedItem + 1 >= this.viewItems.length) {
        this.focusedItem = startIndex;
        return false;
      }
      this.focusedItem = (this.focusedItem + 1) % this.viewItems.length;
      item = this.viewItems[this.focusedItem];
    } while (this.focusedItem !== startIndex && (this.options.focusOnlyEnabledItems && !item.isEnabled() || item.action.id === Separator.ID));
    this.updateFocus(void 0, void 0, forceFocus);
    return true;
  }
  focusPrevious(forceLoop) {
    if (typeof this.focusedItem === "undefined") {
      this.focusedItem = 0;
    } else if (this.viewItems.length <= 1) {
      return false;
    }
    const startIndex = this.focusedItem;
    let item;
    do {
      this.focusedItem = this.focusedItem - 1;
      if (this.focusedItem < 0) {
        if (!forceLoop && this.options.preventLoopNavigation) {
          this.focusedItem = startIndex;
          return false;
        }
        this.focusedItem = this.viewItems.length - 1;
      }
      item = this.viewItems[this.focusedItem];
    } while (this.focusedItem !== startIndex && (this.options.focusOnlyEnabledItems && !item.isEnabled() || item.action.id === Separator.ID));
    this.updateFocus(true);
    return true;
  }
  updateFocus(fromRight, preventScroll, forceFocus = false) {
    if (typeof this.focusedItem === "undefined") {
      this.actionsList.focus({ preventScroll });
    }
    if (this.previouslyFocusedItem !== void 0 && this.previouslyFocusedItem !== this.focusedItem) {
      this.viewItems[this.previouslyFocusedItem]?.blur();
    }
    const actionViewItem = this.focusedItem !== void 0 ? this.viewItems[this.focusedItem] : void 0;
    if (actionViewItem) {
      let focusItem = true;
      if (!isFunction(actionViewItem.focus)) {
        focusItem = false;
      }
      if (this.options.focusOnlyEnabledItems && isFunction(actionViewItem.isEnabled) && !actionViewItem.isEnabled()) {
        focusItem = false;
      }
      if (actionViewItem.action.id === Separator.ID) {
        focusItem = false;
      }
      if (!focusItem) {
        this.actionsList.focus({ preventScroll });
        this.previouslyFocusedItem = void 0;
      } else if (forceFocus || this.previouslyFocusedItem !== this.focusedItem) {
        actionViewItem.focus(fromRight);
        this.previouslyFocusedItem = this.focusedItem;
      }
      if (focusItem) {
        actionViewItem.showHover?.();
      }
    }
  }
  doTrigger(event) {
    if (typeof this.focusedItem === "undefined") {
      return;
    }
    const actionViewItem = this.viewItems[this.focusedItem];
    if (actionViewItem instanceof BaseActionViewItem) {
      const context2 = actionViewItem._context === null || actionViewItem._context === void 0 ? event : actionViewItem._context;
      this.run(actionViewItem._action, context2);
    }
  }
  async run(action, context2) {
    await this._actionRunner.run(action, context2);
  }
  dispose() {
    this._context = void 0;
    this._viewItems = dispose(this._viewItems);
    this.getContainer().remove();
    super.dispose();
  }
};

function prepareActions(actions) {
  if (!actions.length) {
    return actions;
  }
  let firstIndexOfAction = -1;
  for (let i2 = 0; i2 < actions.length; i2++) {
    if (actions[i2].id === Separator.ID) {
      continue;
    }
    firstIndexOfAction = i2;
    break;
  }
  if (firstIndexOfAction === -1) {
    return [];
  }
  actions = actions.slice(firstIndexOfAction);
  for (let h3 = actions.length - 1; h3 >= 0; h3--) {
    const isSeparator = actions[h3].id === Separator.ID;
    if (isSeparator) {
      actions.splice(h3, 1);
    } else {
      break;
    }
  }
  let foundAction = false;
  for (let k = actions.length - 1; k >= 0; k--) {
    const isSeparator = actions[k].id === Separator.ID;
    if (isSeparator && !foundAction) {
      actions.splice(k, 1);
    } else if (!isSeparator) {
      foundAction = true;
    } else if (isSeparator) {
      foundAction = false;
    }
  }
  return actions;
}
export { prepareActions, ActionBar };
