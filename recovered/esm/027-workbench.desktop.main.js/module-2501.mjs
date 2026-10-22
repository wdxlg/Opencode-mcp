// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/model/chatSessionStore.ts
import { Disposable } from "./module-0012.mjs";
import { Sequencer } from "./module-0036.mjs";
import { isEqual2, joinPath } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { IWorkspaceContextService, isEmptyWorkspaceIdentifier } from "./module-0509.mjs";
import { IFileService, toFileOperationResult } from "./module-0269.mjs";
import { URI } from "./module-0032.mjs";
import { LocalChatSessionUri, getChatSessionStorageResource } from "./module-0961.mjs";
import { stringifyEntryWithFallback } from "./module-2499.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { revive } from "./module-0265.mjs";
import { ChatModel, normalizeSerializableChatData } from "./module-1193.mjs";
import { ChatSessionOperationLog } from "./module-2500.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceEditingService } from "./module-1314.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { awaitStatsForSession } from "./module-1188.mjs";


// src/vs/workbench/contrib/chat/common/model/chatSessionStore.ts
var maxPersistedSessions = 400;

var ChatIndexStorageKey = "chat.ChatSessionStore.index";

var ChatTransferIndexStorageKey = "ChatSessionStore.transferIndex";

var ChatSessionStore = class extends Disposable {
  constructor(fileService, environmentService, logService, workspaceContextService, telemetryService, storageService, lifecycleService, userDataProfilesService, configurationService, workspaceEditingService, dialogService, openerService) {
    super();
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.logService = logService;
    this.workspaceContextService = workspaceContextService;
    this.telemetryService = telemetryService;
    this.storageService = storageService;
    this.lifecycleService = lifecycleService;
    this.userDataProfilesService = userDataProfilesService;
    this.configurationService = configurationService;
    this.workspaceEditingService = workspaceEditingService;
    this.dialogService = dialogService;
    this.openerService = openerService;
    this.storeQueue = new Sequencer();
    this.shuttingDown = false;
    this._didReportIssue = false;
    const workspace = this.workspaceContextService.getWorkspace();
    const isEmptyWindow = !workspace.configuration && workspace.folders.length === 0;
    const workspaceId = this.workspaceContextService.getWorkspace().id;
    this.storageRoot = isEmptyWindow ? joinPath(this.userDataProfilesService.defaultProfile.globalStorageHome, "emptyWindowChatSessions") : joinPath(this.environmentService.workspaceStorageHome, workspaceId, "chatSessions");
    this.previousEmptyWindowStorageRoot = isEmptyWindow ? joinPath(this.environmentService.workspaceStorageHome, "no-workspace", "chatSessions") : void 0;
    this.transferredSessionStorageRoot = joinPath(this.userDataProfilesService.defaultProfile.globalStorageHome, "transferredChatSessions");
    this._register(this.workspaceEditingService.onDidEnterWorkspace((event) => {
      const transitionPromise = this.storeQueue.queue(() => this.handleWorkspaceTransition(event.oldWorkspace, event.newWorkspace));
      event.join(transitionPromise);
    }));
    this._register(this.lifecycleService.onWillShutdown((e) => {
      this.shuttingDown = true;
      if (!this.storeTask) {
        return;
      }
      e.join(this.storeTask, {
        id: "join.chatSessionStore",
        label: localize(12997, null)
      });
    }));
  }
  async handleWorkspaceTransition(oldWorkspace, newWorkspace) {
    const wasEmptyWindow = isEmptyWorkspaceIdentifier(oldWorkspace);
    const isNewWorkspaceEmpty = isEmptyWorkspaceIdentifier(newWorkspace);
    const oldWorkspaceId = oldWorkspace.id;
    const newWorkspaceId = newWorkspace.id;
    this.logService.info(`ChatSessionStore: Workspace transition from ${oldWorkspaceId} to ${newWorkspaceId}`);
    const oldStorageRoot = wasEmptyWindow ? joinPath(this.userDataProfilesService.defaultProfile.globalStorageHome, "emptyWindowChatSessions") : joinPath(this.environmentService.workspaceStorageHome, oldWorkspaceId, "chatSessions");
    const newStorageRoot = isNewWorkspaceEmpty ? joinPath(this.userDataProfilesService.defaultProfile.globalStorageHome, "emptyWindowChatSessions") : joinPath(this.environmentService.workspaceStorageHome, newWorkspaceId, "chatSessions");
    if (isEqual2(oldStorageRoot, newStorageRoot)) {
      this.storageRoot = newStorageRoot;
      return;
    }
    this.storageRoot = newStorageRoot;
    await this.migrateSessionsToNewWorkspace(oldStorageRoot, wasEmptyWindow, isNewWorkspaceEmpty);
  }
  async migrateSessionsToNewWorkspace(oldStorageRoot, wasEmptyWindow, isNewWorkspaceEmpty) {
    try {
      const oldStorageExists = await this.fileService.exists(oldStorageRoot);
      if (!oldStorageExists) {
        this.logService.info(`ChatSessionStore: Old storage location does not exist, skipping migration`);
        return;
      }
      const oldDirectory = await this.fileService.resolve(oldStorageRoot);
      if (!oldDirectory.children) {
        this.logService.info(`ChatSessionStore: No children in old storage location, skipping migration`);
        return;
      }
      this.logService.info(`ChatSessionStore: Found ${oldDirectory.children.length} files in old storage location`);
      let migratedCount = 0;
      for (const child of oldDirectory.children) {
        if (!child.isDirectory && (child.name.endsWith(".json") || child.name.endsWith(".jsonl"))) {
          const oldFilePath = child.resource;
          const newFilePath = joinPath(this.storageRoot, child.name);
          try {
            await this.fileService.copy(oldFilePath, newFilePath, false);
            migratedCount++;
          } catch (e) {
            if (toFileOperationResult(e) === 4 /* FILE_MOVE_CONFLICT */) {
              this.logService.trace(`ChatSessionStore: Session file ${child.name} already exists at target, skipping`);
            } else {
              this.reportError("sessionMigration", `Error migrating chat session file ${child.name}`, e);
            }
          }
        }
      }
      this.logService.info(`ChatSessionStore: Copied ${migratedCount} chat session files from ${wasEmptyWindow ? "empty window" : oldStorageRoot.toString()} to ${isNewWorkspaceEmpty ? "empty window" : this.storageRoot.toString()} (originals preserved at old location)`);
      this.indexCache = void 0;
      try {
        await this.flushIndex();
      } catch (e) {
        this.reportError("migrateWorkspace", "Error flushing chat session index after workspace migration", e);
      }
    } catch (e) {
      this.reportError("migrateWorkspace", "Error migrating chat sessions to new workspace", e);
    }
  }
  async storeSessions(sessions) {
    if (this.shuttingDown) {
      return;
    }
    try {
      this.storeTask = this.storeQueue.queue(async () => {
        try {
          await Promise.all(sessions.map((session) => this.writeSession(session)));
          await this.trimEntries();
          await this.flushIndex();
        } catch (e) {
          this.reportError("storeSessions", "Error storing chat sessions", e);
        }
      });
      await this.storeTask;
    } finally {
      this.storeTask = void 0;
    }
  }
  async storeSessionsMetadataOnly(sessions) {
    if (this.shuttingDown) {
      return;
    }
    try {
      this.storeTask = this.storeQueue.queue(async () => {
        try {
          await Promise.all(sessions.map((session) => this.writeSessionMetadataOnly(session)));
          await this.flushIndex();
        } catch (e) {
          this.reportError("storeSessions", "Error storing chat sessions", e);
        }
      });
      await this.storeTask;
    } finally {
      this.storeTask = void 0;
    }
  }
  async storeTransferSession(transferData, session) {
    const index2 = this.getTransferredSessionIndex();
    const workspaceKey = transferData.toWorkspace.toString();
    const existingTransfer = index2[workspaceKey];
    if (existingTransfer) {
      try {
        const existingSessionResource = URI.revive(existingTransfer.sessionResource);
        if (existingSessionResource && LocalChatSessionUri.parseLocalSessionId(existingSessionResource)) {
          const existingStorageLocation = this.getTransferredSessionStorageLocation(existingSessionResource);
          await this.fileService.del(existingStorageLocation);
        }
      } catch (e) {
        if (toFileOperationResult(e) !== 1 /* FILE_NOT_FOUND */) {
          this.reportError("storeTransferSession", "Error deleting old transferred session file", e);
        }
      }
    }
    try {
      const content2 = stringifyEntryWithFallback(session);
      const storageLocation = this.getTransferredSessionStorageLocation(session.sessionResource);
      await this.fileService.writeFile(storageLocation, VSBuffer.fromString(content2));
    } catch (e) {
      this.reportError("sessionWrite", "Error writing chat session", e);
      return;
    }
    index2[workspaceKey] = transferData;
    try {
      this.storageService.store(ChatTransferIndexStorageKey, index2, 0 /* PROFILE */, 1 /* MACHINE */);
    } catch (e) {
      this.reportError("storeTransferSession", "Error storing chat transfer session", e);
    }
  }
  getTransferredSessionIndex() {
    try {
      const data = this.storageService.getObject(ChatTransferIndexStorageKey, 0 /* PROFILE */, {});
      return data;
    } catch (e) {
      this.reportError("getTransferredSessionIndex", "Error reading chat transfer index", e);
      return {};
    }
  }
  static {
    this.TRANSFER_EXPIRATION_MS = 60 * 1e3 * 5;
  }
  getTransferredSessionData() {
    try {
      const index2 = this.getTransferredSessionIndex();
      const workspaceFolders = this.workspaceContextService.getWorkspace().folders;
      if (workspaceFolders.length !== 1) {
        return void 0;
      }
      const workspaceKey = workspaceFolders[0].uri.toString();
      const transferredSessionForWorkspace = index2[workspaceKey];
      if (!transferredSessionForWorkspace) {
        return void 0;
      }
      const revivedTransferData = revive(transferredSessionForWorkspace);
      if (Date.now() - transferredSessionForWorkspace.timestampInMilliseconds > ChatSessionStore.TRANSFER_EXPIRATION_MS) {
        this.logService.info("ChatSessionStore: Transferred session has expired");
        this.cleanupTransferredSession(revivedTransferData.sessionResource);
        return void 0;
      }
      return !!LocalChatSessionUri.parseLocalSessionId(revivedTransferData.sessionResource) && revivedTransferData.sessionResource;
    } catch (e) {
      this.reportError("getTransferredSession", "Error getting transferred chat session URI", e);
      return void 0;
    }
  }
  async readTransferredSession(sessionResource) {
    try {
      const storageLocation = this.getTransferredSessionStorageLocation(sessionResource);
      const sessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
      if (!sessionId) {
        return void 0;
      }
      const sessionData = await this.readSessionFromLocation(storageLocation, void 0, sessionId);
      await this.cleanupTransferredSession(sessionResource);
      return sessionData;
    } catch (e) {
      this.reportError("getTransferredSession", "Error getting transferred chat session", e);
      return void 0;
    }
  }
  async cleanupTransferredSession(sessionResource) {
    try {
      const index2 = this.getTransferredSessionIndex();
      const workspaceFolders = this.workspaceContextService.getWorkspace().folders;
      if (workspaceFolders.length === 1) {
        const workspaceKey = workspaceFolders[0].uri.toString();
        delete index2[workspaceKey];
        this.storageService.store(ChatTransferIndexStorageKey, index2, 0 /* PROFILE */, 1 /* MACHINE */);
      }
      const storageLocation = this.getTransferredSessionStorageLocation(sessionResource);
      await this.fileService.del(storageLocation);
    } catch (e) {
      if (toFileOperationResult(e) !== 1 /* FILE_NOT_FOUND */) {
        this.reportError("cleanupTransferredSession", "Error cleaning up transferred session", e);
      }
    }
  }
  async writeSession(session) {
    try {
      const index2 = this.internalGetIndex();
      const storageLocation = this.getStorageLocation(session.sessionId);
      if (storageLocation.log) {
        if (session instanceof ChatModel) {
          if (!session.dataSerializer) {
            session.dataSerializer = new ChatSessionOperationLog();
          }
          let op;
          let data;
          try {
            ({ op, data } = session.dataSerializer.write(session));
          } catch (e) {
            if (!this._didReportIssue) {
              this._didReportIssue = true;
              this.dialogService.prompt({
                custom: true,
                // so text is copyable
                title: localize(12995, null),
                message: localize(12996, null, e.stack || toErrorMessage(e)),
                buttons: [
                  { label: localize(12999, null), run: () => this.openerService.open("https://github.com/microsoft/vscode/issues/new?template=bug_report.md") }
                ]
              });
            }
            throw e;
          }
          if (data.byteLength > 0) {
            await this.fileService.writeFile(storageLocation.log, data, { append: op === "append" });
          }
          session.dataSerializer.confirmWrite();
        } else {
          const content2 = new ChatSessionOperationLog().createInitialFromSerialized(session);
          await this.fileService.writeFile(storageLocation.log, content2);
        }
      } else {
        await this.fileService.writeFile(storageLocation.flat, VSBuffer.fromString(stringifyEntryWithFallback(session)));
      }
      const newMetadata = await getSessionMetadata(session);
      index2.entries[session.sessionId] = newMetadata;
    } catch (e) {
      this.reportError("sessionWrite", "Error writing chat session", e);
    }
  }
  async writeSessionMetadataOnly(session) {
    if (LocalChatSessionUri.parseLocalSessionId(session.sessionResource)) {
      return;
    }
    try {
      const index2 = this.internalGetIndex();
      const externalSessionId = session.sessionResource.toString();
      index2.entries[externalSessionId] = await getSessionMetadata(session);
    } catch (e) {
      this.reportError("sessionMetadataWrite", "Error writing chat session metadata", e);
    }
  }
  async flushIndex() {
    const index2 = this.internalGetIndex();
    try {
      this.storageService.store(ChatIndexStorageKey, index2, this.getIndexStorageScope(), 1 /* MACHINE */);
    } catch (e) {
      this.reportError("indexWrite", "Error writing index", e);
    }
  }
  getIndexStorageScope() {
    const workspace = this.workspaceContextService.getWorkspace();
    const isEmptyWindow = !workspace.configuration && workspace.folders.length === 0;
    return isEmptyWindow ? -1 /* APPLICATION */ : 1 /* WORKSPACE */;
  }
  async trimEntries() {
    const index2 = this.internalGetIndex();
    const entries2 = Object.entries(index2.entries).filter(([_id, entry]) => !entry.isExternal).sort((a, b) => b[1].lastMessageDate - a[1].lastMessageDate).map(([id2]) => id2);
    if (entries2.length > maxPersistedSessions) {
      const entriesToDelete = entries2.slice(maxPersistedSessions);
      for (const entry of entriesToDelete) {
        delete index2.entries[entry];
      }
      this.logService.trace(`ChatSessionStore: Trimmed ${entriesToDelete.length} old chat sessions from index`);
    }
  }
  async internalDeleteSession(sessionId) {
    const index2 = this.internalGetIndex();
    if (!index2.entries[sessionId]) {
      return;
    }
    let storageLocation;
    try {
      storageLocation = this.getStorageLocation(sessionId);
    } catch (e) {
      this.reportError("invalidSessionId", `Removing invalid chat session from index: ${sessionId}`, e);
      delete index2.entries[sessionId];
      return;
    }
    for (const uri5 of [storageLocation.flat, storageLocation.log]) {
      try {
        if (uri5) {
          await this.fileService.del(uri5);
        }
      } catch (e) {
        if (toFileOperationResult(e) !== 1 /* FILE_NOT_FOUND */) {
          this.reportError("sessionDelete", "Error deleting chat session", e);
        }
      }
      delete index2.entries[sessionId];
    }
  }
  hasSessions() {
    return Object.keys(this.internalGetIndex().entries).length > 0;
  }
  isSessionEmpty(sessionId) {
    const index2 = this.internalGetIndex();
    return index2.entries[sessionId]?.isEmpty ?? true;
  }
  async deleteSession(sessionId) {
    await this.storeQueue.queue(async () => {
      await this.internalDeleteSession(sessionId);
      await this.flushIndex();
    });
  }
  async clearAllSessions() {
    await this.storeQueue.queue(async () => {
      const index2 = this.internalGetIndex();
      const entries2 = Object.keys(index2.entries);
      this.logService.info(`ChatSessionStore: Clearing ${entries2.length} chat sessions`);
      await Promise.all(entries2.map((entry) => this.internalDeleteSession(entry)));
      await this.flushIndex();
    });
  }
  async setSessionTitle(sessionId, title) {
    await this.storeQueue.queue(async () => {
      const index2 = this.internalGetIndex();
      if (index2.entries[sessionId]) {
        index2.entries[sessionId].title = title;
      }
    });
  }
  reportError(reasonForTelemetry, message, error) {
    const fileOperationReason = error && toFileOperationResult(error);
    if (fileOperationReason === 1 /* FILE_NOT_FOUND */) {
      this.logService.trace(`ChatSessionStore: ` + message, toErrorMessage(error));
    } else {
      this.logService.error(`ChatSessionStore: ` + message, toErrorMessage(error));
    }
    this.telemetryService.publicLog2("chatSessionStoreError", {
      reason: reasonForTelemetry,
      fileOperationReason: fileOperationReason ?? -1
    });
  }
  internalGetIndex() {
    if (this.indexCache) {
      return this.indexCache;
    }
    const data = this.storageService.get(ChatIndexStorageKey, this.getIndexStorageScope(), void 0);
    if (!data) {
      this.indexCache = { version: 1, entries: {} };
      return this.indexCache;
    }
    try {
      const index2 = JSON.parse(data);
      if (isChatSessionIndex(index2)) {
        this.indexCache = index2;
      } else {
        this.reportError("invalidIndexFormat", `Invalid index format: ${data}`);
        this.indexCache = { version: 1, entries: {} };
      }
    } catch (e) {
      this.reportError("invalidIndexJSON", `Index corrupt: ${data}`, e);
      this.indexCache = { version: 1, entries: {} };
    }
    for (const entry of Object.values(this.indexCache.entries)) {
      entry.timing ??= {
        created: entry.lastMessageDate,
        lastRequestStarted: void 0,
        lastRequestEnded: entry.lastMessageDate
      };
      entry.lastResponseState ??= entry.lastResponseState === 0 /* Pending */ || entry.lastResponseState === 4 /* NeedsInput */ ? 1 /* Complete */ : entry.lastResponseState || 1 /* Complete */;
    }
    return this.indexCache;
  }
  async getIndex() {
    return this.storeQueue.queue(async () => {
      return this.internalGetIndex().entries;
    });
  }
  getMetadataForSessionSync(sessionResource) {
    const index2 = this.internalGetIndex();
    return index2.entries[this.getIndexKey(sessionResource)];
  }
  getIndexKey(sessionResource) {
    const sessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
    return sessionId ?? sessionResource.toString();
  }
  logIndex() {
    const data = this.storageService.get(ChatIndexStorageKey, this.getIndexStorageScope(), void 0);
    this.logService.info("ChatSessionStore index: ", data);
  }
  async migrateDataIfNeeded(getInitialData) {
    await this.storeQueue.queue(async () => {
      const data = this.storageService.get(ChatIndexStorageKey, this.getIndexStorageScope(), void 0);
      const needsMigrationFromStorageService = !data;
      if (needsMigrationFromStorageService) {
        const initialData = getInitialData();
        if (initialData) {
          await this.migrate(initialData);
        }
      }
    });
  }
  async migrate(initialData) {
    const numSessions = Object.keys(initialData).length;
    this.logService.info(`ChatSessionStore: Migrating ${numSessions} chat sessions from storage service to file system`);
    await Promise.all(Object.values(initialData).map(async (session) => {
      await this.writeSession(session);
    }));
    await this.flushIndex();
  }
  async readSession(sessionId) {
    return await this.storeQueue.queue(async () => {
      let storageLocation;
      try {
        storageLocation = this.getStorageLocation(sessionId);
      } catch (e) {
        this.reportError("invalidSessionId", `Ignoring invalid chat session from index: ${sessionId}`, e);
        const index2 = this.internalGetIndex();
        if (index2.entries[sessionId]) {
          delete index2.entries[sessionId];
          await this.flushIndex();
        }
        return void 0;
      }
      return this.readSessionFromLocation(storageLocation.flat, storageLocation.log, sessionId);
    });
  }
  async readSessionFromLocation(flatStorageLocation, logStorageLocation, sessionId) {
    let fromLocation = flatStorageLocation;
    let rawData;
    if (logStorageLocation) {
      try {
        rawData = (await this.fileService.readFile(logStorageLocation)).value;
        fromLocation = logStorageLocation;
      } catch (e) {
        this.reportError("sessionReadFile", `Error reading log chat session file ${sessionId}`, e);
      }
    }
    if (!rawData) {
      try {
        rawData = (await this.fileService.readFile(flatStorageLocation)).value;
        fromLocation = flatStorageLocation;
      } catch (e) {
        this.reportError("sessionReadFile", `Error reading flat chat session file ${sessionId}`, e);
        if (toFileOperationResult(e) === 1 /* FILE_NOT_FOUND */ && this.previousEmptyWindowStorageRoot) {
          rawData = await this.readSessionFromPreviousLocation(sessionId);
        }
      }
    }
    if (!rawData) {
      return void 0;
    }
    try {
      let session;
      const log4 = new ChatSessionOperationLog();
      if (fromLocation === logStorageLocation) {
        session = revive(log4.read(rawData));
      } else {
        session = revive(JSON.parse(rawData.toString()));
      }
      for (const request2 of session.requests) {
        if (Array.isArray(request2.response)) {
          request2.response = request2.response.map((response) => {
            if (typeof response === "string") {
              return new MarkdownString(response);
            }
            return response;
          });
        } else if (typeof request2.response === "string") {
          request2.response = [new MarkdownString(request2.response)];
        }
      }
      return { value: normalizeSerializableChatData(session), serializer: log4 };
    } catch (err) {
      this.reportError("malformedSession", `Malformed session data in ${fromLocation.fsPath}: [${rawData.slice(0, 20).toString()}${rawData.byteLength > 20 ? "..." : ""}]`, err);
      return void 0;
    }
  }
  async readSessionFromPreviousLocation(sessionId) {
    let rawData;
    if (this.previousEmptyWindowStorageRoot) {
      const storageLocation2 = getChatSessionStorageResource(this.previousEmptyWindowStorageRoot, sessionId, ".json");
      try {
        rawData = (await this.fileService.readFile(storageLocation2)).value;
        this.logService.info(`ChatSessionStore: Read chat session ${sessionId} from previous location`);
      } catch (e) {
        this.reportError("sessionReadFile", `Error reading chat session file ${sessionId} from previous location`, e);
        return void 0;
      }
    }
    return rawData;
  }
  getStorageLocation(chatSessionId) {
    return {
      flat: getChatSessionStorageResource(this.storageRoot, chatSessionId, ".json"),
      // todo@connor4312: remove after stabilizing
      log: this.configurationService.getValue("chat.useLogSessionStorage") !== false ? getChatSessionStorageResource(this.storageRoot, chatSessionId, ".jsonl") : void 0
    };
  }
  getTransferredSessionStorageLocation(sessionResource) {
    const sessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
    if (!sessionId) {
      throw new Error(`Invalid local chat session resource: ${sessionResource.toString()}`);
    }
    return getChatSessionStorageResource(this.transferredSessionStorageRoot, sessionId, ".json");
  }
  /**
   * Synchronously update the in-memory index entries for the given sessions
   * and flush the index to storage. This ensures the index is persisted
   * even when called from a synchronous `onWillSaveState` handler where
   * async file-write work would complete after the storage service has
   * already flushed.
   */
  updateAndFlushIndexSync(localSessions, externalSessions) {
    const index2 = this.internalGetIndex();
    for (const session of localSessions) {
      index2.entries[session.sessionId] = getSessionMetadataSync(session);
    }
    for (const session of externalSessions) {
      const externalSessionId = session.sessionResource.toString();
      index2.entries[externalSessionId] = getSessionMetadataSync(session);
    }
    try {
      this.storageService.store(ChatIndexStorageKey, index2, this.getIndexStorageScope(), 1 /* MACHINE */);
    } catch (e) {
      this.reportError("indexWrite", "Error writing index synchronously", e);
    }
  }
  getChatStorageFolder() {
    return this.storageRoot;
  }
};

