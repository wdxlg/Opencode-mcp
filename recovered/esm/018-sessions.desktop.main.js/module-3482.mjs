// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/editorPart.ts
import { MainEditorPart } from "./module-3478.mjs";
import { EDITOR_PART_MINIMUM_WIDTH } from "./module-3463.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/sessions/browser/parts/editorPart.ts
var MainEditorPart2 = class _MainEditorPart extends MainEditorPart {
  constructor() {
    super(...arguments);
    // The editor part keeps a stable, user-set width: the Sessions Part is the
    // flexible view (LayoutPriority.High) that absorbs visibility/resize deltas.
    // Making the editor the flex view caused its width to drift to the minimum
    // when toggling the auxiliary bar across session switches.
    this.priority = 0 /* Normal */;
  }
  static {
    this.MARGIN_TOP = 0;
  }
  static {
    this.MARGIN_BOTTOM = 0;
  }
  static {
    this.MARGIN_LEFT = 0;
  }
  static {
    this.MARGIN_RIGHT = 0;
  }
  get minimumWidth() {
    return Math.max(EDITOR_PART_MINIMUM_WIDTH, super.minimumWidth);
  }
  layout(width2, height, top2, left) {
    const agentLayoutService = this.layoutService;
    const keepForDockedTabBar = agentLayoutService.isSinglePaneLayoutEnabled && this.layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    if (!this.layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) && !keepForDockedTabBar) {
      return;
    }
    const adjustedWidth = width2 - _MainEditorPart.MARGIN_RIGHT - _MainEditorPart.MARGIN_LEFT - 2;
    const adjustedHeight = height - _MainEditorPart.MARGIN_TOP - _MainEditorPart.MARGIN_BOTTOM - 2;
    super.layout(adjustedWidth, adjustedHeight, top2, left);
    if (agentLayoutService.isSinglePaneLayoutEnabled && !this.layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
      agentLayoutService.handleDockedEditorPartLayout(width2);
    }
  }
};
export { MainEditorPart2 };
