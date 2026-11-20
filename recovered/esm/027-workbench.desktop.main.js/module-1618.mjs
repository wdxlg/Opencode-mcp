// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/globalCompositeBar.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Action, Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID } from "./module-1610.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode, getWindow, hide, runWhenWindowIdle, show } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { localize } from "./module-0001.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { CompositeBarAction, CompositeBarActionViewItem } from "./module-1497.mjs";
import { isString } from "./module-0010.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { WORKBENCH_MENU_MOTION_CLASS, workbenchMenuCloseAnimation } from "./module-1612.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { EventType2 } from "./module-0251.mjs";
import { getActionBarActions } from "./module-0516.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IActivityService } from "./module-1449.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Lazy } from "./module-0028.mjs";
import { getCurrentAuthenticationSessionInfo } from "./module-1418.mjs";
import { ACCOUNTS_AVATAR_SETTING, IAuthenticationService, INTERNAL_AUTH_PROVIDER_PREFIX } from "./module-0951.mjs";
import { FileAccess } from "./module-0033.mjs";
import { ICodexAccountService, createCodexAccountMenuActions, shouldShowCodexAccount } from "./module-1617.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IProductService } from "./module-0873.mjs";
import { ISecretStorageService } from "./module-0948.mjs";
import { ILogService } from "./module-0095.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { DEFAULT_ICON } from "./module-1611.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND } from "./module-0912.mjs";


// src/vs/workbench/browser/parts/globalCompositeBar.ts
var GlobalCompositeBar = class extends Disposable {
  constructor(contextMenuActionsProvider, colors, activityHoverOptions, configurationService, instantiationService, storageService, extensionService) {
    super();
    this.contextMenuActionsProvider = contextMenuActionsProvider;
    this.colors = colors;
    this.activityHoverOptions = activityHoverOptions;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.globalActivityAction = this._register(new Action(GLOBAL_ACTIVITY_ID));
    this.element = $("div");
    const contextMenuAlignmentOptions = () => ({
      anchorAlignment: configurationService.getValue("workbench.sideBar.location") === "left" ? 1 /* RIGHT */ : 0 /* LEFT */,
      anchorAxisAlignment: 1 /* HORIZONTAL */
    });
    this.globalActivityActionBar = this._register(new ActionBar(this.element, {
      actionViewItemProvider: (action, options3) => {
        if (action.id === GLOBAL_ACTIVITY_ID) {
          return this.instantiationService.createInstance(GlobalActivityActionViewItem, this.contextMenuActionsProvider, { ...options3, colors: this.colors, hoverOptions: this.activityHoverOptions }, contextMenuAlignmentOptions);
        }
        if (action.id === ACCOUNTS_ACTIVITY_ID) {
          return this.instantiationService.createInstance(
            AccountsActivityActionViewItem,
            this.contextMenuActionsProvider,
            {
              ...options3,
              colors: this.colors,
              hoverOptions: this.activityHoverOptions
            },
            contextMenuAlignmentOptions,
            (actions) => {
              actions.unshift(...[
                toAction({ id: "hideAccounts", label: localize(6777, null), run: () => setAccountsActionVisible(storageService, false) }),
                new Separator()
              ]);
            }
          );
        }
        throw new Error(`No view item for action '${action.id}'`);
      },
      orientation: 1 /* VERTICAL */,
      ariaLabel: localize(6779, null),
      preventLoopNavigation: true
    }));
    this.accountsActivityAction = this._register(new Action(ACCOUNTS_ACTIVITY_ID));
    if (this.accountsVisibilityPreference) {
      this.globalActivityActionBar.push(this.accountsActivityAction);
    }
    this.globalActivityActionBar.push(this.globalActivityAction);
    this.registerListeners();
  }
  static {
    this.ACCOUNTS_ACTION_INDEX = 0;
  }
  static {
    this.ACCOUNTS_ICON = registerIcon("accounts-view-bar-icon", Codicon.account, localize(6775, null));
  }
  registerListeners() {
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      if (!this._store.isDisposed) {
        this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, this._store)(() => this.toggleAccountsActivity()));
      }
    });
  }
  create(parent) {
    parent.appendChild(this.element);
  }
  focus() {
    this.globalActivityActionBar.focus(true);
  }
  getContextMenuActions() {
    return [];
  }
  toggleAccountsActivity() {
    if (this.globalActivityActionBar.length === 2 && this.accountsVisibilityPreference) {
      return;
    }
    if (this.globalActivityActionBar.length === 2) {
      this.globalActivityActionBar.pull(GlobalCompositeBar.ACCOUNTS_ACTION_INDEX);
    } else if (this.accountsVisibilityPreference) {
      this.globalActivityActionBar.push(this.accountsActivityAction, { index: GlobalCompositeBar.ACCOUNTS_ACTION_INDEX });
    }
  }
  get accountsVisibilityPreference() {
    return isAccountsActionVisible(this.storageService);
  }
  set accountsVisibilityPreference(value2) {
    setAccountsActionVisible(this.storageService, value2);
  }
};

