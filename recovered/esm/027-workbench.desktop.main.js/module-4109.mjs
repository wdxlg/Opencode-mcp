// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/actions/chatExportZip.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ChatEntitlementContextKeys } from "./module-0953.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IChatService } from "./module-0972.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { ISCMService } from "./module-1080.mjs";
import { IFileService } from "./module-0269.mjs";
import { joinPath } from "./module-0034.mjs";
import { captureRepoInfo } from "./module-2776.mjs";


// src/vs/workbench/contrib/chat/electron-browser/actions/chatExportZip.ts
function registerChatExportZipAction() {
  registerAction2(class ExportChatAsZipAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.exportAsZip",
        category: CHAT_CATEGORY,
        title: localize2(13508, "Export Chat as Zip..."),
        precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatEntitlementContextKeys.Entitlement.internal),
        f1: true
      });
    }
    async run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      const fileDialogService = accessor.get(IFileDialogService);
      const chatService = accessor.get(IChatService);
      const nativeHostService = accessor.get(INativeHostService);
      const notificationService = accessor.get(INotificationService);
      const scmService = accessor.get(ISCMService);
      const fileService = accessor.get(IFileService);
      const widget = widgetService.lastFocusedWidget;
      if (!widget || !widget.viewModel) {
        return;
      }
      const defaultUri = joinPath(await fileDialogService.defaultFilePath(), "chat.zip");
      const result = await fileDialogService.showSaveDialog({
        defaultUri,
        filters: [{ name: "Zip Archive", extensions: ["zip"] }]
      });
      if (!result) {
        return;
      }
      const model = chatService.getSession(widget.viewModel.sessionResource);
      if (!model) {
        return;
      }
      const files = [
        {
          path: "chat.json",
          contents: JSON.stringify(model.toExport(), void 0, 2)
        }
      ];
      const hasMessages = model.getRequests().length > 0;
      if (hasMessages) {
        if (model.repoData) {
          files.push({
            path: "chat.repo.begin.json",
            contents: JSON.stringify(model.repoData, void 0, 2)
          });
        }
        const currentRepoData = await captureRepoInfo(scmService, fileService);
        if (currentRepoData) {
          files.push({
            path: "chat.repo.end.json",
            contents: JSON.stringify(currentRepoData, void 0, 2)
          });
        }
        if (!model.repoData && !currentRepoData) {
          notificationService.notify({
            severity: Severity2.Warning,
            message: localize(13510, null)
          });
        }
      } else {
        const currentRepoData = await captureRepoInfo(scmService, fileService);
        if (currentRepoData) {
          files.push({
            path: "chat.repo.begin.json",
            contents: JSON.stringify(currentRepoData, void 0, 2)
          });
        } else {
          notificationService.notify({
            severity: Severity2.Warning,
            message: localize(13510, null)
          });
        }
      }
      try {
        await nativeHostService.createZipFile(result, files);
      } catch (error) {
        notificationService.notify({
          severity: Severity2.Error,
          message: localize(13509, null, error instanceof Error ? error.message : String(error))
        });
      }
    }
  });
}
export { registerChatExportZipAction };
