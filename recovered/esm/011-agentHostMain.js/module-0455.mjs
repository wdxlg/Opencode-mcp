// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostDebugLogs.ts
import { Disposable, toDisposable } from "./module-0010.mjs";
import { generateUuid } from "./module-0042.mjs";
import { join } from "./module-0018.mjs";
import { URI } from "./module-0023.mjs";
import { zip } from "./module-0456.mjs";
import { Schemas } from "./module-0024.mjs";
import { AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES, AGENT_HOST_DEBUG_LOGS_MAX_ENTRIES } from "./module-0049.mjs";
import { VSBuffer } from "./module-0029.mjs";
import { disposableTimeout } from "./module-0027.mjs";


// src/vs/platform/agentHost/node/agentHostDebugLogs.ts
import { copyFile, mkdir as mkdir5, open as open2, readdir as readdir2, rm as rm3, stat as stat2 } from "fs/promises";


// src/vs/platform/agentHost/node/agentHostDebugLogs.ts
var DEFAULT_ARTIFACT_LEASE_MS = 10 * 60 * 1e3;

var AgentHostDebugLogsCollector = class extends Disposable {
  constructor(_environment, _logService, _artifactLeaseMs = DEFAULT_ARTIFACT_LEASE_MS) {
    super();
    this._environment = _environment;
    this._logService = _logService;
    this._artifactLeaseMs = _artifactLeaseMs;
    this._retainedArtifacts = /* @__PURE__ */ new Map();
    this._readableArtifacts = /* @__PURE__ */ new Set();
    this._register(toDisposable(() => void this.cleanup()));
  }
  async collect(providers, session, kind, chat) {
    const id2 = generateUuid();
    const staging = join(this._environment.tmpDir.fsPath, `agent-host-debug-logs-${id2}`);
    await mkdir5(staging, { recursive: true });
    this._retainedArtifacts.set(artifactKey(staging), true);
    let providerLogsIncluded = false;
    let retainStaging = false;
    const archive = join(this._environment.tmpDir.fsPath, `agent-host-debug-logs-${id2}.zip`);
    try {
      for (const provider of providers) {
        if (!provider.collectDebugLogs) {
          continue;
        }
        providerLogsIncluded = await provider.collectDebugLogs(session, URI.file(staging), chat) || providerLogsIncluded;
      }
      await this._copyAgentHostLogs(staging);
      const files = await collectFiles(staging);
      let uncompressedSize = 0;
      const artifactEntries = [];
      for (const file of files) {
        const { size } = await stat2(file.localPath);
        uncompressedSize += size;
        artifactEntries.push({ path: file.path, size });
      }
      if (kind === "directory") {
        retainStaging = true;
        this._scheduleCleanup(staging, true, files.map((file) => file.localPath));
        return { kind, resource: URI.file(staging), providerLogsIncluded, size: uncompressedSize, uncompressedSize, entries: artifactEntries };
      }
      await zip(archive, files);
      const archiveSize = (await stat2(archive)).size;
      this._scheduleCleanup(archive, false, [archive]);
      return { kind, resource: URI.file(archive), providerLogsIncluded, size: archiveSize, uncompressedSize, entries: artifactEntries };
    } catch (error) {
      await rm3(archive, { force: true });
      throw error;
    } finally {
      if (!retainStaging) {
        await rm3(staging, { recursive: true, force: true });
        this._retainedArtifacts.delete(artifactKey(staging));
      }
    }
  }
  /**
   * Read one bounded slice of an artifact this collector produced. The
   * resource must be a currently retained *file* artifact, so this cannot be
   * used as a general-purpose file read.
   */
  async readArtifactChunk(resource, position) {
    if (resource.scheme !== Schemas.file) {
      throw new Error(`Unsupported debug-log artifact scheme: ${resource.scheme}`);
    }
    if (!Number.isSafeInteger(position) || position < 0) {
      throw new Error(`Invalid debug-log artifact position: ${position}`);
    }
    const path = resource.fsPath;
    if (!this._readableArtifacts.has(artifactKey(path))) {
      throw new Error("Unknown or expired Agent Host debug-log artifact");
    }
    const handle = await open2(path, "r");
    try {
      const buffer = Buffer.allocUnsafe(AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES);
      const { bytesRead } = await handle.read(buffer, 0, AGENT_HOST_DEBUG_LOGS_CHUNK_BYTES, position);
      const { size } = await handle.stat();
      return {
        data: VSBuffer.wrap(buffer.subarray(0, bytesRead)),
        eof: position + bytesRead >= size
      };
    } finally {
      await handle.close();
    }
  }
  async cleanup() {
    const artifacts = [...this._retainedArtifacts];
    this._retainedArtifacts.clear();
    this._readableArtifacts.clear();
    await Promise.all(artifacts.map(async ([path, recursive]) => {
      try {
        await rm3(path, { recursive, force: true });
      } catch (error) {
        this._logService.warn(`[AgentHostDebugLogs] Failed to remove temporary artifact during shutdown ${path}`, error);
      }
    }));
  }
  async _copyAgentHostLogs(staging) {
    let names;
    try {
      names = (await readdir2(this._environment.logsHome.fsPath, { withFileTypes: true })).filter((entry) => entry.isFile() && (isRotatedLogFile(entry.name, "agenthost.log") || isRotatedLogFile(entry.name, "agenthost-server.log"))).map((entry) => entry.name);
    } catch (error) {
      if (error.code !== "ENOENT") {
        this._logService.warn(`[AgentHostDebugLogs] Failed to enumerate Agent Host process logs`, error);
      }
      return;
    }
    for (const name of names) {
      const source = join(this._environment.logsHome.fsPath, name);
      try {
        await copyFile(source, join(staging, name));
      } catch (error) {
        this._logService.warn(`[AgentHostDebugLogs] Failed to include ${source}`, error);
      }
    }
  }
  _scheduleCleanup(path, recursive, readablePaths) {
    this._retainedArtifacts.set(artifactKey(path), recursive);
    for (const readablePath of readablePaths) {
      this._readableArtifacts.add(artifactKey(readablePath));
    }
    this._register(disposableTimeout(() => {
      this._retainedArtifacts.delete(artifactKey(path));
      for (const readablePath of readablePaths) {
        this._readableArtifacts.delete(artifactKey(readablePath));
      }
      rm3(path, { recursive, force: true }).catch((error) => {
        this._logService.warn(`[AgentHostDebugLogs] Failed to expire temporary artifact ${path}`, error);
      });
    }, this._artifactLeaseMs));
  }
};

