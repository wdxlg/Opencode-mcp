// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/actions/exportAgentTracesDb.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { AgentHostOTelDbSpanExporterEnabledSettingId, AgentHostOTelSpansDbSubPath } from "./module-1107.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { joinPath } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/electron-browser/actions/exportAgentTracesDb.ts
function registerExportAgentTracesDbAction() {
  registerAction2(class ExportAgentTracesDbAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.agentHost.otel.exportAgentTracesDB",
        category: CHAT_CATEGORY,
        title: localize2(13516, "Export Agent Host Traces Database..."),
        precondition: ContextKeyExpr.equals(`config.${AgentHostOTelDbSpanExporterEnabledSettingId}`, true),
        f1: true
      });
    }
    async run(accessor, savePath) {
      const fileDialogService = accessor.get(IFileDialogService);
      const fileService = accessor.get(IFileService);
      const notificationService = accessor.get(INotificationService);
      const environmentService = accessor.get(INativeWorkbenchEnvironmentService);
      const sourceUri = joinPath(URI.file(environmentService.userDataPath), ...AgentHostOTelSpansDbSubPath.split("/"));
      if (!await fileService.exists(sourceUri)) {
        notificationService.notify({
          severity: Severity2.Info,
          message: localize(13517, null)
        });
        return;
      }
      let target;
      if (savePath) {
        const saveUri = typeof savePath === "string" ? URI.file(savePath) : savePath;
        target = joinPath(saveUri, "agent-host-traces.db");
      } else {
        const defaultUri = joinPath(await fileDialogService.defaultFilePath(), "agent-host-traces.db");
        target = await fileDialogService.showSaveDialog({
          defaultUri,
          filters: [{ name: "SQLite Database", extensions: ["db", "sqlite"] }]
        });
      }
      if (!target) {
        return;
      }
      try {
        await fileService.copy(sourceUri, target, true);
        for (const suffix of ["-wal", "-shm"]) {
          const sidecarSrc = sourceUri.with({ path: sourceUri.path + suffix });
          if (await fileService.exists(sidecarSrc)) {
            const sidecarDest = target.with({ path: target.path + suffix });
            await fileService.copy(sidecarSrc, sidecarDest, true);
          }
        }
      } catch (error) {
        notificationService.notify({
          severity: Severity2.Error,
          message: localize(13515, null, error instanceof Error ? error.message : String(error))
        });
      }
    }
  });
}
export { registerExportAgentTracesDbAction };
