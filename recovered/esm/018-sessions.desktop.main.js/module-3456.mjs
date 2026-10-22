// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/notifications/notificationsCenter.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { Emitter } from "./module-0017.mjs";
import { NotificationsCenterVisibleContext } from "./module-0950.mjs";
import { $, Dimension, isAncestorOfActiveElement } from "./module-0075.mjs";
import { getNotificationsPosition } from "./module-1492.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ClearAllNotificationsAction, ConfigureDoNotDisturbAction, ConfigureNotificationsPositionAction, HideNotificationsCenterAction, ToggleDoNotDisturbAction, ToggleDoNotDisturbBySourceAction, hideIcon, hideUpIcon } from "./module-3453.mjs";
import { mainWindow } from "./module-0002.mjs";
import { DEFAULT_CUSTOM_TITLEBAR_HEIGHT } from "./module-0515.mjs";
import { assertReturnsAllDefined, assertReturnsDefined } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";
import { NotificationActionRunner } from "./module-3451.mjs";
import { ActionBar } from "./module-0477.mjs";
import { DropdownMenuActionViewItem } from "./module-0502.mjs";
import { Separator, toAction } from "./module-0082.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { NotificationsList } from "./module-3455.mjs";
import { onDidChangeNotificationRowHeight } from "./module-3454.mjs";
import { NOTIFICATIONS_CENTER_BORDER, NOTIFICATIONS_CENTER_HEADER_BACKGROUND, NOTIFICATIONS_CENTER_HEADER_FOREGROUND } from "./module-0868.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/parts/notifications/notificationsCenter.ts
var NotificationsCenter = class extends Themable {
  constructor(container2, model, themeService, instantiationService, layoutService, contextKeyService, editorGroupService, keybindingService, notificationService, accessibilitySignalService, contextMenuService, configurationService, menuService) {
    super(themeService);
    this.container = container2;
    this.model = model;
    this.instantiationService = instantiationService;
    this.layoutService = layoutService;
    this.contextKeyService = contextKeyService;
    this.editorGroupService = editorGroupService;
    this.keybindingService = keybindingService;
    this.notificationService = notificationService;
    this.accessibilitySignalService = accessibilitySignalService;
    this.contextMenuService = contextMenuService;
    this.configurationService = configurationService;
    this.menuService = menuService;
    // maximum number of notification sources to show in configure dropdown
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this.notificationsCenterVisibleContextKey = NotificationsCenterVisibleContext.bindTo(contextKeyService);
    this.registerListeners();
  }
  static {
    this.MAX_DIMENSIONS = new Dimension(450, 400);
  }
  static {
    this.MAX_NOTIFICATION_SOURCES = 10;
  }
  registerListeners() {
    this._register(this.model.onDidChangeNotification((e4) => this.onDidChangeNotification(e4)));
    this._register(this.layoutService.onDidLayoutMainContainer((dimension) => this.layout(Dimension.lift(dimension))));
    this._register(this.notificationService.onDidChangeFilter(() => this.onDidChangeFilter()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("workbench.notifications.position" /* NOTIFICATIONS_POSITION */)) {
        this.updatePositionClass();
      }
    }));
  }
  updatePositionClass() {
    if (!this.notificationsCenterContainer) {
      return;
    }
    const position2 = getNotificationsPosition(this.configurationService);
    this.notificationsCenterContainer.classList.remove("bottom-right", "bottom-left", "top-right");
    this.notificationsCenterContainer.classList.add(position2);
    this.updateHideActionIcon();
    this.updateTopOffset();
  }
  updateHideActionIcon() {
    if (!this.hideAction) {
      return;
    }
    const position2 = getNotificationsPosition(this.configurationService);
    this.hideAction.class = ThemeIcon.asClassName(position2 === "top-right" /* TOP_RIGHT */ ? hideUpIcon : hideIcon);
  }
  updateTopOffset() {
    if (!this.notificationsCenterContainer) {
      return;
    }
    const position2 = getNotificationsPosition(this.configurationService);
    if (position2 === "top-right" /* TOP_RIGHT */) {
      let topOffset = 7;
      if (this.layoutService.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow)) {
        topOffset += DEFAULT_CUSTOM_TITLEBAR_HEIGHT;
      }
      this.notificationsCenterContainer.style.top = `${topOffset}px`;
    } else {
      this.notificationsCenterContainer.style.top = "";
    }
  }
  onDidChangeFilter() {
    if (this.notificationService.getFilter() === 1 /* ERROR */) {
      this.hide();
    }
  }
  get isVisible() {
    return !!this._isVisible;
  }
  show() {
    if (this._isVisible) {
      const notificationsList2 = assertReturnsDefined(this.notificationsList);
      notificationsList2.show();
      notificationsList2.focusFirst();
      return;
    }
    if (!this.notificationsCenterContainer) {
      this.create();
    }
    this.updateTitle();
    const [notificationsList, notificationsCenterContainer] = assertReturnsAllDefined(this.notificationsList, this.notificationsCenterContainer);
    this._isVisible = true;
    notificationsCenterContainer.classList.add("visible");
    notificationsList.show();
    this.layout(this.workbenchDimensions);
    notificationsList.updateNotificationsList(0, 0, this.model.notifications);
    notificationsList.focusFirst();
    this.updateStyles();
    this.model.notifications.forEach((notification) => notification.updateVisibility(true));
    this.notificationsCenterVisibleContextKey.set(true);
    this._onDidChangeVisibility.fire();
  }
  updateTitle() {
    const [notificationsCenterTitle, clearAllAction] = assertReturnsAllDefined(this.notificationsCenterTitle, this.clearAllAction);
    if (this.model.notifications.length === 0) {
      notificationsCenterTitle.textContent = localize(6815, null);
      clearAllAction.enabled = false;
    } else {
      notificationsCenterTitle.textContent = localize(6813, null);
      clearAllAction.enabled = this.model.notifications.some((notification) => !notification.hasProgress);
    }
  }
  create() {
    this.notificationsCenterContainer = $(".notifications-center");
    this.updatePositionClass();
    this.notificationsCenterHeader = $(".notifications-center-header");
    this.notificationsCenterContainer.appendChild(this.notificationsCenterHeader);
    this.notificationsCenterTitle = $("span.notifications-center-header-title");
    this.notificationsCenterHeader.appendChild(this.notificationsCenterTitle);
    const toolbarContainer = $(".notifications-center-header-toolbar");
    this.notificationsCenterHeader.appendChild(toolbarContainer);
    const actionRunner = this._register(this.instantiationService.createInstance(NotificationActionRunner));
    const that = this;
    const notificationsToolBar = this._register(new ActionBar(toolbarContainer, {
      ariaLabel: localize(6816, null),
      actionRunner,
      actionViewItemProvider: (action, options3) => {
        if (action.id === ConfigureNotificationsPositionAction.ID) {
          return this._register(this.instantiationService.createInstance(DropdownMenuActionViewItem, action, {
            getActions: () => Separator.join(...this.menuService.getMenuActions(MenuId.NotificationsCenterPositionMenu, this.contextKeyService).map(([, actions]) => actions))
          }, this.contextMenuService, {
            ...options3,
            actionRunner,
            classNames: action.class,
            keybindingProvider: (action2) => this.keybindingService.lookupKeybinding(action2.id)
          }));
        }
        if (action.id === ConfigureDoNotDisturbAction.ID) {
          return this._register(this.instantiationService.createInstance(DropdownMenuActionViewItem, action, {
            getActions() {
              const actions = [toAction({
                id: ToggleDoNotDisturbAction.ID,
                label: that.notificationService.getFilter() === 0 /* OFF */ ? localize(6818, null) : localize(6817, null),
                run: () => that.notificationService.setFilter(that.notificationService.getFilter() === 0 /* OFF */ ? 1 /* ERROR */ : 0 /* OFF */)
              })];
              const sortedFilters = that.notificationService.getFilters().sort((a, b) => a.label.localeCompare(b.label));
              for (const source of sortedFilters.slice(0, NotificationsCenter.MAX_NOTIFICATION_SOURCES)) {
                if (actions.length === 1) {
                  actions.push(new Separator());
                }
                actions.push(toAction({
                  id: `${ToggleDoNotDisturbAction.ID}.${source.id}`,
                  label: source.label,
                  checked: source.filter !== 1 /* ERROR */,
                  run: () => that.notificationService.setFilter({
                    ...source,
                    filter: source.filter === 1 /* ERROR */ ? 0 /* OFF */ : 1 /* ERROR */
                  })
                }));
              }
              if (sortedFilters.length > NotificationsCenter.MAX_NOTIFICATION_SOURCES) {
                actions.push(new Separator());
                actions.push(that._register(that.instantiationService.createInstance(ToggleDoNotDisturbBySourceAction, ToggleDoNotDisturbBySourceAction.ID, localize(6812, null))));
              }
              return actions;
            }
          }, this.contextMenuService, {
            ...options3,
            actionRunner,
            classNames: action.class,
            keybindingProvider: (action2) => this.keybindingService.lookupKeybinding(action2.id)
          }));
        }
        return createActionViewItem(this.instantiationService, action, options3);
      }
    }));
    this.clearAllAction = this._register(this.instantiationService.createInstance(ClearAllNotificationsAction, ClearAllNotificationsAction.ID, ClearAllNotificationsAction.LABEL));
    notificationsToolBar.push(this.clearAllAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(this.clearAllAction) });
    this.configureDoNotDisturbAction = this._register(this.instantiationService.createInstance(ConfigureDoNotDisturbAction, ConfigureDoNotDisturbAction.ID, ConfigureDoNotDisturbAction.LABEL));
    notificationsToolBar.push(this.configureDoNotDisturbAction, { icon: true, label: false });
    const configureNotificationsPositionAction = this._register(this.instantiationService.createInstance(ConfigureNotificationsPositionAction, ConfigureNotificationsPositionAction.ID, ConfigureNotificationsPositionAction.LABEL));
    notificationsToolBar.push(configureNotificationsPositionAction, { icon: true, label: false });
    this.hideAction = this._register(this.instantiationService.createInstance(HideNotificationsCenterAction, HideNotificationsCenterAction.ID, HideNotificationsCenterAction.LABEL));
    this.updateHideActionIcon();
    notificationsToolBar.push(this.hideAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(this.hideAction) });
    this.notificationsList = this._register(this.instantiationService.createInstance(NotificationsList, this.notificationsCenterContainer, {
      widgetAriaLabel: localize(6814, null)
    }));
    this._register(onDidChangeNotificationRowHeight(() => this.notificationsList?.updateNotificationHeights()));
    this.container.appendChild(this.notificationsCenterContainer);
  }
  getKeybindingLabel(action) {
    const keybinding = this.keybindingService.lookupKeybinding(action.id);
    return keybinding ? keybinding.getLabel() : null;
  }
  onDidChangeNotification(e4) {
    if (!this._isVisible) {
      return;
    }
    let focusEditor = false;
    const [notificationsList, notificationsCenterContainer] = assertReturnsAllDefined(this.notificationsList, this.notificationsCenterContainer);
    switch (e4.kind) {
      case 0 /* ADD */:
        notificationsList.updateNotificationsList(e4.index, 0, [e4.item]);
        e4.item.updateVisibility(true);
        break;
      case 1 /* CHANGE */:
        switch (e4.detail) {
          case 2 /* ACTIONS */:
            notificationsList.updateNotificationsList(e4.index, 1, [e4.item]);
            break;
          case 1 /* MESSAGE */:
            if (e4.item.expanded) {
              notificationsList.updateNotificationHeight(e4.item);
            }
            break;
        }
        break;
      case 2 /* EXPAND_COLLAPSE */:
        notificationsList.updateNotificationsList(e4.index, 1, [e4.item]);
        break;
      case 3 /* REMOVE */:
        focusEditor = isAncestorOfActiveElement(notificationsCenterContainer);
        notificationsList.updateNotificationsList(e4.index, 1);
        e4.item.updateVisibility(false);
        break;
    }
    this.updateTitle();
    if (this.model.notifications.length === 0) {
      this.hide();
      if (focusEditor) {
        this.editorGroupService.activeGroup.focus();
      }
    }
  }
  hide() {
    if (!this._isVisible || !this.notificationsCenterContainer || !this.notificationsList) {
      return;
    }
    const focusEditor = isAncestorOfActiveElement(this.notificationsCenterContainer);
    this._isVisible = false;
    this.notificationsCenterContainer.classList.remove("visible");
    this.notificationsList.hide();
    this.model.notifications.forEach((notification) => notification.updateVisibility(false));
    this.notificationsCenterVisibleContextKey.set(false);
    this._onDidChangeVisibility.fire();
    if (focusEditor) {
      this.editorGroupService.activeGroup.focus();
    }
  }
  updateStyles() {
    if (this.notificationsCenterContainer && this.notificationsCenterHeader) {
      const borderColor = this.getColor(NOTIFICATIONS_CENTER_BORDER);
      this.notificationsCenterContainer.style.border = borderColor ? `1px solid ${borderColor}` : "";
      const headerForeground = this.getColor(NOTIFICATIONS_CENTER_HEADER_FOREGROUND);
      this.notificationsCenterHeader.style.color = headerForeground ?? "";
      const headerBackground = this.getColor(NOTIFICATIONS_CENTER_HEADER_BACKGROUND);
      this.notificationsCenterHeader.style.background = headerBackground ?? "";
    }
  }
  layout(dimension) {
    this.workbenchDimensions = dimension;
    if (this._isVisible && this.notificationsCenterContainer) {
      const maxWidth = NotificationsCenter.MAX_DIMENSIONS.width;
      const maxHeight = NotificationsCenter.MAX_DIMENSIONS.height;
      let availableWidth = maxWidth;
      let availableHeight = maxHeight;
      if (this.workbenchDimensions) {
        availableWidth = this.workbenchDimensions.width;
        availableWidth -= 2 * 8;
        availableHeight = this.workbenchDimensions.height - 35;
        if (this.layoutService.isVisible("workbench.parts.statusbar" /* STATUSBAR_PART */, mainWindow)) {
          availableHeight -= 22;
        }
        if (this.layoutService.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow)) {
          availableHeight -= 22;
        }
        availableHeight -= 2 * 12;
      }
      this.updateTopOffset();
      const notificationsList = assertReturnsDefined(this.notificationsList);
      notificationsList.layout(Math.min(maxWidth, availableWidth), Math.min(maxHeight, availableHeight));
    }
  }
  clearAll() {
    this.hide();
    for (const notification of [...this.model.notifications]) {
      if (!notification.hasProgress) {
        notification.close();
      }
      this.accessibilitySignalService.playSignal(AccessibilitySignal.clear);
    }
  }
};

NotificationsCenter = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IWorkbenchLayoutService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IEditorGroupsService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, INotificationService),
  __decorateParam(9, IAccessibilitySignalService),
  __decorateParam(10, IContextMenuService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IMenuService)
], NotificationsCenter);
export { NotificationsCenter };
