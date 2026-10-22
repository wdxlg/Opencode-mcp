// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/agentHostLogSources.ts
import { COPILOT_CLI_LOCAL_AH_SCHEME, buildLocalCopilotLogsUri, buildRemoteCopilotLogsUri, getCopilotCliSessionRawId, parseRemoteAuthorityFromScheme, resolveEventsUri } from "./module-1110.mjs";
import { agentHostAuthority, toAgentHostUri } from "./module-1001.mjs";
import { localize } from "./module-0001.mjs";
import { AgentHostAhpJsonlLoggingSettingId } from "./module-1108.mjs";
import { AGENT_HOST_LOG_OUTPUT_CHANNEL_ID, remoteAgentHostLogOutputChannelId } from "./module-1736.mjs";
import { joinPath } from "./module-0034.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/agentHostLogSources.ts
var WINDOW_LOG_CHANNEL_ID = "rendererLog";

var SHARED_PROCESS_LOG_CHANNEL_ID = "shared";

var MAX_COPILOT_LOG_SCAN_FILES = 10;

var MAX_COPILOT_LOG_SCAN_FILE_SIZE = 1024 * 1024 * 1024;

var MAX_COPILOT_LOG_VIEW_FILE_SIZE = 10 * 1024 * 1024;

var DEFAULT_RAW_LOG_VIEW_CAP_BYTES = 2 * 1024 * 1024;

function isAgentHostSession(resource) {
  if (!resource) {
    return false;
  }
  return resource.scheme === COPILOT_CLI_LOCAL_AH_SCHEME || !!parseRemoteAuthorityFromScheme(resource.scheme);
}

function getRemoteConnectionForSession(sessionResource, connections) {
  const authority = parseRemoteAuthorityFromScheme(sessionResource.scheme);
  return authority ? connections.find((connection) => agentHostAuthority(connection.address) === authority) : void 0;
}

