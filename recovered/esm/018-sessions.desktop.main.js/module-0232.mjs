// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/theme/common/colors/listColors.ts
import { darken, ifDefinedThenElse, lighten, registerColor, transparent } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { activeContrastBorder, contrastBorder, focusBorder, foreground, iconForeground } from "./module-0227.mjs";
import { Color } from "./module-0197.mjs";
import { editorFindMatchHighlight, editorFindMatchHighlightBorder, editorWidgetBackground, editorWidgetForeground, widgetShadow } from "./module-0229.mjs";


// src/vs/platform/theme/common/colors/listColors.ts
var listFocusBackground = registerColor(
  "list.focusBackground",
  null,
  localize(3495, null)
);

var listFocusForeground = registerColor(
  "list.focusForeground",
  null,
  localize(3496, null)
);

var listFocusOutline = registerColor(
  "list.focusOutline",
  { dark: focusBorder, light: focusBorder, hcDark: activeContrastBorder, hcLight: activeContrastBorder },
  localize(3498, null)
);

var listFocusAndSelectionOutline = registerColor(
  "list.focusAndSelectionOutline",
  null,
  localize(3494, null)
);

var listActiveSelectionBackground = registerColor(
  "list.activeSelectionBackground",
  { dark: "#04395E", light: "#0060C0", hcDark: null, hcLight: Color.fromHex("#0F4A85").transparent(0.1) },
  localize(3481, null)
);

var listActiveSelectionForeground = registerColor(
  "list.activeSelectionForeground",
  { dark: Color.white, light: Color.white, hcDark: null, hcLight: null },
  localize(3482, null)
);

var listActiveSelectionIconForeground = registerColor(
  "list.activeSelectionIconForeground",
  null,
  localize(3483, null)
);

var listInactiveSelectionBackground = registerColor(
  "list.inactiveSelectionBackground",
  { dark: "#37373D", light: "#E4E6F1", hcDark: null, hcLight: Color.fromHex("#0F4A85").transparent(0.1) },
  localize(3503, null)
);

var listInactiveSelectionForeground = registerColor(
  "list.inactiveSelectionForeground",
  null,
  localize(3504, null)
);

var listInactiveSelectionIconForeground = registerColor(
  "list.inactiveSelectionIconForeground",
  null,
  localize(3505, null)
);

var listInactiveFocusBackground = registerColor(
  "list.inactiveFocusBackground",
  null,
  localize(3501, null)
);

var listInactiveFocusOutline = registerColor(
  "list.inactiveFocusOutline",
  null,
  localize(3502, null)
);

var listHoverBackground = registerColor(
  "list.hoverBackground",
  { dark: "#2A2D2E", light: "#F0F0F0", hcDark: Color.white.transparent(0.1), hcLight: Color.fromHex("#0F4A85").transparent(0.1) },
  localize(3499, null)
);

var listHoverForeground = registerColor(
  "list.hoverForeground",
  null,
  localize(3500, null)
);

var listDropOverBackground = registerColor(
  "list.dropBackground",
  { dark: "#062F4A", light: "#D6EBFF", hcDark: null, hcLight: null },
  localize(3485, null)
);

var listDropBetweenBackground = registerColor(
  "list.dropBetweenBackground",
  { dark: iconForeground, light: iconForeground, hcDark: null, hcLight: null },
  localize(3486, null)
);

var listHighlightForeground = registerColor(
  "list.highlightForeground",
  { dark: "#2AAAFF", light: "#0066BF", hcDark: focusBorder, hcLight: focusBorder },
  localize(3479, null)
);

var listFocusHighlightForeground = registerColor(
  "list.focusHighlightForeground",
  { dark: listHighlightForeground, light: ifDefinedThenElse(listActiveSelectionBackground, listHighlightForeground, "#BBE7FF"), hcDark: listHighlightForeground, hcLight: listHighlightForeground },
  localize(3497, null)
);

var listInvalidItemForeground = registerColor(
  "list.invalidItemForeground",
  { dark: "#B89500", light: "#B89500", hcDark: "#B89500", hcLight: "#B5200D" },
  localize(3480, null)
);

var listErrorForeground = registerColor(
  "list.errorForeground",
  { dark: "#F88070", light: "#B01011", hcDark: null, hcLight: null },
  localize(3487, null)
);

