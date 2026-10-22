// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chat.contribution.ts
import { registerAction2 } from "./module-0092.mjs";
import { ForkConversationAction } from "./module-2212.mjs";
import { ExportAgentHostDebugLogsAction } from "./module-2866.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IChatResponseFileChangesService } from "./module-2258.mjs";
import { EditorChatResponseFileChangesService } from "./module-2867.mjs";


// src/vs/workbench/contrib/chat/browser/chat.contribution.ts
registerAction2(ForkConversationAction);

registerAction2(ExportAgentHostDebugLogsAction);

registerSingleton(IChatResponseFileChangesService, EditorChatResponseFileChangesService, 1 /* Delayed */);
export {};
