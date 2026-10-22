// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostGitService.ts
import { LRUCache } from "./module-0006.mjs";
import { Limiter, SequencerByKey, firstParallel, timeout } from "./module-0027.mjs";
import { URI } from "./module-0023.mjs";
import { basename, dirname, join, relative } from "./module-0018.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0025.mjs";
import { EMPTY_TREE_OBJECT } from "./module-0162.mjs";
import { generateUuid } from "./module-0042.mjs";
import { VSBuffer } from "./module-0029.mjs";
import { parse5 } from "./module-0214.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0128.mjs";
import { INativeEnvironmentService } from "./module-0129.mjs";
import { ILogService } from "./module-0084.mjs";
import { buildGitBlobUri } from "./module-0477.mjs";


// src/vs/platform/agentHost/node/agentHostGitService.ts
import * as cp4 from "child_process";

import * as fsPromises from "fs/promises";

import { cp as copyFile2 } from "@vscode/fs-copyfile";

var WORKTREE_REMOVAL_MAX_ATTEMPTS = 5;

var WORKTREE_REMOVAL_RETRY_BASE_DELAY_MS = 100;

var WORKTREE_REMOVAL_RETRY_MAX_DELAY_MS = 500;

var AgentHostGitService = class {
  constructor(_fileService, _environmentService, _logService) {
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this._logService = _logService;
    /**
     * A cache of repository roots that have already been discovered.
     */
    this._repositoryRoots = new LRUCache(100);
    this._repositoryRootSequencer = new SequencerByKey();
  }
  async getCurrentBranch(workingDirectory) {
    return (await this._runGit(workingDirectory, ["branch", "--show-current"]))?.trim() || (await this._runGit(workingDirectory, ["rev-parse", "--short", "HEAD"]))?.trim() || void 0;
  }
  async getCurrentBranchName(workingDirectory) {
    return (await this._runGit(workingDirectory, ["branch", "--show-current"]))?.trim() || void 0;
  }
  async getDefaultBranch(workingDirectory) {
    const remoteRef = (await this._runGit(workingDirectory, ["symbolic-ref", "--quiet", "refs/remotes/origin/HEAD"]))?.trim();
    if (remoteRef) {
      if (!remoteRef.startsWith("refs/remotes/origin/")) {
        return { name: remoteRef, startPoint: remoteRef };
      }
      const branch = remoteRef.substring("refs/remotes/origin/".length);
      const hasRemoteRef = await this._runGit(workingDirectory, ["show-ref", "--verify", "--quiet", `refs/remotes/origin/${branch}`]) !== void 0;
      if (hasRemoteRef) {
        return { name: branch, startPoint: `origin/${branch}` };
      }
      const hasLocalBranch = await this._runGit(workingDirectory, ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`]) !== void 0;
      return hasLocalBranch ? { name: branch, startPoint: branch } : void 0;
    }
    return void 0;
  }
  async getRefs(workingDirectory, query) {
    const args = ["for-each-ref", "--format=%(refname)%00%(upstream)"];
    if (query?.sort && query.sort !== "alphabetically") {
      args.push("--sort", `-${query.sort}`);
    }
    if (query?.count) {
      args.push(`--count=${query.count}`);
    }
    if (query?.pattern) {
      const patterns = Array.isArray(query.pattern) ? query.pattern : [query.pattern];
      for (const pattern of patterns) {
        args.push(pattern.startsWith("refs/") ? pattern : `refs/${pattern}`);
      }
    }
    const output = await this._runGit(workingDirectory, args);
    return parseGitRefs(output);
  }
  async getBranches(workingDirectory, query) {
    const refs = await this.getRefs(workingDirectory, query);
    return refs.filter((r) => r.kind === 0 /* Head */ || r.kind === 1 /* RemoteHead */);
  }
  async getBranch(workingDirectory, name) {
    const refs = await this.getBranches(workingDirectory, { pattern: name });
    return refs.length > 0 ? refs[0] : void 0;
  }
  async getRepositoryRoot(workingDirectory) {
    const workingDirectoryKey = workingDirectory.toString();
    return this._repositoryRootSequencer.queue(workingDirectoryKey, async () => {
      let repositoryRoot = this._repositoryRoots.get(workingDirectoryKey);
      if (repositoryRoot) {
        return repositoryRoot;
      }
      try {
        const repositoryRootPath = (await this._runGit(workingDirectory, ["rev-parse", "--show-toplevel"]))?.trim();
        if (repositoryRootPath) {
          repositoryRoot = URI.file(repositoryRootPath);
          this._repositoryRoots.set(workingDirectoryKey, repositoryRoot);
        }
        return repositoryRoot;
      } catch (error) {
      }
      return void 0;
    });
  }
  async getWorktreeRoots(workingDirectory) {
    return this._parseWorktreeRoots(await this._runGit(workingDirectory, ["worktree", "list", "--porcelain"]));
  }
  _parseWorktreeRoots(porcelainOutput) {
    if (!porcelainOutput) {
      return [];
    }
    return porcelainOutput.split(/\r?\n/g).filter((line) => line.startsWith("worktree ")).map((line) => URI.file(line.substring("worktree ".length)));
  }
  async addWorktree(repositoryRoot, options) {
    const resolvedCommitish = options.preferRemoteBranch ? await this._resolveRemoteTrackingBranch(repositoryRoot, options.commitish, options.track) ?? options.commitish : options.commitish;
    const args = ["-c", "checkout.workers=0", "worktree", "add"];
    if (options.newBranchName) {
      if (!options.track) {
        args.push("--no-track");
      }
      args.push("-b", options.newBranchName);
    }
    args.push(options.path.fsPath, resolvedCommitish);
    const progressParser = options.onProgress ? new GitCheckoutProgressParser(options.onProgress) : void 0;
    await this._runGit(repositoryRoot, args, {
      timeout: 18e4,
      throwOnError: true,
      ...progressParser ? { env: { GIT_PROGRESS_DELAY: "0" }, onStderr: (chunk) => progressParser.push(chunk) } : {}
    });
  }
  async copyWorktreeIncludeFiles(repositoryRoot, worktree, globs, onProgress) {
    try {
      const worktreeIncludePaths = await this._getWorktreeIncludePaths(repositoryRoot, worktree, globs);
      if (worktreeIncludePaths.length === 0) {
        return;
      }
      const startTime = performance.now();
      const limiter = new Limiter(15);
      const filesTotal = worktreeIncludePaths.reduce((total, entry) => total + entry.fileCount, 0);
      let filesDone = 0;
      const results = await Promise.allSettled(worktreeIncludePaths.map((entry) => limiter.queue(async () => {
        const targetPath = join(worktree.fsPath, relative(repositoryRoot.fsPath, entry.sourcePath));
        await fsPromises.mkdir(dirname(targetPath), { recursive: true });
        await copyFile2(entry.sourcePath, targetPath, { force: true, recursive: true, verbatimSymlinks: true });
        filesDone += entry.fileCount;
        onProgress?.({ filesDone, filesTotal });
      })));
      const failedOperations = results.filter((result) => result.status === "rejected");
      this._logService.info(`[AgentHostGitService][copyWorktreeIncludeFiles] Copied ${worktreeIncludePaths.length - failedOperations.length}/${worktreeIncludePaths.length} folder(s)/file(s) to worktree ${worktree.fsPath}. [${(performance.now() - startTime).toFixed(2)}ms]`);
      if (failedOperations.length > 0) {
        this._logService.warn(`[AgentHostGitService][copyWorktreeIncludeFiles] Failed to copy ${failedOperations.length} folder(s)/file(s) to worktree ${worktree.fsPath}.`);
        for (const error of failedOperations) {
          this._logService.warn(`[AgentHostGitService][copyWorktreeIncludeFiles] ${error.reason}`);
        }
      }
    } catch (error) {
      this._logService.warn(`[AgentHostGitService][copyWorktreeIncludeFiles] Failed to copy folder(s)/file(s) to worktree ${worktree.fsPath}: ${error}`);
    }
  }
  async addExistingWorktree(repositoryRoot, worktree, branchName) {
    await this._runGit(repositoryRoot, ["-c", "checkout.workers=0", "worktree", "add", "-f", worktree.fsPath, branchName], { timeout: 18e4, throwOnError: true });
  }
  /**
   * Removes a session's git worktree, tolerating the teardown race where a
   * concurrent git process is still running inside it.
   *
   * `git worktree remove` deletes the working tree and then the admin directory
   * `.git/worktrees/<id>`. If another git process (our own status/diff probes,
   * or the agent's own git) re-created `index.lock` there, that last step fails
   * with "Directory not empty". And `git worktree prune` — which we use to
   * finish a partially-removed worktree — can even exit 0 while failing to
   * delete that directory, so a zero exit is not proof of success.
   *
   * Example the loop below handles:
   * ```
   *   attempt 1  `remove` deletes the tree, then can't rmdir .git/worktrees/<id>
   *              (a probe's index.lock is still there)                  -> throws
   *   wait ~100ms  the probe finishes and releases its lock
   *   attempt 2  tree already gone -> `prune` clears the stale entry
   *              -> verified de-registered                              -> done
   * ```
   *
   * So we: retry with a capped exponential backoff to let the racing process
   * finish; switch to `prune` once the working tree is already gone; only retry
   * transient lock / "directory not empty" failures (a dirty-tree "use --force"
   * still fails fast); treat a non-retryable failure as success when git no
   * longer tracks the worktree (idempotent re-removal of an already-removed or
   * archived worktree); and verify the worktree is truly de-registered before
   * returning, so a silent `prune` no-op cannot mask a leaked entry.
   */
  async removeWorktree(repositoryRoot, worktree, options) {
    const removeArgs = ["worktree", "remove"];
    if (options?.force) {
      removeArgs.push("--force");
    }
    removeArgs.push(worktree.fsPath);
    let lastError;
    for (let attempt = 0; attempt < WORKTREE_REMOVAL_MAX_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        await timeout(Math.min(WORKTREE_REMOVAL_RETRY_MAX_DELAY_MS, WORKTREE_REMOVAL_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)));
      }
      try {
        if (await this._pathExists(worktree.fsPath)) {
          await this._runGit(repositoryRoot, removeArgs, { timeout: 6e4, throwOnError: true });
        } else {
          await this._runGit(repositoryRoot, ["worktree", "prune"], { timeout: 6e4, throwOnError: true });
        }
        if (!await this._isWorktreeRegistered(repositoryRoot, worktree)) {
          return;
        }
        lastError = new Error(`git worktree removal left '${worktree.fsPath}' registered (admin directory not deleted)`);
      } catch (error) {
        lastError = error;
        if (!isRetryableWorktreeRemovalError(error)) {
          if (!await this._isWorktreeRegistered(repositoryRoot, worktree)) {
            this._logService.trace(`[agentHostGitService] worktree '${worktree.fsPath}' already de-registered; treating removal as complete`);
            return;
          }
          throw error;
        }
      }
      if (attempt < WORKTREE_REMOVAL_MAX_ATTEMPTS - 1) {
        this._logService.warn(`[agentHostGitService] worktree removal attempt ${attempt + 1}/${WORKTREE_REMOVAL_MAX_ATTEMPTS} did not complete for '${worktree.fsPath}', retrying: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
      }
    }
    throw lastError;
  }
  async _pathExists(fsPath) {
    try {
      await fsPromises.access(fsPath);
      return true;
    } catch (error) {
      return error?.code !== "ENOENT";
    }
  }
  /**
   * Whether `worktree` is still registered with git (its admin entry survives).
   * Fails closed (returns `true`) if the registry cannot be read, so an unrelated
   * `git worktree list` failure is never mistaken for a completed removal.
   */
  async _isWorktreeRegistered(repositoryRoot, worktree) {
    let registered;
    try {
      registered = this._parseWorktreeRoots(await this._runGit(repositoryRoot, ["worktree", "list", "--porcelain"], { throwOnError: true }));
    } catch {
      return true;
    }
    if (registered.length === 0) {
      return false;
    }
    const target = await this._canonicalizeWorktreePath(worktree);
    const matched = await firstParallel(
      registered.map(async (entry) => extUriBiasedIgnorePathCase.isEqual(entry, worktree) || extUriBiasedIgnorePathCase.isEqual(await this._canonicalizeWorktreePath(entry), target)),
      (isMatch) => isMatch,
      false
    );
    return matched ?? false;
  }
  /**
   * Resolves symlinks on the worktree's parent (which persists even after the
   * worktree directory itself is deleted) so a path we passed to git (e.g.
   * `/var/...`) matches the realpath'd form git reports (`/private/var/...`).
   */
  async _canonicalizeWorktreePath(worktree) {
    try {
      const parentReal = await fsPromises.realpath(dirname(worktree.fsPath));
      return URI.file(join(parentReal, basename(worktree.fsPath)));
    } catch {
      return worktree;
    }
  }
  async branchExists(repositoryRoot, branchName) {
    const output = await this._runGit(repositoryRoot, ["show-ref", "--verify", "--quiet", `refs/heads/${branchName}`]);
    return output !== void 0;
  }
  async createBranch(workingDirectory, branchName, options) {
    const args = options?.checkout ? ["checkout", "-q", "-b", branchName, "--no-track"] : ["branch", "-q", branchName];
    await this._runGit(workingDirectory, args, { throwOnError: true });
  }
  async hasUncommittedChanges(workingDirectory) {
    const output = await this._runGitStatus(workingDirectory, ["--porcelain"]);
    return !!output && output.trim().length > 0;
  }
  async commitAll(workingDirectory, message) {
    await this._runGit(workingDirectory, ["add", "-A", "--", ":/"], { throwOnError: true });
    await this._runGit(workingDirectory, ["commit", "--no-verify", "-m", message], { timeout: 6e4, throwOnError: true });
  }
  async mergeBranch(workingDirectory, branchName) {
    const existingMergeHead = await this._runGit(workingDirectory, ["rev-parse", "--verify", "--quiet", "MERGE_HEAD"]);
    if (existingMergeHead) {
      throw new Error(`Cannot merge '${branchName}' because another merge is already in progress.`);
    }
    try {
      return (await this._runGit(workingDirectory, ["merge", "--no-edit", "--", branchName], { timeout: 6e4, throwOnError: true }))?.trim() ?? "";
    } catch (error) {
      const mergeHead = await this._runGit(workingDirectory, ["rev-parse", "--verify", "--quiet", "MERGE_HEAD"]);
      if (mergeHead) {
        try {
          await this._runGit(workingDirectory, ["merge", "--abort"], { timeout: 6e4, throwOnError: true });
        } catch (abortError) {
          const mergeMessage = error instanceof Error ? error.message : String(error);
          const abortMessage = abortError instanceof Error ? abortError.message : String(abortError);
          throw new Error(`Merge failed and could not be aborted: ${mergeMessage}; ${abortMessage}`, { cause: error });
        }
      }
      throw error;
    }
  }
  async restore(workingDirectory, paths, options) {
    const args = ["restore"];
    if (options?.staged) {
      args.push("--staged");
    }
    if (options?.ref) {
      args.push("--source", options.ref);
    }
    if (paths.length === 0) {
      paths = ["."];
    }
    await this._runGit(workingDirectory, [...args, "--", ...paths], { throwOnError: true });
  }
  async hasUpstream(workingDirectory, branchName) {
    const output = await this._runGit(workingDirectory, ["rev-parse", "--abbrev-ref", `${branchName}@{upstream}`]);
    return output !== void 0 && output.trim().length > 0;
  }
  async pull(workingDirectory, options) {
    const args = ["pull"];
    if (options?.rebase) {
      args.push("-r");
    }
    if (options?.remote || options?.ref) {
      args.push(options.remote ?? "origin");
      if (options.ref) {
        args.push(options.ref);
      }
    }
    await this._runGit(workingDirectory, args, { timeout: 18e4, throwOnError: true });
  }
  async push(workingDirectory, options) {
    const args = ["push"];
    if (options?.setUpstream) {
      args.push("--set-upstream");
    }
    if (options?.remote || options?.ref) {
      args.push(options.remote ?? "origin");
      if (options.ref) {
        args.push(options.ref);
      }
    }
    await this._runGit(workingDirectory, args, { timeout: 18e4, throwOnError: true });
  }
  async computeSessionFileDiffs(workingDirectory, options) {
    const repositoryRoot = await this.getRepositoryRoot(workingDirectory);
    if (!repositoryRoot) {
      return void 0;
    }
    const mergeBaseCommit = await this._resolveBranchMergeBaseCommit(repositoryRoot, options.baseBranch);
    const statusOut = await this._runGitStatus(repositoryRoot, ["--porcelain=v1", "-z", "--untracked-files=all"]);
    if (statusOut === void 0) {
      return void 0;
    }
    const hasUntracked = parseUntrackedPaths(statusOut).length > 0;
    let rawDiffOutput;
    if (!hasUntracked) {
      rawDiffOutput = await this._runGit(repositoryRoot, ["diff", "--raw", "--numstat", "--diff-filter=ADMR", "-z", mergeBaseCommit, "--"]);
    } else {
      const changedPaths = parseChangedPaths(statusOut);
      rawDiffOutput = await this._runWithTempIndex(repositoryRoot, mergeBaseCommit, changedPaths);
    }
    if (rawDiffOutput === void 0) {
      return void 0;
    }
    return parseGitDiffRawNumstat(rawDiffOutput, repositoryRoot, options.sessionUri, mergeBaseCommit);
  }
  async resolveBranchBaselineCommit(workingDirectory, baseBranch) {
    const repositoryRoot = await this.getRepositoryRoot(workingDirectory);
    if (!repositoryRoot) {
      return void 0;
    }
    return this._resolveBranchMergeBaseCommit(repositoryRoot, baseBranch);
  }
  /**
   * Resolves the merge-base commit-ish the Branch Changes baseline is anchored
   * on. With a base branch, prefers the corresponding `origin/<base>`
   * remote-tracking ref when it exists so branch changes match a PR-style
   * comparison even if the local base branch is stale. Without a usable base,
   * falls back to `HEAD` (surfaces uncommitted work but no committed-on-branch
   * work). For empty repos with no `HEAD`, falls back to the empty-tree object.
   * Always resolves to a commit-ish (never `undefined`) once the repository
   * root is known.
   */
  async _resolveBranchMergeBaseCommit(repositoryRoot, baseBranch) {
    let mergeBaseCommit;
    if (baseBranch) {
      const resolvedBase = await this._resolveRemoteTrackingBranch(repositoryRoot, baseBranch) ?? baseBranch;
      mergeBaseCommit = (await this._runGit(repositoryRoot, ["merge-base", "HEAD", resolvedBase]))?.trim();
    }
    if (!mergeBaseCommit) {
      mergeBaseCommit = (await this._runGit(repositoryRoot, ["rev-parse", "HEAD"]))?.trim();
    }
    return mergeBaseCommit ?? EMPTY_TREE_OBJECT;
  }
  async _runWithTempIndex(repositoryRoot, mergeBaseCommit, changedPaths) {
    const tempDir = URI.joinPath(this._environmentService.tmpDir, `agent-host-git-diff-${generateUuid()}`);
    await this._fileService.createFolder(tempDir);
    const indexFile = URI.joinPath(tempDir, "index").fsPath;
    const env2 = { GIT_INDEX_FILE: indexFile };
    env2.COMMAND_HOOK_LOCK = "1";
    try {
      const seeded = await this._runGit(repositoryRoot, ["read-tree", "HEAD"], { env: env2 });
      if (seeded === void 0) {
        await this._runGit(repositoryRoot, ["read-tree", EMPTY_TREE_OBJECT], { env: env2 });
      }
      if (!await this._stageChangedPaths(repositoryRoot, tempDir, changedPaths, env2)) {
        return void 0;
      }
      return await this._runGit(repositoryRoot, ["diff", "--cached", "--raw", "--numstat", "--diff-filter=ADMR", "-z", mergeBaseCommit, "--"], { env: env2 });
    } finally {
      try {
        await this._fileService.del(tempDir, { recursive: true, useTrash: false });
      } catch {
      }
    }
  }
  async _stageChangedPaths(repositoryRoot, tempDir, changedPaths, env2) {
    if (changedPaths.length === 0) {
      return true;
    }
    const pathspecFile = URI.joinPath(tempDir, "pathspec");
    await this._fileService.writeFile(pathspecFile, VSBuffer.fromString(changedPaths.join("\0") + "\0"));
    this._logService.debug(`[agentHostGitService] Staging ${changedPaths.length} changed path(s) into temp index`);
    return await this._runGit(repositoryRoot, ["add", "-A", `--pathspec-from-file=${pathspecFile.fsPath}`, "--pathspec-file-nul"], {
      env: { ...env2, GIT_LITERAL_PATHSPECS: "1" }
    }) !== void 0;
  }
  async _resolveRemoteTrackingBranch(repositoryRoot, branch, fetchIfMissing = false) {
    const trackingRef = getRemoteTrackingRef(branch);
    if (!trackingRef) {
      return void 0;
    }
    const { branchName, remoteBranch, remoteRef, sourceRef } = trackingRef;
    const output = await this._runGit(repositoryRoot, ["show-ref", "--verify", "--quiet", remoteRef]);
    if (output !== void 0) {
      return remoteBranch;
    }
    if (!fetchIfMissing || branchName === "HEAD" || /^[0-9a-f]{40}$/i.test(branchName)) {
      return void 0;
    }
    this._logService.info(`[AgentHostGitService] Fetching tracked branch '${branchName}' from origin.`);
    await this._runGit(repositoryRoot, ["fetch", "--no-tags", "origin", `${sourceRef}:${remoteRef}`], {
      timeout: 6e4,
      throwOnError: true
    });
    return remoteBranch;
  }
  /**
   * Resolves the git-ignored paths to copy into a worktree.
   */
  async _getWorktreeIncludePaths(repositoryRoot, worktreeRoot, globs) {
    if (globs.length === 0) {
      return [];
    }
    const baseArgs = ["ls-files", "--others", "--ignored", "--exclude-standard", "-z"];
    const [filesOutput, directoryOutput, worktreeOutput] = await Promise.all([
      this._runGit(repositoryRoot, baseArgs, { timeout: 6e4 }),
      this._runGit(repositoryRoot, [...baseArgs, "--directory", "--no-empty-directory"], { timeout: 6e4 }),
      this._runGit(worktreeRoot, ["ls-files", "-z"], { timeout: 6e4 })
    ]);
    if (!filesOutput) {
      return [];
    }
    const ignoredFiles = filesOutput.split("\0").filter((entry) => entry.length > 0);
    if (ignoredFiles.length === 0) {
      return [];
    }
    const matchers = globs.map((pattern) => parse5(pattern));
    const wholeDirectories = new Set((directoryOutput ?? "").split("\0").filter((entry) => entry.endsWith("/")));
    const worktreeFiles = new Set((worktreeOutput ?? "").split("\0").filter((entry) => entry.length > 0));
    const worktreeDirectories = /* @__PURE__ */ new Set();
    for (const file of worktreeFiles) {
      let index = file.indexOf("/");
      while (index !== -1) {
        worktreeDirectories.add(file.slice(0, index + 1));
        index = file.indexOf("/", index + 1);
      }
    }
    const matchedFiles = [];
    const nonCollapsibleDirectories = /* @__PURE__ */ new Set();
    for (const file of ignoredFiles) {
      if (matchers.some((matcher) => matcher(file)) && !hasWorktreePathCollision(file, worktreeFiles, worktreeDirectories)) {
        matchedFiles.push(file);
      } else if (wholeDirectories.size > 0) {
        const containingDirectory = findContainingDirectory(file, wholeDirectories);
        if (containingDirectory !== void 0) {
          nonCollapsibleDirectories.add(containingDirectory);
        }
      }
    }
    if (matchedFiles.length === 0) {
      return [];
    }
    const collapsedDirectories = /* @__PURE__ */ new Set();
    for (const dir of wholeDirectories) {
      if (!nonCollapsibleDirectories.has(dir)) {
        collapsedDirectories.add(dir);
      }
    }
    return toWorktreeIncludeEntries(repositoryRoot, matchedFiles, collapsedDirectories);
  }
  async showBlob(workingDirectory, ref, repoRelativePath) {
    const repositoryRoot = await this.getRepositoryRoot(workingDirectory);
    if (!repositoryRoot) {
      return void 0;
    }
    return new Promise((resolve3) => {
      cp4.execFile("git", ["show", `${ref}:${repoRelativePath}`], { cwd: workingDirectory.fsPath, timeout: 5e3, encoding: "buffer", maxBuffer: 32 * 1024 * 1024 }, (error, stdout) => {
        if (error) {
          resolve3(void 0);
          return;
        }
        resolve3(VSBuffer.wrap(stdout));
      });
    });
  }
  async getSessionGitState(workingDirectory, baseBranchName) {
    return this._computeSessionGitState(workingDirectory, baseBranchName);
  }
  async getFetchRemoteUrls(workingDirectory, preferredRemote) {
    const repositoryRoot = await this.getRepositoryRoot(workingDirectory);
    if (!repositoryRoot) {
      return void 0;
    }
    return parseFetchRemoteUrls(await this._runGit(repositoryRoot, ["remote", "-v"]), preferredRemote);
  }
  async getUntrackedPaths(workingDirectory) {
    const repositoryRoot = await this.getRepositoryRoot(workingDirectory);
    if (!repositoryRoot) {
      return void 0;
    }
    const status = await this._runGitStatus(repositoryRoot, ["--porcelain=v1", "-z", "--untracked-files=all"]);
    return status === void 0 ? void 0 : parseUntrackedPaths(status);
  }
  async captureWorkingTreeAsTree(workingDirectory) {
    const repositoryRoot = await this.getRepositoryRoot(workingDirectory);
    if (!repositoryRoot) {
      return void 0;
    }
    const statusOut = await this._runGitStatus(repositoryRoot, ["--porcelain=v1", "-z", "--untracked-files=all"]);
    if (statusOut === void 0) {
      return void 0;
    }
    const changedPaths = parseChangedPaths(statusOut);
    const tempDir = URI.joinPath(this._environmentService.tmpDir, `agent-host-checkpoint-${generateUuid()}`);
    await this._fileService.createFolder(tempDir);
    const indexFile = URI.joinPath(tempDir, "index").fsPath;
    const env2 = { GIT_INDEX_FILE: indexFile, COMMAND_HOOK_LOCK: "1" };
    try {
      const seeded = await this._runGit(repositoryRoot, ["read-tree", "HEAD"], { env: env2 });
      if (seeded === void 0) {
        await this._runGit(repositoryRoot, ["read-tree", EMPTY_TREE_OBJECT], { env: env2 });
      }
      if (!await this._stageChangedPaths(repositoryRoot, tempDir, changedPaths, env2)) {
        return void 0;
      }
      const tree = (await this._runGit(repositoryRoot, ["write-tree"], { env: env2 }))?.trim();
      return tree || void 0;
    } finally {
      try {
        await this._fileService.del(tempDir, { recursive: true, useTrash: false });
      } catch {
      }
    }
  }
  async commitTree(repositoryRoot, treeOid, parentOid, message) {
    const args = ["commit-tree", treeOid];
    if (parentOid) {
      args.push("-p", parentOid);
    }
    args.push("-m", message);
    const out = await this._runGit(repositoryRoot, args, { throwOnError: true });
    return out?.trim() || void 0;
  }
  async updateRef(repositoryRoot, ref, newOid) {
    await this._runGit(repositoryRoot, ["update-ref", ref, newOid], { throwOnError: true });
  }
  async deleteRefs(repositoryRoot, refs) {
    if (refs.length === 0) {
      return;
    }
    const stdin = refs.map((ref) => `delete ${ref}\0\0`).join("");
    await new Promise((resolve3) => {
      const proc = cp4.execFile("git", ["update-ref", "--stdin", "-z"], { cwd: repositoryRoot.fsPath, timeout: 1e4 }, () => {
        resolve3();
      });
      proc.stdin?.end(stdin);
    });
  }
  async revParse(repositoryRoot, expression) {
    const out = await this._runGit(repositoryRoot, ["rev-parse", "--verify", "--quiet", expression]);
    return out?.trim() || void 0;
  }
  async listRefNamesWithOids(repositoryRoot, pattern) {
    const out = await this._runGit(repositoryRoot, ["for-each-ref", "--format=%(refname)%00%(objectname)", pattern]);
    if (!out) {
      return [];
    }
    const result = [];
    for (const line of out.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      const [ref, oid] = trimmed.split("\0");
      if (ref && oid) {
        result.push({ ref, oid });
      }
    }
    return result;
  }
  async overlayPathIntoTree(repositoryRoot, baseTreeOid, path, sourceTreeOid) {
    const tempDir = URI.joinPath(this._environmentService.tmpDir, `agent-host-review-overlay-${generateUuid()}`);
    await this._fileService.createFolder(tempDir);
    const indexFile = URI.joinPath(tempDir, "index").fsPath;
    const env2 = { GIT_INDEX_FILE: indexFile, COMMAND_HOOK_LOCK: "1" };
    try {
      const readTreeOut = await this._runGit(repositoryRoot, ["read-tree", baseTreeOid], { env: env2, throwOnError: false });
      if (readTreeOut === void 0) {
        return void 0;
      }
      const lsTreeOut = await this._runGit(repositoryRoot, ["ls-tree", "-z", sourceTreeOid, "--", path], { env: env2 });
      const entry = parseSingleLsTreeEntry(lsTreeOut);
      if (entry) {
        const updateIndexOut = await this._runGit(repositoryRoot, ["update-index", "--add", "--cacheinfo", `${entry.mode},${entry.oid},${path}`], { env: env2, throwOnError: false });
        if (updateIndexOut === void 0) {
          return void 0;
        }
      } else {
        const updateIndexOut = await this._runGit(repositoryRoot, ["update-index", "--force-remove", "--", path], { env: env2, throwOnError: false });
        if (updateIndexOut === void 0) {
          return void 0;
        }
      }
      const writeTreeOut = await this._runGit(repositoryRoot, ["write-tree"], { env: env2 });
      return writeTreeOut?.trim();
    } finally {
      try {
        await this._fileService.del(tempDir, { recursive: true, useTrash: false });
      } catch {
      }
    }
  }
  async diffTreePaths(repositoryRoot, fromTreeish, toTreeish) {
    const out = await this._runGit(repositoryRoot, ["diff", "--name-only", "--no-renames", "-z", fromTreeish, toTreeish, "--"]);
    if (out === void 0) {
      return void 0;
    }
    return out.split("\0").filter(Boolean);
  }
  async computeFileDiffsBetweenRefs(workingDirectory, options) {
    const repositoryRoot = await this.getRepositoryRoot(workingDirectory);
    if (!repositoryRoot) {
      return void 0;
    }
    try {
      const raw = await this._runGit(repositoryRoot, ["diff", "--raw", "--numstat", "--diff-filter=ADMR", "-z", options.fromRef, options.toRef, "--"]);
      if (raw === void 0) {
        return void 0;
      }
      return parseGitDiffRawNumstat(raw, repositoryRoot, options.sessionUri, options.fromRef, options.toRef);
    } catch (err) {
      this._logService.warn(`[AgentHostGitService][computeFileDiffsBetweenRefs] Failed to compute file diffs ${repositoryRoot.toString()}, ${options.fromRef}, ${options.toRef}: ${err}`);
      return void 0;
    }
  }
  async getBranchDiffSafetyInfo(workingDirectory, baselineCommit) {
    const repositoryRoot = await this.getRepositoryRoot(workingDirectory);
    if (!repositoryRoot) {
      return void 0;
    }
    const [virtualFileSystem, sparseCheckout, timestamp, commitCount, workspaceFiles] = await Promise.all([
      this._runGit(repositoryRoot, ["config", "--get", "core.virtualfilesystem"]),
      this._runGit(repositoryRoot, ["config", "--get", "core.sparsecheckout"]),
      this._runGit(repositoryRoot, ["show", "-s", "--format=%ct", baselineCommit]),
      this._runGit(repositoryRoot, ["rev-list", "--count", `${baselineCommit}..HEAD`]),
      this._runGit(repositoryRoot, ["ls-files", "--cached", "--others", "--exclude-standard", "-z"])
    ]);
    const sparseCheckoutEnabled = (/* @__PURE__ */ new Set(["true", "yes", "on", "1"])).has(sparseCheckout?.trim().toLowerCase() ?? "");
    const timestampSeconds = Number(timestamp?.trim());
    const parsedCommitCount = Number(commitCount?.trim());
    return {
      hasVirtualFileSystem: Boolean(virtualFileSystem?.trim()) || sparseCheckoutEnabled,
      baselineCommitTimestamp: Number.isFinite(timestampSeconds) ? timestampSeconds * 1e3 : void 0,
      commitCount: Number.isFinite(parsedCommitCount) ? parsedCommitCount : void 0,
      workspaceFileCount: workspaceFiles?.split("\0").filter(Boolean).length ?? 0
    };
  }
  async getDiffPatchBetweenRefs(workingDirectory, options) {
    const repositoryRoot = await this.getRepositoryRoot(workingDirectory);
    if (!repositoryRoot) {
      return void 0;
    }
    const paths = [...new Set(options.paths)];
    if (paths.length === 0) {
      return { patch: "", tooLarge: false };
    }
    try {
      const patch = await this._runGit(repositoryRoot, ["diff", "--patch", "--no-ext-diff", "--find-renames", "--diff-filter=ADMR", options.fromRef, options.toRef, "--", ...paths], { maxBuffer: options.maxBuffer, throwOnError: true });
      return patch === void 0 ? void 0 : { patch, tooLarge: false };
    } catch (error) {
      if (isMaxBufferError(error)) {
        return { patch: void 0, tooLarge: true };
      }
      throw error;
    }
  }
  async _computeSessionGitState(workingDirectory, configuredBaseBranch) {
    const repositoryRoot = await this.getRepositoryRoot(workingDirectory);
    if (!repositoryRoot) {
      return void 0;
    }
    const [
      statusOutput,
      remotesOutput,
      defaultBranchRef
    ] = await Promise.all([
      this._runGitStatus(repositoryRoot, ["-b", "--porcelain=v2"]),
      this._runGit(repositoryRoot, ["remote", "-v"]),
      configuredBaseBranch ? void 0 : this._runGit(repositoryRoot, ["symbolic-ref", "--quiet", "refs/remotes/origin/HEAD"])
    ]);
    if (statusOutput === void 0) {
      this._logService.warn(`[agentHostGitService] Not reporting session git state because git status failed: ${repositoryRoot.fsPath}`);
      return void 0;
    }
    const status = parseGitStatusV2(statusOutput);
    const hasGitHubRemote = parseHasGitHubRemote(remotesOutput);
    const baseBranchName = configuredBaseBranch ?? parseDefaultBranchRef(defaultBranchRef);
    const githubRepo = parseGitHubRepoFromRemote(remotesOutput);
    const upstreamRemote = status.upstreamBranchName?.split("/")[0];
    const [pushRemote, baseBranchDivergence] = await Promise.all([
      !upstreamRemote && status.branchName ? this._getPushRemote(repositoryRoot, status.branchName) : void 0,
      baseBranchName && status.branchName && status.branchName !== baseBranchName ? this._computeBaseBranchDivergence(repositoryRoot, baseBranchName, status.outgoingChanges === void 0) : void 0
    ]);
    const githubHeadRepo = upstreamRemote ? parseGitHubRepoFromRemote(remotesOutput, upstreamRemote) : parseGitHubHeadRepoFromRemoteSelection(remotesOutput, pushRemote);
    let outgoingChanges = status.outgoingChanges;
    if (outgoingChanges === void 0) {
      outgoingChanges = baseBranchDivergence?.count;
    }
    const result = {
      hasGitHubRemote,
      branchName: status.branchName,
      isDetachedHead: status.isDetachedHead,
      baseBranchName,
      upstreamBranchName: status.upstreamBranchName,
      incomingChanges: status.incomingChanges,
      outgoingChanges,
      uncommittedChanges: status.uncommittedChanges,
      hasBaseBranchChanges: baseBranchDivergence?.hasChanges,
      githubOwner: githubRepo?.owner,
      githubHeadOwner: githubHeadRepo?.owner,
      githubRepo: githubRepo?.repo
    };
    return stripUndefined(result);
  }
  async _getPushRemote(repositoryRoot, branchName) {
    return (await this._runGit(repositoryRoot, ["for-each-ref", "--format=%(push:remotename)", `refs/heads/${branchName}`]))?.trim() || void 0;
  }
  async _computeBaseBranchDivergence(repositoryRoot, baseBranchName, countCommits) {
    const localRef = `refs/heads/${baseBranchName}`;
    const remoteRef = `refs/remotes/origin/${baseBranchName}`;
    const refs = await this._runGit(repositoryRoot, ["for-each-ref", "--format=%(refname)", localRef, remoteRef]);
    if (refs === void 0) {
      return void 0;
    }
    const refNames = new Set(refs.split(/\r?\n/g).filter(Boolean));
    const baseBranchRef = refNames.has(localRef) ? localRef : refNames.has(remoteRef) ? remoteRef : baseBranchName;
    const output = await this._runGit(repositoryRoot, ["rev-list", countCommits ? "--count" : "--max-count=1", `${baseBranchRef}..HEAD`]);
    if (output === void 0) {
      return void 0;
    }
    if (!countCommits) {
      return { hasChanges: output.trim().length > 0 };
    }
    const count = Number(output.trim());
    return Number.isFinite(count) ? { hasChanges: count > 0, count } : void 0;
  }
  _runGitStatus(workingDirectory, args) {
    return this._runGit(workingDirectory, ["status", ...args], { env: { GIT_OPTIONAL_LOCKS: "0" } });
  }
  _runGit(workingDirectory, args, options) {
    this._logService.trace(`[agentHostGitService] > git ${args.join(" ")}`);
    return new Promise((resolve3, reject) => {
      const env2 = options?.env ? { ...process.env, ...options.env } : void 0;
      const timeoutMs = options?.timeout ?? 5e3;
      let didTimeOut = false;
      const child = cp4.execFile("git", [...args], { cwd: workingDirectory.fsPath, env: env2, maxBuffer: options?.maxBuffer ?? 32 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          if (stderr) {
            this._logService.warn(`[agentHostGitService] > git ${args.join(" ")} failed; full stderr:
${stderr}`);
          } else if (didTimeOut || error.killed) {
            this._logService.warn(`[agentHostGitService] > git ${args.join(" ")} failed: ${formatGitError(args, timeoutMs, didTimeOut, error, stderr)}`);
          } else {
            this._logService.trace(`[agentHostGitService] > git ${args.join(" ")} failed: ${formatGitError(args, timeoutMs, didTimeOut, error, stderr)}`);
          }
          if (options?.throwOnError) {
            reject(new Error(formatGitError(args, timeoutMs, didTimeOut, error, stderr), { cause: error }));
            return;
          }
          resolve3(void 0);
          return;
        }
        resolve3(stdout);
      });
      const onStderr = options?.onStderr;
      if (onStderr) {
        child.stderr?.on("data", (chunk) => onStderr(chunk.toString()));
      }
      const timer = setTimeout(() => {
        didTimeOut = true;
        child.kill();
      }, timeoutMs);
      child.on("exit", () => clearTimeout(timer));
    });
  }
};

