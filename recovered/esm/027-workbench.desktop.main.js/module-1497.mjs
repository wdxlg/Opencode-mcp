// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/compositeBarActions.ts
import { Action, Separator } from "./module-0082.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { badgeBackground, badgeForeground } from "./module-0228.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode, getDomNodePagePosition, hide, show } from "./module-0075.mjs";
import { IconBadge, NumberBadge, ProgressBadge } from "./module-1449.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Codicon } from "./module-0085.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { CompositeDragAndDropObserver, toggleDropEffect } from "./module-1381.mjs";
import { DelayedDragHandler } from "./module-0263.mjs";
import { createConfigureKeybindingAction } from "./module-0517.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService } from "./module-0087.mjs";
import { Action2 } from "./module-0092.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";


// src/vs/workbench/browser/parts/compositeBarActions.ts
var CompositeBarAction = class extends Action {
  constructor(item) {
    super(item.id, item.name, item.classNames?.join(" "), true);
    this.item = item;
    this._onDidChangeCompositeBarActionItem = this._register(new Emitter());
    this.onDidChangeCompositeBarActionItem = this._onDidChangeCompositeBarActionItem.event;
    this._onDidChangeActivity = this._register(new Emitter());
    this.onDidChangeActivity = this._onDidChangeActivity.event;
    this._activities = [];
  }
  get compositeBarActionItem() {
    return this.item;
  }
  set compositeBarActionItem(item) {
    this._label = item.name;
    this.item = item;
    this._onDidChangeCompositeBarActionItem.fire(this);
  }
  get activities() {
    return this._activities;
  }
  set activities(activities) {
    this._activities = activities;
    this._onDidChangeActivity.fire(activities);
  }
  activate() {
    if (!this.checked) {
      this._setChecked(true);
    }
  }
  deactivate() {
    if (this.checked) {
      this._setChecked(false);
    }
  }
};

