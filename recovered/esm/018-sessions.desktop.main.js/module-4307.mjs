// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/electron-browser/chat.contribution.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { isAgentsWindowOpenSource } from "./module-0515.mjs";
import { ipcRenderer } from "./module-3821.mjs";
import { TOTAL_SESSIONS_KEY } from "./module-3613.mjs";
import { SessionsWindowOpenTelemetry, SessionsWindowSessionStartTelemetry } from "./module-4306.mjs";
import { SessionsViewId } from "./module-3529.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { ISessionsSetUpService } from "./module-1802.mjs";
import { ILogService } from "./module-0095.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INewSessionComposerService } from "./module-3561.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { SessionsCopilotConfigSlashSubmitHandlerContribution } from "./module-4305.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IAgentHostByokLmHandler } from "./module-4229.mjs";
import { AgentHostByokLmHandler } from "./module-4302.mjs";


// src/vs/sessions/contrib/chat/electron-browser/chat.contribution.ts
var SelectAgentsFolderContribution = class extends Disposable {
  constructor(sessionsManagementService, sessionsService, sessionsProvidersService, viewsService, lifecycleService, sessionsSetUpService, logService, sessionsPartService, storageService, telemetryService, newSessionComposerService) {
    super();
    this.sessionsManagementService = sessionsManagementService;
    this.sessionsService = sessionsService;
    this.sessionsProvidersService = sessionsProvidersService;
    this.viewsService = viewsService;
    this.lifecycleService = lifecycleService;
    this.sessionsSetUpService = sessionsSetUpService;
    this.logService = logService;
    this.sessionsPartService = sessionsPartService;
    this.storageService = storageService;
    this.telemetryService = telemetryService;
    this.newSessionComposerService = newSessionComposerService;
    this._windowOpenTelemetry = this._register(new MutableDisposable());
    this._didHandleInitialWindowOpen = false;
    const handleSelectAgentsFolder = (_, ...args2) => {
      const folderUri = args2[0] ? URI.revive(args2[0]) : void 0;
      const sessionResource = args2[1] ? URI.revive(args2[1]) : void 0;
      const source = isAgentsWindowOpenSource(args2[2]) ? args2[2] : "unknown" /* Unknown */;
      this.logService.info(`[AgentsHandoff] IPC received: folderUri=${folderUri?.toString() ?? "(none)"} sessionResource=${sessionResource?.toString() ?? "(none)"}`);
      this._startWindowOpenTelemetry(source);
      this._handleOpenIntentAndCaptureInitialState(folderUri, sessionResource).catch((err) => this.logService.error("[AgentsHandoff] handleOpenIntent failed", err));
    };
    ipcRenderer.on("vscode:selectAgentsFolder", handleSelectAgentsFolder);
    this._register({ dispose: () => ipcRenderer.removeListener("vscode:selectAgentsFolder", handleSelectAgentsFolder) });
  }
  static {
    this.ID = "sessions.selectAgentsFolder";
  }
  _startWindowOpenTelemetry(source) {
    if (this._didHandleInitialWindowOpen) {
      return;
    }
    this._didHandleInitialWindowOpen = true;
    const hasPreviouslyStartedSession = this.storageService.getNumber(TOTAL_SESSIONS_KEY, -1 /* APPLICATION */, 0) !== 0;
    new SessionsWindowSessionStartTelemetry(source, hasPreviouslyStartedSession, this.telemetryService);
    if (hasPreviouslyStartedSession) {
      return;
    }
    this._windowOpenTelemetry.value = new SessionsWindowOpenTelemetry(
      source,
      () => this.sessionsSetUpService.initialSignInDialogShown,
      () => this._getWindowOpenViewState(),
      this.telemetryService,
      this.lifecycleService
    );
  }
  async _captureInitialWindowViewState() {
    await this.lifecycleService.when(4 /* Eventually */);
    this._windowOpenTelemetry.value?.captureInitialViewState();
  }
  async _handleOpenIntentAndCaptureInitialState(folderUri, sessionResource) {
    try {
      await this.handleOpenIntent(folderUri, sessionResource);
    } finally {
      await this._captureInitialWindowViewState();
    }
  }
  _getWindowOpenViewState() {
    const activeSession = this.sessionsService.activeSession.get();
    const isNewSessionView = !activeSession || !activeSession.isCreated.get();
    if (!isNewSessionView) {
      return {
        workspacePreselected: void 0,
        workspacePreselectionSource: void 0
      };
    }
    const composerSource = this.newSessionComposerService.activeComposer.get()?.workspacePreselectionSource;
    const workspacePreselected = activeSession?.workspace.get() !== void 0 || composerSource !== void 0 && composerSource !== "none" /* None */;
    return {
      workspacePreselected,
      workspacePreselectionSource: composerSource ?? (workspacePreselected ? "unknown" /* Unknown */ : "none" /* None */)
    };
  }
  async handleOpenIntent(folderUri, sessionResource) {
    if (sessionResource) {
      await this.openExistingSession(sessionResource);
      return;
    }
    if (folderUri) {
      await this.selectFolder(folderUri);
    }
  }
  async openExistingSession(sessionResource) {
    this.logService.info(`[AgentsHandoff] openExistingSession: target=${sessionResource.toString()}`);
    await this.lifecycleService.when(4 /* Eventually */);
    this.logService.info("[AgentsHandoff] reached LifecyclePhase.Eventually");
    const current = this.sessionsService.activeSession.get();
    if (current && current.resource.toString() === sessionResource.toString()) {
      this.logService.info("[AgentsHandoff] already on target session");
      return;
    }
    await this.sessionsPartService.getProgressIndicator().showWhile(this.resolveAndOpenSession(sessionResource));
  }
  async resolveAndOpenSession(sessionResource) {
    const found = await this.waitForSessionAvailable(sessionResource);
    if (!found) {
      this.logService.warn(`[AgentsHandoff] target session never appeared in providers; aborting`);
      return;
    }
    this.logService.info("[AgentsHandoff] target session available; opening");
    await this.sessionsService.openSession(sessionResource, { source: "chat" });
  }
  async waitForSessionAvailable(sessionResource, timeoutMs = 15e3) {
    if (this.sessionsManagementService.getSession(sessionResource)) {
      return true;
    }
    return new Promise((resolve3) => {
      const store = new DisposableStore();
      const done = (result) => {
        store.dispose();
        resolve3(result);
      };
      const timer = setTimeout(() => done(!!this.sessionsManagementService.getSession(sessionResource)), timeoutMs);
      store.add({ dispose: () => clearTimeout(timer) });
      store.add(this.sessionsManagementService.onDidChangeSessions(() => {
        if (this.sessionsManagementService.getSession(sessionResource)) {
          done(true);
        }
      }));
    });
  }
  async selectFolder(folderUri) {
    await this.sessionsSetUpService.whenWelcomeDone();
    this.sessionsService.openNewSession();
    const sessionsView = this.viewsService.getViewWithId(SessionsViewId);
    sessionsView?.sessionsControl?.setOpenWindowSourceFolder(folderUri);
    if (this.tryResolveAndSelect(folderUri)) {
      return;
    }
    const disposable = this.sessionsProvidersService.onDidChangeProviders(() => {
      if (this.tryResolveAndSelect(folderUri)) {
        disposable.dispose();
      }
    });
    this.lifecycleService.when(4 /* Eventually */).then(() => disposable.dispose());
  }
  tryResolveAndSelect(folderUri) {
    const resolved = this.sessionsManagementService.resolveWorkspace(folderUri);
    if (!resolved) {
      return false;
    }
    const activeSession = this.sessionsService.activeSession.get();
    if (activeSession === void 0 || activeSession.status.get() === 0 /* Untitled */) {
      this.sessionsPartService.getSessionView(activeSession?.sessionId)?.selectWorkspace(folderUri, resolved.providerId);
    }
    return true;
  }
};

SelectAgentsFolderContribution = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, IViewsService),
  __decorateParam(4, ILifecycleService),
  __decorateParam(5, ISessionsSetUpService),
  __decorateParam(6, ILogService),
  __decorateParam(7, ISessionsPartService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, INewSessionComposerService)
], SelectAgentsFolderContribution);

registerWorkbenchContribution2(SelectAgentsFolderContribution.ID, SelectAgentsFolderContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(SessionsCopilotConfigSlashSubmitHandlerContribution.ID, SessionsCopilotConfigSlashSubmitHandlerContribution, WorkbenchPhase.AfterRestored);

registerSingleton(IAgentHostByokLmHandler, AgentHostByokLmHandler, 1 /* Delayed */);
export { SelectAgentsFolderContribution };
