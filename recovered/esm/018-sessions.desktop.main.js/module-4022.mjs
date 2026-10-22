// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/abstractExtensionService.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { LockableExtensionDescriptionRegistry } from "./module-4015.mjs";
import { Barrier } from "./module-0036.mjs";
import { ExtensionIdentifier, ExtensionIdentifierMap } from "./module-0688.mjs";
import { Schemas } from "./module-0033.mjs";
import { ActivationTimes, ExtensionPointContribution, setProposedApiUsageReporter, toExtension, toExtensionDescription } from "./module-0889.mjs";
import { ExtensionRunningLocationTracker, filterExtensionIdentifiers } from "./module-4020.mjs";
import { isCI } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { ImplicitActivationEvents } from "./module-0876.mjs";
import { checkActivateWorkspaceContainsExtension, checkGlobFileExists } from "./module-1312.mjs";
import { mark } from "./module-0506.mjs";
import { isEqualOrParent2 } from "./module-0034.mjs";
import { LocalProcessRunningLocation, LocalWebWorkerRunningLocation, RemoteRunningLocation } from "./module-4019.mjs";
import { IRemoteAuthorityResolverService, RemoteAuthorityResolverError, getRemoteAuthorityPrefix } from "./module-0896.mjs";
import { StopWatch } from "./module-0016.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { handleVetos } from "./module-3918.mjs";
import { LazyCreateExtensionHostManager } from "./module-4021.mjs";
import { ExtensionHostManager } from "./module-4018.mjs";
import { parseExtensionDevOptions } from "./module-1056.mjs";
import { isDefined } from "./module-0010.mjs";
import { ExtensionMessageCollector, ExtensionsRegistry } from "./module-0878.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "./module-1047.mjs";
import { IFileService } from "./module-0269.mjs";
import { IProductService } from "./module-0875.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IExtensionManifestPropertiesService } from "./module-1049.mjs";
import { ILogService } from "./module-0095.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IRemoteExtensionsScannerService } from "./module-1664.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IDialogService } from "./module-0267.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/services/extensions/common/abstractExtensionService.ts
var hasOwnProperty4 = Object.hasOwnProperty;

var NO_OP_VOID_PROMISE = Promise.resolve(void 0);