AgentHostGitService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, INativeEnvironmentService),
  __decorateParam(2, ILogService)
], AgentHostGitService);

function getRemoteTrackingRef(branch) {
  const pullRequestRef = /^refs\/pull\/(?<number>\d+)\/head$/.exec(branch);
  const branchName = pullRequestRef?.groups ? `pull/${pullRequestRef.groups.number}/head` : branch.replace(/^refs\/remotes\/origin\//, "").replace(/^origin\//, "").replace(/^refs\/heads\//, "");
  if (branchName.startsWith("refs/")) {
    return void 0;
  }
  const remoteBranch = `origin/${branchName}`;
  return {
    branchName,
    remoteBranch,
    remoteRef: `refs/remotes/${remoteBranch}`,
    sourceRef: pullRequestRef ? branch : `refs/heads/${branchName}`
  };
}

var GitCheckoutProgressParser = class _GitCheckoutProgressParser {
  constructor(_onProgress) {
    this._onProgress = _onProgress;
    this._pending = "";
  }
  static {
    this._pattern = /Updating files:\s+\d+% \((?<done>\d+)\/(?<total>\d+)\)/g;
  }
  push(chunk) {
    const buffer = this._pending + chunk;
    const lastBreak = Math.max(buffer.lastIndexOf("\r"), buffer.lastIndexOf("\n"));
    if (lastBreak === -1) {
      this._pending = buffer;
      return;
    }
    this._pending = buffer.substring(lastBreak + 1);
    const complete = buffer.substring(0, lastBreak);
    _GitCheckoutProgressParser._pattern.lastIndex = 0;
    let match2;
    while (match2 = _GitCheckoutProgressParser._pattern.exec(complete)) {
      const filesTotal = Number(match2.groups.total);
      if (filesTotal > 0) {
        this._onProgress({ filesDone: Number(match2.groups.done), filesTotal });
      }
    }
  }
};

function toWorktreeIncludeEntries(repositoryRoot, matchedFiles, collapsedDirectories) {
  const toEntry = (relativePath2, fileCount) => ({
    sourcePath: join(repositoryRoot.fsPath, relativePath2),
    fileCount
  });
  const directoryFileCounts = /* @__PURE__ */ new Map();
  for (const dir of collapsedDirectories) {
    directoryFileCounts.set(dir, 0);
  }
  const fileEntries = [];
  for (const file of matchedFiles) {
    const containingDirectory = collapsedDirectories.size > 0 ? findContainingDirectory(file, collapsedDirectories) : void 0;
    if (containingDirectory === void 0) {
      fileEntries.push(toEntry(file, 1));
    } else {
      directoryFileCounts.set(containingDirectory, directoryFileCounts.get(containingDirectory) + 1);
    }
  }
  return [
    ...[...directoryFileCounts].map(([dir, fileCount]) => toEntry(dir, fileCount)),
    ...fileEntries
  ];
}

function findContainingDirectory(file, directories) {
  let index = file.indexOf("/");
  while (index !== -1) {
    const prefix = file.slice(0, index + 1);
    if (directories.has(prefix)) {
      return prefix;
    }
    index = file.indexOf("/", index + 1);
  }
  return void 0;
}

function hasWorktreePathCollision(file, worktreeFiles, worktreeDirectories) {
  if (worktreeFiles.has(file) || worktreeDirectories.has(`${file}/`)) {
    return true;
  }
  let index = file.indexOf("/");
  while (index !== -1) {
    if (worktreeFiles.has(file.slice(0, index))) {
      return true;
    }
    index = file.indexOf("/", index + 1);
  }
  return false;
}

function isRetryableWorktreeRemovalError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /directory not empty/i.test(message) || /\bindex\.lock\b/i.test(message) || /unable to (?:create|write|append)[^\n]*\.lock/i.test(message) || /could not lock/i.test(message);
}

