// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/actions/profileAgentHostAction.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { Schemas } from "./module-0033.mjs";
import { joinPath } from "./module-0034.mjs";
import { IV8InspectProfilingService, Utils } from "./module-3886.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { ILogService } from "./module-0095.mjs";
import { Action2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { AGENT_HOST_ENABLED_CONTEXT_KEY } from "./module-0963.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/electron-browser/actions/profileAgentHostAction.ts
var CONTEXT_AGENT_HOST_PROFILE_STATE = new RawContextKey("agentHostProfileState", "none" /* None */);

var IAgentHostProfileService = createDecorator("agentHostProfileService");

var AgentHostProfileService = class extends Disposable {
  constructor(agentHostService, profilingService, contextKeyService, statusbarService, fileDialogService, fileService, editorService, environmentService, notificationService, logService) {
    super();
    this.agentHostService = agentHostService;
    this.profilingService = profilingService;
    this.contextKeyService = contextKeyService;
    this.statusbarService = statusbarService;
    this.fileDialogService = fileDialogService;
    this.fileService = fileService;
    this.editorService = editorService;
    this.environmentService = environmentService;
    this.notificationService = notificationService;
    this.logService = logService;
    this.statusbarEntry = this._register(new MutableDisposable());
    this.profilingNotification = this._register(new MutableDisposable());
    this.isDisposed = false;
    this.profileState = CONTEXT_AGENT_HOST_PROFILE_STATE.bindTo(contextKeyService);
    this._register(toDisposable(() => {
      this.isDisposed = true;
      const sessionId = this.sessionId;
      this.sessionId = void 0;
      this.profileState.set("none" /* None */);
      if (sessionId) {
        void this.profilingService.stopProfiling(sessionId).catch((error) => {
          this.logService.error("Failed to stop the agent host profiling session during disposal", error);
        });
      }
    }));
  }
  startProfiling() {
    if (this.startPromise) {
      return this.startPromise;
    }
    if (this.sessionId) {
      return Promise.resolve();
    }
    this.profileState.set("starting" /* Starting */);
    this.startPromise = this.doStartProfiling().finally(() => this.startPromise = void 0);
    return this.startPromise;
  }
  async doStartProfiling() {
    try {
      const inspectInfo = await this.agentHostService.getInspectInfo(true);
      if (this.isDisposed) {
        return;
      }
      if (!inspectInfo) {
        this.notificationService.warn(localize(13529, null));
        this.profileState.set("none" /* None */);
        return;
      }
      const sessionId = await this.profilingService.startProfiling({ host: inspectInfo.host, port: inspectInfo.port });
      if (this.isDisposed) {
        try {
          await this.profilingService.stopProfiling(sessionId);
        } catch (error) {
          this.logService.error("Failed to stop the agent host profiling session during disposal", error);
        }
        return;
      }
      this.sessionId = sessionId;
      this.profileState.set("running" /* Running */);
      this.statusbarEntry.value = this.statusbarService.addEntry({
        name: localize(13535, null),
        text: localize(13536, null),
        ariaLabel: localize(13534, null),
        tooltip: localize(13537, null),
        command: StopAgentHostProfileAction.ID,
        showProgress: true
      }, "status.agentHostProfiler", 1 /* RIGHT */);
      if (this.contextKeyService.contextMatchesRules(IsSessionsWindowContext)) {
        const handle2 = this.notificationService.prompt(
          Severity2.Info,
          localize(13530, null),
          [{
            label: localize(13538, null),
            run: () => void this.stopProfiling()
          }],
          {
            sticky: true,
            onCancel: () => void this.stopProfiling()
          }
        );
        this.profilingNotification.value = toDisposable(() => handle2.close());
      }
    } catch (error) {
      const sessionId = this.sessionId;
      this.sessionId = void 0;
      this.statusbarEntry.clear();
      this.profilingNotification.clear();
      if (sessionId) {
        try {
          await this.profilingService.stopProfiling(sessionId);
        } catch (stopError) {
          this.logService.error("Failed to clean up the agent host profiling session", stopError);
        }
      }
      if (this.isDisposed) {
        this.logService.error("Failed to start profiling the agent host during disposal", error);
        return;
      }
      this.profileState.set("none" /* None */);
      this.notificationService.error(localize(13533, null, getErrorMessage(error)));
    }
  }
  async stopProfiling() {
    const sessionId = this.sessionId;
    if (!sessionId) {
      return;
    }
    this.sessionId = void 0;
    this.profileState.set("stopping" /* Stopping */);
    this.statusbarEntry.clear();
    this.profilingNotification.clear();
    let profile;
    try {
      profile = await this.profilingService.stopProfiling(sessionId);
    } catch (error) {
      this.profileState.set("none" /* None */);
      this.notificationService.error(localize(13539, null, getErrorMessage(error)));
      return;
    }
    if (this.isDisposed) {
      return;
    }
    try {
      const profileUri = await this.saveProfile(profile);
      if (profileUri) {
        const editor = {
          resource: profileUri,
          options: {
            revealIfOpened: true,
            override: "jsProfileVisualizer.cpuprofile.table"
          }
        };
        if (this.contextKeyService.contextMatchesRules(IsSessionsWindowContext)) {
          await this.editorService.openEditor(editor);
        } else {
          await this.editorService.openEditor(editor, SIDE_GROUP);
        }
      }
    } catch (error) {
      this.notificationService.error(localize(13532, null, getErrorMessage(error)));
    } finally {
      this.profileState.set("none" /* None */);
    }
  }
  async saveProfile(profile) {
    let profileUri = await this.fileDialogService.showSaveDialog({
      title: localize(13531, null),
      availableFileSystems: [Schemas.file],
      defaultUri: joinPath(await this.fileDialogService.defaultFilePath(), `AgentHost-CPU-${(/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "")}.cpuprofile`),
      filters: [{
        name: localize(13528, null),
        extensions: ["cpuprofile", "txt"]
      }]
    });
    if (!profileUri) {
      return void 0;
    }
    let dataToWrite = profile;
    if (this.environmentService.isBuilt) {
      dataToWrite = Utils.rewriteAbsolutePaths(dataToWrite, "piiRemoved");
      profileUri = URI.file(`${profileUri.fsPath}.txt`);
    }
    await this.fileService.writeFile(profileUri, VSBuffer.fromString(JSON.stringify(dataToWrite, void 0, "	")));
    return profileUri;
  }
};

AgentHostProfileService = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, IV8InspectProfilingService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IStatusbarService),
  __decorateParam(4, IFileDialogService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IWorkbenchEnvironmentService),
  __decorateParam(8, INotificationService),
  __decorateParam(9, ILogService)
], AgentHostProfileService);

