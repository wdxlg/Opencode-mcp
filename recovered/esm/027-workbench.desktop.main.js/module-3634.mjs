// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editSessions/browser/editSessions.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { EDIT_SESSIONS_CONTAINER_ID, EDIT_SESSIONS_DATA_VIEW_ID, EDIT_SESSIONS_PENDING, EDIT_SESSIONS_SHOW_VIEW, EDIT_SESSIONS_TITLE, EDIT_SESSIONS_VIEW_ICON, EDIT_SESSION_SYNC_CATEGORY, EditSessionSchemaVersion, IEditSessionsLogService, IEditSessionsStorageService, decodeEditSessionFileContent, editSessionsLogId, hashedEditSessionId } from "./module-3626.mjs";
import { EditSessionsLogService } from "./module-3628.mjs";
import { EditSessionsWorkbenchService } from "./module-3627.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { VirtualWorkspaceContext, WorkspaceFolderCountContext } from "./module-0949.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { EditSessionsStoreClient } from "./module-3633.mjs";
import { URI } from "./module-0032.mjs";
import { WorkspaceStateSynchroniser } from "./module-3632.mjs";
import { EditSessionsFileSystemProvider } from "./module-3630.mjs";
import { isNative, isWeb } from "./module-0014.mjs";
import { IActivityService, NumberBadge } from "./module-1449.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { EditSessionsDataViews } from "./module-3629.mjs";
import { IOutputService } from "./module-1245.mjs";
import { IViewsService } from "./module-1246.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { basename2, joinPath, relativePath } from "./module-0034.mjs";
import { IDialogService, IFileDialogService, getFileNamesMessage } from "./module-0267.mjs";
import { equals4 } from "./module-0098.mjs";
import { hashAsync } from "./module-0039.mjs";
import { encodeBase64 } from "./module-0038.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { UserDataSyncStoreError } from "./module-1696.mjs";
import { CancellationError } from "./module-0004.mjs";
import { IExtensionService, isProposedApiEnabled } from "./module-0887.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ICommandService } from "./module-0087.mjs";
import { Schemas } from "./module-0033.mjs";
import { getVirtualWorkspaceLocation } from "./module-0936.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ISCMService } from "./module-1080.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IProductService } from "./module-0873.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IEditSessionIdentityService } from "./module-1256.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { IRequestService } from "./module-0946.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceIdentityService } from "./module-3631.mjs";
import { Codicon } from "./module-0085.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";


// src/vs/workbench/contrib/editSessions/browser/editSessions.contribution.ts
registerSingleton(IEditSessionsLogService, EditSessionsLogService, 1 /* Delayed */);

registerSingleton(IEditSessionsStorageService, EditSessionsWorkbenchService, 1 /* Delayed */);

var continueWorkingOnCommand = {
  id: "_workbench.editSessions.actions.continueEditSession",
  title: localize2(14891, "Continue Working On..."),
  precondition: WorkspaceFolderCountContext.notEqualsTo("0"),
  f1: true
};

var openLocalFolderCommand = {
  id: "_workbench.editSessions.actions.continueEditSession.openLocalFolder",
  title: localize2(14889, "Open In Local Folder"),
  category: EDIT_SESSION_SYNC_CATEGORY,
  precondition: ContextKeyExpr.and(IsWebContext.toNegated(), VirtualWorkspaceContext)
};

var showOutputChannelCommand = {
  id: "workbench.editSessions.actions.showOutputChannel",
  title: localize2(14923, "Show Log"),
  category: EDIT_SESSION_SYNC_CATEGORY
};

var installAdditionalContinueOnOptionsCommand = {
  id: "workbench.action.continueOn.extensions",
  title: localize(14903, null)
};

registerAction2(class extends Action2 {
  constructor() {
    super({ ...installAdditionalContinueOnOptionsCommand, f1: false });
  }
  async run(accessor) {
    return accessor.get(IExtensionsWorkbenchService).openSearch("@tag:continueOn");
  }
});

var resumeProgressOptionsTitle = `[${localize(14921, null)}](command:${showOutputChannelCommand.id})`;

var resumeProgressOptions = {
  location: 10 /* Window */,
  type: "syncing"
};

var queryParamName = "editSessionId";

var useEditSessionsWithContinueOn = "workbench.editSessions.continueOn";

