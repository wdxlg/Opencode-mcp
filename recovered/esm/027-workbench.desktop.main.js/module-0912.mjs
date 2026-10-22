// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/theme.ts
import { Color } from "./module-0197.mjs";
import { darken, lighten, oneOf, opaque, registerColor, transparent } from "./module-0226.mjs";
import { editorBackground, editorErrorForeground, editorForeground, editorInfoForeground, editorWarningForeground, editorWidgetBackground, editorWidgetForeground, toolbarHoverBackground, widgetBorder } from "./module-0229.mjs";
import { localize } from "./module-0001.mjs";
import { activeContrastBorder, contrastBorder, errorForeground, focusBorder, foreground, textLinkForeground } from "./module-0227.mjs";
import { listActiveSelectionBackground, listActiveSelectionForeground, listHoverBackground, listHoverForeground, listInactiveSelectionBackground, listInactiveSelectionForeground, treeIndentGuidesStroke } from "./module-0232.mjs";
import { inputBorder } from "./module-0233.mjs";
import { scrollbarShadow } from "./module-0228.mjs";


// src/vs/workbench/common/theme.ts
function WORKBENCH_BACKGROUND(theme) {
  switch (theme.type) {
    case "light" /* LIGHT */:
      return Color.fromHex("#F3F3F3");
    case "hcLight" /* HIGH_CONTRAST_LIGHT */:
      return Color.fromHex("#FFFFFF");
    case "hcDark" /* HIGH_CONTRAST_DARK */:
      return Color.fromHex("#000000");
    default:
      return Color.fromHex("#252526");
  }
}

var TAB_ACTIVE_BACKGROUND = registerColor("tab.activeBackground", editorBackground, localize(7540, null));

var TAB_UNFOCUSED_ACTIVE_BACKGROUND = registerColor("tab.unfocusedActiveBackground", TAB_ACTIVE_BACKGROUND, localize(7560, null));

var TAB_INACTIVE_BACKGROUND = registerColor("tab.inactiveBackground", {
  dark: "#2D2D2D",
  light: "#ECECEC",
  hcDark: null,
  hcLight: null
}, localize(7552, null));

var TAB_UNFOCUSED_INACTIVE_BACKGROUND = registerColor("tab.unfocusedInactiveBackground", TAB_INACTIVE_BACKGROUND, localize(7565, null));

var TAB_ACTIVE_FOREGROUND = registerColor("tab.activeForeground", {
  dark: Color.white,
  light: "#333333",
  hcDark: Color.white,
  hcLight: "#292929"
}, localize(7543, null));

var TAB_INACTIVE_FOREGROUND = registerColor("tab.inactiveForeground", {
  dark: transparent(TAB_ACTIVE_FOREGROUND, 0.5),
  light: transparent(TAB_ACTIVE_FOREGROUND, 0.7),
  hcDark: Color.white,
  hcLight: "#292929"
}, localize(7553, null));

var TAB_UNFOCUSED_ACTIVE_FOREGROUND = registerColor("tab.unfocusedActiveForeground", {
  dark: transparent(TAB_ACTIVE_FOREGROUND, 0.5),
  light: transparent(TAB_ACTIVE_FOREGROUND, 0.7),
  hcDark: Color.white,
  hcLight: "#292929"
}, localize(7561, null));

var TAB_UNFOCUSED_INACTIVE_FOREGROUND = registerColor("tab.unfocusedInactiveForeground", {
  dark: transparent(TAB_INACTIVE_FOREGROUND, 0.5),
  light: transparent(TAB_INACTIVE_FOREGROUND, 0.5),
  hcDark: Color.white,
  hcLight: "#292929"
}, localize(7566, null));

var TAB_HOVER_BACKGROUND = registerColor("tab.hoverBackground", null, localize(7549, null));

var TAB_UNFOCUSED_HOVER_BACKGROUND = registerColor("tab.unfocusedHoverBackground", {
  dark: transparent(TAB_HOVER_BACKGROUND, 0.5),
  light: transparent(TAB_HOVER_BACKGROUND, 0.7),
  hcDark: null,
  hcLight: null
}, localize(7562, null));

var TAB_HOVER_FOREGROUND = registerColor("tab.hoverForeground", null, localize(7551, null));

var TAB_UNFOCUSED_HOVER_FOREGROUND = registerColor("tab.unfocusedHoverForeground", {
  dark: transparent(TAB_HOVER_FOREGROUND, 0.5),
  light: transparent(TAB_HOVER_FOREGROUND, 0.5),
  hcDark: null,
  hcLight: null
}, localize(7564, null));

var TAB_BORDER = registerColor("tab.border", {
  dark: "#252526",
  light: "#F3F3F3",
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7547, null));

var TAB_LAST_PINNED_BORDER = registerColor("tab.lastPinnedBorder", {
  dark: treeIndentGuidesStroke,
  light: treeIndentGuidesStroke,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7423, null));

var TAB_ACTIVE_BORDER = registerColor("tab.activeBorder", null, localize(7541, null));

var TAB_UNFOCUSED_ACTIVE_BORDER = registerColor("tab.unfocusedActiveBorder", {
  dark: transparent(TAB_ACTIVE_BORDER, 0.5),
  light: transparent(TAB_ACTIVE_BORDER, 0.7),
  hcDark: null,
  hcLight: null
}, localize(7545, null));

var TAB_ACTIVE_BORDER_TOP = registerColor("tab.activeBorderTop", {
  dark: null,
  light: null,
  hcDark: null,
  hcLight: "#B5200D"
}, localize(7542, null));

var TAB_UNFOCUSED_ACTIVE_BORDER_TOP = registerColor("tab.unfocusedActiveBorderTop", {
  dark: transparent(TAB_ACTIVE_BORDER_TOP, 0.5),
  light: transparent(TAB_ACTIVE_BORDER_TOP, 0.7),
  hcDark: null,
  hcLight: "#B5200D"
}, localize(7546, null));

var TAB_SELECTED_BORDER_TOP = registerColor("tab.selectedBorderTop", {
  dark: focusBorder,
  light: focusBorder,
  hcDark: activeContrastBorder,
  hcLight: activeContrastBorder
}, localize(7558, null));

var TAB_SELECTED_BACKGROUND = registerColor("tab.selectedBackground", listInactiveSelectionBackground, localize(7557, null));

var TAB_SELECTED_FOREGROUND = registerColor("tab.selectedForeground", TAB_ACTIVE_FOREGROUND, localize(7559, null));

var TAB_HOVER_BORDER = registerColor("tab.hoverBorder", null, localize(7550, null));

var TAB_UNFOCUSED_HOVER_BORDER = registerColor("tab.unfocusedHoverBorder", {
  dark: transparent(TAB_HOVER_BORDER, 0.5),
  light: transparent(TAB_HOVER_BORDER, 0.7),
  hcDark: null,
  hcLight: contrastBorder
}, localize(7563, null));

