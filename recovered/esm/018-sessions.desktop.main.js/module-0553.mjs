// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/actionWidget/browser/actionWidget.ts
import { registerColor } from "./module-0226.mjs";
import { inputActiveOptionBackground } from "./module-0233.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { ActionList, acceptSelectedActionCommand, previewSelectedActionCommand } from "./module-0552.mjs";
import { $, EventType, addDisposableGenericMouseDownListener, addDisposableListener, getActiveElement, getWindow, trackFocus } from "./module-0075.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { ActionBar } from "./module-0477.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";


// src/vs/platform/actionWidget/browser/actionWidget.ts
registerColor(
  "actionBar.toggledBackground",
  inputActiveOptionBackground,
  localize(1859, null)
);

var ACTION_WIDGET_CLOSE_START_OPACITY_VARIABLE = "--action-widget-close-start-opacity";

var ACTION_WIDGET_CLOSE_START_TRANSFORM_VARIABLE = "--action-widget-close-start-transform";

var ActionWidgetContextKeys = {
  Visible: new RawContextKey("codeActionMenuVisible", false, localize(1862, null)),
  FilterFocused: new RawContextKey("codeActionMenuFilterFocused", false, localize(1861, null))
};

var IActionWidgetService = createDecorator("actionWidgetService");

