// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/sessionsSetUpService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { conditionalAuthState, observeAllowSignedOutWhenUsable, resolveSignedOutWindowGate } from "./module-1799.mjs";
import { runOnChange } from "./module-0064.mjs";
import { isWeb } from "./module-0014.mjs";
import { WELCOME_COMPLETE_KEY } from "./module-1798.mjs";
import { SessionsWelcomeVisibleContext } from "./module-1770.mjs";
import { Dialog } from "./module-1579.mjs";
import { localize } from "./module-0001.mjs";
import { createWorkbenchDialogOptions } from "./module-1580.mjs";
import { Codicon } from "./module-0085.mjs";
import { DeferredPromise, disposableTimeout } from "./module-0036.mjs";
import { $, append } from "./module-0075.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { SHOULD_SHOW_RETURN_TO_VSCODE_EDITOR_COMMAND_ID } from "./module-1800.mjs";
import { SessionsSigningInDialog, createSessionsSignInDialogOptions } from "./module-1801.mjs";
import { GitHubPaths, IDefaultAccountService } from "./module-0741.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { ILogService } from "./module-0095.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHostService } from "./module-1118.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { ChatEntitlementContext, IChatEntitlementService } from "./module-0954.mjs";
import { IUserDataProfileStorageService } from "./module-1658.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";


// src/vs/sessions/browser/sessionsSetUpService.ts
var AIDisabledConfig = "chat.disableAIFeatures";

var ISessionsSetUpService = createDecorator("sessionsSetUpService");

function shouldSkipSessionsWelcome(environmentService) {
  if (environmentService.enableSmokeTestDriver) {
    return true;
  }
  const envArgs = environmentService.args;
  if (envArgs?.["skip-sessions-welcome"]) {
    return true;
  }
  return typeof globalThis.location !== "undefined" && new URLSearchParams(globalThis.location.search).has("skip-sessions-welcome");
}