var TAB_DRAG_AND_DROP_BORDER = registerColor("tab.dragAndDropBorder", {
  dark: TAB_ACTIVE_FOREGROUND,
  light: TAB_ACTIVE_FOREGROUND,
  hcDark: activeContrastBorder,
  hcLight: activeContrastBorder
}, localize(7548, null));

var TAB_ACTIVE_MODIFIED_BORDER = registerColor("tab.activeModifiedBorder", {
  dark: "#3399CC",
  light: "#33AAEE",
  hcDark: null,
  hcLight: contrastBorder
}, localize(7544, null));

var TAB_INACTIVE_MODIFIED_BORDER = registerColor("tab.inactiveModifiedBorder", {
  dark: transparent(TAB_ACTIVE_MODIFIED_BORDER, 0.5),
  light: transparent(TAB_ACTIVE_MODIFIED_BORDER, 0.5),
  hcDark: Color.white,
  hcLight: contrastBorder
}, localize(7554, null));

var TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER = registerColor("tab.unfocusedActiveModifiedBorder", {
  dark: transparent(TAB_ACTIVE_MODIFIED_BORDER, 0.5),
  light: transparent(TAB_ACTIVE_MODIFIED_BORDER, 0.7),
  hcDark: Color.white,
  hcLight: contrastBorder
}, localize(7572, null));

var TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER = registerColor("tab.unfocusedInactiveModifiedBorder", {
  dark: transparent(TAB_INACTIVE_MODIFIED_BORDER, 0.5),
  light: transparent(TAB_INACTIVE_MODIFIED_BORDER, 0.5),
  hcDark: Color.white,
  hcLight: contrastBorder
}, localize(7573, null));

var EDITOR_PANE_BACKGROUND = registerColor("editorPane.background", editorBackground, localize(7419, null));

var EDITOR_GROUP_EMPTY_BACKGROUND = registerColor("editorGroup.emptyBackground", null, localize(7416, null));

var EDITOR_GROUP_FOCUSED_EMPTY_BORDER = registerColor("editorGroup.focusedEmptyBorder", {
  dark: null,
  light: null,
  hcDark: focusBorder,
  hcLight: focusBorder
}, localize(7417, null));

var EDITOR_GROUP_HEADER_TABS_BACKGROUND = registerColor("editorGroupHeader.tabsBackground", {
  dark: "#252526",
  light: "#F3F3F3",
  hcDark: null,
  hcLight: null
}, localize(7555, null));

var EDITOR_GROUP_HEADER_TABS_BORDER = registerColor("editorGroupHeader.tabsBorder", null, localize(7556, null));

var EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND = registerColor("editorGroupHeader.noTabsBackground", editorBackground, localize(7418, null));

var EDITOR_GROUP_HEADER_BORDER = registerColor("editorGroupHeader.border", {
  dark: null,
  light: null,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7420, null));

var EDITOR_GROUP_BORDER = registerColor("editorGroup.border", {
  dark: "#444444",
  light: "#E7E7E7",
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7415, null));

var EDITOR_DRAG_AND_DROP_BACKGROUND = registerColor("editorGroup.dropBackground", {
  dark: Color.fromHex("#53595D").transparent(0.5),
  light: Color.fromHex("#2677CB").transparent(0.18),
  hcDark: null,
  hcLight: Color.fromHex("#0F4A85").transparent(0.5)
}, localize(7411, null));

var EDITOR_DROP_INTO_PROMPT_FOREGROUND = registerColor("editorGroup.dropIntoPromptForeground", editorWidgetForeground, localize(7414, null));

var EDITOR_DROP_INTO_PROMPT_BACKGROUND = registerColor("editorGroup.dropIntoPromptBackground", editorWidgetBackground, localize(7412, null));

var EDITOR_DROP_INTO_PROMPT_BORDER = registerColor("editorGroup.dropIntoPromptBorder", {
  dark: null,
  light: null,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7413, null));

var SIDE_BY_SIDE_EDITOR_HORIZONTAL_BORDER = registerColor("sideBySideEditor.horizontalBorder", EDITOR_GROUP_BORDER, localize(7503, null));

var SIDE_BY_SIDE_EDITOR_VERTICAL_BORDER = registerColor("sideBySideEditor.verticalBorder", EDITOR_GROUP_BORDER, localize(7504, null));

var OUTPUT_VIEW_BACKGROUND = registerColor("outputView.background", null, localize(7467, null));

registerColor("outputViewStickyScroll.background", OUTPUT_VIEW_BACKGROUND, localize(7468, null));

var BANNER_BACKGROUND = registerColor("banner.background", {
  dark: listActiveSelectionBackground,
  light: darken(listActiveSelectionBackground, 0.3),
  hcDark: listActiveSelectionBackground,
  hcLight: listActiveSelectionBackground
}, localize(7398, null));

var BANNER_FOREGROUND = registerColor("banner.foreground", listActiveSelectionForeground, localize(7399, null));

var BANNER_ICON_FOREGROUND = registerColor("banner.iconForeground", editorInfoForeground, localize(7400, null));

var STATUS_BAR_FOREGROUND = registerColor("statusBar.foreground", {
  dark: "#FFFFFF",
  light: "#FFFFFF",
  hcDark: "#FFFFFF",
  hcLight: editorForeground
}, localize(7512, null));

var STATUS_BAR_NO_FOLDER_FOREGROUND = registerColor("statusBar.noFolderForeground", STATUS_BAR_FOREGROUND, localize(7524, null));

var STATUS_BAR_BACKGROUND = registerColor("statusBar.background", {
  dark: "#007ACC",
  light: "#007ACC",
  hcDark: null,
  hcLight: null
}, localize(7505, null));

var STATUS_BAR_NO_FOLDER_BACKGROUND = registerColor("statusBar.noFolderBackground", {
  dark: "#68217A",
  light: "#68217A",
  hcDark: null,
  hcLight: null
}, localize(7522, null));

var STATUS_BAR_BORDER = registerColor("statusBar.border", {
  dark: null,
  light: null,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7506, null));

var STATUS_BAR_FOCUS_BORDER = registerColor("statusBar.focusBorder", {
  dark: STATUS_BAR_FOREGROUND,
  light: STATUS_BAR_FOREGROUND,
  hcDark: null,
  hcLight: STATUS_BAR_FOREGROUND
}, localize(7511, null));

var STATUS_BAR_NO_FOLDER_BORDER = registerColor("statusBar.noFolderBorder", STATUS_BAR_BORDER, localize(7523, null));

