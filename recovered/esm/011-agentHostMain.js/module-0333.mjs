// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeSubagentRegistry.ts
import { Disposable } from "./module-0010.mjs";


// src/vs/platform/agentHost/node/claude/claudeSubagentRegistry.ts
var SUBAGENT_TOOL_NAMES2 = /* @__PURE__ */ new Set(["Task", "Agent"]);

var SUBAGENT_ID_SUFFIX_REGEX = /^\s*agentId:\s+([a-z0-9]+)\b/im;

var SubagentSpawn = class {
  constructor(toolUseId) {
    this.toolUseId = toolUseId;
    this.background = false;
    this._announced = false;
    this._completed = false;
  }
  get agentId() {
    return this._agentId;
  }
  /**
   * Set the SDK's agent id for this spawn. First-writer-wins: once
   * set, subsequent calls are no-ops. Multiple call sites converge on
   * the same value (canUseTool's `options.agentID`, the strategy chain,
   * and transcript priming all surface the SDK's single identity), so
   * the invariant is enforced here rather than at every caller.
   */
  setAgentId(agentId) {
    if (this._agentId === void 0) {
      this._agentId = agentId;
    }
  }
  markAnnounced() {
    if (this._announced) {
      return false;
    }
    this._announced = true;
    return true;
  }
  markCompleted() {
    if (this._completed) {
      return false;
    }
    this._completed = true;
    return true;
  }
};

var SubagentRegistry = class extends Disposable {
  constructor() {
    super(...arguments);
    this._spawns = /* @__PURE__ */ new Map();
    this._innerToParent = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._spawns.clear();
    this._innerToParent.clear();
    super.dispose();
  }
  /**
   * Insert a spawn (or return the existing one) for `toolUseId`.
   * Any fields supplied in `init` are written to the spawn under
   * first-writer-wins semantics (see {@link ISubagentSpawnInit}).
   * Idempotent so live writes (canUseTool / strategy resolution /
   * transcript priming / canonical assistant) can converge on the
   * same record.
   */
  recordSpawn(toolUseId, init) {
    let spawn6 = this._spawns.get(toolUseId);
    if (!spawn6) {
      spawn6 = new SubagentSpawn(toolUseId);
      this._spawns.set(toolUseId, spawn6);
    }
    if (init?.agentId !== void 0) {
      spawn6.setAgentId(init.agentId);
    }
    if (init?.subagentType !== void 0 && spawn6.subagentType === void 0) {
      spawn6.subagentType = init.subagentType;
    }
    if (init?.description !== void 0 && spawn6.description === void 0) {
      spawn6.description = init.description;
    }
    if (init?.prompt !== void 0 && spawn6.prompt === void 0) {
      spawn6.prompt = init.prompt;
    }
    return spawn6;
  }
  getSpawn(toolUseId) {
    return this._spawns.get(toolUseId);
  }
  removeSpawn(toolUseId) {
    this._spawns.delete(toolUseId);
    this._evictInnerEdgesFor(toolUseId);
  }
  /** Mapper records the parent of an inner `tool_use` block when an inner subagent message arrives. */
  noteInnerTool(innerToolUseId, parentToolUseId) {
    this._innerToParent.set(innerToolUseId, parentToolUseId);
  }
  /** canUseTool reads this to attach `parentToolCallId` onto a `pending_confirmation` / `ChatInputRequested`. */
  getParentSpawn(innerToolUseId) {
    const parentId = this._innerToParent.get(innerToolUseId);
    return parentId !== void 0 ? this._spawns.get(parentId) : void 0;
  }
  /**
   * Turn-end cleanup: remove and return foreground spawns whose
   * completion never closed them. Background spawns survive across
   * turns by design (their completion arrives later via
   * `system.task_notification`). Inner-edge entries pointing at
   * drained spawns are evicted too. Caller logs each returned orphan.
   */
  drainForegroundSpawns() {
    const drained = [];
    for (const spawn6 of this._spawns.values()) {
      if (!spawn6.background) {
        drained.push(spawn6);
      }
    }
    for (const spawn6 of drained) {
      this._spawns.delete(spawn6.toolUseId);
      this._evictInnerEdgesFor(spawn6.toolUseId);
    }
    return drained;
  }
  /**
   * Replay-path bulk populate: scan a parent transcript for the
   * SDK's synthetic `agentId: <hex>` suffix on Task/Agent tool_result
   * text blocks and record each `(toolUseId, agentId)` pair. Idempotent.
   */
  primeFromTranscript(transcript) {
    for (const [toolCallId, agentId] of scanTranscriptForAgentIds(transcript)) {
      this.recordSpawn(toolCallId, { agentId });
    }
  }
  _evictInnerEdgesFor(parentToolUseId) {
    for (const [innerId, parentId] of this._innerToParent) {
      if (parentId === parentToolUseId) {
        this._innerToParent.delete(innerId);
      }
    }
  }
};

function scanTranscriptForAgentIds(transcript) {
  const out = /* @__PURE__ */ new Map();
  for (const turn of transcript) {
    for (const part of turn.responseParts) {
      const pair = extractAgentIdPair(part);
      if (pair) {
        out.set(pair.toolCallId, pair.agentId);
      }
    }
  }
  return out;
}

function extractAgentIdPair(part) {
  if (part.kind !== "toolCall" /* ToolCall */) {
    return void 0;
  }
  const state = part.toolCall;
  if (!SUBAGENT_TOOL_NAMES2.has(state.toolName)) {
    return void 0;
  }
  if (state.status !== "completed" /* Completed */ && state.status !== "pending-result-confirmation" /* PendingResultConfirmation */) {
    return void 0;
  }
  const content = state.content;
  if (!content) {
    return void 0;
  }
  for (let i = content.length - 1; i >= 0; i--) {
    const block = content[i];
    if (block.type !== "text" /* Text */) {
      continue;
    }
    const m = SUBAGENT_ID_SUFFIX_REGEX.exec(block.text);
    if (m) {
      return { toolCallId: state.toolCallId, agentId: m[1] };
    }
  }
  return void 0;
}
export { scanTranscriptForAgentIds, extractAgentIdPair, SUBAGENT_TOOL_NAMES2, SUBAGENT_ID_SUFFIX_REGEX, SubagentSpawn, SubagentRegistry };