var EditSessionsContribution = class extends Disposable {
  constructor(editSessionsStorageService, fileService, progressService, openerService, telemetryService, scmService, notificationService, dialogService, logService, environmentService, instantiationService, productService, configurationService, contextService, editSessionIdentityService, quickInputService, commandService, contextKeyService, fileDialogService, lifecycleService, storageService, activityService, editorService, remoteAgentService, extensionService, requestService, userDataProfilesService, uriIdentityService, workspaceIdentityService) {
    super();
    this.editSessionsStorageService = editSessionsStorageService;
    this.fileService = fileService;
    this.progressService = progressService;
    this.openerService = openerService;
    this.telemetryService = telemetryService;
    this.scmService = scmService;
    this.notificationService = notificationService;
    this.dialogService = dialogService;
    this.logService = logService;
    this.environmentService = environmentService;
    this.instantiationService = instantiationService;
    this.productService = productService;
    this.configurationService = configurationService;
    this.contextService = contextService;
    this.editSessionIdentityService = editSessionIdentityService;
    this.quickInputService = quickInputService;
    this.commandService = commandService;
    this.contextKeyService = contextKeyService;
    this.fileDialogService = fileDialogService;
    this.lifecycleService = lifecycleService;
    this.storageService = storageService;
    this.activityService = activityService;
    this.editorService = editorService;
    this.remoteAgentService = remoteAgentService;
    this.extensionService = extensionService;
    this.requestService = requestService;
    this.userDataProfilesService = userDataProfilesService;
    this.uriIdentityService = uriIdentityService;
    this.workspaceIdentityService = workspaceIdentityService;
    this.continueEditSessionOptions = [];
    this.accountsMenuBadgeDisposable = this._register(new MutableDisposable());
    this.registeredCommands = /* @__PURE__ */ new Set();
    this.shouldShowViewsContext = EDIT_SESSIONS_SHOW_VIEW.bindTo(this.contextKeyService);
    this.pendingEditSessionsContext = EDIT_SESSIONS_PENDING.bindTo(this.contextKeyService);
    this.pendingEditSessionsContext.set(false);
    if (!this.productService["editSessions.store"]?.url) {
      return;
    }
    this.editSessionsStorageClient = new EditSessionsStoreClient(URI.parse(this.productService["editSessions.store"].url), this.productService, this.requestService, this.logService, this.environmentService, this.fileService, this.storageService);
    this.editSessionsStorageService.storeClient = this.editSessionsStorageClient;
    this.workspaceStateSynchronizer = new WorkspaceStateSynchroniser(this.userDataProfilesService.defaultProfile, void 0, this.editSessionsStorageClient, this.logService, this.fileService, this.environmentService, this.telemetryService, this.configurationService, this.storageService, this.uriIdentityService, this.workspaceIdentityService, this.editSessionsStorageService);
    this.autoResumeEditSession();
    this.registerActions();
    this.registerViews();
    this.registerContributedEditSessionOptions();
    this._register(this.fileService.registerProvider(EditSessionsFileSystemProvider.SCHEMA, new EditSessionsFileSystemProvider(this.editSessionsStorageService)));
    this._register(this.lifecycleService.onWillShutdown((e) => {
      if (e.reason !== 3 /* RELOAD */ && this.editSessionsStorageService.isSignedIn && this.configurationService.getValue("workbench.experimental.cloudChanges.autoStore") === "onShutdown" && !isWeb) {
        e.join(this.autoStoreEditSession(), { id: "autoStoreWorkingChanges", label: localize(14881, null) });
      }
    }));
    this._register(this.editSessionsStorageService.onDidSignIn(() => this.updateAccountsMenuBadge()));
    this._register(this.editSessionsStorageService.onDidSignOut(() => this.updateAccountsMenuBadge()));
  }
  static {
    this.APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY = "applicationLaunchedViaContinueOn";
  }
  async autoResumeEditSession() {
    const shouldAutoResumeOnReload = this.configurationService.getValue("workbench.cloudChanges.autoResume") === "onReload";
    if (this.environmentService.editSessionId !== void 0) {
      this.logService.info(`Resuming cloud changes, reason: found editSessionId ${this.environmentService.editSessionId} in environment service...`);
      await this.progressService.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(this.environmentService.editSessionId, void 0, void 0, void 0, progress).finally(() => this.environmentService.editSessionId = void 0));
    } else if (shouldAutoResumeOnReload && this.editSessionsStorageService.isSignedIn) {
      this.logService.info("Resuming cloud changes, reason: cloud changes enabled...");
      await this.progressService.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(void 0, true, void 0, void 0, progress));
    } else if (shouldAutoResumeOnReload) {
      const hasApplicationLaunchedFromContinueOnFlow = this.storageService.getBoolean(EditSessionsContribution.APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY, -1 /* APPLICATION */, false);
      this.logService.info(`Prompting to enable cloud changes, has application previously launched from Continue On flow: ${hasApplicationLaunchedFromContinueOnFlow}`);
      const handlePendingEditSessions = () => {
        this.logService.info("Showing badge to enable cloud changes in accounts menu...");
        this.updateAccountsMenuBadge();
        this.pendingEditSessionsContext.set(true);
        const disposable = this.editSessionsStorageService.onDidSignIn(async () => {
          disposable.dispose();
          this.logService.info("Showing badge to enable cloud changes in accounts menu succeeded, resuming cloud changes...");
          await this.progressService.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(void 0, true, void 0, void 0, progress));
          this.storageService.remove(EditSessionsContribution.APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY, -1 /* APPLICATION */);
          this.environmentService.continueOn = void 0;
        });
      };
      if (this.environmentService.continueOn !== void 0 && !this.editSessionsStorageService.isSignedIn && // and user has not yet been prompted to sign in on this machine
      hasApplicationLaunchedFromContinueOnFlow === false) {
        this.storageService.store(EditSessionsContribution.APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY, true, -1 /* APPLICATION */, 1 /* MACHINE */);
        this.logService.info("Prompting to enable cloud changes...");
        await this.editSessionsStorageService.initialize("read");
        if (this.editSessionsStorageService.isSignedIn) {
          this.logService.info("Prompting to enable cloud changes succeeded, resuming cloud changes...");
          await this.progressService.withProgress(resumeProgressOptions, async (progress) => await this.resumeEditSession(void 0, true, void 0, void 0, progress));
        } else {
          handlePendingEditSessions();
        }
      } else if (!this.editSessionsStorageService.isSignedIn && // and user has been prompted to sign in on this machine
      hasApplicationLaunchedFromContinueOnFlow === true) {
        handlePendingEditSessions();
      }
    } else {
      this.logService.debug("Auto resuming cloud changes disabled.");
    }
  }
  updateAccountsMenuBadge() {
    if (this.editSessionsStorageService.isSignedIn) {
      return this.accountsMenuBadgeDisposable.clear();
    }
    const badge = new NumberBadge(1, () => localize(14885, null));
    this.accountsMenuBadgeDisposable.value = this.activityService.showAccountsActivity({ badge });
  }
  async autoStoreEditSession() {
    const cancellationTokenSource = new CancellationTokenSource();
    await this.progressService.withProgress({
      location: 10 /* Window */,
      type: "syncing",
      title: localize(14924, null)
    }, async () => this.storeEditSession(false, cancellationTokenSource.token), () => {
      cancellationTokenSource.cancel();
      cancellationTokenSource.dispose();
    });
  }
  registerViews() {
    const container3 = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer(
      {
        id: EDIT_SESSIONS_CONTAINER_ID,
        title: EDIT_SESSIONS_TITLE,
        ctorDescriptor: new SyncDescriptor(
          ViewPaneContainer,
          [EDIT_SESSIONS_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]
        ),
        icon: EDIT_SESSIONS_VIEW_ICON,
        hideIfEmpty: true
      },
      0 /* Sidebar */,
      { doNotRegisterOpenCommand: true }
    );
    this._register(this.instantiationService.createInstance(EditSessionsDataViews, container3));
  }
  registerActions() {
    this.registerContinueEditSessionAction();
    this.registerResumeLatestEditSessionAction();
    this.registerStoreLatestEditSessionAction();
    this.registerContinueInLocalFolderAction();
    this.registerShowEditSessionViewAction();
    this.registerShowEditSessionOutputChannelAction();
  }
  registerShowEditSessionOutputChannelAction() {
    this._register(registerAction2(class ShowEditSessionOutput extends Action2 {
      constructor() {
        super(showOutputChannelCommand);
      }
      run(accessor, ...args2) {
        const outputChannel = accessor.get(IOutputService);
        void outputChannel.showChannel(editSessionsLogId);
      }
    }));
  }
  registerShowEditSessionViewAction() {
    const that = this;
    this._register(registerAction2(class ShowEditSessionView extends Action2 {
      constructor() {
        super({
          id: "workbench.editSessions.actions.showEditSessions",
          title: localize2(14922, "Show Cloud Changes"),
          category: EDIT_SESSION_SYNC_CATEGORY,
          f1: true
        });
      }
      async run(accessor) {
        that.shouldShowViewsContext.set(true);
        const viewsService = accessor.get(IViewsService);
        await viewsService.openView(EDIT_SESSIONS_DATA_VIEW_ID);
      }
    }));
  }
  registerContinueEditSessionAction() {
    const that = this;
    this._register(registerAction2(class ContinueEditSessionAction extends Action2 {
      constructor() {
        super(continueWorkingOnCommand);
      }
      async run(accessor, workspaceUri, destination) {
        let uri5 = workspaceUri;
        if (!destination && !uri5) {
          destination = await that.pickContinueEditSessionDestination();
          if (!destination) {
            that.telemetryService.publicLog2("continueOn.editSessions.pick.outcome", { outcome: "noSelection" });
            return;
          }
        }
        const shouldStoreEditSession = await that.shouldContinueOnWithEditSession();
        let ref;
        if (shouldStoreEditSession) {
          that.telemetryService.publicLog2("continueOn.editSessions.store");
          const cancellationTokenSource = new CancellationTokenSource();
          try {
            ref = await that.progressService.withProgress({
              location: 15 /* Notification */,
              cancellable: true,
              type: "syncing",
              title: localize(14926, null)
            }, async () => {
              const ref2 = await that.storeEditSession(false, cancellationTokenSource.token);
              if (ref2 !== void 0) {
                that.telemetryService.publicLog2("continueOn.editSessions.store.outcome", { outcome: "storeSucceeded", hashedId: hashedEditSessionId(ref2) });
              } else {
                that.telemetryService.publicLog2("continueOn.editSessions.store.outcome", { outcome: "storeSkipped" });
              }
              return ref2;
            }, () => {
              cancellationTokenSource.cancel();
              cancellationTokenSource.dispose();
              that.telemetryService.publicLog2("continueOn.editSessions.store.outcome", { outcome: "storeCancelledByUser" });
            });
          } catch (ex) {
            that.telemetryService.publicLog2("continueOn.editSessions.store.outcome", { outcome: "storeFailed" });
            throw ex;
          }
        }
        uri5 = destination ? await that.resolveDestination(destination) : uri5;
        if (uri5 === void 0) {
          return;
        }
        if (ref !== void 0 && uri5 !== "noDestinationUri") {
          const encodedRef = encodeURIComponent(ref);
          uri5 = uri5.with({
            query: uri5.query.length > 0 ? uri5.query + `&${queryParamName}=${encodedRef}&continueOn=1` : `${queryParamName}=${encodedRef}&continueOn=1`
          });
          that.logService.info(`Opening ${uri5.toString()}`);
          await that.openerService.open(uri5, { openExternal: true });
        } else if ((!shouldStoreEditSession || ref === void 0) && uri5 !== "noDestinationUri") {
          that.logService.info(`Opening ${uri5.toString()}`);
          await that.openerService.open(uri5, { openExternal: true });
        } else if (ref === void 0 && shouldStoreEditSession) {
          that.logService.warn(`Failed to store working changes when invoking ${continueWorkingOnCommand.id}.`);
        }
      }
    }));
  }
  registerResumeLatestEditSessionAction() {
    const that = this;
    this._register(registerAction2(class ResumeLatestEditSessionAction extends Action2 {
      constructor() {
        super({
          id: "workbench.editSessions.actions.resumeLatest",
          title: localize2(14920, "Resume Latest Changes from Cloud"),
          category: EDIT_SESSION_SYNC_CATEGORY,
          f1: true
        });
      }
      async run(accessor, editSessionId, forceApplyUnrelatedChange) {
        await that.progressService.withProgress({ ...resumeProgressOptions, title: resumeProgressOptionsTitle }, async () => await that.resumeEditSession(editSessionId, void 0, forceApplyUnrelatedChange));
      }
    }));
    this._register(registerAction2(class ResumeLatestEditSessionAction extends Action2 {
      constructor() {
        super({
          id: "workbench.editSessions.actions.resumeFromSerializedPayload",
          title: localize2(14916, "Resume Changes from Serialized Data"),
          category: "Developer",
          f1: true
        });
      }
      async run(accessor, editSessionId) {
        const data = await that.quickInputService.input({ prompt: "Enter serialized data" });
        if (data) {
          that.editSessionsStorageService.lastReadResources.set("editSessions", { content: data, ref: "" });
        }
        await that.progressService.withProgress({ ...resumeProgressOptions, title: resumeProgressOptionsTitle }, async () => await that.resumeEditSession(editSessionId, void 0, void 0, void 0, void 0, data));
      }
    }));
  }
  registerStoreLatestEditSessionAction() {
    const that = this;
    this._register(registerAction2(class StoreLatestEditSessionAction extends Action2 {
      constructor() {
        super({
          id: "workbench.editSessions.actions.storeCurrent",
          title: localize2(14925, "Store Working Changes in Cloud"),
          category: EDIT_SESSION_SYNC_CATEGORY,
          f1: true
        });
      }
      async run(accessor) {
        const cancellationTokenSource = new CancellationTokenSource();
        await that.progressService.withProgress({
          location: 15 /* Notification */,
          title: localize(14927, null)
        }, async () => {
          that.telemetryService.publicLog2("editSessions.store");
          await that.storeEditSession(true, cancellationTokenSource.token);
        }, () => {
          cancellationTokenSource.cancel();
          cancellationTokenSource.dispose();
        });
      }
    }));
  }
  async resumeEditSession(ref, silent, forceApplyUnrelatedChange, applyPartialMatch, progress, serializedData) {
    await this.remoteAgentService.getEnvironment();
    if (this.contextService.getWorkbenchState() === 1 /* EMPTY */) {
      return;
    }
    this.logService.info(ref !== void 0 ? `Resuming changes from cloud with ref ${ref}...` : "Checking for pending cloud changes...");
    if (silent && !await this.editSessionsStorageService.initialize("read", true)) {
      return;
    }
    this.telemetryService.publicLog2("editSessions.resume");
    performance.mark("code/willResumeEditSessionFromIdentifier");
    progress?.report({ message: localize(14886, null) });
    const data = serializedData ? { content: serializedData, ref: "" } : await this.editSessionsStorageService.read("editSessions", ref);
    if (!data) {
      if (ref === void 0 && !silent) {
        this.notificationService.info(localize(14910, null));
      } else if (ref !== void 0) {
        this.notificationService.warn(localize(14911, null, ref));
      }
      this.logService.info(ref !== void 0 ? `Aborting resuming changes from cloud as no edit session content is available to be applied from ref ${ref}.` : `Aborting resuming edit session as no edit session content is available to be applied`);
      return;
    }
    progress?.report({ message: resumeProgressOptionsTitle });
    const editSession = JSON.parse(data.content);
    ref = data.ref;
    if (editSession.version > EditSessionSchemaVersion) {
      this.notificationService.error(localize(14887, null, this.productService.nameLong));
      this.telemetryService.publicLog2("editSessions.resume.outcome", { hashedId: hashedEditSessionId(ref), outcome: "clientUpdateNeeded" });
      return;
    }
    try {
      const { changes, conflictingChanges } = await this.generateChanges(editSession, ref, forceApplyUnrelatedChange, applyPartialMatch);
      if (changes.length === 0) {
        return;
      }
      if (conflictingChanges.length > 0) {
        const { confirmed } = await this.dialogService.confirm({
          type: Severity2.Warning,
          message: conflictingChanges.length > 1 ? localize(14918, null, conflictingChanges.length) : localize(14917, null, basename2(conflictingChanges[0].uri)),
          detail: conflictingChanges.length > 1 ? getFileNamesMessage(conflictingChanges.map((c) => c.uri)) : void 0
        });
        if (!confirmed) {
          return;
        }
      }
      for (const { uri: uri5, type, contents } of changes) {
        if (type === 1 /* Addition */) {
          await this.fileService.writeFile(uri5, decodeEditSessionFileContent(editSession.version, contents));
        } else if (type === 2 /* Deletion */ && await this.fileService.exists(uri5)) {
          await this.fileService.del(uri5);
        }
      }
      await this.workspaceStateSynchronizer?.apply();
      this.logService.info(`Deleting edit session with ref ${ref} after successfully applying it to current workspace...`);
      await this.editSessionsStorageService.delete("editSessions", ref);
      this.logService.info(`Deleted edit session with ref ${ref}.`);
      this.telemetryService.publicLog2("editSessions.resume.outcome", { hashedId: hashedEditSessionId(ref), outcome: "resumeSucceeded" });
    } catch (ex) {
      this.logService.error("Failed to resume edit session, reason: ", ex.toString());
      this.notificationService.error(localize(14919, null));
    }
    performance.mark("code/didResumeEditSessionFromIdentifier");
  }
  async generateChanges(editSession, ref, forceApplyUnrelatedChange = false, applyPartialMatch = false) {
    const changes = [];
    const conflictingChanges = [];
    const workspaceFolders = this.contextService.getWorkspace().folders;
    const cancellationTokenSource = new CancellationTokenSource();
    for (const folder of editSession.folders) {
      let folderRoot;
      if (folder.canonicalIdentity) {
        for (const f of workspaceFolders) {
          const identity2 = await this.editSessionIdentityService.getEditSessionIdentifier(f, cancellationTokenSource.token);
          this.logService.info(`Matching identity ${identity2} against edit session folder identity ${folder.canonicalIdentity}...`);
          if (equals4(identity2, folder.canonicalIdentity) || forceApplyUnrelatedChange) {
            folderRoot = f;
            break;
          }
          if (identity2 !== void 0) {
            const match2 = await this.editSessionIdentityService.provideEditSessionIdentityMatch(f, identity2, folder.canonicalIdentity, cancellationTokenSource.token);
            if (match2 === 100 /* Complete */) {
              folderRoot = f;
              break;
            } else if (match2 === 50 /* Partial */ && this.configurationService.getValue("workbench.experimental.cloudChanges.partialMatches.enabled") === true) {
              if (!applyPartialMatch) {
                this.notificationService.prompt(
                  Severity2.Info,
                  localize(14908, null),
                  [{ label: localize(14915, null), run: () => this.resumeEditSession(ref, false, void 0, true) }]
                );
              } else {
                folderRoot = f;
                break;
              }
            }
          }
        }
      } else {
        folderRoot = workspaceFolders.find((f) => f.name === folder.name);
      }
      if (!folderRoot) {
        this.logService.info(`Skipping applying ${folder.workingChanges.length} changes from edit session with ref ${ref} as no matching workspace folder was found.`);
        return { changes: [], conflictingChanges: [], contributedStateHandlers: [] };
      }
      const localChanges = /* @__PURE__ */ new Set();
      for (const repository of this.scmService.repositories) {
        if (repository.provider.rootUri !== void 0 && this.contextService.getWorkspaceFolder(repository.provider.rootUri)?.name === folder.name) {
          const repositoryChanges = this.getChangedResources(repository);
          repositoryChanges.forEach((change) => localChanges.add(change.toString()));
        }
      }
      for (const change of folder.workingChanges) {
        const uri5 = joinPath(folderRoot.uri, change.relativeFilePath);
        if (!this.uriIdentityService.extUri.isEqualOrParent(uri5, folderRoot.uri) || this.uriIdentityService.extUri.isEqual(uri5, folderRoot.uri)) {
          this.logService.warn(`Skipping change outside workspace folder: ${change.relativeFilePath}`);
          continue;
        }
        changes.push({ uri: uri5, type: change.type, contents: change.contents });
        if (await this.willChangeLocalContents(localChanges, uri5, change)) {
          conflictingChanges.push({ uri: uri5, type: change.type, contents: change.contents });
        }
      }
    }
    return { changes, conflictingChanges };
  }
  async willChangeLocalContents(localChanges, uriWithIncomingChanges, incomingChange) {
    if (!localChanges.has(uriWithIncomingChanges.toString())) {
      return false;
    }
    const { contents, type } = incomingChange;
    switch (type) {
      case 1 /* Addition */: {
        const [originalContents, incomingContents] = await Promise.all([
          hashAsync(contents),
          hashAsync(encodeBase64((await this.fileService.readFile(uriWithIncomingChanges)).value))
        ]);
        return originalContents !== incomingContents;
      }
      case 2 /* Deletion */: {
        return await this.fileService.exists(uriWithIncomingChanges);
      }
      default:
        throw new Error("Unhandled change type.");
    }
  }
  async storeEditSession(fromStoreCommand, cancellationToken) {
    const folders = [];
    let editSessionSize = 0;
    let hasEdits = false;
    await this.editorService.saveAll();
    const createdEditSessionIdentities = new ResourceSet();
    for (const repository of this.scmService.repositories) {
      const changedResources = this.getChangedResources(repository);
      if (!changedResources.size) {
        continue;
      }
      for (const uri5 of changedResources) {
        const workspaceFolder = this.contextService.getWorkspaceFolder(uri5);
        if (!workspaceFolder || createdEditSessionIdentities.has(uri5)) {
          continue;
        }
        createdEditSessionIdentities.add(uri5);
        await this.editSessionIdentityService.onWillCreateEditSessionIdentity(workspaceFolder, cancellationToken);
      }
    }
    for (const repository of this.scmService.repositories) {
      const trackedUris = this.getChangedResources(repository);
      const workingChanges = [];
      const { rootUri } = repository.provider;
      const workspaceFolder = rootUri ? this.contextService.getWorkspaceFolder(rootUri) : void 0;
      let name = workspaceFolder?.name;
      for (const uri5 of trackedUris) {
        const workspaceFolder2 = this.contextService.getWorkspaceFolder(uri5);
        if (!workspaceFolder2) {
          this.logService.info(`Skipping working change ${uri5.toString()} as no associated workspace folder was found.`);
          continue;
        }
        name = name ?? workspaceFolder2.name;
        const relativeFilePath = relativePath(workspaceFolder2.uri, uri5) ?? uri5.path;
        try {
          if (!(await this.fileService.stat(uri5)).isFile) {
            continue;
          }
        } catch {
        }
        hasEdits = true;
        if (await this.fileService.exists(uri5)) {
          const contents = encodeBase64((await this.fileService.readFile(uri5)).value);
          editSessionSize += contents.length;
          if (editSessionSize > this.editSessionsStorageService.SIZE_LIMIT) {
            this.notificationService.error(localize(14914, null));
            return void 0;
          }
          workingChanges.push({ type: 1 /* Addition */, fileType: 1 /* File */, contents, relativeFilePath });
        } else {
          workingChanges.push({ type: 2 /* Deletion */, fileType: 1 /* File */, contents: void 0, relativeFilePath });
        }
      }
      let canonicalIdentity = void 0;
      if (workspaceFolder !== null && workspaceFolder !== void 0) {
        canonicalIdentity = await this.editSessionIdentityService.getEditSessionIdentifier(workspaceFolder, cancellationToken);
      }
      folders.push({ workingChanges, name: name ?? "", canonicalIdentity: canonicalIdentity ?? void 0, absoluteUri: workspaceFolder?.uri.toString() });
    }
    await this.workspaceStateSynchronizer?.sync();
    if (!hasEdits) {
      this.logService.info("Skipped storing working changes in the cloud as there are no edits to store.");
      if (fromStoreCommand) {
        this.notificationService.info(localize(14912, null));
      }
      return void 0;
    }
    const data = { folders, version: 2, workspaceStateId: this.editSessionsStorageService.lastWrittenResources.get("workspaceState")?.ref };
    try {
      this.logService.info(`Storing edit session...`);
      const ref = await this.editSessionsStorageService.write("editSessions", data);
      this.logService.info(`Stored edit session with ref ${ref}.`);
      return ref;
    } catch (ex) {
      this.logService.error(`Failed to store edit session, reason: `, ex.toString());
      if (ex instanceof UserDataSyncStoreError) {
        switch (ex.code) {
          case "TooLarge" /* TooLarge */:
            this.telemetryService.publicLog2("editSessions.upload.failed", { reason: "TooLarge" });
            this.notificationService.error(localize(14914, null));
            break;
          default:
            this.telemetryService.publicLog2("editSessions.upload.failed", { reason: "unknown" });
            this.notificationService.error(localize(14913, null));
            break;
        }
      }
    }
    return void 0;
  }
  getChangedResources(repository) {
    return repository.provider.groups.reduce((resources, resourceGroups) => {
      resourceGroups.resources.forEach((resource) => resources.add(resource.sourceUri));
      return resources;
    }, /* @__PURE__ */ new Set());
  }
  hasEditSession() {
    for (const repository of this.scmService.repositories) {
      if (this.getChangedResources(repository).size > 0) {
        return true;
      }
    }
    return false;
  }
  async shouldContinueOnWithEditSession() {
    if (this.editSessionsStorageService.isSignedIn) {
      return this.hasEditSession();
    }
    if (this.configurationService.getValue(useEditSessionsWithContinueOn) === "off") {
      this.telemetryService.publicLog2("continueOn.editSessions.canStore.outcome", { outcome: "disabledEditSessionsViaSetting" });
      return false;
    }
    if (this.hasEditSession()) {
      const disposables = new DisposableStore();
      const quickpick = disposables.add(this.quickInputService.createQuickPick());
      quickpick.placeholder = localize(14890, null);
      quickpick.ok = false;
      quickpick.ignoreFocusOut = true;
      const withCloudChanges = { label: localize(14928, null) };
      const withoutCloudChanges = { label: localize(14929, null) };
      quickpick.items = [withCloudChanges, withoutCloudChanges];
      const continueWithCloudChanges = await new Promise((resolve3, reject) => {
        disposables.add(quickpick.onDidAccept(() => {
          resolve3(quickpick.selectedItems[0] === withCloudChanges);
          disposables.dispose();
        }));
        disposables.add(quickpick.onDidHide(() => {
          reject(new CancellationError());
          disposables.dispose();
        }));
        quickpick.show();
      });
      if (!continueWithCloudChanges) {
        this.telemetryService.publicLog2("continueOn.editSessions.canStore.outcome", { outcome: "didNotEnableEditSessionsWhenPrompted" });
        return continueWithCloudChanges;
      }
      const initialized = await this.editSessionsStorageService.initialize("write");
      if (!initialized) {
        this.telemetryService.publicLog2("continueOn.editSessions.canStore.outcome", { outcome: "didNotEnableEditSessionsWhenPrompted" });
      }
      return initialized;
    }
    return false;
  }
  //#region Continue Edit Session extension contribution point
  registerContributedEditSessionOptions() {
    continueEditSessionExtPoint.setHandler((extensions) => {
      const continueEditSessionOptions = [];
      for (const extension of extensions) {
        if (!isProposedApiEnabled(extension.description, "contribEditSessions")) {
          continue;
        }
        if (!Array.isArray(extension.value)) {
          continue;
        }
        for (const contribution of extension.value) {
          const command4 = MenuRegistry.getCommand(contribution.command);
          if (!command4) {
            return;
          }
          const icon2 = command4.icon;
          const title = typeof command4.title === "string" ? command4.title : command4.title.value;
          const when = ContextKeyExpr.deserialize(contribution.when);
          continueEditSessionOptions.push(new ContinueEditSessionItem(
            ThemeIcon.isThemeIcon(icon2) ? `$(${icon2.id}) ${title}` : title,
            command4.id,
            command4.source?.title,
            when,
            contribution.documentation
          ));
          if (contribution.qualifiedName) {
            this.generateStandaloneOptionCommand(command4.id, contribution.qualifiedName, contribution.category ?? command4.category, when, contribution.remoteGroup);
          }
        }
      }
      this.continueEditSessionOptions = continueEditSessionOptions;
    });
  }
  generateStandaloneOptionCommand(commandId, qualifiedName, category11, when, remoteGroup) {
    const command4 = {
      id: `${continueWorkingOnCommand.id}.${commandId}`,
      title: { original: qualifiedName, value: qualifiedName },
      category: typeof category11 === "string" ? { original: category11, value: category11 } : category11,
      precondition: when,
      f1: true
    };
    if (!this.registeredCommands.has(command4.id)) {
      this.registeredCommands.add(command4.id);
      this._register(registerAction2(class StandaloneContinueOnOption extends Action2 {
        constructor() {
          super(command4);
        }
        async run(accessor) {
          return accessor.get(ICommandService).executeCommand(continueWorkingOnCommand.id, void 0, commandId);
        }
      }));
      if (remoteGroup !== void 0) {
        MenuRegistry.appendMenuItem(MenuId.StatusBarRemoteIndicatorMenu, {
          group: remoteGroup,
          command: command4,
          when: command4.precondition
        });
      }
    }
  }
  registerContinueInLocalFolderAction() {
    const that = this;
    this._register(registerAction2(class ContinueInLocalFolderAction extends Action2 {
      constructor() {
        super(openLocalFolderCommand);
      }
      async run(accessor) {
        const selection = await that.fileDialogService.showOpenDialog({
          title: localize(14892, null),
          canSelectFolders: true,
          canSelectMany: false,
          canSelectFiles: false,
          availableFileSystems: [Schemas.file]
        });
        return selection?.length !== 1 ? void 0 : URI.from({
          scheme: that.productService.urlProtocol,
          authority: Schemas.file,
          path: selection[0].path
        });
      }
    }));
    if (getVirtualWorkspaceLocation(this.contextService.getWorkspace()) !== void 0 && isNative) {
      this.generateStandaloneOptionCommand(openLocalFolderCommand.id, localize(14907, null), void 0, openLocalFolderCommand.precondition, void 0);
    }
  }
  async pickContinueEditSessionDestination() {
    const disposables = new DisposableStore();
    const quickPick = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    const workspaceContext = this.contextService.getWorkbenchState() === 2 /* FOLDER */ ? this.contextService.getWorkspace().folders[0].name : this.contextService.getWorkspace().folders.map((folder) => folder.name).join(", ");
    quickPick.placeholder = localize(14902, null, `'${workspaceContext}'`);
    quickPick.items = this.createPickItems();
    disposables.add(this.extensionService.onDidChangeExtensions(() => {
      quickPick.items = this.createPickItems();
    }));
    const command4 = await new Promise((resolve3, reject) => {
      disposables.add(quickPick.onDidHide(() => {
        disposables.dispose();
        resolve3(void 0);
      }));
      disposables.add(quickPick.onDidAccept((e) => {
        const selection = quickPick.activeItems[0].command;
        if (selection === installAdditionalContinueOnOptionsCommand.id) {
          void this.commandService.executeCommand(installAdditionalContinueOnOptionsCommand.id);
        } else {
          resolve3(selection);
          quickPick.hide();
        }
      }));
      quickPick.show();
      disposables.add(quickPick.onDidTriggerItemButton(async (e) => {
        if (e.item.documentation !== void 0) {
          const uri5 = URI.isUri(e.item.documentation) ? URI.parse(e.item.documentation) : await this.commandService.executeCommand(e.item.documentation);
          if (uri5) {
            void this.openerService.open(uri5, { openExternal: true });
          }
        }
      }));
    });
    quickPick.dispose();
    return command4;
  }
  async resolveDestination(command4) {
    try {
      const uri5 = await this.commandService.executeCommand(command4);
      if (uri5 === void 0) {
        this.telemetryService.publicLog2("continueOn.openDestination.outcome", { selection: command4, outcome: "noDestinationUri" });
        return "noDestinationUri";
      }
      if (URI.isUri(uri5)) {
        this.telemetryService.publicLog2("continueOn.openDestination.outcome", { selection: command4, outcome: "resolvedUri" });
        return uri5;
      }
      this.telemetryService.publicLog2("continueOn.openDestination.outcome", { selection: command4, outcome: "invalidDestination" });
      return void 0;
    } catch (ex) {
      if (ex instanceof CancellationError) {
        this.telemetryService.publicLog2("continueOn.openDestination.outcome", { selection: command4, outcome: "cancelled" });
      } else {
        this.telemetryService.publicLog2("continueOn.openDestination.outcome", { selection: command4, outcome: "unknownError" });
      }
      return void 0;
    }
  }
  createPickItems() {
    const items = [...this.continueEditSessionOptions].filter((option2) => option2.when === void 0 || this.contextKeyService.contextMatchesRules(option2.when));
    if (getVirtualWorkspaceLocation(this.contextService.getWorkspace()) !== void 0 && isNative) {
      items.push(new ContinueEditSessionItem(
        "$(folder) " + localize(14901, null),
        openLocalFolderCommand.id,
        localize(14900, null)
      ));
    }
    const sortedItems = items.sort((item1, item2) => item1.label.localeCompare(item2.label));
    return sortedItems.concat({ type: "separator" }, new ContinueEditSessionItem(installAdditionalContinueOnOptionsCommand.title, installAdditionalContinueOnOptionsCommand.id));
  }
};