var STATUS_BAR_ITEM_ACTIVE_BACKGROUND = registerColor("statusBarItem.activeBackground", {
  dark: Color.white.transparent(0.18),
  light: Color.white.transparent(0.18),
  hcDark: Color.white.transparent(0.18),
  hcLight: Color.black.transparent(0.18)
}, localize(7513, null));

var STATUS_BAR_ITEM_FOCUS_BORDER = registerColor("statusBarItem.focusBorder", {
  dark: STATUS_BAR_FOREGROUND,
  light: STATUS_BAR_FOREGROUND,
  hcDark: null,
  hcLight: activeContrastBorder
}, localize(7515, null));

var STATUS_BAR_ITEM_HOVER_BACKGROUND = registerColor("statusBarItem.hoverBackground", {
  dark: Color.white.transparent(0.12),
  light: Color.black.transparent(0.12),
  hcDark: Color.black,
  hcLight: Color.white
}, localize(7516, null));

var STATUS_BAR_ITEM_HOVER_FOREGROUND = registerColor("statusBarItem.hoverForeground", STATUS_BAR_FOREGROUND, localize(7517, null));

var STATUS_BAR_ITEM_COMPACT_HOVER_BACKGROUND = registerColor("statusBarItem.compactHoverBackground", {
  dark: Color.white.transparent(0.12),
  light: Color.black.transparent(0.12),
  hcDark: Color.black,
  hcLight: Color.white
}, localize(7514, null));

var STATUS_BAR_PROMINENT_ITEM_FOREGROUND = registerColor("statusBarItem.prominentForeground", STATUS_BAR_FOREGROUND, localize(7528, null));

var STATUS_BAR_PROMINENT_ITEM_BACKGROUND = registerColor("statusBarItem.prominentBackground", Color.black.transparent(0.5), localize(7527, null));

var STATUS_BAR_PROMINENT_ITEM_HOVER_FOREGROUND = registerColor("statusBarItem.prominentHoverForeground", STATUS_BAR_ITEM_HOVER_FOREGROUND, localize(7530, null));

var STATUS_BAR_PROMINENT_ITEM_HOVER_BACKGROUND = registerColor("statusBarItem.prominentHoverBackground", STATUS_BAR_ITEM_HOVER_BACKGROUND, localize(7529, null));

var STATUS_BAR_ERROR_ITEM_BACKGROUND = registerColor("statusBarItem.errorBackground", {
  dark: darken(errorForeground, 0.4),
  light: darken(errorForeground, 0.4),
  hcDark: null,
  hcLight: "#B5200D"
}, localize(7507, null));

var STATUS_BAR_ERROR_ITEM_FOREGROUND = registerColor("statusBarItem.errorForeground", Color.white, localize(7508, null));

var STATUS_BAR_ERROR_ITEM_HOVER_FOREGROUND = registerColor("statusBarItem.errorHoverForeground", STATUS_BAR_ITEM_HOVER_FOREGROUND, localize(7510, null));

var STATUS_BAR_ERROR_ITEM_HOVER_BACKGROUND = registerColor("statusBarItem.errorHoverBackground", STATUS_BAR_ITEM_HOVER_BACKGROUND, localize(7509, null));

var STATUS_BAR_WARNING_ITEM_BACKGROUND = registerColor("statusBarItem.warningBackground", {
  dark: darken(editorWarningForeground, 0.4),
  light: darken(editorWarningForeground, 0.4),
  hcDark: null,
  hcLight: "#895503"
}, localize(7533, null));

var STATUS_BAR_WARNING_ITEM_FOREGROUND = registerColor("statusBarItem.warningForeground", Color.white, localize(7534, null));

var STATUS_BAR_WARNING_ITEM_HOVER_FOREGROUND = registerColor("statusBarItem.warningHoverForeground", STATUS_BAR_ITEM_HOVER_FOREGROUND, localize(7536, null));

var STATUS_BAR_WARNING_ITEM_HOVER_BACKGROUND = registerColor("statusBarItem.warningHoverBackground", STATUS_BAR_ITEM_HOVER_BACKGROUND, localize(7535, null));

var ACTIVITY_BAR_BACKGROUND = registerColor("activityBar.background", {
  dark: "#333333",
  light: "#2C2C2C",
  hcDark: "#000000",
  hcLight: "#FFFFFF"
}, localize(7385, null));

var ACTIVITY_BAR_FOREGROUND = registerColor("activityBar.foreground", {
  dark: Color.white,
  light: Color.white,
  hcDark: Color.white,
  hcLight: editorForeground
}, localize(7390, null));

var ACTIVITY_BAR_INACTIVE_FOREGROUND = registerColor("activityBar.inactiveForeground", {
  dark: transparent(ACTIVITY_BAR_FOREGROUND, 0.4),
  light: transparent(ACTIVITY_BAR_FOREGROUND, 0.4),
  hcDark: Color.white,
  hcLight: editorForeground
}, localize(7391, null));

var ACTIVITY_BAR_BORDER = registerColor("activityBar.border", {
  dark: null,
  light: null,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7388, null));

var ACTIVITY_BAR_ACTIVE_BORDER = registerColor("activityBar.activeBorder", {
  dark: ACTIVITY_BAR_FOREGROUND,
  light: ACTIVITY_BAR_FOREGROUND,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7383, null));

var ACTIVITY_BAR_ACTIVE_FOCUS_BORDER = registerColor("activityBar.activeFocusBorder", {
  dark: null,
  light: null,
  hcDark: null,
  hcLight: "#B5200D"
}, localize(7384, null));

var ACTIVITY_BAR_ACTIVE_BACKGROUND = registerColor("activityBar.activeBackground", null, localize(7382, null));

var ACTIVITY_BAR_DRAG_AND_DROP_BORDER = registerColor("activityBar.dropBorder", {
  dark: ACTIVITY_BAR_FOREGROUND,
  light: ACTIVITY_BAR_FOREGROUND,
  hcDark: null,
  hcLight: null
}, localize(7389, null));

var ACTIVITY_BAR_BADGE_BACKGROUND = registerColor("activityBarBadge.background", {
  dark: "#007ACC",
  light: "#007ACC",
  hcDark: "#000000",
  hcLight: "#0F4A85"
}, localize(7386, null));

var ACTIVITY_BAR_BADGE_FOREGROUND = registerColor("activityBarBadge.foreground", Color.white, localize(7387, null));

var ACTIVITY_BAR_TOP_FOREGROUND = registerColor("activityBarTop.foreground", {
  dark: "#E7E7E7",
  light: "#424242",
  hcDark: Color.white,
  hcLight: editorForeground
}, localize(7392, null));

var ACTIVITY_BAR_TOP_ACTIVE_BORDER = registerColor("activityBarTop.activeBorder", {
  dark: ACTIVITY_BAR_TOP_FOREGROUND,
  light: ACTIVITY_BAR_TOP_FOREGROUND,
  hcDark: contrastBorder,
  hcLight: "#B5200D"
}, localize(7394, null));

