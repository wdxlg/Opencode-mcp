// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/layout/browser/layoutService.ts
import { refineServiceDecorator } from "./module-0077.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { isAuxiliaryWindow, mainWindow } from "./module-0002.mjs";
import { getMenuBarVisibility, hasCustomTitlebar, hasNativeMenu, hasNativeTitlebar } from "./module-0515.mjs";
import { isFullscreen, isWCOEnabled } from "./module-0018.mjs";
import { isMacintosh, isNative, isWeb } from "./module-0014.mjs";


// src/vs/workbench/services/layout/browser/layoutService.ts
var IWorkbenchLayoutService = refineServiceDecorator(ILayoutService);

var FLOATING_PANEL_MARGIN = 4;

var COMPACT_FLOATING_PANEL_MARGIN = 0;

var COMPACT_FLOATING_PANEL_OUTER_MARGIN = 4;

var FLOATING_PANEL_INNER_MARGIN = 0;

function getFloatingPanelMargin(layoutService) {
  return layoutService.isModernUICompact() ? COMPACT_FLOATING_PANEL_MARGIN : FLOATING_PANEL_MARGIN;
}

function getFloatingPanelOuterMargin(layoutService) {
  return layoutService.isModernUICompact() ? COMPACT_FLOATING_PANEL_OUTER_MARGIN : FLOATING_PANEL_MARGIN;
}

function isHorizontal(position2) {
  return position2 === 2 /* BOTTOM */ || position2 === 3 /* TOP */;
}

function positionToString(position2) {
  switch (position2) {
    case 0 /* LEFT */:
      return "left";
    case 1 /* RIGHT */:
      return "right";
    case 2 /* BOTTOM */:
      return "bottom";
    case 3 /* TOP */:
      return "top";
    default:
      return "bottom";
  }
}

function isFloatingTopEdgeExposed(layoutService, targetWindow) {
  return !layoutService.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, targetWindow) && !layoutService.isVisible("workbench.parts.banner" /* BANNER_PART */);
}

function getFloatingOuterEdgeOwners(layoutService) {
  if (!layoutService.isFloatingPanelsEnabled()) {
    return { left: void 0, right: void 0 };
  }
  const sideBarLeft = layoutService.getSideBarPosition() === 0 /* LEFT */;
  const panelPosition = layoutService.getPanelPosition();
  const verticalPanelVisible = !isHorizontal(panelPosition) && layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */);
  const panelInLeftSequence = verticalPanelVisible && panelPosition === 0 /* LEFT */;
  const panelInRightSequence = verticalPanelVisible && panelPosition === 1 /* RIGHT */;
  const sideBarGroup = ["workbench.parts.activitybar" /* ACTIVITYBAR_PART */, "workbench.parts.sidebar" /* SIDEBAR_PART */];
  const panelGroup = ["workbench.parts.panel" /* PANEL_PART */];
  const fullOrder = sideBarLeft ? [
    ...sideBarGroup,
    ...panelInLeftSequence ? panelGroup : [],
    "workbench.parts.editor" /* EDITOR_PART */,
    ...panelInRightSequence ? panelGroup : [],
    "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */
  ] : [
    "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */,
    ...panelInLeftSequence ? panelGroup : [],
    "workbench.parts.editor" /* EDITOR_PART */,
    ...panelInRightSequence ? panelGroup : [],
    ...[...sideBarGroup].reverse()
    // activity bar is outermost on the right edge
  ];
  return {
    left: resolveFloatingOuterOwner(layoutService, fullOrder),
    right: resolveFloatingOuterOwner(layoutService, [...fullOrder].reverse())
  };
}

function resolveFloatingOuterOwner(layoutService, orderedParts) {
  for (const part of orderedParts) {
    const visible = part === "workbench.parts.editor" /* EDITOR_PART */ ? layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) : layoutService.isVisible(part);
    if (!visible) {
      continue;
    }
    return part;
  }
  return void 0;
}

function getFloatingOuterGutterEdges(layoutService, partId) {
  if (!layoutService.isFloatingPanelsEnabled()) {
    return { left: false, right: false };
  }
  if (partId === "workbench.parts.panel" /* PANEL_PART */ && isHorizontal(layoutService.getPanelPosition())) {
    return getFloatingHorizontalPanelOuterEdges(layoutService);
  }
  const owners = getFloatingOuterEdgeOwners(layoutService);
  return { left: owners.left === partId, right: owners.right === partId };
}

function getFloatingPaneCompositeHorizontalMargins(layoutService, partId) {
  if (!layoutService.isFloatingPanelsEnabled()) {
    return { left: 0, right: 0 };
  }
  const outerGutter = getFloatingOuterGutterEdges(layoutService, partId);
  const margin = getFloatingPanelMargin(layoutService);
  const outerMargin = getFloatingPanelOuterMargin(layoutService);
  const meetsActivityBarRail = partId === "workbench.parts.sidebar" /* SIDEBAR_PART */ && layoutService.getSideBarPosition() === 0 /* LEFT */ && layoutService.isVisible("workbench.parts.activitybar" /* ACTIVITYBAR_PART */);
  const leading = meetsActivityBarRail ? FLOATING_PANEL_INNER_MARGIN : margin;
  return {
    left: outerGutter.left ? outerMargin : leading,
    right: outerGutter.right ? outerMargin : FLOATING_PANEL_INNER_MARGIN
  };
}

