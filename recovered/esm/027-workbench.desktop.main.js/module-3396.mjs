// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chat/browser/terminal.chat.contribution.ts
import { registerTerminalContribution } from "./module-2354.mjs";
import { TerminalChatController } from "./module-3390.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { TerminalInlineChatAccessibleView } from "./module-3391.mjs";
import { TerminalChatAccessibilityHelp } from "./module-3393.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { TerminalChatEnabler } from "./module-3394.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ITerminalChatService } from "./module-1149.mjs";
import { TerminalChatService } from "./module-3395.mjs";
import { ITerminalChatSessionResolver, TerminalChatSessionResolver } from "./module-3388.mjs";


// src/vs/workbench/contrib/terminalContrib/chat/browser/terminal.chat.contribution.ts
registerTerminalContribution(TerminalChatController.ID, TerminalChatController, false);

AccessibleViewRegistry.register(new TerminalInlineChatAccessibleView());

AccessibleViewRegistry.register(new TerminalChatAccessibilityHelp());

registerWorkbenchContribution2(TerminalChatEnabler.Id, TerminalChatEnabler, WorkbenchPhase.AfterRestored);

registerSingleton(ITerminalChatService, TerminalChatService, 1 /* Delayed */);

registerSingleton(ITerminalChatSessionResolver, TerminalChatSessionResolver, 1 /* Delayed */);
export {};
