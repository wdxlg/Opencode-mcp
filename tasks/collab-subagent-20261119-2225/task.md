# collab-subagent-20261119-2225

Mark subagent AIs on the 团队协作 AI canvas so the webview filter from collab-refresh (bf5fd4d5) has something to act on.

- What marks a subagent:
  - The Bridge `chat_join` and `set_todos` tools accept optional `parent_task_id` (the parent's task_id) and `subagent: true`.
  - A per-conversation canvas identity (`ai:<name>`, `card:<task>`, `sess:<id>`) that sent either one is a subagent from then on. It keeps the mark across restarts and when it later names itself.
  - The shared `client:<label>` fallback and `local` never take the mark.
  - Session records passed as canvas members with `parentID` / `parentId` / `parentSessionId` / `parent_session_id` / `isSubagent`.
  - Team `#子代理` helpers (`team.subagents[].parentId`) are listed as members with `parentId: member:<parent>`.
- What a marked entry carries: `snapshot.ais[]` gets `parentId` (the parent AI key, else `card:<parent task>` / `sess:<id>` / `unknown`), `subagent: true`, and `parentTaskId` when known. Entries that are not marked have none of these keys.
- Chat list: temporary MCP members (`tempMembers`) of a marked connection get `parentId` and `subagent: true`, which the webview's `isSubagent` hides from DMs.
- Files changed:
  - recovered/shared/canvas-console.mjs (mirrored to recovered/esm/000-extension.js by sync-shared)
  - recovered/shared/automation-workbench.mjs (mirrored the same way)
  - recovered/esm/000-extension.js/module-0140.mjs (`set_todos` schema)
- Tests:
  - test-subagent-marker.mjs 35/35
  - canvas-console self-test 30/30
  - collab-refresh 38/38
  - comfy step01 18/18 and step02 24/24
