// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingSessionStorage.ts
import { getKeyForChatSessionResource } from "./module-2687.mjs";
import { joinPath } from "./module-0034.mjs";
import { getChatSessionStorageResource } from "./module-0962.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { revive } from "./module-0265.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { hashAsync } from "./module-0039.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingSessionStorage.ts
var STORAGE_CONTENTS_FOLDER = "contents";

var STORAGE_STATE_FILE = "state.json";

var ChatEditingSessionStorage = class {
  constructor(_chatSessionResource, _fileService, _environmentService, _logService, _workspaceContextService) {
    this._chatSessionResource = _chatSessionResource;
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this._logService = _logService;
    this._workspaceContextService = _workspaceContextService;
    this.storageKey = getKeyForChatSessionResource(_chatSessionResource);
  }
  _getStorageLocation() {
    const workspaceId = this._workspaceContextService.getWorkspace().id;
    const storageRoot = joinPath(this._environmentService.workspaceStorageHome, workspaceId, "chatEditingSessions");
    return getChatSessionStorageResource(storageRoot, this.storageKey);
  }
  async restoreState() {
    const storageLocation = this._getStorageLocation();
    const fileContents = /* @__PURE__ */ new Map();
    const getFileContent = (hash2) => {
      let readPromise = fileContents.get(hash2);
      if (!readPromise) {
        readPromise = this._fileService.readFile(joinPath(storageLocation, STORAGE_CONTENTS_FOLDER, hash2)).then((content) => content.value.toString());
        fileContents.set(hash2, readPromise);
      }
      return readPromise;
    };
    const deserializeSnapshotEntriesDTO = async (dtoEntries) => {
      const entries2 = new ResourceMap();
      for (const entryDTO of dtoEntries) {
        const entry = await deserializeSnapshotEntry(entryDTO);
        entries2.set(entry.resource, entry);
      }
      return entries2;
    };
    const deserializeChatEditingStopDTO = async (stopDTO) => {
      const entries2 = await deserializeSnapshotEntriesDTO(stopDTO.entries);
      return { stopId: "stopId" in stopDTO ? stopDTO.stopId : void 0, entries: entries2 };
    };
    const deserializeSnapshotEntry = async (entry) => {
      return {
        resource: URI.parse(entry.resource),
        languageId: entry.languageId,
        original: await getFileContent(entry.originalHash),
        current: await getFileContent(entry.currentHash),
        state: entry.state,
        snapshotUri: URI.parse(entry.snapshotUri),
        telemetryInfo: {
          requestId: entry.telemetryInfo.requestId,
          agentId: entry.telemetryInfo.agentId,
          command: entry.telemetryInfo.command,
          sessionResource: this._chatSessionResource,
          result: void 0,
          modelId: entry.telemetryInfo.modelId,
          modeId: entry.telemetryInfo.modeId,
          applyCodeBlockSuggestionId: entry.telemetryInfo.applyCodeBlockSuggestionId,
          feature: entry.telemetryInfo.feature
        },
        isDeleted: entry.isDeleted
      };
    };
    try {
      const stateFilePath = joinPath(storageLocation, STORAGE_STATE_FILE);
      if (!await this._fileService.exists(stateFilePath)) {
        this._logService.debug(`chatEditingSession: No editing session state found at ${stateFilePath.toString()}`);
        return void 0;
      }
      this._logService.debug(`chatEditingSession: Restoring editing session at ${stateFilePath.toString()}`);
      const stateFileContent = await this._fileService.readFile(stateFilePath);
      const data = JSON.parse(stateFileContent.value.toString());
      if (!COMPATIBLE_STORAGE_VERSIONS.includes(data.version)) {
        return void 0;
      }
      const initialFileContents = new ResourceMap();
      for (const fileContentDTO of data.initialFileContents) {
        initialFileContents.set(URI.parse(fileContentDTO[0]), await getFileContent(fileContentDTO[1]));
      }
      const recentSnapshot = await deserializeChatEditingStopDTO(data.recentSnapshot);
      return {
        initialFileContents,
        recentSnapshot,
        timeline: revive(data.timeline)
      };
    } catch (e4) {
      this._logService.error(`Error restoring chat editing session from ${storageLocation.toString()}`, e4);
    }
    return void 0;
  }
  async storeState(state) {
    const storageFolder = this._getStorageLocation();
    const contentsFolder = URI.joinPath(storageFolder, STORAGE_CONTENTS_FOLDER);
    const existingContents = /* @__PURE__ */ new Set();
    try {
      const stat = await this._fileService.resolve(contentsFolder);
      stat.children?.forEach((child) => {
        if (child.isFile) {
          existingContents.add(child.name);
        }
      });
    } catch (e4) {
      try {
        await this._fileService.createFolder(contentsFolder);
      } catch (e5) {
        this._logService.error(`Error creating chat editing session content folder ${contentsFolder.toString()}`, e5);
        return;
      }
    }
    const contentWritePromises = /* @__PURE__ */ new Map();
    const writeContent = async (content) => {
      const buffer = VSBuffer.fromString(content);
      const hash2 = (await hashAsync(buffer)).substring(0, 7);
      if (!existingContents.has(hash2)) {
        await this._fileService.writeFile(joinPath(contentsFolder, hash2), buffer);
      }
      return hash2;
    };
    const addFileContent = async (content) => {
      let storedContentHash = contentWritePromises.get(content);
      if (!storedContentHash) {
        storedContentHash = writeContent(content);
        contentWritePromises.set(content, storedContentHash);
      }
      return storedContentHash;
    };
    const serializeResourceMap = async (resourceMap, serialize2) => {
      return await Promise.all(Array.from(resourceMap.entries()).map(async ([resourceURI, value2]) => [resourceURI.toString(), await serialize2(value2)]));
    };
    const serializeChatEditingSessionStop = async (stop) => {
      return {
        stopId: stop.stopId,
        entries: await Promise.all(Array.from(stop.entries.values()).map(serializeSnapshotEntry))
      };
    };
    const serializeSnapshotEntry = async (entry) => {
      return {
        resource: entry.resource.toString(),
        languageId: entry.languageId,
        originalHash: await addFileContent(entry.original),
        currentHash: await addFileContent(entry.current),
        state: entry.state,
        snapshotUri: entry.snapshotUri.toString(),
        telemetryInfo: { requestId: entry.telemetryInfo.requestId, agentId: entry.telemetryInfo.agentId, command: entry.telemetryInfo.command, modelId: entry.telemetryInfo.modelId, modeId: entry.telemetryInfo.modeId },
        isDeleted: entry.isDeleted
      };
    };
    try {
      const data = {
        version: STORAGE_VERSION,
        initialFileContents: await serializeResourceMap(state.initialFileContents, (value2) => addFileContent(value2)),
        timeline: state.timeline,
        recentSnapshot: await serializeChatEditingSessionStop(state.recentSnapshot)
      };
      this._logService.debug(`chatEditingSession: Storing editing session at ${storageFolder.toString()}: ${contentWritePromises.size} files`);
      await this._fileService.writeFile(joinPath(storageFolder, STORAGE_STATE_FILE), VSBuffer.fromString(JSON.stringify(data)));
    } catch (e4) {
      this._logService.debug(`Error storing chat editing session to ${storageFolder.toString()}`, e4);
    }
  }
  async clearState() {
    const storageFolder = this._getStorageLocation();
    if (await this._fileService.exists(storageFolder)) {
      this._logService.debug(`chatEditingSession: Clearing editing session at ${storageFolder.toString()}`);
      try {
        await this._fileService.del(storageFolder, { recursive: true });
      } catch (e4) {
        this._logService.debug(`Error clearing chat editing session from ${storageFolder.toString()}`, e4);
      }
    }
  }
};

ChatEditingSessionStorage = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IWorkspaceContextService)
], ChatEditingSessionStorage);

var COMPATIBLE_STORAGE_VERSIONS = [1, 2];

var STORAGE_VERSION = 2;
export { STORAGE_CONTENTS_FOLDER, STORAGE_STATE_FILE, ChatEditingSessionStorage, COMPATIBLE_STORAGE_VERSIONS, STORAGE_VERSION };
