// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSnapshotController.ts
import { Disposable } from "./module-0012.mjs";
import { constObservable } from "./module-0061.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { Sequencer } from "./module-0036.mjs";
import { transaction } from "./module-0045.mjs";
import { fileEditsToExternalEdits } from "./module-2246.mjs";
import { toAgentHostContentUri, toAgentHostUri } from "./module-1000.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSnapshotController.ts
var AgentHostSnapshotController = class extends Disposable {
  constructor(chatSessionResource, _connectionAuthority, _logService, _fileService) {
    super();
    this.chatSessionResource = chatSessionResource;
    this._connectionAuthority = _connectionAuthority;
    this._logService = _logService;
    this._fileService = _fileService;
    this.supportsKeepUndo = false;
    this.isGlobalEditingSession = false;
    this.state = constObservable(2 /* Idle */);
    this.entries = constObservable([]);
    this.requestDisablement = derivedOpts(
      { equalsFn: (a, b) => a.length === b.length && a.every((v2, i2) => v2.requestId === b[i2].requestId) },
      (reader) => {
        const currentIdx = this._currentCheckpointIndex.read(reader);
        const disabled = [];
        for (let i2 = currentIdx + 1; i2 < this._checkpoints.length; i2++) {
          disabled.push({ requestId: this._checkpoints[i2].requestId });
        }
        return disabled;
      }
    );
    this.canUndo = derived(this, (r2) => this._currentCheckpointIndex.read(r2) >= 0);
    this.canRedo = derived(this, (r2) => this._currentCheckpointIndex.read(r2) < this._checkpoints.length - 1);
    this._onDidDispose = this._register(new Emitter());
    this.onDidDispose = this._onDidDispose.event;
    this._checkpoints = [];
    this._currentCheckpointIndex = observableValue(this, -1);
    this._undoRedoSequencer = new Sequencer();
  }
  // ---- Hydration from protocol state --------------------------------------
  /**
   * Ensures a checkpoint exists for the given request. Called at the start
   * of every turn (and during history hydration) so {@link requestDisablement}
   * and {@link restoreSnapshot} can reference every request, even ones that
   * produce no file edits.
   *
   * Splices away stale checkpoints past the current index (undo branch
   * semantics) when a new request arrives after a checkpoint restore.
   */
  ensureRequestCheckpoint(requestId) {
    if (this._checkpoints.some((cp) => cp.requestId === requestId)) {
      return;
    }
    const currentIdx = this._currentCheckpointIndex.get();
    if (currentIdx < this._checkpoints.length - 1) {
      this._checkpoints.splice(currentIdx + 1);
    }
    this._checkpoints.push({ requestId, edits: [], seenToolCallIds: /* @__PURE__ */ new Set() });
    transaction((tx) => {
      this._currentCheckpointIndex.set(this._checkpoints.length - 1, tx);
    });
  }
  /**
   * Folds a completed tool call's file edits into the checkpoint for the
   * given request. Idempotent on `toolCallId`.
   */
  addToolCallEdits(requestId, tc) {
    if (tc.status !== "completed" /* Completed */) {
      return;
    }
    this.ensureRequestCheckpoint(requestId);
    const cp = this._checkpoints.find((c) => c.requestId === requestId);
    if (!cp || cp.seenToolCallIds.has(tc.toolCallId)) {
      return;
    }
    cp.seenToolCallIds.add(tc.toolCallId);
    const fileEdits = fileEditsToExternalEdits(tc);
    if (fileEdits.length === 0) {
      return;
    }
    const authority = this._connectionAuthority;
    for (const edit3 of fileEdits) {
      const resource = toAgentHostUri(edit3.resource, authority);
      const entry = {
        kind: edit3.kind,
        resource,
        originalResource: edit3.originalResource ? toAgentHostUri(edit3.originalResource, authority) : void 0,
        beforeContentUri: edit3.beforeContentUri ? toAgentHostContentUri(edit3.beforeContentUri, authority) : void 0,
        afterContentUri: edit3.afterContentUri ? toAgentHostContentUri(edit3.afterContentUri, authority) : void 0,
        undoStopId: edit3.undoStopId,
        diff: edit3.diff
      };
      const existingIdx = cp.edits.findIndex((e) => e.resource.toString() === resource.toString());
      if (existingIdx < 0) {
        cp.edits.push(entry);
      } else {
        cp.edits[existingIdx] = mergeFileEdit(cp.edits[existingIdx], entry);
      }
    }
  }
  // ---- Snapshots ----------------------------------------------------------
  _findCheckpointIndex(requestId) {
    return this._checkpoints.findIndex((cp) => cp.requestId === requestId);
  }
  async restoreSnapshot(requestId, _stopId) {
    return this._undoRedoSequencer.queue(async () => {
      const cpIdx = this._findCheckpointIndex(requestId);
      if (cpIdx < 0) {
        this._logService.warn(`[AgentHostSnapshotController] No checkpoint found for requestId=${requestId}`);
        return;
      }
      await this._navigateToCheckpointIndex(cpIdx - 1);
    });
  }
  /**
   * Steps a single checkpoint backwards, undoing the edits of the current
   * checkpoint. The "Undo" UI invokes this once per click.
   */
  async undoInteraction() {
    return this._undoRedoSequencer.queue(async () => {
      const currentIdx = this._currentCheckpointIndex.get();
      if (currentIdx < 0) {
        return;
      }
      await this._navigateToCheckpointIndex(currentIdx - 1);
    });
  }
  /**
   * Steps a single checkpoint forwards, redoing the edits of the next
   * checkpoint.
   *
   * Implementing this is essential: the "Redo" action repeatedly calls this
   * while {@link canRedo} is `true`, so a no-op implementation would spin
   * forever and hang the window.
   */
  async redoInteraction() {
    return this._undoRedoSequencer.queue(async () => {
      const currentIdx = this._currentCheckpointIndex.get();
      if (currentIdx >= this._checkpoints.length - 1) {
        return;
      }
      await this._navigateToCheckpointIndex(currentIdx + 1);
    });
  }
  /**
   * Moves the on-disk file state and the checkpoint cursor to `targetIdx`,
   * writing each crossed checkpoint's before/after content. Must run inside
   * the {@link _undoRedoSequencer} to avoid racing writes.
   */
  async _navigateToCheckpointIndex(targetIdx) {
    const currentIdx = this._currentCheckpointIndex.get();
    if (targetIdx < currentIdx) {
      for (let i2 = currentIdx; i2 > targetIdx; i2--) {
        await this._writeCheckpointContent(this._checkpoints[i2], "before");
      }
    } else if (targetIdx > currentIdx) {
      for (let i2 = currentIdx + 1; i2 <= targetIdx; i2++) {
        await this._writeCheckpointContent(this._checkpoints[i2], "after");
      }
    }
    transaction((tx) => {
      this._currentCheckpointIndex.set(targetIdx, tx);
    });
  }
  getSnapshotUri(requestId, uri5, _stopId) {
    const cp = this._checkpoints.find((c) => c.requestId === requestId);
    if (!cp || !cp.edits.some((e) => e.resource.toString() === uri5.toString())) {
      return void 0;
    }
    return URI.from({
      scheme: Schemas.chatEditingSnapshotScheme,
      path: uri5.path,
      query: JSON.stringify({ session: this.chatSessionResource.toString(), requestId, undoStop: "" })
    });
  }
  async getSnapshotContents(requestId, uri5, _stopId) {
    const cp = this._checkpoints.find((c) => c.requestId === requestId);
    if (!cp) {
      return void 0;
    }
    const uriStr = uri5.toString();
    let edit3;
    for (let i2 = cp.edits.length - 1; i2 >= 0; i2--) {
      if (cp.edits[i2].resource.toString() === uriStr) {
        edit3 = cp.edits[i2];
        break;
      }
    }
    if (!edit3) {
      return void 0;
    }
    try {
      if (!edit3.afterContentUri) {
        return VSBuffer.fromByteArray([]);
      }
      const content2 = await this._fileService.readFile(edit3.afterContentUri);
      return content2.value;
    } catch (err) {
      this._logService.warn(`[AgentHostSnapshotController] Failed to fetch snapshot content`, err);
      return void 0;
    }
  }
  async getSnapshotModel(_requestId, _undoStop, _snapshotUri) {
    return null;
  }
  hasEditsInRequest(requestId, _reader) {
    const cp = this._checkpoints.find((c) => c.requestId === requestId);
    return !!cp && cp.edits.length > 0;
  }
  // ---- Unsupported / no-op (agent host owns edits server-side) ------------
  async show(_previousChanges) {
  }
  getEntry(_uri) {
    return void 0;
  }
  readEntry(_uri, _reader) {
    return void 0;
  }
  async accept(..._uris) {
  }
  async reject(..._uris) {
  }
  getEntryDiffBetweenStops(_uri, _requestId, _stopId) {
    return void 0;
  }
  getEntryDiffBetweenRequests(_uri, _startRequestId, _stopRequestId) {
    return constObservable(void 0);
  }
  getDiffsForFilesInSession() {
    return constObservable([]);
  }
  getDiffsForFilesInRequest(_requestId) {
    return constObservable([]);
  }
  getDiffForSession() {
    return constObservable({ added: 0, removed: 0 });
  }
  async triggerExplanationGeneration() {
  }
  clearExplanations() {
  }
  hasExplanations() {
    return false;
  }
  startStreamingEdits(_resource, _responseModel, _inUndoStop) {
    throw new Error("Not supported for agent host sessions");
  }
  applyWorkspaceEdit(_edit, _responseModel, _undoStopId) {
    throw new Error("Not supported for agent host sessions");
  }
  async startExternalEdits(_responseModel, _operationId, _resources, _undoStopId, _contentFor) {
    throw new Error("Not supported for agent host sessions");
  }
  async stopExternalEdits(_responseModel, _operationId, _contentFor) {
    throw new Error("Not supported for agent host sessions");
  }
  // ---- Stop / Dispose -----------------------------------------------------
  async stop(_clearState) {
    this.dispose();
  }
  dispose() {
    this._onDidDispose.fire();
    super.dispose();
  }
  // ---- Private helpers ----------------------------------------------------
  async _writeCheckpointContent(checkpoint, direction) {
    const ops = checkpoint.edits.map(async (edit3) => {
      try {
        if (direction === "before") {
          switch (edit3.kind) {
            case "create" /* Create */:
              await this._fileService.del(edit3.resource);
              break;
            case "delete" /* Delete */:
              if (edit3.beforeContentUri) {
                const content2 = await this._fileService.readFile(edit3.beforeContentUri);
                await this._fileService.writeFile(edit3.resource, content2.value);
              }
              break;
            case "rename" /* Rename */:
              if (edit3.originalResource) {
                await this._fileService.move(edit3.resource, edit3.originalResource, true);
              }
              if (edit3.beforeContentUri && edit3.originalResource) {
                const content2 = await this._fileService.readFile(edit3.beforeContentUri);
                await this._fileService.writeFile(edit3.originalResource, content2.value);
              }
              break;
            case "edit" /* Edit */:
              if (edit3.beforeContentUri) {
                const content2 = await this._fileService.readFile(edit3.beforeContentUri);
                await this._fileService.writeFile(edit3.resource, content2.value);
              }
              break;
          }
        } else {
          switch (edit3.kind) {
            case "create" /* Create */:
              if (edit3.afterContentUri) {
                const content2 = await this._fileService.readFile(edit3.afterContentUri);
                await this._fileService.writeFile(edit3.resource, content2.value);
              }
              break;
            case "delete" /* Delete */:
              await this._fileService.del(edit3.resource);
              break;
            case "rename" /* Rename */:
              if (edit3.originalResource) {
                await this._fileService.move(edit3.originalResource, edit3.resource, true);
              }
              if (edit3.afterContentUri) {
                const content2 = await this._fileService.readFile(edit3.afterContentUri);
                await this._fileService.writeFile(edit3.resource, content2.value);
              }
              break;
            case "edit" /* Edit */:
              if (edit3.afterContentUri) {
                const content2 = await this._fileService.readFile(edit3.afterContentUri);
                await this._fileService.writeFile(edit3.resource, content2.value);
              }
              break;
          }
        }
      } catch (err) {
        this._logService.warn(`[AgentHostSnapshotController] Failed to ${direction === "before" ? "undo" : "redo"} ${edit3.kind} for ${edit3.resource.toString()}`, err);
      }
    });
    await Promise.all(ops);
  }
};

AgentHostSnapshotController = __decorateClass([
  __decorateParam(2, ILogService),
  __decorateParam(3, IFileService)
], AgentHostSnapshotController);

function mergeFileEdit(prev, next) {
  const startsAbsent = prev.kind === "create" /* Create */;
  const endsAbsent = next.kind === "delete" /* Delete */;
  let kind;
  if (startsAbsent && endsAbsent) {
    kind = "edit" /* Edit */;
  } else if (startsAbsent) {
    kind = "create" /* Create */;
  } else if (endsAbsent) {
    kind = "delete" /* Delete */;
  } else {
    kind = "edit" /* Edit */;
  }
  return {
    kind,
    resource: next.resource,
    // Renames within a single request are uncommon; if the second edit
    // is itself a rename keep its originalResource, otherwise carry
    // forward the first one.
    originalResource: next.originalResource ?? prev.originalResource,
    beforeContentUri: prev.beforeContentUri,
    afterContentUri: next.afterContentUri,
    undoStopId: prev.undoStopId,
    diff: next.diff ?? prev.diff
  };
}
export { mergeFileEdit, AgentHostSnapshotController };