function formatGitError(args, timeoutMs, didTimeOut, error, stderr) {
  const subcommand = args[0] ?? "(unknown)";
  let reason;
  if (didTimeOut) {
    reason = `git ${subcommand} timed out after ${timeoutMs}ms`;
  } else if (error.killed && error.signal) {
    reason = `git ${subcommand} killed by ${error.signal}`;
  } else if (typeof error.code === "number") {
    reason = `git ${subcommand} exited with code ${error.code}`;
  } else {
    reason = error.message;
  }
  const detail = summarizeStderrForError(stderr);
  return detail ? `${reason}: ${detail}` : reason;
}

function summarizeStderrForError(stderr) {
  if (!stderr) {
    return "";
  }
  const lines = stderr.split(/[\r\n]+/g).map((line) => line.trim()).filter((line) => line.length > 0);
  if (lines.length === 0) {
    return "";
  }
  const MAX = 200;
  const gitLfsMissing = lines.find(
    (line) => /\bgit-lfs\b/i.test(line) && /(command not found|not recognized|no such file)/i.test(line)
  );
  const summary = gitLfsMissing ?? lines[lines.length - 1];
  return summary.length > MAX ? `${summary.slice(0, MAX - 1)}\u2026` : summary;
}

function parseUntrackedPaths(output) {
  return parseChangedPaths(output, (status) => status === "??");
}

