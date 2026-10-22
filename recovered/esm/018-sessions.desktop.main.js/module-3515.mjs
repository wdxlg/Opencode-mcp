// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/accountMenu/browser/account.contribution.ts
import { Menus } from "./module-3437.mjs";
import { fromNow, safeIntl } from "./module-0120.mjs";
import { language } from "./module-0014.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IsPhoneLayoutContext, SessionHasChangesContext, SessionIsCreatedContext, SessionsWelcomeVisibleContext, SinglePaneLayoutEnabledContext } from "./module-1770.mjs";
import { registerUpdateTitleBarMenuPlacement } from "./module-3322.mjs";
import { IsAuxiliaryWindowContext } from "./module-0950.mjs";
import { Action2, IMenuService, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { AGENTIC_SIGN_IN_COMMAND_ID } from "./module-1800.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ICommandService } from "./module-0087.mjs";
import { CHAT_SETUP_ACTION_ID } from "./module-1475.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ACCOUNTS_AVATAR_SETTING, IAuthenticationService } from "./module-0952.mjs";
import { IAuthenticationUsageService } from "./module-1415.mjs";
import { IAuthenticationAccessService } from "./module-0969.mjs";
import { severity_default } from "./module-0266.mjs";
import { appendUpdateMenuItems } from "./module-3320.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { observeAllowSignedOutWhenUsable } from "./module-1799.mjs";
import { getAccountProfileImageUrl, getAccountTitleBarBadgeKey, getAccountTitleBarState, resolveAccountInfo } from "./module-3467.mjs";
import { AgentHostCodexAgentEnabledSettingId } from "./module-1108.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { runOnChange } from "./module-0064.mjs";
import { $, EventType, addDisposableListener, append, clearNode, disposableWindowInterval, getDomNodePagePosition } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { mainWindow } from "./module-0002.mjs";
import { fillInActionBarActions } from "./module-0516.mjs";
import { ICodexAccountService, createCodexAccountMenuActions, hasSignedInCodexChatGPTAccount, shouldShowCodexAccount } from "./module-2155.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { MANAGE_CHAT_COMMAND_ID } from "./module-0965.mjs";
import { AICustomizationManagementCommands2 } from "./module-1471.mjs";
import { SessionType } from "./module-0961.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { SessionsChatPetAchievementBadges } from "./module-3514.mjs";
import { CHAT_PET_OPEN_ACHIEVEMENTS_COMMAND_ID } from "./module-2111.mjs";
import { IChatEntitlementService, getChatPlanName, getQuotaReset, getQuotaUsage } from "./module-0954.mjs";
import { ChatStatusDashboard } from "./module-2762.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IChatDashboardService } from "./module-3468.mjs";


// src/vs/sessions/contrib/accountMenu/browser/account.contribution.ts
var AccountMenu = Menus.AccountMenu;

var SessionsTitleBarAccountWidgetAction = "sessions.action.titleBarAccountWidget";

var SESSIONS_ACCOUNT_TITLEBAR_PANEL_WIDTH = 400;

var PERSONALIZE_ACTION_IDS = [
  "workbench.action.openSettings"
];

var SIGN_OUT_ACTION_ID = "workbench.action.agenticSignOut";

var accountDateFormatter = safeIntl.DateTimeFormat(language, { month: "short", day: "numeric" });

var accountTimeFormatter = safeIntl.DateTimeFormat(language, { hour: "numeric", minute: "numeric" });

function shouldShowAccountPanelSummary(state, hasCopilotDashboard, isAccountLoading) {
  return !hasCopilotDashboard && !isAccountLoading && !(state.source === "copilot" && state.kind === "prominent");
}

var sessionsChangesPrimaryActionVisible = ContextKeyExpr.and(
  SinglePaneLayoutEnabledContext,
  SessionIsCreatedContext,
  SessionHasChangesContext
);

registerUpdateTitleBarMenuPlacement(Menus.TitleBarUpdate, {
  when: ContextKeyExpr.and(
    IsAuxiliaryWindowContext.toNegated(),
    SessionsWelcomeVisibleContext.toNegated(),
    sessionsChangesPrimaryActionVisible.negate()
  )
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: AGENTIC_SIGN_IN_COMMAND_ID,
      title: localize2(4024, "Sign in to use GitHub Copilot"),
      icon: Codicon.signIn,
      menu: {
        id: AccountMenu,
        when: ContextKeyExpr.notEquals("defaultAccountStatus", "available"),
        group: "1_account",
        order: 1
      }
    });
  }
  async run(accessor) {
    await accessor.get(ICommandService).executeCommand(CHAT_SETUP_ACTION_ID);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.agenticSignOut",
      title: localize2(4025, "Sign Out"),
      icon: Codicon.signOut,
      menu: {
        id: AccountMenu,
        when: ContextKeyExpr.equals("defaultAccountStatus", "available"),
        group: "1_account",
        order: 1
      }
    });
  }
  async run(accessor) {
    const defaultAccountService = accessor.get(IDefaultAccountService);
    const dialogService = accessor.get(IDialogService);
    const authenticationService = accessor.get(IAuthenticationService);
    const authenticationUsageService = accessor.get(IAuthenticationUsageService);
    const authenticationAccessService = accessor.get(IAuthenticationAccessService);
    const defaultAccount = await defaultAccountService.getDefaultAccount();
    if (!defaultAccount) {
      return;
    }
    const providerId = defaultAccount.authenticationProvider.id;
    const accountLabel = defaultAccount.accountName;
    const { confirmed } = await dialogService.confirm({
      type: severity_default.Info,
      message: localize(3993, null),
      detail: localize(3992, null, accountLabel),
      primaryButton: localize(3991, null)
    });
    if (!confirmed) {
      return;
    }
    const allSessions = await authenticationService.getSessions(providerId);
    const sessions = allSessions.filter((session) => session.account.label === accountLabel);
    await Promise.all(sessions.map((session) => authenticationService.removeSession(providerId, session.id)));
    authenticationUsageService.removeAccountUsage(providerId, accountLabel);
    authenticationAccessService.removeAllowedExtensions(providerId, accountLabel);
  }
});

