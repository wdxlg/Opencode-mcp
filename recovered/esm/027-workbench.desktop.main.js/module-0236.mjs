// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/theme/common/colors/searchColors.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { foreground } from "./module-0227.mjs";
import { localize } from "./module-0001.mjs";
import { editorFindMatchHighlight, editorFindMatchHighlightBorder } from "./module-0229.mjs";


// src/vs/platform/theme/common/colors/searchColors.ts
var searchResultsInfoForeground = registerColor(
  "search.resultsInfoForeground",
  { light: foreground, dark: transparent(foreground, 0.65), hcDark: foreground, hcLight: foreground },
  localize(3555, null)
);

var searchEditorFindMatch = registerColor(
  "searchEditor.findMatchBackground",
  { light: transparent(editorFindMatchHighlight, 0.66), dark: transparent(editorFindMatchHighlight, 0.66), hcDark: editorFindMatchHighlight, hcLight: editorFindMatchHighlight },
  localize(3557, null)
);

var searchEditorFindMatchBorder = registerColor(
  "searchEditor.findMatchBorder",
  { light: transparent(editorFindMatchHighlightBorder, 0.66), dark: transparent(editorFindMatchHighlightBorder, 0.66), hcDark: editorFindMatchHighlightBorder, hcLight: editorFindMatchHighlightBorder },
  localize(3556, null)
);
export { searchResultsInfoForeground, searchEditorFindMatch, searchEditorFindMatchBorder };
