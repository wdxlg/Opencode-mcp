// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/chatPetAchievements.ts
import { Disposable } from "./module-0012.mjs";
import { ChatPetAchievementIds, hasChatPetImageAttachment } from "./module-2111.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { IChatPetService } from "./module-2112.mjs";


// src/vs/sessions/contrib/chat/browser/chatPetAchievements.ts
var SessionsChatPetAchievementContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.chatPetAchievements";
  }
  constructor(sessionsManagementService, chatPetService) {
    super();
    chatPetService.unlockAchievement(ChatPetAchievementIds.AgentsWindowOpened);
    this._register(sessionsManagementService.onDidSendRequest((event) => {
      chatPetService.unlockAchievement(ChatPetAchievementIds.FirstChatMessage);
      if (hasChatPetImageAttachment(event.options.attachedContext ?? [])) {
        chatPetService.unlockAchievement(ChatPetAchievementIds.ImageRequest);
      }
    }));
  }
};

SessionsChatPetAchievementContribution = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, IChatPetService)
], SessionsChatPetAchievementContribution);
export { SessionsChatPetAchievementContribution };
