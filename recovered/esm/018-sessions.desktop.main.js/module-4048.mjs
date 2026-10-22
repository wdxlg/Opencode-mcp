// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/ahpJsonlLogger.ts
import { Disposable } from "./module-0012.mjs";
import { joinPath } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { URI, isUriComponents } from "./module-0032.mjs";


// src/vs/platform/agentHost/common/ahpJsonlLogger.ts
var AHP_LOG_DIR = "ahp";

var DEFAULT_MAX_FILE_SIZE_BYTES = 75 * 1024 * 1024;

var DEFAULT_MAX_FILES = 5;

var MAX_BATCH_BYTES = 1024 * 1024;

var MAX_LOG_LINE_LENGTH = 1024 * 1024;

var MAX_LOGGED_STRING_LENGTH = 16 * 1024;

var AhpJsonlLogger = class extends Disposable {
  constructor(_options, _fileService, _logService) {
    super();
    this._options = _options;
    this._fileService = _fileService;
    this._logService = _logService;
    this._currentSize = 0;
    this._segment = 0;
    this._queue = Promise.resolve();
    this._pending = [];
    this._drainScheduled = false;
    this._directory = joinPath(this._options.logsHome, AHP_LOG_DIR);
    const safeConnectionId = sanitizeFilePart2(this._options.connectionId).slice(0, 64);
    this._baseName = `ahp-${toFileTimestamp(/* @__PURE__ */ new Date())}-${safeConnectionId}.jsonl`;
    this._maxFileSizeBytes = this._options.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
    this._maxFiles = this._options.maxFiles ?? DEFAULT_MAX_FILES;
    this._currentFile = joinPath(this._directory, this._baseName);
  }
  get resource() {
    return this._currentFile;
  }
  log(message, dir, byteLength2) {
    const meta = {
      ts: (/* @__PURE__ */ new Date()).toISOString(),
      dir,
      connectionId: this._options.connectionId,
      transport: this._options.transport,
      ...typeof byteLength2 === "number" ? { byteLength: byteLength2 } : {}
    };
    const entry = { ...message, _ahpLog: meta };
    let body = stringifyAhpLogEntry(entry);
    if (body.length > MAX_LOG_LINE_LENGTH) {
      meta.truncated = true;
      body = stringifyAhpLogEntryTruncated(entry, MAX_LOGGED_STRING_LENGTH);
    }
    const line = `${body}
`;
    this._pending.push(VSBuffer.fromString(line));
    this._scheduleDrain();
  }
  async flush() {
    await this._queue;
  }
  _scheduleDrain() {
    if (this._drainScheduled) {
      return;
    }
    this._drainScheduled = true;
    this._queue = this._queue.then(() => this._drainPending()).catch((error) => {
      this._logService.error("[AHPLog] Failed to write transport log", error);
    });
  }
  async _drainPending() {
    this._drainScheduled = false;
    if (this._pending.length === 0) {
      return;
    }
    const buffers = this._pending;
    this._pending = [];
    if (!this._folderCreated) {
      this._folderCreated = this._fileService.createFolder(this._directory);
    }
    await this._folderCreated;
    if (this._currentSize === 0) {
      this._currentSize = await this._getFileSize(this._currentFile);
    }
    let chunk2 = [];
    let chunkSize = 0;
    const flushChunk = async () => {
      if (chunk2.length === 0) {
        return;
      }
      const combined = chunk2.length === 1 ? chunk2[0] : VSBuffer.concat(chunk2, chunkSize);
      await this._fileService.writeFile(this._currentFile, combined, { append: true });
      this._currentSize += combined.byteLength;
      chunk2 = [];
      chunkSize = 0;
    };
    for (const buffer of buffers) {
      const totalInFile = this._currentSize + chunkSize;
      if (totalInFile > 0 && totalInFile + buffer.byteLength > this._maxFileSizeBytes) {
        await flushChunk();
        await this._rotate();
      } else if (chunkSize > 0 && chunkSize + buffer.byteLength > MAX_BATCH_BYTES) {
        await flushChunk();
      }
      chunk2.push(buffer);
      chunkSize += buffer.byteLength;
    }
    await flushChunk();
  }
  async _rotate() {
    this._segment++;
    const oldSegment = this._segment - this._maxFiles;
    if (oldSegment >= 0) {
      await this._fileService.del(this._resourceForSegment(oldSegment)).catch((error) => {
        this._logService.trace("[AHPLog] Failed to delete old transport log", error);
      });
    }
    this._currentFile = this._resourceForSegment(this._segment);
    this._currentSize = await this._getFileSize(this._currentFile);
  }
  _resourceForSegment(segment) {
    if (segment === 0) {
      return joinPath(this._directory, this._baseName);
    }
    const currentBaseName = this._baseName.slice(0, -".jsonl".length);
    return joinPath(this._directory, `${currentBaseName}.${segment}.jsonl`);
  }
  async _getFileSize(resource) {
    try {
      return (await this._fileService.resolve(resource)).size ?? 0;
    } catch {
      return 0;
    }
  }
};

AhpJsonlLogger = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService)
], AhpJsonlLogger);

function getAhpLogByteLength(text2) {
  return VSBuffer.fromString(text2).byteLength;
}

function stringifyAhpLogEntry(value2) {
  return JSON.stringify(value2, _ahpReplacer);
}

function stringifyAhpLogEntryTruncated(value2, maxStringLength) {
  return JSON.stringify(value2, function(key3, val) {
    const revived = _ahpReplacer.call(this, key3, val);
    if (typeof revived === "string" && revived.length > maxStringLength) {
      return `${revived.slice(0, maxStringLength)}\u2026[${revived.length - maxStringLength} more chars elided]`;
    }
    return revived;
  });
}

function _ahpReplacer(_key, value2) {
  if (value2 && typeof value2 === "object" && value2.$mid === 1 /* Uri */ && isUriComponents(value2)) {
    return URI.revive(value2).toString();
  }
  return value2;
}

function toFileTimestamp(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function sanitizeFilePart2(value2) {
  return value2.replace(/[\\/:\*\?"<>\|\s]+/g, "-").replace(/^-+|-+$/g, "") || "connection";
}
export { getAhpLogByteLength, stringifyAhpLogEntry, stringifyAhpLogEntryTruncated, _ahpReplacer, toFileTimestamp, sanitizeFilePart2, AHP_LOG_DIR, DEFAULT_MAX_FILE_SIZE_BYTES, DEFAULT_MAX_FILES, MAX_BATCH_BYTES, MAX_LOG_LINE_LENGTH, MAX_LOGGED_STRING_LENGTH, AhpJsonlLogger };
