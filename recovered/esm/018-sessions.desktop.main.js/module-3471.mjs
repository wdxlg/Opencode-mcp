// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/mobileTitlebarPart.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { SideBarVisibleContext } from "./module-0950.mjs";
import { ACCOUNTS_AVATAR_SETTING, IAuthenticationService } from "./module-0952.mjs";
import { autorun } from "./module-0052.mjs";
import { IsNewChatSessionContext } from "./module-1770.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Menus } from "./module-3437.mjs";
import { MOBILE_OPEN_CHANGES_VIEW_COMMAND_ID } from "./module-3470.mjs";
import { getAccountProfileImageUrl, getAccountTitleBarBadgeKey, getAccountTitleBarState, resolveAccountInfo } from "./module-3467.mjs";
import { Separator } from "./module-0082.mjs";
import { fillInActionBarActions } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { IMenuService } from "./module-0092.mjs";
import { IChatDashboardService } from "./module-3468.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/sessions/browser/parts/mobile/mobileTitlebarPart.ts
var MobileTitlebarPart = class extends Disposable {
  constructor(parent, instantiationService, sessionsService, contextKeyService, defaultAccountService, authenticationService, chatEntitlementService, menuService, chatDashboardService, commandService, configurationService) {
    super();
    this.sessionsService = sessionsService;
    this.contextKeyService = contextKeyService;
    this.defaultAccountService = defaultAccountService;
    this.authenticationService = authenticationService;
    this.chatEntitlementService = chatEntitlementService;
    this.menuService = menuService;
    this.chatDashboardService = chatDashboardService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this._onDidClickHamburger = this._register(new Emitter());
    this.onDidClickHamburger = this._onDidClickHamburger.event;
    this._onDidClickNewSession = this._register(new Emitter());
    this.onDidClickNewSession = this._onDidClickNewSession.event;
    this._onDidClickTitle = this._register(new Emitter());
    this.onDidClickTitle = this._onDidClickTitle.event;
    this.isAccountLoading = true;
    this.accountRequestCounter = 0;
    this.avatarRequestCounter = 0;
    this.isAccountMenuVisible = false;
    this.accountPanelDisposable = this._register(new MutableDisposable());
    this.avatarLoadDisposable = this._register(new MutableDisposable());
    this.copilotDashboardStore = this._register(new MutableDisposable());
    // Changes pill state — kept here so the click handler can read the
    // latest set without re-deriving it on each tap.
    this.latestChanges = [];
    this.element = document.createElement("div");
    this.element.className = "mobile-top-bar";
    this._register(toDisposable(() => this.element.remove()));
    parent.prepend(this.element);
    const hamburger = append(this.element, $("button.mobile-top-bar-button"));
    hamburger.setAttribute("aria-label", localize(3841, null));
    const hamburgerIcon = append(hamburger, $("span"));
    const closedIconClasses = ThemeIcon.asClassNameArray(Codicon.layoutSidebarLeftOff);
    const openIconClasses = ThemeIcon.asClassNameArray(Codicon.layoutSidebarLeft);
    hamburgerIcon.classList.add(...closedIconClasses);
    this._register(addDisposableListener(hamburger, EventType.CLICK, () => this._onDidClickHamburger.fire()));
    const sidebarVisibleKeySet = /* @__PURE__ */ new Set([SideBarVisibleContext.key]);
    const updateSidebarIcon = () => {
      const isOpen = !!SideBarVisibleContext.getValue(contextKeyService);
      hamburgerIcon.classList.remove(...closedIconClasses, ...openIconClasses);
      hamburgerIcon.classList.add(...isOpen ? openIconClasses : closedIconClasses);
      hamburger.setAttribute("aria-label", isOpen ? localize(3836, null) : localize(3841, null));
    };
    updateSidebarIcon();
    const center = append(this.element, $("div.mobile-top-bar-center"));
    this.sessionTitleElement = append(center, $("button.mobile-session-title"));
    this.sessionTitleElement.setAttribute("type", "button");
    this.sessionTitleElement.textContent = localize(3839, null);
    this._register(addDisposableListener(this.sessionTitleElement, EventType.CLICK, () => this._onDidClickTitle.fire()));
    this.actionsContainer = append(center, $("div.mobile-top-bar-actions"));
    const changesPill = append(this.element, $("button.mobile-top-bar-button.mobile-changes-pill", { type: "button" }));
    changesPill.setAttribute("aria-label", localize(3834, null));
    changesPill.style.display = "none";
    const changesIcon = append(changesPill, $("span.mobile-changes-pill-icon"));
    changesIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.diffMultiple));
    const changesAddedEl = append(changesPill, $("span.mobile-changes-pill-added"));
    const changesRemovedEl = append(changesPill, $("span.mobile-changes-pill-removed"));
    this._register(addDisposableListener(changesPill, EventType.CLICK, () => this.showChangesPicker()));
    const newSessionButton = append(this.element, $("button.mobile-top-bar-button.mobile-new-session-button"));
    newSessionButton.setAttribute("aria-label", localize(3840, null));
    const newSessionIcon = append(newSessionButton, $("span"));
    newSessionIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.plus));
    this._register(addDisposableListener(newSessionButton, EventType.CLICK, () => this._onDidClickNewSession.fire()));
    this.accountButton = append(this.element, $("button.mobile-top-bar-button.mobile-account-indicator"));
    this.accountButton.setAttribute("aria-label", localize(3833, null));
    this.accountAvatarElement = append(this.accountButton, $("img.mobile-account-avatar", { alt: "", draggable: "false" }));
    this.accountAvatarElement.decoding = "async";
    this.accountAvatarElement.referrerPolicy = "no-referrer";
    this.accountIconElement = append(this.accountButton, $("span"));
    this.accountBadgeElement = append(this.accountButton, $("span.mobile-account-badge"));
    this._register(addDisposableListener(this.accountButton, EventType.CLICK, () => this.showAccountPanel()));
    this._register(this.defaultAccountService.onDidChangeDefaultAccount(() => this.refreshAccount()));
    this._register(this.authenticationService.onDidChangeSessions(() => this.refreshAccount()));
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => this.renderAccountState()));
    this._register(this.chatEntitlementService.onDidChangeSentiment(() => this.renderAccountState()));
    this._register(this.chatEntitlementService.onDidChangeQuotaExceeded(() => this.renderAccountState()));
    this._register(this.chatEntitlementService.onDidChangeQuotaRemaining(() => this.renderAccountState()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(ACCOUNTS_AVATAR_SETTING)) {
        this.refreshAvatar();
      }
    }));
    this.refreshAccount();
    this._register(autorun((reader) => {
      const session = this.sessionsService.activeSession.read(reader);
      const title = session?.title.read(reader);
      this.sessionTitleElement.textContent = title || localize(3839, null);
    }));
    const isNewChatRef = { value: !!IsNewChatSessionContext.getValue(contextKeyService) };
    const renderChangesPill = () => {
      const changes = this.latestChanges;
      let added = 0;
      let removed = 0;
      for (const c of changes) {
        added += c.insertions;
        removed += c.deletions;
      }
      const hasChanges = changes.length > 0;
      const visible = hasChanges && !isNewChatRef.value;
      changesPill.style.display = visible ? "" : "none";
      if (visible) {
        if (added > 0 || removed > 0) {
          changesAddedEl.textContent = `+${added}`;
          changesRemovedEl.textContent = `-${removed}`;
          changesPill.title = localize(3835, null, changes.length, added, removed);
        } else {
          changesAddedEl.textContent = changes.length === 1 ? localize(3842, null) : localize(3837, null, changes.length);
          changesRemovedEl.textContent = "";
          changesPill.title = changes.length === 1 ? localize(3843, null) : localize(3838, null, changes.length);
        }
      }
    };
    this._register(autorun((reader) => {
      const session = this.sessionsService.activeSession.read(reader);
      this.latestChanges = session?.changes.read(reader) ?? [];
      renderChangesPill();
    }));
    const toolbar = this._register(instantiationService.createInstance(MenuWorkbenchToolBar, this.actionsContainer, Menus.MobileTitleBarCenter, {
      hiddenItemStrategy: -1 /* NoHide */,
      telemetrySource: "mobileTitlebar.center",
      toolbarOptions: { primaryGroup: () => true }
    }));
    const newChatKeySet = /* @__PURE__ */ new Set([IsNewChatSessionContext.key]);
    const updateCenterMode = () => {
      const isNewChat = !!IsNewChatSessionContext.getValue(contextKeyService);
      const hasActions = toolbar.getItemsLength() > 0;
      this.element.classList.toggle("show-actions", isNewChat && hasActions);
      newSessionButton.style.display = isNewChat ? "none" : "";
      this.accountButton.style.display = isNewChat ? "" : "none";
      isNewChatRef.value = isNewChat;
      renderChangesPill();
    };
    updateCenterMode();
    this._register(contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(newChatKeySet)) {
        updateCenterMode();
      }
      if (e4.affectsSome(sidebarVisibleKeySet)) {
        updateSidebarIcon();
      }
    }));
    this._register(toolbar.onDidChangeMenuItems(() => updateCenterMode()));
  }
  /**
   * Explicitly set the title shown in the center slot. Called only when
   * overriding the live session title (tests, placeholders). The live
   * subscription will overwrite this on the next session change.
   */
  setTitle(title) {
    this.sessionTitleElement.textContent = title;
  }
  // --- Changes Pill --- //
  /**
   * Tap handler for the changes pill. Opens the dedicated mobile
   * Changes overlay (a master list with file icons + add/remove
   * counts) via {@link MOBILE_OPEN_CHANGES_VIEW_COMMAND_ID}. The
   * overlay's own row taps fan out into per-file diff views with
   * prev/next navigation.
   *
   * The list overlay handles its own single-file shortcut, so the
   * caller just dispatches the command unconditionally.
   */
  showChangesPicker() {
    if (!this.latestChanges.length) {
      return;
    }
    this.commandService.executeCommand(MOBILE_OPEN_CHANGES_VIEW_COMMAND_ID);
  }
  // --- Account Indicator --- //
  async refreshAccount() {
    const requestId = ++this.accountRequestCounter;
    this.isAccountLoading = true;
    this.renderAccountState();
    const info = await resolveAccountInfo(this.defaultAccountService, this.authenticationService);
    if (requestId !== this.accountRequestCounter || this._store.isDisposed) {
      return;
    }
    this.accountName = info?.accountName;
    this.accountProviderId = info?.accountProviderId;
    this.accountProviderLabel = info?.accountProviderLabel;
    this.accountIcon = info?.accountIcon;
    this.isAccountLoading = false;
    this.refreshAvatar();
    this.renderAccountState();
  }
  renderAccountState() {
    const entitlement = this.accountName && this.chatEntitlementService.entitlement === 1 /* Unknown */ ? 2 /* Unresolved */ : this.chatEntitlementService.entitlement;
    const state = getAccountTitleBarState({
      isAccountLoading: this.isAccountLoading,
      accountName: this.accountName,
      accountProviderLabel: this.accountProviderLabel,
      entitlement,
      sentiment: this.chatEntitlementService.sentiment,
      quotas: this.chatEntitlementService.quotas,
      // The conditional-auth opt-in is desktop-only (the native agent host it
      // lets in does not run on mobile/web).
      allowSignedOutWhenUsable: false
    });
    const hasAvatar = !!this.loadedAvatarUrl && !this.isAccountLoading;
    this.accountAvatarElement.classList.toggle("visible", hasAvatar);
    if (hasAvatar && this.accountAvatarElement.src !== this.loadedAvatarUrl) {
      this.accountAvatarElement.src = this.loadedAvatarUrl;
    } else if (!hasAvatar) {
      this.accountAvatarElement.removeAttribute("src");
    }
    const titleBarIcon = state.dotBadge ? Codicon.account : state.icon;
    this.accountIconElement.className = ThemeIcon.asClassName(titleBarIcon);
    this.accountIconElement.classList.toggle("hidden", hasAvatar);
    const badgeKey = getAccountTitleBarBadgeKey(state);
    if (badgeKey !== this.lastBadgeKey) {
      this.lastBadgeKey = badgeKey;
      this.dismissedBadgeKey = void 0;
    }
    const showBadge = !!badgeKey && badgeKey !== this.dismissedBadgeKey;
    this.accountBadgeElement.style.display = showBadge ? "" : "none";
    this.accountBadgeElement.classList.toggle("dot-badge-warning", showBadge && state.dotBadge === "warning");
    this.accountBadgeElement.classList.toggle("dot-badge-error", showBadge && state.dotBadge === "error");
    this.accountButton.setAttribute("aria-label", state.ariaLabel);
  }
  refreshAvatar() {
    const avatarUrl = this.configurationService.getValue(ACCOUNTS_AVATAR_SETTING) ? getAccountProfileImageUrl(this.accountProviderId, this.accountName, this.accountIcon) : void 0;
    if (avatarUrl === this.currentAvatarUrl) {
      return;
    }
    this.currentAvatarUrl = avatarUrl;
    this.loadedAvatarUrl = void 0;
    this.avatarLoadDisposable.clear();
    const requestId = ++this.avatarRequestCounter;
    if (!avatarUrl) {
      this.renderAccountState();
      return;
    }
    const image = new Image();
    image.referrerPolicy = "no-referrer";
    const clearHandlers = () => {
      image.onload = null;
      image.onerror = null;
    };
    image.onload = () => {
      if (requestId !== this.avatarRequestCounter) {
        return;
      }
      this.loadedAvatarUrl = avatarUrl;
      this.renderAccountState();
      clearHandlers();
    };
    image.onerror = () => {
      if (requestId !== this.avatarRequestCounter) {
        return;
      }
      this.loadedAvatarUrl = void 0;
      this.renderAccountState();
      clearHandlers();
    };
    this.avatarLoadDisposable.value = toDisposable(() => {
      clearHandlers();
      image.src = "";
    });
    image.src = avatarUrl;
  }
  // --- Account Sheet --- //
  showAccountPanel() {
    if (this.isAccountMenuVisible) {
      this.accountPanelDisposable.clear();
      return;
    }
    this.accountPanelDisposable.clear();
    const panelStore = new DisposableStore();
    this.accountPanelDisposable.value = panelStore;
    const badgeKey = getAccountTitleBarBadgeKey(getAccountTitleBarState({
      isAccountLoading: this.isAccountLoading,
      accountName: this.accountName,
      accountProviderLabel: this.accountProviderLabel,
      entitlement: this.chatEntitlementService.entitlement,
      sentiment: this.chatEntitlementService.sentiment,
      quotas: this.chatEntitlementService.quotas,
      allowSignedOutWhenUsable: false
    }));
    if (badgeKey) {
      this.dismissedBadgeKey = badgeKey;
    }
    this.isAccountMenuVisible = true;
    this.renderAccountState();
    panelStore.add({
      dispose: () => {
        this.isAccountMenuVisible = false;
        this.copilotDashboardStore.clear();
        this.renderAccountState();
      }
    });
    const closeSheet = () => this.accountPanelDisposable.clear();
    const workbenchContainer = this.element.parentElement;
    const sheet = append(workbenchContainer, $("div.mobile-account-sheet"));
    panelStore.add(toDisposable(() => sheet.remove()));
    const header2 = append(sheet, $("div.mobile-account-sheet-header"));
    const headerTitle = append(header2, $("h2.mobile-account-sheet-title"));
    headerTitle.textContent = localize(3832, null);
    const closeButton = append(header2, $("button.mobile-account-sheet-close", { type: "button" }));
    closeButton.setAttribute("aria-label", localize(3829, null));
    append(closeButton, $("span")).classList.add(...ThemeIcon.asClassNameArray(Codicon.close));
    panelStore.add(addDisposableListener(closeButton, EventType.CLICK, closeSheet));
    const content = append(sheet, $("div.mobile-account-sheet-content"));
    const profile = append(content, $("div.mobile-account-sheet-profile"));
    if (this.loadedAvatarUrl) {
      const avatar = append(profile, $("img.mobile-account-sheet-avatar", { alt: "", draggable: "false" }));
      avatar.src = this.loadedAvatarUrl;
      avatar.referrerPolicy = "no-referrer";
      avatar.decoding = "async";
    } else {
      const avatarPlaceholder = append(profile, $("div.mobile-account-sheet-avatar-placeholder"));
      append(avatarPlaceholder, $("span")).classList.add(...ThemeIcon.asClassNameArray(Codicon.account));
    }
    const profileInfo = append(profile, $("div.mobile-account-sheet-profile-info"));
    if (this.isAccountLoading) {
      append(profileInfo, $("div.mobile-account-sheet-name")).textContent = localize(3830, null);
    } else if (this.accountName) {
      append(profileInfo, $("div.mobile-account-sheet-name")).textContent = this.accountName;
      if (this.accountProviderLabel) {
        append(profileInfo, $("div.mobile-account-sheet-provider")).textContent = this.accountProviderLabel;
      }
    } else {
      append(profileInfo, $("div.mobile-account-sheet-name")).textContent = localize(3831, null);
    }
    const entitlement = this.chatEntitlementService.entitlement;
    const showDashboard = !this.chatEntitlementService.sentiment.hidden && !!this.accountName && entitlement !== 1 /* Unknown */ && entitlement !== 3 /* Available */;
    if (showDashboard) {
      const dashboardSection = append(content, $("div.mobile-account-sheet-section"));
      const store = new DisposableStore();
      this.copilotDashboardStore.value = store;
      const dashboardElement = this.chatDashboardService.createDashboardElement(store);
      if (dashboardElement) {
        append(dashboardSection, dashboardElement);
      }
    }
    const actionsSection = append(content, $("div.mobile-account-sheet-actions"));
    const allActions = this.getSheetActions();
    for (const action of allActions) {
      if (action instanceof Separator) {
        append(actionsSection, $("div.mobile-account-sheet-separator"));
        continue;
      }
      const row = append(actionsSection, $("button.mobile-account-sheet-action", { type: "button" }));
      row.disabled = !action.enabled;
      row.setAttribute("aria-label", action.tooltip || action.label);
      const icon2 = this.getActionIcon(action);
      if (icon2) {
        append(row, $("span.mobile-account-sheet-action-icon")).classList.add(...ThemeIcon.asClassNameArray(icon2));
      }
      append(row, $("span.mobile-account-sheet-action-label")).textContent = action.label;
      panelStore.add(addDisposableListener(row, EventType.CLICK, async (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeSheet();
        await Promise.resolve(action.run());
      }));
    }
  }
  getSheetActions() {
    const menu = this.menuService.createMenu(Menus.AccountMenu, this.contextKeyService);
    const rawActions = [];
    fillInActionBarActions(menu.getActions(), rawActions);
    menu.dispose();
    return rawActions.filter((action) => {
      if (action instanceof Separator) {
        return true;
      }
      if (this.isAccountLoading && action.id === "workbench.action.agenticSignIn") {
        return false;
      }
      return !action.id.startsWith("update.");
    });
  }
  getActionIcon(action) {
    switch (action.id) {
      case "workbench.action.openSettings":
        return Codicon.settingsGear;
      case "workbench.action.agenticSignOut":
        return Codicon.signOut;
      case "workbench.action.agenticSignIn":
        return Codicon.signIn;
      default:
        return void 0;
    }
  }
};

MobileTitlebarPart = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IDefaultAccountService),
  __decorateParam(5, IAuthenticationService),
  __decorateParam(6, IChatEntitlementService),
  __decorateParam(7, IMenuService),
  __decorateParam(8, IChatDashboardService),
  __decorateParam(9, ICommandService),
  __decorateParam(10, IConfigurationService)
], MobileTitlebarPart);
export { MobileTitlebarPart };