var AbstractExtensionService = class extends Disposable {
  constructor(options3, _extensionsProposedApi, _extensionHostFactory, _extensionHostKindPicker, _instantiationService, _notificationService, _environmentService, _telemetryService, _extensionEnablementService, _fileService, _productService, _extensionManagementService, _contextService, _configurationService, _extensionManifestPropertiesService, _logService, _remoteAgentService, _remoteExtensionsScannerService, _lifecycleService, _remoteAuthorityResolverService, _dialogService) {
    super();
    this._extensionsProposedApi = _extensionsProposedApi;
    this._extensionHostFactory = _extensionHostFactory;
    this._extensionHostKindPicker = _extensionHostKindPicker;
    this._instantiationService = _instantiationService;
    this._notificationService = _notificationService;
    this._environmentService = _environmentService;
    this._telemetryService = _telemetryService;
    this._extensionEnablementService = _extensionEnablementService;
    this._fileService = _fileService;
    this._productService = _productService;
    this._extensionManagementService = _extensionManagementService;
    this._contextService = _contextService;
    this._configurationService = _configurationService;
    this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
    this._logService = _logService;
    this._remoteAgentService = _remoteAgentService;
    this._remoteExtensionsScannerService = _remoteExtensionsScannerService;
    this._lifecycleService = _lifecycleService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._dialogService = _dialogService;
    this._onDidRegisterExtensions = this._register(new Emitter());
    this.onDidRegisterExtensions = this._onDidRegisterExtensions.event;
    this._onDidChangeExtensionsStatus = this._register(new Emitter());
    this.onDidChangeExtensionsStatus = this._onDidChangeExtensionsStatus.event;
    this._onDidChangeExtensions = this._register(new Emitter({ leakWarningThreshold: 400, leakWarningName: "ExtensionService._onDidChangeExtensions" }));
    this.onDidChangeExtensions = this._onDidChangeExtensions.event;
    this._onWillActivateByEvent = this._register(new Emitter());
    this.onWillActivateByEvent = this._onWillActivateByEvent.event;
    this._onDidChangeResponsiveChange = this._register(new Emitter());
    this.onDidChangeResponsiveChange = this._onDidChangeResponsiveChange.event;
    this._onWillStop = this._register(new Emitter());
    this.onWillStop = this._onWillStop.event;
    this._activationEventReader = new ImplicitActivationAwareReader();
    this._registry = new LockableExtensionDescriptionRegistry(this._activationEventReader);
    this._installedExtensionsReady = new Barrier();
    this._extensionStatus = new ExtensionIdentifierMap();
    this._allRequestedActivateEvents = /* @__PURE__ */ new Set();
    this._pendingRemoteActivationEvents = /* @__PURE__ */ new Set();
    this._remoteCrashTracker = new ExtensionHostCrashTracker();
    this._deltaExtensionsQueue = [];
    this._inHandleDeltaExtensions = false;
    this._extensionHostManagers = this._register(new ExtensionHostCollection());
    this._resolveAuthorityAttempt = 0;
    //#endregion
    this._initializePromise = null;
    this._hasLocalProcess = options3.hasLocalProcess;
    this._allowRemoteExtensionsInLocalWebWorker = options3.allowRemoteExtensionsInLocalWebWorker;
    this._register(this._fileService.onWillActivateFileSystemProvider((e4) => {
      if (e4.scheme !== Schemas.vscodeRemote) {
        e4.join(this.activateByEvent(`onFileSystem:${e4.scheme}`));
      }
    }));
    this._register(setProposedApiUsageReporter((usage) => this._reportProposedApiUsage(usage)));
    this._runningLocations = new ExtensionRunningLocationTracker(
      this._registry,
      this._extensionHostKindPicker,
      this._environmentService,
      this._configurationService,
      this._logService,
      this._extensionManifestPropertiesService
    );
    this._register(this._extensionEnablementService.onEnablementChanged((extensions) => {
      const toAdd = [];
      const toRemove = [];
      for (const extension of extensions) {
        if (this._safeInvokeIsEnabled(extension)) {
          toAdd.push(extension);
        } else {
          toRemove.push(extension);
        }
      }
      if (isCI) {
        this._logService.info(`AbstractExtensionService.onEnablementChanged fired for ${extensions.map((e4) => e4.identifier.id).join(", ")}`);
      }
      this._handleDeltaExtensions(new DeltaExtensionsQueueItem(toAdd, toRemove));
    }));
    this._register(this._extensionManagementService.onDidChangeProfile(({ added, removed }) => {
      if (added.length || removed.length) {
        if (isCI) {
          this._logService.info(`AbstractExtensionService.onDidChangeProfile fired`);
        }
        this._handleDeltaExtensions(new DeltaExtensionsQueueItem(added, removed));
      }
    }));
    this._register(this._extensionManagementService.onDidEnableExtensions((extensions) => {
      if (extensions.length) {
        if (isCI) {
          this._logService.info(`AbstractExtensionService.onDidEnableExtensions fired`);
        }
        this._handleDeltaExtensions(new DeltaExtensionsQueueItem(extensions, []));
      }
    }));
    this._register(this._extensionManagementService.onDidInstallExtensions((result) => {
      const extensions = [];
      const toRemove = [];
      for (const { local, operation } of result) {
        if (local && local.isValid && operation !== 4 /* Migrate */ && this._safeInvokeIsEnabled(local)) {
          extensions.push(local);
          if (operation === 3 /* Update */) {
            toRemove.push(local.identifier.id);
          }
        }
      }
      if (extensions.length) {
        if (isCI) {
          this._logService.info(`AbstractExtensionService.onDidInstallExtensions fired for ${extensions.map((e4) => e4.identifier.id).join(", ")}`);
        }
        this._handleDeltaExtensions(new DeltaExtensionsQueueItem(extensions, toRemove));
      }
    }));
    this._register(this._extensionManagementService.onDidUninstallExtension((event) => {
      if (!event.error) {
        if (isCI) {
          this._logService.info(`AbstractExtensionService.onDidUninstallExtension fired for ${event.identifier.id}`);
        }
        this._handleDeltaExtensions(new DeltaExtensionsQueueItem([], [event.identifier.id]));
      }
    }));
    this._register(this._lifecycleService.onWillShutdown((event) => {
      if (this._remoteAgentService.getConnection()) {
        event.join(async () => {
          try {
            await this._remoteAgentService.endConnection();
            await this._doStopExtensionHosts();
            this._remoteAgentService.getConnection()?.dispose();
          } catch {
            this._logService.warn("Error while disconnecting remote agent");
          }
        }, {
          id: "join.disconnectRemote",
          label: localize(23024, null),
          order: 2 /* Last */
          // after others have joined that might depend on a remote connection
        });
      } else {
        event.join(this._doStopExtensionHosts(), {
          id: "join.stopExtensionHosts",
          label: localize(23033, null)
        });
      }
    }));
  }
  _getExtensionHostManagers(kind) {
    return this._extensionHostManagers.getByKind(kind);
  }
  //#region deltaExtensions
  async _handleDeltaExtensions(item) {
    this._deltaExtensionsQueue.push(item);
    if (this._inHandleDeltaExtensions) {
      return;
    }
    let lock = null;
    try {
      this._inHandleDeltaExtensions = true;
      await this._installedExtensionsReady.wait();
      lock = await this._registry.acquireLock("handleDeltaExtensions");
      while (this._deltaExtensionsQueue.length > 0) {
        const item2 = this._deltaExtensionsQueue.shift();
        await this._deltaExtensions(lock, item2.toAdd, item2.toRemove);
      }
    } finally {
      this._inHandleDeltaExtensions = false;
      lock?.dispose();
    }
  }
  async _deltaExtensions(lock, _toAdd, _toRemove) {
    if (isCI) {
      this._logService.info(`AbstractExtensionService._deltaExtensions: toAdd: [${_toAdd.map((e4) => e4.identifier.id).join(",")}] toRemove: [${_toRemove.map((e4) => typeof e4 === "string" ? e4 : e4.identifier.id).join(",")}]`);
    }
    let toRemove = [];
    for (let i2 = 0, len = _toRemove.length; i2 < len; i2++) {
      const extensionOrId = _toRemove[i2];
      const extensionId = typeof extensionOrId === "string" ? extensionOrId : extensionOrId.identifier.id;
      const extension = typeof extensionOrId === "string" ? null : extensionOrId;
      const extensionDescription = this._registry.getExtensionDescription(extensionId);
      if (!extensionDescription) {
        continue;
      }
      if (extension && extensionDescription.extensionLocation.scheme !== extension.location.scheme) {
        continue;
      }
      if (!this.canRemoveExtension(extensionDescription)) {
        continue;
      }
      toRemove.push(extensionDescription);
    }
    const toAdd = [];
    for (let i2 = 0, len = _toAdd.length; i2 < len; i2++) {
      const extension = _toAdd[i2];
      const extensionDescription = toExtensionDescription(extension, false);
      if (!extensionDescription) {
        continue;
      }
      if (!this._canAddExtension(extensionDescription, toRemove)) {
        continue;
      }
      toAdd.push(extensionDescription);
    }
    if (toAdd.length === 0 && toRemove.length === 0) {
      return;
    }
    const result = this._registry.deltaExtensions(lock, toAdd, toRemove.map((e4) => e4.identifier));
    this._onDidChangeExtensions.fire({ added: toAdd, removed: toRemove });
    toRemove = toRemove.concat(result.removedDueToLooping);
    if (result.removedDueToLooping.length > 0) {
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(23030, null, result.removedDueToLooping.map((e4) => `'${e4.identifier.value}'`).join(", "))
      });
    }
    this._extensionsProposedApi.updateEnabledApiProposals(toAdd);
    this._doHandleExtensionPoints([].concat(toAdd).concat(toRemove), false);
    await this._updateExtensionsOnExtHosts(result.versionId, toAdd, toRemove.map((e4) => e4.identifier));
    for (let i2 = 0; i2 < toAdd.length; i2++) {
      this._activateAddedExtensionIfNeeded(toAdd[i2]);
    }
  }
  async _updateExtensionsOnExtHosts(versionId, toAdd, toRemove) {
    const removedRunningLocation = this._runningLocations.deltaExtensions(toAdd, toRemove);
    const promises = this._extensionHostManagers.map(
      (extHostManager) => this._updateExtensionsOnExtHost(extHostManager, versionId, toAdd, toRemove, removedRunningLocation)
    );
    await Promise.all(promises);
  }
  async _updateExtensionsOnExtHost(extensionHostManager, versionId, toAdd, toRemove, removedRunningLocation) {
    const myToAdd = this._runningLocations.filterByExtensionHostManager(toAdd, extensionHostManager);
    const myToRemove = filterExtensionIdentifiers(toRemove, removedRunningLocation, (extRunningLocation) => extensionHostManager.representsRunningLocation(extRunningLocation));
    const addActivationEvents = ImplicitActivationEvents.createActivationEventsMap(toAdd);
    if (isCI) {
      const printExtIds = (extensions) => extensions.map((e4) => e4.identifier.value).join(",");
      const printIds = (extensions) => extensions.map((e4) => e4.value).join(",");
      this._logService.info(`AbstractExtensionService: Calling deltaExtensions: toRemove: [${printIds(toRemove)}], toAdd: [${printExtIds(toAdd)}], myToRemove: [${printIds(myToRemove)}], myToAdd: [${printExtIds(myToAdd)}],`);
    }
    await extensionHostManager.deltaExtensions({ versionId, toRemove, toAdd, addActivationEvents, myToRemove, myToAdd: myToAdd.map((extension) => extension.identifier) });
  }
  canAddExtension(extension) {
    return this._canAddExtension(extension, []);
  }
  _canAddExtension(extension, extensionsBeingRemoved) {
    const existing = this._registry.getExtensionDescriptionByIdOrUUID(extension.identifier, extension.id);
    if (existing) {
      const isBeingRemoved = extensionsBeingRemoved.some((extensionDescription) => ExtensionIdentifier.equals(extension.identifier, extensionDescription.identifier));
      if (!isBeingRemoved) {
        return false;
      }
    }
    const extensionKinds = this._runningLocations.readExtensionKinds(extension);
    const isRemote = extension.extensionLocation.scheme === Schemas.vscodeRemote;
    const extensionHostKind = this._extensionHostKindPicker.pickExtensionHostKind(extension.identifier, extensionKinds, !isRemote, isRemote, 0 /* None */);
    if (extensionHostKind === null) {
      return false;
    }
    return true;
  }
  canRemoveExtension(extension) {
    const extensionDescription = this._registry.getExtensionDescription(extension.identifier);
    if (!extensionDescription) {
      return false;
    }
    if (this._extensionStatus.get(extensionDescription.identifier)?.activationStarted) {
      return false;
    }
    return true;
  }
  async _activateAddedExtensionIfNeeded(extensionDescription) {
    let shouldActivateReason = null;
    let hasWorkspaceContains = false;
    const activationEvents = this._activationEventReader.readActivationEvents(extensionDescription);
    for (const activationEvent of activationEvents) {
      if (this._allRequestedActivateEvents.has(activationEvent)) {
        shouldActivateReason = activationEvent;
        break;
      }
      if (activationEvent === "*") {
        shouldActivateReason = activationEvent;
        break;
      }
      if (/^workspaceContains/.test(activationEvent)) {
        hasWorkspaceContains = true;
      }
      if (activationEvent === "onStartupFinished") {
        shouldActivateReason = activationEvent;
        break;
      }
    }
    if (!shouldActivateReason && hasWorkspaceContains) {
      const workspace = await this._contextService.getCompleteWorkspace();
      const forceUsingSearch = !!this._environmentService.remoteAuthority;
      const host = {
        logService: this._logService,
        folders: workspace.folders.map((folder) => folder.uri),
        forceUsingSearch,
        exists: (uri4) => this._fileService.exists(uri4),
        checkExists: (folders, includes2, token) => this._instantiationService.invokeFunction((accessor) => checkGlobFileExists(accessor, folders, includes2, token))
      };
      const result = await checkActivateWorkspaceContainsExtension(host, extensionDescription);
      if (result) {
        shouldActivateReason = result.activationEvent;
      }
    }
    if (shouldActivateReason) {
      await Promise.all(
        this._extensionHostManagers.map((extHostManager) => extHostManager.activate(extensionDescription.identifier, { startup: false, extensionId: extensionDescription.identifier, activationEvent: shouldActivateReason }))
      );
    }
  }
  _initializeIfNeeded() {
    if (!this._initializePromise) {
      this._initializePromise = this._initialize();
    }
    return this._initializePromise;
  }
  async _initialize() {
    mark("code/willLoadExtensions");
    this._startExtensionHostsIfNecessary(true, []);
    const lock = await this._registry.acquireLock("_initialize");
    try {
      await this._resolveAndProcessExtensions(lock);
      this._startOnDemandExtensionHosts();
    } finally {
      lock.dispose();
    }
    this._releaseBarrier();
    mark("code/didLoadExtensions");
    this._activateDeferredRemoteEvents();
    await this._handleExtensionTests();
  }
  async _activateDeferredRemoteEvents() {
    if (this._pendingRemoteActivationEvents.size === 0) {
      return;
    }
    const remoteExtensionHosts = this._getExtensionHostManagers(3 /* Remote */);
    if (remoteExtensionHosts.length === 0) {
      this._pendingRemoteActivationEvents.clear();
      return;
    }
    await Promise.all(remoteExtensionHosts.map((extHost) => extHost.ready()));
    for (const activationEvent of this._pendingRemoteActivationEvents) {
      const result = Promise.all(
        remoteExtensionHosts.map((extHostManager) => extHostManager.activateByEvent(activationEvent, 0 /* Normal */))
      ).then(() => {
      });
      this._onWillActivateByEvent.fire({
        event: activationEvent,
        activation: result,
        activationKind: 0 /* Normal */
      });
    }
    this._pendingRemoteActivationEvents.clear();
  }
  async _resolveAndProcessExtensions(lock) {
    let resolverExtensions = [];
    let localExtensions = [];
    let remoteExtensions = [];
    for await (const extensions of this._resolveExtensions()) {
      if (extensions instanceof ResolverExtensions) {
        resolverExtensions = checkEnabledAndProposedAPI(this._logService, this._extensionEnablementService, this._extensionsProposedApi, extensions.extensions, false);
        this._registry.deltaExtensions(lock, resolverExtensions, []);
        this._doHandleExtensionPoints(resolverExtensions, true);
      }
      if (extensions instanceof LocalExtensions) {
        localExtensions = checkEnabledAndProposedAPI(this._logService, this._extensionEnablementService, this._extensionsProposedApi, extensions.extensions, false);
      }
      if (extensions instanceof RemoteExtensions) {
        remoteExtensions = checkEnabledAndProposedAPI(this._logService, this._extensionEnablementService, this._extensionsProposedApi, extensions.extensions, false);
      }
    }
    this._runningLocations.initializeRunningLocation(localExtensions, remoteExtensions);
    this._startExtensionHostsIfNecessary(true, []);
    const remoteExtensionsThatNeedToRunLocally = this._allowRemoteExtensionsInLocalWebWorker ? this._runningLocations.filterByExtensionHostKind(remoteExtensions, 2 /* LocalWebWorker */) : [];
    const localProcessExtensions = this._hasLocalProcess ? this._runningLocations.filterByExtensionHostKind(localExtensions, 1 /* LocalProcess */) : [];
    const localWebWorkerExtensions = this._runningLocations.filterByExtensionHostKind(localExtensions, 2 /* LocalWebWorker */);
    remoteExtensions = this._runningLocations.filterByExtensionHostKind(remoteExtensions, 3 /* Remote */);
    for (const ext of remoteExtensionsThatNeedToRunLocally) {
      if (!includes(localWebWorkerExtensions, ext.identifier)) {
        localWebWorkerExtensions.push(ext);
      }
    }
    const allExtensions = remoteExtensions.concat(localProcessExtensions).concat(localWebWorkerExtensions);
    let toAdd = allExtensions;
    if (resolverExtensions.length) {
      toAdd = allExtensions.filter((extension) => !resolverExtensions.some((e4) => ExtensionIdentifier.equals(e4.identifier, extension.identifier) && e4.extensionLocation.toString() === extension.extensionLocation.toString()));
      if (allExtensions.length < toAdd.length + resolverExtensions.length) {
        const toRemove = resolverExtensions.filter((registered) => !allExtensions.some((e4) => ExtensionIdentifier.equals(e4.identifier, registered.identifier) && e4.extensionLocation.toString() === registered.extensionLocation.toString()));
        if (toRemove.length) {
          this._registry.deltaExtensions(lock, [], toRemove.map((e4) => e4.identifier));
          this._doHandleExtensionPoints(toRemove, true);
        }
      }
    }
    const result = this._registry.deltaExtensions(lock, toAdd, []);
    if (result.removedDueToLooping.length > 0) {
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(23030, null, result.removedDueToLooping.map((e4) => `'${e4.identifier.value}'`).join(", "))
      });
    }
    this._doHandleExtensionPoints(this._registry.getAllExtensionDescriptions(), false);
  }
  async _handleExtensionTests() {
    if (!this._environmentService.isExtensionDevelopment || !this._environmentService.extensionTestsLocationURI) {
      return;
    }
    const extensionHostManager = this.findTestExtensionHost(this._environmentService.extensionTestsLocationURI);
    if (!extensionHostManager) {
      const msg = localize(23029, null, this._environmentService.extensionTestsLocationURI.toString());
      console.error(msg);
      this._notificationService.error(msg);
      return;
    }
    let exitCode;
    try {
      exitCode = await extensionHostManager.extensionTestsExecute();
      if (isCI) {
        this._logService.info(`Extension host test runner exit code: ${exitCode}`);
      }
    } catch (err) {
      if (isCI) {
        this._logService.error(`Extension host test runner error`, err);
      }
      console.error(err);
      exitCode = 1;
    }
    this._onExtensionHostExit(exitCode);
  }
  findTestExtensionHost(testLocation) {
    let runningLocation = null;
    for (const extension of this._registry.getAllExtensionDescriptions()) {
      if (isEqualOrParent2(testLocation, extension.extensionLocation)) {
        runningLocation = this._runningLocations.getRunningLocation(extension.identifier);
        break;
      }
    }
    if (runningLocation === null) {
      if (testLocation.scheme === Schemas.vscodeRemote) {
        runningLocation = new RemoteRunningLocation();
      } else {
        runningLocation = new LocalProcessRunningLocation(0);
      }
    }
    if (runningLocation !== null) {
      return this._extensionHostManagers.getByRunningLocation(runningLocation);
    }
    return null;
  }
  _releaseBarrier() {
    this._installedExtensionsReady.open();
    this._onDidRegisterExtensions.fire(void 0);
    this._onDidChangeExtensionsStatus.fire(this._registry.getAllExtensionDescriptions().map((e4) => e4.identifier));
  }
  //#region remote authority resolving
  async _resolveAuthorityInitial(remoteAuthority) {
    const MAX_ATTEMPTS = 5;
    for (let attempt = 1; ; attempt++) {
      try {
        return this._resolveAuthorityWithLogging(remoteAuthority);
      } catch (err) {
        if (RemoteAuthorityResolverError.isNoResolverFound(err)) {
          throw err;
        }
        if (RemoteAuthorityResolverError.isNotAvailable(err)) {
          throw err;
        }
        if (attempt >= MAX_ATTEMPTS) {
          throw err;
        }
      }
    }
  }
  async _resolveAuthorityAgain() {
    const remoteAuthority = this._environmentService.remoteAuthority;
    if (!remoteAuthority) {
      return;
    }
    this._remoteAuthorityResolverService._clearResolvedAuthority(remoteAuthority);
    try {
      const result = await this._resolveAuthorityWithLogging(remoteAuthority);
      this._remoteAuthorityResolverService._setResolvedAuthority(result.authority, result.options);
    } catch (err) {
      this._remoteAuthorityResolverService._setResolvedAuthorityError(remoteAuthority, err);
    }
  }
  async _resolveAuthorityWithLogging(remoteAuthority) {
    const authorityPrefix = getRemoteAuthorityPrefix(remoteAuthority);
    const sw = StopWatch.create(false);
    this._logService.info(`Invoking resolveAuthority(${authorityPrefix})...`);
    try {
      mark(`code/willResolveAuthority/${authorityPrefix}`);
      const result = await this._resolveAuthority(remoteAuthority);
      mark(`code/didResolveAuthorityOK/${authorityPrefix}`);
      this._logService.info(`resolveAuthority(${authorityPrefix}) returned '${result.authority.connectTo}' after ${sw.elapsed()} ms`);
      return result;
    } catch (err) {
      mark(`code/didResolveAuthorityError/${authorityPrefix}`);
      this._logService.error(`resolveAuthority(${authorityPrefix}) returned an error after ${sw.elapsed()} ms`, err);
      throw err;
    }
  }
  async _resolveAuthorityOnExtensionHosts(kind, remoteAuthority) {
    const extensionHosts = this._getExtensionHostManagers(kind);
    if (extensionHosts.length === 0) {
      throw new Error(`Cannot resolve authority`);
    }
    this._resolveAuthorityAttempt++;
    const results = await Promise.all(extensionHosts.map((extHost) => extHost.resolveAuthority(remoteAuthority, this._resolveAuthorityAttempt)));
    let bestErrorResult = null;
    for (const result of results) {
      if (result.type === "ok") {
        return result.value;
      }
      if (!bestErrorResult) {
        bestErrorResult = result;
        continue;
      }
      const bestErrorIsUnknown = bestErrorResult.error.code === "Unknown" /* Unknown */;
      const errorIsUnknown = result.error.code === "Unknown" /* Unknown */;
      if (bestErrorIsUnknown && !errorIsUnknown) {
        bestErrorResult = result;
      }
    }
    throw new RemoteAuthorityResolverError(bestErrorResult.error.message, bestErrorResult.error.code, bestErrorResult.error.detail);
  }
  //#endregion
  //#region Stopping / Starting / Restarting
  async stopExtensionHosts(reason, auto) {
    await this._initializeIfNeeded();
    return this._doStopExtensionHostsWithVeto(reason, auto);
  }
  async _doStopExtensionHosts() {
    const previouslyActivatedExtensionIds = [];
    for (const extensionStatus of this._extensionStatus.values()) {
      if (extensionStatus.activationStarted) {
        previouslyActivatedExtensionIds.push(extensionStatus.id);
      }
    }
    await this._extensionHostManagers.stopAllInReverse();
    for (const extensionStatus of this._extensionStatus.values()) {
      extensionStatus.clearRuntimeStatus();
    }
    if (previouslyActivatedExtensionIds.length > 0) {
      this._onDidChangeExtensionsStatus.fire(previouslyActivatedExtensionIds);
    }
  }
  async _doStopExtensionHostsWithVeto(reason, auto = false) {
    if (auto && this._environmentService.isExtensionDevelopment) {
      return false;
    }
    const vetos = [];
    const vetoReasons = /* @__PURE__ */ new Set();
    this._onWillStop.fire({
      reason,
      auto,
      veto(value2, reason2) {
        vetos.push(value2);
        if (typeof value2 === "boolean") {
          if (value2 === true) {
            vetoReasons.add(reason2);
          }
        } else {
          value2.then((value3) => {
            if (value3) {
              vetoReasons.add(reason2);
            }
          }).catch((error) => {
            vetoReasons.add(localize(23027, null, reason2, toErrorMessage(error)));
          });
        }
      }
    });
    const veto = await handleVetos(vetos, (error) => this._logService.error(error));
    if (!veto) {
      await this._doStopExtensionHosts();
    } else {
      if (!auto) {
        const vetoReasonsArray = Array.from(vetoReasons);
        this._logService.warn(`Extension host was not stopped because of veto (stop reason: ${reason}, veto reason: ${vetoReasonsArray.join(", ")})`);
        const { confirmed } = await this._dialogService.confirm({
          type: Severity2.Warning,
          message: localize(23028, null),
          detail: vetoReasonsArray.length === 1 ? vetoReasonsArray[0] : vetoReasonsArray.join("\n -"),
          primaryButton: localize(23031, null)
        });
        if (confirmed) {
          return true;
        }
      }
    }
    return !veto;
  }
  _startExtensionHostsIfNecessary(isInitialStart, initialActivationEvents) {
    const locations = [];
    for (let affinity = 0; affinity <= this._runningLocations.maxLocalProcessAffinity; affinity++) {
      locations.push(new LocalProcessRunningLocation(affinity));
    }
    for (let affinity = 0; affinity <= this._runningLocations.maxLocalWebWorkerAffinity; affinity++) {
      locations.push(new LocalWebWorkerRunningLocation(affinity));
    }
    locations.push(new RemoteRunningLocation());
    for (const location2 of locations) {
      if (this._extensionHostManagers.getByRunningLocation(location2)) {
        continue;
      }
      const res = this._createExtensionHostManager(location2, isInitialStart, initialActivationEvents);
      if (res) {
        const [extHostManager, disposableStore] = res;
        this._extensionHostManagers.add(extHostManager, disposableStore);
      }
    }
  }
  _createExtensionHostManager(runningLocation, isInitialStart, initialActivationEvents) {
    const extensionHost = this._extensionHostFactory.createExtensionHost(this._runningLocations, runningLocation, isInitialStart);
    if (!extensionHost) {
      return null;
    }
    const processManager = this._doCreateExtensionHostManager(extensionHost, initialActivationEvents);
    const disposableStore = new DisposableStore();
    disposableStore.add(processManager.onDidExit(([code, signal]) => this._onExtensionHostCrashOrExit(processManager, code, signal)));
    disposableStore.add(processManager.onDidChangeResponsiveState((responsiveState) => {
      this._logService.info(`Extension host (${processManager.friendyName}) is ${responsiveState === 0 /* Responsive */ ? "responsive" : "unresponsive"}.`);
      this._onDidChangeResponsiveChange.fire({
        extensionHostKind: processManager.kind,
        isResponsive: responsiveState === 0 /* Responsive */,
        getInspectListener: (tryEnableInspector) => {
          return processManager.getInspectPort(tryEnableInspector);
        }
      });
    }));
    return [processManager, disposableStore];
  }
  _doCreateExtensionHostManager(extensionHost, initialActivationEvents) {
    const internalExtensionService = this._acquireInternalAPI(extensionHost);
    if (extensionHost.startup === 3 /* LazyAutoStart */) {
      return this._instantiationService.createInstance(LazyCreateExtensionHostManager, extensionHost, initialActivationEvents, internalExtensionService);
    }
    return this._instantiationService.createInstance(ExtensionHostManager, extensionHost, initialActivationEvents, internalExtensionService);
  }
  _onExtensionHostCrashOrExit(extensionHost, code, signal) {
    const isExtensionDevHost = parseExtensionDevOptions(this._environmentService).isExtensionDevHost;
    if (!isExtensionDevHost) {
      this._onExtensionHostCrashed(extensionHost, code, signal);
      return;
    }
    this._onExtensionHostExit(code);
  }
  _onExtensionHostCrashed(extensionHost, code, signal) {
    console.error(`Extension host (${extensionHost.friendyName}) terminated unexpectedly. Code: ${code}, Signal: ${signal}`);
    if (extensionHost.kind === 1 /* LocalProcess */) {
      this._doStopExtensionHosts();
    } else if (extensionHost.kind === 3 /* Remote */) {
      if (signal) {
        this._onRemoteExtensionHostCrashed(extensionHost, signal);
      }
      this._extensionHostManagers.stopOne(extensionHost);
    }
  }
  _getExtensionHostExitInfoWithTimeout(reconnectionToken) {
    return new Promise((resolve3, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new Error("getExtensionHostExitInfo timed out"));
      }, 2e3);
      this._remoteAgentService.getExtensionHostExitInfo(reconnectionToken).then(
        (r2) => {
          clearTimeout(timeoutHandle);
          resolve3(r2);
        },
        reject
      );
    });
  }
  async _onRemoteExtensionHostCrashed(extensionHost, reconnectionToken) {
    try {
      const info = await this._getExtensionHostExitInfoWithTimeout(reconnectionToken);
      if (info) {
        this._logService.error(`Extension host (${extensionHost.friendyName}) terminated unexpectedly with code ${info.code}.`);
      }
      this._logExtensionHostCrash(extensionHost);
      this._remoteCrashTracker.registerCrash();
      if (this._remoteCrashTracker.shouldAutomaticallyRestart()) {
        this._logService.info(`Automatically restarting the remote extension host.`);
        this._notificationService.status(localize(23025, null), { hideAfter: 5e3 });
        this._startExtensionHostsIfNecessary(false, Array.from(this._allRequestedActivateEvents.keys()));
      } else {
        this._notificationService.prompt(
          Severity2.Error,
          localize(23026, null),
          [{
            label: localize(23032, null),
            run: () => {
              this._startExtensionHostsIfNecessary(false, Array.from(this._allRequestedActivateEvents.keys()));
            }
          }]
        );
      }
    } catch (err) {
    }
  }
  _logExtensionHostCrash(extensionHost) {
    const activatedExtensions = [];
    for (const extensionStatus of this._extensionStatus.values()) {
      if (extensionStatus.activationStarted && extensionHost.containsExtension(extensionStatus.id)) {
        activatedExtensions.push(extensionStatus.id);
      }
    }
    if (activatedExtensions.length > 0) {
      this._logService.error(`Extension host (${extensionHost.friendyName}) terminated unexpectedly. The following extensions were running: ${activatedExtensions.map((id2) => id2.value).join(", ")}`);
    } else {
      this._logService.error(`Extension host (${extensionHost.friendyName}) terminated unexpectedly. No extensions were activated.`);
    }
  }
  async startExtensionHosts(updates) {
    await this._doStopExtensionHosts();
    if (updates) {
      await this._handleDeltaExtensions(new DeltaExtensionsQueueItem(updates.toAdd, updates.toRemove));
    }
    const lock = await this._registry.acquireLock("startExtensionHosts");
    try {
      this._startExtensionHostsIfNecessary(false, Array.from(this._allRequestedActivateEvents.keys()));
      this._startOnDemandExtensionHosts();
      const localProcessExtensionHosts = this._getExtensionHostManagers(1 /* LocalProcess */);
      await Promise.all(localProcessExtensionHosts.map((extHost) => extHost.ready()));
    } finally {
      lock.dispose();
    }
  }
  _startOnDemandExtensionHosts() {
    const snapshot = this._registry.getSnapshot();
    for (const extHostManager of this._extensionHostManagers) {
      if (extHostManager.startup !== 1 /* EagerAutoStart */) {
        const extensions = this._runningLocations.filterByExtensionHostManager(snapshot.extensions, extHostManager);
        extHostManager.start(snapshot.versionId, snapshot.extensions, extensions.map((extension) => extension.identifier));
      }
    }
  }
  //#endregion
  //#region IExtensionService
  activateByEvent(activationEvent, activationKind = 0 /* Normal */) {
    if (this._installedExtensionsReady.isOpen()) {
      this._allRequestedActivateEvents.add(activationEvent);
      if (!this._registry.containsActivationEvent(activationEvent)) {
        return NO_OP_VOID_PROMISE;
      }
      return this._activateByEvent(activationEvent, activationKind);
    } else {
      this._allRequestedActivateEvents.add(activationEvent);
      if (activationKind === 1 /* Immediate */) {
        void this._initializeIfNeeded();
        return this._activateByEvent(activationEvent, activationKind);
      }
      return this._installedExtensionsReady.wait().then(() => this._activateByEvent(activationEvent, activationKind));
    }
  }
  _activateByEvent(activationEvent, activationKind) {
    let managers;
    if (activationKind === 1 /* Immediate */) {
      managers = this._extensionHostManagers.filter(
        (extHostManager) => extHostManager.kind === 1 /* LocalProcess */ || extHostManager.kind === 2 /* LocalWebWorker */ || extHostManager.isReady
      );
      this._pendingRemoteActivationEvents.add(activationEvent);
    } else {
      managers = [...this._extensionHostManagers];
    }
    const result = Promise.all(
      managers.map((extHostManager) => extHostManager.activateByEvent(activationEvent, activationKind))
    ).then(() => {
    });
    this._onWillActivateByEvent.fire({
      event: activationEvent,
      activation: result,
      activationKind
    });
    return result;
  }
  activateById(extensionId, reason) {
    return this._activateById(extensionId, reason);
  }
  activationEventIsDone(activationEvent) {
    if (!this._installedExtensionsReady.isOpen()) {
      return false;
    }
    if (!this._registry.containsActivationEvent(activationEvent)) {
      return true;
    }
    return this._extensionHostManagers.every((manager) => manager.activationEventIsDone(activationEvent));
  }
  whenInstalledExtensionsRegistered() {
    return this._installedExtensionsReady.wait();
  }
  get extensions() {
    return this._registry.getAllExtensionDescriptions();
  }
  _getExtensionRegistrySnapshotWhenReady() {
    return this._installedExtensionsReady.wait().then(() => this._registry.getSnapshot());
  }
  getExtension(id2) {
    return this._installedExtensionsReady.wait().then(() => {
      return this._registry.getExtensionDescription(id2);
    });
  }
  readExtensionPointContributions(extPoint) {
    return this._installedExtensionsReady.wait().then(() => {
      const availableExtensions = this._registry.getAllExtensionDescriptions();
      const result = [];
      for (const desc of availableExtensions) {
        if (desc.contributes && hasOwnProperty4.call(desc.contributes, extPoint.name)) {
          result.push(new ExtensionPointContribution(desc, desc.contributes[extPoint.name]));
        }
      }
      return result;
    });
  }
  getExtensionsStatus() {
    const result = /* @__PURE__ */ Object.create(null);
    if (this._registry) {
      const extensions = this._registry.getAllExtensionDescriptions();
      for (const extension of extensions) {
        const extensionStatus = this._extensionStatus.get(extension.identifier);
        result[extension.identifier.value] = {
          id: extension.identifier,
          messages: extensionStatus?.messages ?? [],
          activationStarted: extensionStatus?.activationStarted ?? false,
          activationTimes: extensionStatus?.activationTimes ?? void 0,
          runtimeErrors: extensionStatus?.runtimeErrors ?? [],
          runningLocation: this._runningLocations.getRunningLocation(extension.identifier)
        };
      }
    }
    return result;
  }
  async getInspectPorts(extensionHostKind, tryEnableInspector) {
    const result = await Promise.all(
      this._getExtensionHostManagers(extensionHostKind).map(async (extHost) => {
        let portInfo = await extHost.getInspectPort(tryEnableInspector);
        if (portInfo !== void 0) {
          portInfo = { ...portInfo, devtoolsLabel: extHost.friendyName };
        }
        return portInfo;
      })
    );
    return result.filter(isDefined);
  }
  async setRemoteEnvironment(env2) {
    await this._extensionHostManagers.map((manager) => manager.setRemoteEnvironment(env2));
  }
  //#endregion
  // --- impl
  _safeInvokeIsEnabled(extension) {
    try {
      return this._extensionEnablementService.isEnabled(extension);
    } catch (err) {
      return false;
    }
  }
  _doHandleExtensionPoints(affectedExtensions, onlyResolverExtensionPoints) {
    const affectedExtensionPoints = /* @__PURE__ */ Object.create(null);
    for (const extensionDescription of affectedExtensions) {
      if (extensionDescription.contributes) {
        for (const extPointName in extensionDescription.contributes) {
          if (hasOwnProperty4.call(extensionDescription.contributes, extPointName)) {
            affectedExtensionPoints[extPointName] = true;
          }
        }
      }
    }
    const messageHandler = (msg) => this._handleExtensionPointMessage(msg);
    const availableExtensions = this._registry.getAllExtensionDescriptions();
    const extensionPoints = ExtensionsRegistry.getExtensionPoints();
    mark(onlyResolverExtensionPoints ? "code/willHandleResolverExtensionPoints" : "code/willHandleExtensionPoints");
    for (const extensionPoint5 of extensionPoints) {
      if (affectedExtensionPoints[extensionPoint5.name] && (!onlyResolverExtensionPoints || extensionPoint5.canHandleResolver)) {
        mark(`code/willHandleExtensionPoint/${extensionPoint5.name}`);
        AbstractExtensionService._handleExtensionPoint(extensionPoint5, availableExtensions, messageHandler);
        mark(`code/didHandleExtensionPoint/${extensionPoint5.name}`);
      }
    }
    mark(onlyResolverExtensionPoints ? "code/didHandleResolverExtensionPoints" : "code/didHandleExtensionPoints");
  }
  _getOrCreateExtensionStatus(extensionId) {
    if (!this._extensionStatus.has(extensionId)) {
      this._extensionStatus.set(extensionId, new ExtensionStatus(extensionId));
    }
    return this._extensionStatus.get(extensionId);
  }
  _handleExtensionPointMessage(msg) {
    const extensionStatus = this._getOrCreateExtensionStatus(msg.extensionId);
    extensionStatus.addMessage(msg);
    const extension = this._registry.getExtensionDescription(msg.extensionId);
    const strMsg = `[${msg.extensionId.value}]: ${msg.message}`;
    if (msg.type === Severity2.Error) {
      if (extension && extension.isUnderDevelopment) {
        this._notificationService.notify({ severity: Severity2.Error, message: strMsg });
      }
      this._logService.error(strMsg);
    } else if (msg.type === Severity2.Warning) {
      if (extension && extension.isUnderDevelopment) {
        this._notificationService.notify({ severity: Severity2.Warning, message: strMsg });
      }
      this._logService.warn(strMsg);
    } else {
      this._logService.info(strMsg);
    }
    if (msg.extensionId && this._environmentService.isBuilt && !this._environmentService.isExtensionDevelopment) {
      const { type, extensionId, extensionPointId, message } = msg;
      this._telemetryService.publicLog2("extensionsMessage", {
        type,
        extensionId: extensionId.value,
        extensionPointId,
        message
      });
    }
  }
  static _handleExtensionPoint(extensionPoint5, availableExtensions, messageHandler) {
    const users = [];
    for (const desc of availableExtensions) {
      if (desc.contributes && hasOwnProperty4.call(desc.contributes, extensionPoint5.name)) {
        users.push({
          description: desc,
          value: desc.contributes[extensionPoint5.name],
          collector: new ExtensionMessageCollector(messageHandler, desc, extensionPoint5.name)
        });
      }
    }
    extensionPoint5.acceptUsers(users);
  }
  //#region Called by extension host
  _acquireInternalAPI(extensionHost) {
    return {
      _activateById: (extensionId, reason) => {
        return this._activateById(extensionId, reason);
      },
      _onWillActivateExtension: (extensionId) => {
        return this._onWillActivateExtension(extensionId, extensionHost.runningLocation);
      },
      _onDidActivateExtension: (extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) => {
        return this._onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason);
      },
      _onDidActivateExtensionError: (extensionId, error) => {
        return this._onDidActivateExtensionError(extensionId, error);
      },
      _onExtensionRuntimeError: (extensionId, err) => {
        return this._onExtensionRuntimeError(extensionId, err);
      }
    };
  }
  async _activateById(extensionId, reason) {
    const results = await Promise.all(
      this._extensionHostManagers.map((manager) => manager.activate(extensionId, reason))
    );
    const activated = results.some((e4) => e4);
    if (!activated) {
      throw new Error(`Unknown extension ${extensionId.value}`);
    }
  }
  _onWillActivateExtension(extensionId, runningLocation) {
    this._runningLocations.set(extensionId, runningLocation);
    const extensionStatus = this._getOrCreateExtensionStatus(extensionId);
    extensionStatus.onWillActivate();
  }
  _onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
    const extensionStatus = this._getOrCreateExtensionStatus(extensionId);
    extensionStatus.setActivationTimes(new ActivationTimes(codeLoadingTime, activateCallTime, activateResolvedTime, activationReason));
    this._onDidChangeExtensionsStatus.fire([extensionId]);
  }
  _onDidActivateExtensionError(extensionId, error) {
    this._telemetryService.publicLog2("extensionActivationError", {
      extensionId: extensionId.value,
      error: error.message
    });
  }
  _onExtensionRuntimeError(extensionId, err) {
    const extensionStatus = this._getOrCreateExtensionStatus(extensionId);
    extensionStatus.addRuntimeError(err);
    this._onDidChangeExtensionsStatus.fire([extensionId]);
  }
  _reportProposedApiUsage(usage) {
    this._telemetryService.publicLog2("extensionProposedApiNotEnabled", {
      extensionId: usage.extensionId,
      proposalName: usage.proposalName
    });
  }
};