function parseChangedPaths(output, includeStatus = () => true) {
  if (!output) {
    return [];
  }
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  const addPath = (path) => {
    if (path && !seen.has(path)) {
      seen.add(path);
      result.push(path);
    }
  };
  const segments = output.split("\0");
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg) {
      continue;
    }
    const status = seg.substring(0, 2);
    const path = seg.substring(3);
    const isRenameOrCopy = status[0] === "R" || status[1] === "R" || status[0] === "C" || status[1] === "C";
    if (includeStatus(status)) {
      const isDeletedIndexAddition = status[1] === "D" && (status[0] === "A" || status[0] === "R" || status[0] === "C");
      if (!isDeletedIndexAddition) {
        addPath(path);
      }
      if (isRenameOrCopy) {
        const sourcePath = segments[++i];
        if (sourcePath) {
          addPath(sourcePath);
        }
      }
    } else if (isRenameOrCopy) {
      i++;
    }
  }
  return result;
}

function parseSingleLsTreeEntry(output) {
  if (!output) {
    return void 0;
  }
  const entry = output.split("\0")[0];
  if (!entry) {
    return void 0;
  }
  const tabIndex = entry.indexOf("	");
  const meta = (tabIndex === -1 ? entry : entry.substring(0, tabIndex)).split(" ");
  if (meta.length < 3) {
    return void 0;
  }
  return { mode: meta[0], oid: meta[2] };
}