MenuRegistry.appendMenuItem(AccountMenu, {
  command: {
    id: "workbench.action.openSettings",
    title: localize(4023, null),
    icon: Codicon.settingsGear
  },
  when: IsPhoneLayoutContext.negate(),
  group: "2_settings",
  order: 1
});

appendUpdateMenuItems(AccountMenu, "3_updates");

var TitleBarAccountWidget = class extends BaseActionViewItem {
  constructor(action, options3, defaultAccountService, authenticationService, menuService, contextKeyService, hoverService, instantiationService, chatEntitlementService, codexAccountService, configurationService, commandService) {
    super(void 0, action, options3);
    this.defaultAccountService = defaultAccountService;
    this.authenticationService = authenticationService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    this.chatEntitlementService = chatEntitlementService;
    this.codexAccountService = codexAccountService;
    this.configurationService = configurationService;
    this.commandService = commandService;
    this.isAccountLoading = true;
    this.accountRequestCounter = 0;
    this.avatarRequestCounter = 0;
    this.codexAvatarRequestCounter = 0;
    this.isMenuVisible = false;
    this.copilotDashboardStore = this._register(new MutableDisposable());
    this.clickPanelDisposable = this._register(new MutableDisposable());
    this.avatarLoadDisposable = this._register(new MutableDisposable());
    this.codexAvatarLoadDisposable = this._register(new MutableDisposable());
    this.lastCodexAccount = this.codexAccountService.account;
    this.allowSignedOutWhenUsable = observeAllowSignedOutWhenUsable(configurationService);
    this.lastState = getAccountTitleBarState({
      isAccountLoading: true,
      entitlement: this.chatEntitlementService.entitlement,
      sentiment: this.chatEntitlementService.sentiment,
      quotas: this.chatEntitlementService.quotas,
      allowSignedOutWhenUsable: false
    });
    this._register(this.defaultAccountService.onDidChangeDefaultAccount(() => this.refreshAccount()));
    this._register(this.authenticationService.onDidChangeSessions(() => this.refreshAccount()));
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => this.renderState()));
    this._register(this.chatEntitlementService.onDidChangeSentiment(() => this.renderState()));
    this._register(this.chatEntitlementService.onDidChangeQuotaExceeded(() => this.renderState()));
    this._register(this.chatEntitlementService.onDidChangeQuotaRemaining(() => this.renderState()));
    this._register(this.codexAccountService.onDidChangeAccount((account) => {
      if (hasCodexAccountPanelContentChanged(this.lastCodexAccount, account)) {
        this.clickPanelDisposable.clear();
      }
      this.lastCodexAccount = account;
      this.refreshCodexAvatar();
      this.renderState();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(AgentHostCodexAgentEnabledSettingId) || event.affectsConfiguration(ChatAIDisabledSettingId)) {
        this.clickPanelDisposable.clear();
        this.renderState();
      }
      if (event.affectsConfiguration(ACCOUNTS_AVATAR_SETTING)) {
        this.refreshAvatar();
        this.refreshCodexAvatar();
      }
    }));
    this._register(runOnChange(this.allowSignedOutWhenUsable, () => this.renderState()));
    this.refreshAccount();
    this.refreshCodexAvatar();
  }
  setFocusable(_focusable) {
  }
  render(container2) {
    super.render(container2);
    this.container = container2;
    container2.classList.add("sessions-account-titlebar-widget");
    container2.setAttribute("role", "button");
    container2.tabIndex = 0;
    this.avatarElement = append(container2, $("img.sessions-account-titlebar-widget-avatar", { alt: localize(3989, null), draggable: "false" }));
    this.avatarElement.decoding = "async";
    this.avatarElement.referrerPolicy = "no-referrer";
    this.iconElement = append(container2, $(".sessions-account-titlebar-widget-icon"));
    this.labelElement = append(container2, $("span.sessions-account-titlebar-widget-label"));
    this.badgeElement = append(container2, $("span.sessions-account-titlebar-widget-badge"));
    this.renderState();
  }
  onClick() {
    if (!this.container) {
      return;
    }
    this.showCombinedPanel();
  }
  async refreshAccount() {
    const requestId = ++this.accountRequestCounter;
    this.isAccountLoading = true;
    this.renderState();
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
    this.renderState();
  }
  renderState() {
    if (!this.container || !this.avatarElement || !this.iconElement || !this.labelElement || !this.badgeElement) {
      return;
    }
    const entitlement = this.accountName && this.chatEntitlementService.entitlement === 1 /* Unknown */ ? 2 /* Unresolved */ : this.chatEntitlementService.entitlement;
    const state = getAccountTitleBarState({
      isAccountLoading: this.isAccountLoading,
      accountName: this.accountName,
      accountProviderLabel: this.accountProviderLabel,
      entitlement,
      sentiment: this.chatEntitlementService.sentiment,
      quotas: this.chatEntitlementService.quotas,
      allowSignedOutWhenUsable: this.allowSignedOutWhenUsable.get()
    });
    this.lastState = state;
    this.container.classList.remove("kind-default", "kind-accent", "kind-warning", "kind-prominent");
    this.container.classList.add(`kind-${state.kind}`);
    this.container.classList.toggle("menu-visible", this.isMenuVisible);
    this.container.setAttribute("aria-label", state.ariaLabel);
    const badgeKey = getAccountTitleBarBadgeKey(state);
    if (badgeKey !== this.lastBadgeKey) {
      this.lastBadgeKey = badgeKey;
      this.dismissedBadgeKey = void 0;
    }
    const shouldShowDotBadge = !!badgeKey && badgeKey !== this.dismissedBadgeKey;
    const loadedAvatarUrl = !this.isAccountLoading ? this.loadedAvatarUrl : void 0;
    const hasLoadedAvatar = !!loadedAvatarUrl;
    const titleBarIcon = state.dotBadge ? Codicon.account : state.icon;
    this.avatarElement.classList.toggle("visible", hasLoadedAvatar);
    this.avatarElement.alt = this.getAvatarAltText(hasLoadedAvatar);
    if (hasLoadedAvatar) {
      if (this.avatarElement.src !== loadedAvatarUrl) {
        this.avatarElement.src = loadedAvatarUrl;
      }
    } else {
      this.avatarElement.removeAttribute("src");
    }
    this.iconElement.className = `sessions-account-titlebar-widget-icon ${ThemeIcon.asClassName(titleBarIcon)}`;
    this.iconElement.classList.toggle("hidden", hasLoadedAvatar);
    this.labelElement.textContent = "";
    this.badgeElement.textContent = "";
    this.badgeElement.classList.toggle("dot-badge", shouldShowDotBadge);
    this.badgeElement.classList.toggle("dot-badge-warning", shouldShowDotBadge && state.dotBadge === "warning");
    this.badgeElement.classList.toggle("dot-badge-error", shouldShowDotBadge && state.dotBadge === "error");
    this.badgeElement.style.display = shouldShowDotBadge ? "" : "none";
    this.renderCodexPanelAvatar();
  }
  getAvatarAltText(hasLoadedAvatar) {
    if (hasLoadedAvatar && this.accountProviderId === "github" && this.accountName) {
      return localize(3988, null, this.accountName);
    }
    return localize(3989, null);
  }
  getCodexAvatarAltText() {
    return this.codexAccountService.account.email ? localize(3997, null, this.codexAccountService.account.email) : localize(3998, null);
  }
  renderCodexPanelAvatar() {
    if (!this.codexPanelAvatarElement || !this.codexPanelIconElement) {
      return;
    }
    const avatarUrl = this.loadedCodexAvatarUrl;
    this.codexPanelAvatarElement.classList.toggle("hidden", !avatarUrl);
    this.codexPanelIconElement.classList.toggle("hidden", !!avatarUrl);
    this.codexPanelAvatarElement.alt = this.getCodexAvatarAltText();
    if (avatarUrl) {
      if (this.codexPanelAvatarElement.src !== avatarUrl) {
        this.codexPanelAvatarElement.src = avatarUrl;
      }
    } else {
      this.codexPanelAvatarElement.removeAttribute("src");
    }
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
      this.renderState();
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
      this.renderState();
      clearHandlers();
    };
    image.onerror = () => {
      if (requestId !== this.avatarRequestCounter) {
        return;
      }
      this.loadedAvatarUrl = void 0;
      this.renderState();
      clearHandlers();
    };
    this.avatarLoadDisposable.value = toDisposable(() => {
      clearHandlers();
      image.src = "";
    });
    image.src = avatarUrl;
    this.renderState();
  }
  refreshCodexAvatar() {
    const account = this.codexAccountService.account;
    const avatarUrl = this.configurationService.getValue(ACCOUNTS_AVATAR_SETTING) && account.status === "signedIn" ? account.profileImageDataUri : void 0;
    if (avatarUrl === this.currentCodexAvatarUrl) {
      return;
    }
    this.currentCodexAvatarUrl = avatarUrl;
    this.loadedCodexAvatarUrl = void 0;
    this.codexAvatarLoadDisposable.clear();
    const requestId = ++this.codexAvatarRequestCounter;
    if (!avatarUrl) {
      this.renderState();
      return;
    }
    const image = new Image();
    image.referrerPolicy = "no-referrer";
    const clearHandlers = () => {
      image.onload = null;
      image.onerror = null;
    };
    image.onload = () => {
      if (requestId !== this.codexAvatarRequestCounter) {
        return;
      }
      this.loadedCodexAvatarUrl = avatarUrl;
      this.renderState();
      clearHandlers();
    };
    image.onerror = () => {
      if (requestId !== this.codexAvatarRequestCounter) {
        return;
      }
      this.loadedCodexAvatarUrl = void 0;
      this.renderState();
      clearHandlers();
    };
    this.codexAvatarLoadDisposable.value = toDisposable(() => {
      clearHandlers();
      image.src = "";
    });
    image.src = avatarUrl;
    this.renderState();
  }
  getHoverTarget() {
    const { left, width: width2 } = getDomNodePagePosition(this.container);
    return {
      targetElements: [this.container],
      x: left + width2 - SESSIONS_ACCOUNT_TITLEBAR_PANEL_WIDTH
    };
  }
  showCombinedPanel() {
    if (!this.container) {
      return;
    }
    if (this.isMenuVisible) {
      this.hoverService.hideHover(true);
      this.clickPanelDisposable.clear();
      return;
    }
    this.hoverService.hideHover(true);
    this.clickPanelDisposable.clear();
    const panelStore = new DisposableStore();
    this.clickPanelDisposable.value = panelStore;
    const badgeKey = getAccountTitleBarBadgeKey(this.lastState);
    if (badgeKey) {
      this.dismissedBadgeKey = badgeKey;
    }
    this.isMenuVisible = true;
    this.container.classList.add("menu-visible");
    this.renderState();
    panelStore.add({
      dispose: () => {
        this.isMenuVisible = false;
        this.container?.classList.remove("menu-visible");
        this.renderState();
        this.container?.focus();
      }
    });
    const panelContent = this.createCombinedPanelContent(panelStore);
    const hoverWidget = this.hoverService.showInstantHover({
      content: panelContent,
      target: this.getHoverTarget(),
      additionalClasses: ["sessions-account-titlebar-panel-hover"],
      position: { hoverPosition: 2 /* BELOW */ },
      persistence: { sticky: true, hideOnHover: false },
      appearance: { showPointer: false, skipFadeInAnimation: true, maxHeightRatio: 0.8 }
    }, true);
    if (hoverWidget) {
      panelStore.add(hoverWidget);
    }
    panelStore.add(disposableWindowInterval(mainWindow, () => {
      if (!panelContent.isConnected || hoverWidget?.isDisposed) {
        this.clickPanelDisposable.clear();
      }
    }, 500));
  }
  createCombinedPanelContent(panelStore) {
    const panel = $("div.sessions-account-titlebar-panel");
    const menu = this.menuService.createMenu(AccountMenu, this.contextKeyService);
    const rawActions = [];
    fillInActionBarActions(menu.getActions(), rawActions);
    menu.dispose();
    const codexAccount = this.codexAccountService.account;
    const codexAccountVisible = shouldShowCodexAccount(this.configurationService, true);
    const partitioned = this.partitionMenuActions(rawActions);
    const identities = append(panel, $(".sessions-account-titlebar-panel-identities"));
    if (this.accountName || this.isAccountLoading) {
      const copilotAccount = append(identities, $("section.sessions-account-titlebar-panel-provider-account", {
        "aria-label": localize(4008, null)
      }));
      const copilotIdentity = append(copilotAccount, $(".sessions-account-titlebar-panel-provider-identity"));
      const loadedAvatarUrl = !this.isAccountLoading ? this.loadedAvatarUrl : void 0;
      if (loadedAvatarUrl) {
        const avatar = append(copilotIdentity, $("img.sessions-account-titlebar-panel-provider-avatar", {
          alt: this.getAvatarAltText(true),
          draggable: "false",
          src: loadedAvatarUrl
        }));
        avatar.decoding = "async";
        avatar.referrerPolicy = "no-referrer";
      } else {
        const accountIcon = append(copilotIdentity, $("span.sessions-account-titlebar-panel-provider-icon", { "aria-hidden": "true" }));
        accountIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.github));
      }
      const title = append(copilotIdentity, $("div.sessions-account-titlebar-panel-provider-name"));
      title.textContent = this.getPanelHeaderLabel();
      const copilotActions = append(copilotIdentity, $(".sessions-account-titlebar-panel-provider-actions"));
      const copilotActionBar = panelStore.add(new ActionBar(copilotActions));
      panelStore.add(copilotActionBar.onWillRun(() => {
        this.hoverService.hideHover(true);
        this.clickPanelDisposable.clear();
      }));
      copilotActionBar.push(panelStore.add(new Action(
        "copilot.manageModels",
        localize(4019, null),
        ThemeIcon.asClassName(Codicon.copilot),
        true,
        () => this.commandService.executeCommand(MANAGE_CHAT_COMMAND_ID, '@provider:"Copilot"')
      )), { icon: true, label: false });
      copilotActionBar.push(panelStore.add(new Action(
        "copilot.openAgentCustomizations",
        localize(4021, null),
        ThemeIcon.asClassName(Codicon.settingsGear),
        true,
        () => this.commandService.executeCommand(AICustomizationManagementCommands2.OpenEditor, {
          sessionType: SessionType.AgentHostCopilot,
          section: AICustomizationManagementSection.Agents
        })
      )), { icon: true, label: false });
      if (partitioned.signOut) {
        copilotActionBar.push(partitioned.signOut, { icon: true, label: false });
      }
      this.appendCopilotUsage(copilotAccount, panelStore);
    } else if (partitioned.signIn) {
      const copilotAccount = append(identities, $("section.sessions-account-titlebar-panel-provider-account.signed-out", {
        "aria-label": localize(4008, null)
      }));
      const copilotIdentity = append(copilotAccount, $(".sessions-account-titlebar-panel-provider-identity"));
      const accountIcon = append(copilotIdentity, $("span.sessions-account-titlebar-panel-provider-icon", { "aria-hidden": "true" }));
      accountIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.github));
      const signInActions = append(copilotIdentity, $(".sessions-account-titlebar-panel-provider-sign-in-actions"));
      const signInActionBar = panelStore.add(new ActionBar(signInActions));
      panelStore.add(signInActionBar.onWillRun(() => {
        this.hoverService.hideHover(true);
        this.clickPanelDisposable.clear();
      }));
      signInActionBar.push(partitioned.signIn, { icon: false, label: true });
    }
    if (hasSignedInCodexChatGPTAccount(codexAccount, codexAccountVisible)) {
      const accountSection = append(identities, $("section.sessions-account-titlebar-panel-provider-account", {
        "aria-label": localize(3996, null)
      }));
      const accountIdentity = append(accountSection, $(".sessions-account-titlebar-panel-provider-identity"));
      const avatar = append(accountIdentity, $("img.sessions-account-titlebar-panel-provider-avatar", {
        alt: this.getCodexAvatarAltText(),
        draggable: "false"
      }));
      avatar.decoding = "async";
      avatar.referrerPolicy = "no-referrer";
      const accountIcon = append(accountIdentity, $("span.sessions-account-titlebar-panel-provider-icon", { "aria-hidden": "true" }));
      accountIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.openai));
      this.codexPanelAvatarElement = avatar;
      this.codexPanelIconElement = accountIcon;
      this.renderCodexPanelAvatar();
      panelStore.add(toDisposable(() => {
        if (this.codexPanelAvatarElement === avatar) {
          this.codexPanelAvatarElement = void 0;
        }
        if (this.codexPanelIconElement === accountIcon) {
          this.codexPanelIconElement = void 0;
        }
      }));
      const accountName = append(accountIdentity, $(".sessions-account-titlebar-panel-provider-name"));
      accountName.textContent = codexAccount.email ?? localize(3995, null);
      const accountActions = append(accountIdentity, $(".sessions-account-titlebar-panel-provider-actions"));
      const accountActionBar = panelStore.add(new ActionBar(accountActions));
      panelStore.add(accountActionBar.onWillRun(() => {
        this.hoverService.hideHover(true);
        this.clickPanelDisposable.clear();
      }));
      accountActionBar.push(panelStore.add(new Action(
        "codex.manageChatGPTModels",
        localize(4018, null),
        ThemeIcon.asClassName(Codicon.openai),
        true,
        () => this.commandService.executeCommand(MANAGE_CHAT_COMMAND_ID, '@provider:"ChatGPT"')
      )), { icon: true, label: false });
      accountActionBar.push(panelStore.add(new Action(
        "codex.openAgentCustomizations",
        localize(4020, null),
        ThemeIcon.asClassName(Codicon.settingsGear),
        true,
        () => this.commandService.executeCommand(AICustomizationManagementCommands2.OpenEditor, {
          sessionType: SessionType.AgentHostCodex,
          section: AICustomizationManagementSection.HarnessSettings
        })
      )), { icon: true, label: false });
      accountActionBar.push(panelStore.add(new Action(
        "codex.signOutOfChatGPT",
        localize(4026, null),
        ThemeIcon.asClassName(Codicon.signOut),
        true,
        () => this.codexAccountService.signOut()
      )), { icon: true, label: false });
      this.appendChatGPTUsage(accountSection);
    } else {
      const codexAccountActions = createCodexAccountMenuActions(this.codexAccountService, codexAccountVisible);
      if (codexAccountActions.length) {
        const accountSection = append(identities, $("section.sessions-account-titlebar-panel-provider-account.signed-out", {
          "aria-label": localize(3996, null)
        }));
        const accountIdentity = append(accountSection, $(".sessions-account-titlebar-panel-provider-identity"));
        const accountIcon = append(accountIdentity, $("span.sessions-account-titlebar-panel-provider-icon", { "aria-hidden": "true" }));
        accountIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.openai));
        const signInActions = append(accountIdentity, $(".sessions-account-titlebar-panel-provider-sign-in-actions"));
        const signInActionBar = panelStore.add(new ActionBar(signInActions));
        panelStore.add(signInActionBar.onWillRun(() => {
          this.hoverService.hideHover(true);
          this.clickPanelDisposable.clear();
        }));
        for (const action of codexAccountActions) {
          signInActionBar.push(action instanceof Action ? panelStore.add(action) : action, { icon: false, label: true });
        }
      }
    }
    panelStore.add(this.instantiationService.createInstance(SessionsChatPetAchievementBadges, panel, () => {
      this.hoverService.hideHover(true);
      this.clickPanelDisposable.clear();
      void this.commandService.executeCommand(CHAT_PET_OPEN_ACHIEVEMENTS_COMMAND_ID);
    }));
    if (this.shouldShowCopilotDashboardHover()) {
      const footer = append(panel, $("section.sessions-account-titlebar-panel-footer", {
        "aria-label": localize(4022, null)
      }));
      append(footer, this.createCopilotHoverContent({ compactQuotaLayout: true }));
    }
    if (partitioned.other.some((a) => !(a instanceof Separator))) {
      const actionsSection = append(panel, $(".sessions-account-titlebar-panel-actions"));
      const actionsActionBar = panelStore.add(new ActionBar(actionsSection, {
        orientation: 1 /* VERTICAL */
      }));
      panelStore.add(actionsActionBar.onWillRun(() => {
        this.hoverService.hideHover(true);
        this.clickPanelDisposable.clear();
      }));
      let lastWasSeparator = true;
      for (const action of partitioned.other) {
        if (action instanceof Separator) {
          if (!lastWasSeparator) {
            actionsActionBar.push(action);
            lastWasSeparator = true;
          }
          continue;
        }
        lastWasSeparator = false;
        actionsActionBar.push(action, { icon: false, label: true });
      }
    }
    if (shouldShowAccountPanelSummary(this.lastState, this.shouldShowCopilotDashboardHover(), this.isAccountLoading)) {
      const contentSection = append(panel, $(".sessions-account-titlebar-panel-content"));
      const summary = append(contentSection, $(".sessions-account-titlebar-panel-summary"));
      summary.textContent = this.lastState.ariaLabel;
    }
    return panel;
  }
  appendCopilotUsage(accountSection, panelStore) {
    const usage = append(accountSection, $(".sessions-account-titlebar-panel-provider-usage"));
    const contentStore = panelStore.add(new DisposableStore());
    const render = () => {
      contentStore.clear();
      clearNode(usage);
      this.renderCopilotUsage(usage, contentStore);
    };
    render();
    panelStore.add(this.chatEntitlementService.onDidChangeQuotaRemaining(render));
    panelStore.add(this.chatEntitlementService.onDidChangeEntitlement(render));
  }
  renderCopilotUsage(usage, store) {
    const quota = this.chatEntitlementService.quotas.premiumChat ?? this.chatEntitlementService.quotas.chat;
    const planRow = append(usage, $(".sessions-account-titlebar-panel-provider-metric-row.primary"));
    append(planRow, $("span.sessions-account-titlebar-panel-provider-plan", void 0, this.getCopilotPlanLabel()));
    const quotaUsage = getQuotaUsage(quota);
    if (!quota || !quotaUsage) {
      return;
    }
    const formatter = safeIntl.NumberFormat(language, { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    if (quotaUsage.kind === 1 /* CreditsUsed */) {
      const creditsFormatted = formatter.value.format(quotaUsage.creditsUsed);
      append(planRow, $("span.sessions-account-titlebar-panel-provider-usage-value", {
        "aria-label": localize(4016, null, creditsFormatted)
      }, creditsFormatted));
    } else {
      const usedPercentage = Math.floor(quotaUsage.usedPercentage);
      const percentageLabel = localize(4013, null, usedPercentage);
      const percentageAriaLabel = localize(4012, null, usedPercentage);
      const { used, total } = quotaUsage;
      const usageValue = append(planRow, $("span.sessions-account-titlebar-panel-provider-usage-value", used !== void 0 && total !== void 0 ? { tabIndex: 0 } : void 0));
      usageValue.textContent = percentageLabel;
      usageValue.setAttribute("aria-label", percentageAriaLabel);
      if (used !== void 0 && total !== void 0) {
        const creditsValue = localize(4015, null, formatter.value.format(used), formatter.value.format(total));
        const creditsAriaLabel = localize(4014, null, formatter.value.format(used), formatter.value.format(total));
        const showCredits = () => {
          usageValue.textContent = creditsValue;
          usageValue.setAttribute("aria-label", creditsAriaLabel);
        };
        const showPercentage = () => {
          usageValue.textContent = percentageLabel;
          usageValue.setAttribute("aria-label", percentageAriaLabel);
        };
        store.add(addDisposableListener(usageValue, EventType.MOUSE_ENTER, showCredits));
        store.add(addDisposableListener(usageValue, EventType.MOUSE_LEAVE, showPercentage));
        store.add(addDisposableListener(usageValue, EventType.FOCUS, showCredits));
        store.add(addDisposableListener(usageValue, EventType.BLUR, showPercentage));
      }
    }
    const detailRow = append(usage, $(".sessions-account-titlebar-panel-provider-metric-row.secondary"));
    const resetLabel = this.getCopilotResetLabel(quota);
    if (resetLabel) {
      append(detailRow, $("span.sessions-account-titlebar-panel-provider-reset", void 0, resetLabel));
    } else {
      detailRow.classList.add("without-reset");
    }
    append(detailRow, $("span.sessions-account-titlebar-panel-provider-usage-label", void 0, localize(4011, null)));
  }
  appendChatGPTUsage(accountSection) {
    const account = this.codexAccountService.account;
    const usage = append(accountSection, $(".sessions-account-titlebar-panel-provider-usage"));
    const planRow = append(usage, $(".sessions-account-titlebar-panel-provider-metric-row.primary"));
    append(planRow, $("span.sessions-account-titlebar-panel-provider-plan", void 0, account.planType ? localize(4004, null, account.planType.charAt(0).toUpperCase() + account.planType.slice(1)) : localize(4005, null)));
    if (!account.rateLimit) {
      return;
    }
    const percentageFormatter = safeIntl.NumberFormat(language, { maximumFractionDigits: 0 });
    const usedPercentage = percentageFormatter.value.format(account.rateLimit.usedPercent);
    append(planRow, $("span.sessions-account-titlebar-panel-provider-usage-value", {
      "aria-label": localize(4002, null, usedPercentage)
    }, localize(4003, null, usedPercentage)));
    const detailRow = append(usage, $(".sessions-account-titlebar-panel-provider-metric-row.secondary"));
    if (account.rateLimit.resetsAt) {
      append(detailRow, $("span.sessions-account-titlebar-panel-provider-reset", void 0, localize(
        4000,
        null,
        this.getChatGPTLimitLabel(account.rateLimit.windowDurationMins),
        fromNow(account.rateLimit.resetsAt * 1e3, false, true)
      )));
    } else {
      detailRow.classList.add("without-reset");
    }
    append(detailRow, $("span.sessions-account-titlebar-panel-provider-usage-label", void 0, localize(4001, null)));
  }
  getCopilotResetLabel(quota) {
    const reset2 = getQuotaReset(quota, this.chatEntitlementService.quotas);
    if (!reset2) {
      return void 0;
    }
    return reset2.hasTime ? localize(4010, null, accountDateFormatter.value.format(reset2.date), accountTimeFormatter.value.format(reset2.date)) : localize(4009, null, accountDateFormatter.value.format(reset2.date));
  }
  getChatGPTLimitLabel(windowDurationMins) {
    if (windowDurationMins !== void 0) {
      if (Math.abs(windowDurationMins - 7 * 24 * 60) <= 60) {
        return localize(4007, null);
      }
      if (Math.abs(windowDurationMins - 24 * 60) <= 60) {
        return localize(3999, null);
      }
    }
    return localize(4006, null);
  }
  partitionMenuActions(rawActions) {
    let signIn;
    let signOut;
    const personalizeMap = /* @__PURE__ */ new Map();
    const other = [];
    const pushSeparator = () => {
      if (other.length === 0 || other[other.length - 1] instanceof Separator) {
        return;
      }
      other.push(new Separator());
    };
    for (const action of rawActions) {
      if (action instanceof Separator) {
        pushSeparator();
        continue;
      }
      if (action.id === SIGN_OUT_ACTION_ID) {
        signOut = action;
        continue;
      }
      if (action.id === AGENTIC_SIGN_IN_COMMAND_ID) {
        if (!this.isAccountLoading) {
          signIn = action;
        }
        continue;
      }
      if (PERSONALIZE_ACTION_IDS.includes(action.id)) {
        personalizeMap.set(action.id, action);
        continue;
      }
      if (action.id.startsWith("update.")) {
        continue;
      }
      other.push(action);
    }
    if (other.length > 0 && other[other.length - 1] instanceof Separator) {
      other.pop();
    }
    const personalize = PERSONALIZE_ACTION_IDS.map((id2) => personalizeMap.get(id2)).filter((a) => !!a);
    return { signIn, signOut, personalize, other };
  }
  getPanelHeaderLabel() {
    if (this.accountName) {
      return this.accountName;
    }
    if (this.isAccountLoading) {
      return localize(4017, null);
    }
    return localize(3990, null);
  }
  getCopilotPlanLabel() {
    switch (this.chatEntitlementService.entitlement) {
      case 3 /* Available */:
      case 5 /* Free */:
      case 10 /* EDU */:
      case 6 /* Pro */:
      case 7 /* ProPlus */:
      case 8 /* Business */:
      case 9 /* Enterprise */:
      case 11 /* Max */:
        return getChatPlanName(this.chatEntitlementService.entitlement);
      default:
        return "";
    }
  }
  shouldShowCopilotDashboardHover() {
    return !this.chatEntitlementService.sentiment.hidden && !!this.accountName;
  }
  createCopilotHoverContent(extraOptions) {
    const store = new DisposableStore();
    this.copilotDashboardStore.value = store;
    const dashboardElement = ChatStatusDashboard.instantiateInContents(this.instantiationService, store, {
      disableInlineSuggestionsSettings: true,
      disableModelSelection: true,
      disableProviderOptions: true,
      disableCompletionsSnooze: true,
      disableQuickSettingsCollapsible: true,
      ...extraOptions
    });
    store.add(disposableWindowInterval(mainWindow, () => {
      if (!dashboardElement.isConnected) {
        store.dispose();
      }
    }, 2e3));
    return dashboardElement;
  }
};

TitleBarAccountWidget = __decorateClass([
  __decorateParam(2, IDefaultAccountService),
  __decorateParam(3, IAuthenticationService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IChatEntitlementService),
  __decorateParam(9, ICodexAccountService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, ICommandService)
], TitleBarAccountWidget);

function hasCodexAccountPanelContentChanged(previous, current) {
  return previous.status !== current.status || previous.email !== current.email || previous.planType !== current.planType || previous.requiresOpenaiAuth !== current.requiresOpenaiAuth || previous.authUrl !== current.authUrl || previous.authUrlNonce !== current.authUrlNonce || previous.rateLimit?.usedPercent !== current.rateLimit?.usedPercent || previous.rateLimit?.windowDurationMins !== current.rateLimit?.windowDurationMins || previous.rateLimit?.resetsAt !== current.rateLimit?.resetsAt;
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SessionsTitleBarAccountWidgetAction,
      title: localize2(3994, "Agents Account and Status"),
      menu: {
        id: Menus.TitleBarRightLayout,
        group: "navigation",
        order: 100,
        when: IsAuxiliaryWindowContext.toNegated()
      }
    });
  }
  run() {
  }
});

var AccountWidgetContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessionsWidget";
  }
  constructor(actionViewItemService, instantiationService) {
    super();
    this._register(actionViewItemService.register(Menus.TitleBarRightLayout, SessionsTitleBarAccountWidgetAction, (action, options3) => {
      return instantiationService.createInstance(TitleBarAccountWidget, action, options3);
    }, void 0));
  }
};

AccountWidgetContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService)
], AccountWidgetContribution);

registerWorkbenchContribution2(AccountWidgetContribution.ID, AccountWidgetContribution, WorkbenchPhase.BlockRestore);

var ChatDashboardServiceImpl = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  createDashboardElement(store) {
    const dashboardElement = ChatStatusDashboard.instantiateInContents(this.instantiationService, store, {
      disableInlineSuggestionsSettings: true,
      disableModelSelection: true,
      disableProviderOptions: true,
      disableCompletionsSnooze: true
    });
    store.add(disposableWindowInterval(mainWindow, () => {
      if (!dashboardElement.isConnected) {
        store.dispose();
      }
    }, 2e3));
    return dashboardElement;
  }
};

ChatDashboardServiceImpl = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ChatDashboardServiceImpl);

registerSingleton(IChatDashboardService, ChatDashboardServiceImpl, 1 /* Delayed */);
export { shouldShowAccountPanelSummary, hasCodexAccountPanelContentChanged, AccountMenu, SessionsTitleBarAccountWidgetAction, SESSIONS_ACCOUNT_TITLEBAR_PANEL_WIDTH, PERSONALIZE_ACTION_IDS, SIGN_OUT_ACTION_ID, accountDateFormatter, accountTimeFormatter, sessionsChangesPrimaryActionVisible, TitleBarAccountWidget, AccountWidgetContribution, ChatDashboardServiceImpl };
