// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/browser/extensionEnablementService.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Delayer } from "./module-0036.mjs";
import { StorageManager } from "./module-1638.mjs";
import { isWeb } from "./module-0014.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { BetterMergeId, areSameExtensions, getExtensionDependencies, isMalicious } from "./module-0888.mjs";
import { isAuthenticationProviderExtension, isLanguagePackExtension, isResolverExtension } from "./module-0688.mjs";
import { webWorkerExtHostConfig } from "./module-0889.mjs";
import { DISABLED_EXTENSIONS_STORAGE_PATH, ENABLED_EXTENSIONS_STORAGE_PATH, IAllowedExtensionsService, IExtensionManagementService, IGlobalExtensionEnablementService } from "./module-0874.mjs";
import { isVirtualWorkspace } from "./module-0937.mjs";
import { equals } from "./module-0007.mjs";
import { isString } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IExtensionManagementServerService, IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "./module-1047.mjs";
import { IUserDataSyncEnablementService } from "./module-1639.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { IUserDataSyncAccountService } from "./module-1640.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IHostService } from "./module-1118.mjs";
import { IExtensionBisectService } from "./module-1641.mjs";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { IExtensionManifestPropertiesService } from "./module-1049.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProductService } from "./module-0875.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/extensionManagement/browser/extensionEnablementService.ts
var SOURCE = "IWorkbenchExtensionEnablementService";

var EXTENSION_UNIFICATION_SETTING = "chat.extensionUnification.enabled";

var MALICIOUS_EXTENSIONS_STORAGE_KEY = "extensionsEnablement/malicious";

