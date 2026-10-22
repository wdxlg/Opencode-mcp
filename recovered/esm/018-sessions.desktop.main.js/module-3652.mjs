// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sideChatProvider.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { createAndSendSideChat } from "./module-3629.mjs";
import { derived } from "./module-0054.mjs";
import { Event2 } from "./module-0017.mjs";
import { raceTimeout } from "./module-0036.mjs";
import { isRequestVM } from "./module-0979.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSideChatService } from "./module-2292.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/chat/browser/sideChatProvider.contribution.ts
var SIDE_CHAT_SOURCE_REVEAL_TIMEOUT = 2e3;

var SessionsSideChatProviderContribution = class extends Disposable {
  constructor(sideChatService, sessionsManagementService, sessionsService, sessionsPartService, chatService, chatWidgetService, uriIdentityService, environmentService) {
    super();
    this.sessionsManagementService = sessionsManagementService;
    this.sessionsService = sessionsService;
    this.sessionsPartService = sessionsPartService;
    this.chatService = chatService;
    this.chatWidgetService = chatWidgetService;
    this.uriIdentityService = uriIdentityService;
    // Cached observables avoid recreating deriveds for every rendered chat row.
    this._sideChatOrigins = new ResourceMap();
    this._isSessionsWindow = environmentService.isSessionsWindow;
    if (!this._isSessionsWindow) {
      return;
    }
    this._register(sideChatService.registerProvider(this));
  }
  static {
    this.ID = "sessions.contrib.sideChatProvider";
  }
  canAskInSideChat(sessionResource) {
    return !!this._resolveSource(sessionResource);
  }
  async askInSideChat(sessionResource, query, selection) {
    const source = this._resolveSource(sessionResource);
    if (!source) {
      throw new Error(`Side chats are not supported for ${sessionResource.toString()}`);
    }
    const { session, chatResource, turnId } = source;
    await createAndSendSideChat(this.sessionsManagementService, this.sessionsService, this.sessionsPartService, session, chatResource, turnId, { query }, selection);
  }
  /** Observes the source metadata for a side chat. */
  observeSideChatOrigin(sessionResource) {
    let sideChatOrigin = this._sideChatOrigins.get(sessionResource);
    if (!sideChatOrigin) {
      sideChatOrigin = derived(this, (reader) => {
        if (!this._isSessionsWindow) {
          return void 0;
        }
        const resolved = this._resolveSessionChat(sessionResource, reader);
        const origin = resolved?.chat.origin;
        if (!resolved || origin?.kind !== "sideChat" /* SideChat */ || !origin.parentChat || !origin.turnId) {
          return void 0;
        }
        const sourceChat = resolved.session.chats.read(reader).find((chat) => this.uriIdentityService.extUri.isEqual(chat.resource, origin.parentChat));
        return {
          sourceSessionResource: origin.parentChat,
          sourceTurnId: origin.turnId,
          sourceTitle: sourceChat?.title.read(reader),
          selection: origin.selection ? { text: origin.selection.text } : void 0
        };
      });
      this._sideChatOrigins.set(sessionResource, sideChatOrigin);
    }
    return sideChatOrigin;
  }
  /** Activates a side chat's source and reveals its originating request. */
  async revealSideChatSource(sessionResource) {
    if (!this._isSessionsWindow) {
      return;
    }
    const origin = this.observeSideChatOrigin(sessionResource).get();
    if (!origin) {
      return;
    }
    const resolved = this._resolveSessionChat(sessionResource);
    if (!resolved) {
      return;
    }
    const widget = this.chatWidgetService.getWidgetBySessionResource(sessionResource);
    await this.sessionsService.openChat(resolved.session, origin.sourceSessionResource);
    if (!widget) {
      return;
    }
    if (!widget.viewModel || !this.uriIdentityService.extUri.isEqual(widget.viewModel.sessionResource, origin.sourceSessionResource)) {
      const viewModelChanged = Event2.toPromise(Event2.filter(
        widget.onDidChangeViewModel,
        (event) => event.currentSessionResource !== void 0 && this.uriIdentityService.extUri.isEqual(event.currentSessionResource, origin.sourceSessionResource)
      ), this._store);
      try {
        if (!await raceTimeout(viewModelChanged, SIDE_CHAT_SOURCE_REVEAL_TIMEOUT)) {
          return;
        }
      } finally {
        viewModelChanged.cancel();
      }
    }
    const item = widget.viewModel?.getItems().find((item2) => item2.id === origin.sourceTurnId);
    if (item && isRequestVM(item)) {
      widget.reveal(item);
    }
  }
  _resolveSessionChat(sessionResource, reader) {
    const visibleSessions = reader ? this.sessionsService.visibleSessions.read(reader) : this.sessionsService.visibleSessions.get();
    for (const session of visibleSessions) {
      if (!session) {
        continue;
      }
      const chats = reader ? session.chats.read(reader) : session.chats.get();
      const chat = chats.find((chat2) => this.uriIdentityService.extUri.isEqual(chat2.resource, sessionResource));
      if (chat) {
        return { session, chat };
      }
    }
    return this.sessionsManagementService.getSessionForChatResource(sessionResource);
  }
  /**
   * Resolves the session, chat and turn a side chat would branch from, or
   * `undefined` when this conversation cannot produce one — it is untitled,
   * archived, its provider lacks side chat support, or nothing has been sent
   * yet so there is no turn to anchor to.
   */
  _resolveSource(sessionResource) {
    const found = this.sessionsManagementService.getSessionForChatResource(sessionResource);
    if (!found) {
      return void 0;
    }
    const { session, chat } = found;
    if (session.status.get() === 0 /* Untitled */ || session.isArchived.get() || !session.capabilities.get().supportsSideChat) {
      return void 0;
    }
    const sourceTurn = this.chatService.getSession(chat.resource)?.getRequests().at(-1);
    if (!sourceTurn) {
      return void 0;
    }
    return { session, chatResource: chat.resource, turnId: sourceTurn.id };
  }
};

SessionsSideChatProviderContribution = __decorateClass([
  __decorateParam(0, IChatSideChatService),
  __decorateParam(1, ISessionsManagementService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, ISessionsPartService),
  __decorateParam(4, IChatService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, IUriIdentityService),
  __decorateParam(7, IWorkbenchEnvironmentService)
], SessionsSideChatProviderContribution);

registerWorkbenchContribution2(SessionsSideChatProviderContribution.ID, SessionsSideChatProviderContribution, WorkbenchPhase.BlockRestore);
export { SIDE_CHAT_SOURCE_REVEAL_TIMEOUT, SessionsSideChatProviderContribution };