AbstractExtensionService = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IWorkbenchExtensionEnablementService),
  __decorateParam(9, IFileService),
  __decorateParam(10, IProductService),
  __decorateParam(11, IWorkbenchExtensionManagementService),
  __decorateParam(12, IWorkspaceContextService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, IExtensionManifestPropertiesService),
  __decorateParam(15, ILogService),
  __decorateParam(16, IRemoteAgentService),
  __decorateParam(17, IRemoteExtensionsScannerService),
  __decorateParam(18, ILifecycleService),
  __decorateParam(19, IRemoteAuthorityResolverService),
  __decorateParam(20, IDialogService)
], AbstractExtensionService);

var ExtensionHostCollection = class extends Disposable {
  constructor() {
    super(...arguments);
    this._extensionHostManagers = [];
  }
  dispose() {
    for (let i2 = this._extensionHostManagers.length - 1; i2 >= 0; i2--) {
      const manager = this._extensionHostManagers[i2];
      manager.extensionHost.disconnect();
      manager.dispose();
    }
    this._extensionHostManagers = [];
    super.dispose();
  }
  add(extensionHostManager, disposableStore) {
    this._extensionHostManagers.push(new ExtensionHostManagerData(extensionHostManager, disposableStore));
  }
  async stopAllInReverse() {
    for (let i2 = this._extensionHostManagers.length - 1; i2 >= 0; i2--) {
      const manager = this._extensionHostManagers[i2];
      await manager.extensionHost.disconnect();
      manager.dispose();
    }
    this._extensionHostManagers = [];
  }
  async stopOne(extensionHostManager) {
    const index2 = this._extensionHostManagers.findIndex((el) => el.extensionHost === extensionHostManager);
    if (index2 >= 0) {
      this._extensionHostManagers.splice(index2, 1);
      await extensionHostManager.disconnect();
      extensionHostManager.dispose();
    }
  }
  getByKind(kind) {
    return this.filter((el) => el.kind === kind);
  }
  getByRunningLocation(runningLocation) {
    for (const el of this._extensionHostManagers) {
      if (el.extensionHost.representsRunningLocation(runningLocation)) {
        return el.extensionHost;
      }
    }
    return null;
  }
  *[Symbol.iterator]() {
    for (const extensionHostManager of this._extensionHostManagers) {
      yield extensionHostManager.extensionHost;
    }
  }
  map(callback) {
    return this._extensionHostManagers.map((el) => callback(el.extensionHost));
  }
  every(callback) {
    return this._extensionHostManagers.every((el) => callback(el.extensionHost));
  }
  filter(callback) {
    return this._extensionHostManagers.filter((el) => callback(el.extensionHost)).map((el) => el.extensionHost);
  }
};

