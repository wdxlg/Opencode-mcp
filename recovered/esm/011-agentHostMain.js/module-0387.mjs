// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexSessionMetadataStore.ts
import { AH_META_WORKSPACELESS_DB_KEY } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionDataService } from "./module-0139.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/codex/codexSessionMetadataStore.ts
var CodexSessionMetadataStore = class {
  constructor(_sessionDataService, _logService) {
    this._sessionDataService = _sessionDataService;
    this._logService = _logService;
  }
  static {
    this.KEY_THREAD_ID = "codex.threadId";
  }
  static {
    this.KEY_CWD = "codex.cwd";
  }
  static {
    this.KEY_MODEL = "codex.model";
  }
  static {
    this.KEY_AGENT = "codex.agent";
  }
  static {
    this.KEY_OWNS_MANAGED_WORKING_DIRECTORY = "codex.ownsManagedWorkingDirectory";
  }
  static {
    this.KEY_MANAGED_WORKING_DIRECTORY = "codex.managedWorkingDirectory";
  }
  async hasKnownSession(session) {
    const ref = await this._sessionDataService.tryOpenDatabase(session);
    if (!ref) {
      return false;
    }
    try {
      const metadata = await ref.object.getMetadataObject({
        [AH_META_WORKSPACELESS_DB_KEY]: true,
        "codex.external": true,
        [CodexSessionMetadataStore.KEY_THREAD_ID]: true,
        [CodexSessionMetadataStore.KEY_CWD]: true,
        [CodexSessionMetadataStore.KEY_MODEL]: true,
        [CodexSessionMetadataStore.KEY_AGENT]: true,
        [CodexSessionMetadataStore.KEY_OWNS_MANAGED_WORKING_DIRECTORY]: true,
        [CodexSessionMetadataStore.KEY_MANAGED_WORKING_DIRECTORY]: true
      });
      return Object.values(metadata).some((value) => value !== void 0);
    } finally {
      ref.dispose();
    }
  }
  /**
   * Persist the supplied overlay fields. Only-write-on-defined.
   * Best-effort: failures are logged and swallowed because the caller
   * has already committed in-memory state and a corrupt DB shouldn't
   * abort the current turn.
   */
  async write(session, fields) {
    try {
      const ref = this._sessionDataService.openDatabase(session);
      const db = ref.object;
      try {
        const work = [];
        if (fields.threadId !== void 0) {
          work.push(db.setMetadata(CodexSessionMetadataStore.KEY_THREAD_ID, fields.threadId));
        }
        if (fields.cwd !== void 0) {
          work.push(db.setMetadata(
            CodexSessionMetadataStore.KEY_CWD,
            serializeCwd(fields.cwd, fields.workingDirectories)
          ));
        }
        if (fields.modelId !== void 0) {
          work.push(db.setMetadata(CodexSessionMetadataStore.KEY_MODEL, fields.modelId));
        }
        if (fields.agent !== void 0) {
          work.push(db.setMetadata(
            CodexSessionMetadataStore.KEY_AGENT,
            fields.agent === null ? "" : JSON.stringify({ uri: fields.agent.uri })
          ));
        }
        if (fields.ownsManagedWorkingDirectory !== void 0) {
          work.push(db.setMetadata(
            CodexSessionMetadataStore.KEY_OWNS_MANAGED_WORKING_DIRECTORY,
            fields.ownsManagedWorkingDirectory ? "true" : "false"
          ));
        }
        if (fields.managedWorkingDirectory !== void 0) {
          work.push(db.setMetadata(
            CodexSessionMetadataStore.KEY_MANAGED_WORKING_DIRECTORY,
            fields.managedWorkingDirectory === null ? "" : fields.managedWorkingDirectory.toString()
          ));
        }
        await Promise.all(work);
      } finally {
        ref.dispose();
      }
    } catch (err) {
      this._logService.warn(`[Codex] metadata write failed for ${session.toString()}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  /**
   * Read overlay fields for `session`. Returns `{}` when no DB has
   * been created yet (fresh session, or external codex CLI thread the
   * workbench has never touched).
   */
  async read(session) {
    try {
      const ref = await this._sessionDataService.tryOpenDatabase(session);
      if (!ref) {
        return {};
      }
      try {
        const [threadId, cwdRaw, modelId, agentRaw, ownsManagedWorkingDirectoryRaw, managedWorkingDirectoryRaw] = await Promise.all([
          ref.object.getMetadata(CodexSessionMetadataStore.KEY_THREAD_ID),
          ref.object.getMetadata(CodexSessionMetadataStore.KEY_CWD),
          ref.object.getMetadata(CodexSessionMetadataStore.KEY_MODEL),
          ref.object.getMetadata(CodexSessionMetadataStore.KEY_AGENT),
          ref.object.getMetadata(CodexSessionMetadataStore.KEY_OWNS_MANAGED_WORKING_DIRECTORY),
          ref.object.getMetadata(CodexSessionMetadataStore.KEY_MANAGED_WORKING_DIRECTORY)
        ]);
        const cwd3 = parseCwd(cwdRaw);
        return {
          threadId: threadId ?? void 0,
          cwd: cwd3.cwd,
          modelId: modelId ?? void 0,
          agent: parseAgentSelection2(agentRaw),
          workingDirectories: cwd3.workingDirectories,
          ...ownsManagedWorkingDirectoryRaw === "true" ? { ownsManagedWorkingDirectory: true } : {},
          // Absent or explicitly cleared (empty string) both read back
          // as `undefined` — an overlay with no known managed path is
          // indistinguishable from one that never had one, which is the
          // point: neither is ever safe to delete from.
          ...managedWorkingDirectoryRaw ? { managedWorkingDirectory: URI.parse(managedWorkingDirectoryRaw) } : {}
        };
      } finally {
        ref.dispose();
      }
    } catch (err) {
      this._logService.warn(`[Codex] metadata read failed for ${session.toString()}: ${err instanceof Error ? err.message : String(err)}`);
      return {};
    }
  }
};

CodexSessionMetadataStore = __decorateClass([
  __decorateParam(0, ISessionDataService),
  __decorateParam(1, ILogService)
], CodexSessionMetadataStore);

function parseAgentSelection2(raw) {
  if (!raw) {
    return void 0;
  }
  try {
    const value = JSON.parse(raw);
    return typeof value.uri === "string" ? { uri: value.uri } : void 0;
  } catch {
    return void 0;
  }
}

function serializeCwd(cwd3, workingDirectories) {
  if (!workingDirectories || workingDirectories.length <= 1) {
    return cwd3.toString();
  }
  return JSON.stringify({
    cwd: cwd3.toString(),
    workingDirectories: workingDirectories.map((directory) => directory.toString())
  });
}

function parseCwd(raw) {
  if (!raw) {
    return {};
  }
  if (!raw.startsWith("{")) {
    return { cwd: URI.parse(raw) };
  }
  try {
    const value = JSON.parse(raw);
    if (typeof value.cwd !== "string") {
      return {};
    }
    const workingDirectories = Array.isArray(value.workingDirectories) ? value.workingDirectories.filter((directory) => typeof directory === "string").map((directory) => URI.parse(directory)) : void 0;
    return {
      cwd: URI.parse(value.cwd),
      workingDirectories: workingDirectories && workingDirectories.length > 1 ? workingDirectories : void 0
    };
  } catch {
    return {};
  }
}
export { parseAgentSelection2, serializeCwd, parseCwd, CodexSessionMetadataStore };