var ACTIVITY_BAR_TOP_ACTIVE_BACKGROUND = registerColor("activityBarTop.activeBackground", null, localize(7393, null));

var ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND = registerColor("activityBarTop.inactiveForeground", {
  dark: transparent(ACTIVITY_BAR_TOP_FOREGROUND, 0.6),
  light: transparent(ACTIVITY_BAR_TOP_FOREGROUND, 0.75),
  hcDark: Color.white,
  hcLight: editorForeground
}, localize(7397, null));

var ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER = registerColor("activityBarTop.dropBorder", ACTIVITY_BAR_TOP_FOREGROUND, localize(7396, null));

var ACTIVITY_BAR_TOP_BACKGROUND = registerColor("activityBarTop.background", null, localize(7395, null));

var PANEL_BACKGROUND = registerColor("panel.background", editorBackground, localize(7471, null));

var PANEL_BORDER = registerColor("panel.border", {
  dark: Color.fromHex("#808080").transparent(0.35),
  light: Color.fromHex("#808080").transparent(0.35),
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7472, null));

var PANEL_TITLE_BORDER = registerColor("panelTitle.border", {
  dark: null,
  light: null,
  hcDark: PANEL_BORDER,
  hcLight: PANEL_BORDER
}, localize(7486, null));

var PANEL_ACTIVE_TITLE_FOREGROUND = registerColor("panelTitle.activeForeground", {
  dark: "#E7E7E7",
  light: "#424242",
  hcDark: Color.white,
  hcLight: editorForeground
}, localize(7470, null));

var PANEL_INACTIVE_TITLE_FOREGROUND = registerColor("panelTitle.inactiveForeground", {
  dark: transparent(PANEL_ACTIVE_TITLE_FOREGROUND, 0.6),
  light: transparent(PANEL_ACTIVE_TITLE_FOREGROUND, 0.75),
  hcDark: Color.white,
  hcLight: editorForeground
}, localize(7474, null));

var PANEL_ACTIVE_TITLE_BORDER = registerColor("panelTitle.activeBorder", {
  dark: PANEL_ACTIVE_TITLE_FOREGROUND,
  light: PANEL_ACTIVE_TITLE_FOREGROUND,
  hcDark: contrastBorder,
  hcLight: "#B5200D"
}, localize(7469, null));

var PANEL_TITLE_BADGE_BACKGROUND = registerColor("panelTitleBadge.background", ACTIVITY_BAR_BADGE_BACKGROUND, localize(7484, null));

var PANEL_TITLE_BADGE_FOREGROUND = registerColor("panelTitleBadge.foreground", ACTIVITY_BAR_BADGE_FOREGROUND, localize(7485, null));

var PANEL_INPUT_BORDER = registerColor("panelInput.border", {
  dark: inputBorder,
  light: Color.fromHex("#ddd"),
  hcDark: inputBorder,
  hcLight: inputBorder
}, localize(7475, null));

var PANEL_DRAG_AND_DROP_BORDER = registerColor("panel.dropBorder", PANEL_ACTIVE_TITLE_FOREGROUND, localize(7473, null));

var PANEL_SECTION_DRAG_AND_DROP_BACKGROUND = registerColor("panelSection.dropBackground", EDITOR_DRAG_AND_DROP_BACKGROUND, localize(7477, null));

var PANEL_SECTION_HEADER_BACKGROUND = registerColor("panelSectionHeader.background", {
  dark: Color.fromHex("#808080").transparent(0.2),
  light: Color.fromHex("#808080").transparent(0.2),
  hcDark: null,
  hcLight: null
}, localize(7478, null));

var PANEL_SECTION_HEADER_FOREGROUND = registerColor("panelSectionHeader.foreground", null, localize(7480, null));

var PANEL_SECTION_HEADER_BORDER = registerColor("panelSectionHeader.border", contrastBorder, localize(7479, null));

var PANEL_SECTION_BORDER = registerColor("panelSection.border", PANEL_BORDER, localize(7476, null));

var PANEL_STICKY_SCROLL_BACKGROUND = registerColor("panelStickyScroll.background", PANEL_BACKGROUND, localize(7481, null));

var PANEL_STICKY_SCROLL_BORDER = registerColor("panelStickyScroll.border", null, localize(7482, null));

var PANEL_STICKY_SCROLL_SHADOW = registerColor("panelStickyScroll.shadow", scrollbarShadow, localize(7483, null));

var BROWSER_BORDER = registerColor("browser.border", TAB_BORDER, localize(7401, null));

var PROFILE_BADGE_BACKGROUND = registerColor("profileBadge.background", {
  dark: "#4D4D4D",
  light: "#C4C4C4",
  hcDark: Color.white,
  hcLight: Color.black
}, localize(7487, null));

var PROFILE_BADGE_FOREGROUND = registerColor("profileBadge.foreground", {
  dark: Color.white,
  light: "#333333",
  hcDark: Color.black,
  hcLight: Color.white
}, localize(7488, null));

var STATUS_BAR_REMOTE_ITEM_BACKGROUND = registerColor("statusBarItem.remoteBackground", ACTIVITY_BAR_BADGE_BACKGROUND, localize(7520, null));

var STATUS_BAR_REMOTE_ITEM_FOREGROUND = registerColor("statusBarItem.remoteForeground", ACTIVITY_BAR_BADGE_FOREGROUND, localize(7521, null));

var STATUS_BAR_REMOTE_ITEM_HOVER_FOREGROUND = registerColor("statusBarItem.remoteHoverForeground", STATUS_BAR_ITEM_HOVER_FOREGROUND, localize(7532, null));

var STATUS_BAR_REMOTE_ITEM_HOVER_BACKGROUND = registerColor("statusBarItem.remoteHoverBackground", {
  dark: STATUS_BAR_ITEM_HOVER_BACKGROUND,
  light: STATUS_BAR_ITEM_HOVER_BACKGROUND,
  hcDark: STATUS_BAR_ITEM_HOVER_BACKGROUND,
  hcLight: null
}, localize(7531, null));

var STATUS_BAR_OFFLINE_ITEM_BACKGROUND = registerColor("statusBarItem.offlineBackground", "#6c1717", localize(7518, null));

var STATUS_BAR_OFFLINE_ITEM_FOREGROUND = registerColor("statusBarItem.offlineForeground", STATUS_BAR_REMOTE_ITEM_FOREGROUND, localize(7519, null));

var STATUS_BAR_OFFLINE_ITEM_HOVER_FOREGROUND = registerColor("statusBarItem.offlineHoverForeground", STATUS_BAR_ITEM_HOVER_FOREGROUND, localize(7526, null));

