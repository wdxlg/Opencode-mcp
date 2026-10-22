// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/voice/browser/terminalVoiceActions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { registerActiveInstanceAction, sharedWhenClause } from "./module-3272.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { HasSpeechProvider, SpeechToTextInProgress } from "./module-1254.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { Codicon } from "./module-0085.mjs";
import { TerminalVoiceSession } from "./module-3452.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1046.mjs";
import { IExtensionManagementService } from "./module-0872.mjs";
import { IChatSpeechToTextService } from "./module-1348.mjs";


// src/vs/workbench/contrib/terminalContrib/voice/browser/terminalVoiceActions.ts
var VOICE_CATEGORY2 = localize2(20980, "Voice");

function registerTerminalVoiceActions() {
  registerActiveInstanceAction({
    id: "workbench.action.terminal.startVoice" /* StartVoice */,
    title: localize2(20981, "Start Dictation in Terminal"),
    category: VOICE_CATEGORY2,
    precondition: ContextKeyExpr.and(
      // Keep the toggle available for terminal dictation, but not unrelated speech-to-text sessions.
      ContextKeyExpr.or(SpeechToTextInProgress.toNegated(), TerminalContextKeys.terminalDictationInProgress),
      sharedWhenClause.terminalAvailable
    ),
    f1: true,
    icon: Codicon.mic,
    run: async (activeInstance, c, accessor) => {
      const contextKeyService = accessor.get(IContextKeyService);
      if (TerminalContextKeys.terminalDictationInProgress.getValue(contextKeyService)) {
        TerminalVoiceSession.getInstance(accessor.get(IInstantiationService)).stop(true);
        return;
      }
      const commandService = accessor.get(ICommandService);
      const dialogService = accessor.get(IDialogService);
      const workbenchExtensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
      const extensionManagementService = accessor.get(IExtensionManagementService);
      const chatSpeechToTextService = accessor.get(IChatSpeechToTextService);
      if (chatSpeechToTextService.isConfigured || HasSpeechProvider.getValue(contextKeyService)) {
        const instantiationService = accessor.get(IInstantiationService);
        TerminalVoiceSession.getInstance(instantiationService).start();
        return;
      }
      const extensions = await extensionManagementService.getInstalled();
      const extension = extensions.find((extension2) => extension2.identifier.id === "ms-vscode.vscode-speech");
      const extensionIsDisabled = extension && !workbenchExtensionEnablementService.isEnabled(extension);
      let run;
      let message;
      let primaryButton;
      if (extensionIsDisabled) {
        message = localize(20978, null);
        primaryButton = localize(20975, null);
        run = () => workbenchExtensionEnablementService.setEnablement([extension], 13 /* EnabledWorkspace */);
      } else {
        message = localize(20979, null);
        run = () => commandService.executeCommand("workbench.extensions.installExtension", "ms-vscode.vscode-speech");
        primaryButton = localize(20976, null);
      }
      const detail2 = localize(20977, null);
      const confirmed = await dialogService.confirm({ message, primaryButton, type: "info", detail: detail2 });
      if (confirmed.confirmed) {
        await run();
      }
    }
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.stopVoice" /* StopVoice */,
    title: localize2(20982, "Stop Dictation in Terminal"),
    category: VOICE_CATEGORY2,
    precondition: TerminalContextKeys.terminalDictationInProgress,
    f1: true,
    run: (activeInstance, c, accessor) => {
      const instantiationService = accessor.get(IInstantiationService);
      TerminalVoiceSession.getInstance(instantiationService).stop(true);
    }
  });
}
export { registerTerminalVoiceActions, VOICE_CATEGORY2 };
