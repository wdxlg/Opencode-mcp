# Changelog — `step-reset-90-99-guard-fix-20261102-005000-step01`

1. **`[OBS-OC-1]` (`module-0043.mjs`, `002-agent-host.js/module-0028.mjs`, `bridge-constants.ts`)**:
   - Embedded explicit 90–99 step `[AUTO_STEP_RESET]` anti-truncation checkpoint protocol (`id="opencode_step_reset_checkpoint"`, `[AUTO_STEP_RESET]` prefix, `allowCustomResponse: false`, `continue`/`pause` options, `bridge_batch` counting as 1 host step) into `BRIDGE_MCP_INSTRUCTIONS` so every MCP `initialize` handshake delivers the rule even in long/condensed conversations.
2. **`[OBS-OC-2]` (`module-0140.mjs`, `module-0143.mjs`, `module-0119.mjs`)**:
   - Added per-session MCP `tools/call` step tracking (`sessionToolCallCount`, `lastToolCallAtMs`, automatic idle reset after 10 minutes, `resetBridgeSessionStepCount`) in `module-0140.mjs`.
   - Surfaced `step_budget` in `bridge_batch` `structuredContent` + `[STEP_BUDGET: N/90]` summary and injected `⚠️ [STEP_BUDGET_WARNING: N/100]` in external HTTP MCP `tools/call` responses (`module-0119.mjs`) at step >= 80 without perturbing internal IDE `run_command` envelope parsers (`module-0146.mjs`).
3. **`[OBS-OC-3]` (`recovered/shared/automation-store.mjs` + synced modules, `defaults/copy-prompt.txt`, `defaults/manifest.json`)**:
   - Added built-in `rule-step-reset-90-99-guard` (`version: 1`, `category: "execution"`, `enforcement: "hard"`) with automatic store migration for existing installations (`rules.json` < 12 rules).
   - Appended concise clause 8 to `defaults/copy-prompt.txt` (`2145` chars <= `3200` limit) and updated `defaults/manifest.json`.
4. **Build & Local Sync**:
   - `sync-shared.cjs`, `test-task-autonomy.mjs` (`12/12 pass`), `STEP_BUDGET_GUARD_VERIFY_ALL_PASS`, and `node update.cjs` (`verify-build.cjs` `success: true`, synced 6 files to `E:\OpenCode-Source-Recovery-20261013\opencode`, backup `.update-backup/1793561175751-6f1cf857`).
