// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/theme.ts
import { asCssVariable, darken, registerColor, transparent } from "./module-0226.mjs";
import { diffInserted, diffInsertedLine, diffRemoved, editorBackground, editorHoverBackground, editorHoverBorder, editorHoverForeground } from "./module-0229.mjs";
import { localize } from "./module-0001.mjs";
import { buttonBackground, buttonForeground } from "./module-0233.mjs";
import { assertNever } from "./module-0009.mjs";
import { observableFromEventOpts } from "./module-0057.mjs";
import { BugIndicatingError } from "./module-0004.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/theme.ts
var originalBackgroundColor = registerColor(
  "inlineEdit.originalBackground",
  transparent(diffRemoved, 0.2),
  localize(1419, null),
  true
);

var modifiedBackgroundColor = registerColor(
  "inlineEdit.modifiedBackground",
  transparent(diffInserted, 0.3),
  localize(1415, null),
  true
);

var originalChangedLineBackgroundColor = registerColor(
  "inlineEdit.originalChangedLineBackground",
  transparent(diffRemoved, 0.8),
  localize(1421, null),
  true
);

var originalChangedTextOverlayColor = registerColor(
  "inlineEdit.originalChangedTextBackground",
  transparent(diffRemoved, 0.8),
  localize(1422, null),
  true
);

var modifiedChangedLineBackgroundColor = registerColor(
  "inlineEdit.modifiedChangedLineBackground",
  {
    light: transparent(diffInsertedLine, 0.7),
    dark: transparent(diffInsertedLine, 0.7),
    hcDark: diffInsertedLine,
    hcLight: diffInsertedLine
  },
  localize(1417, null),
  true
);

var modifiedChangedTextOverlayColor = registerColor(
  "inlineEdit.modifiedChangedTextBackground",
  transparent(diffInserted, 0.7),
  localize(1418, null),
  true
);

var inlineEditIndicatorPrimaryForeground = registerColor(
  "inlineEdit.gutterIndicator.primaryForeground",
  buttonForeground,
  localize(1408, null)
);

var inlineEditIndicatorPrimaryBorder = registerColor(
  "inlineEdit.gutterIndicator.primaryBorder",
  buttonBackground,
  localize(1407, null)
);

var inlineEditIndicatorPrimaryBackground = registerColor(
  "inlineEdit.gutterIndicator.primaryBackground",
  {
    light: transparent(inlineEditIndicatorPrimaryBorder, 0.5),
    dark: transparent(inlineEditIndicatorPrimaryBorder, 0.4),
    hcDark: transparent(inlineEditIndicatorPrimaryBorder, 0.4),
    hcLight: transparent(inlineEditIndicatorPrimaryBorder, 0.5)
  },
  localize(1406, null)
);

var inlineEditIndicatorSecondaryForeground = registerColor(
  "inlineEdit.gutterIndicator.secondaryForeground",
  editorHoverForeground,
  localize(1411, null)
);

var inlineEditIndicatorSecondaryBorder = registerColor(
  "inlineEdit.gutterIndicator.secondaryBorder",
  editorHoverBorder,
  localize(1410, null)
);

var inlineEditIndicatorSecondaryBackground = registerColor(
  "inlineEdit.gutterIndicator.secondaryBackground",
  editorHoverBackground,
  localize(1409, null)
);

var inlineEditIndicatorSuccessfulForeground = registerColor(
  "inlineEdit.gutterIndicator.successfulForeground",
  buttonForeground,
  localize(1414, null)
);

var inlineEditIndicatorSuccessfulBorder = registerColor(
  "inlineEdit.gutterIndicator.successfulBorder",
  buttonBackground,
  localize(1413, null)
);

var inlineEditIndicatorSuccessfulBackground = registerColor(
  "inlineEdit.gutterIndicator.successfulBackground",
  inlineEditIndicatorSuccessfulBorder,
  localize(1412, null)
);

var inlineEditIndicatorBackground = registerColor(
  "inlineEdit.gutterIndicator.background",
  {
    hcDark: transparent("tab.inactiveBackground", 0.5),
    hcLight: transparent("tab.inactiveBackground", 0.5),
    dark: transparent("tab.inactiveBackground", 0.5),
    light: "#5f5f5f18"
  },
  localize(1405, null)
);

