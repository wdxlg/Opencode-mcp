// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSettings.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { AGENT_HOST_SETTINGS_SCHEME, AgentHostSettingsFileSystemProvider, AgentHostSettingsSchemaRegistrar, agentHostSettingsUri } from "./module-2911.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILabelService } from "./module-0641.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { AGENT_HOST_ENABLED_CONTEXT_KEY } from "./module-0963.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IEditorService } from "./module-0934.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSettings.contribution.ts
var AgentHostSettingsContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chat.agentHostSettingsEditor";
  }
  constructor(fileService, instantiationService, labelService) {
    super();
    const schemaRegistrar = this._register(instantiationService.createInstance(AgentHostSettingsSchemaRegistrar));
    const provider = this._register(instantiationService.createInstance(AgentHostSettingsFileSystemProvider, schemaRegistrar));
    this._register(fileService.registerProvider(AGENT_HOST_SETTINGS_SCHEME, provider));
    this._register(labelService.registerFormatter({
      scheme: AGENT_HOST_SETTINGS_SCHEME,
      formatting: {
        label: localize(9018, null),
        separator: "/"
      }
    }));
  }
};

AgentHostSettingsContribution = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILabelService)
], AgentHostSettingsContribution);

registerWorkbenchContribution2(AgentHostSettingsContribution.ID, AgentHostSettingsContribution, WorkbenchPhase.AfterRestored);

var LOCAL_AGENT_HOST_SESSION_TYPE_RE = /^agent-host-/;

var agentHostSettingsPrecondition = ContextKeyExpr.and(
  ChatContextKeys.enabled,
  AGENT_HOST_ENABLED_CONTEXT_KEY
);

registerAction2(class OpenAgentHostSettingsAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.openAgentHostSettings",
      title: localize2(9019, "Open Host Settings"),
      f1: true,
      precondition: agentHostSettingsPrecondition,
      menu: [{
        id: MenuId.AgentSessionsContext,
        group: "3_settings",
        order: 1,
        when: ContextKeyExpr.and(
          agentHostSettingsPrecondition,
          ContextKeyExpr.regex(ChatContextKeys.agentSessionType.key, LOCAL_AGENT_HOST_SESSION_TYPE_RE)
        )
      }]
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({ resource: agentHostSettingsUri(), options: { pinned: true } });
  }
});
export { AgentHostSettingsContribution, LOCAL_AGENT_HOST_SESSION_TYPE_RE, agentHostSettingsPrecondition };
