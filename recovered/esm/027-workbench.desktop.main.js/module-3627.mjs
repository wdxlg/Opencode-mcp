// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editSessions/browser/editSessionsStorageService.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { EDIT_SESSIONS_PENDING_KEY, EDIT_SESSIONS_SIGNED_IN, EDIT_SESSIONS_SIGNED_IN_KEY, EDIT_SESSION_SYNC_CATEGORY, IEditSessionsLogService } from "./module-3626.mjs";
import { createSyncHeaders } from "./module-1696.mjs";
import { generateUuid } from "./module-0190.mjs";
import { UserDataSyncMachinesService } from "./module-1749.mjs";
import { getCurrentAuthenticationSessionInfo } from "./module-1418.mjs";
import { isWeb } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationError } from "./module-0004.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IProductService } from "./module-0873.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ISecretStorageService } from "./module-0948.mjs";


// src/vs/workbench/contrib/editSessions/browser/editSessionsStorageService.ts
var EditSessionsWorkbenchService = class extends Disposable {
  // TODO@joyceerhl lifecycle hack
  constructor(fileService, storageService, quickInputService, authenticationService, extensionService, environmentService, logService, productService, contextKeyService, dialogService, secretStorageService) {
    super();
    this.fileService = fileService;
    this.storageService = storageService;
    this.quickInputService = quickInputService;
    this.authenticationService = authenticationService;
    this.extensionService = extensionService;
    this.environmentService = environmentService;
    this.logService = logService;
    this.productService = productService;
    this.contextKeyService = contextKeyService;
    this.dialogService = dialogService;
    this.secretStorageService = secretStorageService;
    this.SIZE_LIMIT = Math.floor(1024 * 1024 * 1.9);
    this.initialized = false;
    this._didSignIn = this._register(new Emitter());
    this._didSignOut = this._register(new Emitter());
    this._lastWrittenResources = /* @__PURE__ */ new Map();
    this._lastReadResources = /* @__PURE__ */ new Map();
    this.serverConfiguration = this.productService["editSessions.store"];
    this._register(this.authenticationService.onDidChangeSessions((e) => this.onDidChangeSessions(e.event)));
    this._register(this.storageService.onDidChangeValue(-1 /* APPLICATION */, EditSessionsWorkbenchService.CACHED_SESSION_STORAGE_KEY, this._store)(() => this.onDidChangeStorage()));
    this.registerSignInAction();
    this.registerResetAuthenticationAction();
    this.signedInContext = EDIT_SESSIONS_SIGNED_IN.bindTo(this.contextKeyService);
    this.signedInContext.set(this.existingSessionId !== void 0);
  }
  static {
    this.CACHED_SESSION_STORAGE_KEY = "editSessionAccountPreference";
  }
  get isSignedIn() {
    return this.existingSessionId !== void 0;
  }
  get onDidSignIn() {
    return this._didSignIn.event;
  }
  get onDidSignOut() {
    return this._didSignOut.event;
  }
  get lastWrittenResources() {
    return this._lastWrittenResources;
  }
  get lastReadResources() {
    return this._lastReadResources;
  }
  /**
   * @param resource: The resource to retrieve content for.
   * @param content An object representing resource state to be restored.
   * @returns The ref of the stored state.
   */
  async write(resource, content2) {
    await this.initialize("write", false);
    if (!this.initialized) {
      throw new Error("Please sign in to store your edit session.");
    }
    if (typeof content2 !== "string" && content2.machine === void 0) {
      content2.machine = await this.getOrCreateCurrentMachineId();
    }
    content2 = typeof content2 === "string" ? content2 : JSON.stringify(content2);
    const ref = await this.storeClient.writeResource(resource, content2, null, void 0, createSyncHeaders(generateUuid()));
    this._lastWrittenResources.set(resource, { ref, content: content2 });
    return ref;
  }
  /**
   * @param resource: The resource to retrieve content for.
   * @param ref: A specific content ref to retrieve content for, if it exists.
   * If undefined, this method will return the latest saved edit session, if any.
   *
   * @returns An object representing the requested or latest state, if any.
   */
  async read(resource, ref) {
    await this.initialize("read", false);
    if (!this.initialized) {
      throw new Error("Please sign in to apply your latest edit session.");
    }
    let content2;
    const headers = createSyncHeaders(generateUuid());
    try {
      if (ref !== void 0) {
        content2 = await this.storeClient?.resolveResourceContent(resource, ref, void 0, headers);
      } else {
        const result = await this.storeClient?.readResource(resource, null, void 0, headers);
        content2 = result?.content;
        ref = result?.ref;
      }
    } catch (ex) {
      this.logService.error(ex);
    }
    if (content2 !== void 0 && content2 !== null && ref !== void 0) {
      this._lastReadResources.set(resource, { ref, content: content2 });
      return { ref, content: content2 };
    }
    return void 0;
  }
  async delete(resource, ref) {
    await this.initialize("write", false);
    if (!this.initialized) {
      throw new Error(`Unable to delete edit session with ref ${ref}.`);
    }
    try {
      await this.storeClient?.deleteResource(resource, ref);
    } catch (ex) {
      this.logService.error(ex);
    }
  }
  async list(resource) {
    await this.initialize("read", false);
    if (!this.initialized) {
      throw new Error(`Unable to list edit sessions.`);
    }
    try {
      return this.storeClient?.getAllResourceRefs(resource) ?? [];
    } catch (ex) {
      this.logService.error(ex);
    }
    return [];
  }
  async initialize(reason, silent = false) {
    if (this.initialized) {
      return true;
    }
    this.initialized = await this.doInitialize(reason, silent);
    this.signedInContext.set(this.initialized);
    if (this.initialized) {
      this._didSignIn.fire();
    }
    return this.initialized;
  }
  /**
   *
   * Ensures that the store client is initialized,
   * meaning that authentication is configured and it
   * can be used to communicate with the remote storage service
   */
  async doInitialize(reason, silent) {
    await this.extensionService.whenInstalledExtensionsRegistered();
    if (!this.serverConfiguration?.url) {
      throw new Error("Unable to initialize sessions sync as session sync preference is not configured in product.json.");
    }
    if (this.storeClient === void 0) {
      return false;
    }
    this._register(this.storeClient.onTokenFailed(() => {
      this.logService.info("Clearing edit sessions authentication preference because of successive token failures.");
      this.clearAuthenticationPreference();
    }));
    if (this.machineClient === void 0) {
      this.machineClient = new UserDataSyncMachinesService(this.environmentService, this.fileService, this.storageService, this.storeClient, this.logService, this.productService);
    }
    if (this.authenticationInfo !== void 0) {
      return true;
    }
    const authenticationSession = await this.getAuthenticationSession(reason, silent);
    if (authenticationSession !== void 0) {
      this.authenticationInfo = authenticationSession;
      this.storeClient.setAuthToken(authenticationSession.token, authenticationSession.providerId);
    }
    return authenticationSession !== void 0;
  }
  async getMachineById(machineId) {
    await this.initialize("read", false);
    if (!this.cachedMachines) {
      const machines = await this.machineClient.getMachines();
      this.cachedMachines = machines.reduce((map, machine) => map.set(machine.id, machine.name), /* @__PURE__ */ new Map());
    }
    return this.cachedMachines.get(machineId);
  }
  async getOrCreateCurrentMachineId() {
    const currentMachineId = await this.machineClient.getMachines().then((machines) => machines.find((m) => m.isCurrent)?.id);
    if (currentMachineId === void 0) {
      await this.machineClient.addCurrentMachine();
      return await this.machineClient.getMachines().then((machines) => machines.find((m) => m.isCurrent).id);
    }
    return currentMachineId;
  }
  async getAuthenticationSession(reason, silent) {
    if (this.existingSessionId) {
      this.logService.info(`Searching for existing authentication session with ID ${this.existingSessionId}`);
      const existingSession = await this.getExistingSession();
      if (existingSession) {
        this.logService.info(`Found existing authentication session with ID ${existingSession.session.id}`);
        return { sessionId: existingSession.session.id, token: existingSession.session.idToken ?? existingSession.session.accessToken, providerId: existingSession.session.providerId };
      } else {
        this._didSignOut.fire();
      }
    }
    if (this.shouldAttemptEditSessionInit()) {
      this.logService.info(`Reusing user data sync enablement`);
      const authenticationSessionInfo = await getCurrentAuthenticationSessionInfo(this.secretStorageService, this.productService);
      if (authenticationSessionInfo !== void 0) {
        this.logService.info(`Using current authentication session with ID ${authenticationSessionInfo.id}`);
        this.existingSessionId = authenticationSessionInfo.id;
        return { sessionId: authenticationSessionInfo.id, token: authenticationSessionInfo.accessToken, providerId: authenticationSessionInfo.providerId };
      }
    }
    if (silent) {
      return;
    }
    const authenticationSession = await this.getAccountPreference(reason);
    if (authenticationSession !== void 0) {
      this.existingSessionId = authenticationSession.id;
      return { sessionId: authenticationSession.id, token: authenticationSession.idToken ?? authenticationSession.accessToken, providerId: authenticationSession.providerId };
    }
    return void 0;
  }
  shouldAttemptEditSessionInit() {
    return isWeb && this.storageService.isNew(-1 /* APPLICATION */) && this.storageService.isNew(1 /* WORKSPACE */);
  }
  /**
   *
   * Prompts the user to pick an authentication option for storing and getting edit sessions.
   */
  async getAccountPreference(reason) {
    const disposables = new DisposableStore();
    const quickpick = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    quickpick.ok = false;
    quickpick.placeholder = reason === "read" ? localize(14931, null) : localize(14930, null);
    quickpick.ignoreFocusOut = true;
    quickpick.items = await this.createQuickpickItems();
    return new Promise((resolve3, reject) => {
      disposables.add(quickpick.onDidHide((e) => {
        reject(new CancellationError());
        disposables.dispose();
      }));
      disposables.add(quickpick.onDidAccept(async (e) => {
        const selection = quickpick.selectedItems[0];
        const session = "provider" in selection ? { ...await this.authenticationService.createSession(selection.provider.id, selection.provider.scopes), providerId: selection.provider.id } : "session" in selection ? selection.session : void 0;
        resolve3(session);
        quickpick.hide();
      }));
      quickpick.show();
    });
  }
  async createQuickpickItems() {
    const options3 = [];
    options3.push({ type: "separator", label: localize(14939, null) });
    const sessions = await this.getAllSessions();
    options3.push(...sessions);
    options3.push({ type: "separator", label: localize(14933, null) });
    for (const authenticationProvider of await this.getAuthenticationProviders()) {
      const signedInForProvider = sessions.some((account) => account.session.providerId === authenticationProvider.id);
      if (!signedInForProvider || this.authenticationService.getProvider(authenticationProvider.id).supportsMultipleAccounts) {
        const providerName = this.authenticationService.getProvider(authenticationProvider.id).label;
        options3.push({ label: localize(14937, null, providerName), provider: authenticationProvider });
      }
    }
    return options3;
  }
  /**
   *
   * Returns all authentication sessions available from {@link getAuthenticationProviders}.
   */
  async getAllSessions() {
    const authenticationProviders = await this.getAuthenticationProviders();
    const accounts = /* @__PURE__ */ new Map();
    let currentSession;
    for (const provider of authenticationProviders) {
      const sessions = await this.authenticationService.getSessions(provider.id, provider.scopes);
      for (const session of sessions) {
        const item = {
          label: session.account.label,
          description: this.authenticationService.getProvider(provider.id).label,
          session: { ...session, providerId: provider.id }
        };
        accounts.set(item.session.account.id, item);
        if (this.existingSessionId === session.id) {
          currentSession = item;
        }
      }
    }
    if (currentSession !== void 0) {
      accounts.set(currentSession.session.account.id, currentSession);
    }
    return [...accounts.values()].sort((a, b) => a.label.localeCompare(b.label));
  }
  /**
   *
   * Returns all authentication providers which can be used to authenticate
   * to the remote storage service, based on product.json configuration
   * and registered authentication providers.
   */
  async getAuthenticationProviders() {
    if (!this.serverConfiguration) {
      throw new Error("Unable to get configured authentication providers as session sync preference is not configured in product.json.");
    }
    const authenticationProviders = this.serverConfiguration.authenticationProviders;
    const configuredAuthenticationProviders = Object.keys(authenticationProviders).reduce((result, id2) => {
      result.push({ id: id2, scopes: authenticationProviders[id2].scopes });
      return result;
    }, []);
    const availableAuthenticationProviders = this.authenticationService.declaredProviders;
    return configuredAuthenticationProviders.filter(({ id: id2 }) => availableAuthenticationProviders.some((provider) => provider.id === id2));
  }
  get existingSessionId() {
    return this.storageService.get(EditSessionsWorkbenchService.CACHED_SESSION_STORAGE_KEY, -1 /* APPLICATION */);
  }
  set existingSessionId(sessionId) {
    this.logService.trace(`Saving authentication session preference for ID ${sessionId}.`);
    if (sessionId === void 0) {
      this.storageService.remove(EditSessionsWorkbenchService.CACHED_SESSION_STORAGE_KEY, -1 /* APPLICATION */);
    } else {
      this.storageService.store(EditSessionsWorkbenchService.CACHED_SESSION_STORAGE_KEY, sessionId, -1 /* APPLICATION */, 1 /* MACHINE */);
    }
  }
  async getExistingSession() {
    const accounts = await this.getAllSessions();
    return accounts.find((account) => account.session.id === this.existingSessionId);
  }
  async onDidChangeStorage() {
    const newSessionId = this.existingSessionId;
    const previousSessionId = this.authenticationInfo?.sessionId;
    if (previousSessionId !== newSessionId) {
      this.logService.trace(`Resetting authentication state because authentication session ID preference changed from ${previousSessionId} to ${newSessionId}.`);
      this.authenticationInfo = void 0;
      this.initialized = false;
    }
  }
  clearAuthenticationPreference() {
    this.authenticationInfo = void 0;
    this.initialized = false;
    this.existingSessionId = void 0;
    this.signedInContext.set(false);
  }
  onDidChangeSessions(e) {
    if (this.authenticationInfo?.sessionId && e.removed?.find((session) => session.id === this.authenticationInfo?.sessionId)) {
      this.clearAuthenticationPreference();
    }
  }
  registerSignInAction() {
    if (!this.serverConfiguration?.url) {
      return;
    }
    const that = this;
    const id2 = "workbench.editSessions.actions.signIn";
    const when = ContextKeyExpr.and(ContextKeyExpr.equals(EDIT_SESSIONS_PENDING_KEY, false), ContextKeyExpr.equals(EDIT_SESSIONS_SIGNED_IN_KEY, false));
    this._register(registerAction2(class ResetEditSessionAuthenticationAction extends Action2 {
      constructor() {
        super({
          id: id2,
          title: localize(14935, null),
          category: EDIT_SESSION_SYNC_CATEGORY,
          precondition: when,
          menu: [
            {
              id: MenuId.CommandPalette
            },
            {
              id: MenuId.AccountsContext,
              group: "2_editSessions",
              when
            }
          ]
        });
      }
      async run() {
        return await that.initialize("write", false);
      }
    }));
    this._register(MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
      group: "2_editSessions",
      command: {
        id: id2,
        title: localize(14936, null)
      },
      when: ContextKeyExpr.and(ContextKeyExpr.equals(EDIT_SESSIONS_PENDING_KEY, true), ContextKeyExpr.equals(EDIT_SESSIONS_SIGNED_IN_KEY, false))
    }));
  }
  registerResetAuthenticationAction() {
    const that = this;
    this._register(registerAction2(class ResetEditSessionAuthenticationAction extends Action2 {
      constructor() {
        super({
          id: "workbench.editSessions.actions.resetAuth",
          title: localize(14934, null),
          category: EDIT_SESSION_SYNC_CATEGORY,
          precondition: ContextKeyExpr.equals(EDIT_SESSIONS_SIGNED_IN_KEY, true),
          menu: [
            {
              id: MenuId.CommandPalette
            },
            {
              id: MenuId.AccountsContext,
              group: "2_editSessions",
              when: ContextKeyExpr.equals(EDIT_SESSIONS_SIGNED_IN_KEY, true)
            }
          ]
        });
      }
      async run() {
        const result = await that.dialogService.confirm({
          message: localize(14938, null),
          checkbox: { label: localize(14932, null) }
        });
        if (result.confirmed) {
          if (result.checkboxChecked) {
            that.storeClient?.deleteResource("editSessions", null);
          }
          that.clearAuthenticationPreference();
        }
      }
    }));
  }
};

EditSessionsWorkbenchService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, IAuthenticationService),
  __decorateParam(4, IExtensionService),
  __decorateParam(5, IEnvironmentService),
  __decorateParam(6, IEditSessionsLogService),
  __decorateParam(7, IProductService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IDialogService),
  __decorateParam(10, ISecretStorageService)
], EditSessionsWorkbenchService);
export { EditSessionsWorkbenchService };