var SessionsSetUpWidget = class extends Disposable {
  // Non-service params must come before @-decorated service params
  constructor(onCompleted, serviceWhenSetupDone, serviceMarkDone, onInitialSignInDialogShown, defaultAccountService, productService, storageService, contextKeyService, environmentService, authenticationService, logService, commandService, configurationService, layoutService, keybindingService, hostService, markdownRendererService, instantiationService, sessionsManagementService) {
    super();
    this.onCompleted = onCompleted;
    this.serviceWhenSetupDone = serviceWhenSetupDone;
    this.serviceMarkDone = serviceMarkDone;
    this.onInitialSignInDialogShown = onInitialSignInDialogShown;
    this.defaultAccountService = defaultAccountService;
    this.productService = productService;
    this.storageService = storageService;
    this.contextKeyService = contextKeyService;
    this.environmentService = environmentService;
    this.authenticationService = authenticationService;
    this.logService = logService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.layoutService = layoutService;
    this.keybindingService = keybindingService;
    this.hostService = hostService;
    this.markdownRendererService = markdownRendererService;
    this.instantiationService = instantiationService;
    this.sessionsManagementService = sessionsManagementService;
    this.dialogRef = this._register(new MutableDisposable());
    this.watcherRef = this._register(new MutableDisposable());
    this.signInSetupCancellation = this._register(new MutableDisposable());
    this._initialSetupFlow = true;
    /** True while the window is open for a signed-out user via the conditional-auth opt-in. */
    this._proceedingSignedOut = false;
    /**
     * Set once the initial default-account resolution has completed. Until then
     * the synchronous {@link IDefaultAccountService.currentDefaultAccount} snapshot
     * is `null` even for a signed-in user, so a `null` reading means "not known
     * yet", not "signed out". The conditional-auth reaction stays inert until this
     * flips, otherwise it forces a sign-in modal on a signed-in user during the
     * startup gap — one nothing can retire, since the account resolves silently.
     */
    this._accountResolved = false;
    this._waitingForSessionTypes = false;
    this._allowSignedOutWhenUsable = observeAllowSignedOutWhenUsable(this.configurationService);
    this._register(runOnChange(this._allowSignedOutWhenUsable, () => this._onAllowSignedOutWhenUsableChanged()));
    this._register(this.sessionsManagementService.onDidChangeSessionTypes(() => this._onSessionTypesChanged()));
    this._start();
  }
  _onSessionTypesChanged() {
    const signedIn = this.defaultAccountService.currentDefaultAccount !== null;
    if (conditionalAuthState(this._accountResolved, signedIn) === 2 /* SignedOut */) {
      this._reevaluateSignedOut();
    }
  }
  /**
   * The opt-in was toggled while the window is open. Ignored until the account
   * has resolved (see {@link _accountResolved}) and for signed-in users. For a
   * signed-out user, turning it on retires an already-open sign-in modal (it was
   * raised before the account resolved); turning it off falls back to demanding
   * sign-in.
   */
  _onAllowSignedOutWhenUsableChanged() {
    const signedIn = this.defaultAccountService.currentDefaultAccount !== null;
    if (conditionalAuthState(this._accountResolved, signedIn) !== 2 /* SignedOut */) {
      return;
    }
    this._reevaluateSignedOut();
  }
  _start() {
    if (!this.productService.defaultChatAgent?.chatExtensionId) {
      this.onCompleted();
      return;
    }
    if (shouldSkipSessionsWelcome(this.environmentService)) {
      this.onCompleted();
      return;
    }
    this.defaultAccountService.getDefaultAccount().then(() => {
      if (this._store.isDisposed) {
        return;
      }
      this._accountResolved = true;
      if (!this._initialSetupFlow && this._allowSignedOutWhenUsable.get()) {
        this._onAllowSignedOutWhenUsableChanged();
      }
    });
    if (isWeb) {
      void this._checkWebAuth().finally(() => this._initialSetupFlow = false);
      this._watchWebAuth();
      return;
    }
    const isFirstLaunch = !this.storageService.getBoolean(WELCOME_COMPLETE_KEY, -1 /* APPLICATION */, false);
    if (isFirstLaunch) {
      void this._showWelcome(true).finally(() => this._initialSetupFlow = false);
    } else {
      void this._watchSignInState().finally(() => this._initialSetupFlow = false);
    }
  }
  async _checkWebAuth() {
    try {
      const sessions = await this.authenticationService.getSessions("github");
      if (sessions.length > 0) {
        this.logService.info("[sessions welcome] GitHub session found on web, skipping welcome");
        this.storageService.store(WELCOME_COMPLETE_KEY, true, -1 /* APPLICATION */, 1 /* MACHINE */);
        this.onCompleted();
        return;
      }
    } catch {
    }
    this._showWelcome(false);
  }
  _watchWebAuth() {
    this._register(this.authenticationService.onDidChangeSessions(async (e4) => {
      if (e4.providerId !== "github" || !e4.event.removed?.length) {
        return;
      }
      try {
        const remaining = await this.authenticationService.getSessions("github");
        if (remaining.length > 0) {
          return;
        }
      } catch {
      }
      this.logService.info("[sessions welcome] GitHub session removed on web, re-showing welcome");
      this.storageService.remove(WELCOME_COMPLETE_KEY, -1 /* APPLICATION */);
      this._showWelcome(false);
    }));
  }
  async _watchSignInState() {
    const initialAccount = await this.defaultAccountService.getDefaultAccount();
    if (this.dialogRef.value) {
      return;
    }
    if (!initialAccount) {
      const welcomeComplete = this.storageService.getBoolean(WELCOME_COMPLETE_KEY, -1 /* APPLICATION */, false);
      if (welcomeComplete && this._allowSignedOutWhenUsable.get()) {
        await this._proceedWithoutGitHub();
      } else {
        this._showWelcome(false);
      }
      return;
    }
    await this._ensureAIFeaturesEnabled();
    this.onCompleted();
    this.watcherRef.value = this._watchActiveState(true);
  }
  _watchActiveState(signedIn) {
    const disposables = new DisposableStore();
    disposables.add(this.defaultAccountService.onDidChangeDefaultAccount((account) => {
      const nowSignedIn = account !== null;
      if (signedIn && !nowSignedIn) {
        this.storageService.remove(WELCOME_COMPLETE_KEY, -1 /* APPLICATION */);
        this._reevaluateSignedOut();
      } else if (!signedIn && nowSignedIn) {
        this._proceedingSignedOut = false;
      }
      signedIn = nowSignedIn;
    }));
    disposables.add(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(AIDisabledConfig)) {
        if (this.configurationService.getValue(AIDisabledConfig)) {
          this._showAIDisabledDialog();
        } else {
          this.dialogRef.clear();
        }
      }
    }));
    return disposables;
  }
  /**
   * Resolve the window-level signed-out gate from the opt-in and the live auth
   * requirement of every advertised session type.
   */
  _signedOutWindowGate() {
    return resolveSignedOutWindowGate(
      this._allowSignedOutWhenUsable.get(),
      this.sessionsManagementService.getAllProviderSessionTypes().map(({ sessionType }) => sessionType.authRequirement)
    );
  }
  /**
   * Re-run the signed-out decision after an input change: force GitHub sign-in
   * when the gate demands it, otherwise open the window without GitHub. A no-op
   * while a dialog is up — that dialog owns the next transition.
   */
  _reevaluateSignedOut() {
    if (this._initialSetupFlow) {
      return;
    }
    if (this._proceedingSignedOut && this._allowSignedOutWhenUsable.get()) {
      return;
    }
    const gate = this._signedOutWindowGate();
    if (gate === 0 /* Unresolved */) {
      this._waitingForSessionTypes = true;
      return;
    }
    if (this._waitingForSessionTypes) {
      this._waitingForSessionTypes = false;
      this.dialogRef.clear();
    }
    if (gate === 2 /* ForceGitHubSignIn */) {
      if (this.dialogRef.value) {
        return;
      }
      this._proceedingSignedOut = false;
      void this._showWelcome(false);
    } else {
      this.signInSetupCancellation.value?.cancel();
      this.dialogRef.clear();
      void this._proceedWithoutGitHub();
    }
  }
  /**
   * Open the Agents window for a signed-out user because the opt-in permits it.
   * Mirrors the signed-in completion path and remains active until sign-in or the
   * opt-in changes. Idempotent while already proceeding.
   */
  async _proceedWithoutGitHub() {
    if (this._proceedingSignedOut) {
      return;
    }
    this._proceedingSignedOut = true;
    this.logService.info("[sessions welcome] Proceeding without GitHub sign-in; signed-out operation is enabled");
    await this._ensureAIFeaturesEnabled();
    if (this._store.isDisposed) {
      return;
    }
    this.onCompleted();
    this.watcherRef.value = this._watchActiveState(false);
  }
  async _ensureAIFeaturesEnabled() {
    if (this.configurationService.getValue(AIDisabledConfig)) {
      this.logService.info("[sessions welcome] AI features disabled, enabling");
      await this.configurationService.updateValue(AIDisabledConfig, false);
    }
  }
  async _showAIDisabledDialog() {
    if (this.dialogRef.value) {
      return;
    }
    this.logService.info("[sessions welcome] AI features disabled, showing enable dialog");
    const disposables = new DisposableStore();
    this.dialogRef.value = disposables;
    const welcomeVisibleKey = SessionsWelcomeVisibleContext.bindTo(this.contextKeyService);
    welcomeVisibleKey.set(true);
    disposables.add(toDisposable(() => welcomeVisibleKey.reset()));
    const dialog = disposables.add(new Dialog(
      this.layoutService.activeContainer,
      "",
      [localize(3854, null)],
      createWorkbenchDialogOptions({
        type: "none",
        extraClasses: ["chat-setup-dialog", "sessions-welcome-dialog"],
        detail: localize(3853, null),
        icon: Codicon.agent,
        alignment: 1 /* Vertical */,
        cancelId: 1,
        disableCloseButton: true,
        disableCloseAction: true
      }, this.keybindingService, this.layoutService, this.hostService)
    ));
    const { button } = await dialog.show();
    disposables.dispose();
    this.dialogRef.clear();
    if (button === 0) {
      this.logService.info("[sessions welcome] User chose to enable AI features");
      await this.configurationService.updateValue(AIDisabledConfig, false);
    }
  }
  async _showWelcome(isFirstLaunch) {
    if (this.dialogRef.value) {
      return;
    }
    if (!isFirstLaunch) {
      const gate = this._signedOutWindowGate();
      if (gate === 0 /* Unresolved */) {
        this._waitingForSessionTypes = true;
        return;
      }
      if (gate === 1 /* Proceed */) {
        await this._proceedWithoutGitHub();
        return;
      }
    }
    this.watcherRef.clear();
    this.dialogRef.value = new DisposableStore();
    const welcomeVisibleKey = SessionsWelcomeVisibleContext.bindTo(this.contextKeyService);
    welcomeVisibleKey.set(true);
    this.dialogRef.value.add(toDisposable(() => welcomeVisibleKey.reset()));
    if (isFirstLaunch) {
      const overlay = this._showLoadingOverlay();
      this.dialogRef.value.add(overlay);
      const account = await this.defaultAccountService.getDefaultAccount();
      if (this._store.isDisposed) {
        return;
      }
      overlay.element.classList.add("sessions-loading-dismissed");
      this.dialogRef.value.add(disposableTimeout(() => overlay.element.remove(), 200));
      if (account) {
        const setupDone = await this.serviceWhenSetupDone();
        if (this._store.isDisposed) {
          return;
        }
        if (setupDone) {
          this.storageService.store(WELCOME_COMPLETE_KEY, true, -1 /* APPLICATION */, 1 /* MACHINE */);
          this.dialogRef.clear();
          this._watchSignInState();
          return;
        }
        await this._showWelcomeDialog();
      } else {
        const allowContinueWithoutSignIn = this._allowSignedOutWhenUsable.get();
        const continueWithoutSignIn = await this._showSignInDialog(allowContinueWithoutSignIn);
        if (continueWithoutSignIn) {
          this.storageService.store(WELCOME_COMPLETE_KEY, true, -1 /* APPLICATION */, 1 /* MACHINE */);
          this.serviceMarkDone();
          this.dialogRef.clear();
          await this._proceedWithoutGitHub();
          return;
        }
      }
    } else {
      await this._showSignInDialog();
    }
    this.dialogRef.clear();
    await this._ensureAIFeaturesEnabled();
    this._watchSignInState();
  }
  _showLoadingOverlay() {
    const overlay = append(this.layoutService.mainContainer, $("div.sessions-loading-overlay"));
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-busy", "true");
    overlay.setAttribute("aria-label", localize(3852, null));
    append(overlay, $("div.sessions-loading-icon.codicon.codicon-agent"));
    return { element: overlay, dispose: () => overlay.remove() };
  }
  async _showSignInDialog(allowContinueWithoutSignIn = false) {
    if (this._initialSetupFlow) {
      this.onInitialSignInDialogShown();
    }
    this.logService.info("[sessions welcome] Showing sign-in dialog");
    const setupCancellation = new CancellationTokenSource();
    this.signInSetupCancellation.value = setupCancellation;
    while (true) {
      const attemptDisposables = new DisposableStore();
      const signingInDialogRef = attemptDisposables.add(new MutableDisposable());
      let canceled2 = false;
      let continueWithoutSignIn = false;
      const showReturnToVSCodeEditor = !isWeb && await this.commandService.executeCommand(SHOULD_SHOW_RETURN_TO_VSCODE_EDITOR_COMMAND_ID) === true;
      const onContinueWithoutSignIn = () => {
        if (!this._allowSignedOutWhenUsable.get()) {
          return;
        }
        continueWithoutSignIn = true;
        setupCancellation.cancel();
      };
      let success;
      try {
        success = await this.commandService.executeCommand("workbench.action.chat.triggerSetup", void 0, {
          ...createSessionsSignInDialogOptions(this.commandService, showReturnToVSCodeEditor, allowContinueWithoutSignIn, onContinueWithoutSignIn),
          cancellationToken: setupCancellation.token,
          onSignInStarted: (cancel) => {
            signingInDialogRef.value = this.instantiationService.createInstance(SessionsSigningInDialog, () => {
              canceled2 = true;
              cancel();
            });
          }
        });
      } finally {
        attemptDisposables.dispose();
      }
      if (continueWithoutSignIn) {
        this.logService.info("[sessions welcome] User chose to continue without GitHub sign-in");
        this.signInSetupCancellation.clear();
        return true;
      }
      if (setupCancellation.token.isCancellationRequested) {
        this.logService.info("[sessions welcome] Sign-in dialog retired because another agent became usable");
        this.signInSetupCancellation.clear();
        return false;
      }
      if (canceled2) {
        this.logService.info("[sessions welcome] Sign-in canceled; returning to sign-in dialog");
        continue;
      }
      if (success) {
        this.logService.info("[sessions welcome] Sign-in completed successfully");
        this.storageService.store(WELCOME_COMPLETE_KEY, true, -1 /* APPLICATION */, 1 /* MACHINE */);
        this.serviceMarkDone();
      } else {
        this.logService.info("[sessions welcome] Sign-in was canceled or failed");
      }
      this.signInSetupCancellation.clear();
      return false;
    }
  }
  async _showWelcomeDialog() {
    this.logService.info("[sessions welcome] Showing welcome dialog");
    const disposables = new DisposableStore();
    const productName = localize(3858, null, this.productService.nameLong);
    const dialog = disposables.add(new Dialog(
      this.layoutService.activeContainer,
      localize(3857, null, productName),
      [localize(3856, null)],
      createWorkbenchDialogOptions({
        type: "none",
        extraClasses: ["chat-setup-dialog", "sessions-welcome-dialog", "sessions-main-welcome-dialog"],
        detail: localize(3855, null),
        icon: Codicon.agent,
        alignment: 1 /* Vertical */,
        cancelId: 1,
        disableCloseButton: true,
        renderFooter: (footer) => footer.appendChild(this._createWelcomeFooter(disposables))
      }, this.keybindingService, this.layoutService, this.hostService)
    ));
    await dialog.show();
    disposables.dispose();
    this.storageService.store(WELCOME_COMPLETE_KEY, true, -1 /* APPLICATION */, 1 /* MACHINE */);
    this.serviceMarkDone();
  }
  _createWelcomeFooter(disposables) {
    const element = $(".chat-setup-dialog-footer");
    const defaultChatAgent2 = this.productService.defaultChatAgent;
    const providerName = defaultChatAgent2?.provider?.default?.name ?? "GitHub";
    const termsUrl = defaultChatAgent2?.termsStatementUrl ?? "";
    const privacyUrl = defaultChatAgent2?.privacyStatementUrl ?? "";
    const publicCodeUrl = defaultChatAgent2?.publicCodeMatchesUrl ?? "";
    const settingsUrl = this.defaultAccountService.resolveGitHubUrl(GitHubPaths.copilotSettings);
    const footer = localize(
      3859,
      null,
      providerName,
      termsUrl,
      privacyUrl,
      providerName,
      publicCodeUrl,
      settingsUrl
    );
    element.appendChild($("p", void 0, disposables.add(this.markdownRendererService.render(new MarkdownString(footer, { isTrusted: true }))).element));
    return element;
  }
};

