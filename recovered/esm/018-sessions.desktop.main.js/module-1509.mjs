// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/navigationActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { IEditorService } from "./module-0935.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { isAuxiliaryWindow } from "./module-0002.mjs";


// src/vs/workbench/browser/actions/navigationActions.ts
var BaseNavigationAction = class extends Action2 {
  constructor(options3, direction) {
    super(options3);
    this.direction = direction;
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const editorGroupService = accessor.get(IEditorGroupsService);
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const isEditorFocus = layoutService.hasFocus("workbench.parts.editor" /* EDITOR_PART */);
    const isPanelFocus = layoutService.hasFocus("workbench.parts.panel" /* PANEL_PART */);
    const isSidebarFocus = layoutService.hasFocus("workbench.parts.sidebar" /* SIDEBAR_PART */);
    const isAuxiliaryBarFocus = layoutService.hasFocus("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    let neighborPart;
    if (isEditorFocus) {
      const didNavigate = this.navigateAcrossEditorGroup(this.toGroupDirection(this.direction), editorGroupService);
      if (didNavigate) {
        return;
      }
      neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.editor" /* EDITOR_PART */, this.direction);
    }
    if (isPanelFocus) {
      neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.panel" /* PANEL_PART */, this.direction);
    }
    if (isSidebarFocus) {
      neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.sidebar" /* SIDEBAR_PART */, this.direction);
    }
    if (isAuxiliaryBarFocus) {
      neighborPart = neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */, this.direction);
    }
    if (neighborPart === "workbench.parts.editor" /* EDITOR_PART */) {
      if (!this.navigateBackToEditorGroup(this.toGroupDirection(this.direction), editorGroupService)) {
        this.navigateToEditorGroup(this.direction === 3 /* Right */ ? 0 /* FIRST */ : 1 /* LAST */, editorGroupService);
      }
    } else if (neighborPart === "workbench.parts.sidebar" /* SIDEBAR_PART */) {
      this.navigateToSidebar(layoutService, paneCompositeService);
    } else if (neighborPart === "workbench.parts.panel" /* PANEL_PART */) {
      this.navigateToPanel(layoutService, paneCompositeService);
    } else if (neighborPart === "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) {
      this.navigateToAuxiliaryBar(layoutService, paneCompositeService);
    }
  }
  async navigateToPanel(layoutService, paneCompositeService) {
    if (!layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
      return false;
    }
    const activePanel = paneCompositeService.getActivePaneComposite(1 /* Panel */);
    if (!activePanel) {
      return false;
    }
    const activePanelId = activePanel.getId();
    const res = await paneCompositeService.openPaneComposite(activePanelId, 1 /* Panel */, true);
    if (!res) {
      return false;
    }
    return res;
  }
  async navigateToSidebar(layoutService, paneCompositeService) {
    if (!layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */)) {
      return false;
    }
    const activeViewlet = paneCompositeService.getActivePaneComposite(0 /* Sidebar */);
    if (!activeViewlet) {
      return false;
    }
    const activeViewletId = activeViewlet.getId();
    const viewlet = await paneCompositeService.openPaneComposite(activeViewletId, 0 /* Sidebar */, true);
    return !!viewlet;
  }
  async navigateToAuxiliaryBar(layoutService, paneCompositeService) {
    if (!layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      return false;
    }
    const activePanel = paneCompositeService.getActivePaneComposite(2 /* AuxiliaryBar */);
    if (!activePanel) {
      return false;
    }
    const activePanelId = activePanel.getId();
    const res = await paneCompositeService.openPaneComposite(activePanelId, 2 /* AuxiliaryBar */, true);
    if (!res) {
      return false;
    }
    return res;
  }
  navigateAcrossEditorGroup(direction, editorGroupService) {
    return this.doNavigateToEditorGroup({ direction }, editorGroupService);
  }
  navigateToEditorGroup(location2, editorGroupService) {
    return this.doNavigateToEditorGroup({ location: location2 }, editorGroupService);
  }
  navigateBackToEditorGroup(direction, editorGroupService) {
    if (!editorGroupService.activeGroup) {
      return false;
    }
    const oppositeDirection2 = this.toOppositeDirection(direction);
    const groupInBetween = editorGroupService.findGroup({ direction: oppositeDirection2 }, editorGroupService.activeGroup);
    if (!groupInBetween) {
      editorGroupService.activeGroup.focus();
      return true;
    }
    return false;
  }
  toGroupDirection(direction) {
    switch (direction) {
      case 1 /* Down */:
        return 1 /* DOWN */;
      case 2 /* Left */:
        return 2 /* LEFT */;
      case 3 /* Right */:
        return 3 /* RIGHT */;
      case 0 /* Up */:
        return 0 /* UP */;
    }
  }
  toOppositeDirection(direction) {
    switch (direction) {
      case 0 /* UP */:
        return 1 /* DOWN */;
      case 3 /* RIGHT */:
        return 2 /* LEFT */;
      case 2 /* LEFT */:
        return 3 /* RIGHT */;
      case 1 /* DOWN */:
        return 0 /* UP */;
    }
  }
  doNavigateToEditorGroup(scope, editorGroupService) {
    const targetGroup = editorGroupService.findGroup(scope, editorGroupService.activeGroup);
    if (targetGroup) {
      targetGroup.focus();
      return true;
    }
    return false;
  }
};

registerAction2(class extends BaseNavigationAction {
  constructor() {
    super({
      id: "workbench.action.navigateLeft",
      title: localize2(6118, "Navigate to the View on the Left"),
      category: Categories.View,
      f1: true
    }, 2 /* Left */);
  }
});

