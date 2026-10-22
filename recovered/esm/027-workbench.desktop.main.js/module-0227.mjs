// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/theme/common/colors/baseColors.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { Color } from "./module-0197.mjs";


// src/vs/platform/theme/common/colors/baseColors.ts
var foreground = registerColor(
  "foreground",
  { dark: "#CCCCCC", light: "#616161", hcDark: "#FFFFFF", hcLight: "#292929" },
  localize(3312, null)
);

var strongForeground = registerColor(
  "strongForeground",
  { dark: "#FFFFFF", light: "#000000", hcDark: "#FFFFFF", hcLight: "#000000" },
  localize(3315, null)
);

var disabledForeground = registerColor(
  "disabledForeground",
  { dark: "#CCCCCC80", light: "#61616180", hcDark: "#A5A5A5", hcLight: "#7F7F7F" },
  localize(3309, null)
);

var errorForeground = registerColor(
  "errorForeground",
  { dark: "#F48771", light: "#A1260D", hcDark: "#F48771", hcLight: "#B5200D" },
  localize(3310, null)
);

var descriptionForeground = registerColor(
  "descriptionForeground",
  { light: "#717171", dark: transparent(foreground, 0.7), hcDark: transparent(foreground, 0.7), hcLight: transparent(foreground, 0.7) },
  localize(3308, null)
);

var iconForeground = registerColor(
  "icon.foreground",
  { dark: "#C5C5C5", light: "#424242", hcDark: "#FFFFFF", hcLight: "#292929" },
  localize(3313, null)
);

var focusBorder = registerColor(
  "focusBorder",
  { dark: "#007FD4", light: "#0090F1", hcDark: "#F38518", hcLight: "#006BBD" },
  localize(3311, null)
);

var contrastBorder = registerColor(
  "contrastBorder",
  { light: null, dark: null, hcDark: "#6FC3DF", hcLight: "#0F4A85" },
  localize(3307, null)
);

var activeContrastBorder = registerColor(
  "contrastActiveBorder",
  { light: null, dark: null, hcDark: focusBorder, hcLight: focusBorder },
  localize(3306, null)
);

var selectionBackground = registerColor(
  "selection.background",
  null,
  localize(3314, null)
);

var textLinkForeground = registerColor(
  "textLink.foreground",
  { light: "#006AB1", dark: "#3794FF", hcDark: "#21A6FF", hcLight: "#0F4A85" },
  localize(3320, null)
);

var textLinkActiveForeground = registerColor(
  "textLink.activeForeground",
  { light: "#006AB1", dark: "#3794FF", hcDark: "#21A6FF", hcLight: "#0F4A85" },
  localize(3319, null)
);

var textSeparatorForeground = registerColor(
  "textSeparator.foreground",
  { light: "#0000002e", dark: "#ffffff2e", hcDark: Color.black, hcLight: "#292929" },
  localize(3324, null)
);

var textPreformatForeground = registerColor(
  "textPreformat.foreground",
  { light: "#A31515", dark: "#D7BA7D", hcDark: "#FFFFFF", hcLight: "#FFFFFF" },
  localize(3323, null)
);

var textPreformatBackground = registerColor(
  "textPreformat.background",
  { light: "#0000001A", dark: "#FFFFFF1A", hcDark: null, hcLight: "#09345f" },
  localize(3321, null)
);

var textPreformatBorder = registerColor(
  "textPreformat.border",
  { light: null, dark: null, hcDark: contrastBorder, hcLight: null },
  localize(3322, null)
);

var textBlockQuoteBackground = registerColor(
  "textBlockQuote.background",
  { light: "#f2f2f2", dark: "#222222", hcDark: null, hcLight: "#F2F2F2" },
  localize(3316, null)
);

var textBlockQuoteBorder = registerColor(
  "textBlockQuote.border",
  { light: "#007acc80", dark: "#007acc80", hcDark: Color.white, hcLight: "#292929" },
  localize(3317, null)
);

var textCodeBlockBackground = registerColor(
  "textCodeBlock.background",
  { light: "#dcdcdc66", dark: "#0a0a0a66", hcDark: Color.black, hcLight: "#F2F2F2" },
  localize(3318, null)
);
export { foreground, strongForeground, disabledForeground, errorForeground, descriptionForeground, iconForeground, focusBorder, contrastBorder, activeContrastBorder, selectionBackground, textLinkForeground, textLinkActiveForeground, textSeparatorForeground, textPreformatForeground, textPreformatBackground, textPreformatBorder, textBlockQuoteBackground, textBlockQuoteBorder, textCodeBlockBackground };
