// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeAgentSessions/browser/agentSessionsWelcome.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { AgentSessionsWelcomeInputSerializer, AgentSessionsWelcomePage } from "./module-3560.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { AgentSessionsWelcomeInput } from "./module-3559.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IEditorService } from "./module-0934.mjs";
import { AuxiliaryBarMaximizedContext } from "./module-0949.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/welcomeAgentSessions/browser/agentSessionsWelcome.contribution.ts
var agentSessionsWelcomeInputTypeId2 = "workbench.editors.agentSessionsWelcomeInput";

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(agentSessionsWelcomeInputTypeId2, AgentSessionsWelcomeInputSerializer);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    AgentSessionsWelcomePage,
    AgentSessionsWelcomePage.ID,
    localize(21880, null)
  ),
  [
    new SyncDescriptor(AgentSessionsWelcomeInput)
  ]
);

var getWorkspaceKind = (workspaceContextService) => {
  const state = workspaceContextService.getWorkbenchState();
  switch (state) {
    case 1 /* EMPTY */:
      return "empty";
    case 2 /* FOLDER */:
      return "folder";
    case 3 /* WORKSPACE */:
      return "workspace";
    default:
      return "empty";
  }
};

var AgentSessionsWelcomeEditorResolverContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.agentSessionsWelcomeEditorResolver";
  }
  constructor(editorResolverService, instantiationService, workspaceContextService) {
    super();
    this._register(editorResolverService.registerEditor(
      `${AgentSessionsWelcomeInput.RESOURCE.scheme}:${AgentSessionsWelcomeInput.RESOURCE.authority}/**`,
      {
        id: AgentSessionsWelcomePage.ID,
        label: localize(21881, null),
        priority: "builtin" /* builtin */
      },
      {
        singlePerResource: true,
        canSupportResource: (resource) => resource.scheme === AgentSessionsWelcomeInput.RESOURCE.scheme && resource.authority === AgentSessionsWelcomeInput.RESOURCE.authority
      },
      {
        createEditorInput: () => {
          return {
            editor: instantiationService.createInstance(AgentSessionsWelcomeInput, { workspaceKind: getWorkspaceKind(workspaceContextService) })
          };
        }
      }
    ));
  }
};

AgentSessionsWelcomeEditorResolverContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IWorkspaceContextService)
], AgentSessionsWelcomeEditorResolverContribution);

registerAction2(class OpenAgentSessionsWelcomeAction extends Action2 {
  constructor() {
    super({
      id: AgentSessionsWelcomePage.COMMAND_ID,
      title: localize(21882, null),
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const instantiationService = accessor.get(IInstantiationService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const input = instantiationService.createInstance(AgentSessionsWelcomeInput, { initiator: "command", workspaceKind: getWorkspaceKind(workspaceContextService) });
    await editorService.openEditor(input, { pinned: true });
  }
});

var AgentSessionsWelcomeRunnerContribution = class extends Disposable {
  constructor(configurationService, editorService, editorGroupsService, instantiationService, contextKeyService, storageService, workspaceContextService, chatEntitlementService) {
    super();
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.editorGroupsService = editorGroupsService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this.workspaceContextService = workspaceContextService;
    this.chatEntitlementService = chatEntitlementService;
    this.run();
  }
  static {
    this.ID = "workbench.contrib.agentSessionsWelcomeRunner";
  }
  async run() {
    if (this.chatEntitlementService.sentiment.hidden) {
      return;
    }
    const startupEditor = this.configurationService.getValue("workbench.startupEditor");
    if (startupEditor !== "agentSessionsWelcomePage") {
      return;
    }
    await this.editorGroupsService.whenReady;
    if (AuxiliaryBarMaximizedContext.getValue(this.contextKeyService)) {
      return;
    }
    const hasPrefillData = !!this.storageService.get("chat.welcomeViewPrefill", -1 /* APPLICATION */);
    if (this.editorService.activeEditor && !hasPrefillData) {
      return;
    }
    const input = this.instantiationService.createInstance(AgentSessionsWelcomeInput, { initiator: "startup", workspaceKind: getWorkspaceKind(this.workspaceContextService) });
    await this.editorService.openEditor(input, { pinned: false });
  }
};

AgentSessionsWelcomeRunnerContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IEditorGroupsService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IChatEntitlementService)
], AgentSessionsWelcomeRunnerContribution);

registerWorkbenchContribution2(AgentSessionsWelcomeEditorResolverContribution.ID, AgentSessionsWelcomeEditorResolverContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(AgentSessionsWelcomeRunnerContribution.ID, AgentSessionsWelcomeRunnerContribution, WorkbenchPhase.AfterRestored);
export { agentSessionsWelcomeInputTypeId2, getWorkspaceKind, AgentSessionsWelcomeEditorResolverContribution, AgentSessionsWelcomeRunnerContribution };