var ExtensionHostManagerData = class {
  constructor(extensionHost, disposableStore) {
    this.extensionHost = extensionHost;
    this.disposableStore = disposableStore;
  }
  dispose() {
    this.disposableStore.dispose();
    this.extensionHost.dispose();
  }
};

var ResolverExtensions = class {
  constructor(extensions) {
    this.extensions = extensions;
  }
};

var LocalExtensions = class {
  constructor(extensions) {
    this.extensions = extensions;
  }
};

var RemoteExtensions = class {
  constructor(extensions) {
    this.extensions = extensions;
  }
};

var DeltaExtensionsQueueItem = class {
  constructor(toAdd, toRemove) {
    this.toAdd = toAdd;
    this.toRemove = toRemove;
  }
};

function isResolverExtension2(extension) {
  return !!extension.activationEvents?.some((activationEvent) => activationEvent.startsWith("onResolveRemoteAuthority:"));
}

function checkEnabledAndProposedAPI(logService, extensionEnablementService, extensionsProposedApi, extensions, ignoreWorkspaceTrust) {
  extensionsProposedApi.updateEnabledApiProposals(extensions);
  return filterEnabledExtensions(logService, extensionEnablementService, extensions, ignoreWorkspaceTrust);
}

function filterEnabledExtensions(logService, extensionEnablementService, extensions, ignoreWorkspaceTrust) {
  const enabledExtensions = [], extensionsToCheck = [], mappedExtensions = [];
  for (const extension of extensions) {
    if (extension.isUnderDevelopment) {
      enabledExtensions.push(extension);
    } else {
      extensionsToCheck.push(extension);
      mappedExtensions.push(toExtension(extension));
    }
  }
  const enablementStates = extensionEnablementService.getEnablementStates(mappedExtensions, ignoreWorkspaceTrust ? { trusted: true } : void 0);
  for (let index2 = 0; index2 < enablementStates.length; index2++) {
    if (extensionEnablementService.isEnabledEnablementState(enablementStates[index2])) {
      enabledExtensions.push(extensionsToCheck[index2]);
    } else {
      if (isCI) {
        logService.info(`filterEnabledExtensions: extension '${extensionsToCheck[index2].identifier.value}' is disabled`);
      }
    }
  }
  return enabledExtensions;
}