function getFloatingSidebarSiblingToEditorStatus(layoutService) {
  const alignment = layoutService.getPanelAlignment();
  const sideBarOnLeft = layoutService.getSideBarPosition() === 0 /* LEFT */;
  return {
    sideBar: !(alignment === "center" || sideBarOnLeft && alignment === "right" || !sideBarOnLeft && alignment === "left"),
    auxBar: !(alignment === "center" || !sideBarOnLeft && alignment === "right" || sideBarOnLeft && alignment === "left")
  };
}

function getFloatingPaneCompositeVerticalMargins(layoutService, partId, targetWindow) {
  if (!layoutService.isFloatingPanelsEnabled()) {
    return { top: 0, bottom: 0 };
  }
  const outerEdges = getFloatingPaneCompositeVerticalOuterEdges(layoutService, partId, targetWindow);
  const statusBarVisible = layoutService.isVisible("workbench.parts.statusbar" /* STATUSBAR_PART */, targetWindow);
  const margin = getFloatingPanelMargin(layoutService);
  const outerMargin = getFloatingPanelOuterMargin(layoutService);
  return {
    top: outerEdges.top ? isFloatingTopEdgeExposed(layoutService, targetWindow) ? outerMargin : FLOATING_PANEL_INNER_MARGIN : margin,
    bottom: outerEdges.bottom ? statusBarVisible ? FLOATING_PANEL_MARGIN : outerMargin : FLOATING_PANEL_INNER_MARGIN
  };
}

function getFloatingPaneCompositeVerticalOuterEdges(layoutService, partId, targetWindow) {
  if (!layoutService.isFloatingPanelsEnabled()) {
    return { top: false, bottom: false };
  }
  const panelPosition = layoutService.getPanelPosition();
  const panelVisible = layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */);
  const isSideBar = partId === "workbench.parts.sidebar" /* SIDEBAR_PART */ || partId === "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */;
  const siblingStatus = getFloatingSidebarSiblingToEditorStatus(layoutService);
  const isSiblingToEditor = partId === "workbench.parts.sidebar" /* SIDEBAR_PART */ ? siblingStatus.sideBar : siblingStatus.auxBar;
  const facesPanelAbove = panelVisible && panelPosition === 3 /* TOP */ && isSideBar && isSiblingToEditor;
  const facesEditorAbove = partId === "workbench.parts.panel" /* PANEL_PART */ && panelPosition === 2 /* BOTTOM */ && layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, targetWindow);
  const facesEditorBelow = partId === "workbench.parts.panel" /* PANEL_PART */ && panelPosition === 3 /* TOP */ && layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, targetWindow);
  const facesPanelBelow = panelVisible && panelPosition === 2 /* BOTTOM */ && isSideBar && isSiblingToEditor;
  return {
    top: !facesPanelAbove && !facesEditorAbove,
    bottom: !facesEditorBelow && !facesPanelBelow
  };
}

function getFloatingEditorVerticalMargins(layoutService, targetWindow) {
  if (!layoutService.isFloatingPanelsEnabled()) {
    return { top: 0, bottom: 0 };
  }
  const outerEdges = getFloatingEditorVerticalOuterEdges(layoutService);
  const margin = getFloatingPanelMargin(layoutService);
  const outerMargin = getFloatingPanelOuterMargin(layoutService);
  return {
    top: outerEdges.top ? isFloatingTopEdgeExposed(layoutService, targetWindow) ? outerMargin : FLOATING_PANEL_INNER_MARGIN : margin,
    bottom: outerEdges.bottom ? layoutService.isVisible("workbench.parts.statusbar" /* STATUSBAR_PART */, targetWindow) ? FLOATING_PANEL_MARGIN : outerMargin : FLOATING_PANEL_INNER_MARGIN
  };
}

function getFloatingEditorVerticalOuterEdges(layoutService) {
  if (!layoutService.isFloatingPanelsEnabled()) {
    return { top: false, bottom: false };
  }
  const panelVisible = layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */);
  const panelPosition = layoutService.getPanelPosition();
  return {
    top: !(panelVisible && panelPosition === 3 /* TOP */),
    bottom: !(panelVisible && panelPosition === 2 /* BOTTOM */)
  };
}