function sanitizeFilePart(value2) {
  return value2.replace(/[\\/:\*\?"<>|\s]+/g, "-").replace(/^-+|-+$/g, "") || "connection";
}

async function enumerateAgentHostLogSources(services, sessionResource) {
  if (!isAgentHostSession(sessionResource) || !sessionResource) {
    return [];
  }
  const { pathService, agentHostService, remoteAgentHostService, outputService, fileService, configurationService, environmentService } = services;
  const userHome = pathService.userHome({ preferLocal: true });
  const isLocal = sessionResource.scheme === COPILOT_CLI_LOCAL_AH_SCHEME;
  const remoteConnection = isLocal ? void 0 : getRemoteConnectionForSession(sessionResource, remoteAgentHostService.connections);
  const sources = [];
  const eventsResult = resolveEventsUri(
    sessionResource,
    userHome,
    (authority) => remoteAgentHostService.connections.find((c) => agentHostAuthority(c.address) === authority)
  );
  if (eventsResult.kind === "ok") {
    sources.push({
      id: "events",
      label: localize(10329, null),
      kind: "events" /* Events */,
      isRemote: !isLocal,
      resource: eventsResult.resource
    });
  }
  if (configurationService.getValue(AgentHostAhpJsonlLoggingSettingId)) {
    const nameToken = isLocal ? sanitizeFilePart(agentHostService.clientId) : remoteConnection ? sanitizeFilePart(remoteConnection.address) : void 0;
    const wireFiles = await listWireLogFiles(fileService, environmentService, nameToken);
    wireFiles.forEach((file, index2) => {
      sources.push({
        id: `wire:${file.resource.toString()}`,
        label: index2 === 0 ? localize(10331, null) : localize(10332, null, file.name),
        kind: "wire" /* WireLog */,
        isRemote: !isLocal,
        resource: file.resource
      });
    });
  }
  const channelIds = [];
  if (isLocal) {
    channelIds.push(AGENT_HOST_LOG_OUTPUT_CHANNEL_ID);
  } else if (remoteConnection) {
    channelIds.push(remoteAgentHostLogOutputChannelId(remoteConnection.address));
  }
  channelIds.push(WINDOW_LOG_CHANNEL_ID, SHARED_PROCESS_LOG_CHANNEL_ID);
  for (const channelId of channelIds) {
    const descriptor = outputService.getChannelDescriptor(channelId);
    if (!descriptor) {
      continue;
    }
    sources.push({
      id: `channel:${channelId}`,
      label: localize(10327, null, descriptor.label),
      kind: "processChannel" /* ProcessChannel */,
      isRemote: !isLocal,
      channelId
    });
  }
  if (remoteConnection?.defaultDirectory) {
    sources.push({
      id: "remoteProcessLog",
      label: localize(10330, null),
      kind: "remoteProcessLog" /* RemoteProcessLog */,
      isRemote: true,
      remoteConnection
    });
  }
  const rawSessionId = getCopilotCliSessionRawId(sessionResource);
  if (rawSessionId) {
    const copilotLogsDir = isLocal ? buildLocalCopilotLogsUri(userHome) : remoteConnection ? buildRemoteCopilotLogsUri(remoteConnection) : void 0;
    if (copilotLogsDir) {
      sources.push({
        id: "cliLog",
        label: localize(10328, null),
        kind: "cliLog" /* CliLog */,
        isRemote: !isLocal,
        cliLogs: { dir: copilotLogsDir, rawSessionId }
      });
    }
  }
  return sources;
}

async function readAgentHostLogSourceContent(source, services, capBytes = DEFAULT_RAW_LOG_VIEW_CAP_BYTES) {
  const { fileService, outputService, textModelService, productService, logService } = services;
  switch (source.kind) {
    case "events" /* Events */:
    case "wire" /* WireLog */: {
      if (!source.resource) {
        return void 0;
      }
      return readFileTail(fileService, source.resource, capBytes);
    }
    case "processChannel" /* ProcessChannel */: {
      if (!source.channelId) {
        return void 0;
      }
      const channel = outputService.getChannel(source.channelId);
      if (!channel) {
        return void 0;
      }
      const modelRef = await textModelService.createModelReference(channel.uri);
      try {
        const value2 = modelRef.object.textEditorModel.getValue();
        return tailString(value2, capBytes);
      } finally {
        modelRef.dispose();
      }
    }
    case "remoteProcessLog" /* RemoteProcessLog */: {
      if (!source.remoteConnection) {
        return void 0;
      }
      const value2 = await readRemoteAgentHostLog(source.remoteConnection, productService.serverDataFolderName, fileService);
      return value2 === void 0 ? void 0 : tailString(value2, capBytes);
    }
    case "cliLog" /* CliLog */: {
      if (!source.cliLogs) {
        return void 0;
      }
      const files = await readCopilotLogsForSession(source.cliLogs.dir, source.cliLogs.rawSessionId, fileService, logService);
      if (files.length === 0) {
        return { text: "", totalBytes: 0, truncated: false };
      }
      const combined = files.map((f) => `===== ${f.path} =====
${f.contents}`).join("\n\n");
      return tailString(combined, capBytes);
    }
  }
}

async function listWireLogFiles(fileService, environmentService, nameToken) {
  const ahpDir = joinPath(environmentService.logsHome, "ahp");
  let children;
  try {
    children = (await fileService.resolve(ahpDir, { resolveMetadata: true })).children;
  } catch {
    return [];
  }
  const files = (children ?? []).filter((child) => !child.isDirectory && child.name.endsWith(".jsonl")).map((child) => ({ resource: child.resource, name: child.name, mtime: child.mtime ?? 0 }));
  const matching = nameToken ? files.filter((file) => file.name.includes(nameToken)) : [];
  const selected = matching.length > 0 ? matching : files;
  return selected.sort((a, b) => b.mtime - a.mtime);
}

async function readFileTail(fileService, resource, capBytes) {
  let size3;
  try {
    size3 = (await fileService.resolve(resource, { resolveMetadata: true })).size;
  } catch {
    size3 = void 0;
  }
  if (size3 !== void 0 && size3 > capBytes) {
    const content2 = await fileService.readFile(resource, { position: size3 - capBytes, length: capBytes });
    let text2 = content2.value.toString();
    const firstNewline = text2.indexOf("\n");
    if (firstNewline >= 0) {
      text2 = text2.slice(firstNewline + 1);
    }
    return { text: text2, totalBytes: size3, truncated: true, fileResource: resource };
  }
  const content = await fileService.readFile(resource, { limits: { size: capBytes } });
  return { text: content.value.toString(), totalBytes: size3, truncated: false, fileResource: resource };
}

function tailString(value2, capBytes) {
  if (value2.length <= capBytes) {
    return { text: value2, totalBytes: value2.length, truncated: false };
  }
  let text2 = value2.slice(value2.length - capBytes);
  const firstNewline = text2.indexOf("\n");
  if (firstNewline >= 0) {
    text2 = text2.slice(firstNewline + 1);
  }
  return { text: text2, totalBytes: value2.length, truncated: true };
}

async function readCopilotLogsForSession(logsDir, rawSessionId, fileService, logService) {
  const matchingLogs = await findRelevantCopilotLogs(logsDir, rawSessionId, fileService, logService);
  const files = [];
  for (const log4 of matchingLogs) {
    try {
      const content = log4.size > MAX_COPILOT_LOG_VIEW_FILE_SIZE ? await fileService.readFile(log4.resource, { position: log4.size - MAX_COPILOT_LOG_VIEW_FILE_SIZE, length: MAX_COPILOT_LOG_VIEW_FILE_SIZE }) : await fileService.readFile(log4.resource, { limits: { size: MAX_COPILOT_LOG_VIEW_FILE_SIZE } });
      files.push({ path: log4.path, contents: content.value.toString() });
    } catch (error) {
      logService.warn(`[AgentHostLogSources] Failed to read Copilot log '${log4.resource.path}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return files;
}

async function findRelevantCopilotLogs(logsDir, rawSessionId, fileService, logService) {
  let children;
  try {
    children = (await fileService.resolve(logsDir, { resolveMetadata: true })).children;
  } catch {
    return [];
  }
  const processLogs = (children ?? []).filter((child) => !child.isDirectory && child.name.endsWith(".log")).sort((a, b) => b.mtime - a.mtime).map((child) => ({ path: `copilot-logs/${child.name}`, resource: child.resource, size: child.size }));
  const files = [];
  const candidateLogs = processLogs.slice(0, MAX_COPILOT_LOG_SCAN_FILES).filter((child) => child.size <= MAX_COPILOT_LOG_SCAN_FILE_SIZE);
  if (rawSessionId) {
    for (const candidate of candidateLogs) {
      try {
        if (await logStreamContains(candidate.resource, rawSessionId, fileService)) {
          files.push(candidate);
        }
      } catch (error) {
        logService.warn(`[AgentHostLogSources] Failed to scan Copilot log '${candidate.path}': ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  return files.length > 0 ? files : processLogs.slice(0, 1);
}

async function logStreamContains(resource, rawSessionId, fileService) {
  const tokenSource = new CancellationTokenSource();
  let stream;
  try {
    stream = (await fileService.readFileStream(resource, {
      length: MAX_COPILOT_LOG_SCAN_FILE_SIZE,
      limits: { size: MAX_COPILOT_LOG_SCAN_FILE_SIZE }
    }, tokenSource.token)).value;
  } catch (error) {
    tokenSource.dispose(true);
    throw error;
  }
  return new Promise((resolve3, reject) => {
    let settled = false;
    let previous = "";
    const cleanup = (removeErrorListener) => {
      stream.removeListener("data", onData);
      stream.removeListener("end", onEnd);
      if (removeErrorListener) {
        stream.removeListener("error", onError);
      }
    };
    const settle = (contains2) => {
      if (settled) {
        return;
      }
      settled = true;
      tokenSource.dispose(contains2);
      cleanup(!contains2);
      resolve3(contains2);
    };
    const onData = (chunk2) => {
      const text2 = previous + chunk2.toString();
      if (text2.includes(rawSessionId)) {
        settle(true);
        return;
      }
      previous = text2.slice(Math.max(0, text2.length - rawSessionId.length + 1));
    };
    const onError = (error) => {
      if (settled) {
        return;
      }
      settled = true;
      tokenSource.dispose();
      cleanup(true);
      reject(error);
    };
    const onEnd = () => {
      settle(false);
    };
    stream.on("error", onError);
    stream.on("end", onEnd);
    stream.on("data", onData);
  });
}

async function readRemoteAgentHostLog(connection, serverDataFolderName, fileService) {
  const homePath = connection.defaultDirectory;
  if (!homePath) {
    return void 0;
  }
  const authority = agentHostAuthority(connection.address);
  const homeUri = toAgentHostUri(URI.from({ scheme: "file", path: homePath }), authority);
  const candidates = /* @__PURE__ */ new Set();
  if (serverDataFolderName) {
    candidates.add(serverDataFolderName);
    if (serverDataFolderName.endsWith("-dev")) {
      candidates.add(serverDataFolderName.slice(0, -"-dev".length));
    }
  }
  candidates.add(".vscode-server");
  candidates.add(".vscode-server-insiders");
  candidates.add(".vscode-server-oss");
  candidates.add(".vscode-server-exploration");
  let best;
  for (const folderName of candidates) {
    const logsDirUri = joinPath(homeUri, folderName, "data", "logs");
    let entries2;
    try {
      const stat = await fileService.resolve(logsDirUri, { resolveMetadata: true });
      entries2 = stat.children;
    } catch {
      continue;
    }
    if (!entries2) {
      continue;
    }
    for (const dir of entries2) {
      if (!dir.isDirectory) {
        continue;
      }
      const logUri = joinPath(dir.resource, "agenthost.log");
      let logStat;
      try {
        logStat = await fileService.resolve(logUri, { resolveMetadata: true });
      } catch {
        continue;
      }
      const mtime = logStat.mtime ?? 0;
      if (!best || mtime > best.mtime) {
        best = { uri: logUri, mtime };
      }
    }
  }
  if (!best) {
    return void 0;
  }
  const content = await fileService.readFile(best.uri);
  return content.value.toString();
}
export { isAgentHostSession, getRemoteConnectionForSession, sanitizeFilePart, enumerateAgentHostLogSources, readAgentHostLogSourceContent, listWireLogFiles, readFileTail, tailString, readCopilotLogsForSession, findRelevantCopilotLogs, logStreamContains, readRemoteAgentHostLog, WINDOW_LOG_CHANNEL_ID, SHARED_PROCESS_LOG_CHANNEL_ID, MAX_COPILOT_LOG_SCAN_FILES, MAX_COPILOT_LOG_SCAN_FILE_SIZE, MAX_COPILOT_LOG_VIEW_FILE_SIZE, DEFAULT_RAW_LOG_VIEW_CAP_BYTES };