var CompositeBarActionViewItem = class extends BaseActionViewItem {
  constructor(action, options3, badgesEnabled, themeService, hoverService, configurationService, keybindingService) {
    super(null, action, options3);
    this.badgesEnabled = badgesEnabled;
    this.themeService = themeService;
    this.hoverService = hoverService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.badgeDisposable = this._register(new MutableDisposable());
    this.options = options3;
    this._register(this.themeService.onDidColorThemeChange(this.onThemeChange, this));
    this._register(action.onDidChangeCompositeBarActionItem(() => this.update()));
    this._register(Event2.filter(keybindingService.onDidUpdateKeybindings, () => this.keybindingLabel !== this.computeKeybindingLabel())(() => this.updateTitle()));
    this._register(action.onDidChangeActivity(() => this.updateActivity()));
  }
  get compositeBarActionItem() {
    return this._action.compositeBarActionItem;
  }
  updateStyles() {
    const theme = this.themeService.getColorTheme();
    const colors = this.options.colors(theme);
    if (this.label) {
      if (this.options.icon) {
        const foreground2 = this._action.checked ? colors.activeForegroundColor : colors.inactiveForegroundColor;
        if (this.compositeBarActionItem.iconUrl) {
          this.label.style.backgroundColor = foreground2 ? foreground2.toString() : "";
          this.label.style.color = "";
        } else {
          this.label.style.color = foreground2 ? foreground2.toString() : "";
          this.label.style.backgroundColor = "";
        }
      } else {
        const foreground2 = this._action.checked ? colors.activeForegroundColor : colors.inactiveForegroundColor;
        const borderBottomColor = this._action.checked ? colors.activeBorderBottomColor : null;
        this.label.style.color = foreground2 ? foreground2.toString() : "";
        this.label.style.borderBottomColor = borderBottomColor ? borderBottomColor.toString() : "";
      }
      this.container.style.setProperty("--insert-border-color", colors.dragAndDropBorder ? colors.dragAndDropBorder.toString() : "");
    }
    if (this.badgeContent) {
      const badgeStyles = this.getActivities()[0]?.badge.getColors(theme);
      const badgeFg = badgeStyles?.badgeForeground ?? colors.badgeForeground ?? theme.getColor(badgeForeground);
      const badgeBg = badgeStyles?.badgeBackground ?? colors.badgeBackground ?? theme.getColor(badgeBackground);
      const contrastBorderColor = badgeStyles?.badgeBorder ?? theme.getColor(contrastBorder);
      this.badgeContent.style.color = badgeFg ? badgeFg.toString() : "";
      this.badgeContent.style.backgroundColor = badgeBg ? badgeBg.toString() : "";
      this.badgeContent.style.borderStyle = contrastBorderColor && !this.options.compact ? "solid" : "";
      this.badgeContent.style.borderWidth = contrastBorderColor ? "1px" : "";
      this.badgeContent.style.borderColor = contrastBorderColor ? contrastBorderColor.toString() : "";
    }
  }
  render(container3) {
    super.render(container3);
    this.container = container3;
    if (this.options.icon) {
      this.container.classList.add("icon");
    }
    const role = this.options.isTabList || !this.options.hasPopup ? "tab" : "button";
    this.container.setAttribute("role", role);
    if (this.options.hasPopup) {
      this.container.setAttribute("aria-haspopup", "true");
    }
    this._register(addDisposableListener(this.container, EventType.MOUSE_DOWN, () => {
      this.container.classList.add("clicked");
    }));
    this._register(addDisposableListener(this.container, EventType.MOUSE_UP, () => {
      if (this.mouseUpTimeout) {
        clearTimeout(this.mouseUpTimeout);
      }
      this.mouseUpTimeout = setTimeout(() => {
        this.container.classList.remove("clicked");
      }, 800);
    }));
    this._register(this.hoverService.setupDelayedHover(this.container, () => ({
      content: this.computeTitle(),
      style: 1 /* Pointer */,
      position: {
        hoverPosition: this.options.hoverOptions.position()
      },
      persistence: {
        hideOnKeyDown: true
      }
    }), { groupId: "composite-bar-actions" }));
    this.label = append(container3, $("a"));
    this.badge = append(container3, $(".badge"));
    this.badgeContent = append(this.badge, $(".badge-content"));
    append(container3, $(".active-item-indicator"));
    hide(this.badge);
    this.update();
    this.updateStyles();
    this.updateTitle();
  }
  onThemeChange(theme) {
    this.updateStyles();
  }
  update() {
    this.updateLabel();
    this.updateActivity();
    this.updateTitle();
    this.updateStyles();
  }
  getActivities() {
    if (this._action instanceof CompositeBarAction) {
      return this._action.activities;
    }
    return [];
  }
  updateActivity() {
    if (!this.badge || !this.badgeContent || !(this._action instanceof CompositeBarAction)) {
      return;
    }
    const { badges, type } = this.getVisibleBadges(this.getActivities());
    this.badgeDisposable.value = new DisposableStore();
    clearNode(this.badgeContent);
    hide(this.badge);
    const shouldRenderBadges = this.badgesEnabled(this.compositeBarActionItem.id);
    if (badges.length > 0 && shouldRenderBadges) {
      const classes2 = [];
      if (this.options.compact) {
        classes2.push("compact");
      }
      if (type === "progress") {
        show(this.badge);
        classes2.push("progress-badge");
      } else if (type === "number") {
        const total = badges.reduce((r2, b) => r2 + (b instanceof NumberBadge ? b.number : 0), 0);
        if (total > 0) {
          let badgeNumber = total.toString();
          if (total > 999) {
            const noOfThousands = total / 1e3;
            const floor = Math.floor(noOfThousands);
            badgeNumber = noOfThousands > floor ? `${floor}K+` : `${noOfThousands}K`;
          }
          if (this.options.compact && badgeNumber.length >= 3) {
            classes2.push("compact-content");
          }
          this.badgeContent.textContent = badgeNumber;
          show(this.badge);
        }
      } else if (type === "icon") {
        classes2.push("icon-badge");
        const badgeContentClassess = ["icon-overlay", ...ThemeIcon.asClassNameArray(badges[0].icon)];
        this.badgeContent.classList.add(...badgeContentClassess);
        this.badgeDisposable.value.add(toDisposable(() => this.badgeContent?.classList.remove(...badgeContentClassess)));
        show(this.badge);
      }
      if (classes2.length) {
        this.badge.classList.add(...classes2);
        this.badgeDisposable.value.add(toDisposable(() => this.badge.classList.remove(...classes2)));
      }
    }
    this.updateTitle();
    this.updateStyles();
  }
  getVisibleBadges(activities) {
    const progressBadges = activities.filter((activity) => activity.badge instanceof ProgressBadge).map((activity) => activity.badge);
    if (progressBadges.length > 0) {
      return { badges: progressBadges, type: "progress" };
    }
    const iconBadges = activities.filter((activity) => activity.badge instanceof IconBadge).map((activity) => activity.badge);
    if (iconBadges.length > 0) {
      return { badges: iconBadges, type: "icon" };
    }
    const numberBadges = activities.filter((activity) => activity.badge instanceof NumberBadge).map((activity) => activity.badge);
    if (numberBadges.length > 0) {
      return { badges: numberBadges, type: "number" };
    }
    return { badges: [], type: void 0 };
  }
  updateLabel() {
    this.label.className = "action-label";
    if (this.compositeBarActionItem.classNames) {
      this.label.classList.add(...this.compositeBarActionItem.classNames);
    }
    if (!this.options.icon) {
      this.label.textContent = this.action.label;
    }
  }
  updateTitle() {
    const title = this.computeTitle();
    [this.label, this.badge, this.container].forEach((element) => {
      if (element) {
        element.setAttribute("aria-label", title);
        element.setAttribute("title", "");
        element.removeAttribute("title");
      }
    });
  }
  computeTitle() {
    this.keybindingLabel = this.computeKeybindingLabel();
    let title = this.keybindingLabel ? localize(6260, null, this.compositeBarActionItem.name, this.keybindingLabel) : this.compositeBarActionItem.name;
    const badges = this.getVisibleBadges(this.action.activities).badges;
    for (const badge of badges) {
      const description = badge.getDescription();
      if (!description) {
        continue;
      }
      title = `${title} - ${badge.getDescription()}`;
    }
    return title;
  }
  computeKeybindingLabel() {
    const keybinding = this.compositeBarActionItem.keybindingId ? this.keybindingService.lookupKeybinding(this.compositeBarActionItem.keybindingId) : null;
    return keybinding?.getLabel();
  }
  dispose() {
    super.dispose();
    if (this.mouseUpTimeout) {
      clearTimeout(this.mouseUpTimeout);
    }
    this.badge.remove();
  }
};

