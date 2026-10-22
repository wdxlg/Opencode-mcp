// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatOpenAgentDebugPanelAction.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IEditorService } from "./module-0934.mjs";
import { CHAT_DEBUG_ACTIVE_SESSION_IS_AGENT_HOST, CHAT_DEBUG_HAS_ACTIVE_SESSION, IChatDebugService } from "./module-1456.mjs";
import { ChatDebugEditorInput } from "./module-2568.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatViewId, IChatWidgetService } from "./module-0981.mjs";
import { URI } from "./module-0032.mjs";
import { isChatViewTitleActionContext } from "./module-2055.mjs";
import { Codicon } from "./module-0085.mjs";
import { ActiveEditorContext } from "./module-0949.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { LocalChatSessionUri } from "./module-0961.mjs";
import { joinPath } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatOpenAgentDebugPanelAction.ts
function registerChatOpenAgentDebugPanelAction() {
  registerAction2(class OpenAgentDebugPanelAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.openAgentDebugPanel",
        title: localize2(8721, "Open Agent Debug Logs"),
        f1: true,
        category: Categories.Developer,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      const chatDebugService = accessor.get(IChatDebugService);
      chatDebugService.activeSessionResource = void 0;
      const options3 = { pinned: true, viewHint: "home" };
      await editorService.openEditor(ChatDebugEditorInput.instance, options3);
    }
  });
  registerAction2(class OpenAgentDebugPanelForSessionAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.openAgentDebugPanelForSession",
        title: localize2(8722, "Show Agent Debug Logs"),
        f1: false,
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        menu: [{
          id: MenuId.ChatWelcomeContext,
          group: "2_settings",
          order: 0,
          when: ChatContextKeys.inChatEditor.negate()
        }, {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId)),
          order: 0,
          group: "4_logs"
        }]
      });
    }
    async run(accessor, context2, filter2) {
      const editorService = accessor.get(IEditorService);
      const chatWidgetService = accessor.get(IChatWidgetService);
      const chatDebugService = accessor.get(IChatDebugService);
      let sessionResource;
      if (URI.isUri(context2)) {
        sessionResource = context2;
      } else if (isChatViewTitleActionContext(context2)) {
        sessionResource = context2.sessionResource;
      }
      if (!sessionResource) {
        const widget = chatWidgetService.lastFocusedWidget;
        sessionResource = widget?.viewModel?.sessionResource;
      }
      chatDebugService.activeSessionResource = sessionResource;
      const options3 = { pinned: true, sessionResource, viewHint: "logs", filter: filter2 };
      await editorService.openEditor(ChatDebugEditorInput.instance, options3);
    }
  });
  const defaultDebugLogFileName = "agent-debug-log.json";
  const debugLogFilters = [{ name: localize(8725, null), extensions: ["json"] }];
  registerAction2(class ExportAgentDebugLogAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.exportAgentDebugLog",
        title: localize2(8719, "Export Agent Debug Log..."),
        icon: Codicon.chatExport,
        f1: true,
        category: Categories.Developer,
        precondition: ContextKeyExpr.and(
          ChatContextKeys.enabled,
          CHAT_DEBUG_HAS_ACTIVE_SESSION,
          CHAT_DEBUG_ACTIVE_SESSION_IS_AGENT_HOST.negate()
        ),
        menu: [{
          id: MenuId.EditorTitle,
          group: "navigation",
          when: ContextKeyExpr.and(
            ActiveEditorContext.isEqualTo(ChatDebugEditorInput.ID),
            CHAT_DEBUG_HAS_ACTIVE_SESSION,
            CHAT_DEBUG_ACTIVE_SESSION_IS_AGENT_HOST.negate()
          ),
          order: 10
        }]
      });
    }
    async run(accessor) {
      const chatDebugService = accessor.get(IChatDebugService);
      const fileDialogService = accessor.get(IFileDialogService);
      const fileService = accessor.get(IFileService);
      const notificationService = accessor.get(INotificationService);
      const openerService = accessor.get(IOpenerService);
      const telemetryService = accessor.get(ITelemetryService);
      const sessionResource = chatDebugService.activeSessionResource;
      if (!sessionResource) {
        notificationService.notify({ severity: Severity2.Info, message: localize(8729, null) });
        return;
      }
      const localSessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
      const rawIdentifier = localSessionId ?? (sessionResource.path.replace(/^\//, "") || sessionResource.authority);
      const sessionIdentifier = rawIdentifier?.replace(/[/\\:*?"<>|.]+/g, "_").replace(/^_+|_+$/g, "");
      const exportFileName = sessionIdentifier ? `agent-debug-log-${sessionIdentifier}.json` : defaultDebugLogFileName;
      const defaultUri = joinPath(await fileDialogService.defaultFilePath(), exportFileName);
      const outputPath = await fileDialogService.showSaveDialog({ defaultUri, filters: debugLogFilters });
      if (!outputPath) {
        return;
      }
      const data = await chatDebugService.exportLog(sessionResource);
      if (!data) {
        notificationService.notify({ severity: Severity2.Warning, message: localize(8723, null) });
        return;
      }
      await fileService.writeFile(outputPath, VSBuffer.wrap(data));
      telemetryService.publicLog2("chatDebugLogExported", {
        fileSizeBytes: data.byteLength
      });
      notificationService.prompt(
        Severity2.Info,
        localize(8724, null),
        [{
          label: localize(8730, null),
          run: () => openerService.open(outputPath)
        }]
      );
    }
  });
  registerAction2(class ImportAgentDebugLogAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.importAgentDebugLog",
        title: localize2(8720, "Import Agent Debug Log..."),
        icon: Codicon.chatImport,
        f1: true,
        category: Categories.Developer,
        precondition: ChatContextKeys.enabled,
        menu: [{
          id: MenuId.EditorTitle,
          group: "navigation",
          when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(ChatDebugEditorInput.ID), CHAT_DEBUG_ACTIVE_SESSION_IS_AGENT_HOST.negate()),
          order: 11
        }]
      });
    }
    async run(accessor) {
      const chatDebugService = accessor.get(IChatDebugService);
      const dialogService = accessor.get(IDialogService);
      const editorService = accessor.get(IEditorService);
      const fileDialogService = accessor.get(IFileDialogService);
      const fileService = accessor.get(IFileService);
      const notificationService = accessor.get(INotificationService);
      const telemetryService = accessor.get(ITelemetryService);
      const defaultUri = joinPath(await fileDialogService.defaultFilePath(), defaultDebugLogFileName);
      const result = await fileDialogService.showOpenDialog({
        defaultUri,
        canSelectFiles: true,
        filters: debugLogFilters
      });
      if (!result) {
        return;
      }
      const maxImportSize = 50 * 1024 * 1024;
      const stat = await fileService.stat(result[0]);
      if (stat.size !== void 0 && stat.size > maxImportSize) {
        telemetryService.publicLog2("chatDebugLogImported", {
          fileSizeBytes: stat.size,
          result: "fileTooLarge"
        });
        await dialogService.warn(
          localize(8727, null),
          localize(8726, null, (stat.size / (1024 * 1024)).toFixed(1))
        );
        return;
      }
      const content2 = await fileService.readFile(result[0]);
      const sessionUri = await chatDebugService.importLog(content2.value.buffer);
      if (!sessionUri) {
        telemetryService.publicLog2("chatDebugLogImported", {
          fileSizeBytes: content2.value.byteLength,
          result: "providerFailed"
        });
        notificationService.notify({ severity: Severity2.Warning, message: localize(8728, null) });
        return;
      }
      telemetryService.publicLog2("chatDebugLogImported", {
        fileSizeBytes: content2.value.byteLength,
        result: "success"
      });
      const options3 = { pinned: true, sessionResource: sessionUri, viewHint: "overview" };
      await editorService.openEditor(ChatDebugEditorInput.instance, options3);
    }
  });
}
export { registerChatOpenAgentDebugPanelAction };