SessionsSetUpWidget = __decorateClass([
  __decorateParam(4, IDefaultAccountService),
  __decorateParam(5, IProductService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IWorkbenchEnvironmentService),
  __decorateParam(9, IAuthenticationService),
  __decorateParam(10, ILogService),
  __decorateParam(11, ICommandService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IWorkbenchLayoutService),
  __decorateParam(14, IKeybindingService),
  __decorateParam(15, IHostService),
  __decorateParam(16, IMarkdownRendererService),
  __decorateParam(17, IInstantiationService),
  __decorateParam(18, ISessionsManagementService)
], SessionsSetUpWidget);

var SessionsSetUpService = class extends Disposable {
  constructor(instantiationService, userDataProfileStorageService, userDataProfilesService, chatEntitlementService, logService) {
    super();
    this.instantiationService = instantiationService;
    this.userDataProfileStorageService = userDataProfileStorageService;
    this.userDataProfilesService = userDataProfilesService;
    this.chatEntitlementService = chatEntitlementService;
    this.logService = logService;
    this._welcomeDoneDeferred = new DeferredPromise();
    this._initialSignInDialogShown = false;
    this._initPromise = this.initialize();
    this._register(this.instantiationService.createInstance(
      SessionsSetUpWidget,
      () => this._welcomeDoneDeferred.complete(),
      () => this.whenSetupDone(),
      () => this.markDone(),
      () => this._initialSignInDialogShown = true
    ));
  }
  get initialSignInDialogShown() {
    return this._initialSignInDialogShown;
  }
  async whenSetupDone() {
    await this._initPromise;
    return this.chatEntitlementService.sentiment.completed === true;
  }
  markDone() {
    this.chatEntitlementService.markSetupCompleted();
  }
  whenWelcomeDone() {
    return this._welcomeDoneDeferred.p;
  }
  async initialize() {
    if (this.chatEntitlementService.sentiment.completed) {
      return;
    }
    try {
      const defaultProfile = this.userDataProfilesService.defaultProfile;
      await this.userDataProfileStorageService.withProfileScopedStorageService(defaultProfile, async (storageService) => {
        const defaultContext = this.instantiationService.createChild(new ServiceCollection([IStorageService, storageService])).createInstance(ChatEntitlementContext);
        try {
          if (defaultContext.state.completed) {
            this.logService.info("[sessions welcome] Setup already completed in default profile, marking done locally");
            this.markDone();
          }
        } finally {
          defaultContext.dispose();
        }
      });
    } catch (error) {
      this.logService.error("[sessions welcome] Failed to read setup state from default profile:", error);
    }
  }
};

SessionsSetUpService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IUserDataProfileStorageService),
  __decorateParam(2, IUserDataProfilesService),
  __decorateParam(3, IChatEntitlementService),
  __decorateParam(4, ILogService)
], SessionsSetUpService);
export { shouldSkipSessionsWelcome, AIDisabledConfig, ISessionsSetUpService, SessionsSetUpWidget, SessionsSetUpService };
