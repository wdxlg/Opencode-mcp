// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/theme/common/colors/editorColors.ts
import { darken, lessProminent, lighten, registerColor, transparent } from "./module-0226.mjs";
import { Color, RGBA } from "./module-0197.mjs";
import { localize } from "./module-0001.mjs";
import { activeContrastBorder, contrastBorder, foreground } from "./module-0227.mjs";
import { badgeBackground, scrollbarShadow } from "./module-0228.mjs";


// src/vs/platform/theme/common/colors/editorColors.ts
var editorBackground = registerColor(
  "editor.background",
  { light: "#ffffff", dark: "#1E1E1E", hcDark: Color.black, hcLight: Color.white },
  localize(3353, null)
);

var editorForeground = registerColor(
  "editor.foreground",
  { light: "#333333", dark: "#BBBBBB", hcDark: Color.white, hcLight: foreground },
  localize(3360, null)
);

var editorStickyScrollBackground = registerColor(
  "editorStickyScroll.background",
  editorBackground,
  localize(3378, null)
);

var editorStickyScrollGutterBackground = registerColor(
  "editorStickyScrollGutter.background",
  editorBackground,
  localize(3380, null)
);

var editorStickyScrollHoverBackground = registerColor(
  "editorStickyScrollHover.background",
  { dark: "#2A2D2E", light: "#F0F0F0", hcDark: null, hcLight: Color.fromHex("#0F4A85").transparent(0.1) },
  localize(3381, null)
);

var editorStickyScrollBorder = registerColor(
  "editorStickyScroll.border",
  { dark: null, light: null, hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3379, null)
);

var editorStickyScrollShadow = registerColor(
  "editorStickyScroll.shadow",
  scrollbarShadow,
  localize(3382, null)
);

var editorWidgetBackground = registerColor(
  "editorWidget.background",
  { dark: "#252526", light: "#F3F3F3", hcDark: "#0C141F", hcLight: Color.white },
  localize(3385, null)
);

var editorWidgetForeground = registerColor(
  "editorWidget.foreground",
  foreground,
  localize(3387, null)
);

var editorWidgetBorder = registerColor(
  "editorWidget.border",
  { dark: transparent(editorWidgetForeground, 0.2), light: transparent(editorWidgetForeground, 0.2), hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3386, null)
);

var editorWidgetResizeBorder = registerColor(
  "editorWidget.resizeBorder",
  null,
  localize(3388, null)
);

var editorErrorBackground = registerColor(
  "editorError.background",
  null,
  localize(3355, null),
  true
);

var editorErrorForeground = registerColor(
  "editorError.foreground",
  { dark: "#F14C4C", light: "#E51400", hcDark: "#F48771", hcLight: "#B5200D" },
  localize(3356, null)
);

var editorErrorBorder = registerColor(
  "editorError.border",
  { dark: null, light: null, hcDark: Color.fromHex("#E47777").transparent(0.8), hcLight: "#B5200D" },
  localize(3389, null)
);

var editorWarningBackground = registerColor(
  "editorWarning.background",
  null,
  localize(3383, null),
  true
);

var editorWarningForeground = registerColor(
  "editorWarning.foreground",
  { dark: "#CCA700", light: "#BF8803", hcDark: "#FFD370", hcLight: "#895503" },
  localize(3384, null)
);

var editorWarningBorder = registerColor(
  "editorWarning.border",
  { dark: null, light: null, hcDark: Color.fromHex("#FFCC00").transparent(0.8), hcLight: Color.fromHex("#FFCC00").transparent(0.8) },
  localize(3424, null)
);

var editorInfoBackground = registerColor(
  "editorInfo.background",
  null,
  localize(3363, null),
  true
);

var editorInfoForeground = registerColor(
  "editorInfo.foreground",
  { dark: "#59a4f9", light: "#0063d3", hcDark: "#59a4f9", hcLight: "#0063d3" },
  localize(3364, null)
);

