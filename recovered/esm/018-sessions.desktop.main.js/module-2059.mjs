// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/agentsVoice/common/voiceTranscriptStore.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Sequencer } from "./module-0036.mjs";
import { joinPath } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { IFileService, toFileOperationResult } from "./module-0269.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/agentsVoice/common/voiceTranscriptStore.ts
var IVoiceTranscriptStore = createDecorator("voiceTranscriptStore");

var VoiceTranscriptStore = class extends Disposable {
  constructor(fileService, storageService, userDataProfilesService, lifecycleService, logService) {
    super();
    this.fileService = fileService;
    this.storageService = storageService;
    this.lifecycleService = lifecycleService;
    this.logService = logService;
    this.writeQueue = new Sequencer();
    this.shuttingDown = false;
    this.storageRoot = joinPath(
      userDataProfilesService.defaultProfile.globalStorageHome,
      "voiceTranscripts"
    );
    this.indexCache = this.readIndexFromStorage();
    this._register(this.lifecycleService.onWillShutdown((e4) => {
      this.shuttingDown = true;
      if (!this.pendingWrite) {
        return;
      }
      e4.join(this.pendingWrite, {
        id: "join.voiceTranscriptStore",
        label: localize(7898, null)
      });
    }));
  }
  // --- Public API ---
  async appendTurn(userId, turn) {
    if (this.shuttingDown) {
      this.logService.warn(`VoiceTranscriptStore: ignoring appendTurn for ${userId} (shutting down)`);
      return;
    }
    const work = this.writeQueue.queue(() => this.doAppendTurn(userId, turn));
    this.pendingWrite = work;
    try {
      await work;
    } finally {
      if (this.pendingWrite === work) {
        this.pendingWrite = void 0;
      }
    }
  }
  async loadTurns(userId, opts) {
    const file = this.fileFor(userId);
    let raw;
    try {
      const content = await this.fileService.readFile(file);
      raw = content.value.toString();
    } catch (e4) {
      if (toFileOperationResult(e4) === 1 /* FILE_NOT_FOUND */) {
        return [];
      }
      this.logService.error(`VoiceTranscriptStore: failed to read transcript for ${userId}`, e4);
      return [];
    }
    const turns = [];
    let sawLegacyEntry = false;
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (!parsed.kind) {
          sawLegacyEntry = true;
          break;
        }
        if (opts?.since && parsed.timestamp && parsed.timestamp < opts.since) {
          continue;
        }
        turns.push(parsed);
      } catch (e4) {
        this.logService.warn(`VoiceTranscriptStore: skipping malformed line in ${userId}.jsonl: ${e4.message}`);
      }
    }
    if (sawLegacyEntry) {
      this.logService.info(`VoiceTranscriptStore: detected pre-timeline transcript for ${userId}, wiping for new schema`);
      await this.deleteAll(userId);
      return [];
    }
    if (opts?.limit !== void 0 && turns.length > opts.limit) {
      return turns.slice(turns.length - opts.limit);
    }
    return turns;
  }
  getIndexEntry(userId) {
    return this.indexCache.entries[userId];
  }
  async archiveUpTo(userId, cutoff) {
    const existing = this.indexCache.entries[userId];
    if (!existing) {
      return;
    }
    this.updateIndexEntry(userId, { ...existing, archivedBefore: cutoff });
  }
  async unarchive(userId) {
    const existing = this.indexCache.entries[userId];
    if (!existing) {
      return;
    }
    const { archivedBefore: _unused, ...rest } = existing;
    this.updateIndexEntry(userId, rest);
  }
  async deleteAll(userId) {
    const file = this.fileFor(userId);
    try {
      await this.fileService.del(file);
    } catch (e4) {
      if (toFileOperationResult(e4) !== 1 /* FILE_NOT_FOUND */) {
        this.logService.error(`VoiceTranscriptStore: failed to delete transcript for ${userId}`, e4);
      }
    }
    const next = { ...this.indexCache.entries };
    delete next[userId];
    this.indexCache = { ...this.indexCache, entries: next };
    this.flushIndex();
  }
  // --- Internals ---
  fileFor(userId) {
    const safe = userId.replace(/[^A-Za-z0-9-]/g, "_");
    if (!safe) {
      throw new Error("Invalid userId for transcript storage");
    }
    return joinPath(this.storageRoot, `${safe}.jsonl`);
  }
  async doAppendTurn(userId, turn) {
    const file = this.fileFor(userId);
    const line = JSON.stringify(turn) + "\n";
    try {
      try {
        await this.fileService.createFolder(this.storageRoot);
      } catch {
      }
      await this.fileService.writeFile(file, VSBuffer.fromString(line), { append: true });
    } catch (e4) {
      this.logService.error(`VoiceTranscriptStore: failed to append turn for ${userId}`, e4);
      return;
    }
    const existing = this.indexCache.entries[userId];
    const next = existing ? {
      ...existing,
      lastUpdatedAt: turn.timestamp,
      turnCount: existing.turnCount + 1
    } : {
      userId,
      createdAt: turn.timestamp,
      lastUpdatedAt: turn.timestamp,
      turnCount: 1
    };
    this.updateIndexEntry(userId, next);
  }
  updateIndexEntry(userId, entry) {
    this.indexCache = {
      ...this.indexCache,
      entries: { ...this.indexCache.entries, [userId]: entry }
    };
    this.flushIndex();
  }
  flushIndex() {
    try {
      this.storageService.store(
        "agentsVoice.transcriptIndex" /* TranscriptIndex */,
        JSON.stringify(this.indexCache),
        0 /* PROFILE */,
        1 /* MACHINE */
      );
    } catch (e4) {
      this.logService.error(`VoiceTranscriptStore: failed to flush transcript index`, e4);
    }
  }
  readIndexFromStorage() {
    const raw = this.storageService.get(
      "agentsVoice.transcriptIndex" /* TranscriptIndex */,
      0 /* PROFILE */
    );
    if (!raw) {
      return { entries: {}, version: 1 };
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.entries && parsed.version === 1) {
        return parsed;
      }
      this.logService.warn("VoiceTranscriptStore: ignoring index with unknown shape, starting fresh");
    } catch (e4) {
      this.logService.warn("VoiceTranscriptStore: failed to parse stored index, starting fresh", e4);
    }
    return { entries: {}, version: 1 };
  }
};

VoiceTranscriptStore = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IUserDataProfilesService),
  __decorateParam(3, ILifecycleService),
  __decorateParam(4, ILogService)
], VoiceTranscriptStore);

registerSingleton(IVoiceTranscriptStore, VoiceTranscriptStore, 1 /* Delayed */);
export { IVoiceTranscriptStore, VoiceTranscriptStore };
