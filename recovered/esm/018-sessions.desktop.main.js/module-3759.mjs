// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/fileTreeView/browser/githubFileSystemProvider.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { createFileSystemProviderError } from "./module-0269.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IRequestService, asJson } from "./module-0947.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/fileTreeView/browser/githubFileSystemProvider.ts
var GitHubFileSystemProvider = class extends Disposable {
  constructor(requestService, authenticationService, logService) {
    super();
    this.requestService = requestService;
    this.authenticationService = authenticationService;
    this.logService = logService;
    this._onDidChangeCapabilities = this._register(new Emitter());
    this.onDidChangeCapabilities = this._onDidChangeCapabilities.event;
    this.capabilities = 2048 /* Readonly */ | 2 /* FileReadWrite */ | 1024 /* PathCaseSensitive */;
    this._onDidChangeFile = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChangeFile.event;
    /** Cache keyed by "owner/repo/ref" */
    this.treeCache = /* @__PURE__ */ new Map();
    /** Negative cache for refs that returned 404, keyed by "owner/repo/ref" */
    this.notFoundCache = /* @__PURE__ */ new Map();
    /** In-flight fetch promises keyed by "owner/repo/ref" to deduplicate concurrent requests */
    this.pendingFetches = /* @__PURE__ */ new Map();
  }
  static {
    /** Cache TTL - 5 minutes */
    this.CACHE_TTL_MS = 5 * 60 * 1e3;
  }
  static {
    /** Negative cache TTL - 1 minute */
    this.NOT_FOUND_CACHE_TTL_MS = 60 * 1e3;
  }
  // --- URI parsing
  /**
   * Parse a github-remote-file URI into its components.
   * Format: github-remote-file://github/{owner}/{repo}/{ref}/{path...}
   */
  parseUri(resource) {
    const parts = resource.path.split("/").filter(Boolean);
    if (parts.length < 3) {
      throw createFileSystemProviderError("Invalid github-remote-file URI: expected /{owner}/{repo}/{ref}/...", "EntryNotFound" /* FileNotFound */);
    }
    const owner = decodeURIComponent(parts[0]);
    const repo = decodeURIComponent(parts[1]);
    const ref = decodeURIComponent(parts[2]);
    const path = parts.slice(3).map(decodeURIComponent).join("/");
    return { owner, repo, ref, path };
  }
  getCacheKey(owner, repo, ref) {
    return `${owner}/${repo}/${ref}`;
  }
  // --- GitHub API
  async getAuthToken() {
    let sessions = await this.authenticationService.getSessions("github", [], { silent: true });
    if (!sessions || sessions.length === 0) {
      sessions = await this.authenticationService.getSessions("github", [], { createIfNone: true });
    }
    if (!sessions || sessions.length === 0) {
      throw createFileSystemProviderError("No GitHub authentication sessions available", "Unavailable" /* Unavailable */);
    }
    return sessions[0].accessToken ?? "";
  }
  fetchTree(owner, repo, ref) {
    const cacheKey2 = this.getCacheKey(owner, repo, ref);
    const cached = this.treeCache.get(cacheKey2);
    if (cached && Date.now() - cached.fetchedAt < GitHubFileSystemProvider.CACHE_TTL_MS) {
      return Promise.resolve(cached);
    }
    const notFoundAt = this.notFoundCache.get(cacheKey2);
    if (notFoundAt !== void 0 && Date.now() - notFoundAt < GitHubFileSystemProvider.NOT_FOUND_CACHE_TTL_MS) {
      return Promise.reject(createFileSystemProviderError(`Tree not found for ${owner}/${repo}@${ref}`, "EntryNotFound" /* FileNotFound */));
    }
    const pending = this.pendingFetches.get(cacheKey2);
    if (pending) {
      return pending;
    }
    const promise = this.doFetchTree(owner, repo, ref, cacheKey2).finally(() => {
      this.pendingFetches.delete(cacheKey2);
    });
    this.pendingFetches.set(cacheKey2, promise);
    return promise;
  }
  async doFetchTree(owner, repo, ref, cacheKey2) {
    this.logService.info(`[SessionRepoFS] Fetching tree for ${owner}/${repo}@${ref}`);
    const token = await this.getAuthToken();
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(ref)}?recursive=1`;
    const response = await this.requestService.request({
      type: "GET",
      url,
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "VSCode-SessionRepoFS"
      },
      callSite: "githubFileSystemProvider.fetchTree"
    }, CancellationToken.None);
    if (response.res.statusCode === 404) {
      this.notFoundCache.set(cacheKey2, Date.now());
      throw createFileSystemProviderError(`Tree not found for ${owner}/${repo}@${ref}`, "EntryNotFound" /* FileNotFound */);
    }
    const data = await asJson(response);
    if (!data) {
      throw createFileSystemProviderError(`Failed to fetch tree for ${owner}/${repo}@${ref}`, "Unavailable" /* Unavailable */);
    }
    const entries2 = /* @__PURE__ */ new Map();
    entries2.set("", { type: 2 /* Directory */, size: 0, sha: data.sha });
    const dirs = /* @__PURE__ */ new Set();
    for (const entry of data.tree) {
      const fileType = entry.type === "tree" ? 2 /* Directory */ : 1 /* File */;
      entries2.set(entry.path, { type: fileType, size: entry.size ?? 0, sha: entry.sha });
      if (fileType === 2 /* Directory */) {
        dirs.add(entry.path);
      }
      const pathParts = entry.path.split("/");
      for (let i2 = 1; i2 < pathParts.length; i2++) {
        const parentPath = pathParts.slice(0, i2).join("/");
        if (!dirs.has(parentPath)) {
          dirs.add(parentPath);
          if (!entries2.has(parentPath)) {
            entries2.set(parentPath, { type: 2 /* Directory */, size: 0, sha: "" });
          }
        }
      }
    }
    const cacheEntry = { entries: entries2, fetchedAt: Date.now() };
    this.treeCache.set(cacheKey2, cacheEntry);
    return cacheEntry;
  }
  // --- IFileSystemProvider
  async stat(resource) {
    const { owner, repo, ref, path } = this.parseUri(resource);
    const tree = await this.fetchTree(owner, repo, ref);
    const entry = tree.entries.get(path);
    if (!entry) {
      throw createFileSystemProviderError("File not found", "EntryNotFound" /* FileNotFound */);
    }
    return {
      type: entry.type,
      ctime: 0,
      mtime: 0,
      size: entry.size
    };
  }
  async readdir(resource) {
    const { owner, repo, ref, path } = this.parseUri(resource);
    const tree = await this.fetchTree(owner, repo, ref);
    const prefix = path ? path + "/" : "";
    const result = [];
    for (const [entryPath, entry] of tree.entries) {
      if (!entryPath.startsWith(prefix)) {
        continue;
      }
      const relativePath2 = entryPath.slice(prefix.length);
      if (relativePath2 && !relativePath2.includes("/")) {
        result.push([relativePath2, entry.type]);
      }
    }
    return result;
  }
  async readFile(resource) {
    const { owner, repo, ref, path } = this.parseUri(resource);
    const tree = await this.fetchTree(owner, repo, ref);
    const entry = tree.entries.get(path);
    if (!entry || entry.type === 2 /* Directory */) {
      throw createFileSystemProviderError("File not found", "EntryNotFound" /* FileNotFound */);
    }
    const token = await this.getAuthToken();
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs/${encodeURIComponent(entry.sha)}`;
    const response = await this.requestService.request({
      type: "GET",
      url,
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "VSCode-SessionRepoFS"
      },
      callSite: "githubFileSystemProvider.readFile"
    }, CancellationToken.None);
    const data = await asJson(response);
    if (!data) {
      throw createFileSystemProviderError(`Failed to read file ${path}`, "Unavailable" /* Unavailable */);
    }
    if (data.encoding === "base64") {
      const binaryString = atob(data.content.replace(/\n/g, ""));
      const bytes = new Uint8Array(binaryString.length);
      for (let i2 = 0; i2 < binaryString.length; i2++) {
        bytes[i2] = binaryString.charCodeAt(i2);
      }
      return bytes;
    }
    return new TextEncoder().encode(data.content);
  }
  // --- Readonly stubs
  watch() {
    return Disposable.None;
  }
  async writeFile(_resource, _content, _opts) {
    throw createFileSystemProviderError("Operation not supported", "NoPermissions" /* NoPermissions */);
  }
  async mkdir(_resource) {
    throw createFileSystemProviderError("Operation not supported", "NoPermissions" /* NoPermissions */);
  }
  async delete(_resource, _opts) {
    throw createFileSystemProviderError("Operation not supported", "NoPermissions" /* NoPermissions */);
  }
  async rename(_from, _to, _opts) {
    throw createFileSystemProviderError("Operation not supported", "NoPermissions" /* NoPermissions */);
  }
  // --- Cache management
  invalidateCache(owner, repo, ref) {
    const cacheKey2 = this.getCacheKey(owner, repo, ref);
    this.treeCache.delete(cacheKey2);
    this.notFoundCache.delete(cacheKey2);
  }
  dispose() {
    this.treeCache.clear();
    this.notFoundCache.clear();
    this.pendingFetches.clear();
    super.dispose();
  }
};

GitHubFileSystemProvider = __decorateClass([
  __decorateParam(0, IRequestService),
  __decorateParam(1, IAuthenticationService),
  __decorateParam(2, ILogService)
], GitHubFileSystemProvider);
export { GitHubFileSystemProvider };