var listWarningForeground = registerColor(
  "list.warningForeground",
  { dark: "#CCA700", light: "#855F00", hcDark: null, hcLight: null },
  localize(3506, null)
);

var listFilterWidgetBackground = registerColor(
  "listFilterWidget.background",
  { light: darken(editorWidgetBackground, 0), dark: lighten(editorWidgetBackground, 0), hcDark: editorWidgetBackground, hcLight: editorWidgetBackground },
  localize(3490, null)
);

var listFilterWidgetOutline = registerColor(
  "listFilterWidget.outline",
  { dark: Color.transparent, light: Color.transparent, hcDark: "#f38518", hcLight: "#007ACC" },
  localize(3492, null)
);

var listFilterWidgetNoMatchesOutline = registerColor(
  "listFilterWidget.noMatchesOutline",
  { dark: "#BE1100", light: "#BE1100", hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3491, null)
);

var listFilterWidgetShadow = registerColor(
  "listFilterWidget.shadow",
  widgetShadow,
  localize(3493, null)
);

var listFilterMatchHighlight = registerColor(
  "list.filterMatchBackground",
  { dark: editorFindMatchHighlight, light: editorFindMatchHighlight, hcDark: null, hcLight: null },
  localize(3488, null)
);

var listFilterMatchHighlightBorder = registerColor(
  "list.filterMatchBorder",
  { dark: editorFindMatchHighlightBorder, light: editorFindMatchHighlightBorder, hcDark: contrastBorder, hcLight: activeContrastBorder },
  localize(3489, null)
);

var listDeemphasizedForeground = registerColor(
  "list.deemphasizedForeground",
  { dark: "#8C8C8C", light: "#8E8E90", hcDark: "#A7A8A9", hcLight: "#666666" },
  localize(3484, null)
);

var treeIndentGuidesStroke = registerColor(
  "tree.indentGuidesStroke",
  { dark: "#585858", light: "#a9a9a9", hcDark: "#a9a9a9", hcLight: "#a5a5a5" },
  localize(3510, null)
);

var treeInactiveIndentGuidesStroke = registerColor(
  "tree.inactiveIndentGuidesStroke",
  transparent(treeIndentGuidesStroke, 0.4),
  localize(3509, null)
);

var tableColumnsBorder = registerColor(
  "tree.tableColumnsBorder",
  { dark: "#CCCCCC20", light: "#61616120", hcDark: null, hcLight: null },
  localize(3507, null)
);

var tableOddRowsBackgroundColor = registerColor(
  "tree.tableOddRowsBackground",
  { dark: transparent(foreground, 0.04), light: transparent(foreground, 0.04), hcDark: null, hcLight: null },
  localize(3508, null)
);

var editorActionListBackground = registerColor(
  "editorActionList.background",
  editorWidgetBackground,
  localize(3475, null)
);

var editorActionListForeground = registerColor(
  "editorActionList.foreground",
  editorWidgetForeground,
  localize(3478, null)
);

var editorActionListFocusForeground = registerColor(
  "editorActionList.focusForeground",
  listActiveSelectionForeground,
  localize(3477, null)
);

var editorActionListFocusBackground = registerColor(
  "editorActionList.focusBackground",
  listActiveSelectionBackground,
  localize(3476, null)
);
export { listFocusBackground, listFocusForeground, listFocusOutline, listFocusAndSelectionOutline, listActiveSelectionBackground, listActiveSelectionForeground, listActiveSelectionIconForeground, listInactiveSelectionBackground, listInactiveSelectionForeground, listInactiveSelectionIconForeground, listInactiveFocusBackground, listInactiveFocusOutline, listHoverBackground, listHoverForeground, listDropOverBackground, listDropBetweenBackground, listHighlightForeground, listFocusHighlightForeground, listInvalidItemForeground, listErrorForeground, listWarningForeground, listFilterWidgetBackground, listFilterWidgetOutline, listFilterWidgetNoMatchesOutline, listFilterWidgetShadow, listFilterMatchHighlight, listFilterMatchHighlightBorder, listDeemphasizedForeground, treeIndentGuidesStroke, treeInactiveIndentGuidesStroke, tableColumnsBorder, tableOddRowsBackgroundColor, editorActionListBackground, editorActionListForeground, editorActionListFocusForeground, editorActionListFocusBackground };
