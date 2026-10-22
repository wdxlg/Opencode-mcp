// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/localAgentHost.contribution.ts
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { LocalAgentHostSessionsProvider } from "./module-4316.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostEnablementService } from "./module-0964.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IAgentHostSessionWorkingDirectoryResolver } from "./module-2101.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { AgentHostContribution } from "./module-4310.mjs";
import { AgentHostTerminalContribution } from "./module-4312.mjs";
import { AgentHostAllowSignedOutWhenUsableContribution } from "./module-4313.mjs";
import { AgentHostSignedOutModelsNotificationContribution } from "./module-4314.mjs";
import { AgentHostSdkSetupNotificationContribution } from "./module-2157.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/localAgentHost.contribution.ts
var LocalAgentHostContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.localAgentHostContribution";
  }
  constructor(agentHostEnablementService, instantiationService, sessionsProvidersService, workingDirectoryResolver) {
    super();
    const registration = this._register(new MutableDisposable());
    const initialize2 = () => {
      if (registration.value) {
        return;
      }
      const store = new DisposableStore();
      const provider = store.add(instantiationService.createInstance(LocalAgentHostSessionsProvider));
      store.add(sessionsProvidersService.registerProvider(provider));
      const resolverRegistrations = store.add(new DisposableMap());
      const registerResolvers = () => {
        const sessionTypeIds = new Set(provider.sessionTypes.map((sessionType) => `agent-host-${sessionType.id}`));
        for (const [sessionTypeId] of resolverRegistrations) {
          if (!sessionTypeIds.has(sessionTypeId)) {
            resolverRegistrations.deleteAndDispose(sessionTypeId);
          }
        }
        for (const sessionType of provider.sessionTypes) {
          const resourceScheme = `agent-host-${sessionType.id}`;
          if (resolverRegistrations.has(resourceScheme)) {
            continue;
          }
          resolverRegistrations.set(resourceScheme, workingDirectoryResolver.registerResolver(resourceScheme, (sessionResource) => {
            return provider.getSessionByResource(sessionResource)?.workspace.get()?.folders[0]?.workingDirectory;
          }, (sessionResource) => {
            return provider.getSessionByResource(sessionResource)?.status.get() === 0 /* Untitled */;
          }));
        }
      };
      registerResolvers();
      store.add(provider.onDidChangeSessionTypes(registerResolvers));
      registration.value = store;
    };
    this._register(autorun((reader) => {
      if (agentHostEnablementService.enabled.read(reader)) {
        initialize2();
      } else {
        registration.clear();
      }
    }));
  }
};

LocalAgentHostContribution = __decorateClass([
  __decorateParam(0, IAgentHostEnablementService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, IAgentHostSessionWorkingDirectoryResolver)
], LocalAgentHostContribution);

registerWorkbenchContribution2(AgentHostContribution.ID, AgentHostContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostTerminalContribution.ID, AgentHostTerminalContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostAllowSignedOutWhenUsableContribution.ID, AgentHostAllowSignedOutWhenUsableContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostSignedOutModelsNotificationContribution.ID, AgentHostSignedOutModelsNotificationContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostSdkSetupNotificationContribution.ID, AgentHostSdkSetupNotificationContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(LocalAgentHostContribution.ID, LocalAgentHostContribution, WorkbenchPhase.AfterRestored);
export { LocalAgentHostContribution };
