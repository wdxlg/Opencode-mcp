# single-canvas-20261120-0100

User complaint (2026-11-20 00:51): collaboration actions pop a notice that covers half the window; 连线/网页预览 toggles, legend and hint line are clutter; two modes (AI 画布 / 成员编排) are one too many; a member added in 成员编排 never shows on the AI canvas.

## Changes (webview only; no extension-side change)
- `collaboration.js` (recovered/standalone/.../task-workbench):
  - `notice()` now ignores non-error messages (all action toasts / confirmations gone). Errors show as a small one-line notice at the bottom right and disappear after 4 s.
  - One canvas: the ComfyUI member canvas (#tc-scroll / #tc-canvas) is the canvas page's stage; the live-AI layer (#cv-world: groups, AI cards, browser previews, AI links) is an HTML overlay inside the same stage that follows the shared view (`window.__ocCanvas`). The canvas-console part lost its own view, pan/zoom, minimap, toolbar and mode switch.
  - API members already on the canvas as nodes are not drawn again as AI cards; empty project groups are not drawn; unplaced AI groups go to the right of the member nodes (pinned for the session); browser previews sit under their AI's group.
  - Links and previews are always on. AI links can end on member nodes; member 上下级 stays as member wires.
  - Fit (`.` / right-click 适应画布), minimap and new-member placement include the AI groups. A project opened without a saved view fits once when content appears.
  - Member nodes show 发言中 / 执行任务 in the title bar.
  - Removed: ＋成员 popup, ↓管理/⇄协作 link modes, 自动排列 button (still in the right-click menu), zoom %, hint bar, legend. Wheel zoom works over AI cards too.
- `collaboration.html`: new single stage; only 预设 (top right) remains.
- `automation.css`: appended a `single-canvas` block (it also fixes the stretched notice: an old rule set top+bottom+left+right at once).

## Tests
- New: tasks/single-canvas-20261120-0100/test-single-canvas.mjs 34/34
- Updated: tasks/collab-refresh-20261119-2140/test-collab-refresh.mjs 38 → 34. The toolbar, toggle and mode-switch checks were replaced by "the only button is 预设 / no toggles / no mode switch". The '.' key replaced cv-fit, and both canvases now share one stage.
- Unchanged and passing: comfy wires 18/18, comfy step02 24/24, subagent-marker 35/35, native-subagent 34/34, canvas-console self-test 30/30.