GlobalCompositeBar = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IExtensionService)
], GlobalCompositeBar);

var AbstractGlobalActivityActionViewItem = class extends CompositeBarActionViewItem {
  constructor(menuId, action, options3, contextMenuActionsProvider, contextMenuAlignmentOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, keybindingService, activityService) {
    super(action, { draggable: false, icon: true, hasPopup: true, ...options3 }, () => true, themeService, hoverService, configurationService, keybindingService);
    this.menuId = menuId;
    this.contextMenuActionsProvider = contextMenuActionsProvider;
    this.contextMenuAlignmentOptions = contextMenuAlignmentOptions;
    this.menuService = menuService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.activityService = activityService;
    this.updateItemActivity();
    this._register(this.activityService.onDidChangeActivity((viewContainerOrAction) => {
      if (isString(viewContainerOrAction) && viewContainerOrAction === this.compositeBarActionItem.id) {
        this.updateItemActivity();
      }
    }));
  }
  updateItemActivity() {
    this.action.activities = this.activityService.getActivity(this.compositeBarActionItem.id);
  }
  render(container3) {
    super.render(container3);
    this._register(addDisposableListener(this.container, EventType.MOUSE_DOWN, async (e) => {
      EventHelper.stop(e, true);
      const isLeftClick = e?.button !== 2;
      if (isLeftClick) {
        this.run();
      }
    }));
    this._register(addDisposableListener(this.container, EventType.CONTEXT_MENU, async (e) => {
      e.stopPropagation();
      const disposables = new DisposableStore();
      const actions = await this.resolveContextMenuActions(disposables);
      const event = new StandardMouseEvent(getWindow(this.container), e);
      this.contextMenuService.showContextMenu({
        getAnchor: () => event,
        getActions: () => actions,
        getMenuClassName: () => WORKBENCH_MENU_MOTION_CLASS,
        onHide: () => disposables.dispose(),
        closeAnimation: workbenchMenuCloseAnimation
      });
    }));
    this._register(addDisposableListener(this.container, EventType.KEY_UP, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        EventHelper.stop(e, true);
        this.run();
      }
    }));
    this._register(addDisposableListener(this.container, EventType2.Tap, (e) => {
      EventHelper.stop(e, true);
      this.run();
    }));
  }
  async resolveContextMenuActions(disposables) {
    return this.contextMenuActionsProvider();
  }
  async run() {
    const disposables = new DisposableStore();
    const menu = disposables.add(this.menuService.createMenu(this.menuId, this.contextKeyService));
    const actions = await this.resolveMainMenuActions(menu, disposables);
    const { anchorAlignment, anchorAxisAlignment } = this.contextMenuAlignmentOptions() ?? { anchorAlignment: void 0, anchorAxisAlignment: void 0 };
    this.contextMenuService.showContextMenu({
      getAnchor: () => this.label,
      anchorAlignment,
      anchorAxisAlignment,
      getActions: () => actions,
      getMenuClassName: () => WORKBENCH_MENU_MOTION_CLASS,
      onHide: () => disposables.dispose(),
      menuActionOptions: { renderShortTitle: true },
      closeAnimation: workbenchMenuCloseAnimation
    });
  }
  async resolveMainMenuActions(menu, _disposable) {
    return getActionBarActions(menu.getActions({ renderShortTitle: true })).secondary;
  }
};

