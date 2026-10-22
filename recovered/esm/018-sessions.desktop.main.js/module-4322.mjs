// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/electron-browser/localAgentHostLifecycle.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { LOCAL_AGENT_HOST_PROVIDER_ID } from "./module-1764.mjs";
import { isActiveSessionStatus } from "./module-1767.mjs";
import { confirmSessionShutdown, getEffectiveSessionShutdownReason } from "./module-4321.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/providers/agentHost/electron-browser/localAgentHostLifecycle.contribution.ts
var LocalAgentHostLifecycleContribution = class extends Disposable {
  constructor(lifecycleService, sessionsProvidersService, sessionsManagementService, dialogService, contextKeyService, nativeHostService, environmentService, chatEntitlementService) {
    super();
    this.sessionsProvidersService = sessionsProvidersService;
    this.sessionsManagementService = sessionsManagementService;
    this.dialogService = dialogService;
    this.contextKeyService = contextKeyService;
    this.nativeHostService = nativeHostService;
    this.environmentService = environmentService;
    this.chatEntitlementService = chatEntitlementService;
    this._register(lifecycleService.onBeforeShutdown((event) => {
      event.veto(this.shouldVetoShutdown(event.reason), "veto.sessions.localAgentHost");
    }));
  }
  static {
    this.ID = "sessions.contrib.localAgentHostLifecycle";
  }
  hasActiveSession() {
    if (this.sessionsManagementService.getInFlightNewSessionRequests().some((session) => session.providerId === LOCAL_AGENT_HOST_PROVIDER_ID)) {
      return true;
    }
    const provider = this.sessionsProvidersService.getProvider(LOCAL_AGENT_HOST_PROVIDER_ID);
    return provider?.getSessions().some((session) => !session.isArchived.get() && isActiveSessionStatus(session.status.get())) === true;
  }
  async shouldVetoShutdown(reason) {
    if (this.environmentService.enableSmokeTestDriver || this.chatEntitlementService.sentiment.hidden) {
      return false;
    }
    const windowCount = reason === 1 /* CLOSE */ ? await this.nativeHostService.getWindowCount() : 0;
    const effectiveReason = getEffectiveSessionShutdownReason(reason, windowCount, isMacintosh);
    if (effectiveReason !== 2 /* QUIT */ || !this.hasActiveSession()) {
      return false;
    }
    if (ChatContextKeys.skipChatRequestInProgressMessage.getValue(this.contextKeyService) === true) {
      return false;
    }
    return !await confirmSessionShutdown(this.dialogService, effectiveReason);
  }
};

LocalAgentHostLifecycleContribution = __decorateClass([
  __decorateParam(0, ILifecycleService),
  __decorateParam(1, ISessionsProvidersService),
  __decorateParam(2, ISessionsManagementService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, INativeHostService),
  __decorateParam(6, INativeWorkbenchEnvironmentService),
  __decorateParam(7, IChatEntitlementService)
], LocalAgentHostLifecycleContribution);

registerWorkbenchContribution2(LocalAgentHostLifecycleContribution.ID, LocalAgentHostLifecycleContribution, WorkbenchPhase.AfterRestored);
export { LocalAgentHostLifecycleContribution };
