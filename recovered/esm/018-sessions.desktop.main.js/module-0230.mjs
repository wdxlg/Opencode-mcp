// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/theme/common/colors/minimapColors.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { editorFindMatchHighlight, editorInfoBorder, editorInfoForeground, editorSelectionBackground, editorSelectionHighlight, editorWarningBorder, editorWarningForeground } from "./module-0229.mjs";
import { localize } from "./module-0001.mjs";
import { Color, RGBA } from "./module-0197.mjs";
import { scrollbarSliderActiveBackground, scrollbarSliderBackground, scrollbarSliderHoverBackground } from "./module-0228.mjs";


// src/vs/platform/theme/common/colors/minimapColors.ts
var minimapFindMatch = registerColor(
  "minimap.findMatchHighlight",
  editorFindMatchHighlight,
  localize(3520, null),
  true
);

var minimapSelectionOccurrenceHighlight = registerColor(
  "minimap.selectionOccurrenceHighlight",
  editorSelectionHighlight,
  localize(3524, null),
  true
);

var minimapSelection = registerColor(
  "minimap.selectionHighlight",
  editorSelectionBackground,
  localize(3523, null),
  true
);

var minimapInfo = registerColor(
  "minimap.infoHighlight",
  { dark: editorInfoForeground, light: editorInfoForeground, hcDark: editorInfoBorder, hcLight: editorInfoBorder },
  localize(3522, null)
);

var minimapWarning = registerColor(
  "minimap.warningHighlight",
  { dark: editorWarningForeground, light: editorWarningForeground, hcDark: editorWarningBorder, hcLight: editorWarningBorder },
  localize(3528, null)
);

var minimapError = registerColor(
  "minimap.errorHighlight",
  { dark: new Color(new RGBA(255, 18, 18, 0.7)), light: new Color(new RGBA(255, 18, 18, 0.7)), hcDark: new Color(new RGBA(255, 50, 50, 1)), hcLight: "#B5200D" },
  localize(3519, null)
);

var minimapBackground = registerColor(
  "minimap.background",
  null,
  localize(3518, null)
);

var minimapForegroundOpacity = registerColor(
  "minimap.foregroundOpacity",
  Color.fromHex("#000f"),
  localize(3521, null)
);

var minimapSliderBackground = registerColor(
  "minimapSlider.background",
  transparent(scrollbarSliderBackground, 0.5),
  localize(3526, null)
);

var minimapSliderHoverBackground = registerColor(
  "minimapSlider.hoverBackground",
  transparent(scrollbarSliderHoverBackground, 0.5),
  localize(3527, null)
);

var minimapSliderActiveBackground = registerColor(
  "minimapSlider.activeBackground",
  transparent(scrollbarSliderActiveBackground, 0.5),
  localize(3525, null)
);
export { minimapFindMatch, minimapSelectionOccurrenceHighlight, minimapSelection, minimapInfo, minimapWarning, minimapError, minimapBackground, minimapForegroundOpacity, minimapSliderBackground, minimapSliderHoverBackground, minimapSliderActiveBackground };