var STATUS_BAR_OFFLINE_ITEM_HOVER_BACKGROUND = registerColor("statusBarItem.offlineHoverBackground", {
  dark: STATUS_BAR_ITEM_HOVER_BACKGROUND,
  light: STATUS_BAR_ITEM_HOVER_BACKGROUND,
  hcDark: STATUS_BAR_ITEM_HOVER_BACKGROUND,
  hcLight: null
}, localize(7525, null));

var EXTENSION_BADGE_BACKGROUND = registerColor("extensionBadge.remoteBackground", ACTIVITY_BAR_BADGE_BACKGROUND, localize(7421, null));

var EXTENSION_BADGE_FOREGROUND = registerColor("extensionBadge.remoteForeground", ACTIVITY_BAR_BADGE_FOREGROUND, localize(7422, null));

var SIDE_BAR_BACKGROUND = registerColor("sideBar.background", {
  dark: "#252526",
  light: "#F3F3F3",
  hcDark: "#000000",
  hcLight: "#FFFFFF"
}, localize(7490, null));

var SIDE_BAR_FOREGROUND = registerColor("sideBar.foreground", null, localize(7493, null));

var SIDE_BAR_BORDER = registerColor("sideBar.border", {
  dark: null,
  light: null,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7491, null));

var SIDE_BAR_TITLE_BACKGROUND = registerColor("sideBarTitle.background", SIDE_BAR_BACKGROUND, localize(7500, null));

var SIDE_BAR_TITLE_FOREGROUND = registerColor("sideBarTitle.foreground", SIDE_BAR_FOREGROUND, localize(7502, null));

var SIDE_BAR_TITLE_BORDER = registerColor("sideBarTitle.border", {
  dark: null,
  light: null,
  hcDark: SIDE_BAR_BORDER,
  hcLight: SIDE_BAR_BORDER
}, localize(7501, null));

var SIDE_BAR_DRAG_AND_DROP_BACKGROUND = registerColor("sideBar.dropBackground", EDITOR_DRAG_AND_DROP_BACKGROUND, localize(7492, null));

var SIDE_BAR_SECTION_HEADER_BACKGROUND = registerColor("sideBarSectionHeader.background", {
  dark: Color.fromHex("#808080").transparent(0.2),
  light: Color.fromHex("#808080").transparent(0.2),
  hcDark: null,
  hcLight: null
}, localize(7494, null));

var SIDE_BAR_SECTION_HEADER_FOREGROUND = registerColor("sideBarSectionHeader.foreground", SIDE_BAR_FOREGROUND, localize(7496, null));

var SIDE_BAR_SECTION_HEADER_BORDER = registerColor("sideBarSectionHeader.border", contrastBorder, localize(7495, null));

var ACTIVITY_BAR_TOP_BORDER = registerColor("sideBarActivityBarTop.border", SIDE_BAR_SECTION_HEADER_BORDER, localize(7489, null));

var SIDE_BAR_STICKY_SCROLL_BACKGROUND = registerColor("sideBarStickyScroll.background", SIDE_BAR_BACKGROUND, localize(7497, null));

var SIDE_BAR_STICKY_SCROLL_BORDER = registerColor("sideBarStickyScroll.border", null, localize(7498, null));

var SIDE_BAR_STICKY_SCROLL_SHADOW = registerColor("sideBarStickyScroll.shadow", scrollbarShadow, localize(7499, null));

var SURFACE_BACKGROUND = registerColor("surface.background", {
  dark: SIDE_BAR_BACKGROUND,
  light: editorBackground,
  hcDark: SIDE_BAR_BACKGROUND,
  hcLight: SIDE_BAR_BACKGROUND
}, localize(7537, null));

var SURFACE_FOREGROUND = registerColor("surface.foreground", SIDE_BAR_FOREGROUND, localize(7539, null));

var SURFACE_BORDER = registerColor("surface.border", {
  dark: opaque(transparent(foreground, 0.1), SURFACE_BACKGROUND),
  light: opaque(transparent(foreground, 0.1), SURFACE_BACKGROUND),
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7538, null));

var EDITOR_BORDER = registerColor("editor.border", SURFACE_BORDER, localize(7410, null));

var MODERN_TAB_ACTIVE_BACKGROUND = registerColor("modernTab.activeBackground", listInactiveSelectionBackground, localize(7452, null));

var MODERN_TAB_ACTIVE_FOREGROUND = registerColor("modernTab.activeForeground", oneOf(listInactiveSelectionForeground, foreground), localize(7453, null));

var MODERN_TAB_HOVER_BACKGROUND = registerColor("modernTab.hoverBackground", listHoverBackground, localize(7454, null));

var MODERN_TAB_HOVER_FOREGROUND = registerColor("modernTab.hoverForeground", oneOf(listHoverForeground, foreground), localize(7455, null));

var MODERN_EDITOR_TAB_ACTIVE_BACKGROUND = registerColor("modernEditorTab.activeBackground", MODERN_TAB_ACTIVE_BACKGROUND, localize(7443, null));

var MODERN_EDITOR_TAB_ACTIVE_ACTION_BACKGROUND = registerColor("modernEditorTab.activeActionBackground", opaque(MODERN_EDITOR_TAB_ACTIVE_BACKGROUND, editorBackground), localize(7442, null));

var MODERN_EDITOR_TAB_ACTIVE_FOREGROUND = registerColor("modernEditorTab.activeForeground", MODERN_TAB_ACTIVE_FOREGROUND, localize(7444, null));

var MODERN_EDITOR_TAB_INACTIVE_BACKGROUND = registerColor("modernEditorTab.inactiveBackground", Color.transparent, localize(7450, null));

var MODERN_EDITOR_TAB_HOVER_BACKGROUND = registerColor("modernEditorTab.hoverBackground", MODERN_TAB_HOVER_BACKGROUND, localize(7448, null));

var MODERN_EDITOR_TAB_HOVER_ACTION_BACKGROUND = registerColor("modernEditorTab.hoverActionBackground", opaque(MODERN_EDITOR_TAB_HOVER_BACKGROUND, editorBackground), localize(7447, null));

var MODERN_EDITOR_TAB_HOVER_FOREGROUND = registerColor("modernEditorTab.hoverForeground", MODERN_TAB_HOVER_FOREGROUND, localize(7449, null));

var MODERN_EDITOR_TAB_ACTIVE_HOVER_BACKGROUND = registerColor("modernEditorTab.activeHoverBackground", MODERN_EDITOR_TAB_HOVER_BACKGROUND, localize(7446, null));

var MODERN_EDITOR_TAB_ACTIVE_HOVER_ACTION_BACKGROUND = registerColor("modernEditorTab.activeHoverActionBackground", opaque(MODERN_EDITOR_TAB_ACTIVE_HOVER_BACKGROUND, editorBackground), localize(7445, null));

