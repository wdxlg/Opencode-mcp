// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/actions/exportAgentHostDebugLogsService.ts
import { joinPath } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";
import { hasKey } from "./module-0010.mjs";
import { AGENT_HOST_DEBUG_LOGS_MAX_ENTRIES } from "./module-1108.mjs";
import { generateUuid } from "./module-0190.mjs";
import { IAgentHostDebugLogsExportService, createHostArtifactStream } from "./module-3653.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { INativeEnvironmentService } from "./module-0508.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/electron-browser/actions/exportAgentHostDebugLogsService.ts
var NativeAgentHostDebugLogsExportService = class {
  constructor(fileDialogService, fileService, environmentService, nativeHostService, logService) {
    this.fileDialogService = fileDialogService;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.nativeHostService = nativeHostService;
    this.logService = logService;
    this.hostArtifactKind = "archive";
  }
  async save(exportName, files, hostArtifact) {
    const defaultUri = joinPath(await this.fileDialogService.preferredHome(Schemas.file), `${exportName}.zip`);
    const saveUri = await this.fileDialogService.showSaveDialog({
      title: localize(13513, null),
      defaultUri,
      filters: [{ name: localize(13514, null), extensions: ["zip"] }],
      availableFileSystems: [Schemas.file]
    });
    if (!saveUri) {
      return false;
    }
    const zipFiles = files.map((file) => {
      return hasKey(file, { contents: true }) ? file : { path: file.path, source: file.resource.scheme === Schemas.vscodeUserData ? file.resource.with({ scheme: Schemas.file }) : file.resource, size: file.size, skipSourceErrors: true };
    });
    const zipOptions = { maxEntries: AGENT_HOST_DEBUG_LOGS_MAX_ENTRIES };
    let hostArchiveIncluded = false;
    let temporaryHostArchive;
    try {
      if (hostArtifact) {
        try {
          const { artifact, readChunk } = hostArtifact;
          if (artifact.kind !== "archive") {
            throw new Error(`Expected an Agent Host debug-log archive, got ${artifact.kind}`);
          }
          let localHostArchive = artifact.resource;
          if (artifact.resource.scheme !== Schemas.file) {
            localHostArchive = joinPath(this.environmentService.tmpDir, `agent-host-debug-logs-${generateUuid()}.zip`);
            temporaryHostArchive = localHostArchive;
            await this.fileService.writeFile(localHostArchive, createHostArtifactStream(artifact, (position2) => readChunk(artifact.resource, position2)));
          }
          zipFiles.push({ sourceArchive: localHostArchive });
          hostArchiveIncluded = true;
        } catch (error) {
          this.logService.warn(`[ExportAgentHostDebugLogs] Failed to save Agent Host logs: ${error instanceof Error ? error.message : String(error)}; saving client-owned logs only`);
        }
      }
      try {
        await this.nativeHostService.createZipFile(saveUri, zipFiles, zipOptions);
      } catch (error) {
        if (!hostArchiveIncluded) {
          throw error;
        }
        this.logService.warn(`[ExportAgentHostDebugLogs] Failed to merge Agent Host logs: ${error instanceof Error ? error.message : String(error)}; saving client-owned logs only`);
        await this.nativeHostService.createZipFile(saveUri, zipFiles.slice(0, -1), zipOptions);
      }
    } finally {
      if (temporaryHostArchive) {
        try {
          await this.fileService.del(temporaryHostArchive);
        } catch (error) {
          this.logService.warn(`[ExportAgentHostDebugLogs] Failed to remove temporary host archive: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    return true;
  }
};

NativeAgentHostDebugLogsExportService = __decorateClass([
  __decorateParam(0, IFileDialogService),
  __decorateParam(1, IFileService),
  __decorateParam(2, INativeEnvironmentService),
  __decorateParam(3, INativeHostService),
  __decorateParam(4, ILogService)
], NativeAgentHostDebugLogsExportService);

registerSingleton(IAgentHostDebugLogsExportService, NativeAgentHostDebugLogsExportService, 1 /* Delayed */);
export { NativeAgentHostDebugLogsExportService };
