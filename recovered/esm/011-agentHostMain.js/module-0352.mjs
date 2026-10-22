// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeFileEditObserver.ts
import { Disposable } from "./module-0010.mjs";
import { FileEditTracker } from "./module-0277.mjs";
import { getClaudeToolPath, isClaudeFileEditTool } from "./module-0330.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { IInstantiationService } from "./module-0044.mjs";


// src/vs/platform/agentHost/node/claude/claudeFileEditObserver.ts
var ClaudeFileEditObserver = class extends Disposable {
  constructor(sessionUri, dbRef, _logService, instantiationService) {
    super();
    this._logService = _logService;
    /**
     * Maps SDK `tool_use_id` → file path + raw tool input + model
     * captured when the SDK yields the assistant `tool_use` block in
     * {@link observeAssistant}. Consumed (and removed) by
     * {@link observeUser} when the matching `tool_result` arrives.
     * The raw input is forwarded to
     * {@link FileEditTracker.takeCompletedEdit} so it can extract the
     * AI-written text chunks for the edit-survival reporter. The
     * model is read off the assistant message body and is naturally
     * per-subagent: when a subagent emits the `tool_use`, its model
     * (not the parent's) is what we record.
     */
    this._editToolPaths = /* @__PURE__ */ new Map();
    this._register(dbRef);
    this._editTracker = instantiationService.createInstance(
      FileEditTracker,
      sessionUri,
      dbRef.object
    );
  }
  /**
   * Snapshot before-content for any file-edit `tool_use` blocks
   * carried by an SDK assistant message. Caller must invoke this when
   * the SDK yields a canonical `'assistant'` message (full
   * `tool_use.input` available).
   */
  observeAssistant(message, mode, clientContext) {
    const content = message.message.content;
    if (!Array.isArray(content)) {
      return;
    }
    const modelId = typeof message.message.model === "string" ? message.message.model : void 0;
    for (const block of content) {
      if (block.type !== "tool_use" || !isClaudeFileEditTool(block.name)) {
        continue;
      }
      const filePath = getClaudeToolPath(block.name, block.input);
      if (!filePath) {
        continue;
      }
      this._editToolPaths.set(block.id, { filePath, toolName: block.name, toolInput: block.input, modelId, clientContext });
      void this._editTracker.trackEditStart(filePath, mode).catch((err) => this._logService.warn(`[ClaudeFileEditObserver] trackEditStart failed for ${filePath}: ${err}`));
    }
  }
  /**
   * Take after-content snapshots and stage
   * {@link ToolResultFileEditContent} entries on `mapperState` for any
   * `tool_result` blocks carried by an SDK user message. Caller MUST
   * await this BEFORE invoking the synchronous mapper, so the cached
   * file edit is already on `mapperState` when `mapUserMessage` calls
   * `state.takeFileEdit`.
   */
  async observeUser(message, turnId, mapperState) {
    const content = message.message.content;
    if (!Array.isArray(content)) {
      return;
    }
    for (const block of content) {
      if (block.type !== "tool_result") {
        continue;
      }
      const tracked = this._editToolPaths.get(block.tool_use_id);
      if (!tracked) {
        continue;
      }
      this._editToolPaths.delete(block.tool_use_id);
      try {
        await this._editTracker.completeEdit(tracked.filePath);
        const fileEdit = await this._editTracker.takeCompletedEdit(turnId, block.tool_use_id, tracked.filePath, tracked.toolName, tracked.toolInput, tracked.modelId, tracked.clientContext);
        if (fileEdit) {
          mapperState.cacheFileEdit(block.tool_use_id, fileEdit);
        }
      } catch (err) {
        this._logService.warn(`[ClaudeFileEditObserver] file edit tracking failed for ${tracked.filePath}: ${err}`);
      }
    }
  }
  dispose() {
    void this._editTracker.flushAttribution().catch((error) => {
      this._logService.warn(`[ClaudeFileEditObserver] Failed to flush edit attribution: ${error}`);
    });
    super.dispose();
  }
};

ClaudeFileEditObserver = __decorateClass([
  __decorateParam(2, ILogService),
  __decorateParam(3, IInstantiationService)
], ClaudeFileEditObserver);
export { ClaudeFileEditObserver };