var MODERN_EDITOR_TAB_SELECTED_ACTION_BACKGROUND = registerColor("modernEditorTab.selectedActionBackground", opaque(TAB_SELECTED_BACKGROUND, editorBackground), localize(7451, null));

var MODERN_ACTIVITY_BAR_BACKGROUND = registerColor("modernActivityBar.background", ACTIVITY_BAR_BACKGROUND, localize(7431, null));

var MODERN_ACTIVITY_BAR_INACTIVE_BACKGROUND = registerColor("modernActivityBar.inactiveBackground", MODERN_ACTIVITY_BAR_BACKGROUND, localize(7437, null));

var DEPRECATED_MODERN_ACTIVITY_BAR_ACTIVE_BACKGROUND = registerColor("modernActivityBar.activeBackground", null, localize(7427, null), false, localize(7428, null));

var DEPRECATED_MODERN_ACTIVITY_BAR_ACTIVE_FOREGROUND = registerColor("modernActivityBar.activeForeground", null, localize(7429, null), false, localize(7430, null));

var DEPRECATED_MODERN_ACTIVITY_BAR_HOVER_BACKGROUND = registerColor("modernActivityBar.hoverBackground", null, localize(7433, null), false, localize(7434, null));

var DEPRECATED_MODERN_ACTIVITY_BAR_HOVER_FOREGROUND = registerColor("modernActivityBar.hoverForeground", null, localize(7435, null), false, localize(7436, null));

var MODERN_ACTIVITY_BAR_ITEM_ACTIVE_BACKGROUND = registerColor("modernActivityBarItem.activeBackground", oneOf(DEPRECATED_MODERN_ACTIVITY_BAR_ACTIVE_BACKGROUND, MODERN_TAB_ACTIVE_BACKGROUND), localize(7438, null));

var MODERN_ACTIVITY_BAR_ITEM_ACTIVE_FOREGROUND = registerColor("modernActivityBarItem.activeForeground", oneOf(DEPRECATED_MODERN_ACTIVITY_BAR_ACTIVE_FOREGROUND, MODERN_TAB_ACTIVE_FOREGROUND), localize(7439, null));

var MODERN_ACTIVITY_BAR_ITEM_HOVER_BACKGROUND = registerColor("modernActivityBarItem.hoverBackground", oneOf(DEPRECATED_MODERN_ACTIVITY_BAR_HOVER_BACKGROUND, MODERN_TAB_HOVER_BACKGROUND), localize(7440, null));

var MODERN_ACTIVITY_BAR_ITEM_HOVER_FOREGROUND = registerColor("modernActivityBarItem.hoverForeground", oneOf(DEPRECATED_MODERN_ACTIVITY_BAR_HOVER_FOREGROUND, MODERN_TAB_HOVER_FOREGROUND), localize(7441, null));

var MODERN_ACTIVITY_BAR_BORDER = registerColor("modernActivityBar.border", SURFACE_BORDER, localize(7432, null));

var TITLE_BAR_ACTIVE_FOREGROUND = registerColor("titleBar.activeForeground", {
  dark: "#CCCCCC",
  light: "#333333",
  hcDark: "#FFFFFF",
  hcLight: "#292929"
}, localize(7568, null));