function parseGitDiffRawNumstat(output, repositoryRoot, sessionUri, beforeRef, afterRef) {
  const segments = output.split("\0");
  const changes = [];
  const numStats = /* @__PURE__ */ new Map();
  let i = 0;
  while (i < segments.length) {
    const segment = segments[i++];
    if (!segment) {
      continue;
    }
    if (segment.startsWith(":")) {
      const fields = segment.split(" ");
      const status = fields[4] ?? "";
      const path1 = segments[i++];
      if (!path1) {
        continue;
      }
      switch (status[0]) {
        case "A":
          changes.push({ kind: "create" /* Create */, newPath: path1 });
          break;
        case "M":
          changes.push({ kind: "edit" /* Edit */, oldPath: path1, newPath: path1 });
          break;
        case "D":
          changes.push({ kind: "delete" /* Delete */, oldPath: path1 });
          break;
        case "R": {
          const path2 = segments[i++];
          if (!path2) {
            continue;
          }
          changes.push({ kind: "rename" /* Rename */, oldPath: path1, newPath: path2 });
          break;
        }
        default:
          break;
      }
    } else {
      const [addedStr, removedStr, filePath] = segment.split("	");
      let key;
      if (filePath === "" || filePath === void 0) {
        const oldPath = segments[i++];
        const newPath = segments[i++];
        key = newPath ?? oldPath ?? "";
      } else {
        key = filePath;
      }
      if (!key) {
        continue;
      }
      numStats.set(key, {
        added: addedStr === "-" ? 0 : Number(addedStr) || 0,
        removed: removedStr === "-" ? 0 : Number(removedStr) || 0
      });
    }
  }
  return changes.map((change) => {
    const stats = numStats.get(change.newPath ?? change.oldPath ?? "");
    const beforeFileUri = change.oldPath ? URI.joinPath(repositoryRoot, change.oldPath) : void 0;
    const afterFileUri = change.newPath ? URI.joinPath(repositoryRoot, change.newPath) : void 0;
    const before = change.kind !== "create" /* Create */ && change.oldPath && beforeFileUri ? {
      uri: beforeFileUri.toString(),
      content: { uri: buildGitBlobUri(sessionUri, beforeRef, change.oldPath, beforeFileUri.path) }
    } : void 0;
    const after = change.kind !== "delete" /* Delete */ && change.newPath && afterFileUri ? {
      uri: afterFileUri.toString(),
      content: afterRef !== void 0 ? { uri: buildGitBlobUri(sessionUri, afterRef, change.newPath, afterFileUri.path) } : { uri: afterFileUri.toString() }
    } : void 0;
    const diff = {
      added: stats?.added ?? 0,
      removed: stats?.removed ?? 0
    };
    return {
      ...before ? { before } : {},
      ...after ? { after } : {},
      diff
    };
  });
}