var editorInfoBorder = registerColor(
  "editorInfo.border",
  { dark: null, light: null, hcDark: Color.fromHex("#59a4f9").transparent(0.8), hcLight: "#292929" },
  localize(3400, null)
);

var editorHintForeground = registerColor(
  "editorHint.foreground",
  { dark: Color.fromHex("#eeeeee").transparent(0.7), light: "#6c6c6c", hcDark: null, hcLight: null },
  localize(3361, null)
);

var editorHintBorder = registerColor(
  "editorHint.border",
  { dark: null, light: null, hcDark: Color.fromHex("#eeeeee").transparent(0.8), hcLight: "#292929" },
  localize(3395, null)
);

var editorActiveLinkForeground = registerColor(
  "editorLink.activeForeground",
  { dark: "#4E94CE", light: Color.blue, hcDark: Color.cyan, hcLight: "#292929" },
  localize(3333, null)
);

var editorSelectionBackground = registerColor(
  "editor.selectionBackground",
  { light: "#ADD6FF", dark: "#264F78", hcDark: "#f3f518", hcLight: "#0F4A85" },
  localize(3374, null)
);

var editorSelectionForeground = registerColor(
  "editor.selectionForeground",
  { light: null, dark: null, hcDark: "#000000", hcLight: Color.white },
  localize(3375, null)
);

var editorInactiveSelection = registerColor(
  "editor.inactiveSelectionBackground",
  { light: transparent(editorSelectionBackground, 0.5), dark: transparent(editorSelectionBackground, 0.5), hcDark: transparent(editorSelectionBackground, 0.7), hcLight: transparent(editorSelectionBackground, 0.5) },
  localize(3362, null),
  true
);

var editorSelectionHighlight = registerColor(
  "editor.selectionHighlightBackground",
  { light: lessProminent(editorSelectionBackground, editorBackground, 0.3, 0.6), dark: lessProminent(editorSelectionBackground, editorBackground, 0.3, 0.6), hcDark: null, hcLight: null },
  localize(3376, null),
  true
);

var editorSelectionHighlightBorder = registerColor(
  "editor.selectionHighlightBorder",
  { light: null, dark: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder },
  localize(3377, null)
);

var editorCompositionBorder = registerColor(
  "editor.compositionBorder",
  { light: "#000000", dark: "#ffffff", hcLight: "#000000", hcDark: "#ffffff" },
  localize(3354, null)
);

var editorFindMatch = registerColor(
  "editor.findMatchBackground",
  { light: "#A8AC94", dark: "#515C6A", hcDark: null, hcLight: null },
  localize(3357, null)
);

var editorFindMatchForeground = registerColor(
  "editor.findMatchForeground",
  null,
  localize(3359, null)
);

var editorFindMatchHighlight = registerColor(
  "editor.findMatchHighlightBackground",
  { light: "#EA5C0055", dark: "#EA5C0055", hcDark: null, hcLight: null },
  localize(3390, null),
  true
);

var editorFindMatchHighlightForeground = registerColor(
  "editor.findMatchHighlightForeground",
  null,
  localize(3392, null),
  true
);

var editorFindRangeHighlight = registerColor(
  "editor.findRangeHighlightBackground",
  { dark: "#3a3d4166", light: "#b4b4b44d", hcDark: null, hcLight: null },
  localize(3393, null),
  true
);

var editorFindMatchBorder = registerColor(
  "editor.findMatchBorder",
  { light: null, dark: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder },
  localize(3358, null)
);

var editorFindMatchHighlightBorder = registerColor(
  "editor.findMatchHighlightBorder",
  { light: null, dark: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder },
  localize(3391, null)
);

var editorFindRangeHighlightBorder = registerColor(
  "editor.findRangeHighlightBorder",
  { dark: null, light: null, hcDark: transparent(activeContrastBorder, 0.4), hcLight: transparent(activeContrastBorder, 0.4) },
  localize(3394, null),
  true
);

