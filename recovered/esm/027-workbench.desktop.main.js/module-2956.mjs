// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChat.contribution.ts
import { registerEditorContribution } from "./module-0097.mjs";
import { InlineChatController } from "./module-2397.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { AskInChatAction, CancelSessionAction, ContinueInlineChatInChatViewAction, DismissEditorAffordanceAction, FixDiagnosticsAction, FocusInlineChat, KeepSessionAction2, RephraseInlineChatSessionAction, StartSessionAction, UndoAndCloseSessionAction2 } from "./module-2948.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IInlineChatSessionService } from "./module-1899.mjs";
import { InlineChatEnabler, InlineChatEscapeToolContribution, InlineChatSessionServiceImpl } from "./module-2953.mjs";
import { IInlineChatSessionResolver, InlineChatSessionResolver } from "./module-2952.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { InlineChatNotebookContribution } from "./module-2949.mjs";
import { InlineChatDefaultModel } from "./module-2955.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { InlineChatAccessibilityHelp } from "./module-2954.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChat.contribution.ts
registerEditorContribution(InlineChatController.ID, InlineChatController, 0 /* Eager */);

registerAction2(KeepSessionAction2);

registerAction2(UndoAndCloseSessionAction2);

registerAction2(CancelSessionAction);

registerAction2(ContinueInlineChatInChatViewAction);

registerAction2(RephraseInlineChatSessionAction);

registerSingleton(IInlineChatSessionService, InlineChatSessionServiceImpl, 1 /* Delayed */);

registerSingleton(IInlineChatSessionResolver, InlineChatSessionResolver, 1 /* Delayed */);

registerAction2(StartSessionAction);

registerAction2(AskInChatAction);

registerAction2(FocusInlineChat);

registerAction2(FixDiagnosticsAction);

registerAction2(DismissEditorAffordanceAction);

registerWorkbenchContribution2("inlineChat.notebooks", InlineChatNotebookContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(InlineChatDefaultModel.ID, InlineChatDefaultModel, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(InlineChatEnabler.Id, InlineChatEnabler, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(InlineChatEscapeToolContribution.Id, InlineChatEscapeToolContribution, WorkbenchPhase.AfterRestored);

AccessibleViewRegistry.register(new InlineChatAccessibilityHelp());
export {};
