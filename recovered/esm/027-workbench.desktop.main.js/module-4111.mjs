// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/actions/installDictationModelAction.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { INSTALL_DICTATION_MODEL_COMMAND_ID } from "./module-1348.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { DEFAULT_LOCAL_TRANSCRIPTION_MODEL, ILocalTranscriptionService } from "./module-1341.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { Schemas } from "./module-0033.mjs";
import { joinPath } from "./module-0034.mjs";


// src/vs/workbench/contrib/chat/electron-browser/actions/installDictationModelAction.ts
function registerInstallDictationModelAction() {
  const enabled = ContextKeyExpr.and(
    ChatContextKeys.enabled,
    ContextKeyExpr.equals("config.dictation.enabled", true)
  );
  registerAction2(class InstallDictationModelAction extends Action2 {
    constructor() {
      super({
        id: INSTALL_DICTATION_MODEL_COMMAND_ID,
        category: CHAT_CATEGORY,
        title: localize2(13518, "Install Dictation Model from Local Package..."),
        precondition: enabled,
        menu: {
          id: MenuId.CommandPalette,
          when: enabled
        }
      });
    }
    async run(accessor) {
      const localTranscriptionService = accessor.get(ILocalTranscriptionService);
      const notificationService = accessor.get(INotificationService);
      const fileDialogService = accessor.get(IFileDialogService);
      const progressService = accessor.get(IProgressService);
      const environmentService = accessor.get(IEnvironmentService);
      if (!localTranscriptionService.isSupported) {
        notificationService.warn(localize(13525, null));
        return;
      }
      const sources = await fileDialogService.showOpenDialog({
        title: localize(13519, null, DEFAULT_LOCAL_TRANSCRIPTION_MODEL),
        openLabel: localize(13522, null),
        canSelectFiles: true,
        canSelectFolders: true,
        canSelectMany: false
      });
      const source = sources?.[0];
      if (!source) {
        return;
      }
      if (source.scheme !== Schemas.file) {
        notificationService.error(localize(13521, null));
        return;
      }
      const cacheDir = joinPath(environmentService.cacheHome, "chatDictationModels").fsPath;
      try {
        const result = await progressService.withProgress({
          location: 15 /* Notification */,
          title: localize(13523, null)
        }, () => localTranscriptionService.importModel({ sourcePath: source.fsPath, cacheDir }));
        notificationService.info(localize(
          13524,
          null,
          result.model,
          result.version
        ));
      } catch (error) {
        notificationService.error(localize(
          13520,
          null,
          error instanceof Error ? error.message : String(error)
        ));
      }
    }
  });
}
export { registerInstallDictationModelAction };
