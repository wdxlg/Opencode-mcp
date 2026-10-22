// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostStorageService.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { Throttler } from "./module-0027.mjs";
import { dirname } from "./module-0018.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostStorageService.ts
import * as fs3 from "fs";

var IAgentHostStorageService = createDecorator("agentHostStorageService");

var defaultStorageWriter = {
  mkdir: (path) => fs3.promises.mkdir(path, { recursive: true }).then(() => void 0),
  writeFile: (path, contents) => fs3.promises.writeFile(path, contents, "utf8")
};

var AgentHostStorageService = class extends Disposable {
  constructor(_resource, _logService, _writer = defaultStorageWriter) {
    super();
    this._resource = _resource;
    this._logService = _logService;
    this._writer = _writer;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._writeThrottler = this._register(new Throttler());
    this._pendingWrites = /* @__PURE__ */ new Set();
    this._data = this._load();
  }
  get(key) {
    return this._data[key];
  }
  get loadError() {
    return this._loadError;
  }
  set(key, value) {
    this._throwIfLoadFailed();
    this._data[key] = value;
    this._onDidChange.fire(key);
    this._scheduleWrite();
  }
  async setAndFlush(key, value) {
    const hadPrevious = Object.hasOwn(this._data, key);
    const previous = this._data[key];
    this.set(key, value);
    try {
      await this.whenIdle();
    } catch (error) {
      if (this._data[key] === value) {
        if (hadPrevious) {
          this._data[key] = previous;
        } else {
          delete this._data[key];
        }
        this._onDidChange.fire(key);
        this._scheduleWrite();
      }
      throw error;
    }
  }
  delete(key) {
    this._throwIfLoadFailed();
    if (!Object.hasOwn(this._data, key)) {
      return;
    }
    delete this._data[key];
    this._onDidChange.fire(key);
    this._scheduleWrite();
  }
  async whenIdle() {
    this._throwIfLoadFailed();
    while (this._pendingWrites.size > 0) {
      await Promise.allSettled([...this._pendingWrites]);
    }
    if (this._lastWriteError) {
      throw this._lastWriteError;
    }
  }
  _load() {
    if (this._resource === void 0) {
      return {};
    }
    try {
      const value = JSON.parse(fs3.readFileSync(this._resource.fsPath, "utf8"));
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
      }
      this._logService.warn(`[AgentHostStorageService] Ignoring non-object storage data: ${this._resource.toString()}`);
      this._loadError = new Error(`Agent Host storage does not contain a JSON object: ${this._resource.toString()}`);
    } catch (err) {
      if (err.code !== "ENOENT") {
        this._logService.warn(`[AgentHostStorageService] Failed to read storage: ${this._resource.toString()}`, err);
        this._loadError = err instanceof Error ? err : new Error(String(err));
      }
    }
    return {};
  }
  _scheduleWrite() {
    const resource = this._resource;
    if (resource === void 0) {
      return;
    }
    const write2 = this._writeThrottler.queue(async () => {
      await this._writer.mkdir(dirname(resource.fsPath));
      await this._writer.writeFile(resource.fsPath, JSON.stringify(this._data));
    });
    this._pendingWrites.add(write2);
    const untrack = () => this._pendingWrites.delete(write2);
    void write2.then(
      () => {
        this._lastWriteError = void 0;
        untrack();
      },
      (error) => {
        this._lastWriteError = error instanceof Error ? error : new Error(String(error));
        this._logService.error(`[AgentHostStorageService] Failed to write storage: ${resource.toString()}`, error);
        untrack();
      }
    );
  }
  _throwIfLoadFailed() {
    if (this._loadError) {
      throw new Error("Agent Host storage is unavailable because its persisted data could not be loaded.", { cause: this._loadError });
    }
  }
};

AgentHostStorageService = __decorateClass([
  __decorateParam(1, ILogService)
], AgentHostStorageService);
export { fs3, IAgentHostStorageService, defaultStorageWriter, AgentHostStorageService };