ChatSessionStore = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ILifecycleService),
  __decorateParam(7, IUserDataProfilesService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IWorkspaceEditingService),
  __decorateParam(10, IDialogService),
  __decorateParam(11, IOpenerService)
], ChatSessionStore);

function isChatSessionEntryMetadata(obj) {
  return !!obj && typeof obj === "object" && typeof obj.sessionId === "string" && typeof obj.title === "string" && typeof obj.lastMessageDate === "number";
}

function isChatSessionIndex(data) {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const index2 = data;
  if (index2.version !== 1) {
    return false;
  }
  if (typeof index2.entries !== "object" || index2.entries === null) {
    return false;
  }
  for (const key3 in index2.entries) {
    if (!isChatSessionEntryMetadata(index2.entries[key3])) {
      return false;
    }
  }
  return true;
}

function getSessionMetadataSync(session) {
  const title = session.customTitle || session.title;
  let lastResponseState = session.lastRequest?.response?.state ?? 1 /* Complete */;
  if (lastResponseState === 0 /* Pending */ || lastResponseState === 4 /* NeedsInput */) {
    lastResponseState = 2 /* Cancelled */;
  }
  const isExternal = !LocalChatSessionUri.parseLocalSessionId(session.sessionResource);
  const rawInputState = isExternal ? session.inputModel.toJSON() : void 0;
  const inputState = rawInputState ? { ...rawInputState, attachments: [] } : void 0;
  return {
    sessionId: session.sessionId,
    title: title || localize(12998, null),
    lastMessageDate: session.lastMessageDate,
    timing: session.timing,
    initialLocation: session.initialLocation,
    hasPendingEdits: session.editingSession?.entries.get().some((e) => e.state.get() === 0 /* Modified */) ?? false,
    isEmpty: session.getRequests().length === 0,
    isExternal,
    lastResponseState,
    permissionLevel: session.inputModel.state.get()?.permissionLevel,
    inputState,
    workingDirectory: session.workingDirectory?.toString()
  };
}

async function getSessionMetadata(session) {
  if (session instanceof ChatModel) {
    const metadata = getSessionMetadataSync(session);
    metadata.stats = await awaitStatsForSession(session);
    return metadata;
  }
  const lastMessageDate = session.requests.at(-1)?.timestamp ?? session.creationDate;
  return {
    sessionId: session.sessionId,
    title: session.customTitle || localize(12998, null),
    lastMessageDate,
    timing: {
      created: session.creationDate,
      lastRequestStarted: session.requests.at(-1)?.timestamp,
      lastRequestEnded: lastMessageDate
    },
    initialLocation: session.initialLocation,
    hasPendingEdits: false,
    isEmpty: session.requests.length === 0,
    isExternal: false,
    lastResponseState: 1 /* Complete */
  };
}
export { isChatSessionEntryMetadata, isChatSessionIndex, getSessionMetadataSync, getSessionMetadata, maxPersistedSessions, ChatIndexStorageKey, ChatTransferIndexStorageKey, ChatSessionStore };