AbstractGlobalActivityActionViewItem = __decorateClass([
  __decorateParam(5, IThemeService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IMenuService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IKeybindingService),
  __decorateParam(12, IActivityService)
], AbstractGlobalActivityActionViewItem);

var AccountsActivityActionViewItem = class extends AbstractGlobalActivityActionViewItem {
  constructor(contextMenuActionsProvider, options3, contextMenuAlignmentOptions, fillContextMenuActions, themeService, lifecycleService, hoverService, contextMenuService, menuService, contextKeyService, authenticationService, environmentService, productService, configurationService, keybindingService, secretStorageService, logService, activityService, instantiationService, commandService, codexAccountService, defaultAccountService) {
    const action = instantiationService.createInstance(CompositeBarAction, {
      id: ACCOUNTS_ACTIVITY_ID,
      name: localize(6774, null),
      classNames: ThemeIcon.asClassNameArray(GlobalCompositeBar.ACCOUNTS_ICON)
    });
    super(MenuId.AccountsContext, action, options3, contextMenuActionsProvider, contextMenuAlignmentOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, keybindingService, activityService);
    this.fillContextMenuActions = fillContextMenuActions;
    this.lifecycleService = lifecycleService;
    this.authenticationService = authenticationService;
    this.productService = productService;
    this.secretStorageService = secretStorageService;
    this.logService = logService;
    this.commandService = commandService;
    this.codexAccountService = codexAccountService;
    this.defaultAccountService = defaultAccountService;
    this.groupedAccounts = /* @__PURE__ */ new Map();
    this.problematicProviders = /* @__PURE__ */ new Set();
    this.initialized = false;
    this.sessionFromEmbedder = new Lazy(() => getCurrentAuthenticationSessionInfo(this.secretStorageService, this.productService));
    this._register(action);
    this.registerListeners();
    this.initialize();
  }
  static {
    this.ACCOUNTS_VISIBILITY_PREFERENCE_KEY = "workbench.activity.showAccounts";
  }
  registerListeners() {
    this._register(this.authenticationService.onDidRegisterAuthenticationProvider(async (e) => {
      await this.addAccountsFromProvider(e.id);
      this.updateAvatar();
    }));
    this._register(this.authenticationService.onDidUnregisterAuthenticationProvider((e) => {
      this.groupedAccounts.delete(e.id);
      this.problematicProviders.delete(e.id);
      this.updateAvatar();
    }));
    this._register(this.authenticationService.onDidChangeSessions(async (e) => {
      if (e.event.removed) {
        for (const removed of e.event.removed) {
          this.removeAccount(e.providerId, removed.account);
        }
      }
      for (const changed of [...e.event.changed ?? [], ...e.event.added ?? []]) {
        try {
          await this.addOrUpdateAccount(e.providerId, changed.account);
        } catch (e2) {
          this.logService.error(e2);
        }
      }
      this.updateAvatar();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ACCOUNTS_AVATAR_SETTING)) {
        this.updateAvatar();
      }
    }));
    this._register(this.defaultAccountService.onDidChangeDefaultAccount(() => {
      this.updateAvatar();
    }));
  }
  // This function exists to ensure that the accounts are added for auth providers that had already been registered
  // before the menu was created.
  async initialize() {
    await this.lifecycleService.when(3 /* Restored */);
    if (this._store.isDisposed) {
      return;
    }
    const disposable = this._register(runWhenWindowIdle(getWindow(this.element), async () => {
      await this.doInitialize();
      disposable.dispose();
    }));
  }
  async doInitialize() {
    const providerIds = this.authenticationService.getProviderIds();
    const results = await Promise.allSettled(providerIds.map((providerId) => this.addAccountsFromProvider(providerId)));
    for (const result of results) {
      if (result.status === "rejected") {
        this.logService.error(result.reason);
      }
    }
    this.initialized = true;
    this.updateAvatar();
  }
  render(container3) {
    super.render(container3);
    this.avatarImg = $("img.accounts-avatar");
    this.avatarImg.alt = "";
    this.avatarImg.setAttribute("aria-hidden", "true");
    this.avatarImg.draggable = false;
    this.avatarImg.referrerPolicy = "no-referrer";
    this.avatarImg.style.display = "none";
    this.avatarImg.onerror = () => {
      this.avatarImg.style.display = "none";
      this.label.classList.remove("has-avatar");
    };
    append(this.label, this.avatarImg);
    this.updateAvatar();
  }
  updateAvatar() {
    if (!this.avatarImg) {
      return;
    }
    let avatarIcon;
    if (this.configurationService.getValue(ACCOUNTS_AVATAR_SETTING)) {
      avatarIcon = this.getDefaultAccountAvatarIcon();
      if (!avatarIcon) {
        for (const accounts of this.groupedAccounts.values()) {
          for (const account of accounts) {
            if (account.icon) {
              avatarIcon = account.icon;
              break;
            }
          }
          if (avatarIcon) {
            break;
          }
        }
      }
    }
    if (avatarIcon) {
      this.avatarImg.src = FileAccess.uriToBrowserUri(avatarIcon).toString(true);
      this.avatarImg.style.display = "";
      this.label.classList.add("has-avatar");
    } else {
      this.avatarImg.removeAttribute("src");
      this.avatarImg.style.display = "none";
      this.label.classList.remove("has-avatar");
    }
  }
  getDefaultAccountAvatarIcon() {
    const currentDefaultAccount = this.defaultAccountService.currentDefaultAccount;
    if (!currentDefaultAccount) {
      return void 0;
    }
    const accounts = this.groupedAccounts.get(currentDefaultAccount.authenticationProvider.id);
    return accounts?.find((account) => account.label === currentDefaultAccount.accountName)?.icon;
  }
  //#region overrides
  async resolveMainMenuActions(accountsMenu, disposables) {
    await super.resolveMainMenuActions(accountsMenu, disposables);
    const providers2 = this.authenticationService.getProviderIds().filter((p) => !p.startsWith(INTERNAL_AUTH_PROVIDER_PREFIX));
    const otherCommands = accountsMenu.getActions();
    let menus = [];
    const registeredProviders = providers2.filter((providerId) => !this.authenticationService.isDynamicAuthenticationProvider(providerId));
    const dynamicProviders = providers2.filter((providerId) => this.authenticationService.isDynamicAuthenticationProvider(providerId));
    if (!this.initialized) {
      const noAccountsAvailableAction = disposables.add(new Action("noAccountsAvailable", localize(6778, null), void 0, false));
      menus.push(noAccountsAvailableAction);
    } else {
      for (const providerId of registeredProviders) {
        const provider = this.authenticationService.getProvider(providerId);
        const accounts = this.groupedAccounts.get(providerId);
        if (!accounts) {
          if (this.problematicProviders.has(providerId)) {
            const providerUnavailableAction = disposables.add(new Action("providerUnavailable", localize(6776, null, provider.label), void 0, false));
            menus.push(providerUnavailableAction);
            try {
              await this.addAccountsFromProvider(providerId);
            } catch (e) {
              this.logService.error(e);
            }
          }
          continue;
        }
        const canUseMcp = !!provider.authorizationServers?.length;
        for (const account of accounts) {
          const manageExtensionsAction = toAction({
            id: `configureSessions${account.label}`,
            label: localize(6782, null),
            enabled: true,
            run: () => this.commandService.executeCommand("_manageTrustedExtensionsForAccount", { providerId, accountLabel: account.label })
          });
          const providerSubMenuActions = [manageExtensionsAction];
          if (canUseMcp) {
            const manageMCPAction = toAction({
              id: `configureSessions${account.label}`,
              label: localize(6783, null),
              enabled: true,
              run: () => this.commandService.executeCommand("_manageTrustedMCPServersForAccount", { providerId, accountLabel: account.label })
            });
            providerSubMenuActions.push(manageMCPAction);
          }
          if (account.canSignOut) {
            providerSubMenuActions.push(toAction({
              id: "signOut",
              label: localize(6784, null),
              enabled: true,
              run: () => this.commandService.executeCommand("_signOutOfAccount", { providerId, accountLabel: account.label })
            }));
          }
          const providerSubMenu = new SubmenuAction("activitybar.submenu", `${account.label} (${provider.label})`, providerSubMenuActions);
          menus.push(providerSubMenu);
        }
      }
      if (dynamicProviders.length && registeredProviders.length) {
        menus.push(new Separator());
      }
      for (const providerId of dynamicProviders) {
        const provider = this.authenticationService.getProvider(providerId);
        const accounts = this.groupedAccounts.get(providerId);
        const manageDynamicAuthProvidersAction = toAction({
          id: "manageDynamicAuthProviders",
          label: localize(6781, null),
          enabled: true,
          run: () => this.commandService.executeCommand("workbench.action.removeDynamicAuthenticationProviders")
        });
        if (!accounts) {
          if (this.problematicProviders.has(providerId)) {
            const providerUnavailableAction = disposables.add(new Action("providerUnavailable", localize(6776, null, provider.label), void 0, false));
            menus.push(providerUnavailableAction);
            try {
              await this.addAccountsFromProvider(providerId);
            } catch (e) {
              this.logService.error(e);
            }
          }
          menus.push(manageDynamicAuthProvidersAction);
          continue;
        }
        for (const account of accounts) {
          const providerSubMenuActions = [];
          const manageMCPAction = toAction({
            id: `configureSessions${account.label}`,
            label: localize(6783, null),
            enabled: true,
            run: () => this.commandService.executeCommand("_manageTrustedMCPServersForAccount", { providerId, accountLabel: account.label })
          });
          providerSubMenuActions.push(manageMCPAction);
          providerSubMenuActions.push(manageDynamicAuthProvidersAction);
          if (account.canSignOut) {
            providerSubMenuActions.push(toAction({
              id: "signOut",
              label: localize(6784, null),
              enabled: true,
              run: () => this.commandService.executeCommand("_signOutOfAccount", { providerId, accountLabel: account.label })
            }));
          }
          const providerSubMenu = new SubmenuAction("activitybar.submenu", `${account.label} (${provider.label})`, providerSubMenuActions);
          menus.push(providerSubMenu);
        }
      }
    }
    const codexAccountActions = createCodexAccountMenuActions(this.codexAccountService, shouldShowCodexAccount(this.configurationService, false));
    if (codexAccountActions.length) {
      if (menus.length) {
        menus.push(new Separator());
      }
      for (const action of codexAccountActions) {
        menus.push(action instanceof Action ? disposables.add(action) : action);
      }
    }
    // OpenCode accounts-button-step02: 没登录 GitHub 时在账户菜单里直接给「使用 GitHub 登录」。
    // 权限与内置 Git 的 GitHub 凭据一致（repo/workflow/user:email/read:user），登录后 git push/pull 直接复用。
    if (!this.groupedAccounts.get("github")?.length) {
      menus.unshift(toAction({
        id: "opencode.signInWithGitHub",
        label: "\u4f7f\u7528 GitHub \u767b\u5f55",
        enabled: true,
        run: async () => {
          try {
            await this.authenticationService.createSession("github", ["repo", "workflow", "user:email", "read:user"], { activateImmediate: true });
          } catch (error) {
            this.logService.error("[OpenCode] GitHub sign-in failed", error);
          }
        }
      }));
    }
    if (menus.length && otherCommands.length) {
      menus.push(new Separator());
    }
    otherCommands.forEach((group2, i2) => {
      const actions = group2[1];
      menus = menus.concat(actions);
      if (i2 !== otherCommands.length - 1) {
        menus.push(new Separator());
      }
    });
    return menus;
  }
  async resolveContextMenuActions(disposables) {
    const actions = await super.resolveContextMenuActions(disposables);
    this.fillContextMenuActions(actions);
    return actions;
  }
  //#endregion
  //#region groupedAccounts helpers
  async addOrUpdateAccount(providerId, account) {
    let accounts = this.groupedAccounts.get(providerId);
    if (!accounts) {
      accounts = [];
      this.groupedAccounts.set(providerId, accounts);
    }
    const sessionFromEmbedder = await this.sessionFromEmbedder.value;
    let canSignOut = true;
    if (sessionFromEmbedder && !sessionFromEmbedder.canSignOut && (await this.authenticationService.getSessions(providerId)).some(
      (s) => s.id === sessionFromEmbedder.id && s.account.id === account.id
    )) {
      canSignOut = false;
    }
    const existingAccount = accounts.find((a) => a.label === account.label);
    if (existingAccount) {
      if (!canSignOut) {
        existingAccount.canSignOut = canSignOut;
      }
      existingAccount.icon = account.icon;
    } else {
      accounts.push({ ...account, canSignOut });
    }
  }
  removeAccount(providerId, account) {
    const accounts = this.groupedAccounts.get(providerId);
    if (!accounts) {
      return;
    }
    const index2 = accounts.findIndex((a) => a.id === account.id);
    if (index2 === -1) {
      return;
    }
    accounts.splice(index2, 1);
    if (accounts.length === 0) {
      this.groupedAccounts.delete(providerId);
    }
  }
  async addAccountsFromProvider(providerId) {
    try {
      const sessions = await this.authenticationService.getSessions(providerId);
      this.problematicProviders.delete(providerId);
      for (const session of sessions) {
        try {
          await this.addOrUpdateAccount(providerId, session.account);
        } catch (e) {
          this.logService.error(e);
        }
      }
    } catch (e) {
      this.logService.error(e);
      this.problematicProviders.add(providerId);
    }
  }
  //#endregion
};

