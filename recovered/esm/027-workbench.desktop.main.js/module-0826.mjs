// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/wordHighlighter/browser/highlightDecorations.ts
import { registerColor } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { activeContrastBorder } from "./module-0227.mjs";
import { editorSelectionHighlight, overviewRulerSelectionHighlightForeground } from "./module-0229.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { registerThemingParticipant, themeColorFromId2 } from "./module-0287.mjs";
import { minimapSelectionOccurrenceHighlight } from "./module-0230.mjs";


// src/vs/editor/contrib/wordHighlighter/browser/highlightDecorations.ts
var wordHighlightBackground = registerColor("editor.wordHighlightBackground", { dark: "#575757B8", light: "#57575740", hcDark: null, hcLight: null }, localize(1752, null), true);

registerColor("editor.wordHighlightStrongBackground", { dark: "#004972B8", light: "#0e639c40", hcDark: null, hcLight: null }, localize(1754, null), true);

registerColor("editor.wordHighlightTextBackground", wordHighlightBackground, localize(1756, null), true);

var wordHighlightBorder = registerColor("editor.wordHighlightBorder", { light: null, dark: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder }, localize(1753, null));

registerColor("editor.wordHighlightStrongBorder", { light: null, dark: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder }, localize(1755, null));

registerColor("editor.wordHighlightTextBorder", wordHighlightBorder, localize(1757, null));

var overviewRulerWordHighlightForeground = registerColor("editorOverviewRuler.wordHighlightForeground", "#A0A0A0CC", localize(1749, null), true);

var overviewRulerWordHighlightStrongForeground = registerColor("editorOverviewRuler.wordHighlightStrongForeground", "#C0A0C0CC", localize(1750, null), true);

var overviewRulerWordHighlightTextForeground = registerColor("editorOverviewRuler.wordHighlightTextForeground", overviewRulerSelectionHighlightForeground, localize(1751, null), true);

var _WRITE_OPTIONS = ModelDecorationOptions.register({
  description: "word-highlight-strong",
  stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
  className: "wordHighlightStrong",
  overviewRuler: {
    color: themeColorFromId2(overviewRulerWordHighlightStrongForeground),
    position: 2 /* Center */
  },
  minimap: {
    color: themeColorFromId2(minimapSelectionOccurrenceHighlight),
    position: 1 /* Inline */
  }
});

var _TEXT_OPTIONS = ModelDecorationOptions.register({
  description: "word-highlight-text",
  stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
  className: "wordHighlightText",
  overviewRuler: {
    color: themeColorFromId2(overviewRulerWordHighlightTextForeground),
    position: 2 /* Center */
  },
  minimap: {
    color: themeColorFromId2(minimapSelectionOccurrenceHighlight),
    position: 1 /* Inline */
  }
});

var _SELECTION_HIGHLIGHT_OPTIONS = ModelDecorationOptions.register({
  description: "selection-highlight-overview",
  stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
  className: "selectionHighlight",
  overviewRuler: {
    color: themeColorFromId2(overviewRulerSelectionHighlightForeground),
    position: 2 /* Center */
  },
  minimap: {
    color: themeColorFromId2(minimapSelectionOccurrenceHighlight),
    position: 1 /* Inline */
  }
});

var _SELECTION_HIGHLIGHT_OPTIONS_NO_OVERVIEW = ModelDecorationOptions.register({
  description: "selection-highlight",
  stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
  className: "selectionHighlight"
});

var _REGULAR_OPTIONS = ModelDecorationOptions.register({
  description: "word-highlight",
  stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
  className: "wordHighlight",
  overviewRuler: {
    color: themeColorFromId2(overviewRulerWordHighlightForeground),
    position: 2 /* Center */
  },
  minimap: {
    color: themeColorFromId2(minimapSelectionOccurrenceHighlight),
    position: 1 /* Inline */
  }
});

function getHighlightDecorationOptions(kind) {
  if (kind === 2 /* Write */) {
    return _WRITE_OPTIONS;
  } else if (kind === 0 /* Text */) {
    return _TEXT_OPTIONS;
  } else {
    return _REGULAR_OPTIONS;
  }
}

function getSelectionHighlightDecorationOptions(hasSemanticHighlights) {
  return hasSemanticHighlights ? _SELECTION_HIGHLIGHT_OPTIONS_NO_OVERVIEW : _SELECTION_HIGHLIGHT_OPTIONS;
}

registerThemingParticipant((theme, collector) => {
  const selectionHighlight = theme.getColor(editorSelectionHighlight);
  if (selectionHighlight) {
    collector.addRule(`.monaco-editor .selectionHighlight { background-color: ${selectionHighlight.transparent(0.5)}; }`);
  }
});
export { getHighlightDecorationOptions, getSelectionHighlightDecorationOptions, wordHighlightBackground, wordHighlightBorder, overviewRulerWordHighlightForeground, overviewRulerWordHighlightStrongForeground, overviewRulerWordHighlightTextForeground, _WRITE_OPTIONS, _TEXT_OPTIONS, _SELECTION_HIGHLIGHT_OPTIONS, _SELECTION_HIGHLIGHT_OPTIONS_NO_OVERVIEW, _REGULAR_OPTIONS };
