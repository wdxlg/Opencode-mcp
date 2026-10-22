// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/editorColorRegistry.ts
import { registerColor } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { activeContrastBorder, contrastBorder } from "./module-0227.mjs";
import { editorBackground, editorFindMatchHighlight, editorInfoBorder, editorInfoForeground, editorWarningBackground, editorWarningBorder, editorWarningForeground } from "./module-0229.mjs";
import { Color, RGBA } from "./module-0197.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";


// src/vs/editor/common/core/editorColorRegistry.ts
var editorLineHighlight = registerColor("editor.lineHighlightBackground", null, localize(805, null));

var editorInactiveLineHighlight = registerColor("editor.inactiveLineHighlightBackground", editorLineHighlight, localize(804, null));

var editorLineHighlightBorder = registerColor("editor.lineHighlightBorder", { dark: "#282828", light: "#eeeeee", hcDark: "#f38518", hcLight: contrastBorder }, localize(806, null));

var editorRangeHighlight = registerColor("editor.rangeHighlightBackground", { dark: "#ffffff0b", light: "#fdff0033", hcDark: null, hcLight: null }, localize(811, null), true);

var editorRangeHighlightBorder = registerColor("editor.rangeHighlightBorder", { dark: null, light: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder }, localize(812, null));

var editorSymbolHighlight = registerColor("editor.symbolHighlightBackground", { dark: editorFindMatchHighlight, light: editorFindMatchHighlight, hcDark: null, hcLight: null }, localize(813, null), true);

var editorSymbolHighlightBorder = registerColor("editor.symbolHighlightBorder", { dark: null, light: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder }, localize(814, null));

var editorCursorForeground = registerColor("editorCursor.foreground", { dark: "#AEAFAD", light: Color.black, hcDark: Color.white, hcLight: "#0F4A85" }, localize(745, null));

var editorCursorBackground = registerColor("editorCursor.background", null, localize(780, null));

var editorMultiCursorPrimaryForeground = registerColor("editorMultiCursor.primary.foreground", editorCursorForeground, localize(795, null));

var editorMultiCursorPrimaryBackground = registerColor("editorMultiCursor.primary.background", editorCursorBackground, localize(794, null));

var editorMultiCursorSecondaryForeground = registerColor("editorMultiCursor.secondary.foreground", editorCursorForeground, localize(797, null));

var editorMultiCursorSecondaryBackground = registerColor("editorMultiCursor.secondary.background", editorCursorBackground, localize(796, null));

var editorWhitespaces = registerColor("editorWhitespace.foreground", { dark: "#e3e4e229", light: "#33333333", hcDark: "#e3e4e229", hcLight: "#CCCCCC" }, localize(803, null));

var editorLineNumbers = registerColor("editorLineNumber.foreground", { dark: "#858585", light: "#237893", hcDark: Color.white, hcLight: "#292929" }, localize(793, null));

var deprecatedEditorIndentGuides = registerColor("editorIndentGuide.background", editorWhitespaces, localize(786, null), false, localize(748, null));

var deprecatedEditorActiveIndentGuides = registerColor("editorIndentGuide.activeBackground", editorWhitespaces, localize(749, null), false, localize(746, null));

var editorIndentGuide1 = registerColor("editorIndentGuide.background1", deprecatedEditorIndentGuides, localize(787, null));

var editorIndentGuide2 = registerColor("editorIndentGuide.background2", "#00000000", localize(788, null));

var editorIndentGuide3 = registerColor("editorIndentGuide.background3", "#00000000", localize(789, null));

var editorIndentGuide4 = registerColor("editorIndentGuide.background4", "#00000000", localize(790, null));

var editorIndentGuide5 = registerColor("editorIndentGuide.background5", "#00000000", localize(791, null));

var editorIndentGuide6 = registerColor("editorIndentGuide.background6", "#00000000", localize(792, null));

var editorActiveIndentGuide1 = registerColor("editorIndentGuide.activeBackground1", deprecatedEditorActiveIndentGuides, localize(750, null));

var editorActiveIndentGuide2 = registerColor("editorIndentGuide.activeBackground2", "#00000000", localize(751, null));

var editorActiveIndentGuide3 = registerColor("editorIndentGuide.activeBackground3", "#00000000", localize(752, null));

var editorActiveIndentGuide4 = registerColor("editorIndentGuide.activeBackground4", "#00000000", localize(753, null));

var editorActiveIndentGuide5 = registerColor("editorIndentGuide.activeBackground5", "#00000000", localize(754, null));

var editorActiveIndentGuide6 = registerColor("editorIndentGuide.activeBackground6", "#00000000", localize(755, null));

var deprecatedEditorActiveLineNumber = registerColor("editorActiveLineNumber.foreground", { dark: "#c6c6c6", light: "#0B216F", hcDark: activeContrastBorder, hcLight: activeContrastBorder }, localize(756, null), false, localize(747, null));

