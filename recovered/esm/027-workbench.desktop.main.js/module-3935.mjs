// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/agentHost/electron-browser/agentHostService.ts
import { EditorRemoteAgentHostServiceClient } from "./module-3934.mjs";
import { LocalAgentHostServiceClient } from "./module-3932.mjs";
import { agentsWindowAgentHostClientInfo, editorWindowAgentHostClientInfo } from "./module-3929.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { Disposable } from "./module-0012.mjs";
import { ROOT_STATE_URI } from "./module-1007.mjs";
import { CopilotCliVSCodeAssignmentContextKey } from "./module-2104.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { ILogService } from "./module-0095.mjs";
import { autorun } from "./module-0052.mjs";
import { IAgentHostEnablementService } from "./module-0963.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/services/agentHost/electron-browser/agentHostService.ts
var WorkbenchAgentHostService = class {
  constructor(instantiationService, environmentService) {
    const inner = environmentService.remoteAuthority ? instantiationService.createInstance(EditorRemoteAgentHostServiceClient) : instantiationService.createInstance(
      LocalAgentHostServiceClient,
      environmentService.isSessionsWindow ? agentsWindowAgentHostClientInfo : editorWindowAgentHostClientInfo
    );
    return inner;
  }
};

WorkbenchAgentHostService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkbenchEnvironmentService)
], WorkbenchAgentHostService);

var AgentHostPrewarmer = class extends Disposable {
  constructor(agentHostService, assignmentService, logService) {
    super();
    this.agentHostService = agentHostService;
    this.assignmentService = assignmentService;
    this.logService = logService;
    this._assignmentContextRequest = 0;
    this._register(this.agentHostService.onAgentHostStart(() => this.updateAssignmentContext()));
    this._register(this.assignmentService.onDidRefetchAssignments(() => this.updateAssignmentContext()));
    this.agentHostService.startAgentHost();
    this.updateAssignmentContext();
  }
  updateAssignmentContext() {
    void this.doUpdateAssignmentContext().catch((error) => this.logService.error("Failed to forward Agent Host assignment context", error));
  }
  async doUpdateAssignmentContext() {
    const request2 = ++this._assignmentContextRequest;
    const context2 = (await this.assignmentService.getCurrentExperiments())?.join(";") ?? "";
    if (request2 !== this._assignmentContextRequest) {
      return;
    }
    this.agentHostService.dispatch(ROOT_STATE_URI, {
      type: "root/configChanged" /* RootConfigChanged */,
      config: { [CopilotCliVSCodeAssignmentContextKey]: context2 }
    });
  }
};

AgentHostPrewarmer = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, IWorkbenchAssignmentService),
  __decorateParam(2, ILogService)
], AgentHostPrewarmer);

var AgentHostPrewarmContribution = class extends Disposable {
  constructor(agentHostEnablementService, instantiationService, environmentService) {
    super();
    this.instantiationService = instantiationService;
    if (environmentService.remoteAuthority) {
      return;
    }
    this._register(autorun((reader) => {
      if (agentHostEnablementService.enabled.read(reader)) {
        this.start();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.agentHostPrewarm";
  }
  start() {
    this.prewarmer ??= this._register(this.instantiationService.createInstance(AgentHostPrewarmer));
  }
};

AgentHostPrewarmContribution = __decorateClass([
  __decorateParam(0, IAgentHostEnablementService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IWorkbenchEnvironmentService)
], AgentHostPrewarmContribution);

registerSingleton(
  IAgentHostService,
  WorkbenchAgentHostService,
  1 /* Delayed */
);

registerWorkbenchContribution2(AgentHostPrewarmContribution.ID, AgentHostPrewarmContribution, WorkbenchPhase.BlockRestore);
export { WorkbenchAgentHostService, AgentHostPrewarmer, AgentHostPrewarmContribution };