function parseGitStatusV2(output) {
  if (!output) {
    return {};
  }
  let branchName;
  let isDetachedHead;
  let upstreamBranchName;
  let outgoingChanges;
  let incomingChanges;
  let uncommittedChanges = 0;
  for (const rawLine of output.split(/\r?\n/g)) {
    const line = rawLine.trimEnd();
    if (!line) {
      continue;
    }
    if (line.startsWith("# branch.head ")) {
      const head = line.substring("# branch.head ".length).trim();
      isDetachedHead = head === "(detached)" ? true : void 0;
      branchName = isDetachedHead ? void 0 : head;
    } else if (line.startsWith("# branch.upstream ")) {
      upstreamBranchName = line.substring("# branch.upstream ".length).trim();
    } else if (line.startsWith("# branch.ab ")) {
      const m = /^# branch\.ab \+(\d+) -(\d+)$/.exec(line);
      if (m) {
        outgoingChanges = Number(m[1]);
        incomingChanges = Number(m[2]);
      }
    } else if (!line.startsWith("#")) {
      uncommittedChanges++;
    }
  }
  return { branchName, isDetachedHead, upstreamBranchName, outgoingChanges, incomingChanges, uncommittedChanges };
}

function parseHasGitHubRemote(remotesOutput) {
  if (remotesOutput === void 0) {
    return void 0;
  }
  if (!remotesOutput.trim()) {
    return false;
  }
  return /github\.com[:\/]/i.test(remotesOutput);
}