CompositeBarActionViewItem = __decorateClass([
  __decorateParam(3, IThemeService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IKeybindingService)
], CompositeBarActionViewItem);

var CompositeOverflowActivityAction = class extends CompositeBarAction {
  constructor(showMenu) {
    super({
      id: "additionalComposites.action",
      name: localize(6254, null),
      classNames: ThemeIcon.asClassNameArray(Codicon.more)
    });
    this.showMenu = showMenu;
  }
  async run() {
    this.showMenu();
  }
};

var CompositeOverflowActivityActionViewItem = class extends CompositeBarActionViewItem {
  constructor(action, getOverflowingComposites, getActiveCompositeId, getBadge, getCompositeOpenAction, colors, hoverOptions, contextMenuService, themeService, hoverService, configurationService, keybindingService) {
    super(action, { icon: true, colors, hasPopup: true, hoverOptions, isTabList: true }, () => true, themeService, hoverService, configurationService, keybindingService);
    this.getOverflowingComposites = getOverflowingComposites;
    this.getActiveCompositeId = getActiveCompositeId;
    this.getBadge = getBadge;
    this.getCompositeOpenAction = getCompositeOpenAction;
    this.contextMenuService = contextMenuService;
  }
  showMenu() {
    this.contextMenuService.showContextMenu({
      getAnchor: () => this.container,
      getActions: () => this.getActions(),
      getCheckedActionsRepresentation: () => "radio"
    });
  }
  getActions() {
    return this.getOverflowingComposites().map((composite) => {
      const action = this.getCompositeOpenAction(composite.id);
      action.checked = this.getActiveCompositeId() === action.id;
      const badge = this.getBadge(composite.id);
      let suffix;
      if (badge instanceof NumberBadge) {
        suffix = badge.number;
      }
      if (suffix) {
        action.label = localize(6258, null, composite.name, suffix);
      } else {
        action.label = composite.name || "";
      }
      return action;
    });
  }
};

CompositeOverflowActivityActionViewItem = __decorateClass([
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IKeybindingService)
], CompositeOverflowActivityActionViewItem);

