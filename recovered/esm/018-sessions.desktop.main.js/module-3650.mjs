// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/btwSlashCommand.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { SessionIsArchivedContext, SessionIsCreatedContext, SessionSupportsSideChatContext } from "./module-1770.mjs";
import { captureSideChatSelection } from "./module-2547.mjs";
import { openAndSendSideChat } from "./module-3629.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSlashCommandService } from "./module-0989.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ILogService } from "./module-0095.mjs";
import { INotificationService } from "./module-0336.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/chat/browser/btwSlashCommand.contribution.ts
var BtwSlashCommandContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.btwSlashCommand";
  }
  constructor(slashCommandService, sessionsService, sessionsManagementService, sessionsPartService, chatService, chatWidgetService, environmentService, logService, notificationService) {
    super();
    if (!environmentService.isSessionsWindow) {
      return;
    }
    this._register(slashCommandService.registerSlashCommand({
      command: "btw",
      detail: localize(4334, null),
      sortText: "z2_btw",
      executeImmediately: false,
      executeDuringRequest: true,
      silent: true,
      locations: ["panel" /* Chat */],
      when: ContextKeyExpr.and(
        IsSessionsWindowContext,
        SessionIsCreatedContext,
        SessionIsArchivedContext.negate(),
        SessionSupportsSideChatContext
      )
    }, async (prompt, _progress, _history, _location, sessionResource, _token, options3) => {
      const remainder = prompt.trim();
      if (!remainder) {
        notificationService.warn(localize(4336, null));
        return;
      }
      const found = sessionsManagementService.getSessionForChatResource(sessionResource);
      if (!found) {
        notificationService.warn(localize(4338, null));
        return;
      }
      const { session, chat } = found;
      if (session.status.get() === 0 /* Untitled */ || session.isArchived.get() || !session.capabilities.get().supportsSideChat) {
        notificationService.warn(localize(4339, null));
        return;
      }
      const sourceTurn = chatService.getSession(chat.resource)?.getRequests().at(-1);
      if (!sourceTurn) {
        logService.warn("[btw] No turn to branch a side chat from");
        notificationService.warn(localize(4337, null));
        return;
      }
      const selection = captureSideChatSelection(chatWidgetService.getWidgetBySessionResource(chat.resource));
      let sideChat;
      try {
        sideChat = await sessionsManagementService.createSideChatInSession(session, chat.resource, sourceTurn.id, selection);
      } catch (err) {
        logService.error("[btw] Failed to create side chat", err);
        notificationService.error(localize(4335, null));
        return;
      }
      await openAndSendSideChat(sessionsManagementService, sessionsService, sessionsPartService, session, sideChat, { query: remainder, attachedContext: options3?.attachedContext });
    }));
  }
};

BtwSlashCommandContribution = __decorateClass([
  __decorateParam(0, IChatSlashCommandService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, ISessionsManagementService),
  __decorateParam(3, ISessionsPartService),
  __decorateParam(4, IChatService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, ILogService),
  __decorateParam(8, INotificationService)
], BtwSlashCommandContribution);

registerWorkbenchContribution2(BtwSlashCommandContribution.ID, BtwSlashCommandContribution, WorkbenchPhase.Eventually);
export { BtwSlashCommandContribution };
