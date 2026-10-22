// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentSessionSettings.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { AGENT_SESSION_SETTINGS_SCHEME, AgentSessionSettingsFileSystemProvider, AgentSessionSettingsSchemaRegistrar, agentSessionSettingsUri } from "./module-4325.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILabelService } from "./module-0641.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { SessionItemContextMenuId } from "./module-3523.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { SessionProviderIdContext } from "./module-1770.mjs";
import { ANY_AGENT_HOST_PROVIDER_RE } from "./module-1764.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentSessionSettings.contribution.ts
var AgentSessionSettingsContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.agentSessionSettingsContribution";
  }
  constructor(fileService, instantiationService, labelService) {
    super();
    const schemaRegistrar = this._register(instantiationService.createInstance(AgentSessionSettingsSchemaRegistrar));
    const provider = this._register(instantiationService.createInstance(AgentSessionSettingsFileSystemProvider, schemaRegistrar));
    this._register(fileService.registerProvider(AGENT_SESSION_SETTINGS_SCHEME, provider));
    this._register(labelService.registerFormatter({
      scheme: AGENT_SESSION_SETTINGS_SCHEME,
      formatting: {
        label: localize(5003, null),
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

registerAction2(class OpenSessionSettingsAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.openSessionSettings",
      title: localize2(5004, "Open Session Settings"),
      menu: [{
        id: SessionItemContextMenuId,
        group: "2_settings",
        order: 1,
        when: ContextKeyExpr.regex(SessionProviderIdContext.key, ANY_AGENT_HOST_PROVIDER_RE)
      }]
    });
  }
  async run(accessor, context2) {
    const session = Array.isArray(context2) ? context2[0] : context2;
    if (!session) {
      return;
    }
    const editorService = accessor.get(IEditorService);
    const resource = agentSessionSettingsUri(session);
    await editorService.openEditor({ resource, options: { pinned: true } });
  }
});
export { AgentSessionSettingsContribution };
