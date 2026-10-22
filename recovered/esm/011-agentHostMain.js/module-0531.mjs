// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostWorkspaceFiles.ts
import { Limiter } from "./module-0027.mjs";
import { Disposable } from "./module-0010.mjs";
import { Schemas } from "./module-0024.mjs";
import { CancellationError } from "./module-0002.mjs";
import { CancellationToken } from "./module-0017.mjs";
import { rgDiskPath } from "./module-0121.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostWorkspaceFiles.ts
import * as cp3 from "child_process";

var MAX_FILES = 5e4;

var CACHE_TTL_MS = 3e4;

var MAX_CONCURRENT_ENUMERATIONS = 4;

var enumerationLimiter = new Limiter(MAX_CONCURRENT_ENUMERATIONS);

var AgentHostWorkspaceFiles = class extends Disposable {
  constructor(_logService) {
    super();
    this._logService = _logService;
    this._cache = /* @__PURE__ */ new Map();
    /** Active ripgrep child processes, killed on dispose. */
    this._activeChildren = /* @__PURE__ */ new Set();
    this._isDisposed = false;
  }
  dispose() {
    this._isDisposed = true;
    for (const child of this._activeChildren) {
      try {
        child.kill();
      } catch {
      }
    }
    this._activeChildren.clear();
    this._cache.clear();
    super.dispose();
  }
  /**
   * Return the list of files under `workingDirectory`. Concurrent calls
   * with the same working directory share an in-flight enumeration.
   *
   * Only `file://` URIs are supported. Other schemes return an empty list.
   */
  async getFiles(workingDirectory, token) {
    if (workingDirectory.scheme !== Schemas.file) {
      return { files: [], isTruncated: false };
    }
    const key = workingDirectory.toString();
    const now = Date.now();
    const existing = this._cache.get(key);
    let shared;
    if (existing && (existing.expiresAt === void 0 || existing.expiresAt > now)) {
      shared = existing.promise;
    } else {
      shared = enumerationLimiter.queue(() => this._isDisposed ? Promise.resolve({ files: [], isTruncated: false }) : this._enumerate(workingDirectory));
      const entry = { promise: shared };
      this._cache.set(key, entry);
      shared.then(() => {
        if (this._cache.get(key) === entry) {
          entry.expiresAt = Date.now() + CACHE_TTL_MS;
        }
      }, () => {
        if (this._cache.get(key) === entry) {
          this._cache.delete(key);
        }
      });
    }
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    if (token === CancellationToken.None) {
      return shared;
    }
    return new Promise((resolve3, reject) => {
      const cancelListener = token.onCancellationRequested(() => {
        cancelListener.dispose();
        reject(new CancellationError());
      });
      shared.then((value) => {
        cancelListener.dispose();
        resolve3(value);
      }, (err) => {
        cancelListener.dispose();
        reject(err);
      });
    });
  }
  async _enumerate(workingDirectory) {
    const resolvedRgDiskPath = await rgDiskPath();
    return new Promise((resolve3, reject) => {
      const cwd3 = workingDirectory.fsPath;
      const args = ["--files", "--hidden", "--no-require-git", "--follow", "--no-config", "--glob", "!.git"];
      let child;
      try {
        child = cp3.spawn(resolvedRgDiskPath, args, { cwd: cwd3 });
      } catch (err) {
        this._logService.warn(`[AgentHostWorkspaceFiles] Failed to spawn ripgrep: ${err}`);
        reject(err);
        return;
      }
      this._activeChildren.add(child);
      const results = [];
      let buffer = "";
      let limitHit = false;
      let settled = false;
      const finish = (files, error) => {
        if (settled) {
          return;
        }
        settled = true;
        this._activeChildren.delete(child);
        if (error) {
          reject(error);
        } else {
          resolve3({ files, isTruncated: limitHit });
        }
      };
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk) => {
        if (limitHit) {
          return;
        }
        buffer += chunk;
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
          buffer = buffer.slice(newlineIndex + 1);
          if (!line) {
            continue;
          }
          results.push(URI.joinPath(workingDirectory, line));
          if (results.length >= MAX_FILES) {
            limitHit = true;
            this._logService.trace(`[AgentHostWorkspaceFiles] File limit reached while enumerating ${workingDirectory.toString()}`);
            try {
              child.kill();
            } catch {
            }
            break;
          }
        }
      });
      child.stderr.setEncoding("utf8");
      let stderr = "";
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
      child.on("error", (err) => {
        if (this._isDisposed) {
          finish([]);
          return;
        }
        this._logService.warn(`[AgentHostWorkspaceFiles] ripgrep error: ${err}`);
        finish([], err);
      });
      child.on("close", (code) => {
        if (this._isDisposed) {
          finish([]);
          return;
        }
        if (!limitHit && buffer.length > 0) {
          const line = buffer.replace(/\r$/, "");
          if (line) {
            results.push(URI.joinPath(workingDirectory, line));
          }
          buffer = "";
        }
        if (stderr) {
          this._logService.trace(`[AgentHostWorkspaceFiles] ripgrep stderr: ${stderr}`);
        }
        if (!limitHit && code !== 0 && code !== 1) {
          const error = new Error(`ripgrep exited with code ${code ?? "unknown"} while enumerating ${workingDirectory.toString()}`);
          this._logService.warn(`[AgentHostWorkspaceFiles] ${error.message}`);
          finish([], error);
          return;
        }
        finish(results);
      });
    });
  }
};

AgentHostWorkspaceFiles = __decorateClass([
  __decorateParam(0, ILogService)
], AgentHostWorkspaceFiles);
export { cp3, MAX_FILES, CACHE_TTL_MS, MAX_CONCURRENT_ENUMERATIONS, enumerationLimiter, AgentHostWorkspaceFiles };