var originalBorder = registerColor(
  "inlineEdit.originalBorder",
  {
    light: diffRemoved,
    dark: diffRemoved,
    hcDark: diffRemoved,
    hcLight: diffRemoved
  },
  localize(1420, null)
);

var modifiedBorder = registerColor(
  "inlineEdit.modifiedBorder",
  {
    light: darken(diffInserted, 0.6),
    dark: diffInserted,
    hcDark: diffInserted,
    hcLight: diffInserted
  },
  localize(1416, null)
);

var tabWillAcceptModifiedBorder = registerColor(
  "inlineEdit.tabWillAcceptModifiedBorder",
  {
    light: darken(modifiedBorder, 0),
    dark: darken(modifiedBorder, 0),
    hcDark: darken(modifiedBorder, 0),
    hcLight: darken(modifiedBorder, 0)
  },
  localize(1423, null)
);

var tabWillAcceptOriginalBorder = registerColor(
  "inlineEdit.tabWillAcceptOriginalBorder",
  {
    light: darken(originalBorder, 0),
    dark: darken(originalBorder, 0),
    hcDark: darken(originalBorder, 0),
    hcLight: darken(originalBorder, 0)
  },
  localize(1424, null)
);

function getModifiedBorderColor(tabAction) {
  return tabAction.map((a) => a === "accept" /* Accept */ ? tabWillAcceptModifiedBorder : modifiedBorder);
}

function getOriginalBorderColor(tabAction) {
  return tabAction.map((a) => a === "accept" /* Accept */ ? tabWillAcceptOriginalBorder : originalBorder);
}

function getEditorBlendedColor(colorIdentifier, themeService) {
  let color2;
  if (typeof colorIdentifier === "string") {
    color2 = observeColor(colorIdentifier, themeService);
  } else {
    color2 = colorIdentifier.map((identifier2, reader) => observeColor(identifier2, themeService).read(reader));
  }
  const backgroundColor = observeColor(editorBackground, themeService);
  return color2.map((c, reader) => (
    /** @description makeOpaque */
    c.makeOpaque(backgroundColor.read(reader))
  ));
}

function getEditorBackgroundColor(editorType) {
  let color2;
  switch (editorType) {
    case "textEditor" /* TextEditor */:
      color2 = editorBackground;
      break;
    case "diffEditor" /* DiffEditor */:
      color2 = editorBackground;
      break;
    case "notebook" /* Notebook */:
      color2 = "notebook.cellEditorBackground";
      break;
    default:
      assertNever(editorType, "Not supported editor type yet");
  }
  return asCssVariable(color2);
}

function observeColor(colorIdentifier, themeService) {
  return observableFromEventOpts(
    {
      owner: { observeColor: colorIdentifier },
      equalsFn: (a, b) => a.equals(b),
      debugName: () => `observeColor(${colorIdentifier})`
    },
    themeService.onDidColorThemeChange,
    () => {
      const color2 = themeService.getColorTheme().getColor(colorIdentifier);
      if (!color2) {
        throw new BugIndicatingError(`Missing color: ${colorIdentifier}`);
      }
      return color2;
    }
  );
}

var INLINE_EDITS_BORDER_RADIUS = 3;
export { getModifiedBorderColor, getOriginalBorderColor, getEditorBlendedColor, getEditorBackgroundColor, observeColor, originalBackgroundColor, modifiedBackgroundColor, originalChangedLineBackgroundColor, originalChangedTextOverlayColor, modifiedChangedLineBackgroundColor, modifiedChangedTextOverlayColor, inlineEditIndicatorPrimaryForeground, inlineEditIndicatorPrimaryBorder, inlineEditIndicatorPrimaryBackground, inlineEditIndicatorSecondaryForeground, inlineEditIndicatorSecondaryBorder, inlineEditIndicatorSecondaryBackground, inlineEditIndicatorSuccessfulForeground, inlineEditIndicatorSuccessfulBorder, inlineEditIndicatorSuccessfulBackground, inlineEditIndicatorBackground, originalBorder, modifiedBorder, tabWillAcceptModifiedBorder, tabWillAcceptOriginalBorder, INLINE_EDITS_BORDER_RADIUS };