AccountsActivityActionViewItem = __decorateClass([
  __decorateParam(4, IThemeService),
  __decorateParam(5, ILifecycleService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IAuthenticationService),
  __decorateParam(11, IWorkbenchEnvironmentService),
  __decorateParam(12, IProductService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, IKeybindingService),
  __decorateParam(15, ISecretStorageService),
  __decorateParam(16, ILogService),
  __decorateParam(17, IActivityService),
  __decorateParam(18, IInstantiationService),
  __decorateParam(19, ICommandService),
  __decorateParam(20, ICodexAccountService),
  __decorateParam(21, IDefaultAccountService)
], AccountsActivityActionViewItem);

var GlobalActivityActionViewItem = class extends AbstractGlobalActivityActionViewItem {
  constructor(contextMenuActionsProvider, options3, contextMenuAlignmentOptions, userDataProfileService, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService, instantiationService, activityService) {
    const action = instantiationService.createInstance(CompositeBarAction, {
      id: GLOBAL_ACTIVITY_ID,
      name: localize(6779, null),
      classNames: ThemeIcon.asClassNameArray(userDataProfileService.currentProfile.icon ? ThemeIcon.fromId(userDataProfileService.currentProfile.icon) : DEFAULT_ICON)
    });
    super(MenuId.GlobalActivity, action, options3, contextMenuActionsProvider, contextMenuAlignmentOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, keybindingService, activityService);
    this.userDataProfileService = userDataProfileService;
    this._register(action);
    this._register(this.userDataProfileService.onDidChangeCurrentProfile((e) => {
      action.compositeBarActionItem = {
        ...action.compositeBarActionItem,
        classNames: ThemeIcon.asClassNameArray(userDataProfileService.currentProfile.icon ? ThemeIcon.fromId(userDataProfileService.currentProfile.icon) : DEFAULT_ICON)
      };
    }));
  }
  render(container3) {
    super.render(container3);
    this.profileBadge = append(container3, $(".profile-badge"));
    this.profileBadgeContent = append(this.profileBadge, $(".profile-badge-content"));
    this.updateProfileBadge();
  }
  updateProfileBadge() {
    if (!this.profileBadge || !this.profileBadgeContent) {
      return;
    }
    clearNode(this.profileBadgeContent);
    hide(this.profileBadge);
    if (this.userDataProfileService.currentProfile.isDefault) {
      return;
    }
    if (this.userDataProfileService.currentProfile.icon && this.userDataProfileService.currentProfile.icon !== DEFAULT_ICON.id) {
      return;
    }
    if (this.action.activities.length > 0) {
      return;
    }
    show(this.profileBadge);
    this.profileBadgeContent.classList.add("profile-text-overlay");
    this.profileBadgeContent.textContent = this.userDataProfileService.currentProfile.name.substring(0, 2).toUpperCase();
  }
  updateActivity() {
    super.updateActivity();
    this.updateProfileBadge();
  }
  computeTitle() {
    return this.userDataProfileService.currentProfile.isDefault ? super.computeTitle() : localize(6780, null, this.userDataProfileService.currentProfile.name);
  }
};