var TITLE_BAR_INACTIVE_FOREGROUND = registerColor("titleBar.inactiveForeground", {
  dark: transparent(TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
  light: transparent(TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
  hcDark: null,
  hcLight: "#292929"
}, localize(7571, null));

var TITLE_BAR_ACTIVE_BACKGROUND = registerColor("titleBar.activeBackground", {
  dark: "#3C3C3C",
  light: "#DDDDDD",
  hcDark: "#000000",
  hcLight: "#FFFFFF"
}, localize(7567, null));

var TITLE_BAR_INACTIVE_BACKGROUND = registerColor("titleBar.inactiveBackground", {
  dark: transparent(TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
  light: transparent(TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
  hcDark: null,
  hcLight: null
}, localize(7570, null));

var TITLE_BAR_BORDER = registerColor("titleBar.border", {
  dark: null,
  light: null,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7569, null));

var MENUBAR_SELECTION_FOREGROUND = registerColor("menubar.selectionForeground", TITLE_BAR_ACTIVE_FOREGROUND, localize(7426, null));

var MENUBAR_SELECTION_BACKGROUND = registerColor("menubar.selectionBackground", {
  dark: toolbarHoverBackground,
  light: toolbarHoverBackground,
  hcDark: null,
  hcLight: null
}, localize(7424, null));

var MENUBAR_SELECTION_BORDER = registerColor("menubar.selectionBorder", {
  dark: null,
  light: null,
  hcDark: activeContrastBorder,
  hcLight: activeContrastBorder
}, localize(7425, null));

var COMMAND_CENTER_FOREGROUND = registerColor(
  "commandCenter.foreground",
  TITLE_BAR_ACTIVE_FOREGROUND,
  localize(7407, null),
  false
);

var COMMAND_CENTER_ACTIVEFOREGROUND = registerColor(
  "commandCenter.activeForeground",
  MENUBAR_SELECTION_FOREGROUND,
  localize(7404, null),
  false
);

var COMMAND_CENTER_INACTIVEFOREGROUND = registerColor(
  "commandCenter.inactiveForeground",
  TITLE_BAR_INACTIVE_FOREGROUND,
  localize(7409, null),
  false
);

var COMMAND_CENTER_BACKGROUND = registerColor(
  "commandCenter.background",
  { dark: Color.white.transparent(0.05), hcDark: null, light: Color.black.transparent(0.05), hcLight: null },
  localize(7405, null),
  false
);

var COMMAND_CENTER_ACTIVEBACKGROUND = registerColor(
  "commandCenter.activeBackground",
  { dark: Color.white.transparent(0.08), hcDark: MENUBAR_SELECTION_BACKGROUND, light: Color.black.transparent(0.08), hcLight: MENUBAR_SELECTION_BACKGROUND },
  localize(7402, null),
  false
);

var COMMAND_CENTER_BORDER = registerColor(
  "commandCenter.border",
  { dark: transparent(TITLE_BAR_ACTIVE_FOREGROUND, 0.2), hcDark: contrastBorder, light: transparent(TITLE_BAR_ACTIVE_FOREGROUND, 0.2), hcLight: contrastBorder },
  localize(7406, null),
  false
);

var COMMAND_CENTER_ACTIVEBORDER = registerColor(
  "commandCenter.activeBorder",
  { dark: transparent(TITLE_BAR_ACTIVE_FOREGROUND, 0.3), hcDark: TITLE_BAR_ACTIVE_FOREGROUND, light: transparent(TITLE_BAR_ACTIVE_FOREGROUND, 0.3), hcLight: TITLE_BAR_ACTIVE_FOREGROUND },
  localize(7403, null),
  false
);

var COMMAND_CENTER_INACTIVEBORDER = registerColor(
  "commandCenter.inactiveBorder",
  transparent(TITLE_BAR_INACTIVE_FOREGROUND, 0.25),
  localize(7408, null),
  false
);

var NOTIFICATIONS_CENTER_BORDER = registerColor("notificationCenter.border", {
  dark: widgetBorder,
  light: widgetBorder,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7456, null));

var NOTIFICATIONS_TOAST_BORDER = registerColor("notificationToast.border", {
  dark: widgetBorder,
  light: widgetBorder,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7466, null));

var NOTIFICATIONS_FOREGROUND = registerColor("notifications.foreground", editorWidgetForeground, localize(7462, null));

var NOTIFICATIONS_BACKGROUND = registerColor("notifications.background", editorWidgetBackground, localize(7459, null));

var NOTIFICATIONS_LINKS = registerColor("notificationLink.foreground", textLinkForeground, localize(7464, null));

var NOTIFICATIONS_CENTER_HEADER_FOREGROUND = registerColor("notificationCenterHeader.foreground", null, localize(7458, null));

var NOTIFICATIONS_CENTER_HEADER_BACKGROUND = registerColor("notificationCenterHeader.background", {
  dark: lighten(NOTIFICATIONS_BACKGROUND, 0.3),
  light: darken(NOTIFICATIONS_BACKGROUND, 0.05),
  hcDark: NOTIFICATIONS_BACKGROUND,
  hcLight: NOTIFICATIONS_BACKGROUND
}, localize(7457, null));

var NOTIFICATIONS_BORDER = registerColor("notifications.border", NOTIFICATIONS_CENTER_HEADER_BACKGROUND, localize(7460, null));

var NOTIFICATIONS_ERROR_ICON_FOREGROUND = registerColor("notificationsErrorIcon.foreground", editorErrorForeground, localize(7461, null));

var NOTIFICATIONS_WARNING_ICON_FOREGROUND = registerColor("notificationsWarningIcon.foreground", editorWarningForeground, localize(7465, null));

var NOTIFICATIONS_INFO_ICON_FOREGROUND = registerColor("notificationsInfoIcon.foreground", editorInfoForeground, localize(7463, null));

var WINDOW_ACTIVE_BORDER = registerColor("window.activeBorder", {
  dark: null,
  light: null,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7574, null));

var WINDOW_INACTIVE_BORDER = registerColor("window.inactiveBorder", {
  dark: null,
  light: null,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(7575, null));
export { WORKBENCH_BACKGROUND, TAB_ACTIVE_BACKGROUND, TAB_UNFOCUSED_ACTIVE_BACKGROUND, TAB_INACTIVE_BACKGROUND, TAB_UNFOCUSED_INACTIVE_BACKGROUND, TAB_ACTIVE_FOREGROUND, TAB_INACTIVE_FOREGROUND, TAB_UNFOCUSED_ACTIVE_FOREGROUND, TAB_UNFOCUSED_INACTIVE_FOREGROUND, TAB_HOVER_BACKGROUND, TAB_UNFOCUSED_HOVER_BACKGROUND, TAB_HOVER_FOREGROUND, TAB_UNFOCUSED_HOVER_FOREGROUND, TAB_BORDER, TAB_LAST_PINNED_BORDER, TAB_ACTIVE_BORDER, TAB_UNFOCUSED_ACTIVE_BORDER, TAB_ACTIVE_BORDER_TOP, TAB_UNFOCUSED_ACTIVE_BORDER_TOP, TAB_SELECTED_BORDER_TOP, TAB_SELECTED_BACKGROUND, TAB_SELECTED_FOREGROUND, TAB_HOVER_BORDER, TAB_UNFOCUSED_HOVER_BORDER, TAB_DRAG_AND_DROP_BORDER, TAB_ACTIVE_MODIFIED_BORDER, TAB_INACTIVE_MODIFIED_BORDER, TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER, TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER, EDITOR_PANE_BACKGROUND, EDITOR_GROUP_EMPTY_BACKGROUND, EDITOR_GROUP_FOCUSED_EMPTY_BORDER, EDITOR_GROUP_HEADER_TABS_BACKGROUND, EDITOR_GROUP_HEADER_TABS_BORDER, EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND, EDITOR_GROUP_HEADER_BORDER, EDITOR_GROUP_BORDER, EDITOR_DRAG_AND_DROP_BACKGROUND, EDITOR_DROP_INTO_PROMPT_FOREGROUND, EDITOR_DROP_INTO_PROMPT_BACKGROUND, EDITOR_DROP_INTO_PROMPT_BORDER, SIDE_BY_SIDE_EDITOR_HORIZONTAL_BORDER, SIDE_BY_SIDE_EDITOR_VERTICAL_BORDER, OUTPUT_VIEW_BACKGROUND, BANNER_BACKGROUND, BANNER_FOREGROUND, BANNER_ICON_FOREGROUND, STATUS_BAR_FOREGROUND, STATUS_BAR_NO_FOLDER_FOREGROUND, STATUS_BAR_BACKGROUND, STATUS_BAR_NO_FOLDER_BACKGROUND, STATUS_BAR_BORDER, STATUS_BAR_FOCUS_BORDER, STATUS_BAR_NO_FOLDER_BORDER, STATUS_BAR_ITEM_ACTIVE_BACKGROUND, STATUS_BAR_ITEM_FOCUS_BORDER, STATUS_BAR_ITEM_HOVER_BACKGROUND, STATUS_BAR_ITEM_HOVER_FOREGROUND, STATUS_BAR_ITEM_COMPACT_HOVER_BACKGROUND, STATUS_BAR_PROMINENT_ITEM_FOREGROUND, STATUS_BAR_PROMINENT_ITEM_BACKGROUND, STATUS_BAR_PROMINENT_ITEM_HOVER_FOREGROUND, STATUS_BAR_PROMINENT_ITEM_HOVER_BACKGROUND, STATUS_BAR_ERROR_ITEM_BACKGROUND, STATUS_BAR_ERROR_ITEM_FOREGROUND, STATUS_BAR_ERROR_ITEM_HOVER_FOREGROUND, STATUS_BAR_ERROR_ITEM_HOVER_BACKGROUND, STATUS_BAR_WARNING_ITEM_BACKGROUND, STATUS_BAR_WARNING_ITEM_FOREGROUND, STATUS_BAR_WARNING_ITEM_HOVER_FOREGROUND, STATUS_BAR_WARNING_ITEM_HOVER_BACKGROUND, ACTIVITY_BAR_BACKGROUND, ACTIVITY_BAR_FOREGROUND, ACTIVITY_BAR_INACTIVE_FOREGROUND, ACTIVITY_BAR_BORDER, ACTIVITY_BAR_ACTIVE_BORDER, ACTIVITY_BAR_ACTIVE_FOCUS_BORDER, ACTIVITY_BAR_ACTIVE_BACKGROUND, ACTIVITY_BAR_DRAG_AND_DROP_BORDER, ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND, ACTIVITY_BAR_TOP_FOREGROUND, ACTIVITY_BAR_TOP_ACTIVE_BORDER, ACTIVITY_BAR_TOP_ACTIVE_BACKGROUND, ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND, ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER, ACTIVITY_BAR_TOP_BACKGROUND, PANEL_BACKGROUND, PANEL_BORDER, PANEL_TITLE_BORDER, PANEL_ACTIVE_TITLE_FOREGROUND, PANEL_INACTIVE_TITLE_FOREGROUND, PANEL_ACTIVE_TITLE_BORDER, PANEL_TITLE_BADGE_BACKGROUND, PANEL_TITLE_BADGE_FOREGROUND, PANEL_INPUT_BORDER, PANEL_DRAG_AND_DROP_BORDER, PANEL_SECTION_DRAG_AND_DROP_BACKGROUND, PANEL_SECTION_HEADER_BACKGROUND, PANEL_SECTION_HEADER_FOREGROUND, PANEL_SECTION_HEADER_BORDER, PANEL_SECTION_BORDER, PANEL_STICKY_SCROLL_BACKGROUND, PANEL_STICKY_SCROLL_BORDER, PANEL_STICKY_SCROLL_SHADOW, BROWSER_BORDER, PROFILE_BADGE_BACKGROUND, PROFILE_BADGE_FOREGROUND, STATUS_BAR_REMOTE_ITEM_BACKGROUND, STATUS_BAR_REMOTE_ITEM_FOREGROUND, STATUS_BAR_REMOTE_ITEM_HOVER_FOREGROUND, STATUS_BAR_REMOTE_ITEM_HOVER_BACKGROUND, STATUS_BAR_OFFLINE_ITEM_BACKGROUND, STATUS_BAR_OFFLINE_ITEM_FOREGROUND, STATUS_BAR_OFFLINE_ITEM_HOVER_FOREGROUND, STATUS_BAR_OFFLINE_ITEM_HOVER_BACKGROUND, EXTENSION_BADGE_BACKGROUND, EXTENSION_BADGE_FOREGROUND, SIDE_BAR_BACKGROUND, SIDE_BAR_FOREGROUND, SIDE_BAR_BORDER, SIDE_BAR_TITLE_BACKGROUND, SIDE_BAR_TITLE_FOREGROUND, SIDE_BAR_TITLE_BORDER, SIDE_BAR_DRAG_AND_DROP_BACKGROUND, SIDE_BAR_SECTION_HEADER_BACKGROUND, SIDE_BAR_SECTION_HEADER_FOREGROUND, SIDE_BAR_SECTION_HEADER_BORDER, ACTIVITY_BAR_TOP_BORDER, SIDE_BAR_STICKY_SCROLL_BACKGROUND, SIDE_BAR_STICKY_SCROLL_BORDER, SIDE_BAR_STICKY_SCROLL_SHADOW, SURFACE_BACKGROUND, SURFACE_FOREGROUND, SURFACE_BORDER, EDITOR_BORDER, MODERN_TAB_ACTIVE_BACKGROUND, MODERN_TAB_ACTIVE_FOREGROUND, MODERN_TAB_HOVER_BACKGROUND, MODERN_TAB_HOVER_FOREGROUND, MODERN_EDITOR_TAB_ACTIVE_BACKGROUND, MODERN_EDITOR_TAB_ACTIVE_ACTION_BACKGROUND, MODERN_EDITOR_TAB_ACTIVE_FOREGROUND, MODERN_EDITOR_TAB_INACTIVE_BACKGROUND, MODERN_EDITOR_TAB_HOVER_BACKGROUND, MODERN_EDITOR_TAB_HOVER_ACTION_BACKGROUND, MODERN_EDITOR_TAB_HOVER_FOREGROUND, MODERN_EDITOR_TAB_ACTIVE_HOVER_BACKGROUND, MODERN_EDITOR_TAB_ACTIVE_HOVER_ACTION_BACKGROUND, MODERN_EDITOR_TAB_SELECTED_ACTION_BACKGROUND, MODERN_ACTIVITY_BAR_BACKGROUND, MODERN_ACTIVITY_BAR_INACTIVE_BACKGROUND, DEPRECATED_MODERN_ACTIVITY_BAR_ACTIVE_BACKGROUND, DEPRECATED_MODERN_ACTIVITY_BAR_ACTIVE_FOREGROUND, DEPRECATED_MODERN_ACTIVITY_BAR_HOVER_BACKGROUND, DEPRECATED_MODERN_ACTIVITY_BAR_HOVER_FOREGROUND, MODERN_ACTIVITY_BAR_ITEM_ACTIVE_BACKGROUND, MODERN_ACTIVITY_BAR_ITEM_ACTIVE_FOREGROUND, MODERN_ACTIVITY_BAR_ITEM_HOVER_BACKGROUND, MODERN_ACTIVITY_BAR_ITEM_HOVER_FOREGROUND, MODERN_ACTIVITY_BAR_BORDER, TITLE_BAR_ACTIVE_FOREGROUND, TITLE_BAR_INACTIVE_FOREGROUND, TITLE_BAR_ACTIVE_BACKGROUND, TITLE_BAR_INACTIVE_BACKGROUND, TITLE_BAR_BORDER, MENUBAR_SELECTION_FOREGROUND, MENUBAR_SELECTION_BACKGROUND, MENUBAR_SELECTION_BORDER, COMMAND_CENTER_FOREGROUND, COMMAND_CENTER_ACTIVEFOREGROUND, COMMAND_CENTER_INACTIVEFOREGROUND, COMMAND_CENTER_BACKGROUND, COMMAND_CENTER_ACTIVEBACKGROUND, COMMAND_CENTER_BORDER, COMMAND_CENTER_ACTIVEBORDER, COMMAND_CENTER_INACTIVEBORDER, NOTIFICATIONS_CENTER_BORDER, NOTIFICATIONS_TOAST_BORDER, NOTIFICATIONS_FOREGROUND, NOTIFICATIONS_BACKGROUND, NOTIFICATIONS_LINKS, NOTIFICATIONS_CENTER_HEADER_FOREGROUND, NOTIFICATIONS_CENTER_HEADER_BACKGROUND, NOTIFICATIONS_BORDER, NOTIFICATIONS_ERROR_ICON_FOREGROUND, NOTIFICATIONS_WARNING_ICON_FOREGROUND, NOTIFICATIONS_INFO_ICON_FOREGROUND, WINDOW_ACTIVE_BORDER, WINDOW_INACTIVE_BORDER };