var editorHoverHighlight = registerColor(
  "editor.hoverHighlightBackground",
  { light: "#ADD6FF26", dark: "#264f7840", hcDark: "#ADD6FF26", hcLight: null },
  localize(3399, null),
  true
);

var editorHoverBackground = registerColor(
  "editorHoverWidget.background",
  editorWidgetBackground,
  localize(3396, null)
);

var editorHoverForeground = registerColor(
  "editorHoverWidget.foreground",
  editorWidgetForeground,
  localize(3398, null)
);

var editorHoverBorder = registerColor(
  "editorHoverWidget.border",
  editorWidgetBorder,
  localize(3397, null)
);

var editorHoverStatusBarBackground = registerColor(
  "editorHoverWidget.statusBarBackground",
  { dark: lighten(editorHoverBackground, 0.2), light: darken(editorHoverBackground, 0.05), hcDark: editorWidgetBackground, hcLight: editorWidgetBackground },
  localize(3420, null)
);

var editorInlayHintForeground = registerColor(
  "editorInlayHint.foreground",
  { dark: "#969696", light: "#969696", hcDark: Color.white, hcLight: Color.black },
  localize(3368, null)
);

var editorInlayHintBackground = registerColor(
  "editorInlayHint.background",
  { dark: transparent(badgeBackground, 0.1), light: transparent(badgeBackground, 0.1), hcDark: transparent(Color.white, 0.1), hcLight: transparent(badgeBackground, 0.1) },
  localize(3365, null)
);

var editorInlayHintTypeForeground = registerColor(
  "editorInlayHint.typeForeground",
  editorInlayHintForeground,
  localize(3370, null)
);

var editorInlayHintTypeBackground = registerColor(
  "editorInlayHint.typeBackground",
  editorInlayHintBackground,
  localize(3367, null)
);

var editorInlayHintParameterForeground = registerColor(
  "editorInlayHint.parameterForeground",
  editorInlayHintForeground,
  localize(3369, null)
);

var editorInlayHintParameterBackground = registerColor(
  "editorInlayHint.parameterBackground",
  editorInlayHintBackground,
  localize(3366, null)
);

var editorLightBulbForeground = registerColor(
  "editorLightBulb.foreground",
  { dark: "#FFCC00", light: "#DDB100", hcDark: "#FFCC00", hcLight: "#007ACC" },
  localize(3373, null)
);

var editorLightBulbAutoFixForeground = registerColor(
  "editorLightBulbAutoFix.foreground",
  { dark: "#75BEFF", light: "#007ACC", hcDark: "#75BEFF", hcLight: "#007ACC" },
  localize(3372, null)
);

var editorLightBulbAiForeground = registerColor(
  "editorLightBulbAi.foreground",
  editorLightBulbForeground,
  localize(3371, null)
);

var snippetTabstopHighlightBackground = registerColor(
  "editor.snippetTabstopHighlightBackground",
  { dark: new Color(new RGBA(124, 124, 124, 0.3)), light: new Color(new RGBA(10, 50, 100, 0.2)), hcDark: new Color(new RGBA(124, 124, 124, 0.3)), hcLight: new Color(new RGBA(10, 50, 100, 0.2)) },
  localize(3418, null)
);

var snippetTabstopHighlightBorder = registerColor(
  "editor.snippetTabstopHighlightBorder",
  null,
  localize(3419, null)
);

var snippetFinalTabstopHighlightBackground = registerColor(
  "editor.snippetFinalTabstopHighlightBackground",
  null,
  localize(3416, null)
);

var snippetFinalTabstopHighlightBorder = registerColor(
  "editor.snippetFinalTabstopHighlightBorder",
  { dark: "#525252", light: new Color(new RGBA(10, 50, 100, 0.5)), hcDark: "#525252", hcLight: "#292929" },
  localize(3417, null)
);