GlobalActivityActionViewItem = __decorateClass([
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IWorkbenchEnvironmentService),
  __decorateParam(11, IKeybindingService),
  __decorateParam(12, IInstantiationService),
  __decorateParam(13, IActivityService)
], GlobalActivityActionViewItem);

var SimpleAccountActivityActionViewItem = class extends AccountsActivityActionViewItem {
  constructor(hoverOptions, options3, themeService, lifecycleService, hoverService, contextMenuService, menuService, contextKeyService, authenticationService, environmentService, productService, configurationService, keybindingService, secretStorageService, storageService, logService, activityService, instantiationService, commandService, codexAccountService, defaultAccountService) {
    super(
      () => simpleActivityContextMenuActions(storageService, true),
      {
        ...options3,
        colors: (theme) => ({
          badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
          badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND)
        }),
        hoverOptions,
        compact: true
      },
      () => void 0,
      (actions) => actions,
      themeService,
      lifecycleService,
      hoverService,
      contextMenuService,
      menuService,
      contextKeyService,
      authenticationService,
      environmentService,
      productService,
      configurationService,
      keybindingService,
      secretStorageService,
      logService,
      activityService,
      instantiationService,
      commandService,
      codexAccountService,
      defaultAccountService
    );
  }
};

SimpleAccountActivityActionViewItem = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, ILifecycleService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IAuthenticationService),
  __decorateParam(9, IWorkbenchEnvironmentService),
  __decorateParam(10, IProductService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IKeybindingService),
  __decorateParam(13, ISecretStorageService),
  __decorateParam(14, IStorageService),
  __decorateParam(15, ILogService),
  __decorateParam(16, IActivityService),
  __decorateParam(17, IInstantiationService),
  __decorateParam(18, ICommandService),
  __decorateParam(19, ICodexAccountService),
  __decorateParam(20, IDefaultAccountService)
], SimpleAccountActivityActionViewItem);

