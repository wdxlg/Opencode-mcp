// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/openSessionLinkOpener.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { AGENT_HOST_SESSION_LINK_PATTERN, AGENT_HOST_SESSION_LINK_SCHEME, buildAgentSessionLinkPresentation, parseOpenSessionLinkUri } from "./module-2029.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { ChatViewPaneTarget, IChatWidgetService } from "./module-0981.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IChatSessionsService } from "./module-0960.mjs";
import { IChatRequestOriginService } from "./module-1189.mjs";
import { ILinkPresentationService } from "./module-0708.mjs";
import { ILogService } from "./module-0095.mjs";
import { ISessionSummaryHoverService } from "./module-2273.mjs";
import { IPathService } from "./module-0938.mjs";
import { observableValueOpts } from "./module-0050.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { Event2 } from "./module-0017.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { AgentSession } from "./module-1106.mjs";
import { URI } from "./module-0032.mjs";
import { LOCAL_AGENT_HOST_SCHEME_PREFIX } from "./module-0959.mjs";
import { getAgentChangesSummary } from "./module-1463.mjs";
import { tildify } from "./module-0711.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/openSessionLinkOpener.contribution.ts
var AgentHostOpenSessionLinkOpenerContribution = class extends Disposable {
  constructor(openerService, _chatWidgetService, _chatSessionsService, requestOriginService, linkPresentationService, logService, sessionSummaryHoverService, pathService) {
    super();
    this._chatWidgetService = _chatWidgetService;
    this._chatSessionsService = _chatSessionsService;
    this._register(openerService.registerOpener({
      open: async (resource) => this._open(resource)
    }));
    this._register(requestOriginService.registerOpener({
      open: async (origin) => origin.sourceSessionResource.scheme === AGENT_HOST_SESSION_LINK_SCHEME ? this._open(origin.sourceSessionResource) : false
    }));
    this._register(linkPresentationService.registerLinkPresentationProvider({
      id: "workbench.agentSessionLinkPresentation",
      uriPattern: AGENT_HOST_SESSION_LINK_PATTERN,
      kind: "session"
    }, {
      createLinkPresentationWatcher: (resource) => {
        const clientResource = toClientSessionResource(resource);
        if (!clientResource) {
          throw new Error(`Invalid agent session link: ${resource.toString(true)}`);
        }
        return new WorkbenchAgentSessionLinkPresentationWatcher(clientResource, this._chatSessionsService, logService);
      }
    }));
    this._register(sessionSummaryHoverService.registerProvider({
      provideSessionSummaryHoverData: async (resource, token) => {
        const item = await this._findChatSessionItem(resource, token);
        return item ? toSessionSummaryHoverData(item, pathService.userHome({ preferLocal: true }).fsPath) : void 0;
      }
    }));
  }
  static {
    this.ID = "workbench.chat.agentHostOpenSessionLinkOpener";
  }
  async _findChatSessionItem(resource, token) {
    const clientResource = toClientSessionResource(resource);
    if (!clientResource) {
      return void 0;
    }
    const chatSessionType = getChatSessionType(clientResource);
    await this._chatSessionsService.activateChatSessionItemProvider(chatSessionType);
    return findChatSessionItem(this._chatSessionsService, chatSessionType, clientResource, token);
  }
  async _open(resource) {
    const clientResource = toClientSessionResource(resource);
    if (!clientResource) {
      return false;
    }
    await this._chatSessionsService.activateChatSessionItemProvider(getChatSessionType(clientResource));
    const widget = await this._chatWidgetService.openSession(clientResource, ChatViewPaneTarget, { revealIfOpened: true });
    return !!widget;
  }
};

AgentHostOpenSessionLinkOpenerContribution = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, IChatSessionsService),
  __decorateParam(3, IChatRequestOriginService),
  __decorateParam(4, ILinkPresentationService),
  __decorateParam(5, ILogService),
  __decorateParam(6, ISessionSummaryHoverService),
  __decorateParam(7, IPathService)
], AgentHostOpenSessionLinkOpenerContribution);

