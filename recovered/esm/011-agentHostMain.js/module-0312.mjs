// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentSdkDownloader.ts
import { detectLibcSync } from "./module-0313.mjs";
import { createDecorator } from "./module-0044.mjs";
import { Disposable, toDisposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { URI } from "./module-0023.mjs";
import { format22 } from "./module-0021.mjs";
import { dirname, join } from "./module-0018.mjs";
import { generateUuid } from "./module-0042.mjs";
import { VSBuffer } from "./module-0029.mjs";
import { CancellationError } from "./module-0002.mjs";
import { reportAgentSdkDownload } from "./module-0314.mjs";
import { FileOperationError, IFileService, toFileOperationResult } from "./module-0128.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeEnvironmentService } from "./module-0129.mjs";
import { IProductService } from "./module-0173.mjs";
import { IRequestService } from "./module-0146.mjs";
import { ILogService } from "./module-0084.mjs";
import { ITelemetryService } from "./module-0053.mjs";


// src/vs/platform/agentHost/node/agentSdkDownloader.ts
import * as fs7 from "fs";

import * as tar from "tar";


// src/vs/platform/agentHost/node/agentSdkDownloader.ts
var SUPPORTED_PLATFORMS = /* @__PURE__ */ new Set(["linux", "darwin", "win32"]);

var SUPPORTED_ARCHES = /* @__PURE__ */ new Set(["x64", "arm64"]);

function resolveSdkTarget(pkg2, host = { platform: process.platform, arch: process.arch, libc: detectLibcSync() }) {
  if (!SUPPORTED_PLATFORMS.has(host.platform) || !SUPPORTED_ARCHES.has(host.arch)) {
    return void 0;
  }
  if (host.platform === "linux" && pkg2.hasSeparateMuslLinuxPackage && host.libc === "musl") {
    return `linux-${host.arch}-musl`;
  }
  return `${host.platform}-${host.arch}`;
}

var IAgentSdkDownloader = createDecorator("agentSdkDownloader");

var LOAD_FAILURE_NEGATIVE_CACHE_MS = 3e4;

var PROGRESS_EMIT_THROTTLE_MS = 250;

function parseContentLength(header) {
  if (typeof header !== "string" || !/^\d+$/.test(header)) {
    return void 0;
  }
  const parsed = parseInt(header, 10);
  return parsed > 0 ? parsed : void 0;
}

var AgentSdkDownloader = class extends Disposable {
  constructor(_environmentService, _productService, _requestService, _fileService, _logService, _telemetryService) {
    super();
    this._environmentService = _environmentService;
    this._productService = _productService;
    this._requestService = _requestService;
    this._fileService = _fileService;
    this._logService = _logService;
    this._telemetryService = _telemetryService;
    this._onDidDownloadProgress = this._register(new Emitter());
    this.onDidDownloadProgress = this._onDidDownloadProgress.event;
    /**
     * In-flight downloads keyed by the destination `cacheDir` (which
     * already encodes `<pkg>/<sdkVersion>/<sdkTarget>`). Concurrent
     * `loadSdkRoot` calls in the same process share the same promise so
     * we never download the same tarball twice. Universal launches that
     * resolve to different targets get distinct entries because their
     * cacheDirs differ.
     */
    this._pendingDownloads = /* @__PURE__ */ new Map();
    /** Refcounted user-initiated progress interest, keyed by package id. */
    this._explicitProgressInterest = /* @__PURE__ */ new Map();
    /**
     * Negative cache: most recent failure per package id, with an expiry.
     * While within the window, `loadSdkRoot` re-throws the cached error
     * immediately instead of re-attempting the download. Without this, a
     * broken CDN causes every SDK method call (poll-driven UIs hit this
     * hard) to fire a fresh request.
     *
     * Keyed by `pkg.id` (not the finer cacheDir): CDN failures are
     * effectively global per SDK (DNS, proxy auth, 5xx) and per-target
     * latching wouldn't protect against the actual failure modes — the
     * broader latch is intentional.
     */
    this._failureLatch = /* @__PURE__ */ new Map();
  }
  isAvailable(pkg2) {
    if (process.env[pkg2.devOverrideEnvVar]) {
      return true;
    }
    return !!this._productService.agentSdks?.[pkg2.id] && resolveSdkTarget(pkg2) !== void 0;
  }
  acquireDownloadProgressInterest(pkg2) {
    this._explicitProgressInterest.set(pkg2.id, (this._explicitProgressInterest.get(pkg2.id) ?? 0) + 1);
    return toDisposable(() => {
      const count = this._explicitProgressInterest.get(pkg2.id) ?? 0;
      if (count <= 1) {
        this._explicitProgressInterest.delete(pkg2.id);
      } else {
        this._explicitProgressInterest.set(pkg2.id, count - 1);
      }
    });
  }
  async isSdkResolvableWithoutDownload(pkg2) {
    if (process.env[pkg2.devOverrideEnvVar]) {
      return true;
    }
    const config = this._productService.agentSdks?.[pkg2.id];
    if (!config) {
      return false;
    }
    const sdkTarget = resolveSdkTarget(pkg2);
    if (!sdkTarget) {
      return false;
    }
    const sentinel = URI.joinPath(URI.file(this._cacheDir(pkg2.id, config.version, sdkTarget)), ".complete");
    return this._fileService.exists(sentinel);
  }
  async loadSdkRoot(pkg2, token) {
    const override = process.env[pkg2.devOverrideEnvVar];
    if (override) {
      this._logService.info(`[AgentSdkDownloader] ${pkg2.id}: using dev override at ${override}`);
      return override;
    }
    const latched = this._failureLatch.get(pkg2.id);
    if (latched && latched.expiresAt > Date.now() && !this._explicitProgressInterest.has(pkg2.id)) {
      throw latched.error;
    }
    try {
      const root = await this._resolveOrDownload(pkg2, token);
      this._failureLatch.delete(pkg2.id);
      return root;
    } catch (err) {
      if (token.isCancellationRequested) {
        throw err;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      this._failureLatch.set(pkg2.id, {
        error,
        expiresAt: Date.now() + LOAD_FAILURE_NEGATIVE_CACHE_MS
      });
      throw error;
    }
  }
  async _resolveOrDownload(pkg2, token) {
    const config = this._productService.agentSdks?.[pkg2.id];
    if (!config) {
      throw new Error(
        `Cannot load ${pkg2.id} SDK: no \`product.agentSdks.${pkg2.id}\` configured and no ${pkg2.devOverrideEnvVar} dev override set.`
      );
    }
    const sdkTarget = resolveSdkTarget(pkg2);
    if (!sdkTarget) {
      throw new Error(
        `Cannot load ${pkg2.id} SDK: no SDK target for this host (${process.platform}/${process.arch}). Set ${pkg2.devOverrideEnvVar} to a local SDK root to bypass.`
      );
    }
    const url2 = format22(config.urlTemplate, { sdkTarget });
    const stray = /{[^}]+}/.exec(url2);
    if (stray) {
      throw new Error(
        `Cannot load ${pkg2.id} SDK: \`product.agentSdks.${pkg2.id}.urlTemplate\` contains an unknown placeholder ${stray[0]} \u2014 only {sdkTarget} is substituted. Template: ${config.urlTemplate}`
      );
    }
    const cacheDir = this._cacheDir(pkg2.id, config.version, sdkTarget);
    const sentinel = URI.joinPath(URI.file(cacheDir), ".complete");
    if (await this._fileService.exists(sentinel)) {
      this._logService.trace(`[AgentSdkDownloader] ${pkg2.id}: cache hit at ${cacheDir}`);
      return cacheDir;
    }
    this._logService.info(`[AgentSdkDownloader] ${pkg2.id}: cache miss for version ${config.version} (${sdkTarget}); a download is required`);
    let pending = this._pendingDownloads.get(cacheDir);
    if (!pending) {
      pending = this._download(pkg2, url2, cacheDir, sentinel, token).finally(() => {
        this._pendingDownloads.delete(cacheDir);
      });
      this._pendingDownloads.set(cacheDir, pending);
    }
    return pending;
  }
  _cacheDir(packageId, sdkVersion, sdkTarget) {
    return join(
      this._environmentService.userDataPath,
      "agent-host",
      "sdk-cache",
      packageId,
      sdkVersion,
      sdkTarget
    );
  }
  async _download(pkg2, url2, cacheDir, sentinel, token) {
    this._logService.info(`[AgentSdkDownloader] ${pkg2.id}: downloading from ${url2}`);
    const start = Date.now();
    const parent = dirname(cacheDir);
    await this._fileService.createFolder(URI.file(parent));
    const tmpDir = `${cacheDir}.tmp.${process.pid}`;
    const tmpDirUri = URI.file(tmpDir);
    await this._delIgnoringMissing(tmpDirUri);
    await this._fileService.createFolder(tmpDirUri);
    const downloadId = generateUuid();
    let lastReceived = 0;
    let lastTotal;
    this._fireProgress(pkg2, downloadId, start, "started", 0, void 0);
    try {
      const tarballPath = join(tmpDir, "sdk.tgz");
      await this._fetch(url2, tarballPath, token, (receivedBytes, totalBytes) => {
        lastReceived = receivedBytes;
        lastTotal = totalBytes;
        this._fireProgress(pkg2, downloadId, start, "progress", receivedBytes, totalBytes);
      });
      await this._extractTarGz(tarballPath, tmpDir);
      await this._fileService.del(URI.file(tarballPath));
      await this._fileService.writeFile(
        URI.joinPath(tmpDirUri, ".complete"),
        VSBuffer.fromString("")
      );
      try {
        await this._fileService.move(tmpDirUri, URI.file(cacheDir));
      } catch (err) {
        if (await this._handleRenameLoser(err, sentinel, tmpDirUri)) {
          this._logService.info(`[AgentSdkDownloader] ${pkg2.id}: lost rename race, using existing cache`);
          this._fireProgress(pkg2, downloadId, start, "completed", lastReceived, lastTotal);
          return cacheDir;
        }
        throw err;
      }
      const elapsed = Math.round((Date.now() - start) / 1e3);
      this._logService.info(`[AgentSdkDownloader] ${pkg2.id}: downloaded ${lastTotal ?? lastReceived} bytes in ${elapsed}s`);
      this._fireProgress(pkg2, downloadId, start, "completed", lastTotal ?? lastReceived, lastTotal);
      return cacheDir;
    } catch (err) {
      await this._delIgnoringMissing(tmpDirUri);
      if (token.isCancellationRequested) {
        this._fireProgress(pkg2, downloadId, start, "failed", lastReceived, lastTotal, "cancelled");
        throw new CancellationError();
      }
      const message = err instanceof Error ? err.message : String(err);
      this._fireProgress(pkg2, downloadId, start, "failed", lastReceived, lastTotal, message);
      throw new Error(
        `Failed to download ${pkg2.id} SDK from ${url2} (cache target: ${cacheDir}). Set ${pkg2.devOverrideEnvVar} to a local SDK root to bypass. Cause: ${message}`
      );
    }
  }
  _fireProgress(pkg2, downloadId, startedAt, phase, receivedBytes, totalBytes, error) {
    const progress = {
      downloadId,
      packageId: pkg2.id,
      displayName: pkg2.displayName,
      phase,
      receivedBytes,
      totalBytes,
      explicitlyRequested: this._explicitProgressInterest.has(pkg2.id),
      ...error !== void 0 ? { error } : {}
    };
    this._onDidDownloadProgress.fire(progress);
    if (phase !== "progress") {
      reportAgentSdkDownload(this._telemetryService, this._logService, progress, Date.now() - startedAt);
    }
  }
  async _handleRenameLoser(err, sentinel, tmpDirUri) {
    if (!(err instanceof FileOperationError) || err.fileOperationResult !== 4 /* FILE_MOVE_CONFLICT */) {
      return false;
    }
    if (!await this._fileService.exists(sentinel)) {
      return false;
    }
    await this._delIgnoringMissing(tmpDirUri);
    return true;
  }
  async _fetch(url2, dest, token, onBytes) {
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    const context = await this._requestService.request({
      url: url2,
      type: "GET",
      callSite: "agentSdkDownloader"
    }, token);
    if (token.isCancellationRequested) {
      context.stream.destroy();
      throw new CancellationError();
    }
    const statusCode = context.res.statusCode ?? 0;
    if (statusCode < 200 || statusCode >= 300) {
      context.stream.destroy();
      throw new Error(`HTTP ${statusCode} fetching ${url2}`);
    }
    const totalBytes = parseContentLength(context.res.headers["content-length"]);
    await new Promise((resolve3, reject) => {
      const out = fs7.createWriteStream(dest);
      let settled = false;
      let receivedBytes = 0;
      let lastEmitTime = 0;
      const emitBytes = (force) => {
        if (!onBytes) {
          return;
        }
        const now = Date.now();
        if (!force && now - lastEmitTime < PROGRESS_EMIT_THROTTLE_MS) {
          return;
        }
        lastEmitTime = now;
        onBytes(receivedBytes, totalBytes);
      };
      const settleResolve = () => {
        if (settled) {
          return;
        }
        settled = true;
        cancelSub.dispose();
        resolve3();
      };
      const settleReject = (err) => {
        if (settled) {
          return;
        }
        settled = true;
        cancelSub.dispose();
        context.stream.destroy();
        out.destroy();
        reject(err);
      };
      const cancelSub = token.onCancellationRequested(() => settleReject(new CancellationError()));
      out.on("error", settleReject);
      out.on("finish", settleResolve);
      out.on("drain", () => context.stream.resume());
      context.stream.on("data", (chunk) => {
        receivedBytes += chunk.byteLength;
        emitBytes(false);
        if (!out.write(chunk.buffer)) {
          context.stream.pause();
        }
      });
      context.stream.on("end", () => {
        emitBytes(true);
        out.end();
      });
      context.stream.on("error", settleReject);
    });
  }
  async _extractTarGz(tarball, dest) {
    await tar.x({ file: tarball, cwd: dest });
  }
  async _delIgnoringMissing(uri) {
    try {
      await this._fileService.del(uri, { recursive: true });
    } catch (err) {
      if (toFileOperationResult(err) !== 1 /* FILE_NOT_FOUND */) {
        throw err;
      }
    }
  }
};

AgentSdkDownloader = __decorateClass([
  __decorateParam(0, INativeEnvironmentService),
  __decorateParam(1, IProductService),
  __decorateParam(2, IRequestService),
  __decorateParam(3, IFileService),
  __decorateParam(4, ILogService),
  __decorateParam(5, ITelemetryService)
], AgentSdkDownloader);
export { resolveSdkTarget, parseContentLength, fs7, tar, SUPPORTED_PLATFORMS, SUPPORTED_ARCHES, IAgentSdkDownloader, LOAD_FAILURE_NEGATIVE_CACHE_MS, PROGRESS_EMIT_THROTTLE_MS, AgentSdkDownloader };