function getFloatingHorizontalPanelOuterEdges(layoutService) {
  if (!layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
    return { left: false, right: false };
  }
  const sideBarLeft = layoutService.getSideBarPosition() === 0 /* LEFT */;
  const { sideBar: sideBarSiblingToEditor, auxBar: auxSiblingToEditor } = getFloatingSidebarSiblingToEditorStatus(layoutService);
  const sideBarSideReached = !layoutService.isVisible("workbench.parts.activitybar" /* ACTIVITYBAR_PART */) && (!layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */) || sideBarSiblingToEditor);
  const auxSideReached = !layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) || auxSiblingToEditor;
  return sideBarLeft ? { left: sideBarSideReached, right: auxSideReached } : { left: auxSideReached, right: sideBarSideReached };
}

var positionsByString = {
  [positionToString(0 /* LEFT */)]: 0 /* LEFT */,
  [positionToString(1 /* RIGHT */)]: 1 /* RIGHT */,
  [positionToString(2 /* BOTTOM */)]: 2 /* BOTTOM */,
  [positionToString(3 /* TOP */)]: 3 /* TOP */
};

function positionFromString(str) {
  return positionsByString[str];
}

function partOpensMaximizedSettingToString(setting) {
  switch (setting) {
    case 0 /* ALWAYS */:
      return "always";
    case 1 /* NEVER */:
      return "never";
    case 2 /* REMEMBER_LAST */:
      return "preserve";
    default:
      return "preserve";
  }
}

var partOpensMaximizedByString = {
  [partOpensMaximizedSettingToString(0 /* ALWAYS */)]: 0 /* ALWAYS */,
  [partOpensMaximizedSettingToString(1 /* NEVER */)]: 1 /* NEVER */,
  [partOpensMaximizedSettingToString(2 /* REMEMBER_LAST */)]: 2 /* REMEMBER_LAST */
};

function shouldShowCustomTitleBar(configurationService, window2, menuBarToggled) {
  if (!hasCustomTitlebar(configurationService)) {
    return false;
  }
  const inFullscreen = isFullscreen(window2);
  const nativeTitleBarEnabled = hasNativeTitlebar(configurationService);
  if (!isWeb) {
    const showCustomTitleBar = configurationService.getValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */);
    if (showCustomTitleBar === "never" /* NEVER */ && nativeTitleBarEnabled || showCustomTitleBar === "windowed" /* WINDOWED */ && inFullscreen) {
      return false;
    }
  }
  if (!isTitleBarEmpty(configurationService)) {
    return true;
  }
  if (nativeTitleBarEnabled && hasNativeMenu(configurationService)) {
    return false;
  }
  if (isMacintosh && isNative) {
    return !inFullscreen;
  }
  if (isNative && !inFullscreen) {
    return true;
  }
  if (isWCOEnabled() && !inFullscreen) {
    return true;
  }
  const menuBarVisibility = !isAuxiliaryWindow(window2) ? getMenuBarVisibility(configurationService) : "hidden";
  switch (menuBarVisibility) {
    case "classic":
      return !inFullscreen || !!menuBarToggled;
    case "compact":
    case "hidden":
      return false;
    case "toggle":
      return !!menuBarToggled;
    case "visible":
      return true;
    default:
      return isWeb ? false : !inFullscreen || !!menuBarToggled;
  }
}

function isTitleBarEmpty(configurationService) {
  if (configurationService.getValue("window.commandCenter" /* COMMAND_CENTER */)) {
    return false;
  }
  const activityBarPosition = configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
  if (activityBarPosition === "top" /* TOP */ || activityBarPosition === "bottom" /* BOTTOM */) {
    return false;
  }
  const editorActionsLocation = configurationService.getValue("workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */);
  const editorTabsMode = configurationService.getValue("workbench.editor.showTabs" /* EDITOR_TABS_MODE */);
  if (editorActionsLocation === "titleBar" /* TITLEBAR */ || editorActionsLocation === "default" /* DEFAULT */ && editorTabsMode === "none" /* NONE */) {
    return false;
  }
  if (configurationService.getValue("workbench.layoutControl.enabled" /* LAYOUT_ACTIONS */)) {
    return false;
  }
  return true;
}
export { getFloatingPanelMargin, getFloatingPanelOuterMargin, isHorizontal, positionToString, isFloatingTopEdgeExposed, getFloatingOuterEdgeOwners, resolveFloatingOuterOwner, getFloatingOuterGutterEdges, getFloatingPaneCompositeHorizontalMargins, getFloatingSidebarSiblingToEditorStatus, getFloatingPaneCompositeVerticalMargins, getFloatingPaneCompositeVerticalOuterEdges, getFloatingEditorVerticalMargins, getFloatingEditorVerticalOuterEdges, getFloatingHorizontalPanelOuterEdges, positionFromString, partOpensMaximizedSettingToString, shouldShowCustomTitleBar, isTitleBarEmpty, IWorkbenchLayoutService, FLOATING_PANEL_MARGIN, COMPACT_FLOATING_PANEL_MARGIN, COMPACT_FLOATING_PANEL_OUTER_MARGIN, FLOATING_PANEL_INNER_MARGIN, positionsByString, partOpensMaximizedByString };