var ActionWidgetService = class extends Disposable {
  constructor(_contextViewService, _contextKeyService, _instantiationService) {
    super();
    this._contextViewService = _contextViewService;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._list = this._register(new MutableDisposable());
    this._closeAnimation = this._register(new MutableDisposable());
  }
  get isVisible() {
    return ActionWidgetContextKeys.Visible.getValue(this._contextKeyService) || false;
  }
  show(user, supportsPreview, items, delegate, anchor, container2, actionBarActions, accessibilityProvider, listOptions) {
    const visibleContext = ActionWidgetContextKeys.Visible.bindTo(this._contextKeyService);
    const list2 = this._instantiationService.createInstance(ActionList, user, supportsPreview, items, delegate, accessibilityProvider, listOptions, anchor);
    this._contextViewService.showContextView({
      getAnchor: () => anchor,
      render: (container3) => {
        visibleContext.set(true);
        return this._renderWidget(container3, list2, actionBarActions ?? []);
      },
      onHide: (didCancel) => {
        visibleContext.reset();
        this._onWidgetClosed(didCancel);
      },
      get anchorPosition() {
        return list2.anchorPosition;
      }
    }, container2, false);
  }
  acceptSelected(preview) {
    this._list.value?.acceptSelected(preview);
  }
  updateItems(items, focusItemId) {
    this._list.value?.updateItems(items, focusItemId);
  }
  focusItemById(itemId) {
    this._list.value?.focusItemById(itemId);
  }
  focusPrevious() {
    this._list?.value?.focusPrevious();
  }
  focusNext() {
    this._list?.value?.focusNext();
  }
  collapseSection() {
    this._list?.value?.collapseFocusedSection();
  }
  expandSection() {
    this._list?.value?.expandFocusedSection();
  }
  toggleSection() {
    return this._list?.value?.toggleFocusedSection() ?? false;
  }
  clearFilter() {
    return this._list?.value?.clearFilter() ?? false;
  }
  hide(didCancel) {
    const list2 = this._list.value;
    const widget = this._widgetElement;
    if (!list2 || this._closingList === list2) {
      return;
    }
    const closeAnimation = list2.closeAnimation;
    if (!widget || !closeAnimation || closeAnimation.duration <= 0 || !this._hasRequiredAncestorClasses(widget, closeAnimation.requiredAncestorClasses)) {
      this._closingList = list2;
      list2.hide(didCancel);
      return;
    }
    this._closingList = list2;
    const computedStyle = getWindow(widget).getComputedStyle(widget);
    widget.style.setProperty(ACTION_WIDGET_CLOSE_START_OPACITY_VARIABLE, computedStyle.opacity);
    widget.style.setProperty(ACTION_WIDGET_CLOSE_START_TRANSFORM_VARIABLE, computedStyle.transform);
    widget.classList.add(closeAnimation.className);
    list2.hide(didCancel, false);
    this._closeAnimation.value = disposableTimeout(() => {
      if (this._list.value === list2) {
        this._contextViewService.hideContextView(didCancel);
      }
    }, closeAnimation.duration);
  }
  clear() {
    this._closeAnimation.clear();
    this._closingList = void 0;
    this._widgetElement?.style.removeProperty(ACTION_WIDGET_CLOSE_START_OPACITY_VARIABLE);
    this._widgetElement?.style.removeProperty(ACTION_WIDGET_CLOSE_START_TRANSFORM_VARIABLE);
    this._widgetElement = void 0;
    this._list.clear();
  }
  _renderWidget(element, list2, actionBarActions) {
    const widget = document.createElement("div");
    widget.classList.add("action-widget");
    const widgetClassNames = list2.widgetClassName?.split(/\s+/).filter(Boolean);
    if (widgetClassNames?.length) {
      widget.classList.add(...widgetClassNames);
    }
    element.appendChild(widget);
    this._widgetElement = widget;
    this._list.value = list2;
    if (this._list.value) {
      if (this._list.value.headerContainer) {
        widget.appendChild(this._list.value.headerContainer);
      }
      if (this._list.value.filterContainer) {
        widget.appendChild(this._list.value.filterContainer);
      }
      widget.appendChild(this._list.value.domNode);
      if (this._list.value.footerContainer) {
        widget.appendChild(this._list.value.footerContainer);
      }
    } else {
      throw new Error("List has no value");
    }
    const renderDisposables = new DisposableStore();
    const headerContainer = this._list.value.headerContainer;
    if (headerContainer) {
      renderDisposables.add(addDisposableGenericMouseDownListener(headerContainer, (e4) => e4.preventDefault()));
    }
    const menuBlock = document.createElement("div");
    const block2 = element.appendChild(menuBlock);
    block2.classList.add("context-view-block");
    renderDisposables.add(addDisposableGenericMouseDownListener(block2, (e4) => e4.stopPropagation()));
    const pointerBlockDiv = document.createElement("div");
    const pointerBlock = element.appendChild(pointerBlockDiv);
    pointerBlock.classList.add("context-view-pointerBlock");
    renderDisposables.add(addDisposableListener(pointerBlock, EventType.POINTER_MOVE, () => pointerBlock.remove()));
    renderDisposables.add(addDisposableGenericMouseDownListener(pointerBlock, () => pointerBlock.remove()));
    let actionBarWidth = 0;
    if (actionBarActions.length) {
      const actionBar3 = this._createActionBar(".action-widget-action-bar", actionBarActions);
      if (actionBar3) {
        widget.appendChild(actionBar3.getContainer().parentElement);
        renderDisposables.add(actionBar3);
        actionBarWidth = actionBar3.getContainer().offsetWidth;
      }
    }
    const width2 = this._list.value?.layout(actionBarWidth);
    widget.style.width = `${width2}px`;
    this._list.value?.focus();
    const filterFocusedContext = ActionWidgetContextKeys.FilterFocused.bindTo(this._contextKeyService);
    renderDisposables.add({ dispose: () => filterFocusedContext.reset() });
    if (this._list.value?.filterInput) {
      const filterInput = this._list.value.filterInput;
      renderDisposables.add(addDisposableListener(filterInput, "focus", () => filterFocusedContext.set(true)));
      renderDisposables.add(addDisposableListener(filterInput, "blur", () => filterFocusedContext.set(false)));
    }
    const focusTracker = renderDisposables.add(trackFocus(element));
    renderDisposables.add(focusTracker.onDidBlur(() => {
      const activeElement = getActiveElement();
      if (activeElement?.closest(".action-widget-hover") || activeElement?.closest(".action-list-submenu-panel")) {
        return;
      }
      this.hide(true);
    }));
    return renderDisposables;
  }
  _createActionBar(className2, actions) {
    if (!actions.length) {
      return void 0;
    }
    const container2 = $(className2);
    const actionBar3 = new ActionBar(container2);
    actionBar3.push(actions, { icon: false, label: true });
    return actionBar3;
  }
  _hasRequiredAncestorClasses(element, classNames2) {
    if (!classNames2?.length) {
      return true;
    }
    for (let candidate = element; candidate; candidate = candidate.parentElement) {
      if (classNames2.every((className2) => candidate.classList.contains(className2))) {
        return true;
      }
    }
    return false;
  }
  _onWidgetClosed(didCancel) {
    if (this._closingList === this._list.value) {
      this.clear();
      return;
    }
    this._closeAnimation.clear();
    this._closingList = void 0;
    this._widgetElement = void 0;
    this._list.value?.hide(didCancel);
  }
};

