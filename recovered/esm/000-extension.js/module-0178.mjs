// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/agent-checkpoint-store.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/agent-checkpoint-store.ts
init_define_OPENCODE_BUILD_INFO();

var vscode17 = __toESM(require("vscode"));

var CHECKPOINT_INDEX_KEY = "opencode.agentCheckpoints.v1";

var CHECKPOINT_DIRECTORY = "agent-checkpoints";

var MAX_CHECKPOINTS = 8;

var MAX_CHECKPOINT_AGE_MS = 7 * 24 * 60 * 60 * 1e3;

var MAX_CHECKPOINT_BYTES = 16 * 1024 * 1024;

var OPENCODE_CHECKPOINT_ID_METADATA_KEY = "agentCheckpointId";

var OPENCODE_CHECKPOINT_RECOVERABLE_METADATA_KEY = "agentCheckpointRecoverable";

var OPENCODE_CHECKPOINT_REASON_METADATA_KEY = "agentCheckpointReason";

function validId(id) {
  return /^[A-Za-z0-9_-]{8,128}$/.test(id);
}

function asIndex(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry) => Boolean(
    entry && typeof entry === "object" && !Array.isArray(entry) && typeof entry.id === "string" && validId(entry.id) && typeof entry.model === "string" && typeof entry.workspaceRoot === "string" && typeof entry.savedAt === "number"
  ));
}

function validCheckpoint(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value;
  return row.version === 1 && typeof row.model === "string" && typeof row.workspaceRoot === "string" && Number.isInteger(row.nextStep) && row.nextStep >= 1 && Array.isArray(row.toolNames) && row.toolNames.every((name) => typeof name === "string") && Array.isArray(row.messages) && row.messages.every((message2) => Boolean(message2) && typeof message2 === "object" && !Array.isArray(message2)) && typeof row.createdAt === "string";
}

var AgentCheckpointStore = class {
  constructor(context, output2) {
    this.context = context;
    this.output = output2;
  }
  context;
  output;
  async save(id, checkpoint) {
    if (!validId(id) || !validCheckpoint(checkpoint)) throw new Error("Invalid OpenCode agent checkpoint.");
    const savedAt = Date.now();
    const envelope = {
      version: 1,
      id,
      model: checkpoint.model,
      workspaceRoot: checkpoint.workspaceRoot,
      savedAt,
      checkpoint
    };
    const bytes = Buffer.from(JSON.stringify(envelope), "utf8");
    if (bytes.byteLength > MAX_CHECKPOINT_BYTES) {
      throw new Error(`Agent checkpoint exceeds ${MAX_CHECKPOINT_BYTES} bytes.`);
    }
    const directory = vscode17.Uri.joinPath(this.context.globalStorageUri, CHECKPOINT_DIRECTORY);
    const target = vscode17.Uri.joinPath(directory, `${id}.json`);
    const temporary = vscode17.Uri.joinPath(directory, `${id}.${process.pid}.tmp`);
    await vscode17.workspace.fs.createDirectory(directory);
    try {
      await vscode17.workspace.fs.writeFile(temporary, bytes);
      await vscode17.workspace.fs.rename(temporary, target, { overwrite: true });
    } catch (error2) {
      try {
        await vscode17.workspace.fs.delete(temporary);
      } catch {
      }
      throw error2;
    }
    const cutoff = savedAt - MAX_CHECKPOINT_AGE_MS;
    const current = asIndex(this.context.workspaceState.get(CHECKPOINT_INDEX_KEY));
    const expired = current.filter((entry) => entry.id !== id && entry.savedAt < cutoff);
    const ordered = [
      { id, model: checkpoint.model, workspaceRoot: checkpoint.workspaceRoot, savedAt },
      ...current.filter((entry) => entry.id !== id && entry.savedAt >= cutoff)
    ].sort((a, b) => b.savedAt - a.savedAt);
    const retained = ordered.slice(0, MAX_CHECKPOINTS);
    await this.context.workspaceState.update(CHECKPOINT_INDEX_KEY, retained);
    for (const stale of [...expired, ...ordered.slice(MAX_CHECKPOINTS)]) {
      await this.deleteFile(stale.id);
    }
  }
  async load(id, model, workspaceRoot3) {
    if (!validId(id)) return void 0;
    const envelope = await this.readEnvelope(id);
    if (!envelope || envelope.model !== model || envelope.workspaceRoot !== workspaceRoot3) return void 0;
    if (Date.now() - envelope.savedAt > MAX_CHECKPOINT_AGE_MS) {
      await this.delete(id);
      return void 0;
    }
    return { id, checkpoint: envelope.checkpoint };
  }
  async delete(id) {
    if (!validId(id)) return;
    await this.deleteFile(id);
    const current = asIndex(this.context.workspaceState.get(CHECKPOINT_INDEX_KEY));
    const next = current.filter((entry) => entry.id !== id);
    if (next.length !== current.length) {
      try {
        await this.context.workspaceState.update(CHECKPOINT_INDEX_KEY, next);
      } catch (error2) {
        this.output.appendLine(`[checkpoint] failed to update index after deleting ${id}: ${error2 instanceof Error ? error2.message : String(error2)}`);
      }
    }
  }
  async readEnvelope(id) {
    try {
      const uri = vscode17.Uri.joinPath(this.context.globalStorageUri, CHECKPOINT_DIRECTORY, `${id}.json`);
      const bytes = await vscode17.workspace.fs.readFile(uri);
      if (bytes.byteLength > MAX_CHECKPOINT_BYTES) return void 0;
      const value = JSON.parse(Buffer.from(bytes).toString("utf8"));
      if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
      const row = value;
      if (row.version !== 1 || row.id !== id || !validCheckpoint(row.checkpoint)) return void 0;
      if (typeof row.model !== "string" || typeof row.workspaceRoot !== "string" || typeof row.savedAt !== "number") return void 0;
      return row;
    } catch (error2) {
      if (error2 instanceof vscode17.FileSystemError && error2.code === "FileNotFound") return void 0;
      this.output.appendLine(`[checkpoint] failed to read ${id}: ${error2 instanceof Error ? error2.message : String(error2)}`);
      return void 0;
    }
  }
  async deleteFile(id) {
    try {
      const uri = vscode17.Uri.joinPath(this.context.globalStorageUri, CHECKPOINT_DIRECTORY, `${id}.json`);
      await vscode17.workspace.fs.delete(uri);
    } catch (error2) {
      if (error2 instanceof vscode17.FileSystemError && error2.code === "FileNotFound") return;
      this.output.appendLine(`[checkpoint] failed to delete ${id}: ${error2 instanceof Error ? error2.message : String(error2)}`);
    }
  }
};
export { validId, asIndex, validCheckpoint, vscode17, CHECKPOINT_INDEX_KEY, CHECKPOINT_DIRECTORY, MAX_CHECKPOINTS, MAX_CHECKPOINT_AGE_MS, MAX_CHECKPOINT_BYTES, OPENCODE_CHECKPOINT_ID_METADATA_KEY, OPENCODE_CHECKPOINT_RECOVERABLE_METADATA_KEY, OPENCODE_CHECKPOINT_REASON_METADATA_KEY, AgentCheckpointStore };