var editorActiveLineNumber = registerColor("editorLineNumber.activeForeground", deprecatedEditorActiveLineNumber, localize(756, null));

var editorDimmedLineNumber = registerColor("editorLineNumber.dimmedForeground", null, localize(781, null));

var editorRuler = registerColor("editorRuler.foreground", { dark: "#5A5A5A", light: Color.lightgrey, hcDark: Color.white, hcLight: "#292929" }, localize(800, null));

var editorCodeLensForeground = registerColor("editorCodeLens.foreground", { dark: "#999999", light: "#919191", hcDark: "#999999", hcLight: "#292929" }, localize(779, null));

var editorBracketMatchBackground = registerColor("editorBracketMatch.background", { dark: "#0064001a", light: "#0064001a", hcDark: "#0064001a", hcLight: "#0000" }, localize(764, null));

var editorBracketMatchBorder = registerColor("editorBracketMatch.border", { dark: "#888", light: "#B9B9B9", hcDark: contrastBorder, hcLight: contrastBorder }, localize(765, null));

var editorBracketMatchForeground = registerColor("editorBracketMatch.foreground", null, localize(766, null));

var editorOverviewRulerBorder = registerColor("editorOverviewRuler.border", { dark: "#7f7f7f4d", light: "#7f7f7f4d", hcDark: "#7f7f7f4d", hcLight: "#666666" }, localize(799, null));

var editorOverviewRulerBackground = registerColor("editorOverviewRuler.background", null, localize(798, null));

var editorGutter = registerColor("editorGutter.background", editorBackground, localize(785, null));

var editorUnnecessaryCodeBorder = registerColor("editorUnnecessaryCode.border", { dark: null, light: null, hcDark: Color.fromHex("#fff").transparent(0.8), hcLight: contrastBorder }, localize(815, null));

var editorUnnecessaryCodeOpacity = registerColor("editorUnnecessaryCode.opacity", { dark: Color.fromHex("#000a"), light: Color.fromHex("#0007"), hcDark: null, hcLight: null }, localize(816, null));

var ghostTextBorder = registerColor("editorGhostText.border", { dark: null, light: null, hcDark: Color.fromHex("#fff").transparent(0.8), hcLight: Color.fromHex("#292929").transparent(0.8) }, localize(783, null));

var ghostTextForeground = registerColor("editorGhostText.foreground", { dark: Color.fromHex("#ffffff56"), light: Color.fromHex("#0007"), hcDark: null, hcLight: null }, localize(784, null));

var ghostTextBackground = registerColor("editorGhostText.background", null, localize(782, null));

var rulerRangeDefault = new Color(new RGBA(0, 122, 204, 0.6));

var overviewRulerRangeHighlight = registerColor("editorOverviewRuler.rangeHighlightForeground", rulerRangeDefault, localize(809, null), true);

var overviewRulerError = registerColor("editorOverviewRuler.errorForeground", { dark: new Color(new RGBA(255, 18, 18, 0.7)), light: new Color(new RGBA(255, 18, 18, 0.7)), hcDark: new Color(new RGBA(255, 50, 50, 1)), hcLight: "#B5200D" }, localize(807, null));

var overviewRulerWarning = registerColor("editorOverviewRuler.warningForeground", { dark: editorWarningForeground, light: editorWarningForeground, hcDark: editorWarningBorder, hcLight: editorWarningBorder }, localize(810, null));

var overviewRulerInfo = registerColor("editorOverviewRuler.infoForeground", { dark: editorInfoForeground, light: editorInfoForeground, hcDark: editorInfoBorder, hcLight: editorInfoBorder }, localize(808, null));

var editorBracketHighlightingForeground1 = registerColor("editorBracketHighlight.foreground1", { dark: "#FFD700", light: "#0431FAFF", hcDark: "#FFD700", hcLight: "#0431FAFF" }, localize(757, null));

var editorBracketHighlightingForeground2 = registerColor("editorBracketHighlight.foreground2", { dark: "#DA70D6", light: "#319331FF", hcDark: "#DA70D6", hcLight: "#319331FF" }, localize(758, null));

var editorBracketHighlightingForeground3 = registerColor("editorBracketHighlight.foreground3", { dark: "#179FFF", light: "#7B3814FF", hcDark: "#87CEFA", hcLight: "#7B3814FF" }, localize(759, null));

var editorBracketHighlightingForeground4 = registerColor("editorBracketHighlight.foreground4", "#00000000", localize(760, null));

var editorBracketHighlightingForeground5 = registerColor("editorBracketHighlight.foreground5", "#00000000", localize(761, null));

var editorBracketHighlightingForeground6 = registerColor("editorBracketHighlight.foreground6", "#00000000", localize(762, null));