EditSessionsContribution = __decorateClass([
  __decorateParam(0, IEditSessionsStorageService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IProgressService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, ISCMService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IDialogService),
  __decorateParam(8, IEditSessionsLogService),
  __decorateParam(9, IEnvironmentService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IWorkspaceContextService),
  __decorateParam(14, IEditSessionIdentityService),
  __decorateParam(15, IQuickInputService),
  __decorateParam(16, ICommandService),
  __decorateParam(17, IContextKeyService),
  __decorateParam(18, IFileDialogService),
  __decorateParam(19, ILifecycleService),
  __decorateParam(20, IStorageService),
  __decorateParam(21, IActivityService),
  __decorateParam(22, IEditorService),
  __decorateParam(23, IRemoteAgentService),
  __decorateParam(24, IExtensionService),
  __decorateParam(25, IRequestService),
  __decorateParam(26, IUserDataProfilesService),
  __decorateParam(27, IUriIdentityService),
  __decorateParam(28, IWorkspaceIdentityService)
], EditSessionsContribution);

var infoButtonClass = ThemeIcon.asClassName(Codicon.info);

var ContinueEditSessionItem = class {
  constructor(label3, command4, description, when, documentation) {
    this.label = label3;
    this.command = command4;
    this.description = description;
    this.when = when;
    this.documentation = documentation;
    if (documentation !== void 0) {
      this.buttons = [{
        iconClass: infoButtonClass,
        tooltip: localize(14909, null)
      }];
    }
  }
};

var continueEditSessionExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "continueEditSession",
  jsonSchema: {
    description: localize(14893, null),
    type: "array",
    items: {
      type: "object",
      properties: {
        command: {
          description: localize(14894, null),
          type: "string"
        },
        group: {
          description: localize(14896, null),
          type: "string"
        },
        qualifiedName: {
          description: localize(14897, null),
          type: "string"
        },
        description: {
          description: localize(14895, null),
          type: "string"
        },
        remoteGroup: {
          description: localize(14898, null),
          type: "string"
        },
        when: {
          description: localize(14899, null),
          type: "string"
        }
      },
      required: ["command"]
    }
  }
});

var workbenchRegistry6 = Registry.as(Extensions10.Workbench);

workbenchRegistry6.registerWorkbenchContribution(EditSessionsContribution, 3 /* Restored */);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  "properties": {
    "workbench.experimental.cloudChanges.autoStore": {
      enum: ["onShutdown", "off"],
      enumDescriptions: [
        localize(14883, null),
        localize(14882, null)
      ],
      "type": "string",
      "tags": ["experimental", "usesOnlineServices"],
      "default": "off",
      "markdownDescription": localize(14884, null)
    },
    "workbench.cloudChanges.autoResume": {
      enum: ["onReload", "off"],
      enumDescriptions: [
        localize(14880, null),
        localize(14879, null)
      ],
      "type": "string",
      "tags": ["usesOnlineServices"],
      "default": "onReload",
      "markdownDescription": localize(14878, null)
    },
    "workbench.cloudChanges.continueOn": {
      enum: ["prompt", "off"],
      enumDescriptions: [
        localize(14906, null),
        localize(14905, null)
      ],
      type: "string",
      tags: ["usesOnlineServices"],
      default: "prompt",
      markdownDescription: localize(14904, null)
    },
    "workbench.experimental.cloudChanges.partialMatches.enabled": {
      "type": "boolean",
      "tags": ["experimental", "usesOnlineServices"],
      "default": false,
      "markdownDescription": localize(14888, null)
    }
  }
});
export { continueWorkingOnCommand, openLocalFolderCommand, showOutputChannelCommand, installAdditionalContinueOnOptionsCommand, resumeProgressOptionsTitle, resumeProgressOptions, queryParamName, useEditSessionsWithContinueOn, EditSessionsContribution, infoButtonClass, ContinueEditSessionItem, continueEditSessionExtPoint, workbenchRegistry6 };
