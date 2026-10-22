// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/notifications/notificationsViewer.ts
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, EventHelper, EventType, addDisposableListener, clearNode, isEventLike } from "./module-0075.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { ChoiceAction, NotificationViewItem, getNotificationsPosition } from "./module-1492.mjs";
import { localize } from "./module-0001.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { ActionBar } from "./module-0477.mjs";
import { ClearNotificationAction, CollapseNotificationAction, ConfigureNotificationAction, ExpandNotificationAction, getNotificationCollapseIcon, getNotificationExpandIcon } from "./module-3453.mjs";
import { DropdownMenuActionViewItem } from "./module-0502.mjs";
import { INotificationService, Severity2, isNotificationSource } from "./module-0336.mjs";
import { ActionRunner, Separator, toAction } from "./module-0082.mjs";
import { ProgressBar } from "./module-1330.mjs";
import { defaultButtonStyles, defaultProgressBarStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { URI } from "./module-0032.mjs";
import { ButtonBar } from "./module-0546.mjs";
import { Codicon } from "./module-0085.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/parts/notifications/notificationsViewer.ts
var DEFAULT_NOTIFICATION_ROW_HEIGHT = 42;

var COMPACT_NOTIFICATION_ROW_HEIGHT = 34;

var notificationRowHeight = DEFAULT_NOTIFICATION_ROW_HEIGHT;

var onDidChangeNotificationRowHeightEmitter = new Emitter();

var onDidChangeNotificationRowHeight = onDidChangeNotificationRowHeightEmitter.event;

function setNotificationRowHeight(height) {
  if (height !== notificationRowHeight) {
    notificationRowHeight = height;
    onDidChangeNotificationRowHeightEmitter.fire(height);
  }
}

var NotificationsListDelegate = class _NotificationsListDelegate {
  static get ROW_HEIGHT() {
    return notificationRowHeight;
  }
  static {
    this.LINE_HEIGHT = 22;
  }
  constructor(container2) {
    this.offsetHelper = this.createOffsetHelper(container2);
  }
  createOffsetHelper(container2) {
    return container2.appendChild($(".notification-offset-helper"));
  }
  getHeight(notification) {
    if (!notification.expanded) {
      return _NotificationsListDelegate.ROW_HEIGHT;
    }
    let expandedHeight = _NotificationsListDelegate.ROW_HEIGHT;
    const preferredMessageHeight = this.computePreferredHeight(notification);
    const messageOverflows = _NotificationsListDelegate.LINE_HEIGHT < preferredMessageHeight;
    if (messageOverflows) {
      const overflow = preferredMessageHeight - _NotificationsListDelegate.LINE_HEIGHT;
      expandedHeight += overflow;
    }
    if (notification.source || isNonEmptyArray(notification.actions?.primary)) {
      expandedHeight += _NotificationsListDelegate.ROW_HEIGHT;
    }
    if (expandedHeight === _NotificationsListDelegate.ROW_HEIGHT) {
      notification.collapse(
        true
        /* skip events, no change in height */
      );
    }
    return expandedHeight;
  }
  computePreferredHeight(notification) {
    let actions = 0;
    if (!notification.hasProgress) {
      actions++;
    }
    if (notification.canCollapse) {
      actions++;
    }
    if (isNonEmptyArray(notification.actions?.secondary)) {
      actions++;
    }
    this.offsetHelper.style.width = `${450 - (10 + 30 + actions * 30 - Math.max(actions - 1, 0) * 4)}px`;
    const renderedMessage = NotificationMessageRenderer.render(notification.message);
    this.offsetHelper.appendChild(renderedMessage);
    const preferredHeight = Math.max(this.offsetHelper.offsetHeight, this.offsetHelper.scrollHeight);
    clearNode(this.offsetHelper);
    return preferredHeight;
  }
  getTemplateId(element) {
    if (element instanceof NotificationViewItem) {
      return NotificationRenderer.TEMPLATE_ID;
    }
    throw new Error("unknown element type: " + element);
  }
};

var NotificationMessageRenderer = class {
  static render(message, actionHandler) {
    const messageContainer = $("span");
    for (const node of message.linkedText.nodes) {
      if (typeof node === "string") {
        messageContainer.appendChild(document.createTextNode(node));
      } else {
        let title = node.title;
        if (!title && node.href.startsWith("command:")) {
          title = localize(6853, null, node.href.substr("command:".length));
        } else if (!title) {
          title = node.href;
        }
        const anchor = $("a", { href: node.href, title, tabIndex: 0 }, node.label);
        if (actionHandler) {
          const handleOpen = (e4) => {
            if (isEventLike(e4)) {
              EventHelper.stop(e4, true);
            }
            actionHandler.callback(node.href);
          };
          const onClick4 = actionHandler.toDispose.add(new DomEmitter(anchor, EventType.CLICK)).event;
          const onKeydown = actionHandler.toDispose.add(new DomEmitter(anchor, EventType.KEY_DOWN)).event;
          const onSpaceOrEnter = Event2.chain(onKeydown, ($129) => $129.filter((e4) => {
            const event = new StandardKeyboardEvent(e4);
            return event.equals(10 /* Space */) || event.equals(3 /* Enter */);
          }));
          actionHandler.toDispose.add(Gesture.addTarget(anchor));
          const onTap = actionHandler.toDispose.add(new DomEmitter(anchor, EventType2.Tap)).event;
          Event2.any(onClick4, onTap, onSpaceOrEnter)(handleOpen, null, actionHandler.toDispose);
        }
        messageContainer.appendChild(anchor);
      }
    }
    return messageContainer;
  }
};

var NotificationRenderer = class {
  constructor(actionRunner, contextMenuService, instantiationService, notificationService) {
    this.actionRunner = actionRunner;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.notificationService = notificationService;
  }
  static {
    this.TEMPLATE_ID = "notification";
  }
  get templateId() {
    return NotificationRenderer.TEMPLATE_ID;
  }
  renderTemplate(container2) {
    const data = /* @__PURE__ */ Object.create(null);
    data.toDispose = new DisposableStore();
    data.container = $(".notification-list-item");
    data.mainRow = $(".notification-list-item-main-row");
    data.icon = $(".notification-list-item-icon.codicon");
    data.message = $(".notification-list-item-message");
    const that = this;
    const toolbarContainer = $(".notification-list-item-toolbar-container");
    data.toolbar = new ActionBar(
      toolbarContainer,
      {
        ariaLabel: localize(6854, null),
        actionViewItemProvider: (action, options3) => {
          if (action instanceof ConfigureNotificationAction) {
            return data.toDispose.add(new DropdownMenuActionViewItem(action, {
              getActions() {
                const actions = [];
                const source = { id: action.notification.sourceId, label: action.notification.source };
                if (isNotificationSource(source)) {
                  const isSourceFiltered = that.notificationService.getFilter(source) === 1 /* ERROR */;
                  actions.push(toAction({
                    id: source.id,
                    label: isSourceFiltered ? localize(6857, null, source.label) : localize(6856, null, source.label),
                    run: () => that.notificationService.setFilter({ ...source, filter: isSourceFiltered ? 0 /* OFF */ : 1 /* ERROR */ })
                  }));
                  if (action.notification.actions?.secondary?.length) {
                    actions.push(new Separator());
                  }
                }
                if (Array.isArray(action.notification.actions?.secondary)) {
                  actions.push(...action.notification.actions.secondary);
                }
                return actions;
              }
            }, this.contextMenuService, {
              ...options3,
              actionRunner: this.actionRunner,
              classNames: action.class
            }));
          }
          return void 0;
        },
        actionRunner: this.actionRunner
      }
    );
    data.toDispose.add(data.toolbar);
    data.detailsRow = $(".notification-list-item-details-row");
    data.source = $(".notification-list-item-source");
    data.buttonsContainer = $(".notification-list-item-buttons-container");
    container2.appendChild(data.container);
    data.container.appendChild(data.detailsRow);
    data.detailsRow.appendChild(data.source);
    data.detailsRow.appendChild(data.buttonsContainer);
    data.container.appendChild(data.mainRow);
    data.mainRow.appendChild(data.icon);
    data.mainRow.appendChild(data.message);
    data.mainRow.appendChild(toolbarContainer);
    data.progress = new ProgressBar(container2, defaultProgressBarStyles);
    data.toDispose.add(data.progress);
    data.renderer = this.instantiationService.createInstance(NotificationTemplateRenderer, data, this.actionRunner);
    data.toDispose.add(data.renderer);
    return data;
  }
  renderElement(notification, index2, data) {
    data.renderer.setInput(notification);
  }
  disposeTemplate(templateData) {
    dispose(templateData.toDispose);
  }
};

NotificationRenderer = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, INotificationService)
], NotificationRenderer);