var editorBracketHighlightingUnexpectedBracketForeground = registerColor("editorBracketHighlight.unexpectedBracket.foreground", { dark: new Color(new RGBA(255, 18, 18, 0.8)), light: new Color(new RGBA(255, 18, 18, 0.8)), hcDark: new Color(new RGBA(255, 50, 50, 1)), hcLight: "#B5200D" }, localize(763, null));

var editorBracketPairGuideBackground1 = registerColor("editorBracketPairGuide.background1", "#00000000", localize(773, null));

var editorBracketPairGuideBackground2 = registerColor("editorBracketPairGuide.background2", "#00000000", localize(774, null));

var editorBracketPairGuideBackground3 = registerColor("editorBracketPairGuide.background3", "#00000000", localize(775, null));

var editorBracketPairGuideBackground4 = registerColor("editorBracketPairGuide.background4", "#00000000", localize(776, null));

var editorBracketPairGuideBackground5 = registerColor("editorBracketPairGuide.background5", "#00000000", localize(777, null));

var editorBracketPairGuideBackground6 = registerColor("editorBracketPairGuide.background6", "#00000000", localize(778, null));

var editorBracketPairGuideActiveBackground1 = registerColor("editorBracketPairGuide.activeBackground1", "#00000000", localize(767, null));

var editorBracketPairGuideActiveBackground2 = registerColor("editorBracketPairGuide.activeBackground2", "#00000000", localize(768, null));

var editorBracketPairGuideActiveBackground3 = registerColor("editorBracketPairGuide.activeBackground3", "#00000000", localize(769, null));

var editorBracketPairGuideActiveBackground4 = registerColor("editorBracketPairGuide.activeBackground4", "#00000000", localize(770, null));

var editorBracketPairGuideActiveBackground5 = registerColor("editorBracketPairGuide.activeBackground5", "#00000000", localize(771, null));

var editorBracketPairGuideActiveBackground6 = registerColor("editorBracketPairGuide.activeBackground6", "#00000000", localize(772, null));

var editorUnicodeHighlightBorder = registerColor("editorUnicodeHighlight.border", editorWarningForeground, localize(802, null));

var editorUnicodeHighlightBackground = registerColor("editorUnicodeHighlight.background", editorWarningBackground, localize(801, null));

registerThemingParticipant((theme, collector) => {
  const background = theme.getColor(editorBackground);
  const lineHighlight = theme.getColor(editorLineHighlight);
  const imeBackground = lineHighlight && !lineHighlight.isTransparent() ? lineHighlight : background;
  if (imeBackground) {
    collector.addRule(`.monaco-editor .inputarea.ime-input { background-color: ${imeBackground}; }`);
  }
});
export { editorLineHighlight, editorInactiveLineHighlight, editorLineHighlightBorder, editorRangeHighlight, editorRangeHighlightBorder, editorSymbolHighlight, editorSymbolHighlightBorder, editorCursorForeground, editorCursorBackground, editorMultiCursorPrimaryForeground, editorMultiCursorPrimaryBackground, editorMultiCursorSecondaryForeground, editorMultiCursorSecondaryBackground, editorWhitespaces, editorLineNumbers, deprecatedEditorIndentGuides, deprecatedEditorActiveIndentGuides, editorIndentGuide1, editorIndentGuide2, editorIndentGuide3, editorIndentGuide4, editorIndentGuide5, editorIndentGuide6, editorActiveIndentGuide1, editorActiveIndentGuide2, editorActiveIndentGuide3, editorActiveIndentGuide4, editorActiveIndentGuide5, editorActiveIndentGuide6, deprecatedEditorActiveLineNumber, editorActiveLineNumber, editorDimmedLineNumber, editorRuler, editorCodeLensForeground, editorBracketMatchBackground, editorBracketMatchBorder, editorBracketMatchForeground, editorOverviewRulerBorder, editorOverviewRulerBackground, editorGutter, editorUnnecessaryCodeBorder, editorUnnecessaryCodeOpacity, ghostTextBorder, ghostTextForeground, ghostTextBackground, rulerRangeDefault, overviewRulerRangeHighlight, overviewRulerError, overviewRulerWarning, overviewRulerInfo, editorBracketHighlightingForeground1, editorBracketHighlightingForeground2, editorBracketHighlightingForeground3, editorBracketHighlightingForeground4, editorBracketHighlightingForeground5, editorBracketHighlightingForeground6, editorBracketHighlightingUnexpectedBracketForeground, editorBracketPairGuideBackground1, editorBracketPairGuideBackground2, editorBracketPairGuideBackground3, editorBracketPairGuideBackground4, editorBracketPairGuideBackground5, editorBracketPairGuideBackground6, editorBracketPairGuideActiveBackground1, editorBracketPairGuideActiveBackground2, editorBracketPairGuideActiveBackground3, editorBracketPairGuideActiveBackground4, editorBracketPairGuideActiveBackground5, editorBracketPairGuideActiveBackground6, editorUnicodeHighlightBorder, editorUnicodeHighlightBackground };