function artifactKey(path) {
  return URI.file(path).fsPath;
}

async function collectFiles(root, relative2 = "", files = []) {
  const directory = join(root, relative2);
  const entries = await readdir2(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = relative2 ? `${relative2}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await collectFiles(root, path, files);
    } else if (entry.isFile()) {
      files.push({ path, localPath: join(root, path) });
      if (files.length > AGENT_HOST_DEBUG_LOGS_MAX_ENTRIES) {
        throw new Error(`Agent Host debug logs contain too many files (${files.length}; limit ${AGENT_HOST_DEBUG_LOGS_MAX_ENTRIES})`);
      }
    }
  }
  return files;
}

function isRotatedLogFile(candidate, current) {
  if (candidate === current) {
    return true;
  }
  const stem = current.endsWith(".log") ? current.slice(0, -".log".length) : current;
  const prefix = `${stem}.`;
  if (!candidate.startsWith(prefix) || !candidate.endsWith(".log")) {
    return false;
  }
  const rotation = candidate.slice(prefix.length, -".log".length);
  return /^[1-9]\d*$/.test(rotation);
}
export { artifactKey, collectFiles, isRotatedLogFile, copyFile, mkdir5, open2, readdir2, rm3, stat2, DEFAULT_ARTIFACT_LEASE_MS, AgentHostDebugLogsCollector };
