// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/exportAgentHostDebugLogsAction.ts
import { ByteSize, IFileService } from "./module-0269.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { DEFAULT_CHAT_ID, getSessionChatResource } from "./module-1008.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer, newWriteableBufferStream, streamToBuffer } from "./module-0038.mjs";
import { IAgentHostService } from "./module-1108.mjs";
import { IAgentHostConnectionsService } from "./module-0960.mjs";
import { IRemoteAgentHostService, remoteAgentHostLogOutputChannelId } from "./module-1736.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { getRemoteConnectionForSession, sanitizeFilePart } from "./module-2573.mjs";
import { hasKey } from "./module-0010.mjs";
import { basename2, dirname2, joinPath } from "./module-0034.mjs";
import { COPILOT_CLI_LOCAL_AH_SCHEME, getCopilotCliSessionRawId, parseRemoteAuthorityFromScheme } from "./module-1110.mjs";
import { buildAgentHostCustomizationsUri, buildAgentHostUsageUri } from "./module-2568.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { IProgressService } from "./module-0446.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { AGENT_HOST_ENABLED_CONTEXT_KEY } from "./module-0964.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/workbench/contrib/chat/browser/actions/exportAgentHostDebugLogsAction.ts
var SHARED_PROCESS_LOG_FILE_NAME = "sharedprocess.log";

var OUTPUT_LOG_FOLDER_PREFIX = "output_";

var MAX_INLINE_DEBUG_LOGS_BYTES = 30 * ByteSize.MB;

var IAgentHostDebugLogsExportService = createDecorator("agentHostDebugLogsExportService");

var BrowserAgentHostDebugLogsExportService = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this.hostArtifactKind = "directory";
  }
  async save(exportName, files, hostArtifact) {
    return this.instantiationService.invokeFunction((accessor) => exportFilesToLocalFolder(accessor, exportName, files, hostArtifact));
  }
};

BrowserAgentHostDebugLogsExportService = __decorateClass([
  __decorateParam(0, IInstantiationService)
], BrowserAgentHostDebugLogsExportService);

function resolveAgentHostDebugLogsChat(activeSession, state) {
  let backendChat = activeSession.backendChatResource;
  let sessionTitle = activeSession.sessionTitle;
  if (state && !(state instanceof Error)) {
    if (!backendChat) {
      const backendChatResource = getSessionChatResource(state, activeSession.chatId);
      if (backendChatResource) {
        backendChat = URI.parse(backendChatResource);
      }
    }
    sessionTitle ??= state.title;
  }
  return { backendChat, sessionTitle };
}

function createHostArtifactStream(artifact, readChunk) {
  const stream = newWriteableBufferStream();
  (async () => {
    let position2 = 0;
    while (true) {
      const chunk2 = await readChunk(position2);
      const byteLength2 = chunk2.data.byteLength;
      if (byteLength2 > 0) {
        position2 += byteLength2;
        if (position2 > artifact.size) {
          throw new Error(`Agent Host debug log artifact exceeded its declared size of ${artifact.size} bytes`);
        }
        await stream.write(chunk2.data);
      }
      if (chunk2.eof) {
        break;
      }
      if (byteLength2 === 0) {
        throw new Error("Agent Host returned an empty debug log chunk before the end of the artifact");
      }
    }
    if (position2 !== artifact.size) {
      throw new Error(`Agent Host debug log artifact ended after ${position2} bytes, expected ${artifact.size}`);
    }
    stream.end();
  })().catch((error) => {
    stream.error(error instanceof Error ? error : new Error(String(error)));
    stream.end();
  });
  return stream;
}

