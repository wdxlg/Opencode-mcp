// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/openCodeSharedChatActions.ts
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IChatService } from "./module-0973.mjs";
import { ChatViewPaneTarget, IChatWidgetService } from "./module-0982.mjs";
import { IHostService } from "./module-1118.mjs";
import { INotificationService } from "./module-0336.mjs";
import { URI } from "./module-0032.mjs";
import { revive } from "./module-0265.mjs";
import { generateUuid } from "./module-0190.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/workbench/contrib/chat/browser/actions/openCodeSharedChatActions.ts
CommandsRegistry.registerCommand("opencode.chat.openSharedSession", async (accessor, key3) => {
  if (typeof key3 !== "string" || !/^[a-f0-9]{64}$/.test(key3)) throw new Error("Invalid shared chat key.");
  const commands = accessor.get(ICommandService);
  const chatService = accessor.get(IChatService);
  const widgetService = accessor.get(IChatWidgetService);
  const host = accessor.get(IHostService);
  const notifications = accessor.get(INotificationService);
  const reply = await commands.executeCommand("opencode.workspaceHub.prepareContinuation", key3);
  if (!reply?.data || !Array.isArray(reply.data.requests)) throw new Error("Shared chat data is unavailable.");
  const resource = URI.parse(reply.sessionResource);
  const existing = chatService.getSession(resource);
  if (existing?.requestInProgress.get()) throw new Error("\u539F\u7A97\u53E3\u4ECD\u5728\u751F\u6210\uFF0C\u8BF7\u7B49\u5F85\u5B8C\u6210\u3002");
  if (existing && reply.wasOwner) {
    await widgetService.openSession(resource, ChatViewPaneTarget);
  } else {
    const data = revive(reply.data);
    const recovered = existing ? { ...data, sessionId: generateUuid(), creationDate: Date.now(), customTitle: `${data.customTitle || "\u5171\u4EAB\u804A\u5929"} \xB7 \u6062\u590D`, inputState: void 0, pendingRequests: void 0 } : { ...data, inputState: void 0, pendingRequests: void 0 };
    const ref = chatService.loadSessionFromData(recovered, "OpenCode#sharedChatContinue");
    try {
      await widgetService.openSession(ref.object.sessionResource, ChatViewPaneTarget);
    } finally {
      ref.dispose();
    }
    if (existing) notifications.info("\u5DF2\u4ECE\u5171\u4EAB\u8BB0\u5F55\u6062\u590D\u4E3A\u65B0\u4F1A\u8BDD\uFF0C\u65E7\u4F1A\u8BDD\u4FDD\u6301\u4E0D\u53D8\u3002");
  }
  await host.focus(mainWindow, { mode: 2 /* Force */ });
});

CommandsRegistry.registerCommand("opencode.chat.focusWindow", async (accessor) => {
  await accessor.get(IHostService).focus(mainWindow, { mode: 2 /* Force */ });
});

CommandsRegistry.registerCommand("opencode.chat.ensureSharedSync", (accessor) => {
  accessor.get(IChatService);
  return true;
});
export {};