var SimpleGlobalActivityActionViewItem = class extends GlobalActivityActionViewItem {
  constructor(hoverOptions, options3, userDataProfileService, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService, instantiationService, activityService, storageService) {
    super(
      () => simpleActivityContextMenuActions(storageService, false),
      {
        ...options3,
        colors: (theme) => ({
          badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
          badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND)
        }),
        hoverOptions,
        compact: true
      },
      () => void 0,
      userDataProfileService,
      themeService,
      hoverService,
      menuService,
      contextMenuService,
      contextKeyService,
      configurationService,
      environmentService,
      keybindingService,
      instantiationService,
      activityService
    );
  }
};

SimpleGlobalActivityActionViewItem = __decorateClass([
  __decorateParam(2, IUserDataProfileService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IMenuService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IWorkbenchEnvironmentService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IActivityService),
  __decorateParam(13, IStorageService)
], SimpleGlobalActivityActionViewItem);

function simpleActivityContextMenuActions(storageService, isAccount) {
  return [
    toAction({ id: "toggle.hideManage", label: localize(6779, null), checked: true, enabled: false, run: () => {
      throw new Error('"Manage" can not be hidden');
    } })
  ];
}

function isAccountsActionVisible(storageService) {
  // OpenCode accounts-button-step01: 恢复「账户」按钮（GitHub 等登录入口），右键可隐藏。
  return storageService.getBoolean(AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, 0 /* PROFILE */, true);
}

function setAccountsActionVisible(storageService, visible) {
  storageService.store(AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, visible, 0 /* PROFILE */, 0 /* USER */);
}
export { simpleActivityContextMenuActions, isAccountsActionVisible, setAccountsActionVisible, GlobalCompositeBar, AbstractGlobalActivityActionViewItem, AccountsActivityActionViewItem, GlobalActivityActionViewItem, SimpleAccountActivityActionViewItem, SimpleGlobalActivityActionViewItem };