async function collectAgentHostDebugLogs(accessor, activeSession, onDidCreateHostArtifact) {
  const agentHostService = accessor.get(IAgentHostService);
  const agentHostConnectionsService = accessor.get(IAgentHostConnectionsService);
  const remoteAgentHostService = accessor.get(IRemoteAgentHostService);
  const fileService = accessor.get(IFileService);
  const logService = accessor.get(ILogService);
  const environmentService = accessor.get(IWorkbenchEnvironmentService);
  const exportService = accessor.get(IAgentHostDebugLogsExportService);
  let connection;
  let backendSession;
  let backendChat;
  let sessionTitle = activeSession?.sessionTitle;
  if (activeSession) {
    const sessionResolution = agentHostConnectionsService.resolveSessionResource(activeSession.resource);
    if (!sessionResolution) {
      logService.warn(`[ExportAgentHostDebugLogs] No live Agent Host connection owns session ${activeSession.resource.toString()}; exporting client-owned logs only`);
    } else {
      connection = sessionResolution.connection;
      backendSession = sessionResolution.backendSession;
      const state = connection.getSubscriptionUnmanaged(1 /* Session */, backendSession)?.value;
      ({ backendChat, sessionTitle } = resolveAgentHostDebugLogsChat(activeSession, state));
      if (!backendChat) {
        const reason = !state || state instanceof Error ? "session state is unavailable" : `chat '${activeSession.chatId}' is unavailable`;
        logService.warn(`[ExportAgentHostDebugLogs] Cannot resolve the active chat because ${reason} for ${activeSession.resource.toString()}; exporting session and client-owned logs`);
      }
    }
  } else {
    connection = agentHostConnectionsService.ambientConnection;
  }
  let hostArtifact;
  if (connection) {
    try {
      hostArtifact = await connection.collectDebugLogs(backendSession, exportService.hostArtifactKind, backendChat);
      onDidCreateHostArtifact(hostArtifact);
    } catch (error) {
      logService.warn(`[ExportAgentHostDebugLogs] Failed to collect Agent Host logs: ${error instanceof Error ? error.message : String(error)}; exporting client-owned logs only`);
    }
  }
  let remainingInlineBytes = MAX_INLINE_DEBUG_LOGS_BYTES;
  const forwardedAgentHostLogFileNames = /* @__PURE__ */ new Set();
  let ahpLogNameFilter;
  if (activeSession) {
    if (activeSession.isLocal) {
      const localClientId = sanitizeFilePart(agentHostService.clientId);
      ahpLogNameFilter = (name) => name.includes(localClientId);
    } else {
      const remoteConnection = getRemoteConnectionForSession(activeSession.resource, remoteAgentHostService.connections);
      if (remoteConnection) {
        forwardedAgentHostLogFileNames.add(getOutputChannelLogFileName(remoteAgentHostLogOutputChannelId(remoteConnection.address)));
        const remoteConnectionId = sanitizeFilePart(remoteConnection.address);
        ahpLogNameFilter = (name) => name.includes(remoteConnectionId);
      }
    }
  } else {
    for (const remoteConnection of remoteAgentHostService.connections) {
      forwardedAgentHostLogFileNames.add(getOutputChannelLogFileName(remoteAgentHostLogOutputChannelId(remoteConnection.address)));
    }
  }
  const files = [];
  const appendFile = (file) => {
    files.push(file);
    if (hasKey(file, { contents: true })) {
      remainingInlineBytes -= file.size;
    }
  };
  const appendFiles = (collectedFiles) => {
    for (const file of collectedFiles) {
      appendFile(file);
    }
  };
  const processLogs = [
    { folder: "Window", resource: environmentService.logFile },
    { folder: "Shared", resource: joinPath(environmentService.logsHome, SHARED_PROCESS_LOG_FILE_NAME) }
  ];
  for (const processLog of processLogs) {
    try {
      appendFiles(await collectRotatedLogFiles(`vscode-logs/${processLog.folder}`, processLog.resource, fileService, remainingInlineBytes));
    } catch (error) {
      logService.warn(`[ExportAgentHostDebugLogs] Failed to collect rotated logs for '${processLog.resource.toString()}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  try {
    const forwardedLogs = await findOutputChannelLogFiles(environmentService.windowLogsPath, forwardedAgentHostLogFileNames, fileService);
    for (const forwardedLog of forwardedLogs) {
      const file = await createDebugLogFile(`vscode-logs/Agent Host/${basename2(forwardedLog)}`, forwardedLog, fileService, void 0, remainingInlineBytes);
      if (file) {
        appendFile(file);
      }
    }
  } catch (error) {
    logService.warn(`[ExportAgentHostDebugLogs] Failed to collect forwarded Agent Host logs: ${error instanceof Error ? error.message : String(error)}`);
  }
  try {
    const ahpDir = joinPath(environmentService.logsHome, "ahp");
    const stat = await fileService.resolve(ahpDir, { resolveMetadata: true });
    for (const child of stat.children ?? []) {
      if (child.isDirectory || !child.name.endsWith(".jsonl") || ahpLogNameFilter && !ahpLogNameFilter(child.name)) {
        continue;
      }
      try {
        const file = await createDebugLogFile(`ahp/${child.name}`, child.resource, fileService, child.size, remainingInlineBytes);
        if (file) {
          appendFile(file);
        }
      } catch (error) {
        logService.warn(`[ExportAgentHostDebugLogs] Failed to read AHP log '${child.name}': ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch {
  }
  const rawSessionId = getCopilotCliSessionRawId(activeSession?.resource);
  if (rawSessionId) {
    const sidecars = [
      { path: "usage.jsonl", resource: buildAgentHostUsageUri(environmentService.userRoamingDataHome, rawSessionId) },
      { path: "customizations.json", resource: buildAgentHostCustomizationsUri(environmentService.userRoamingDataHome, rawSessionId) }
    ];
    for (const sidecar of sidecars) {
      try {
        const file = await createDebugLogFile(sidecar.path, sidecar.resource, fileService, void 0, remainingInlineBytes);
        if (file) {
          appendFile(file);
        }
      } catch {
      }
    }
  }
  return {
    files,
    exportName: getAgentHostDebugLogsExportName(sessionTitle, activeSession?.chatTitle, activeSession?.chatId === DEFAULT_CHAT_ID),
    hostArtifact: hostArtifact && connection ? { artifact: hostArtifact, readChunk: createChunkReader(connection) } : void 0
  };
}

function getAgentHostDebugLogsExportName(sessionTitle, chatTitle, isPrimaryChat) {
  const namespace = [
    toDebugLogsTitleSlug(sessionTitle),
    ...!isPrimaryChat ? [toDebugLogsTitleSlug(chatTitle)] : []
  ].filter((title) => title.length > 0);
  return namespace.length > 0 ? `ah-logs-${namespace.join("--")}` : "ah-logs";
}

function toDebugLogsTitleSlug(title) {
  return title?.replace(/[/\\:*?"<>|\s]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) ?? "";
}

function createChunkReader(connection) {
  return (resource, position2) => connection.readDebugLogsChunk(resource, position2);
}

async function exportAgentHostDebugLogs(accessor, activeSession) {
  const exportService = accessor.get(IAgentHostDebugLogsExportService);
  const notificationService = accessor.get(INotificationService);
  const chatEntitlementService = accessor.get(IChatEntitlementService);
  const fileService = accessor.get(IFileService);
  const logService = accessor.get(ILogService);
  const progressService = accessor.get(IProgressService);
  let hostArtifact;
  try {
    const logs = await progressService.withProgress({
      location: 15 /* Notification */,
      title: localize(8865, null),
      delay: 500
    }, () => collectAgentHostDebugLogs(accessor, activeSession, (artifact) => hostArtifact = artifact));
    try {
      const saved = await exportService.save(logs.exportName, logs.files, logs.hostArtifact);
      if (saved) {
        notificationService.warn(chatEntitlementService.isInternal ? localize(8868, null) : localize(8867, null));
      }
    } catch (error) {
      notificationService.notify({
        severity: Severity2.Error,
        message: localize(8869, null, error instanceof Error ? error.message : String(error))
      });
    }
  } catch (error) {
    notificationService.notify({
      severity: Severity2.Error,
      message: localize(8864, null, error instanceof Error ? error.message : String(error))
    });
  } finally {
    if (hostArtifact) {
      try {
        await fileService.del(hostArtifact.resource, { recursive: hostArtifact.kind === "directory" });
      } catch (error) {
        logService.warn(`[ExportAgentHostDebugLogs] Failed to delete temporary Agent Host log artifact: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}

var ExportAgentHostDebugLogsAction = class _ExportAgentHostDebugLogsAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.exportAgentHostDebugLogs";
  }
  constructor() {
    super({
      id: _ExportAgentHostDebugLogsAction.ID,
      title: localize2(8863, "Export Agent Host Debug Logs..."),
      f1: true,
      category: Categories.Developer,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        IsWebContext.negate(),
        AGENT_HOST_ENABLED_CONTEXT_KEY
      )
    });
  }
  async run(accessor) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = chatWidgetService.lastFocusedWidget;
    const model = widget?.viewModel?.model;
    const activeSession = model ? toActiveAgentHostSession(model.sessionResource, model.title) : void 0;
    await exportAgentHostDebugLogs(accessor, activeSession);
  }
};

function toActiveAgentHostSession(resource, chatTitle, sessionTitle) {
  if (resource.scheme === COPILOT_CLI_LOCAL_AH_SCHEME) {
    return { resource: resource.with({ fragment: null }), sessionTitle, chatTitle, isLocal: true, chatId: resource.fragment || DEFAULT_CHAT_ID, backendChatResource: void 0 };
  }
  if (parseRemoteAuthorityFromScheme(resource.scheme)) {
    return { resource: resource.with({ fragment: null }), sessionTitle, chatTitle, isLocal: false, chatId: resource.fragment || DEFAULT_CHAT_ID, backendChatResource: void 0 };
  }
  return void 0;
}

async function exportFilesToLocalFolder(accessor, exportName, files, hostArtifact) {
  const fileDialogService = accessor.get(IFileDialogService);
  const fileService = accessor.get(IFileService);
  const logService = accessor.get(ILogService);
  const folders = await fileDialogService.showOpenDialog({
    title: localize(8866, null),
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    availableFileSystems: [Schemas.file]
  });
  const parentFolder = folders?.[0];
  if (!parentFolder) {
    return false;
  }
  const exportFolder = joinPath(parentFolder, exportName);
  await fileService.createFolder(exportFolder);
  if (hostArtifact) {
    try {
      if (hostArtifact.artifact.kind !== "directory") {
        throw new Error(`Expected an Agent Host debug-log directory, got ${hostArtifact.artifact.kind}`);
      }
      await copyHostArtifactDirectory(exportFolder, hostArtifact, fileService);
    } catch (error) {
      logService.warn(`[ExportAgentHostDebugLogs] Failed to save Agent Host logs: ${error instanceof Error ? error.message : String(error)}; saving client-owned logs only`);
    }
  }
  for (const file of files) {
    const segments = toSafeRelativePathSegments(file.path);
    if (segments.length === 0) {
      continue;
    }
    let folder = exportFolder;
    for (const segment of segments.slice(0, -1)) {
      folder = joinPath(folder, segment);
      await fileService.createFolder(folder);
    }
    const target = joinPath(folder, segments[segments.length - 1]);
    if (hasKey(file, { contents: true })) {
      await fileService.writeFile(target, VSBuffer.fromString(file.contents));
    } else {
      const source = await fileService.readFileStream(file.resource, { length: file.size });
      await fileService.writeFile(target, source.value);
    }
  }
  return true;
}

async function copyHostArtifactDirectory(target, hostArtifact, fileService) {
  let copiedSize = 0;
  for (const entry of hostArtifact.artifact.entries) {
    copiedSize += entry.size;
    if (copiedSize > hostArtifact.artifact.uncompressedSize) {
      throw new Error(`Agent Host debug-log directory exceeded its declared size of ${hostArtifact.artifact.uncompressedSize} bytes`);
    }
    const source = joinPath(hostArtifact.artifact.resource, ...entry.path.split("/"));
    const segments = toSafeRelativePathSegments(entry.path);
    if (segments.length === 0) {
      throw new Error(`Agent Host returned an invalid debug-log artifact path: ${entry.path}`);
    }
    let targetFolder = target;
    for (const segment of segments.slice(0, -1)) {
      targetFolder = joinPath(targetFolder, segment);
      await fileService.createFolder(targetFolder);
    }
    const entryTarget = joinPath(targetFolder, segments[segments.length - 1]);
    if (source.scheme === Schemas.file) {
      const sourceStat = await fileService.resolve(source, { resolveMetadata: true });
      if (!sourceStat.isFile || sourceStat.isSymbolicLink || sourceStat.size !== entry.size) {
        throw new Error(`Agent Host debug-log file no longer matches its manifest: ${entry.path}`);
      }
      await fileService.copy(source, entryTarget, true);
      continue;
    }
    const artifact = { ...hostArtifact.artifact, resource: source, size: entry.size, uncompressedSize: entry.size };
    await fileService.writeFile(entryTarget, createHostArtifactStream(artifact, (position2) => hostArtifact.readChunk(source, position2)));
  }
  if (copiedSize !== hostArtifact.artifact.uncompressedSize) {
    throw new Error(`Agent Host debug-log directory manifest accounts for ${copiedSize} bytes, expected ${hostArtifact.artifact.uncompressedSize}`);
  }
}

async function createDebugLogFile(path, resource, fileService, size3, maxInlineSize) {
  if (resource.scheme === Schemas.file || resource.scheme === Schemas.vscodeUserData) {
    const observedSize2 = size3 ?? (await fileService.resolve(resource, { resolveMetadata: true })).size;
    return { path, resource, size: observedSize2 };
  }
  const observedSize = size3 ?? (await fileService.resolve(resource, { resolveMetadata: true })).size;
  const readSize = Math.min(observedSize, maxInlineSize);
  if (readSize === 0) {
    return void 0;
  }
  const stream = await fileService.readFileStream(resource, { position: observedSize - readSize, length: readSize });
  return createInlineDebugLogFile(path, await streamToBuffer(stream.value), maxInlineSize);
}

function createInlineDebugLogFile(path, content, maxInlineSize) {
  const size3 = Math.min(content.byteLength, maxInlineSize);
  if (size3 === 0) {
    return void 0;
  }
  const capturedContent = size3 === content.byteLength ? content : content.slice(content.byteLength - size3);
  return { path, contents: capturedContent.toString(), size: size3 };
}

async function collectRotatedLogFiles(path, current, fileService, maxInlineSize = MAX_INLINE_DEBUG_LOGS_BYTES) {
  const currentName = basename2(current);
  const parent = await fileService.resolve(dirname2(current), { resolveMetadata: true });
  const files = [];
  let remainingInlineSize = maxInlineSize;
  for (const child of parent.children ?? []) {
    if (child.isFile && !child.isSymbolicLink && isRotatedLogFile(child.name, currentName)) {
      const file = await createDebugLogFile(`${path}/${child.name}`, child.resource, fileService, child.size, remainingInlineSize);
      if (file) {
        files.push(file);
        if (hasKey(file, { contents: true })) {
          remainingInlineSize -= file.size;
        }
      }
    }
  }
  return files;
}

async function findOutputChannelLogFiles(windowLogsPath, fileNames, fileService) {
  if (fileNames.size === 0) {
    return [];
  }
  const windowLogs = await fileService.resolve(windowLogsPath);
  const outputFolders = (windowLogs.children ?? []).filter((child) => child.isDirectory && child.name.startsWith(OUTPUT_LOG_FOLDER_PREFIX)).sort((a, b) => b.name.localeCompare(a.name));
  const remaining = new Set(fileNames);
  const result = [];
  for (const outputFolder of outputFolders) {
    const folder = await fileService.resolve(outputFolder.resource);
    for (const child of folder.children ?? []) {
      if (child.isFile && !child.isSymbolicLink && remaining.delete(child.name)) {
        result.push(child.resource);
      }
    }
    if (remaining.size === 0) {
      break;
    }
  }
  return result;
}

function getOutputChannelLogFileName(channelId) {
  return `${channelId.replace(/[\\/:\*\?"<>\|]/g, "")}.log`;
}

function isRotatedLogFile(candidate, current) {
  if (candidate === current) {
    return true;
  }
  const stem = current.endsWith(".log") ? current.slice(0, -".log".length) : current;
  const prefix = `${stem}.`;
  if (!candidate.startsWith(prefix) || !candidate.endsWith(".log")) {
    return false;
  }
  const rotation = candidate.slice(prefix.length, -".log".length);
  return /^[1-9]\d*$/.test(rotation);
}

function toSafeRelativePathSegments(path) {
  return path.replace(/\\/g, "/").split("/").filter((segment) => {
    return segment.length > 0 && segment !== "." && segment !== "..";
  }).map((segment) => segment.replace(/[/\\:*?"<>|]/g, "-"));
}
export { resolveAgentHostDebugLogsChat, createHostArtifactStream, collectAgentHostDebugLogs, getAgentHostDebugLogsExportName, toDebugLogsTitleSlug, createChunkReader, exportAgentHostDebugLogs, toActiveAgentHostSession, exportFilesToLocalFolder, copyHostArtifactDirectory, createDebugLogFile, createInlineDebugLogFile, collectRotatedLogFiles, findOutputChannelLogFiles, getOutputChannelLogFileName, isRotatedLogFile, toSafeRelativePathSegments, SHARED_PROCESS_LOG_FILE_NAME, OUTPUT_LOG_FOLDER_PREFIX, MAX_INLINE_DEBUG_LOGS_BYTES, IAgentHostDebugLogsExportService, BrowserAgentHostDebugLogsExportService, ExportAgentHostDebugLogsAction };
