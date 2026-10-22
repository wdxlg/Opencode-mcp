// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/openSubagentChat.ts
import { parseChatUri, parseSubagentSessionUri } from "./module-1008.mjs";
import { URI } from "./module-0032.mjs";
import { Disposable } from "./module-0012.mjs";
import { OpenSubagentChatActionViewItem, subagentChatOpenerRegistry } from "./module-2791.mjs";
import { Emitter } from "./module-0017.mjs";
import { MenuId, MenuItemAction } from "./module-0092.mjs";
import { CHAT_OPEN_AGENT_HOST_CHAT_COMMAND_ID } from "./module-0965.mjs";
import { autorun } from "./module-0052.mjs";
import { fillSessionChatDragData } from "./module-3488.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/openSubagentChat.ts
function chatIdFromResource(resource) {
  const fromChatUri = parseChatUri(resource)?.chatId;
  if (fromChatUri) {
    return fromChatUri;
  }
  const fromSessionUri = parseSubagentSessionUri(resource);
  return fromSessionUri ? `subagent/${fromSessionUri.toolCallId}` : void 0;
}

function matchesResource(chat, resource, chatId) {
  return chat.resource.toString() === resource || !!chatId && chat.resource.fragment === chatId;
}

function ownerSessionPath(resource) {
  const fromChatUri = parseChatUri(resource)?.session;
  if (fromChatUri) {
    try {
      return URI.parse(fromChatUri).path;
    } catch {
      return void 0;
    }
  }
  return parseSubagentSessionUri(resource)?.parentSession.path;
}

function findSubagentChat(sessionsService, resource, reader) {
  const chatId = chatIdFromResource(resource);
  const ownerPath = ownerSessionPath(resource);
  const allSessions = [sessionsService.activeSession.read(reader), ...sessionsService.visibleSessions.read(reader)].filter((session) => !!session);
  const candidates = ownerPath ? allSessions.filter((session) => session.resource.path === ownerPath) : allSessions;
  for (const session of candidates) {
    const chat = session.chats.read(reader).find((candidate) => matchesResource(candidate, resource, chatId));
    if (chat) {
      return { session, chat };
    }
  }
  return void 0;
}

var OpenSubagentChatActionViewItemContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.openSubagentChatActionViewItem";
  }
  constructor(actionViewItemService, sessionsService, sessionsPartService, logService) {
    super();
    this._register(subagentChatOpenerRegistry.register({
      open: async (context2) => {
        const resource = context2.chatResource;
        const match2 = findSubagentChat(sessionsService, resource);
        if (match2) {
          const view = sessionsPartService.getSessionView(match2.session.sessionId);
          if (context2.toSide && view) {
            await view.openChatToSide(match2.chat.resource);
          } else {
            await sessionsService.openChat(match2.session, match2.chat.resource);
          }
          return true;
        }
        const active = sessionsService.activeSession.get();
        const available = active?.chats.get().map((chat) => chat.resource.toString()).join(", ") ?? "(none)";
        logService.warn(`[Sessions] Cannot open subagent chat for resource '${resource}' (chatId='${chatIdFromResource(resource)}'). Available chats: ${available}`);
        return true;
      }
    }));
    const onDidRegister = this._register(new Emitter());
    this._register(actionViewItemService.register(MenuId.ChatSubagentContent, CHAT_OPEN_AGENT_HOST_CHAT_COMMAND_ID, (action, options3, instantiationService) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      const viewItem = instantiationService.createInstance(OpenSubagentChatActionViewItem, void 0, action, { ...options3, draggable: true }, false);
      viewItem.trackEnabled((context2, update) => autorun((reader) => update(!!findSubagentChat(sessionsService, context2.chatResource, reader))));
      viewItem.setDragDataProvider((context2, event) => {
        const match2 = findSubagentChat(sessionsService, context2.chatResource);
        if (!match2 || !event.dataTransfer) {
          return false;
        }
        fillSessionChatDragData(event, match2.session.sessionId, match2.chat.resource);
        event.dataTransfer.effectAllowed = "move";
        return true;
      });
      return viewItem;
    }, onDidRegister.event));
    onDidRegister.fire();
  }
};

OpenSubagentChatActionViewItemContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, ISessionsPartService),
  __decorateParam(3, ILogService)
], OpenSubagentChatActionViewItemContribution);

registerWorkbenchContribution2(OpenSubagentChatActionViewItemContribution.ID, OpenSubagentChatActionViewItemContribution, WorkbenchPhase.BlockStartup);
export { chatIdFromResource, matchesResource, ownerSessionPath, findSubagentChat, OpenSubagentChatActionViewItemContribution };