registerAction2(class extends BaseNavigationAction {
  constructor() {
    super({
      id: "workbench.action.navigateRight",
      title: localize2(6119, "Navigate to the View on the Right"),
      category: Categories.View,
      f1: true
    }, 3 /* Right */);
  }
});

registerAction2(class extends BaseNavigationAction {
  constructor() {
    super({
      id: "workbench.action.navigateUp",
      title: localize2(6120, "Navigate to the View Above"),
      category: Categories.View,
      f1: true
    }, 0 /* Up */);
  }
});

registerAction2(class extends BaseNavigationAction {
  constructor() {
    super({
      id: "workbench.action.navigateDown",
      title: localize2(6117, "Navigate to the View Below"),
      category: Categories.View,
      f1: true
    }, 1 /* Down */);
  }
});

var BaseFocusAction = class extends Action2 {
  constructor(options3, focusNext) {
    super(options3);
    this.focusNext = focusNext;
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const editorService = accessor.get(IEditorService);
    this.focusNextOrPreviousPart(layoutService, editorService, this.focusNext);
  }
  findVisibleNeighbour(layoutService, part, next) {
    const activeWindow = getActiveWindow();
    const windowIsAuxiliary = isAuxiliaryWindow(activeWindow);
    let neighbour;
    if (windowIsAuxiliary) {
      switch (part) {
        case "workbench.parts.editor" /* EDITOR_PART */:
          neighbour = "workbench.parts.statusbar" /* STATUSBAR_PART */;
          break;
        default:
          neighbour = "workbench.parts.editor" /* EDITOR_PART */;
      }
    } else {
      switch (part) {
        case "workbench.parts.editor" /* EDITOR_PART */:
          neighbour = next ? "workbench.parts.panel" /* PANEL_PART */ : "workbench.parts.sidebar" /* SIDEBAR_PART */;
          break;
        case "workbench.parts.panel" /* PANEL_PART */:
          neighbour = next ? "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */ : "workbench.parts.editor" /* EDITOR_PART */;
          break;
        case "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */:
          neighbour = next ? "workbench.parts.statusbar" /* STATUSBAR_PART */ : "workbench.parts.panel" /* PANEL_PART */;
          break;
        case "workbench.parts.statusbar" /* STATUSBAR_PART */:
          neighbour = next ? "workbench.parts.activitybar" /* ACTIVITYBAR_PART */ : "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */;
          break;
        case "workbench.parts.activitybar" /* ACTIVITYBAR_PART */:
          neighbour = next ? "workbench.parts.sidebar" /* SIDEBAR_PART */ : "workbench.parts.statusbar" /* STATUSBAR_PART */;
          break;
        case "workbench.parts.sidebar" /* SIDEBAR_PART */:
          neighbour = next ? "workbench.parts.editor" /* EDITOR_PART */ : "workbench.parts.activitybar" /* ACTIVITYBAR_PART */;
          break;
        default:
          neighbour = "workbench.parts.editor" /* EDITOR_PART */;
      }
    }
    if (layoutService.isVisible(neighbour, activeWindow) || neighbour === "workbench.parts.editor" /* EDITOR_PART */) {
      return neighbour;
    }
    return this.findVisibleNeighbour(layoutService, neighbour, next);
  }
  focusNextOrPreviousPart(layoutService, editorService, next) {
    let currentlyFocusedPart;
    if (editorService.activeEditorPane?.hasFocus() || layoutService.hasFocus("workbench.parts.editor" /* EDITOR_PART */)) {
      currentlyFocusedPart = "workbench.parts.editor" /* EDITOR_PART */;
    } else if (layoutService.hasFocus("workbench.parts.activitybar" /* ACTIVITYBAR_PART */)) {
      currentlyFocusedPart = "workbench.parts.activitybar" /* ACTIVITYBAR_PART */;
    } else if (layoutService.hasFocus("workbench.parts.statusbar" /* STATUSBAR_PART */)) {
      currentlyFocusedPart = "workbench.parts.statusbar" /* STATUSBAR_PART */;
    } else if (layoutService.hasFocus("workbench.parts.sidebar" /* SIDEBAR_PART */)) {
      currentlyFocusedPart = "workbench.parts.sidebar" /* SIDEBAR_PART */;
    } else if (layoutService.hasFocus("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      currentlyFocusedPart = "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */;
    } else if (layoutService.hasFocus("workbench.parts.panel" /* PANEL_PART */)) {
      currentlyFocusedPart = "workbench.parts.panel" /* PANEL_PART */;
    }
    layoutService.focusPart(currentlyFocusedPart ? this.findVisibleNeighbour(layoutService, currentlyFocusedPart, next) : "workbench.parts.editor" /* EDITOR_PART */, getActiveWindow());
  }
};

registerAction2(class extends BaseFocusAction {
  constructor() {
    super({
      id: "workbench.action.focusNextPart",
      title: localize2(6115, "Focus Next Part"),
      category: Categories.View,
      f1: true,
      keybinding: {
        primary: 64 /* F6 */,
        weight: 200 /* WorkbenchContrib */
      }
    }, true);
  }
});

registerAction2(class extends BaseFocusAction {
  constructor() {
    super({
      id: "workbench.action.focusPreviousPart",
      title: localize2(6116, "Focus Previous Part"),
      category: Categories.View,
      f1: true,
      keybinding: {
        primary: 1024 /* Shift */ | 64 /* F6 */,
        weight: 200 /* WorkbenchContrib */
      }
    }, false);
  }
});
export { BaseNavigationAction, BaseFocusAction };
