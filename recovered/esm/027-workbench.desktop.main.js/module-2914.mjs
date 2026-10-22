// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentSessionSettings.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { AGENT_SESSION_SETTINGS_SCHEME, AgentSessionSettingsFileSystemProvider, AgentSessionSettingsSchemaRegistrar, agentSessionSettingsUri } from "./module-2913.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILabelService } from "./module-0641.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { AGENT_HOST_ENABLED_CONTEXT_KEY } from "./module-0963.mjs";
import { isAgentSession, isMarshalledAgentSessionContext } from "./module-1463.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { toAgentHostBackendSessionUri } from "./module-2074.mjs";
import { IEditorService } from "./module-0934.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentSessionSettings.contribution.ts
var AgentSessionSettingsContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chat.agentSessionSettingsEditor";
  }
  constructor(fileService, instantiationService, labelService) {
    super();
    const schemaRegistrar = this._register(instantiationService.createInstance(AgentSessionSettingsSchemaRegistrar));
    const provider = this._register(instantiationService.createInstance(AgentSessionSettingsFileSystemProvider, schemaRegistrar));
    this._register(fileService.registerProvider(AGENT_SESSION_SETTINGS_SCHEME, provider));
    this._register(labelService.registerFormatter({
      scheme: AGENT_SESSION_SETTINGS_SCHEME,
      formatting: {
        label: localize(9029, null),
        separator: "/"
      }
    }));
  }
};

AgentSessionSettingsContribution = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILabelService)
], AgentSessionSettingsContribution);

registerWorkbenchContribution2(AgentSessionSettingsContribution.ID, AgentSessionSettingsContribution, WorkbenchPhase.AfterRestored);

var LOCAL_AGENT_HOST_SESSION_TYPE_RE2 = /^agent-host-/;

var agentSessionSettingsPrecondition = ContextKeyExpr.and(
  ChatContextKeys.enabled,
  AGENT_HOST_ENABLED_CONTEXT_KEY
);

function resolveSelectedSession(context2) {
  if (isMarshalledAgentSessionContext(context2)) {
    return context2.session;
  }
  if (isAgentSession(context2)) {
    return context2;
  }
  return void 0;
}

registerAction2(class OpenAgentSessionSettingsAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.openAgentSessionSettings",
      title: localize2(9030, "Open Session Settings"),
      menu: [{
        id: MenuId.AgentSessionsContext,
        group: "3_settings",
        order: 2,
        when: ContextKeyExpr.and(
          agentSessionSettingsPrecondition,
          ContextKeyExpr.regex(ChatContextKeys.agentSessionType.key, LOCAL_AGENT_HOST_SESSION_TYPE_RE2)
        )
      }]
    });
  }
  async run(accessor, context2) {
    const session = resolveSelectedSession(context2);
    if (!session) {
      return;
    }
    const backendSession = toAgentHostBackendSessionUri(session.resource);
    if (!backendSession) {
      return;
    }
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({ resource: agentSessionSettingsUri(backendSession), options: { pinned: true } });
  }
});
export { resolveSelectedSession, AgentSessionSettingsContribution, LOCAL_AGENT_HOST_SESSION_TYPE_RE2, agentSessionSettingsPrecondition };