ActionWidgetService = __decorateClass([
  __decorateParam(0, IContextViewService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IInstantiationService)
], ActionWidgetService);

registerSingleton(IActionWidgetService, ActionWidgetService, 1 /* Delayed */);

var weight = 100 /* EditorContrib */ + 1e3;

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "hideCodeActionWidget",
      title: localize2(1865, "Hide action widget"),
      precondition: ActionWidgetContextKeys.Visible,
      keybinding: {
        weight,
        primary: 9 /* Escape */,
        secondary: [1024 /* Shift */ | 9 /* Escape */]
      }
    });
  }
  run(accessor) {
    accessor.get(IActionWidgetService).hide(true);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "clearFilterCodeActionWidget",
      title: localize2(1860, "Clear action widget filter"),
      precondition: ContextKeyExpr.and(ActionWidgetContextKeys.Visible, ActionWidgetContextKeys.FilterFocused),
      keybinding: {
        weight: weight + 1,
        primary: 9 /* Escape */
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      if (!widgetService.clearFilter()) {
        widgetService.hide(true);
      }
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "selectPrevCodeAction",
      title: localize2(1868, "Select previous action"),
      precondition: ActionWidgetContextKeys.Visible,
      keybinding: {
        weight,
        primary: 16 /* UpArrow */,
        secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */],
        mac: { primary: 16 /* UpArrow */, secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */, 256 /* WinCtrl */ | 46 /* KeyP */] }
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      widgetService.focusPrevious();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "selectNextCodeAction",
      title: localize2(1867, "Select next action"),
      precondition: ActionWidgetContextKeys.Visible,
      keybinding: {
        weight,
        primary: 18 /* DownArrow */,
        secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */],
        mac: { primary: 18 /* DownArrow */, secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */, 256 /* WinCtrl */ | 44 /* KeyN */] }
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      widgetService.focusNext();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "collapseSectionCodeAction",
      title: localize2(1863, "Collapse section"),
      precondition: ContextKeyExpr.and(ActionWidgetContextKeys.Visible, ActionWidgetContextKeys.FilterFocused.negate()),
      keybinding: {
        weight,
        primary: 15 /* LeftArrow */
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      widgetService.collapseSection();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "expandSectionCodeAction",
      title: localize2(1864, "Expand section"),
      precondition: ContextKeyExpr.and(ActionWidgetContextKeys.Visible, ActionWidgetContextKeys.FilterFocused.negate()),
      keybinding: {
        weight,
        primary: 17 /* RightArrow */
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      widgetService.expandSection();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "toggleSectionCodeAction",
      title: localize2(1869, "Toggle section"),
      precondition: ContextKeyExpr.and(ActionWidgetContextKeys.Visible, ActionWidgetContextKeys.FilterFocused.negate()),
      keybinding: {
        weight,
        primary: 10 /* Space */
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      if (!widgetService.toggleSection()) {
        widgetService.acceptSelected();
      }
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: acceptSelectedActionCommand,
      title: localize2(1858, "Accept selected action"),
      precondition: ActionWidgetContextKeys.Visible,
      keybinding: {
        weight,
        primary: 3 /* Enter */,
        secondary: [2048 /* CtrlCmd */ | 89 /* Period */]
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      widgetService.acceptSelected();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: previewSelectedActionCommand,
      title: localize2(1866, "Preview selected action"),
      precondition: ActionWidgetContextKeys.Visible,
      keybinding: {
        weight,
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      widgetService.acceptSelected(true);
    }
  }
});
export { ACTION_WIDGET_CLOSE_START_OPACITY_VARIABLE, ACTION_WIDGET_CLOSE_START_TRANSFORM_VARIABLE, ActionWidgetContextKeys, IActionWidgetService, ActionWidgetService, weight };
