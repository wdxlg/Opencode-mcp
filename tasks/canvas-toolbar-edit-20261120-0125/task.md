# canvas-toolbar-edit-20261120-0125

User correction (2026-11-20, after single-canvas ff4e6bab): the bottom-right toolbar from the previous version should still be there. Only delete what the user named. Put 预设 inside the bottom-right toolbar. Every member node should be editable inside the node, not read-only.

## Changes (webview only; no extension-side change)
- `collaboration.html`: the bf5fd4d5 bottom-right grouped toolbar (`#cv-toolbar.cv-zoombar`) is back inside the canvas stage. Groups:
  - zoom: −, % (click resets to 100%), +, 适应
  - layout: 自动排列, 居中
  - 预设 (`#tc-preset-btn` + `#tc-presetpop`)
  All buttons have icons and tooltips. Still left out: the 连线/网页预览 toggles, the AI 画布/成员编排 mode switch, ＋成员/↓管理/⇄协作, the legend, the hint line and the toasts. The top-right 预设 bar is removed.
- `collaboration.js`:
  - Toolbar wiring:
    - zoom and % zoom around the stage centre; % shows the live zoom level.
    - 适应 = `fitView` (same as `.`).
    - 自动排列 = member autoArrange by manager relation, plus the AI groups reset to their default spots (`canvas` layout `groups:{id:null}`).
    - 居中 = the selected AI, otherwise the selected member, otherwise the current project's group.
  - Inline node widgets (ComfyUI style). Every edit saves through the same messages the 成员 page uses:
    - Name: double-click the title (or press F2 on a focused node) to rename in an HTML input over the title. Enter or blur saves; Esc cancels. Saves with `saveEmployee`.
    - 岗位: click the widget to open a dropdown of the existing roles (observer excluded). Saves with `saveEmployee`.
    - 模型: click the widget to open a dropdown of the `routingCatalog` models, grouped by provider, with search and arrow-key/Enter selection. This is the same list as the 成员 page. API members only. Saves with `saveEmployee`.
    - 启用 toggle (centre of the first slot row). Saves with `saveEmployee`.
    - 子代理 toggle (centre of the second slot row, API members only). Saves with `teamMemberSettings`, keeping maxSubagents.
    - Every `saveEmployee` sends the full member, like the 成员 page: `expected_version`, name, kind, roleId, model, allowedPaths, allowShell, canManage, enabled. canManage is kept from the member; the 成员 page always sends false.
    - Temporary MCP members stay read-only.
  - Editors live outside the SVG node: the name input sits in `#tc-wlayer`, which follows the pan/zoom, and the dropdowns are in `body`. A state push that redraws the node therefore doesn't touch them. Saved-but-not-yet-pushed edits (`wEdits`) are re-applied over stale pushes for up to 15 s, or until a push carries them.
  - Widgets stop pointerdown, so they never start a drag, pan or marquee. Editor keydown is stopped, and the existing `typing()` guards still apply, so Delete, Backspace, `.`, Space and Ctrl+Z don't fire on the canvas while typing.
  - Every widget edit is on the canvas undo stack: Ctrl+Z / Ctrl+Y re-save the old/new value with the current version.
  - Rendering keeps the signature-skip redraw, so there is no rebuild on identical pushes.
- `automation.css`: canvas-toolbar-edit block:
  - the toolbar sits above the AI layer; the preset list opens upward
  - the error notice is moved above the toolbar
  - styles for widget hover/chevron, toggles, the name field and dropdowns
  - the minimap hides when the canvas is under 460 px wide; the toolbar uses the full stage width and wraps; icon-only under 900 px (unchanged rule)

## Tests
- New: test-toolbar-edit.mjs (headless Edge, stub extension with saveEmployee/teamMemberSettings and a stale-push mode).
- Updated test-single-canvas.mjs. The assertions "no zoom/fit/autolayout/focus/cv-toolbar" and "the only canvas button is 预设" became "no orchestration buttons" and "the canvas buttons are the bottom-right toolbar, 预设 included".
- Updated test-collab-refresh.mjs. The toolbar check now expects the 7 toolbar buttons with titles instead of "only 预设 in .tc-floatbar". The minimap-overlap check uses #cv-toolbar instead of .cv-presetbar.