function extensionIsEnabled(logService, extensionEnablementService, extension, ignoreWorkspaceTrust) {
  return filterEnabledExtensions(logService, extensionEnablementService, [extension], ignoreWorkspaceTrust).includes(extension);
}

function includes(extensions, identifier2) {
  for (const extension of extensions) {
    if (ExtensionIdentifier.equals(extension.identifier, identifier2)) {
      return true;
    }
  }
  return false;
}

var ExtensionStatus = class {
  constructor(id2) {
    this.id = id2;
    this._messages = [];
    this._activationTimes = null;
    this._runtimeErrors = [];
    this._activationStarted = false;
  }
  get messages() {
    return this._messages;
  }
  get activationTimes() {
    return this._activationTimes;
  }
  get runtimeErrors() {
    return this._runtimeErrors;
  }
  get activationStarted() {
    return this._activationStarted;
  }
  clearRuntimeStatus() {
    this._activationStarted = false;
    this._activationTimes = null;
    this._runtimeErrors = [];
  }
  addMessage(msg) {
    this._messages.push(msg);
  }
  setActivationTimes(activationTimes) {
    this._activationTimes = activationTimes;
  }
  addRuntimeError(err) {
    this._runtimeErrors.push(err);
  }
  onWillActivate() {
    this._activationStarted = true;
  }
};

