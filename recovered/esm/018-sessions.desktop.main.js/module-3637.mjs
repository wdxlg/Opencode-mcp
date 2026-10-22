// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/openSessionLinkOpener.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { AGENT_HOST_CHAT_LINK_PATTERN, AGENT_HOST_SESSION_ONLY_LINK_PATTERN, buildAgentSessionLinkPresentation, parseOpenSessionLinkChatId, parseOpenSessionLinkUri } from "./module-2024.mjs";
import { getSessionSummaryHoverData } from "./module-3521.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IAgentHostConnectionsService } from "./module-0960.mjs";
import { ILinkPresentationService } from "./module-0708.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ISessionSummaryHoverService } from "./module-2248.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { derivedOpts } from "./module-0054.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { localize } from "./module-0001.mjs";
import { isEqual2 } from "./module-0034.mjs";


// src/vs/sessions/contrib/chat/browser/openSessionLinkOpener.contribution.ts
var OpenSessionLinkOpenerContribution = class extends Disposable {
  constructor(openerService, _sessionsManagementService, _sessionsService, _connectionsService, linkPresentationService, sessionsProvidersService, sessionSummaryHoverService, labelService, preferencesService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsService = _sessionsService;
    this._connectionsService = _connectionsService;
    this._register(openerService.registerOpener({
      open: async (resource) => this._open(resource)
    }));
    this._register(linkPresentationService.registerLinkPresentationProvider({
      id: "sessions.agentSessionLinkPresentation",
      uriPattern: AGENT_HOST_SESSION_ONLY_LINK_PATTERN,
      kind: "session"
    }, {
      createLinkPresentationWatcher: (resource) => new AgentSessionLinkPresentationWatcher(resource, "session", this._sessionsManagementService, this._connectionsService)
    }));
    this._register(linkPresentationService.registerLinkPresentationProvider({
      id: "sessions.agentChatLinkPresentation",
      uriPattern: AGENT_HOST_CHAT_LINK_PATTERN,
      kind: "chat"
    }, {
      createLinkPresentationWatcher: (resource) => new AgentSessionLinkPresentationWatcher(resource, "chat", this._sessionsManagementService, this._connectionsService)
    }));
    this._register(sessionSummaryHoverService.registerProvider({
      provideSessionSummaryHoverData: async (resource) => {
        const session = this._findSessionForLink(resource);
        return session ? getSessionSummaryHoverData(session, sessionsProvidersService, openerService, labelService, preferencesService) : void 0;
      }
    }));
  }
  static {
    this.ID = "sessions.openSessionLinkOpener";
  }
  _findSessionForLink(resource) {
    const backendSession = parseOpenSessionLinkUri(resource);
    return backendSession ? findSession(backendSession, this._sessionsManagementService, this._connectionsService) : void 0;
  }
  async _open(resource) {
    const session = this._findSessionForLink(resource);
    if (!session) {
      return false;
    }
    const chatId = parseOpenSessionLinkChatId(resource);
    const chatResource = chatId ? session.resource.with({ fragment: chatId }) : session.mainChat.get().resource;
    await this._sessionsService.openChat(session, chatResource, { source: "link" });
    return true;
  }
};

OpenSessionLinkOpenerContribution = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, ISessionsManagementService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, IAgentHostConnectionsService),
  __decorateParam(4, ILinkPresentationService),
  __decorateParam(5, ISessionsProvidersService),
  __decorateParam(6, ISessionSummaryHoverService),
  __decorateParam(7, ILabelService),
  __decorateParam(8, IPreferencesService)
], OpenSessionLinkOpenerContribution);

var AgentSessionLinkPresentationWatcher = class extends Disposable {
  constructor(resource, kind, sessionsManagementService, connectionsService) {
    super();
    const backendSession = parseOpenSessionLinkUri(resource);
    const chatId = parseOpenSessionLinkChatId(resource);
    const sessionsChanged = observableSignalFromEvent(this, sessionsManagementService.onDidChangeSessions);
    this.presentation = derivedOpts(
      { owner: this, equalsFn: structuralEquals },
      (reader) => {
        sessionsChanged.read(reader);
        const session = backendSession ? findSession(backendSession, sessionsManagementService, connectionsService) : void 0;
        return session ? readSessionState(session, chatId, reader, kind) : void 0;
      }
    );
  }
};

function readSessionState(session, chatId, reader, kind = chatId ? "chat" : "session") {
  const chat = findChat(session, chatId, reader);
  const sessionTitle = session.title.read(reader);
  const description = session.description.read(reader)?.value;
  return buildAgentSessionLinkPresentation(
    chat?.title.read(reader) ?? (chatId ? localize(4500, null, sessionTitle) : sessionTitle),
    description,
    sessionStatusName(chat?.status.read(reader) ?? session.status.read(reader)),
    kind
  );
}

function findSession(backendSession, sessionsManagementService, connectionsService) {
  return sessionsManagementService.getSessions().find((session) => {
    const resolved = connectionsService.resolveSessionResource(session.resource);
    return isEqual2(session.resource, backendSession) || !!resolved && isEqual2(resolved.backendSession, backendSession);
  });
}

function findChat(session, chatId, reader) {
  return chatId ? session.chats.read(reader).find((chat) => chat.resource.fragment === chatId) : void 0;
}

function sessionStatusName(status2) {
  switch (status2) {
    case 0 /* Untitled */:
      return "untitled";
    case 1 /* InProgress */:
      return "inProgress";
    case 2 /* NeedsInput */:
      return "needsInput";
    case 3 /* Completed */:
      return "completed";
    case 4 /* Error */:
      return "error";
  }
}
export { readSessionState, findSession, findChat, sessionStatusName, OpenSessionLinkOpenerContribution, AgentSessionLinkPresentationWatcher };
