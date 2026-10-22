// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/common/quickDiff.ts
import { createDecorator } from "./module-0077.mjs";
import { darken, lighten, opaque, registerColor, transparent } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { editorBackground, editorErrorForeground, editorForeground } from "./module-0229.mjs";
import { Color } from "./module-0197.mjs";
import { listInactiveSelectionBackground } from "./module-0232.mjs";


// src/vs/workbench/contrib/scm/common/quickDiff.ts
var IQuickDiffService = createDecorator("quickDiff");

var editorGutterModifiedBackground = registerColor("editorGutter.modifiedBackground", {
  dark: "#1B81A8",
  light: "#2090D3",
  hcDark: "#1B81A8",
  hcLight: "#2090D3"
}, localize(18945, null));

registerColor(
  "editorGutter.modifiedSecondaryBackground",
  { dark: darken(editorGutterModifiedBackground, 0.5), light: lighten(editorGutterModifiedBackground, 0.7), hcDark: "#1B81A8", hcLight: "#2090D3" },
  localize(18946, null)
);

var editorGutterAddedBackground = registerColor("editorGutter.addedBackground", {
  dark: "#487E02",
  light: "#48985D",
  hcDark: "#487E02",
  hcLight: "#48985D"
}, localize(18939, null));

registerColor(
  "editorGutter.addedSecondaryBackground",
  { dark: darken(editorGutterAddedBackground, 0.5), light: lighten(editorGutterAddedBackground, 0.7), hcDark: "#487E02", hcLight: "#48985D" },
  localize(18940, null)
);

var editorGutterDeletedBackground = registerColor(
  "editorGutter.deletedBackground",
  editorErrorForeground,
  localize(18941, null)
);

registerColor(
  "editorGutter.deletedSecondaryBackground",
  { dark: darken(editorGutterDeletedBackground, 0.4), light: lighten(editorGutterDeletedBackground, 0.3), hcDark: "#F48771", hcLight: "#B5200D" },
  localize(18942, null)
);

var minimapGutterModifiedBackground = registerColor(
  "minimapGutter.modifiedBackground",
  editorGutterModifiedBackground,
  localize(18949, null)
);

var minimapGutterAddedBackground = registerColor(
  "minimapGutter.addedBackground",
  editorGutterAddedBackground,
  localize(18947, null)
);

var minimapGutterDeletedBackground = registerColor(
  "minimapGutter.deletedBackground",
  editorGutterDeletedBackground,
  localize(18948, null)
);

var overviewRulerModifiedForeground = registerColor(
  "editorOverviewRuler.modifiedForeground",
  transparent(editorGutterModifiedBackground, 0.6),
  localize(18952, null)
);

var overviewRulerAddedForeground = registerColor(
  "editorOverviewRuler.addedForeground",
  transparent(editorGutterAddedBackground, 0.6),
  localize(18950, null)
);

var overviewRulerDeletedForeground = registerColor(
  "editorOverviewRuler.deletedForeground",
  transparent(editorGutterDeletedBackground, 0.6),
  localize(18951, null)
);

var editorGutterItemGlyphForeground = registerColor(
  "editorGutter.itemGlyphForeground",
  { dark: editorForeground, light: editorForeground, hcDark: Color.black, hcLight: Color.white },
  localize(18944, null)
);

var editorGutterItemBackground = registerColor("editorGutter.itemBackground", { dark: opaque(listInactiveSelectionBackground, editorBackground), light: darken(opaque(listInactiveSelectionBackground, editorBackground), 0.05), hcDark: Color.white, hcLight: Color.black }, localize(18943, null));

function getChangeType(change) {
  if (change.originalEndLineNumber === 0) {
    return 1 /* Add */;
  } else if (change.modifiedEndLineNumber === 0) {
    return 2 /* Delete */;
  } else {
    return 0 /* Modify */;
  }
}

function getChangeTypeColor(theme, changeType) {
  switch (changeType) {
    case 0 /* Modify */:
      return theme.getColor(editorGutterModifiedBackground);
    case 1 /* Add */:
      return theme.getColor(editorGutterAddedBackground);
    case 2 /* Delete */:
      return theme.getColor(editorGutterDeletedBackground);
  }
}

function compareChanges(a, b) {
  let result = a.modifiedStartLineNumber - b.modifiedStartLineNumber;
  if (result !== 0) {
    return result;
  }
  result = a.modifiedEndLineNumber - b.modifiedEndLineNumber;
  if (result !== 0) {
    return result;
  }
  result = a.originalStartLineNumber - b.originalStartLineNumber;
  if (result !== 0) {
    return result;
  }
  return a.originalEndLineNumber - b.originalEndLineNumber;
}

function getChangeHeight(change) {
  const modified = change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1;
  const original = change.originalEndLineNumber - change.originalStartLineNumber + 1;
  if (change.originalEndLineNumber === 0) {
    return modified;
  } else if (change.modifiedEndLineNumber === 0) {
    return original;
  } else {
    return modified + original;
  }
}

function getModifiedEndLineNumber(change) {
  if (change.modifiedEndLineNumber === 0) {
    return change.modifiedStartLineNumber === 0 ? 1 : change.modifiedStartLineNumber;
  } else {
    return change.modifiedEndLineNumber;
  }
}

function lineIntersectsChange(lineNumber, change) {
  if (lineNumber === 1 && change.modifiedStartLineNumber === 0 && change.modifiedEndLineNumber === 0) {
    return true;
  }
  return lineNumber >= change.modifiedStartLineNumber && lineNumber <= (change.modifiedEndLineNumber || change.modifiedStartLineNumber);
}
export { getChangeType, getChangeTypeColor, compareChanges, getChangeHeight, getModifiedEndLineNumber, lineIntersectsChange, IQuickDiffService, editorGutterModifiedBackground, editorGutterAddedBackground, editorGutterDeletedBackground, minimapGutterModifiedBackground, minimapGutterAddedBackground, minimapGutterDeletedBackground, overviewRulerModifiedForeground, overviewRulerAddedForeground, overviewRulerDeletedForeground, editorGutterItemGlyphForeground, editorGutterItemBackground };