var ExtensionHostCrashTracker = class _ExtensionHostCrashTracker {
  constructor() {
    this._recentCrashes = [];
  }
  static {
    this._TIME_LIMIT = 5 * 60 * 1e3;
  }
  static {
    // 5 minutes
    this._CRASH_LIMIT = 3;
  }
  _removeOldCrashes() {
    const limit = Date.now() - _ExtensionHostCrashTracker._TIME_LIMIT;
    while (this._recentCrashes.length > 0 && this._recentCrashes[0].timestamp < limit) {
      this._recentCrashes.shift();
    }
  }
  registerCrash() {
    this._removeOldCrashes();
    this._recentCrashes.push({ timestamp: Date.now() });
  }
  shouldAutomaticallyRestart() {
    this._removeOldCrashes();
    return this._recentCrashes.length < _ExtensionHostCrashTracker._CRASH_LIMIT;
  }
};

var ImplicitActivationAwareReader = class {
  readActivationEvents(extensionDescription) {
    return ImplicitActivationEvents.readActivationEvents(extensionDescription);
  }
};

var ActivationFeatureMarkdowneRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "markdown";
  }
  shouldRender(manifest) {
    return !!manifest.activationEvents;
  }
  render(manifest) {
    const activationEvents = manifest.activationEvents || [];
    const data = new MarkdownString();
    if (activationEvents.length) {
      for (const activationEvent of activationEvents) {
        data.appendMarkdown(`- \`${activationEvent}\`
`);
      }
    }
    return {
      data,
      dispose: () => {
      }
    };
  }
};

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "activationEvents",
  label: localize(23023, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ActivationFeatureMarkdowneRenderer)
});
export { isResolverExtension2, checkEnabledAndProposedAPI, filterEnabledExtensions, extensionIsEnabled, includes, hasOwnProperty4, NO_OP_VOID_PROMISE, AbstractExtensionService, ExtensionHostCollection, ExtensionHostManagerData, ResolverExtensions, LocalExtensions, RemoteExtensions, DeltaExtensionsQueueItem, ExtensionStatus, ExtensionHostCrashTracker, ImplicitActivationAwareReader, ActivationFeatureMarkdowneRenderer };