var defaultInsertColor = new Color(new RGBA(155, 185, 85, 0.2));

var defaultRemoveColor = new Color(new RGBA(255, 0, 0, 0.2));

var diffInserted = registerColor(
  "diffEditor.insertedTextBackground",
  { dark: "#9ccc2c33", light: "#9ccc2c40", hcDark: null, hcLight: null },
  localize(3343, null),
  true
);

var diffRemoved = registerColor(
  "diffEditor.removedTextBackground",
  { dark: "#ff000033", light: "#ff000033", hcDark: null, hcLight: null },
  localize(3349, null),
  true
);

var diffInsertedLine = registerColor(
  "diffEditor.insertedLineBackground",
  { dark: defaultInsertColor, light: defaultInsertColor, hcDark: null, hcLight: null },
  localize(3345, null),
  true
);

var diffRemovedLine = registerColor(
  "diffEditor.removedLineBackground",
  { dark: defaultRemoveColor, light: defaultRemoveColor, hcDark: null, hcLight: null },
  localize(3351, null),
  true
);

var diffInsertedLineGutter = registerColor(
  "diffEditorGutter.insertedLineBackground",
  null,
  localize(3344, null)
);

var diffRemovedLineGutter = registerColor(
  "diffEditorGutter.removedLineBackground",
  null,
  localize(3350, null)
);

var diffOverviewRulerInserted = registerColor(
  "diffEditorOverview.insertedForeground",
  null,
  localize(3347, null)
);

var diffOverviewRulerRemoved = registerColor(
  "diffEditorOverview.removedForeground",
  null,
  localize(3348, null)
);

var diffInsertedOutline = registerColor(
  "diffEditor.insertedTextBorder",
  { dark: null, light: null, hcDark: "#33ff2eff", hcLight: "#374E06" },
  localize(3346, null)
);

var diffRemovedOutline = registerColor(
  "diffEditor.removedTextBorder",
  { dark: null, light: null, hcDark: "#FF008F", hcLight: "#AD0707" },
  localize(3352, null)
);

var diffBorder = registerColor(
  "diffEditor.border",
  { dark: null, light: null, hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3342, null)
);

var diffDiagonalFill = registerColor(
  "diffEditor.diagonalFill",
  { dark: "#cccccc33", light: "#22222233", hcDark: null, hcLight: null },
  localize(3338, null)
);

var diffUnchangedRegionBackground = registerColor(
  "diffEditor.unchangedRegionBackground",
  "sideBar.background",
  localize(3340, null)
);

var diffUnchangedRegionForeground = registerColor(
  "diffEditor.unchangedRegionForeground",
  "foreground",
  localize(3341, null)
);

var diffUnchangedTextBackground = registerColor(
  "diffEditor.unchangedCodeBackground",
  { dark: "#74747429", light: "#b8b8b829", hcDark: null, hcLight: null },
  localize(3339, null)
);

var widgetShadow = registerColor(
  "widget.shadow",
  { dark: transparent(Color.black, 0.36), light: transparent(Color.black, 0.16), hcDark: null, hcLight: null },
  localize(3426, null)
);

var widgetBorder = registerColor(
  "widget.border",
  { dark: null, light: null, hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3425, null)
);

var toolbarHoverBackground = registerColor(
  "toolbar.hoverBackground",
  { dark: "#5a5d5e50", light: "#b8b8b850", hcDark: null, hcLight: null },
  localize(3422, null)
);

var toolbarHoverOutline = registerColor(
  "toolbar.hoverOutline",
  { dark: null, light: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder },
  localize(3423, null)
);

var toolbarActiveBackground = registerColor(
  "toolbar.activeBackground",
  { dark: lighten(toolbarHoverBackground, 0.1), light: darken(toolbarHoverBackground, 0.1), hcDark: null, hcLight: null },
  localize(3421, null)
);

