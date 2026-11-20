## 2026-11-19 dsh-metrics AH (agent-host) — APPLIED (source only; not built, not tested, not committed)
Snapshot tag: `pre/dsh-metrics-ah-20261119-1343` (= HEAD ec4e7de4 at apply time).
Engine `edit-ah.cjs` (all-or-nothing, exact match, \r?\n tolerant, keeps each file's EOL); spec `ah-all-edits.json` (12 edits / 3 files); diff `ah.patch`.
Originals: `backup\dsh-metrics-20261119\ah\recovered\esm\002-agent-host.js\{agent-context,module-0029,agent-stream-parsers}.mjs`.

- agent-context.mjs (4): estimatedTokens = ceil(len/4), empty = 0 (OC_CHARS_PER_TOKEN=4 / OC_BLOCK_OVERHEAD=4); CONTEXT_IMAGE_TOKENS 1600→1024; contextContentTokens/contextMessageTokens = dsh block/message pricing; contextHistoryItemTokens = 4 + text block + image blocks.
- module-0029.mjs (4): tokenRatio fixed 1; toolDefinitionTokens = JSON/4 + 4 (0 when there are no tools); `onContentDelta.onToolCallDelta` sets firstDeltaAt; measuredContext = usage.total if ≥ local estimate (messages + tools + reply), else the estimate; ratio-learning block removed.
- agent-stream-parsers.mjs (4 hooks, `onContentDelta?.onToolCallDelta?.()`): chat tool_calls loop (non-empty name/arguments), Codex `response.function_call_arguments.delta`, Anthropic `content_block_start` tool_use (with a name) and `input_json_delta`. The parsers receive the same onContentDelta function that module-0029 defines (passed through requestChatCompletion / parseAnthropicResponse / parseCodexResponse with no wrapping), so the property hook reaches them. Non-stream fallbacks are unchanged.
- PART B compaction (agent-compaction.mjs) not touched. node --check OK on all 4 files.

Rollback: `git checkout pre/dsh-metrics-ah-20261119-1343 -- recovered/esm/002-agent-host.js/agent-context.mjs recovered/esm/002-agent-host.js/module-0029.mjs recovered/esm/002-agent-host.js/agent-stream-parsers.mjs`
or copy the three backups back, or `git apply -R tasks/dsh-metrics-20261119/ah/ah.patch`.
