// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/theme/common/colors/quickpickColors.ts
import { oneOf, registerColor } from "./module-0226.mjs";
import { editorWidgetBackground, editorWidgetForeground } from "./module-0229.mjs";
import { localize } from "./module-0001.mjs";
import { Color, RGBA } from "./module-0197.mjs";
import { listActiveSelectionBackground, listActiveSelectionForeground, listActiveSelectionIconForeground, listFocusHighlightForeground } from "./module-0232.mjs";


// src/vs/platform/theme/common/colors/quickpickColors.ts
var quickInputBackground = registerColor(
  "quickInput.background",
  editorWidgetBackground,
  localize(3545, null)
);

var quickInputForeground = registerColor(
  "quickInput.foreground",
  editorWidgetForeground,
  localize(3546, null)
);

var quickInputTitleBackground = registerColor(
  "quickInputTitle.background",
  { dark: new Color(new RGBA(255, 255, 255, 0.105)), light: new Color(new RGBA(0, 0, 0, 0.06)), hcDark: "#000000", hcLight: Color.white },
  localize(3549, null)
);

var pickerGroupForeground = registerColor(
  "pickerGroup.foreground",
  { dark: "#3794FF", light: "#0066BF", hcDark: Color.white, hcLight: "#0F4A85" },
  localize(3548, null)
);

var pickerGroupBorder = registerColor(
  "pickerGroup.border",
  { dark: "#3F3F46", light: "#CCCEDB", hcDark: Color.white, hcLight: "#0F4A85" },
  localize(3547, null)
);

var _deprecatedQuickInputListFocusBackground = registerColor(
  "quickInput.list.focusBackground",
  null,
  "",
  void 0,
  localize(3550, null)
);

var quickInputListFocusForeground = registerColor(
  "quickInputList.focusForeground",
  listActiveSelectionForeground,
  localize(3552, null)
);

var quickInputListFocusIconForeground = registerColor(
  "quickInputList.focusIconForeground",
  listActiveSelectionIconForeground,
  localize(3554, null)
);

var quickInputListFocusBackground = registerColor(
  "quickInputList.focusBackground",
  { dark: oneOf(_deprecatedQuickInputListFocusBackground, listActiveSelectionBackground), light: oneOf(_deprecatedQuickInputListFocusBackground, listActiveSelectionBackground), hcDark: null, hcLight: null },
  localize(3551, null)
);

var quickInputListFocusHighlightForeground = registerColor(
  "quickInputList.focusHighlightForeground",
  listFocusHighlightForeground,
  localize(3553, null)
);
export { quickInputBackground, quickInputForeground, quickInputTitleBackground, pickerGroupForeground, pickerGroupBorder, _deprecatedQuickInputListFocusBackground, quickInputListFocusForeground, quickInputListFocusIconForeground, quickInputListFocusBackground, quickInputListFocusHighlightForeground };