var ProfileAgentHostAction = class _ProfileAgentHostAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.profileAgentHost";
  }
  constructor() {
    super({
      id: _ProfileAgentHostAction.ID,
      title: localize2(13527, "Profile Local Agent Host Process"),
      category: Categories.Developer,
      f1: true,
      icon: Codicon.circleFilled,
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.or(
          IsSessionsWindowContext,
          ContextKeyExpr.and(
            ChatContextKeys.enabled,
            AGENT_HOST_ENABLED_CONTEXT_KEY
          )
        ),
        CONTEXT_AGENT_HOST_PROFILE_STATE.notEqualsTo("starting" /* Starting */),
        CONTEXT_AGENT_HOST_PROFILE_STATE.notEqualsTo("running" /* Running */),
        CONTEXT_AGENT_HOST_PROFILE_STATE.notEqualsTo("stopping" /* Stopping */)
      )
    });
  }
  run(accessor) {
    return accessor.get(IAgentHostProfileService).startProfiling();
  }
};

var StopAgentHostProfileAction = class _StopAgentHostProfileAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.stopAgentHostProfile";
  }
  constructor() {
    super({
      id: _StopAgentHostProfileAction.ID,
      title: localize2(13540, "Stop Local Agent Host Profile"),
      category: Categories.Developer,
      f1: true,
      icon: Codicon.debugStop,
      precondition: CONTEXT_AGENT_HOST_PROFILE_STATE.isEqualTo("running" /* Running */)
    });
  }
  run(accessor) {
    return accessor.get(IAgentHostProfileService).stopProfiling();
  }
};

registerSingleton(IAgentHostProfileService, AgentHostProfileService, 1 /* Delayed */);
export { CONTEXT_AGENT_HOST_PROFILE_STATE, IAgentHostProfileService, AgentHostProfileService, ProfileAgentHostAction, StopAgentHostProfileAction };