var breadcrumbsForeground = registerColor(
  "breadcrumb.foreground",
  transparent(foreground, 0.8),
  localize(3335, null)
);

var breadcrumbsBackground = registerColor(
  "breadcrumb.background",
  editorBackground,
  localize(3334, null)
);

var breadcrumbsFocusForeground = registerColor(
  "breadcrumb.focusForeground",
  { light: darken(foreground, 0.2), dark: lighten(foreground, 0.1), hcDark: lighten(foreground, 0.1), hcLight: lighten(foreground, 0.1) },
  localize(3335, null)
);

var breadcrumbsActiveSelectionForeground = registerColor(
  "breadcrumb.activeSelectionForeground",
  { light: darken(foreground, 0.2), dark: lighten(foreground, 0.1), hcDark: lighten(foreground, 0.1), hcLight: lighten(foreground, 0.1) },
  localize(3337, null)
);

var breadcrumbsPickerBackground = registerColor(
  "breadcrumbPicker.background",
  editorWidgetBackground,
  localize(3336, null)
);

var headerTransparency = 0.5;

var currentBaseColor = Color.fromHex("#40C8AE").transparent(headerTransparency);

var incomingBaseColor = Color.fromHex("#40A6FF").transparent(headerTransparency);

var commonBaseColor = Color.fromHex("#606060").transparent(0.4);

var contentTransparency = 0.4;

var rulerTransparency = 1;

var mergeCurrentHeaderBackground = registerColor(
  "merge.currentHeaderBackground",
  { dark: currentBaseColor, light: currentBaseColor, hcDark: null, hcLight: null },
  localize(3405, null),
  true
);

var mergeCurrentContentBackground = registerColor(
  "merge.currentContentBackground",
  transparent(mergeCurrentHeaderBackground, contentTransparency),
  localize(3404, null),
  true
);

var mergeIncomingHeaderBackground = registerColor(
  "merge.incomingHeaderBackground",
  { dark: incomingBaseColor, light: incomingBaseColor, hcDark: null, hcLight: null },
  localize(3407, null),
  true
);

var mergeIncomingContentBackground = registerColor(
  "merge.incomingContentBackground",
  transparent(mergeIncomingHeaderBackground, contentTransparency),
  localize(3406, null),
  true
);

var mergeCommonHeaderBackground = registerColor(
  "merge.commonHeaderBackground",
  { dark: commonBaseColor, light: commonBaseColor, hcDark: null, hcLight: null },
  localize(3403, null),
  true
);

var mergeCommonContentBackground = registerColor(
  "merge.commonContentBackground",
  transparent(mergeCommonHeaderBackground, contentTransparency),
  localize(3402, null),
  true
);

var mergeBorder = registerColor(
  "merge.border",
  { dark: null, light: null, hcDark: "#C3DF6F", hcLight: "#007ACC" },
  localize(3401, null)
);

var overviewRulerCurrentContentForeground = registerColor(
  "editorOverviewRuler.currentContentForeground",
  { dark: transparent(mergeCurrentHeaderBackground, rulerTransparency), light: transparent(mergeCurrentHeaderBackground, rulerTransparency), hcDark: mergeBorder, hcLight: mergeBorder },
  localize(3409, null)
);

var overviewRulerIncomingContentForeground = registerColor(
  "editorOverviewRuler.incomingContentForeground",
  { dark: transparent(mergeIncomingHeaderBackground, rulerTransparency), light: transparent(mergeIncomingHeaderBackground, rulerTransparency), hcDark: mergeBorder, hcLight: mergeBorder },
  localize(3411, null)
);

var overviewRulerCommonContentForeground = registerColor(
  "editorOverviewRuler.commonContentForeground",
  { dark: transparent(mergeCommonHeaderBackground, rulerTransparency), light: transparent(mergeCommonHeaderBackground, rulerTransparency), hcDark: mergeBorder, hcLight: mergeBorder },
  localize(3408, null)
);

