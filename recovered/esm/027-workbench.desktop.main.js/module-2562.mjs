// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatImportExport.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ChatViewPaneTarget, IChatWidgetService } from "./module-0981.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { IChatService } from "./module-0972.mjs";
import { joinPath } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { revive } from "./module-0265.mjs";
import { extractExportableSessionData, isExportableSessionData } from "./module-1193.mjs";
import { ChatEditorInput } from "./module-1111.mjs";
import { ACTIVE_GROUP } from "./module-0934.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatImportExport.ts
var defaultFileName = "chat.json";

var filters = [{ name: localize(8689, null), extensions: ["json"] }];

function registerChatExportActions() {
  registerAction2(class ExportChatAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.export",
        category: CHAT_CATEGORY,
        title: localize2(8688, "Export Chat..."),
        precondition: ChatContextKeys.enabled,
        f1: true
      });
    }
    async run(accessor, outputPath) {
      const widgetService = accessor.get(IChatWidgetService);
      const fileDialogService = accessor.get(IFileDialogService);
      const fileService = accessor.get(IFileService);
      const chatService = accessor.get(IChatService);
      const widget = widgetService.lastFocusedWidget;
      if (!widget || !widget.viewModel) {
        return;
      }
      if (!outputPath) {
        const defaultUri = joinPath(await fileDialogService.defaultFilePath(), defaultFileName);
        const result = await fileDialogService.showSaveDialog({
          defaultUri,
          filters
        });
        if (!result) {
          return;
        }
        outputPath = result;
      }
      const model = chatService.getSession(widget.viewModel.sessionResource);
      if (!model) {
        return;
      }
      const content2 = VSBuffer.fromString(JSON.stringify(model.toExport(), void 0, 2));
      await fileService.writeFile(outputPath, content2);
    }
  });
  registerAction2(class ImportChatAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.import",
        title: localize2(8690, "Import Chat..."),
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        f1: true
      });
    }
    async run(accessor, opts) {
      const fileService = accessor.get(IFileService);
      const widgetService = accessor.get(IChatWidgetService);
      const chatService = accessor.get(IChatService);
      const fileDialogService = accessor.get(IFileDialogService);
      let inputPath = opts?.inputPath;
      if (!inputPath) {
        const defaultUri = joinPath(await fileDialogService.defaultFilePath(), defaultFileName);
        const result = await fileDialogService.showOpenDialog({
          defaultUri,
          canSelectFiles: true,
          filters
        });
        if (!result) {
          return;
        }
        inputPath = result[0];
      }
      const content2 = await fileService.readFile(inputPath);
      try {
        const data = revive(JSON.parse(content2.value.toString()));
        if (!isExportableSessionData(data)) {
          throw new Error("Invalid chat session data");
        }
        const importedData = extractExportableSessionData(data);
        let sessionResource;
        let resolvedTarget;
        let options3;
        if (opts?.target === "chatViewPane") {
          const modelRef = chatService.loadSessionFromData(importedData, "ChatImportExport#importToChatView");
          try {
            sessionResource = modelRef.object.sessionResource;
            resolvedTarget = ChatViewPaneTarget;
            options3 = { pinned: true };
            await widgetService.openSession(sessionResource, resolvedTarget, options3);
          } finally {
            modelRef.dispose();
          }
        } else {
          sessionResource = ChatEditorInput.getNewEditorUri();
          resolvedTarget = ACTIVE_GROUP;
          options3 = { target: { data: importedData }, pinned: true };
          await widgetService.openSession(sessionResource, resolvedTarget, options3);
        }
      } catch (err) {
        throw err;
      }
    }
  });
}
export { registerChatExportActions, defaultFileName, filters };
