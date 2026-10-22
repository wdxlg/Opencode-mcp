// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/git/node/localGitService.ts
import { CancellationError } from "./module-0003.mjs";
import { localize } from "./module-0007.mjs";
import { generateUuid } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0044.mjs";


// src/vs/platform/git/node/localGitService.ts
import * as cp5 from "child_process";

var LocalGitService = class {
  constructor(_logService, _execFile = cp5.execFile) {
    this._logService = _logService;
    this._execFile = _execFile;
    this._runningProcesses = /* @__PURE__ */ new Map();
  }
  _exec(operationId, args, cwd3) {
    return new Promise((resolve3, reject) => {
      this._logService.trace(`[LocalGitService] git ${args.join(" ")}${cwd3 ? ` (cwd: ${cwd3})` : ""}`);
      const proc = this._execFile("git", args, { cwd: cwd3, encoding: "utf8" }, (err, stdout, stderr) => {
        if (!this._runningProcesses.delete(operationId)) {
          reject(new CancellationError());
          return;
        }
        if (err) {
          this._logService.error(`[LocalGitService] git ${args[0]} failed:`, err.message, stderr);
          reject(err);
          return;
        }
        resolve3(stdout);
      });
      this._runningProcesses.set(operationId, proc);
    });
  }
  async clone(operationId, cloneUrl, targetPath, ref) {
    const args = ["clone"];
    if (ref) {
      args.push("--branch", ref);
    }
    args.push("--", cloneUrl, targetPath);
    await this._exec(operationId, args);
  }
  async pull(operationId, repoPath, options) {
    const before = (await this._exec(operationId, ["rev-parse", "HEAD"], repoPath)).trim();
    try {
      await this._exec(operationId, ["pull", "--ff-only"], repoPath);
    } catch (err) {
      if (!this._isFastForwardPullFailure(err)) {
        throw err;
      }
      const error = err;
      this._logService.warn(`[LocalGitService] Fast-forward pull failed for ${repoPath}: ${error?.message ?? String(err)}. Retrying after fetch.`);
      await this._exec(operationId, ["fetch", "--prune"], repoPath);
      try {
        await this._exec(operationId, ["pull", "--ff-only"], repoPath);
      } catch (retryErr) {
        if (!this._isFastForwardPullFailure(retryErr)) {
          throw retryErr;
        }
        if (!options?.allowHardResetOnDivergence) {
          throw retryErr;
        }
        const upstream = await this._getSafeHardResetTarget(operationId, repoPath);
        if (!upstream) {
          throw retryErr;
        }
        this._logService.warn(`[LocalGitService] Pull retries exhausted for ${repoPath}. Performing hard reset to ${upstream}.`);
        await this._exec(operationId, ["reset", "--hard", upstream], repoPath);
      }
    }
    const after = (await this._exec(operationId, ["rev-parse", "HEAD"], repoPath)).trim();
    return before !== after;
  }
  _isFastForwardPullFailure(err) {
    const error = err;
    if (error?.code !== 128) {
      return false;
    }
    const details = `${error.stderr ?? ""}
${error.message ?? ""}`;
    return /not possible to fast-forward|non-fast-forward/i.test(details);
  }
  async _getSafeHardResetTarget(operationId, repoPath) {
    const status = (await this._exec(operationId, ["status", "--porcelain"], repoPath)).trim();
    if (status.length > 0) {
      return void 0;
    }
    let upstream;
    try {
      upstream = (await this._exec(operationId, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], repoPath)).trim();
    } catch {
      return void 0;
    }
    const behind = await this._revListCount(operationId, repoPath, "HEAD", "@{u}");
    const ahead = await this._revListCount(operationId, repoPath, "@{u}", "HEAD");
    if (ahead === void 0 || behind === void 0 || ahead <= 0 || behind <= 0) {
      return void 0;
    }
    return upstream;
  }
  async _revListCount(operationId, repoPath, fromRef, toRef) {
    const result = await this._exec(operationId, ["rev-list", "--count", `${fromRef}..${toRef}`], repoPath);
    const parsed = Number(result.trim());
    if (!Number.isFinite(parsed)) {
      this._logService.warn(`[LocalGitService] Failed to parse rev-list count for ${fromRef}..${toRef} in ${repoPath}: ${result}`);
      return void 0;
    }
    return parsed;
  }
  async checkout(operationId, repoPath, treeish, detached) {
    const args = detached ? ["checkout", "--detach", treeish] : ["checkout", treeish];
    await this._exec(operationId, args, repoPath);
  }
  async checkoutCommit(operationId, repoPath, commit) {
    const expectedCommit = commit.trim().toLowerCase();
    if (!/^[0-9a-f]{40}$/.test(expectedCommit)) {
      throw new Error(localize(3055, null, commit));
    }
    const resolvedCommit = (await this._exec(operationId, ["rev-parse", `${expectedCommit}^{commit}`], repoPath)).trim().toLowerCase();
    if (resolvedCommit !== expectedCommit) {
      throw new Error(localize(3057, null, commit, resolvedCommit));
    }
    await this._exec(operationId, ["checkout", "--detach", resolvedCommit], repoPath);
    const checkedOutCommit = (await this._exec(operationId, ["rev-parse", "HEAD"], repoPath)).trim().toLowerCase();
    if (checkedOutCommit !== expectedCommit) {
      throw new Error(localize(3056, null, commit, checkedOutCommit));
    }
  }
  async revParse(repoPath, ref) {
    return (await this._exec(generateUuid(), ["rev-parse", ref], repoPath)).trim();
  }
  async fetch(operationId, repoPath) {
    await this._exec(operationId, ["fetch"], repoPath);
  }
  async revListCount(repoPath, fromRef, toRef) {
    const result = await this._exec(generateUuid(), ["rev-list", "--count", `${fromRef}..${toRef}`], repoPath);
    return Number(result.trim()) || 0;
  }
  async cancel(operationId) {
    const proc = this._runningProcesses.get(operationId);
    if (proc) {
      this._runningProcesses.delete(operationId);
      proc.kill();
    }
  }
};

LocalGitService = __decorateClass([
  __decorateParam(0, ILogService)
], LocalGitService);
export { cp5, LocalGitService };