function parseFetchRemoteUrls(remotesOutput, preferredRemote) {
  const candidates = parseFetchRemotes(remotesOutput);
  if (!candidates) {
    return void 0;
  }
  const preferredNames = new Set([preferredRemote, "origin"].filter((name) => Boolean(name)));
  const ordered = [
    ...candidates.filter((candidate) => candidate.name === preferredRemote),
    ...candidates.filter((candidate) => candidate.name === "origin" && candidate.name !== preferredRemote),
    ...candidates.filter((candidate) => !preferredNames.has(candidate.name))
  ];
  return [...new Set(ordered.map((candidate) => candidate.url))];
}

function parseFetchRemotes(remotesOutput) {
  if (remotesOutput === void 0) {
    return void 0;
  }
  const candidates = [];
  for (const rawLine of remotesOutput.split(/\r?\n/)) {
    const match2 = /^(\S+)\s+(\S+)\s+\(fetch\)$/.exec(rawLine.trim());
    if (match2) {
      candidates.push({ name: match2[1], url: match2[2] });
    }
  }
  return candidates;
}

function parseGitHubRepoFromRemote(remotesOutput, remoteName) {
  const candidates = remoteName === void 0 ? parseFetchRemoteUrls(remotesOutput) : parseFetchRemotes(remotesOutput)?.filter((candidate) => candidate.name === remoteName).map((candidate) => candidate.url);
  if (!candidates) {
    return void 0;
  }
  for (const url2 of candidates) {
    const parsed = parseGitHubOwnerRepoFromUrl(url2);
    if (parsed) {
      return parsed;
    }
  }
  return void 0;
}

