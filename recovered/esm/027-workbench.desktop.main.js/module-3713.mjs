// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/notifications/notificationsList.ts
import { Disposable } from "./module-0012.mjs";
import { $, getWindow, isAncestorOfActiveElement, trackFocus } from "./module-0075.mjs";
import { NotificationActionRunner } from "./module-3458.mjs";
import { NotificationRenderer, NotificationsListDelegate } from "./module-3460.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { NOTIFICATIONS_BACKGROUND } from "./module-0912.mjs";
import { CopyNotificationMessageAction } from "./module-3459.mjs";
import { NotificationFocusedContext } from "./module-0949.mjs";
import { assertReturnsAllDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { localize } from "./module-0001.mjs";
import { withSeverityPrefix } from "./module-0336.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/parts/notifications/notificationsList.ts
var NotificationsList = class extends Disposable {
  constructor(container3, options3, instantiationService, contextMenuService) {
    super();
    this.container = container3;
    this.options = options3;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
    this.viewModel = [];
  }
  updateNotificationHeights() {
    if (!this.list) {
      return;
    }
    const focus = this.list.getFocus();
    const focusedIndex = focus[0];
    const focusRelativeTop = typeof focusedIndex === "number" ? this.list.getRelativeTop(focusedIndex) : null;
    this.list.splice(0, this.viewModel.length, this.viewModel);
    if (typeof focusRelativeTop === "number") {
      this.list.reveal(focusedIndex, focusRelativeTop);
    }
    this.list.setFocus(focus);
  }
  show() {
    if (this.isVisible) {
      return;
    }
    if (!this.list) {
      this.createNotificationsList();
    }
    this.isVisible = true;
  }
  createNotificationsList() {
    this.listContainer = $(".notifications-list-container");
    const actionRunner = this._register(this.instantiationService.createInstance(NotificationActionRunner));
    const renderer = this.instantiationService.createInstance(NotificationRenderer, actionRunner);
    const listDelegate = this.listDelegate = new NotificationsListDelegate(this.listContainer);
    const options3 = this.options;
    const list2 = this.list = this._register(this.instantiationService.createInstance(
      WorkbenchList,
      "NotificationsList",
      this.listContainer,
      listDelegate,
      [renderer],
      {
        ...options3,
        setRowLineHeight: false,
        horizontalScrolling: false,
        overrideStyles: {
          listBackground: NOTIFICATIONS_BACKGROUND
        },
        accessibilityProvider: this.instantiationService.createInstance(NotificationAccessibilityProvider, options3)
      }
    ));
    const copyAction = this._register(this.instantiationService.createInstance(CopyNotificationMessageAction, CopyNotificationMessageAction.ID, CopyNotificationMessageAction.LABEL));
    this._register(list2.onContextMenu((e) => {
      if (!e.element) {
        return;
      }
      this.contextMenuService.showContextMenu({
        getAnchor: () => e.anchor,
        getActions: () => [copyAction],
        getActionsContext: () => e.element,
        actionRunner
      });
    }));
    this._register(list2.onMouseDblClick((event) => event.element.toggle()));
    const listFocusTracker = this._register(trackFocus(list2.getHTMLElement()));
    this._register(listFocusTracker.onDidBlur(() => {
      if (getWindow(this.listContainer).document.hasFocus()) {
        list2.setFocus([]);
      }
    }));
    NotificationFocusedContext.bindTo(list2.contextKeyService);
    this._register(list2.onDidChangeSelection((e) => {
      if (e.indexes.length > 0) {
        list2.setSelection([]);
      }
    }));
    this.container.appendChild(this.listContainer);
  }
  updateNotificationsList(start, deleteCount, items = []) {
    const [list2, listContainer] = assertReturnsAllDefined(this.list, this.listContainer);
    const listHasDOMFocus = isAncestorOfActiveElement(listContainer);
    const focusedIndex = list2.getFocus()[0];
    const focusedItem = this.viewModel[focusedIndex];
    let focusRelativeTop = null;
    if (typeof focusedIndex === "number") {
      focusRelativeTop = list2.getRelativeTop(focusedIndex);
    }
    this.viewModel.splice(start, deleteCount, ...items);
    list2.splice(start, deleteCount, items);
    list2.layout();
    if (this.viewModel.length === 0) {
      this.hide();
    } else if (typeof focusedIndex === "number") {
      let indexToFocus = 0;
      if (focusedItem) {
        let indexToFocusCandidate = this.viewModel.indexOf(focusedItem);
        if (indexToFocusCandidate === -1) {
          indexToFocusCandidate = focusedIndex - 1;
        }
        if (indexToFocusCandidate < this.viewModel.length && indexToFocusCandidate >= 0) {
          indexToFocus = indexToFocusCandidate;
        }
      }
      if (typeof focusRelativeTop === "number") {
        list2.reveal(indexToFocus, focusRelativeTop);
      }
      list2.setFocus([indexToFocus]);
    }
    if (this.isVisible && listHasDOMFocus) {
      list2.domFocus();
    }
  }
  updateNotificationHeight(item) {
    const index2 = this.viewModel.indexOf(item);
    if (index2 === -1) {
      return;
    }
    const [list2, listDelegate] = assertReturnsAllDefined(this.list, this.listDelegate);
    list2.updateElementHeight(index2, listDelegate.getHeight(item));
    list2.layout();
  }
  hide() {
    if (!this.isVisible || !this.list) {
      return;
    }
    this.isVisible = false;
    this.list.splice(0, this.viewModel.length);
    this.viewModel = [];
  }
  focusFirst() {
    if (!this.list) {
      return;
    }
    this.list.focusFirst();
    this.list.domFocus();
  }
  hasFocus() {
    if (!this.listContainer) {
      return false;
    }
    return isAncestorOfActiveElement(this.listContainer);
  }
  layout(width2, maxHeight) {
    if (this.listContainer && this.list) {
      this.listContainer.style.width = `${width2}px`;
      if (typeof maxHeight === "number") {
        this.list.getHTMLElement().style.maxHeight = `${maxHeight}px`;
      }
      this.list.layout();
    }
  }
  dispose() {
    this.hide();
    super.dispose();
  }
};

NotificationsList = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextMenuService)
], NotificationsList);

var NotificationAccessibilityProvider = class {
  constructor(_options, _keybindingService, _configurationService) {
    this._options = _options;
    this._keybindingService = _keybindingService;
    this._configurationService = _configurationService;
  }
  getAriaLabel(element) {
    let accessibleViewHint;
    const keybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleView")?.getAriaLabel();
    if (this._configurationService.getValue("accessibility.verbosity.notification")) {
      accessibleViewHint = keybinding ? localize(6832, null, keybinding) : localize(6833, null);
    }
    if (!element.source) {
      return withSeverityPrefix(accessibleViewHint ? localize(6835, null, element.message.raw, accessibleViewHint) : localize(6834, null, element.message.raw), element.severity);
    }
    return withSeverityPrefix(accessibleViewHint ? localize(6838, null, element.message.raw, element.source, accessibleViewHint) : localize(6837, null, element.message.raw, element.source), element.severity);
  }
  getWidgetAriaLabel() {
    return this._options.widgetAriaLabel ?? localize(6836, null);
  }
  getRole() {
    return "dialog";
  }
};

NotificationAccessibilityProvider = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IConfigurationService)
], NotificationAccessibilityProvider);
export { NotificationsList, NotificationAccessibilityProvider };