var ExtensionEnablementService = class extends Disposable {
  constructor(storageService, globalExtensionEnablementService, contextService, environmentService, extensionManagementService, configurationService, extensionManagementServerService, userDataSyncEnablementService, defaultAccountService, userDataSyncAccountService, lifecycleService, notificationService, hostService, extensionBisectService, allowedExtensionsService, workspaceTrustManagementService, workspaceTrustRequestService, extensionManifestPropertiesService, chatEntitlementService, instantiationService, logService, productService) {
    super();
    this.storageService = storageService;
    this.globalExtensionEnablementService = globalExtensionEnablementService;
    this.contextService = contextService;
    this.environmentService = environmentService;
    this.extensionManagementService = extensionManagementService;
    this.configurationService = configurationService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.defaultAccountService = defaultAccountService;
    this.userDataSyncAccountService = userDataSyncAccountService;
    this.lifecycleService = lifecycleService;
    this.notificationService = notificationService;
    this.extensionBisectService = extensionBisectService;
    this.allowedExtensionsService = allowedExtensionsService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    this.chatEntitlementService = chatEntitlementService;
    this.logService = logService;
    this._onEnablementChanged = this._register(new Emitter());
    this.onEnablementChanged = this._onEnablementChanged.event;
    this.extensionsDisabledExtensions = [];
    this.delayer = this._register(new Delayer(0));
    this.storageManager = this._register(new StorageManager(storageService));
    const uninstallDisposable = this._register(Event2.filter(extensionManagementService.onDidUninstallExtension, (e4) => !e4.error)(({ identifier: identifier2 }) => this._reset(identifier2)));
    let isDisposed = false;
    this._register(toDisposable(() => isDisposed = true));
    this.extensionsManager = this._register(instantiationService.createInstance(ExtensionsManager));
    this.extensionsManager.whenInitialized().then(() => {
      if (!isDisposed) {
        uninstallDisposable.dispose();
        this._onDidChangeExtensions([], [], false);
        this._register(this.extensionsManager.onDidChangeExtensions(({ added, removed, isProfileSwitch }) => this._onDidChangeExtensions(added, removed, isProfileSwitch)));
        this.loopCheckForMaliciousExtensions();
      }
    });
    this._register(this.globalExtensionEnablementService.onDidChangeEnablement(({ extensions, source }) => this._onDidChangeGloballyDisabledExtensions(extensions, source)));
    this._register(allowedExtensionsService.onDidChangeAllowedExtensionsConfigValue(() => this._onDidChangeExtensions([], [], false)));
    this._register(this.storageService.onDidChangeValue(-1 /* APPLICATION */, MALICIOUS_EXTENSIONS_STORAGE_KEY, this._store)(() => this._maliciousExtensionsCache = void 0));
    this._completionsExtensionId = productService.defaultChatAgent?.extensionId.toLowerCase();
    this._chatExtensionId = productService.defaultChatAgent?.chatExtensionId.toLowerCase();
    this._sessionsWindowAllowedExtensions = new Set((productService.sessionsWindowAllowedExtensions ?? []).map((id2) => id2.toLowerCase()));
    const unificationExtensions = [this._completionsExtensionId, this._chatExtensionId].filter((id2) => !!id2);
    if (isWeb && this.environmentService.remoteAuthority === void 0) {
      this._extensionUnificationEnabled = false;
    } else {
      this._extensionUnificationEnabled = this.configurationService.getValue(EXTENSION_UNIFICATION_SETTING);
    }
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(EXTENSION_UNIFICATION_SETTING)) {
        const extensionUnificationEnabled = this.configurationService.getValue(EXTENSION_UNIFICATION_SETTING);
        if (!extensionUnificationEnabled) {
          this._extensionUnificationEnabled = false;
          this._onEnablementChanged.fire(this.extensionsManager.extensions.filter((ext) => unificationExtensions.includes(ext.identifier.id.toLowerCase())));
        }
      }
    }));
    if (this.allUserExtensionsDisabled) {
      this.lifecycleService.when(4 /* Eventually */).then(() => {
        this.notificationService.prompt(Severity2.Info, localize(22951, null), [{
          label: localize(22953, null),
          run: () => hostService.reload({ disableExtensions: false })
        }], {
          sticky: true,
          priority: 3 /* URGENT */
        });
      });
    }
    this.ensureChatExtensionInitialDisabledState();
  }
  ensureChatExtensionInitialDisabledState() {
    if (!this._chatExtensionId || this.environmentService.isSessionsWindow || this.environmentService.skipBuiltinExtensions?.some((id2) => id2.toLowerCase() === this._chatExtensionId)) {
      return;
    }
    const builtinChatExtensionEnablementMigrationKey = "builtinChatExtensionEnablementMigration";
    const builtinChatExtensionEnablementMigration = this.storageService.getBoolean(builtinChatExtensionEnablementMigrationKey, 0 /* PROFILE */) === true;
    if (builtinChatExtensionEnablementMigration) {
      return;
    }
    this.logService.debug("Running builtin chat extension enablement migration");
    this.storageService.store(builtinChatExtensionEnablementMigrationKey, true, 0 /* PROFILE */, 1 /* MACHINE */);
    const context2 = this.chatEntitlementService.context;
    if (context2) {
      if (context2.value.state.completed) {
        if (this._isDisabledGlobally({ id: this._chatExtensionId })) {
          if (this.configurationService.getValue(ChatAIDisabledSettingId) !== true) {
            this.logService.debug("Disabling AI features because builtin chat extension is disabled");
            this.configurationService.updateValue(ChatAIDisabledSettingId, true).catch((err) => this.logService.error("Failed to update chat.disableAIFeatures setting during builtin chat extension enablement migration", err));
          }
        }
      } else {
        try {
          this.logService.debug("Disabling builtin chat extension as chat set up is not completed");
          this._disableExtension({ id: this._chatExtensionId });
        } catch (error) {
          this.logService.error("Failed to disable builtin chat extension during enablement migration", error);
        }
      }
    }
  }
  get hasWorkspace() {
    return this.contextService.getWorkbenchState() !== 1 /* EMPTY */;
  }
  get allUserExtensionsDisabled() {
    return this.environmentService.disableExtensions === true;
  }
  getEnablementState(extension) {
    return this._computeEnablementState(extension, this.extensionsManager.extensions, this.getWorkspaceType());
  }
  getEnablementStates(extensions, workspaceTypeOverrides = {}) {
    const extensionsEnablements = /* @__PURE__ */ new Map();
    const workspaceType = { ...this.getWorkspaceType(), ...workspaceTypeOverrides };
    return extensions.map((extension) => this._computeEnablementState(extension, extensions, workspaceType, extensionsEnablements));
  }
  getDependenciesEnablementStates(extension) {
    return getExtensionDependencies(this.extensionsManager.extensions, extension).map((e4) => [e4, this.getEnablementState(e4)]);
  }
  canChangeEnablement(extension) {
    try {
      this.throwErrorIfCannotChangeEnablement(extension);
      return true;
    } catch (error) {
      return false;
    }
  }
  canChangeWorkspaceEnablement(extension) {
    if (!this.canChangeEnablement(extension)) {
      return false;
    }
    try {
      this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
      return true;
    } catch (error) {
      return false;
    }
  }
  isDefaultOrSettingsSyncAuthProviderExtension(manifest) {
    if (!isAuthenticationProviderExtension(manifest)) {
      return false;
    }
    const defaultAccountAuthProvider = this.defaultAccountService.getDefaultAccountAuthenticationProvider();
    if (manifest.contributes.authentication.some((a) => a.id === defaultAccountAuthProvider.id)) {
      return true;
    }
    if (this.userDataSyncEnablementService.isEnabled() && this.userDataSyncAccountService.account && manifest.contributes.authentication.some((a) => a.id === this.userDataSyncAccountService.account.authenticationProviderId)) {
      return true;
    }
    return false;
  }
  throwErrorIfCannotChangeEnablement(extension, donotCheckDependencies) {
    if (isLanguagePackExtension(extension.manifest)) {
      throw new Error(localize(22948, null, extension.manifest.displayName || extension.identifier.id));
    }
    if (this.isDefaultOrSettingsSyncAuthProviderExtension(extension.manifest)) {
      throw new Error(localize(22949, null, extension.manifest.displayName || extension.identifier.id));
    }
    if (this._isEnabledInEnv(extension)) {
      throw new Error(localize(22943, null, extension.manifest.displayName || extension.identifier.id));
    }
    this.throwErrorIfEnablementStateCannotBeChanged(extension, this.getEnablementState(extension), donotCheckDependencies);
  }
  throwErrorIfEnablementStateCannotBeChanged(extension, enablementStateOfExtension, donotCheckDependencies) {
    switch (enablementStateOfExtension) {
      case 2 /* DisabledByEnvironment */:
        throw new Error(localize(22940, null, extension.manifest.displayName || extension.identifier.id));
      case 4 /* DisabledByMalicious */:
        throw new Error(localize(22945, null, extension.manifest.displayName || extension.identifier.id));
      case 5 /* DisabledByVirtualWorkspace */:
        throw new Error(localize(22946, null, extension.manifest.displayName || extension.identifier.id));
      case 1 /* DisabledByExtensionKind */:
        throw new Error(localize(22944, null, extension.manifest.displayName || extension.identifier.id));
      case 7 /* DisabledByAllowlist */:
        throw new Error(localize(22941, null, extension.manifest.displayName || extension.identifier.id));
      case 6 /* DisabledByInvalidExtension */:
        throw new Error(localize(22947, null, extension.manifest.displayName || extension.identifier.id));
      case 8 /* DisabledByExtensionDependency */:
        if (donotCheckDependencies) {
          break;
        }
        for (const dependency of getExtensionDependencies(this.extensionsManager.extensions, extension)) {
          if (this.isEnabled(dependency)) {
            continue;
          }
          throw new Error(localize(22942, null, extension.manifest.displayName || extension.identifier.id, dependency.manifest.displayName || dependency.identifier.id));
        }
    }
  }
  throwErrorIfCannotChangeWorkspaceEnablement(extension) {
    if (!this.hasWorkspace) {
      throw new Error(localize(22952, null));
    }
    if (this.isDefaultOrSettingsSyncAuthProviderExtension(extension.manifest)) {
      throw new Error(localize(22950, null, extension.manifest.displayName || extension.identifier.id));
    }
  }
  async setEnablement(extensions, newState) {
    await this.extensionsManager.whenInitialized();
    if (newState === 12 /* EnabledGlobally */ || newState === 13 /* EnabledWorkspace */) {
      extensions.push(...this.getExtensionsToEnableRecursively(extensions, this.extensionsManager.extensions, newState, { dependencies: true, pack: true }));
    }
    const workspace = newState === 11 /* DisabledWorkspace */ || newState === 13 /* EnabledWorkspace */;
    for (const extension of extensions) {
      if (workspace) {
        this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
      } else {
        this.throwErrorIfCannotChangeEnablement(extension);
      }
    }
    const result = [];
    for (const extension of extensions) {
      const enablementState = this.getEnablementState(extension);
      if (enablementState === 0 /* DisabledByTrustRequirement */ || enablementState === 8 /* DisabledByExtensionDependency */ && this.getDependenciesEnablementStates(extension).every(([, e4]) => this.isEnabledEnablementState(e4) || e4 === 0 /* DisabledByTrustRequirement */)) {
        const trustState = await this.workspaceTrustRequestService.requestWorkspaceTrust();
        result.push(trustState ?? false);
      } else {
        result.push(await this._setUserEnablementState(extension, newState));
      }
    }
    const changedExtensions = extensions.filter((e4, index2) => result[index2]);
    if (changedExtensions.length) {
      this._onEnablementChanged.fire(changedExtensions);
    }
    return result;
  }
  getExtensionsToEnableRecursively(extensions, allExtensions, enablementState, options3, checked = []) {
    if (!options3.dependencies && !options3.pack) {
      return [];
    }
    const toCheck = extensions.filter((e4) => checked.indexOf(e4) === -1);
    if (!toCheck.length) {
      return [];
    }
    for (const extension of toCheck) {
      checked.push(extension);
    }
    const extensionsToEnable = [];
    for (const extension of allExtensions) {
      if (checked.some((e4) => areSameExtensions(e4.identifier, extension.identifier))) {
        continue;
      }
      const enablementStateOfExtension = this.getEnablementState(extension);
      if (this.isEnabledEnablementState(enablementStateOfExtension)) {
        continue;
      }
      if (enablementStateOfExtension === 1 /* DisabledByExtensionKind */) {
        continue;
      }
      if (extensions.some((e4) => options3.dependencies && e4.manifest.extensionDependencies?.some((id2) => areSameExtensions({ id: id2 }, extension.identifier)) || options3.pack && e4.manifest.extensionPack?.some((id2) => areSameExtensions({ id: id2 }, extension.identifier)))) {
        const index2 = extensionsToEnable.findIndex((e4) => areSameExtensions(e4.identifier, extension.identifier));
        if (index2 === -1) {
          extensionsToEnable.push(extension);
        } else {
          try {
            this.throwErrorIfEnablementStateCannotBeChanged(extension, enablementStateOfExtension, true);
            extensionsToEnable.splice(index2, 1, extension);
          } catch (error) {
          }
        }
      }
    }
    if (extensionsToEnable.length) {
      extensionsToEnable.push(...this.getExtensionsToEnableRecursively(extensionsToEnable, allExtensions, enablementState, options3, checked));
    }
    return extensionsToEnable;
  }
  _setUserEnablementState(extension, newState) {
    const currentState = this._getUserEnablementState(extension.identifier);
    if (currentState === newState) {
      return Promise.resolve(false);
    }
    switch (newState) {
      case 12 /* EnabledGlobally */:
        this._enableExtension(extension.identifier);
        break;
      case 10 /* DisabledGlobally */:
        this._disableExtension(extension.identifier);
        break;
      case 13 /* EnabledWorkspace */:
        this._enableExtensionInWorkspace(extension.identifier);
        break;
      case 11 /* DisabledWorkspace */:
        this._disableExtensionInWorkspace(extension.identifier);
        break;
    }
    return Promise.resolve(true);
  }
  isEnabled(extension) {
    const enablementState = this.getEnablementState(extension);
    return this.isEnabledEnablementState(enablementState);
  }
  isEnabledEnablementState(enablementState) {
    return enablementState === 3 /* EnabledByEnvironment */ || enablementState === 13 /* EnabledWorkspace */ || enablementState === 12 /* EnabledGlobally */;
  }
  isDisabledGlobally(extension) {
    return this._isDisabledGlobally(extension.identifier);
  }
  _computeEnablementState(extension, extensions, workspaceType, computedEnablementStates) {
    computedEnablementStates = computedEnablementStates ?? /* @__PURE__ */ new Map();
    let enablementState = computedEnablementStates.get(extension);
    if (enablementState !== void 0) {
      return enablementState;
    }
    if (extension.identifier.id.toLowerCase() === this._chatExtensionId) {
      this.ensureChatExtensionInitialDisabledState();
    }
    enablementState = this._getUserEnablementState(extension.identifier);
    const isEnabled = this.isEnabledEnablementState(enablementState);
    if (isMalicious(extension.identifier, this.getMaliciousExtensionsForCheck())) {
      enablementState = 4 /* DisabledByMalicious */;
    } else if (isEnabled && extension.type === 1 /* User */ && this.allowedExtensionsService.isAllowed(extension) !== true) {
      enablementState = 7 /* DisabledByAllowlist */;
    } else if (isEnabled && !extension.isValid) {
      enablementState = 6 /* DisabledByInvalidExtension */;
    } else if (this.extensionBisectService.isDisabledByBisect(extension)) {
      enablementState = 2 /* DisabledByEnvironment */;
    } else if (this._isDisabledInEnv(extension)) {
      enablementState = 2 /* DisabledByEnvironment */;
    } else if (this._isDisabledByVirtualWorkspace(extension, workspaceType)) {
      enablementState = 5 /* DisabledByVirtualWorkspace */;
    } else if (isEnabled && this._isDisabledByWorkspaceTrust(extension, workspaceType)) {
      enablementState = 0 /* DisabledByTrustRequirement */;
    } else if (this._isDisabledByExtensionKind(extension)) {
      enablementState = 1 /* DisabledByExtensionKind */;
    } else if (this._isDisabledBySessionsWindow(extension)) {
      enablementState = 2 /* DisabledByEnvironment */;
    } else if (isEnabled && this._isDisabledByExtensionDependency(extension, extensions, workspaceType, computedEnablementStates)) {
      enablementState = 8 /* DisabledByExtensionDependency */;
    } else if (this._isDisabledByUnification(extension.identifier)) {
      enablementState = 9 /* DisabledByUnification */;
    } else if (!isEnabled && this._isEnabledInEnv(extension)) {
      enablementState = 3 /* EnabledByEnvironment */;
    }
    computedEnablementStates.set(extension, enablementState);
    return enablementState;
  }
  _isDisabledInEnv(extension) {
    if (this.allUserExtensionsDisabled) {
      return !extension.isBuiltin && !isResolverExtension(extension.manifest, this.environmentService.remoteAuthority);
    }
    const disabledExtensions = this.environmentService.disableExtensions;
    if (Array.isArray(disabledExtensions)) {
      return disabledExtensions.some((id2) => areSameExtensions({ id: id2 }, extension.identifier));
    }
    if (areSameExtensions({ id: BetterMergeId.value }, extension.identifier)) {
      return true;
    }
    return false;
  }
  _isEnabledInEnv(extension) {
    const enabledExtensions = this.environmentService.enableExtensions;
    if (Array.isArray(enabledExtensions)) {
      return enabledExtensions.some((id2) => areSameExtensions({ id: id2 }, extension.identifier));
    }
    return false;
  }
  _isDisabledByVirtualWorkspace(extension, workspaceType) {
    if (!workspaceType.virtual) {
      return false;
    }
    if (this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.manifest) !== false) {
      return false;
    }
    if (this.extensionManagementServerService.getExtensionManagementServer(extension) === this.extensionManagementServerService.webExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnWeb(extension.manifest)) {
      return false;
    }
    return true;
  }
  _isDisabledByExtensionKind(extension) {
    if (this.extensionManagementServerService.remoteExtensionManagementServer || this.extensionManagementServerService.webExtensionManagementServer) {
      const installLocation = this.extensionManagementServerService.getExtensionInstallLocation(extension);
      for (const extensionKind of this.extensionManifestPropertiesService.getExtensionKind(extension.manifest)) {
        if (extensionKind === "ui") {
          if (installLocation === 1 /* Local */) {
            return false;
          }
        }
        if (extensionKind === "workspace") {
          if (installLocation === 2 /* Remote */) {
            return false;
          }
        }
        if (extensionKind === "web") {
          if (this.extensionManagementServerService.webExtensionManagementServer) {
            if (installLocation === 3 /* Web */ || installLocation === 2 /* Remote */) {
              return false;
            }
          } else if (installLocation === 1 /* Local */) {
            const enableLocalWebWorker = this.configurationService.getValue(webWorkerExtHostConfig);
            if (enableLocalWebWorker === true || enableLocalWebWorker === "auto") {
              return false;
            }
          }
        }
      }
      return true;
    }
    return false;
  }
  _isDisabledByWorkspaceTrust(extension, workspaceType) {
    if (workspaceType.trusted) {
      return false;
    }
    if (this.contextService.isInsideWorkspace(extension.location)) {
      return true;
    }
    return this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.manifest) === false;
  }
  _isDisabledByExtensionDependency(extension, extensions, workspaceType, computedEnablementStates) {
    if (!extension.manifest.extensionDependencies) {
      return false;
    }
    const dependencyExtensions = extensions.filter((e4) => extension.manifest.extensionDependencies?.some((id2) => areSameExtensions(e4.identifier, { id: id2 }) && (this.extensionManagementServerService.getExtensionManagementServer(e4) === this.extensionManagementServerService.getExtensionManagementServer(extension) || (e4.manifest.main || e4.manifest.browser) && e4.manifest.api === "none")));
    if (!dependencyExtensions.length) {
      return false;
    }
    const hasEnablementState = computedEnablementStates.has(extension);
    if (!hasEnablementState) {
      computedEnablementStates.set(extension, 12 /* EnabledGlobally */);
    }
    try {
      for (const dependencyExtension of dependencyExtensions) {
        const enablementState = this._computeEnablementState(dependencyExtension, extensions, workspaceType, computedEnablementStates);
        if (!this.isEnabledEnablementState(enablementState) && enablementState !== 1 /* DisabledByExtensionKind */) {
          return true;
        }
      }
    } finally {
      if (!hasEnablementState) {
        computedEnablementStates.delete(extension);
      }
    }
    return false;
  }
  _getUserEnablementState(identifier2) {
    if (this.hasWorkspace) {
      if (this._getWorkspaceEnabledExtensions().filter((e4) => areSameExtensions(e4, identifier2))[0]) {
        return 13 /* EnabledWorkspace */;
      }
      if (this._getWorkspaceDisabledExtensions().filter((e4) => areSameExtensions(e4, identifier2))[0]) {
        return 11 /* DisabledWorkspace */;
      }
    }
    if (this._isDisabledGlobally(identifier2)) {
      return 10 /* DisabledGlobally */;
    }
    return 12 /* EnabledGlobally */;
  }
  _isDisabledGlobally(identifier2) {
    return this.globalExtensionEnablementService.getDisabledExtensions().some((e4) => areSameExtensions(e4, identifier2));
  }
  _isDisabledByUnification(identifier2) {
    return this._extensionUnificationEnabled && identifier2.id.toLowerCase() === this._completionsExtensionId;
  }
  _isDisabledBySessionsWindow(extension) {
    if (!this.environmentService.isSessionsWindow) {
      return false;
    }
    if (this._sessionsWindowAllowedExtensions.has(extension.identifier.id.toLowerCase())) {
      return false;
    }
    if (extension.isBuiltin) {
      if (extension.identifier.id.toLowerCase() === this._chatExtensionId) {
        return false;
      }
      const contributes = extension.manifest.contributes;
      if (contributes?.debuggers || contributes?.views || contributes?.viewsContainers || contributes?.walkthroughs) {
        return true;
      }
      return false;
    }
    return !this.extensionManifestPropertiesService.canExecuteOnSessionsWindow(extension.manifest);
  }
  _enableExtension(identifier2) {
    this._removeFromWorkspaceDisabledExtensions(identifier2);
    this._removeFromWorkspaceEnabledExtensions(identifier2);
    return this.globalExtensionEnablementService.enableExtension(identifier2, SOURCE);
  }
  _disableExtension(identifier2) {
    this._removeFromWorkspaceDisabledExtensions(identifier2);
    this._removeFromWorkspaceEnabledExtensions(identifier2);
    return this.globalExtensionEnablementService.disableExtension(identifier2, SOURCE);
  }
  _enableExtensionInWorkspace(identifier2) {
    this._removeFromWorkspaceDisabledExtensions(identifier2);
    this._addToWorkspaceEnabledExtensions(identifier2);
  }
  _disableExtensionInWorkspace(identifier2) {
    this._addToWorkspaceDisabledExtensions(identifier2);
    this._removeFromWorkspaceEnabledExtensions(identifier2);
  }
  _addToWorkspaceDisabledExtensions(identifier2) {
    if (!this.hasWorkspace) {
      return Promise.resolve(false);
    }
    const disabledExtensions = this._getWorkspaceDisabledExtensions();
    if (disabledExtensions.every((e4) => !areSameExtensions(e4, identifier2))) {
      disabledExtensions.push(identifier2);
      this._setDisabledExtensions(disabledExtensions);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
  async _removeFromWorkspaceDisabledExtensions(identifier2) {
    if (!this.hasWorkspace) {
      return false;
    }
    const disabledExtensions = this._getWorkspaceDisabledExtensions();
    for (let index2 = 0; index2 < disabledExtensions.length; index2++) {
      const disabledExtension = disabledExtensions[index2];
      if (areSameExtensions(disabledExtension, identifier2)) {
        disabledExtensions.splice(index2, 1);
        this._setDisabledExtensions(disabledExtensions);
        return true;
      }
    }
    return false;
  }
  _addToWorkspaceEnabledExtensions(identifier2) {
    if (!this.hasWorkspace) {
      return false;
    }
    const enabledExtensions = this._getWorkspaceEnabledExtensions();
    if (enabledExtensions.every((e4) => !areSameExtensions(e4, identifier2))) {
      enabledExtensions.push(identifier2);
      this._setEnabledExtensions(enabledExtensions);
      return true;
    }
    return false;
  }
  _removeFromWorkspaceEnabledExtensions(identifier2) {
    if (!this.hasWorkspace) {
      return false;
    }
    const enabledExtensions = this._getWorkspaceEnabledExtensions();
    for (let index2 = 0; index2 < enabledExtensions.length; index2++) {
      const disabledExtension = enabledExtensions[index2];
      if (areSameExtensions(disabledExtension, identifier2)) {
        enabledExtensions.splice(index2, 1);
        this._setEnabledExtensions(enabledExtensions);
        return true;
      }
    }
    return false;
  }
  _getWorkspaceEnabledExtensions() {
    return this._getExtensions(ENABLED_EXTENSIONS_STORAGE_PATH);
  }
  _setEnabledExtensions(enabledExtensions) {
    this._setExtensions(ENABLED_EXTENSIONS_STORAGE_PATH, enabledExtensions);
  }
  _getWorkspaceDisabledExtensions() {
    return this._getExtensions(DISABLED_EXTENSIONS_STORAGE_PATH);
  }
  _setDisabledExtensions(disabledExtensions) {
    this._setExtensions(DISABLED_EXTENSIONS_STORAGE_PATH, disabledExtensions);
  }
  _getExtensions(storageId) {
    if (!this.hasWorkspace) {
      return [];
    }
    return this.storageManager.get(storageId, 1 /* WORKSPACE */);
  }
  _setExtensions(storageId, extensions) {
    this.storageManager.set(storageId, extensions, 1 /* WORKSPACE */);
  }
  async _onDidChangeGloballyDisabledExtensions(extensionIdentifiers, source) {
    if (source !== SOURCE) {
      await this.extensionsManager.whenInitialized();
      const extensions = this.extensionsManager.extensions.filter((installedExtension) => extensionIdentifiers.some((identifier2) => areSameExtensions(identifier2, installedExtension.identifier)));
      this._onEnablementChanged.fire(extensions);
    }
  }
  _onDidChangeExtensions(added, removed, isProfileSwitch) {
    const changedExtensions = added.filter((e4) => !this.isEnabledEnablementState(this.getEnablementState(e4)));
    const existingDisabledExtensions = this.extensionsDisabledExtensions;
    this.extensionsDisabledExtensions = this.extensionsManager.extensions.filter((extension) => {
      const enablementState = this.getEnablementState(extension);
      return enablementState === 8 /* DisabledByExtensionDependency */ || enablementState === 7 /* DisabledByAllowlist */ || enablementState === 4 /* DisabledByMalicious */;
    });
    for (const extension of existingDisabledExtensions) {
      if (this.extensionsDisabledExtensions.every((e4) => !areSameExtensions(e4.identifier, extension.identifier))) {
        changedExtensions.push(extension);
      }
    }
    for (const extension of this.extensionsDisabledExtensions) {
      if (existingDisabledExtensions.every((e4) => !areSameExtensions(e4.identifier, extension.identifier))) {
        changedExtensions.push(extension);
      }
    }
    if (changedExtensions.length) {
      this._onEnablementChanged.fire(changedExtensions);
    }
    if (!isProfileSwitch) {
      removed.forEach(({ identifier: identifier2 }) => this._reset(identifier2));
    }
  }
  async updateExtensionsEnablementsWhenWorkspaceTrustChanges() {
    await this.extensionsManager.whenInitialized();
    const computeEnablementStates = (workspaceType2) => {
      const extensionsEnablements = /* @__PURE__ */ new Map();
      return this.extensionsManager.extensions.map((extension) => [extension, this._computeEnablementState(extension, this.extensionsManager.extensions, workspaceType2, extensionsEnablements)]);
    };
    const workspaceType = this.getWorkspaceType();
    const enablementStatesWithTrustedWorkspace = computeEnablementStates({ ...workspaceType, trusted: true });
    const enablementStatesWithUntrustedWorkspace = computeEnablementStates({ ...workspaceType, trusted: false });
    const enablementChangedExtensionsBecauseOfTrust = enablementStatesWithTrustedWorkspace.filter(([, enablementState], index2) => enablementState !== enablementStatesWithUntrustedWorkspace[index2][1]).map(([extension]) => extension);
    if (enablementChangedExtensionsBecauseOfTrust.length) {
      this._onEnablementChanged.fire(enablementChangedExtensionsBecauseOfTrust);
    }
  }
  getWorkspaceType() {
    return { trusted: this.workspaceTrustManagementService.isWorkspaceTrusted(), virtual: isVirtualWorkspace(this.contextService.getWorkspace()) };
  }
  _reset(extension) {
    this._removeFromWorkspaceDisabledExtensions(extension);
    this._removeFromWorkspaceEnabledExtensions(extension);
    this.globalExtensionEnablementService.enableExtension(extension);
  }
  loopCheckForMaliciousExtensions() {
    this.checkForMaliciousExtensions().then(() => this.delayer.trigger(() => {
    }, 1e3 * 60 * 5)).then(() => this.loopCheckForMaliciousExtensions());
  }
  async checkForMaliciousExtensions() {
    try {
      const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
      const changed = this.storeMaliciousExtensions(extensionsControlManifest.malicious.map(({ extensionOrPublisher }) => extensionOrPublisher));
      if (changed) {
        this._onDidChangeExtensions([], [], false);
      }
    } catch (err) {
      this.logService.error(err);
    }
  }
  getMaliciousExtensions() {
    return this.storageService.getObject(MALICIOUS_EXTENSIONS_STORAGE_KEY, -1 /* APPLICATION */, []);
  }
  getMaliciousExtensionsForCheck() {
    if (!this._maliciousExtensionsCache) {
      this._maliciousExtensionsCache = this.getMaliciousExtensions().map((extensionOrPublisher) => ({ extensionOrPublisher }));
    }
    return this._maliciousExtensionsCache;
  }
  storeMaliciousExtensions(extensions) {
    const existing = this.getMaliciousExtensions();
    if (equals(existing, extensions, (a, b) => !isString(a) && !isString(b) ? areSameExtensions(a, b) : a === b)) {
      return false;
    }
    this._maliciousExtensionsCache = void 0;
    this.storageService.store(MALICIOUS_EXTENSIONS_STORAGE_KEY, JSON.stringify(extensions), -1 /* APPLICATION */, 1 /* MACHINE */);
    return true;
  }
};

ExtensionEnablementService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IGlobalExtensionEnablementService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, IExtensionManagementService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IExtensionManagementServerService),
  __decorateParam(7, IUserDataSyncEnablementService),
  __decorateParam(8, IDefaultAccountService),
  __decorateParam(9, IUserDataSyncAccountService),
  __decorateParam(10, ILifecycleService),
  __decorateParam(11, INotificationService),
  __decorateParam(12, IHostService),
  __decorateParam(13, IExtensionBisectService),
  __decorateParam(14, IAllowedExtensionsService),
  __decorateParam(15, IWorkspaceTrustManagementService),
  __decorateParam(16, IWorkspaceTrustRequestService),
  __decorateParam(17, IExtensionManifestPropertiesService),
  __decorateParam(18, IChatEntitlementService),
  __decorateParam(19, IInstantiationService),
  __decorateParam(20, ILogService),
  __decorateParam(21, IProductService)
], ExtensionEnablementService);