function parseGitHubHeadRepoFromRemoteSelection(remotesOutput, remoteSelection) {
  if (!remoteSelection) {
    return void 0;
  }
  return parseGitHubRepoFromRemote(remotesOutput, remoteSelection) ?? parseGitHubOwnerRepoFromUrl(remoteSelection);
}

function parseGitHubOwnerRepoFromUrl(url2) {
  let m = /^[^@\s]+@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i.exec(url2);
  if (m) {
    return { owner: m[1], repo: m[2] };
  }
  m = /^[a-z+]+:\/\/(?:[^@\/\s]+@)?github\.com(?::\d+)?\/([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i.exec(url2);
  if (m) {
    return { owner: m[1], repo: m[2] };
  }
  return void 0;
}

function parseDefaultBranchRef(symbolicRefOutput) {
  const ref = symbolicRefOutput?.trim();
  if (!ref) {
    return void 0;
  }
  const prefix = "refs/remotes/origin/";
  return ref.startsWith(prefix) ? ref.substring(prefix.length) : ref;
}

function parseRemoteBranchRef(ref) {
  if (!ref.startsWith("refs/remotes/")) {
    return void 0;
  }
  const name = ref.substring(13);
  const remote = name.split("/")[0];
  return { ref, name, remote };
}

function parseGitRefs(output) {
  if (!output) {
    return [];
  }
  const refs = [];
  for (const line of output.split(/\r?\n/g)) {
    const [ref, upstream] = line.trim().split("\0");
    if (ref.startsWith("refs/heads/")) {
      refs.push({
        ref,
        name: ref.substring(11),
        upstream: upstream ? parseRemoteBranchRef(upstream) : void 0,
        kind: 0 /* Head */
      });
    } else if (ref.startsWith("refs/remotes/") && !/^refs\/remotes\/[^/]+\/HEAD$/.test(ref)) {
      const parsedRemoteBranch = parseRemoteBranchRef(ref);
      if (parsedRemoteBranch) {
        refs.push({
          ...parsedRemoteBranch,
          kind: 1 /* RemoteHead */
        });
      }
    } else if (ref.startsWith("refs/tags/")) {
      refs.push({
        ref,
        name: ref.substring(10),
        kind: 3 /* Tag */
      });
    }
  }
  return refs;
}

function stripUndefined(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== void 0) {
      out[k] = v;
    }
  }
  return out;
}

function isMaxBufferError(error) {
  const cause = error instanceof Error ? error.cause : void 0;
  return cause instanceof Error && cause.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER";
}
export { getRemoteTrackingRef, toWorktreeIncludeEntries, findContainingDirectory, hasWorktreePathCollision, isRetryableWorktreeRemovalError, formatGitError, summarizeStderrForError, parseUntrackedPaths, parseChangedPaths, parseSingleLsTreeEntry, parseGitDiffRawNumstat, parseGitStatusV2, parseHasGitHubRemote, parseFetchRemoteUrls, parseFetchRemotes, parseGitHubRepoFromRemote, parseGitHubHeadRepoFromRemoteSelection, parseGitHubOwnerRepoFromUrl, parseDefaultBranchRef, parseRemoteBranchRef, parseGitRefs, stripUndefined, isMaxBufferError, cp4, fsPromises, copyFile2, WORKTREE_REMOVAL_MAX_ATTEMPTS, WORKTREE_REMOVAL_RETRY_BASE_DELAY_MS, WORKTREE_REMOVAL_RETRY_MAX_DELAY_MS, AgentHostGitService, GitCheckoutProgressParser };