var CompositeActionViewItem = class extends CompositeBarActionViewItem {
  constructor(options3, compositeActivityAction, toggleCompositePinnedAction, toggleCompositeBadgeAction, compositeContextMenuActionsProvider, contextMenuActionsProvider, dndHandler, compositeBar, contextMenuService, keybindingService, instantiationService, themeService, hoverService, configurationService, commandService) {
    super(
      compositeActivityAction,
      options3,
      compositeBar.areBadgesEnabled.bind(compositeBar),
      themeService,
      hoverService,
      configurationService,
      keybindingService
    );
    this.toggleCompositePinnedAction = toggleCompositePinnedAction;
    this.toggleCompositeBadgeAction = toggleCompositeBadgeAction;
    this.compositeContextMenuActionsProvider = compositeContextMenuActionsProvider;
    this.contextMenuActionsProvider = contextMenuActionsProvider;
    this.dndHandler = dndHandler;
    this.compositeBar = compositeBar;
    this.contextMenuService = contextMenuService;
    this.commandService = commandService;
  }
  render(container3) {
    super.render(container3);
    this.updateChecked();
    this.updateEnabled();
    this._register(addDisposableListener(this.container, EventType.CONTEXT_MENU, (e) => {
      EventHelper.stop(e, true);
      this.showContextMenu(container3);
    }));
    let insertDropBefore = void 0;
    this._register(CompositeDragAndDropObserver.INSTANCE.registerDraggable(this.container, () => {
      return { type: "composite", id: this.compositeBarActionItem.id };
    }, {
      onDragOver: (e) => {
        const isValidMove = e.dragAndDropData.getData().id !== this.compositeBarActionItem.id && this.dndHandler.onDragOver(e.dragAndDropData, this.compositeBarActionItem.id, e.eventData);
        toggleDropEffect(e.eventData.dataTransfer, "move", isValidMove);
        insertDropBefore = this.updateFromDragging(container3, isValidMove, e.eventData);
      },
      onDragLeave: (e) => {
        insertDropBefore = this.updateFromDragging(container3, false, e.eventData);
      },
      onDragEnd: (e) => {
        insertDropBefore = this.updateFromDragging(container3, false, e.eventData);
      },
      onDrop: (e) => {
        EventHelper.stop(e.eventData, true);
        this.dndHandler.drop(e.dragAndDropData, this.compositeBarActionItem.id, e.eventData, insertDropBefore);
        insertDropBefore = this.updateFromDragging(container3, false, e.eventData);
      },
      onDragStart: (e) => {
        if (e.dragAndDropData.getData().id !== this.compositeBarActionItem.id) {
          return;
        }
        if (e.eventData.dataTransfer) {
          e.eventData.dataTransfer.effectAllowed = "move";
        }
        this.blur();
      }
    }));
    [this.badge, this.label].forEach((element) => this._register(new DelayedDragHandler(element, () => {
      if (!this.action.checked) {
        this.action.run();
      }
    })));
    this.updateStyles();
  }
  updateFromDragging(element, showFeedback, event) {
    const rect = element.getBoundingClientRect();
    const posX = event.clientX;
    const posY = event.clientY;
    const height = rect.bottom - rect.top;
    const width2 = rect.right - rect.left;
    const forceTop = posY <= rect.top + height * 0.4;
    const forceBottom = posY > rect.bottom - height * 0.4;
    const preferTop = posY <= rect.top + height * 0.5;
    const forceLeft = posX <= rect.left + width2 * 0.4;
    const forceRight = posX > rect.right - width2 * 0.4;
    const preferLeft = posX <= rect.left + width2 * 0.5;
    const classes2 = element.classList;
    const lastClasses = {
      vertical: classes2.contains("top") ? "top" : classes2.contains("bottom") ? "bottom" : void 0,
      horizontal: classes2.contains("left") ? "left" : classes2.contains("right") ? "right" : void 0
    };
    const top2 = forceTop || preferTop && !lastClasses.vertical || !forceBottom && lastClasses.vertical === "top";
    const bottom = forceBottom || !preferTop && !lastClasses.vertical || !forceTop && lastClasses.vertical === "bottom";
    const left = forceLeft || preferLeft && !lastClasses.horizontal || !forceRight && lastClasses.horizontal === "left";
    const right = forceRight || !preferLeft && !lastClasses.horizontal || !forceLeft && lastClasses.horizontal === "right";
    element.classList.toggle("top", showFeedback && top2);
    element.classList.toggle("bottom", showFeedback && bottom);
    element.classList.toggle("left", showFeedback && left);
    element.classList.toggle("right", showFeedback && right);
    if (!showFeedback) {
      return void 0;
    }
    return { verticallyBefore: top2, horizontallyBefore: left };
  }
  showContextMenu(container3) {
    const actions = [];
    if (this.compositeBarActionItem.keybindingId) {
      actions.push(createConfigureKeybindingAction(this.commandService, this.keybindingService, this.compositeBarActionItem.keybindingId));
    }
    actions.push(this.toggleCompositePinnedAction, this.toggleCompositeBadgeAction);
    const compositeContextMenuActions = this.compositeContextMenuActionsProvider(this.compositeBarActionItem.id);
    if (compositeContextMenuActions.length) {
      actions.push(...compositeContextMenuActions);
    }
    const isPinned = this.compositeBar.isPinned(this.compositeBarActionItem.id);
    if (isPinned) {
      this.toggleCompositePinnedAction.label = localize(6255, null, this.compositeBarActionItem.name);
      this.toggleCompositePinnedAction.checked = false;
      this.toggleCompositePinnedAction.enabled = this.compositeBar.getPinnedCompositeIds().length > 1;
    } else {
      this.toggleCompositePinnedAction.label = localize(6257, null, this.compositeBarActionItem.name);
      this.toggleCompositePinnedAction.enabled = true;
    }
    const isBadgeEnabled = this.compositeBar.areBadgesEnabled(this.compositeBarActionItem.id);
    if (isBadgeEnabled) {
      this.toggleCompositeBadgeAction.label = localize(6256, null);
    } else {
      this.toggleCompositeBadgeAction.label = localize(6259, null);
    }
    const otherActions = this.contextMenuActionsProvider();
    if (otherActions.length) {
      actions.push(new Separator());
      actions.push(...otherActions);
    }
    const elementPosition = getDomNodePagePosition(container3);
    const anchor = {
      x: Math.floor(elementPosition.left + elementPosition.width / 2),
      y: elementPosition.top + elementPosition.height
    };
    this.contextMenuService.showContextMenu({
      getAnchor: () => anchor,
      getActions: () => actions,
      getActionsContext: () => this.compositeBarActionItem.id
    });
  }
  updateChecked() {
    if (this.action.checked) {
      this.container.classList.add("checked");
      this.container.setAttribute("aria-label", this.getTooltip() ?? this.container.title);
      this.container.setAttribute("aria-expanded", "true");
      this.container.setAttribute("aria-selected", "true");
    } else {
      this.container.classList.remove("checked");
      this.container.setAttribute("aria-label", this.getTooltip() ?? this.container.title);
      this.container.setAttribute("aria-expanded", "false");
      this.container.setAttribute("aria-selected", "false");
    }
    this.updateStyles();
  }
  updateEnabled() {
    if (!this.element) {
      return;
    }
    if (this.action.enabled) {
      this.element.classList.remove("disabled");
    } else {
      this.element.classList.add("disabled");
    }
  }
  dispose() {
    super.dispose();
    this.label.remove();
  }
};