var overviewRulerFindMatchForeground = registerColor(
  "editorOverviewRuler.findMatchForeground",
  { dark: "#d186167e", light: "#d186167e", hcDark: "#AB5A00", hcLight: "#AB5A00" },
  localize(3410, null),
  true
);

var overviewRulerSelectionHighlightForeground = registerColor(
  "editorOverviewRuler.selectionHighlightForeground",
  "#A0A0A0CC",
  localize(3412, null),
  true
);

var problemsErrorIconForeground = registerColor(
  "problemsErrorIcon.foreground",
  editorErrorForeground,
  localize(3413, null)
);

var problemsWarningIconForeground = registerColor(
  "problemsWarningIcon.foreground",
  editorWarningForeground,
  localize(3415, null)
);

var problemsInfoIconForeground = registerColor(
  "problemsInfoIcon.foreground",
  editorInfoForeground,
  localize(3414, null)
);
export { editorBackground, editorForeground, editorStickyScrollBackground, editorStickyScrollGutterBackground, editorStickyScrollHoverBackground, editorStickyScrollBorder, editorStickyScrollShadow, editorWidgetBackground, editorWidgetForeground, editorWidgetBorder, editorWidgetResizeBorder, editorErrorBackground, editorErrorForeground, editorErrorBorder, editorWarningBackground, editorWarningForeground, editorWarningBorder, editorInfoBackground, editorInfoForeground, editorInfoBorder, editorHintForeground, editorHintBorder, editorActiveLinkForeground, editorSelectionBackground, editorSelectionForeground, editorInactiveSelection, editorSelectionHighlight, editorSelectionHighlightBorder, editorCompositionBorder, editorFindMatch, editorFindMatchForeground, editorFindMatchHighlight, editorFindMatchHighlightForeground, editorFindRangeHighlight, editorFindMatchBorder, editorFindMatchHighlightBorder, editorFindRangeHighlightBorder, editorHoverHighlight, editorHoverBackground, editorHoverForeground, editorHoverBorder, editorHoverStatusBarBackground, editorInlayHintForeground, editorInlayHintBackground, editorInlayHintTypeForeground, editorInlayHintTypeBackground, editorInlayHintParameterForeground, editorInlayHintParameterBackground, editorLightBulbForeground, editorLightBulbAutoFixForeground, editorLightBulbAiForeground, snippetTabstopHighlightBackground, snippetTabstopHighlightBorder, snippetFinalTabstopHighlightBackground, snippetFinalTabstopHighlightBorder, defaultInsertColor, defaultRemoveColor, diffInserted, diffRemoved, diffInsertedLine, diffRemovedLine, diffInsertedLineGutter, diffRemovedLineGutter, diffOverviewRulerInserted, diffOverviewRulerRemoved, diffInsertedOutline, diffRemovedOutline, diffBorder, diffDiagonalFill, diffUnchangedRegionBackground, diffUnchangedRegionForeground, diffUnchangedTextBackground, widgetShadow, widgetBorder, toolbarHoverBackground, toolbarHoverOutline, toolbarActiveBackground, breadcrumbsForeground, breadcrumbsBackground, breadcrumbsFocusForeground, breadcrumbsActiveSelectionForeground, breadcrumbsPickerBackground, headerTransparency, currentBaseColor, incomingBaseColor, commonBaseColor, contentTransparency, rulerTransparency, mergeCurrentHeaderBackground, mergeCurrentContentBackground, mergeIncomingHeaderBackground, mergeIncomingContentBackground, mergeCommonHeaderBackground, mergeCommonContentBackground, mergeBorder, overviewRulerCurrentContentForeground, overviewRulerIncomingContentForeground, overviewRulerCommonContentForeground, overviewRulerFindMatchForeground, overviewRulerSelectionHighlightForeground, problemsErrorIconForeground, problemsWarningIconForeground, problemsInfoIconForeground };