var ExtensionsManager = class extends Disposable {
  constructor(extensionManagementService, extensionManagementServerService, logService) {
    super();
    this.extensionManagementService = extensionManagementService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.logService = logService;
    this._extensions = [];
    this._onDidChangeExtensions = this._register(new Emitter());
    this.onDidChangeExtensions = this._onDidChangeExtensions.event;
    this.disposed = false;
    this._register(toDisposable(() => this.disposed = true));
    this.initializePromise = this.initialize();
  }
  get extensions() {
    return this._extensions;
  }
  whenInitialized() {
    return this.initializePromise;
  }
  async initialize() {
    try {
      this._extensions = [
        ...await this.extensionManagementService.getInstalled(),
        ...await this.extensionManagementService.getInstalledWorkspaceExtensions(true)
      ];
      if (this.disposed) {
        return;
      }
      this._onDidChangeExtensions.fire({ added: this.extensions, removed: [], isProfileSwitch: false });
    } catch (error) {
      this.logService.error(error);
    }
    this._register(this.extensionManagementService.onDidInstallExtensions((e4) => this.updateExtensions(e4.reduce((result, { local, operation }) => {
      if (local && operation !== 4 /* Migrate */) {
        result.push(local);
      }
      return result;
    }, []), [], void 0, false)));
    this._register(Event2.filter(this.extensionManagementService.onDidUninstallExtension, ((e4) => !e4.error))((e4) => this.updateExtensions([], [e4.identifier], e4.server, false)));
    this._register(this.extensionManagementService.onDidChangeProfile(({ added, removed, server }) => {
      this.updateExtensions(added, removed.map(({ identifier: identifier2 }) => identifier2), server, true);
    }));
  }
  updateExtensions(added, identifiers2, server, isProfileSwitch) {
    if (added.length) {
      for (const extension of added) {
        const extensionServer = this.extensionManagementServerService.getExtensionManagementServer(extension);
        const index2 = this._extensions.findIndex((e4) => areSameExtensions(e4.identifier, extension.identifier) && this.extensionManagementServerService.getExtensionManagementServer(e4) === extensionServer);
        if (index2 !== -1) {
          this._extensions.splice(index2, 1);
        }
      }
      this._extensions.push(...added);
    }
    const removed = [];
    for (const identifier2 of identifiers2) {
      const index2 = this._extensions.findIndex((e4) => areSameExtensions(e4.identifier, identifier2) && this.extensionManagementServerService.getExtensionManagementServer(e4) === server);
      if (index2 !== -1) {
        removed.push(...this._extensions.splice(index2, 1));
      }
    }
    if (added.length || removed.length) {
      this._onDidChangeExtensions.fire({ added, removed, isProfileSwitch });
    }
  }
};

ExtensionsManager = __decorateClass([
  __decorateParam(0, IWorkbenchExtensionManagementService),
  __decorateParam(1, IExtensionManagementServerService),
  __decorateParam(2, ILogService)
], ExtensionsManager);

registerSingleton(IWorkbenchExtensionEnablementService, ExtensionEnablementService, 1 /* Delayed */);
export { SOURCE, EXTENSION_UNIFICATION_SETTING, MALICIOUS_EXTENSIONS_STORAGE_KEY, ExtensionEnablementService, ExtensionsManager };