var WorkbenchAgentSessionLinkPresentationWatcher = class extends Disposable {
  constructor(clientResource, _chatSessionsService, _logService) {
    super();
    this._chatSessionsService = _chatSessionsService;
    this._logService = _logService;
    this._data = observableValueOpts(
      { owner: this, equalsFn: structuralEquals },
      void 0
    );
    this.presentation = this._data;
    this._clientResource = clientResource;
    this._chatSessionType = getChatSessionType(this._clientResource);
    this._providerReady = this._chatSessionsService.activateChatSessionItemProvider(this._chatSessionType);
    this._register(Event2.any(
      this._chatSessionsService.onDidChangeAvailability,
      this._chatSessionsService.onDidChangeInProgress,
      this._chatSessionsService.onDidChangeItemsProviders,
      this._chatSessionsService.onDidChangeSessionItems
    )(() => this._refresh()));
    this._refresh();
  }
  dispose() {
    this._refreshCancellation?.cancel();
    this._refreshCancellation?.dispose();
    this._refreshCancellation = void 0;
    super.dispose();
  }
  _refresh() {
    this._refreshCancellation?.cancel();
    this._refreshCancellation?.dispose();
    const cancellation = new CancellationTokenSource();
    this._refreshCancellation = cancellation;
    void this._resolve(cancellation.token).then((data) => {
      if (!cancellation.token.isCancellationRequested && this._refreshCancellation === cancellation) {
        this._data.set(data, void 0);
      }
    }, (error) => {
      if (!isCancellationError(error) && !cancellation.token.isCancellationRequested) {
        this._logService.error("Failed to refresh agent session link presentation", error);
      }
    });
  }
  async _resolve(token) {
    await this._providerReady;
    const item = await findChatSessionItem(this._chatSessionsService, this._chatSessionType, this._clientResource, token);
    return item ? toSessionLinkPresentation(item) : void 0;
  }
};

async function findChatSessionItem(chatSessionsService, chatSessionType, clientResource, token) {
  for await (const group2 of chatSessionsService.getChatSessionItems([chatSessionType], token)) {
    const item = group2.items.find((candidate) => isEqual2(candidate.resource, clientResource) || !!candidate.legacyResource && isEqual2(candidate.legacyResource, clientResource));
    if (item) {
      return item;
    }
  }
  return void 0;
}

function toClientSessionResource(resource) {
  const backendSession = parseOpenSessionLinkUri(resource);
  if (!backendSession) {
    return void 0;
  }
  const provider = AgentSession.provider(backendSession);
  const rawId = AgentSession.id(backendSession);
  return provider && rawId ? URI.from({ scheme: `${LOCAL_AGENT_HOST_SCHEME_PREFIX}${provider}`, path: `/${rawId}` }) : void 0;
}

function toSessionLinkPresentation(item) {
  const description = typeof item.description === "string" ? item.description : item.description?.value;
  return buildAgentSessionLinkPresentation(item.label, description, chatSessionStatusName(item.status));
}

function toSessionSummaryHoverData(item, userHome) {
  const metadata = item.metadata;
  const changes = getAgentChangesSummary(item.changes);
  const workspace = metadata?.repositoryPath ?? metadata?.workingDirectoryPath;
  return {
    title: item.label,
    location: {
      workspace: workspace ? tildify(workspace, userHome) : void 0,
      worktree: metadata?.worktreePath ? tildify(metadata.worktreePath, userHome) : void 0,
      branch: metadata?.branchName ?? metadata?.branch,
      changes: changes && (changes.insertions > 0 || changes.deletions > 0) ? changes : void 0
    }
  };
}

function chatSessionStatusName(status2) {
  switch (status2) {
    case 0 /* Failed */:
      return "error";
    case 2 /* InProgress */:
      return "inProgress";
    case 3 /* NeedsInput */:
      return "needsInput";
    case 1 /* Completed */:
    case void 0:
      return "completed";
  }
}
export { findChatSessionItem, toClientSessionResource, toSessionLinkPresentation, toSessionSummaryHoverData, chatSessionStatusName, AgentHostOpenSessionLinkOpenerContribution, WorkbenchAgentSessionLinkPresentationWatcher };