CompositeActionViewItem = __decorateClass([
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, IThemeService),
  __decorateParam(12, IHoverService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, ICommandService)
], CompositeActionViewItem);

var ToggleCompositePinnedAction = class extends Action {
  constructor(activity, compositeBar) {
    super("show.toggleCompositePinned", activity ? activity.name : localize(6261, null));
    this.activity = activity;
    this.compositeBar = compositeBar;
    this.checked = !!this.activity && this.compositeBar.isPinned(this.activity.id);
  }
  async run(context2) {
    const id2 = this.activity ? this.activity.id : context2;
    if (this.compositeBar.isPinned(id2)) {
      this.compositeBar.unpin(id2);
    } else {
      this.compositeBar.pin(id2);
    }
  }
};

var ToggleCompositeBadgeAction = class extends Action {
  constructor(compositeBarActionItem, compositeBar) {
    super("show.toggleCompositeBadge", compositeBarActionItem ? compositeBarActionItem.name : localize(6262, null));
    this.compositeBarActionItem = compositeBarActionItem;
    this.compositeBar = compositeBar;
    this.checked = false;
  }
  async run(context2) {
    const id2 = this.compositeBarActionItem ? this.compositeBarActionItem.id : context2;
    this.compositeBar.toggleBadgeEnablement(id2);
  }
};

var SwitchCompositeViewAction = class extends Action2 {
  constructor(desc, location2, offset) {
    super(desc);
    this.location = location2;
    this.offset = offset;
  }
  async run(accessor) {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const activeComposite = paneCompositeService.getActivePaneComposite(this.location);
    if (!activeComposite) {
      return;
    }
    let targetCompositeId;
    const visibleCompositeIds = paneCompositeService.getVisiblePaneCompositeIds(this.location);
    for (let i2 = 0; i2 < visibleCompositeIds.length; i2++) {
      if (visibleCompositeIds[i2] === activeComposite.getId()) {
        targetCompositeId = visibleCompositeIds[(i2 + visibleCompositeIds.length + this.offset) % visibleCompositeIds.length];
        break;
      }
    }
    if (typeof targetCompositeId !== "undefined") {
      await paneCompositeService.openPaneComposite(targetCompositeId, this.location, true);
    }
  }
};
export { CompositeBarAction, CompositeBarActionViewItem, CompositeOverflowActivityAction, CompositeOverflowActivityActionViewItem, CompositeActionViewItem, ToggleCompositePinnedAction, ToggleCompositeBadgeAction, SwitchCompositeViewAction };