var NotificationTemplateRenderer = class extends Disposable {
  constructor(template2, actionRunner, openerService, instantiationService, keybindingService, contextMenuService, hoverService, configurationService) {
    super();
    this.template = template2;
    this.actionRunner = actionRunner;
    this.openerService = openerService;
    this.instantiationService = instantiationService;
    this.keybindingService = keybindingService;
    this.contextMenuService = contextMenuService;
    this.hoverService = hoverService;
    this.inputDisposables = this._register(new DisposableStore());
    if (!NotificationTemplateRenderer.closeNotificationAction) {
      NotificationTemplateRenderer.closeNotificationAction = instantiationService.createInstance(ClearNotificationAction, ClearNotificationAction.ID, ClearNotificationAction.LABEL);
      NotificationTemplateRenderer.expandNotificationAction = instantiationService.createInstance(ExpandNotificationAction, ExpandNotificationAction.ID, ExpandNotificationAction.LABEL);
      NotificationTemplateRenderer.collapseNotificationAction = instantiationService.createInstance(CollapseNotificationAction, CollapseNotificationAction.ID, CollapseNotificationAction.LABEL);
      NotificationTemplateRenderer.updateExpandCollapseIcons(configurationService);
    }
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("workbench.notifications.position" /* NOTIFICATIONS_POSITION */)) {
        NotificationTemplateRenderer.updateExpandCollapseIcons(configurationService);
      }
    }));
  }
  static updateExpandCollapseIcons(configurationService) {
    if (!NotificationTemplateRenderer.expandNotificationAction) {
      return;
    }
    const position2 = getNotificationsPosition(configurationService);
    NotificationTemplateRenderer.expandNotificationAction.class = ThemeIcon.asClassName(getNotificationExpandIcon(position2));
    NotificationTemplateRenderer.collapseNotificationAction.class = ThemeIcon.asClassName(getNotificationCollapseIcon(position2));
  }
  static {
    this.SEVERITIES = [Severity2.Info, Severity2.Warning, Severity2.Error];
  }
  setInput(notification) {
    this.inputDisposables.clear();
    this.render(notification);
  }
  render(notification) {
    this.template.container.classList.toggle("expanded", notification.expanded);
    this.inputDisposables.add(addDisposableListener(this.template.container, EventType.MOUSE_UP, (e4) => {
      if (e4.button === 1) {
        EventHelper.stop(e4, true);
      }
    }));
    this.inputDisposables.add(addDisposableListener(this.template.container, EventType.AUXCLICK, (e4) => {
      if (!notification.hasProgress && e4.button === 1) {
        EventHelper.stop(e4, true);
        notification.close();
      }
    }));
    this.renderSeverity(notification);
    const messageCustomHover = this.inputDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.template.message, ""));
    const messageOverflows = this.renderMessage(notification, messageCustomHover);
    this.renderSecondaryActions(notification, messageOverflows);
    const sourceCustomHover = this.inputDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.template.source, ""));
    this.renderSource(notification, sourceCustomHover);
    this.renderButtons(notification);
    this.renderProgress(notification);
    this.inputDisposables.add(notification.onDidChangeContent((event) => {
      switch (event.kind) {
        case 0 /* SEVERITY */:
          this.renderSeverity(notification);
          break;
        case 3 /* PROGRESS */:
          this.renderProgress(notification);
          break;
        case 1 /* MESSAGE */:
          this.renderMessage(notification, messageCustomHover);
          break;
      }
    }));
  }
  renderSeverity(notification) {
    NotificationTemplateRenderer.SEVERITIES.forEach((severity) => {
      if (notification.severity !== severity) {
        this.template.icon.classList.remove(...ThemeIcon.asClassNameArray(this.toSeverityIcon(severity)));
      }
    });
    this.template.icon.classList.add(...ThemeIcon.asClassNameArray(this.toSeverityIcon(notification.severity)));
  }
  renderMessage(notification, customHover) {
    clearNode(this.template.message);
    this.template.message.appendChild(NotificationMessageRenderer.render(notification.message, {
      callback: (link2) => this.openerService.open(URI.parse(link2), { allowCommands: true }),
      toDispose: this.inputDisposables
    }));
    const messageOverflows = notification.canCollapse && !notification.expanded && this.template.message.scrollWidth > this.template.message.clientWidth;
    customHover.update(messageOverflows ? this.template.message.textContent + "" : "");
    return messageOverflows;
  }
  renderSecondaryActions(notification, messageOverflows) {
    const actions = [];
    if (isNonEmptyArray(notification.actions?.secondary)) {
      const configureNotificationAction = this.instantiationService.createInstance(ConfigureNotificationAction, ConfigureNotificationAction.ID, ConfigureNotificationAction.LABEL, notification);
      actions.push(configureNotificationAction);
      this.inputDisposables.add(configureNotificationAction);
    }
    let showExpandCollapseAction = false;
    if (notification.canCollapse) {
      if (notification.expanded) {
        showExpandCollapseAction = true;
      } else if (notification.source) {
        showExpandCollapseAction = true;
      } else if (messageOverflows) {
        showExpandCollapseAction = true;
      }
    }
    if (showExpandCollapseAction) {
      actions.push(notification.expanded ? NotificationTemplateRenderer.collapseNotificationAction : NotificationTemplateRenderer.expandNotificationAction);
    }
    if (!notification.hasProgress) {
      actions.push(NotificationTemplateRenderer.closeNotificationAction);
    }
    this.template.toolbar.clear();
    this.template.toolbar.context = notification;
    actions.forEach((action) => this.template.toolbar.push(action, { icon: true, label: false, keybinding: this.getKeybindingLabel(action) }));
  }
  renderSource(notification, sourceCustomHover) {
    if (notification.expanded && notification.source) {
      this.template.source.textContent = localize(6855, null, notification.source);
      sourceCustomHover.update(notification.source);
    } else {
      this.template.source.textContent = "";
      sourceCustomHover.update("");
    }
  }
  renderButtons(notification) {
    clearNode(this.template.buttonsContainer);
    const primaryActions = notification.actions ? notification.actions.primary : void 0;
    if (notification.expanded && isNonEmptyArray(primaryActions)) {
      const that = this;
      const actionRunner = this.inputDisposables.add(new class extends ActionRunner {
        async runAction(action) {
          that.actionRunner.run(action, notification);
          if (!(action instanceof ChoiceAction) || !action.keepOpen) {
            notification.close();
          }
        }
      }());
      const buttonToolbar = this.inputDisposables.add(new ButtonBar(this.template.buttonsContainer));
      for (let i2 = 0; i2 < primaryActions.length; i2++) {
        const action = primaryActions[i2];
        const options3 = {
          title: true,
          // assign titles to buttons in case they overflow
          secondary: i2 > 0,
          ...defaultButtonStyles
        };
        const dropdownActions = action instanceof ChoiceAction ? action.menu : void 0;
        const button = this.inputDisposables.add(
          dropdownActions ? buttonToolbar.addButtonWithDropdown({
            ...options3,
            contextMenuProvider: this.contextMenuService,
            actions: dropdownActions,
            actionRunner
          }) : buttonToolbar.addButton(options3)
        );
        button.label = action.label;
        this.inputDisposables.add(button.onDidClick((e4) => {
          if (e4) {
            EventHelper.stop(e4, true);
          }
          actionRunner.run(action);
        }));
      }
    }
  }
  renderProgress(notification) {
    if (!notification.hasProgress) {
      this.template.progress.stop().hide();
      return;
    }
    const state = notification.progress.state;
    if (state.infinite) {
      this.template.progress.infinite().show();
    } else if (typeof state.total === "number" || typeof state.worked === "number") {
      if (typeof state.total === "number" && !this.template.progress.hasTotal()) {
        this.template.progress.total(state.total);
      }
      if (typeof state.worked === "number") {
        this.template.progress.setWorked(state.worked).show();
      }
    } else {
      this.template.progress.done().hide();
    }
  }
  toSeverityIcon(severity) {
    switch (severity) {
      case Severity2.Warning:
        return Codicon.warning;
      case Severity2.Error:
        return Codicon.error;
    }
    return Codicon.info;
  }
  getKeybindingLabel(action) {
    const keybinding = this.keybindingService.lookupKeybinding(action.id);
    return keybinding ? keybinding.getLabel() : null;
  }
};

NotificationTemplateRenderer = __decorateClass([
  __decorateParam(2, IOpenerService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IConfigurationService)
], NotificationTemplateRenderer);
export { setNotificationRowHeight, DEFAULT_NOTIFICATION_ROW_HEIGHT, COMPACT_NOTIFICATION_ROW_HEIGHT, notificationRowHeight, onDidChangeNotificationRowHeightEmitter, onDidChangeNotificationRowHeight, NotificationsListDelegate, NotificationMessageRenderer, NotificationRenderer, NotificationTemplateRenderer };
